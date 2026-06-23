<template>
    <div v-if="visible" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-base-100 rounded-lg shadow-lg w-full max-w-2xl p-6 relative m-4">
            <button class="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost" @click="$emit('close')">
                ✕
            </button>
            <div class="flex items-center gap-4 mb-4">
                <div class="avatar">
                    <div class="w-16 h-16 rounded-full">
                        <img v-if="student.picture" :src="getPictureUrl(student.picture)" :alt="student.name"
                            class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            @click="openPictureModal(student.picture)" />
                        <div v-else
                            class="w-full h-full bg-secondary text-secondary-content flex items-center justify-center">
                            <span class="text-lg font-semibold">{{ getInitials(student.name) }}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="font-bold text-lg">{{ student.name }}</div>
                    <div class="text-sm text-base-content/70">รหัส: {{ studentCode }}</div>
                    <div class="text-sm">ระดับชั้น: {{ mapGradeDisplay(student.grade) }} ห้อง {{ studentRoom }}</div>
                    <div v-if="studentGuardianPhone" class="text-sm text-base-content/70">
                        เบอร์ผู้ปกครอง: {{ studentGuardianPhone }}
                    </div>
                    <div v-if="student?.rfid !== undefined && student?.rfid !== null && String(student.rfid).trim() !== ''"
                        class="text-sm text-base-content/70">rfid: {{ student.rfid }}</div>
                    <div class="mt-1">
                        <button v-if="canOpenConduct" type="button" class="badge badge-sm font-semibold cursor-pointer"
                            :class="getScoreBadgeClass(studentScore)" @click="goToConduct"
                            title="ไปหน้าบันทึกพฤติกรรมของนักเรียนคนนี้">
                            คะแนน {{ studentScore }}
                        </button>
                        <span v-else class="badge badge-sm font-semibold" :class="getScoreBadgeClass(studentScore)">
                            คะแนน {{ studentScore }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="mb-2 font-semibold flex items-center gap-2">
                <span>ปฏิทินการเรียน</span>
                <select v-model="selectedMonth" class="select select-bordered select-xs">
                    <option v-for="(m, idx) in monthsTH" :key="idx" :value="idx">{{ m }}</option>
                </select>
                <select v-model="selectedYear" class="select select-bordered select-xs">
                    <option v-for="y in yearOptions" :key="y" :value="y">{{ y + 543 }}</option>
                </select>
            </div>
            <div class="overflow-x-auto">
                <table class="table table-xs w-full text-center">
                    <thead>
                        <tr>
                            <th v-for="d in daysShort" :key="d">{{ d }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(week, widx) in calendar" :key="widx">
                            <td v-for="(day, didx) in week" :key="didx">
                                <div v-if="day">
                                    <span
                                        :class="getDayClass(day) + ' inline-block w-7 h-7 rounded-full leading-7 cursor-pointer'"
                                        v-if="getAttendanceMap[dateToStr(day)] && getAttendanceMap[dateToStr(day)].timeStamps && getAttendanceMap[dateToStr(day)].timeStamps.length > 0"
                                        @click="openAttendanceInfo(day)" :title="getDayTitle(day)">
                                        {{ day.getDate() }}
                                    </span>
                                    <span :class="getDayClass(day) + ' inline-block w-7 h-7 rounded-full leading-7'"
                                        v-else-if="getHolidayTitle(day)" :title="getDayTitle(day)">
                                        {{ day.getDate() }}
                                    </span>
                                    <span :class="getDayClass(day) + ' inline-block w-7 h-7 rounded-full leading-7'"
                                        v-else :title="getDayTitle(day)">
                                        {{ day.getDate() }}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <AttendanceInfo ref="attendanceInfoRef" :user="student" :attendance="selectedAttendanceInfo"
                type="student" />
            <dialog ref="pictureModal" class="modal">
                <div class="modal-box max-w-xl w-full p-0">
                    <form method="dialog">
                        <button
                            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
                    </form>
                    <img v-if="pictureModalSrc" :src="pictureModalSrc" :alt="student.name"
                        class="w-full h-auto max-h-[80vh] object-contain" />
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
            <div class="mt-4 text-xs grid grid-cols-7 gap-3 max-[650px]:grid-cols-3">
                <div class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
                    มาเรียน</div>
                <div class="flex items-center gap-1"><span
                        class="inline-block w-4 h-4 rounded-full bg-yellow-400"></span> มาสาย</div>
                <div class="flex items-center gap-1"><span
                        class="inline-block w-4 h-4 rounded-full bg-emerald-400"></span> ลา</div>
                <div class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded-full bg-pink-300"></span>
                    กิจกรรม</div>
                <div class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded-full bg-red-500"></span>
                    ไม่ได้สแกน</div>
                <div class="flex items-center gap-1"><span class="inline-block w-4 h-4 rounded-full bg-gray-400"></span>
                    วันหยุด</div>
                <div class="flex items-center gap-1"><span
                        class="inline-block w-4 h-4 rounded-full bg-violet-300"></span>
                    ปิดเทอม/ช่วงพิเศษ</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import reportApi from '../../api/report'
import holidaysApi from '../../api/holidays'
import { AcademicCalendarService } from '../../api/academiccalendar'
import { LeaveService } from '../../api/leave'
import { ActivityService } from '../../api/activity'
import AttendanceInfo from '../AttendanceInfo.vue'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const emit = defineEmits(['close'])
const props = defineProps({
    student: { type: Object, required: true },
    visible: { type: Boolean, default: false },
})
const router = useRouter()
const auth = useAuthStore()
const today = new Date()
const monthsTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const daysShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const selectedMonth = ref(today.getMonth())
const selectedYear = ref(today.getFullYear())
const yearOptions = computed(() => {
    const current = today.getFullYear()
    return [current - 1, current, current + 1]
})

const studentCode = computed(() => props.student.code || props.student.userid || props.student.id || '-')
const studentRoom = computed(() => props.student.room || props.student.classroom || '-')
const studentGuardianPhone = computed(() => {
    const value = props.student?.guardian_phone || props.student?.parent_phone || props.student?.phone || ''
    const text = String(value).trim()
    return text && text !== '-' ? text : ''
})
const studentScore = computed(() => {
    const value = Number(props.student?.score)
    return Number.isFinite(value) ? value : 100
})
const canOpenConduct = computed(() => auth.user?.role !== 'viewer')

const attendances = ref([])
const holidays = ref([])
const academicTerms = ref([])
const approvedLeaves = ref([])
const activities = ref([])
const loading = ref(false)
const attendanceInfoRef = ref(null)
const selectedAttendanceInfo = ref(null)
const pictureModal = ref(null)
const pictureModalSrc = ref(null)

const openPictureModal = (pic) => {
    pictureModalSrc.value = getPictureUrl(pic)
    pictureModal.value?.showModal()
}
const academicCalendarService = new AcademicCalendarService()
const leaveService = new LeaveService()
const activityService = new ActivityService()

const calendar = computed(() => {
    const year = selectedYear.value
    const month = selectedMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const weeks = []
    let week = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
        week.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(year, month, d)
        week.push(date)
        if (week.length === 7) {
            weeks.push(week)
            week = []
        }
    }
    if (week.length) {
        while (week.length < 7) week.push(null)
        weeks.push(week)
    }
    return weeks
})

const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '')
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '')
    }
    return parts[0][0] || '?'
}

const getAttendanceMap = computed(() => {
    const map = {}
    attendances.value.forEach(a => {
        map[a.date] = a
    })
    return map
})

const dateToStr = (dateObj) => {
    if (!dateObj) return ''
    return (
        dateObj.getFullYear() +
        '-' + String(dateObj.getMonth() + 1).padStart(2, '0') +
        '-' + String(dateObj.getDate()).padStart(2, '0')
    )
}

const normalizeDateInput = (value) => {
    if (!value) return ''
    return String(value).substring(0, 10)
}

const strToDate = (value) => {
    const normalized = normalizeDateInput(value)
    if (!normalized) return null
    const [year, month, day] = normalized.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

const approvedLeaveMap = computed(() => {
    const map = {}
    approvedLeaves.value.forEach((leaveRequest) => {
        const startDate = strToDate(leaveRequest?.start_date)
        const endDate = strToDate(leaveRequest?.end_date || leaveRequest?.start_date)
        if (!startDate || !endDate) return

        const leaveTypeName = leaveRequest?.leave_type_id?.name || 'ลา'
        const reason = leaveRequest?.reason || ''
        const cursor = new Date(startDate)
        const lastDate = endDate < startDate ? startDate : endDate

        while (cursor <= lastDate) {
            const dateKey = dateToStr(cursor)
            if (!map[dateKey]) {
                map[dateKey] = {
                    leaveType: leaveTypeName,
                    reason,
                }
            }
            cursor.setDate(cursor.getDate() + 1)
        }
    })
    return map
})

const activityMap = computed(() => {
    const map = {}
    activities.value.forEach((activity) => {
        const startDate = strToDate(activity?.activity_date_start || activity?.date || activity?.activity_date)
        const endDate = strToDate(activity?.activity_date_end || activity?.activity_date_start || activity?.date || activity?.activity_date)
        if (!startDate || !endDate) return

        const cursor = new Date(startDate)
        const lastDate = endDate < startDate ? startDate : endDate

        while (cursor <= lastDate) {
            const dateKey = dateToStr(cursor)
            if (!map[dateKey]) {
                map[dateKey] = []
            }

            map[dateKey].push({
                name: activity?.activity_name || 'มีกิจกรรม',
                startTime: activity?.start_time || '',
                endTime: activity?.end_time || '',
                location: activity?.location || '',
            })

            cursor.setDate(cursor.getDate() + 1)
        }
    })
    return map
})

const isTermOneOrTwo = (termName) => {
    const name = String(termName || '').toLowerCase()
    return /(เทอม\s*1|term\s*1|semester\s*1|ภาคเรียน\s*ที่?\s*1|เทอม\s*2|term\s*2|semester\s*2|ภาคเรียน\s*ที่?\s*2)/i.test(name)
}

const getAcademicTermStatus = (dateObj) => {
    const dstr = dateToStr(dateObj)
    if (!dstr) return { inTerm: false, label: 'ปิดเทอม' }

    const matchedTerm = academicTerms.value.find((term) => {
        const start = normalizeDateInput(term.start_date)
        const end = normalizeDateInput(term.end_date)
        if (!start || !end) return false
        return dstr >= start && dstr <= end
    })

    if (!matchedTerm) return { inTerm: false, label: 'ปิดเทอม' }

    if (isTermOneOrTwo(matchedTerm.term)) {
        return { inTerm: true, label: matchedTerm.term || 'ช่วงเวลาเรียน' }
    }

    return { inTerm: false, label: matchedTerm.term || 'ปิดเทอม' }
}

const getHolidayTitle = (dateObj) => {
    if (!dateObj) return ''
    const dstr = dateToStr(dateObj)
    const holiday = holidays.value.find(h => h.date === dstr)
    return holiday ? holiday.summary : ''
}

const getActivityTitle = (dateObj) => {
    if (!dateObj) return ''
    const items = activityMap.value[dateToStr(dateObj)]
    if (!items || items.length === 0) return ''

    return items
        .map((item) => {
            const timeRange = item.startTime && item.endTime
                ? `${item.startTime}-${item.endTime}`
                : (item.startTime || item.endTime || '')
            const detailParts = [timeRange, item.location].filter(Boolean)
            if (detailParts.length > 0) {
                return `กิจกรรม: ${item.name} (${detailParts.join(' | ')})`
            }
            return `กิจกรรม: ${item.name}`
        })
        .join('\n')
}

const getDayTitle = (dateObj) => {
    if (!dateObj) return ''
    const labels = []

    const holidayTitle = getHolidayTitle(dateObj)
    if (holidayTitle) {
        labels.push(`วันหยุด: ${holidayTitle}`)
    }

    const leaveInfo = approvedLeaveMap.value[dateToStr(dateObj)]
    if (leaveInfo) {
        if (leaveInfo.reason) {
            labels.push(`ลา (${leaveInfo.leaveType}): ${leaveInfo.reason}`)
        } else {
            labels.push(`ลา (${leaveInfo.leaveType})`)
        }
    }

    const activityTitle = getActivityTitle(dateObj)
    if (activityTitle) {
        labels.push(activityTitle)
    }

    if (labels.length > 0) {
        return labels.join('\n')
    }

    const termStatus = getAcademicTermStatus(dateObj)
    return termStatus.label || 'ปิดเทอม'
}

const openAttendanceInfo = (dateObj) => {
    const dstr = dateToStr(dateObj)
    const att = getAttendanceMap.value[dstr]
    if (att && att.timeStamps && att.timeStamps.length > 0) {
        selectedAttendanceInfo.value = att
        attendanceInfoRef.value.open()
    }
}

const getPictureUrl = (pic) => {
    if (!pic) return ''
    if (pic.startsWith('http://') || pic.startsWith('https://')) return pic
    return `${import.meta.env.VITE_IMG_PROFILE_URL || ''}${pic}`
}

const goToConduct = () => {
    if (!canOpenConduct.value) return
    const rawStudentId = props.student?._id || props.student?.id
    const studentId = /^[a-fA-F0-9]{24}$/.test(String(rawStudentId || '')) ? String(rawStudentId) : ''
    const userid = props.student?.userid ? String(props.student.userid) : ''
    const name = props.student?.name ? String(props.student.name) : ''
    if (!studentId && !userid && !name) return
    emit('close')
    router.push({
        name: 'Conduct',
        query: {
            ...(studentId ? { studentId: String(studentId) } : {}),
            ...(userid ? { userid } : {}),
            ...(name ? { name } : {}),
        },
    })
}

const getScoreBadgeClass = (score) => {
    const value = Number(score)
    if (Number.isNaN(value)) return 'badge-ghost'
    if (value >= 101) return 'bg-gradient-to-r from-blue-800 to-emerald-500 text-white border-transparent'
    if (value >= 81) return 'bg-green-600 text-white border-green-700'
    if (value >= 61) return 'bg-lime-300 text-lime-900 border-lime-400'
    if (value >= 41) return 'bg-yellow-300 text-yellow-900 border-yellow-400'
    if (value >= 21) return 'bg-orange-400 text-white border-orange-500'
    if (value >= 1) return 'bg-red-500 text-white border-red-600'
    return 'bg-black text-white border-black'
}

const getDayClass = (dateObj) => {
    if (!dateObj) return ''
    const dstr = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0')
    const att = getAttendanceMap.value[dstr]
    if (att && att.timeStamps && att.timeStamps.length > 0) {
        const firstTime = att.timeStamps[0].timestamp.slice(11, 16)
        if (firstTime > '08:01') return 'bg-yellow-400 text-black'
        return 'bg-blue-500 text-white'
    }

    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
    if (isWeekend) return ''

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const isFuture = dateObj > now
    const termStatus = getAcademicTermStatus(dateObj)
    if (!termStatus.inTerm) return 'bg-violet-300 text-violet-900'

    const isHoliday = holidays.value.some(h => h.date === dstr)
    if (isHoliday) return 'bg-gray-400 text-white'

    const leaveInfo = approvedLeaveMap.value[dstr]
    if (leaveInfo) return 'bg-emerald-400 text-emerald-900'

    const activityInfo = activityMap.value[dstr]
    if (activityInfo && activityInfo.length > 0) return 'bg-pink-300 text-pink-900'

    if (isFuture) return ''

    return 'bg-red-500 text-white'
}

const fetchAttendance = async () => {
    if (!props.student) return
    loading.value = true
    try {
        const year = selectedYear.value
        const month = selectedMonth.value
        const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
        const leaveUserId = props.student?._id || props.student?.id || props.student?.userid || ''
        const activityUserId = props.student?.userid || props.student?.id || props.student?._id || ''
        const activityPromise = activityUserId
            ? activityService.getActivities(start, end, { userid: activityUserId })
            : Promise.resolve({ data: [] })

        const [res, holidaysRes, leaveRes, activitiesRes] = await Promise.all([
            reportApi.getAttendanceReport({
                start,
                end,
                role: 'student',
                userid: props.student.userid || props.student.id,
                page: 1,
                limit: 1,
            }),
            holidaysApi.getHolidaysByRange(start, end),
            leaveService.getLeaveRequests({
                start_date: start,
                end_date: end,
                status: 'approved',
                user_id: leaveUserId,
            }),
            activityPromise,
        ])

        const leaveRows = leaveRes?.data || []
        approvedLeaves.value = Array.isArray(leaveRows)
            ? leaveRows.filter((leaveRequest) => String(leaveRequest?.status || '').toLowerCase() === 'approved')
            : []

        if (res.data && res.data.length > 0) {
            attendances.value = res.data[0].attendances || []
        } else {
            attendances.value = []
        }

        holidays.value = Array.isArray(holidaysRes.data) ? holidaysRes.data : []
        activities.value = Array.isArray(activitiesRes?.data) ? activitiesRes.data : []

        const yearsToFetch = [year]
        if (month <= 2) {
            yearsToFetch.push(year - 1)
        }

        const termSources = await Promise.allSettled(
            yearsToFetch.map((y) => academicCalendarService.getAcademicCalendarByYear(y))
        )

        academicTerms.value = termSources.flatMap((result) => {
            if (result.status !== 'fulfilled') return []
            const terms = result.value?.data?.terms
            return Array.isArray(terms) ? terms : []
        })
    } catch (e) {
        attendances.value = []
        holidays.value = []
        academicTerms.value = []
        approvedLeaves.value = []
        activities.value = []
    } finally {
        loading.value = false
    }
}

watch([
    () => props.student,
    selectedMonth,
    selectedYear,
    () => props.visible
], ([student, m, y, vis], [oldStudent]) => {
    if (student !== oldStudent) {
        selectedMonth.value = today.getMonth()
        selectedYear.value = today.getFullYear()
    }
    if (vis) fetchAttendance()
})

onMounted(() => {
    if (props.visible) fetchAttendance()
})
</script>
<style scoped>
.table-xs td,
.table-xs th {
    padding: 0.25rem;
}

.fixed {
    margin: 0 !important;
}
</style>
