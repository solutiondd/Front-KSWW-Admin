<template>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-4 max-[944px]:pt-14">
        <h1 class="text-xl sm:text-2xl font-bold text-white whitespace-nowrap mb-2 sm:mb-0">จัดการวันหยุด</h1>
        <div class="flex gap-2">
            <ImportHolidays v-if="auth.user?.role !== 'viewer'" @imported="onImportHolidays" class="" />
            <button v-if="auth.user?.role !== 'viewer'" class="btn btn-primary btn-sm whitespace-nowrap shrink-0"
                @click="showCreate = true">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                เพิ่มวันหยุด</button>
        </div>
    </div>
    <div class="flex gap-2 items-center justify-end mb-4">
        <select v-model="filterType"
            class="select select-bordered select-sm min-w-[80px] max-w-[120px] text-xs sm:text-base">
            <option value="month">เดือน</option>
            <option value="day">วัน</option>
            <option value="year">ปี</option>
        </select>
        <input v-if="filterType === 'day'" type="date" v-model="dateInput"
            class="input input-bordered input-sm text-xs sm:text-base w-auto" />
        <input v-if="filterType === 'month'" type="month" v-model="monthInput"
            class="input input-bordered input-sm text-xs sm:text-base w-auto" />
        <input v-if="filterType === 'year'" type="number" min="2443" max="2643" v-model="yearInputBE"
            class="input input-bordered input-sm w-auto text-xs sm:text-base" />
    </div>

    <HolidaysTable :holidays="holidays.data || []" @delete="onDeleteHoliday" />

    <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-2xl relative animate-fade-in">
            <button class="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                @click="showCreate = false">✕</button>
            <Create @saved="showCreate = false; fetchHolidays()" />
        </div>
    </div>
    <DeleteDialog v-if="showDelete" :holiday="deletingHoliday" @confirm="handleDeleteConfirm"
        @cancel="handleDeleteCancel" />
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import Create from '../../components/Holidays/Create.vue'
import HolidaysTable from '../../components/Holidays/Table.vue'
import DeleteDialog from '../../components/Holidays/Delete.vue'
import ImportHolidays from '../../components/Holidays/Import.vue'
import holidaysApi from '../../api/holidays'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const showCreate = ref(false)
const holidays = ref([])
const showDelete = ref(false)
const deletingHoliday = ref(null)

function onDeleteHoliday(item) {
    deletingHoliday.value = item
    showDelete.value = true
}

async function handleDeleteConfirm() {
    if (!deletingHoliday.value) return
    try {
        await holidaysApi.deleteHoliday(deletingHoliday.value._id)
        showDelete.value = false
        deletingHoliday.value = null
        await fetchHolidays()
        Swal.fire({
            icon: 'success',
            title: 'ลบวันหยุดสำเร็จ',
            showConfirmButton: false,
            timer: 1500
        })
    } catch (e) {
        Swal.fire({
            icon: 'error',
            title: 'ลบวันหยุดไม่สำเร็จ',
            text: e?.response?.data?.message || 'เกิดข้อผิดพลาด',
            showConfirmButton: true
        })
    }
}

function handleDeleteCancel() {
    showDelete.value = false
    deletingHoliday.value = null
}

const today = new Date()
const yyyy = today.getFullYear()
const mm = String(today.getMonth() + 1).padStart(2, '0')
const dd = String(today.getDate()).padStart(2, '0')

const filterType = ref('year')
const dateInput = ref(`${yyyy}-${mm}-${dd}`)
const monthInput = ref(`${yyyy}-${mm}`)
const yearInput = ref(yyyy)
const yearInputBE = computed({
    get: () => yearInput.value + 543,
    set: (value) => {
        const parsed = Number(value)
        if (!Number.isNaN(parsed) && parsed > 0) {
            yearInput.value = parsed > 2400 ? parsed - 543 : parsed
        }
    }
})

function getRange() {
    if (filterType.value === 'day') {
        return { start: dateInput.value, end: dateInput.value }
    }
    if (filterType.value === 'month') {
        const [y, m] = monthInput.value.split('-')
        const firstDay = '01'
        const lastDay = String(new Date(Number(y), Number(m), 0).getDate()).padStart(2, '0')
        return { start: `${y}-${m}-${firstDay}`, end: `${y}-${m}-${lastDay}` }
    }
    if (filterType.value === 'year') {
        const y = yearInput.value
        return { start: `${y}-01-01`, end: `${y}-12-31` }
    }
    return { start: dateInput.value, end: dateInput.value }
}

async function fetchHolidays() {
    const { start, end } = getRange()
    try {
        holidays.value = await holidaysApi.getHolidaysByRange(start, end)
    } catch (e) {
        // handle error
    }
}

function onImportHolidays(importedHolidays) {
    if (!Array.isArray(importedHolidays) || importedHolidays.length === 0) return
    const save = async () => {
        try {
            let all = [...importedHolidays]
            let successCount = 0
            while (all.length > 0) {
                const batch = all.splice(0, 100)
                await holidaysApi.createHoliday(batch)
                successCount += batch.length
            }
            await fetchHolidays()
            Swal.fire({
                icon: 'success',
                title: `นำเข้าวันหยุดสำเร็จ ${successCount} รายการ`,
                showConfirmButton: false,
                timer: 1500
            })
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'นำเข้าวันหยุดไม่สำเร็จ',
                text: e?.response?.data?.message || 'เกิดข้อผิดพลาด',
                showConfirmButton: true
            })
        }
    }
    save()
}

watch([filterType, dateInput, monthInput, yearInput], fetchHolidays)
onMounted(fetchHolidays)
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-fade-in {
    animation: fade-in 0.2s ease;
}
</style>