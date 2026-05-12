<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-4 sm:p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                    <h2 class="text-base sm:text-lg font-bold">สรุป{{ selectedTermLabel }}</h2>
                    <p class="text-xs sm:text-sm text-base-content/70">
                        ช่วง {{ formatDateThai(termStart) }} - {{ formatDateThai(termEnd) }} (ไม่นับเสาร์-อาทิตย์)
                    </p>
                </div>
                <div v-if="loading" class="loading loading-spinner loading-sm text-primary"></div>
            </div>

            <div v-if="errorMessage" class="alert alert-warning text-sm">
                {{ errorMessage }}
            </div>

            <div v-else-if="!termStart || !termEnd" class="text-sm text-base-content/60">
                ไม่พบข้อมูล{{ selectedTermLabel }}ของปีการศึกษานี้
            </div>

            <div v-else class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="rounded-xl bg-primary/10 border border-primary/30 p-4">
                        <p class="text-xs text-base-content/70">วันเรียนทั้งหมด</p>
                        <p class="text-2xl font-extrabold text-primary">{{ totalWorkdays }}</p>
                        <p class="text-xs text-base-content/60">วัน (จันทร์-ศุกร์)</p>
                    </div>

                    <div class="rounded-xl bg-warning/10 border border-warning/40 p-4">
                        <p class="text-xs text-base-content/70">วันหยุดในช่วงเทอม</p>
                        <p class="text-2xl font-extrabold text-warning">{{ holidayWorkdays }}</p>
                        <p class="text-xs text-base-content/60">วัน (เฉพาะจันทร์-ศุกร์)</p>
                    </div>

                    <div class="rounded-xl bg-success/10 border border-success/40 p-4">
                        <p class="text-xs text-base-content/70">วันคงเหลือ</p>
                        <p class="text-2xl font-extrabold text-success">{{ remainingDays }}</p>
                        <p class="text-xs text-base-content/60">วันเรียนสุทธิ</p>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1 text-xs sm:text-sm">
                        <span class="text-base-content/70">สัดส่วนวันหยุดต่อวันเรียน</span>
                        <span class="font-semibold">{{ holidayPercent }}%</span>
                    </div>
                    <progress class="progress progress-warning w-full" :value="holidayWorkdays"
                        :max="maxProgress"></progress>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { AcademicCalendarService } from '../../api/academiccalendar'
import holidaysApi from '../../api/holidays'

const props = defineProps({
    year: {
        type: [Number, String],
        required: true
    },
    selectedTermKey: {
        type: String,
        default: 'term1'
    },
    refreshKey: {
        type: Number,
        default: 0
    }
})

const loading = ref(false)
const errorMessage = ref('')
const termStart = ref('')
const termEnd = ref('')
const totalWorkdays = ref(0)
const holidayWorkdays = ref(0)
const selectedTermName = ref('')

const selectedTermLabel = computed(() => {
    if (selectedTermName.value) return selectedTermName.value
    return props.selectedTermKey === 'term2' ? 'เทอม 2' : 'เทอม 1'
})
const remainingDays = computed(() => Math.max(totalWorkdays.value - holidayWorkdays.value, 0))
const maxProgress = computed(() => Math.max(totalWorkdays.value, 1))
const holidayPercent = computed(() => {
    if (totalWorkdays.value <= 0) return 0
    return Math.round((holidayWorkdays.value / totalWorkdays.value) * 100)
})

function normalizeDateInput(dateStr) {
    if (!dateStr) return null

    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day)
    }

    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/').map(Number)
        const gregorianYear = year > 2400 ? year - 543 : year
        return new Date(gregorianYear, month - 1, day)
    }

    const parsed = new Date(dateStr)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toIsoDate(dateObj) {
    const yyyy = dateObj.getFullYear()
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dd = String(dateObj.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

function isWeekday(dateObj) {
    const day = dateObj.getDay()
    return day >= 1 && day <= 5
}

function countWeekdays(startDate, endDate) {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

    let count = 0
    const current = new Date(start)
    while (current <= end) {
        if (isWeekday(current)) count += 1
        current.setDate(current.getDate() + 1)
    }
    return count
}

function formatDateThai(dateStr) {
    if (!dateStr) return '-'
    const dateObj = normalizeDateInput(dateStr)
    if (!dateObj) return '-'
    return dateObj.toLocaleDateString('th-TH-u-ca-buddhist', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

function pickTerm(terms, termKey) {
    if (!Array.isArray(terms) || terms.length === 0) return null

    const targetDigit = termKey === 'term2' ? '2' : '1'
    const exactTerm = terms.find(t => {
        const termName = String(t?.term || '').toLowerCase()
        return termName.includes(targetDigit)
    })

    if (exactTerm) return exactTerm

    if (termKey === 'term2') {
        return terms[1] || terms[0]
    }

    return terms[0]
}

async function fetchSummary() {
    loading.value = true
    errorMessage.value = ''
    selectedTermName.value = ''
    termStart.value = ''
    termEnd.value = ''
    totalWorkdays.value = 0
    holidayWorkdays.value = 0

    try {
        const service = new AcademicCalendarService()
        const academicRes = await service.getAcademicCalendarByYear(props.year)
        const terms = academicRes?.data?.terms ?? []
        const selectedTerm = pickTerm(terms, props.selectedTermKey)
        selectedTermName.value = String(selectedTerm?.term || '').trim()

        if (!selectedTerm?.start_date || !selectedTerm?.end_date) {
            return
        }

        const startObj = normalizeDateInput(selectedTerm.start_date)
        const endObj = normalizeDateInput(selectedTerm.end_date)

        if (!startObj || !endObj) {
            errorMessage.value = 'รูปแบบวันที่ของเทอมไม่ถูกต้อง'
            return
        }

        termStart.value = toIsoDate(startObj)
        termEnd.value = toIsoDate(endObj)
        totalWorkdays.value = countWeekdays(startObj, endObj)

        const holidayRes = await holidaysApi.getHolidaysByRange(termStart.value, termEnd.value)
        const holidayItems = Array.isArray(holidayRes?.data) ? holidayRes.data : Array.isArray(holidayRes) ? holidayRes : []

        const uniqueHolidayWeekdays = new Set()
        holidayItems.forEach((item) => {
            const rawDate = item?.date
            const holidayDate = normalizeDateInput(rawDate)
            if (!holidayDate) return
            if (!isWeekday(holidayDate)) return
            uniqueHolidayWeekdays.add(toIsoDate(holidayDate))
        })

        holidayWorkdays.value = uniqueHolidayWeekdays.size
    } catch (error) {
        errorMessage.value = `ไม่สามารถโหลดสรุป${selectedTermLabel.value}ได้`
    } finally {
        loading.value = false
    }
}

watch(() => props.year, fetchSummary)
watch(() => props.selectedTermKey, fetchSummary)
watch(() => props.refreshKey, fetchSummary)
onMounted(fetchSummary)
</script>
