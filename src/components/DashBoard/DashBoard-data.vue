<template>
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-white">สรุปรายวัน</h3>
            <div class="flex items-center gap-2">
                <input type="date" v-model="selectedDate" class="input input-sm input-bordered" @change="fetchDaily"
                    :max="getDefaultDate()" />
                <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            </div>
        </div>

        <dialog ref="attendanceModal" class="modal" @close="resetAttendancePage">
            <div class="modal-box max-w-7xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg mb-4">รายการเข้าเรียน{{ attendanceRole === 'teacher' ? 'ครู' : 'นักเรียน'
                    }} วันที่ {{ displayDate }}</h3>
                <div v-if="attendanceRole === 'student'">
                    <Attendance :role="'student'" :date="selectedDate" v-if="residentRole !== 'teacher'" />
                    <Attendance :role="'student'" :date="selectedDate" v-else :fixed-grade="localGrade"
                        :fixed-classroom="localClassroom" :hide-dropdown="true" />
                </div>
                <div v-else>
                    <Attendance :role="'teacher'" :date="selectedDate" v-if="residentRole !== 'teacher'" />
                    <Attendance :role="'teacher'" :date="selectedDate" v-else :fixed-name="profileName"
                        :hide-search="true" />
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <dialog ref="lateModal" class="modal" @close="resetLatePage">
            <div class="modal-box max-w-7xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg mb-4">รายการมาสาย{{ lateRole === 'teacher' ? 'ครู' : 'นักเรียน' }} วันที่
                    {{ displayDate }}</h3>

                <LateTable :data="lateData" :pagination="latePagination"
                    :filters="{ start: (selectedDate.value || '').toString(), end: (selectedDate.value || '').toString(), role: lateRole }"
                    :hide-export="true" @page-change="handleLatePageChange" summaryTextColor="text-black" />
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <dialog ref="missedModal" class="modal">
            <div class="modal-box max-w-7xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg mb-4">รายการที่ไม่ได้สแกน{{ missedRole === 'teacher' ? 'ครู' : 'นักเรียน'
                    }} วันที่
                    {{ displayDate }}</h3>

                <MissedTable :data="missedData" :pagination="missedPagination" :hide-export="true"
                    :dateRange="{ start: (selectedDate.value || '').toString(), end: (selectedDate.value || '').toString() }"
                    :role="missedRole" @page-change="handleMissedPageChange" summaryTextColor="text-black" />
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <dialog ref="leaveModal" class="modal">
            <div class="modal-box max-w-7xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 class="font-bold text-lg mb-4">รายการลา{{ leaveRole === 'teacher' ? 'ครู' : 'นักเรียน' }} วันที่
                    {{ displayDate }}</h3>

                <LeaveRequest :filters="leaveFilters" />
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <div v-if="auth.user?.role !== 'teacher'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <transition name="slide-fade">
                <div v-show="showStudentStat" class="stats shadow bg-base-100">
                    <div class="stat group" ref="studentStatRef">
                        <div class="stat-title">จำนวนนักเรียนทั้งหมด</div>
                        <div class="stat-value text-primary">{{ totals.total_students || 0 }}</div>
                        <div class="stat-figure">
                            <div ref="studentIconRef" class="w-20 h-20 transition-transform duration-200"></div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition v-if="auth.user?.role !== 'teacher'" name="slide-down">
                <div v-show="showTeacherStat" class="stats shadow bg-base-100">
                    <div class="stat group" ref="teacherStatRef">
                        <div class="stat-title">จำนวนครูทั้งหมด</div>
                        <div class="stat-value text-secondary">{{ totals.total_teachers || 0 }}</div>
                        <div class="stat-figure">
                            <div ref="teacherIconRef" class="w-20 h-20 transition-transform duration-200"></div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="slide-right">
                <div v-show="showCombinedStat" class="stats shadow bg-base-100">
                    <div class="stat group" ref="combinedStatRef">
                        <div class="stat-title">ทั้งหมดที่เข้า</div>
                        <div class="stat-value text-purple-500">{{ totalCombined }}</div>
                        <div class="stat-desc">ประจำวันที่ {{ displayDate }}</div>
                        <div class="stat-figure">
                            <div ref="combinedIconRef" class="w-20 h-20 transition-transform duration-200"></div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <div v-if="auth.user?.role !== 'teacher'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <transition name="slide-fade">
                <div v-show="showStudentAbsentStat" class="card bg-base-100 shadow-xl group student-bg"
                    ref="studentAbsentStatRef">
                    <div class="card-body p-4">
                        <h4 class="card-title">นักเรียน</h4>
                        <div class="stats stats-vertical lg:stats-horizontal bg-base-100 w-full student-bg">
                            <div class="stat relative">
                                <div class="stat-title">เข้า</div>
                                <div class="stat-value text-primary">{{ student.total - student.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showAttendanceTable" class="btn btn-xs btn-primary btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative">
                                <div class="stat-title">มาสาย</div>
                                <div class="stat-value text-black">{{ student.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentLateTable" class="btn btn-xs btn-ghost btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative border-l pl-4">
                                <div class="stat-title">ลา</div>
                                <div class="stat-value text-warning">{{ studentLeave }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentLeaveTable" class="btn btn-xs btn-warning btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative border-l pl-4">
                                <div class="stat-title">ไม่ได้สแกน</div>
                                <div class="stat-value text-error">{{ studentAbsent }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentMissedTable" class="btn btn-xs btn-error btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition v-if="auth.user?.role !== 'teacher'" name="slide-right">
                <div v-show="showTeacherAbsentStat" class="card bg-base-100 shadow-xl group teacher-bg"
                    ref="teacherAbsentStatRef">
                    <div class="card-body p-4">
                        <h4 class="card-title">ครู</h4>
                        <div class="stats stats-vertical lg:stats-horizontal bg-base-100 w-full teacher-bg">
                            <div class="stat relative">
                                <div class="stat-title">เข้า</div>
                                <div class="stat-value text-secondary">{{ teacher.total - teacher.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showTeacherAttendanceTable"
                                        class="btn btn-xs btn-secondary btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative">
                                <div class="stat-title">มาสาย</div>
                                <div class="stat-value text-black">{{ teacher.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showTeacherLateTable" class="btn btn-xs btn-ghost btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative border-l pl-4">
                                <div class="stat-title">ลา</div>
                                <div class="stat-value text-warning">{{ teacherLeave }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showTeacherLeaveTable" class="btn btn-xs btn-warning btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat group relative border-l pl-4" ref="teacherAbsentStatRef">
                                <div class="stat-title">ไม่ได้สแกน</div>
                                <div class="stat-value text-error">{{ teacherAbsent }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showTeacherMissedTable" class="btn btn-xs btn-error btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <div v-if="auth.user?.role === 'teacher'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <transition name="slide-fade">
                <div v-show="showStudentStat" class="stats shadow bg-base-100">
                    <div class="stat group" ref="studentStatRef">
                        <div class="stat-title">จำนวนนักเรียนทั้งหมด</div>
                        <div class="stat-value text-primary">{{ totals.total_students || 0 }}</div>
                        <div class="stat-figure">
                            <div ref="studentIconRef" class="w-20 h-20 transition-transform duration-200"></div>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="slide-right">
                <div v-show="showStudentAbsentStat" class="card bg-base-100 shadow-xl group" ref="studentAbsentStatRef">
                    <div class="card-body p-4">
                        <h4 class="card-title">นักเรียน</h4>
                        <div class="stats stats-vertical lg:stats-horizontal bg-base-100 w-full">
                            <div class="stat relative">
                                <div class="stat-title">เข้า</div>
                                <div class="stat-value text-primary">{{ student.total - student.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showAttendanceTable" class="btn btn-xs btn-primary btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative">
                                <div class="stat-title">มาสาย</div>
                                <div class="stat-value text-black">{{ student.late }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentLateTable" class="btn btn-xs btn-ghost btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative border-l pl-4">
                                <div class="stat-title">ลา</div>
                                <div class="stat-value text-warning">{{ studentLeave }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentLeaveTable" class="btn btn-xs btn-warning btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                            <div class="stat relative border-l pl-4">
                                <div class="stat-title">ไม่ได้สแกน</div>
                                <div class="stat-value text-error">{{ studentAbsent }}</div>
                                <div class="stat-desc absolute bottom-2 right-2">
                                    <button @click="showStudentMissedTable" class="btn btn-xs btn-error btn-plain">
                                        คลิก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import lottie from 'lottie-web'
import reportApi from '../../api/report.js'
import { ClassRoomService } from '../../api/class-room.js'
import { LeaveService } from '../../api/leave'
import LateTable from '../Report/LateTable.vue'
import MissedTable from '../Report/MissedTable.vue'
import LeaveRequest from '../Report/LeaveRequest.vue'
import AttendanceDetail from '../Report/AttendanceDetail.vue'
import Attendance from './Attendance.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const emit = defineEmits(['dateChange'])
const studentCardRef = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])

function getDefaultDate() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const loading = ref(false)

const studentIconRef = ref(null)
const studentStatRef = ref(null)
const teacherIconRef = ref(null)
const teacherStatRef = ref(null)
const combinedIconRef = ref(null)
const combinedStatRef = ref(null)
const studentLateIconRef = ref(null)
const studentLateStatRef = ref(null)

const totals = ref({ total_students: 0, total_teachers: 0 })
const student = ref({ total: 0, late: 0 })
const teacher = ref({ total: 0, late: 0 })

const attendanceModal = ref(null)
const lateModal = ref(null)
const missedModal = ref(null)
const leaveModal = ref(null)
const attendanceData = ref([])
const attendancePage = ref(1)
const attendanceTotalItems = ref(0)
const attendanceTotalPages = ref(0)
const attendanceGrade = ref('')
const attendanceClassroom = ref(0)
const attendanceRole = ref('student')
const lateData = ref([])
const lateAllData = ref([])
const latePage = ref(1)
const lateLimit = ref(5)
const lateTotalItems = ref(0)
const lateTotalPages = ref(0)
const lateRole = ref('student')
const leaveRole = ref('student')
const missedData = ref([])
const missedAllData = ref([])
const missedPage = ref(1)
const missedLimit = ref(5)
const missedTotalItems = ref(0)
const missedTotalPages = ref(0)
const missedRole = ref('student')
const classrooms = ref([])
const studentLeave = ref(0)
const teacherLeave = ref(0)

const classRoomService = new ClassRoomService()
const leaveService = new LeaveService()

const residentRole = ref(localStorage.getItem('residentRole') || '')
const localGrade = ref(localStorage.getItem('grade') || '')
const localClassroom = ref(Number(localStorage.getItem('classroom')) || 0)
const profileName = ref(localStorage.getItem('profileName') || '')

const displayDate = computed(() => {
    const [year, month, day] = (selectedDate.value || '').split('-').map(Number)
    if (!year || !month || !day) return ''

    const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ]
    const buddhistYear = year + 543

    return `${day} ${thaiMonths[month - 1]} ${buddhistYear}`
})

const latePagination = computed(() => ({
    page: latePage.value,
    limit: lateLimit.value,
    total_items: lateTotalItems.value,
    total_pages: lateTotalPages.value,
}))

const missedPagination = computed(() => ({
    page: missedPage.value,
    limit: missedLimit.value,
    total_items: missedTotalItems.value,
    total_pages: missedTotalPages.value
}))


const availableGrades = computed(() => {
    if (!classrooms.value || classrooms.value.length === 0) return []
    const grades = [...new Set(classrooms.value.map(c => c.grade))]
    return grades.sort((a, b) => {
        const numA = parseInt(a.replace('ม.', ''))
        const numB = parseInt(b.replace('ม.', ''))
        return numA - numB
    })
})

const availableClassrooms = computed(() => {
    if (!attendanceGrade.value || !classrooms.value || classrooms.value.length === 0) return []
    const filtered = classrooms.value.filter(c => c.grade === attendanceGrade.value)
    const classNums = [...new Set(filtered.map(c => c.classroom))]
    return classNums.sort((a, b) => a - b)
})

const totalCombined = computed(() => (student.value.total || 0) + (teacher.value.total || 0))
const studentAbsent = computed(() => Math.max((totals.value.total_students || 0) - (student.value.total || 0) - (studentLeave.value || 0), 0))
const teacherAbsent = computed(() => Math.max((totals.value.total_teachers || 0) - (teacher.value.total || 0) - (teacherLeave.value || 0), 0))
const leaveFilters = computed(() => ({
    start_date: (selectedDate.value || '').toString(),
    end_date: (selectedDate.value || '').toString(),
    status: 'approved',
    role: leaveRole.value,
    search: '',
}))

const attendanceFilteredData = ref([])
const showStudentStat = ref(false)
const showTeacherStat = ref(false)
const showCombinedStat = ref(false)
const showStudentAbsentStat = ref(false)
const showTeacherAbsentStat = ref(false)

async function fetchLeaveSummaryByDate() {
    try {
        const filters = {
            start_date: selectedDate.value,
            end_date: selectedDate.value,
            status: 'approved',
        }

        if (residentRole.value === 'teacher' && localGrade.value && localClassroom.value) {
            filters.grade = localGrade.value
            filters.classroom = localClassroom.value
        }

        const response = await leaveService.getLeaveRequests(filters)
        let data = response?.data || response || []

        if (residentRole.value === 'teacher' && localGrade.value && localClassroom.value) {
            data = data.filter(
                (item) =>
                    item.user_id?.grade === localGrade.value &&
                    String(item.user_id?.classroom ?? '') === String(localClassroom.value)
            )
        }

        studentLeave.value = data.filter((item) => item.user_id?.role === 'student').length
        teacherLeave.value = data.filter((item) => item.user_id?.role === 'teacher').length
    } catch (e) {
        console.error('Daily leave summary error', e)
        studentLeave.value = 0
        teacherLeave.value = 0
    }
}

async function fetchDaily() {
    loading.value = true
    emit('dateChange', selectedDate.value)
    try {
        const start = selectedDate.value
        const end = selectedDate.value
        const res = await reportApi.getDailyStats(start, end)
        if (res.message === 'Success' && res.data) {
            totals.value.total_students = res.data.total_students || 0
            totals.value.total_teachers = res.data.total_teachers || 0
            const list = res.data.daily_stats || []
            const stu = list.find(x => x.role === 'student') || { total: 0, late: 0 }
            const tea = list.find(x => x.role === 'teacher') || { total: 0, late: 0 }
            student.value = { total: stu.total || 0, late: stu.late || 0 }
            teacher.value = { total: tea.total || 0, late: tea.late || 0 }
        }
        await fetchLeaveSummaryByDate()
    } catch (e) {
        console.error('Daily summary error', e)
        totals.value = { total_students: 0, total_teachers: 0 }
        student.value = { total: 0, late: 0 }
        teacher.value = { total: 0, late: 0 }
        studentLeave.value = 0
        teacherLeave.value = 0
    } finally {
        loading.value = false
    }
}

async function fetchClassrooms() {
    try {
        const res = await classRoomService.getClassRooms()
        if (res.message === 'Success' && res.data) {
            classrooms.value = res.data
            if (availableGrades.value.length > 0) {
                attendanceGrade.value = availableGrades.value[0]
            }
            if (availableClassrooms.value.length > 0) {
                attendanceClassroom.value = availableClassrooms.value[0]
            }
        }
    } catch (e) {
        console.error('Error fetching classrooms:', e)
    }
}

async function showAttendanceTable() {
    try {
        loading.value = true
        attendanceRole.value = 'student'
        let params = {
            start: selectedDate.value,
            end: selectedDate.value,
            role: 'student',
            page: attendancePage.value,
            limit: 5,
            grade: attendanceGrade.value,
            classroom: attendanceClassroom.value
        }
        if (residentRole.value === 'teacher') {
            params.grade = localGrade.value
            params.classroom = localClassroom.value
            params.limit = 50
        }
        const res = await reportApi.getAttendanceReport(params)
        if (res.message === 'Success' && res.data) {
            let filtered = (res.data || []).filter(item => item.attendances && item.attendances.length > 0)
            if (residentRole.value === 'teacher') {
                attendanceFilteredData.value = filtered
                attendanceTotalItems.value = filtered.length
                attendanceTotalPages.value = Math.ceil(filtered.length / 5) || 1
                attendanceData.value = filtered.slice((attendancePage.value - 1) * 5, attendancePage.value * 5)
            } else {
                attendanceData.value = filtered
                attendanceTotalItems.value = res.total_items || filtered.length
                attendanceTotalPages.value = res.total_pages || 1
            }
            attendanceModal.value?.showModal()
        }
    } catch (e) {
        console.error('Error fetching attendance data:', e)
    } finally {
        loading.value = false
    }
}

async function showTeacherAttendanceTable() {
    try {
        loading.value = true
        attendanceRole.value = 'teacher'
        let params = {
            start: selectedDate.value,
            end: selectedDate.value,
            role: 'teacher',
            page: attendancePage.value,
            limit: 5
        }
        if (residentRole.value === 'teacher') {
            params.grade = null
            params.classroom = 0
            params.name = profileName.value
            params.limit = 50
        }
        const res = await reportApi.getAttendanceReport(params)
        if (res.message === 'Success' && res.data) {
            let filtered = (res.data || []).filter(item => item.attendances && item.attendances.length > 0)
            if (residentRole.value === 'teacher') {
                attendanceFilteredData.value = filtered
                attendanceTotalItems.value = filtered.length
                attendanceTotalPages.value = Math.ceil(filtered.length / 5) || 1
                attendanceData.value = filtered.slice((attendancePage.value - 1) * 5, attendancePage.value * 5)
            } else {
                attendanceData.value = filtered
                attendanceTotalItems.value = res.total_items || filtered.length
                attendanceTotalPages.value = res.total_pages || 1
            }
            attendanceModal.value?.showModal()
        }
    } catch (e) {
        console.error('Error fetching teacher attendance data:', e)
    } finally {
        loading.value = false
    }
}

async function showStudentLateTable() {
    try {
        loading.value = true
        lateRole.value = 'student'
        let params = {
            start: selectedDate.value,
            end: selectedDate.value,
            role: 'student',
            page: latePage.value,
            limit: lateLimit.value
        }
        if (residentRole.value === 'teacher') {
            params.grade = localGrade.value
            params.classroom = localClassroom.value
        }
        const res = await reportApi.getLateReport(params)
        if (res.message === 'Success' && res.data) {
            lateAllData.value = res.data || [];
            lateTotalItems.value = res.total_items || lateAllData.value.length;
            lateTotalPages.value = res.total_pages || 1;
            latePage.value = res.page || 1;
            lateData.value = lateAllData.value;
            lateModal.value?.showModal();
        }
    } catch (e) {
        console.error('Error fetching student late data:', e);
    } finally {
        loading.value = false;
    }
}

async function showTeacherLateTable() {
    try {
        loading.value = true
        lateRole.value = 'teacher'
        let params = {
            start: selectedDate.value,
            end: selectedDate.value,
            role: 'teacher',
            page: latePage.value,
            limit: lateLimit.value
        }
        if (residentRole.value === 'teacher') {
            params.name = profileName.value
        }
        const res = await reportApi.getLateReport(params)
        if (res.message === 'Success' && res.data) {
            lateAllData.value = res.data || [];
            lateTotalItems.value = res.total_items || lateAllData.value.length;
            lateTotalPages.value = res.total_pages || 1;
            latePage.value = res.page || 1;
            lateData.value = lateAllData.value;
            lateModal.value?.showModal();
        }
    } catch (e) {
        console.error('Error fetching teacher late data:', e);
    } finally {
        loading.value = false;
    }
}

async function showStudentMissedTable() {
    try {
        loading.value = true
        missedRole.value = 'student'
        const res = await reportApi.getMissedReport({
            start: (selectedDate.value || '').toString(),
            end: (selectedDate.value || '').toString(),
            role: 'student',
            classroom: 0
        })
        if (res.message === 'Success' && res.data) {
            let allMissed = res.data || [];
            if (residentRole.value === 'teacher') {
                allMissed = allMissed.filter(item => item.grade === localGrade.value && Number(item.classroom) === localClassroom.value);
            }
            missedAllData.value = allMissed;
            missedTotalItems.value = missedAllData.value.length;
            missedTotalPages.value = Math.ceil(missedAllData.value.length / missedLimit.value) || 1;
            missedPage.value = 1;
            const start = 0;
            missedData.value = missedAllData.value.slice(start, start + missedLimit.value);
            missedModal.value?.showModal();
        }
    } catch (e) {
        console.error('Error fetching student missed data:', e);
    } finally {
        loading.value = false;
    }
}

async function showTeacherMissedTable() {
    try {
        loading.value = true
        missedRole.value = 'teacher'
        const res = await reportApi.getMissedReport({
            start: (selectedDate.value || '').toString(),
            end: (selectedDate.value || '').toString(),
            role: 'teacher',
            classroom: 0
        })
        if (res.message === 'Success' && res.data) {
            let allMissed = res.data || [];
            if (residentRole.value === 'teacher') {
                allMissed = allMissed.filter(item => item.name === profileName.value);
            }
            missedAllData.value = allMissed;
            missedTotalItems.value = missedAllData.value.length;
            missedTotalPages.value = Math.ceil(missedAllData.value.length / missedLimit.value) || 1;
            missedPage.value = 1;
            const start = 0;
            missedData.value = missedAllData.value.slice(start, start + missedLimit.value);
            missedModal.value?.showModal();
        }
    } catch (e) {
        console.error('Error fetching teacher missed data:', e);
    } finally {
        loading.value = false;
    }
}

function showStudentLeaveTable() {
    leaveRole.value = 'student'
    leaveModal.value?.showModal()
}

function showTeacherLeaveTable() {
    leaveRole.value = 'teacher'
    leaveModal.value?.showModal()
}

function handleLatePageChange(page) {
    if (page >= 1 && page <= lateTotalPages.value) {
        latePage.value = page;
        if (lateRole.value === 'student') {
            showStudentLateTableWithPage(page);
        } else {
            showTeacherLateTableWithPage(page);
        }
    }

    async function showStudentLateTableWithPage(page) {
        try {
            loading.value = true;
            lateRole.value = 'student';
            let params = {
                start: selectedDate.value,
                end: selectedDate.value,
                role: 'student',
                page: page,
                limit: lateLimit.value
            };
            if (residentRole.value === 'teacher') {
                params.grade = localGrade.value;
                params.classroom = localClassroom.value;
            }
            const res = await reportApi.getLateReport(params);
            if (res.message === 'Success' && res.data) {
                lateAllData.value = res.data || [];
                lateTotalItems.value = res.total_items || lateAllData.value.length;
                lateTotalPages.value = res.total_pages || 1;
                latePage.value = res.page || page;
                lateData.value = lateAllData.value;
            }
        } catch (e) {
            console.error('Error fetching student late data:', e);
        } finally {
            loading.value = false;
        }
    }

    async function showTeacherLateTableWithPage(page) {
        try {
            loading.value = true;
            lateRole.value = 'teacher';
            let params = {
                start: selectedDate.value,
                end: selectedDate.value,
                role: 'teacher',
                page: page,
                limit: lateLimit.value
            };
            if (residentRole.value === 'teacher') {
                params.name = profileName.value;
            }
            const res = await reportApi.getLateReport(params);
            if (res.message === 'Success' && res.data) {
                lateAllData.value = res.data || [];
                lateTotalItems.value = res.total_items || lateAllData.value.length;
                lateTotalPages.value = res.total_pages || 1;
                latePage.value = res.page || page;
                lateData.value = lateAllData.value;
            }
        } catch (e) {
            console.error('Error fetching teacher late data:', e);
        } finally {
            loading.value = false;
        }
    }
}

function handleMissedPageChange(page) {
    if (page >= 1 && page <= missedTotalPages.value) {
        missedPage.value = page
        const start = (page - 1) * missedLimit.value
        missedData.value = missedAllData.value.slice(start, start + missedLimit.value)
    }
}

function resetAttendancePage() {
    attendancePage.value = 1
}

function resetLatePage() {
    latePage.value = 1;
}

onMounted(() => {
    showStudentStat.value = false
    showTeacherStat.value = false
    showCombinedStat.value = false
    showStudentAbsentStat.value = false
    showTeacherAbsentStat.value = false
    setTimeout(() => {
        showStudentStat.value = true
    }, 100)
    setTimeout(() => {
        showTeacherStat.value = true
    }, 100)
    setTimeout(() => {
        showCombinedStat.value = true
    }, 100)
    setTimeout(() => {
        showStudentAbsentStat.value = true
    }, 100)
    setTimeout(() => {
        showTeacherAbsentStat.value = true
    }, 100)
    fetchDaily()
    fetchClassrooms()
    if (studentIconRef.value) {
        const anim = lottie.loadAnimation({
            container: studentIconRef.value,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: new URL('../../assets/doodle-color-353-internship-hover-pinch.json', import.meta.url).href,
        })
        anim.addEventListener('DOMLoaded', () => {
            anim.goToAndStop(0, true)
        })
        const containerEl = studentStatRef.value || studentIconRef.value
        const playAnim = () => anim.play()
        const stopAnim = () => anim.stop()
        containerEl.addEventListener('mouseenter', playAnim)
        containerEl.addEventListener('mouseleave', stopAnim)
    }

    if (teacherIconRef.value) {
        const anim2 = lottie.loadAnimation({
            container: teacherIconRef.value,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: new URL('../../assets/doodle-color-16-id-business-card-hover-pinch.json', import.meta.url).href,
        })
        anim2.addEventListener('DOMLoaded', () => {
            anim2.goToAndStop(0, true)
        })
        const containerEl2 = teacherStatRef.value || teacherIconRef.value
        const playAnim2 = () => anim2.play()
        const stopAnim2 = () => anim2.stop()
        containerEl2.addEventListener('mouseenter', playAnim2)
        containerEl2.addEventListener('mouseleave', stopAnim2)
    }

    if (combinedIconRef.value) {
        const anim3 = lottie.loadAnimation({
            container: combinedIconRef.value,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: new URL('../../assets/doodle-color-330-organization-hover-pinch.json', import.meta.url).href,
        })
        anim3.addEventListener('DOMLoaded', () => {
            anim3.goToAndStop(0, true)
        })
        const containerEl3 = combinedStatRef.value || combinedIconRef.value
        const playAnim3 = () => anim3.play()
        const stopAnim3 = () => anim3.stop()
        containerEl3.addEventListener('mouseenter', playAnim3)
        containerEl3.addEventListener('mouseleave', stopAnim3)
    }

    if (studentLateIconRef.value) {
        const animLate = lottie.loadAnimation({
            container: studentLateIconRef.value,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: new URL('../../assets/doodle-color-292-clock-time-hover-pinch.json', import.meta.url).href,
        })
        animLate.addEventListener('DOMLoaded', () => {
            animLate.goToAndStop(0, true)
        })
        const containerLate = studentCardRef.value || studentLateStatRef.value || studentLateIconRef.value
        const playLate = () => animLate.play()
        const stopLate = () => animLate.stop()
        containerLate.addEventListener('mouseenter', playLate)
        containerLate.addEventListener('mouseleave', stopLate)
    }
})
</script>

<style scoped>
.slide-fade-enter-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-fade-leave-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(-60px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-60px);
}

.slide-down-enter-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-down-leave-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-60px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-60px);
}

.slide-right-enter-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-right-leave-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(60px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(60px);
}

.student-bg {
    background-color: #e3f0ff !important;
}

.teacher-bg {
    background-color: #fff7d6 !important;
}
</style>