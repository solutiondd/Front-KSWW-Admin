<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h1 class="text-lg md:text-3xl font-bold">ตารางเข้า-ออก</h1>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <div class="flex flex-col">
                    <label class="text-sm font-medium mb-1 md:mb-0 md:mr-1">วันที่เริ่มต้น</label>
                    <input v-model="filters.start" type="date" @change="fetchData" :max="getDefaultDate()"
                        class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                </div>
                <div class="hidden md:flex items-center justify-center md:mx-1">
                    <span class="mx-1">-</span>
                </div>
                <div class="flex flex-col">
                    <label class="text-sm font-medium mb-1 md:mb-0 md:mr-1">วันที่สิ้นสุด</label>
                    <input v-model="filters.end" type="date" @change="fetchData" :max="getDefaultDate()"
                        class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                </div>
            </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ประเภท</span>
                    </label>
                    <select v-model="filters.role" @change="handleRoleChange"
                        class="select select-sm select-bordered w-full">
                        <option value="student">นักเรียน</option>
                        <option value="teacher">ครู</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ค้นหาชื่อ/รหัส</span>
                    </label>
                    <input v-model="filters.search" type="text" placeholder="กรอกชื่อหรือรหัส"
                        class="input input-sm input-bordered w-full" @keyup.enter="fetchData" />
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">ทั้งหมด</option>
                        <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ grade }}</option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ห้อง</span>
                    </label>
                    <select v-model="filters.classroom" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">ทั้งหมด</option>
                        <option v-for="room in availableClassrooms" :key="room" :value="room">{{ room }}</option>
                    </select>
                </div>
                <div v-if="residentRole === 'teacher'"
                    class="form-control col-span-3 flex flex-col items-center md:items-end">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">ชั้นปี / ห้อง</span>
                        <span>{{ teacherGrade }}/{{ teacherClassroom }}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex gap-1 md:gap-2">
                    <button @click="fetchData" class="btn btn-sm btn-primary" :disabled="loading">
                        <svg v-if="loading" class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span class="hidden sm:inline">ค้นหา</span>
                    </button>
                    <button @click="resetFilters" class="btn btn-sm btn-outline">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span class="hidden sm:inline">รีเซ็ต</span>
                    </button>
                </div>
                <button @click="toggleTableType" class="btn btn-sm btn-secondary">
                    <svg v-if="tableType === 'detail'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                    {{ tableType === 'detail' ? 'แบบจำนวน' : 'แบบข้อมูล' }}
                </button>
            </div>
        </div>

        <div v-if="error" class="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else>
            <ReportTable v-if="tableType === 'detail'" :data="reportData" :pagination="pagination" :filters="filters"
                @viewDetail="openDetailModal" @page-change="goToPage" />
            <ReportTableAmount v-else :data="reportData" :dateRange="{ start: filters.start, end: filters.end }"
                :pagination="pagination" :role="filters.role" @page-change="goToPage" />
        </div>

        <AttendanceDetail ref="detailModal" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ReportTable from '../../../components/Report/AttendanceTable.vue'
import ReportTableAmount from '../../../components/Report/AttendanceTable-amount.vue'
import AttendanceDetail from '../../../components/Report/AttendanceDetail.vue'
import reportApi from '../../../api/report.js'
import { ClassRoomService } from '../../../api/class-room.js'
const tableType = ref('detail')

function toggleTableType() {
    tableType.value = tableType.value === 'detail' ? 'amount' : 'detail'
}

const loading = ref(false)
const error = ref(null)
const reportData = ref([])
const detailModal = ref(null)

const residentRole = localStorage.getItem('residentRole') || ''
const teacherGrade = localStorage.getItem('grade') || ''
const teacherClassroom = localStorage.getItem('classroom') || ''

const filters = ref({
    role: residentRole === 'teacher' ? 'student' : 'student',
    search: '',
    grade: residentRole === 'teacher' ? teacherGrade : 'ม.1',
    classroom: residentRole === 'teacher' ? teacherClassroom : 1,
    start: getDefaultDate(),
    end: getDefaultDate(),
})

const pagination = ref({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 0
})

function getDefaultDate() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const handleRoleChange = () => {
    if (residentRole !== 'teacher') {
        if (filters.value.role === 'teacher') {
            filters.value.grade = ''
            filters.value.classroom = 0
        } else {
            filters.value.grade = 'ม.1'
            filters.value.classroom = 1
        }
        pagination.value.page = 1
        fetchData()
    }
}

const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
        const rawSearch = filters.value.search.trim()
        const isNumeric = /^\d+$/.test(rawSearch)
        let params = {
            start: filters.value.start,
            end: filters.value.end,
            name: isNumeric ? '' : rawSearch,
            userid: isNumeric ? rawSearch : '',
            page: pagination.value.page,
            limit: pagination.value.limit,
        }

        if (residentRole === 'teacher') {
            params.role = 'student'
            params.grade = teacherGrade
            params.classroom = teacherClassroom
        } else {
            params.role = filters.value.role
            params.grade = filters.value.grade
            params.classroom = filters.value.classroom
        }

        const response = await reportApi.getAttendanceReport(params)

        if (response.message === 'Success') {
            reportData.value = response.data
            pagination.value = {
                page: response.page,
                limit: response.limit,
                total_items: response.total_items,
                total_pages: response.total_pages
            }
        }
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง'
        console.error('Error fetching report:', err)
    } finally {
        loading.value = false
    }
}

const resetFilters = () => {
    if (residentRole === 'teacher') {
        filters.value = {
            role: 'student',
            search: '',
            grade: teacherGrade,
            classroom: teacherClassroom,
            start: getDefaultDate(),
            end: getDefaultDate(),
        }
    } else {
        filters.value = {
            role: 'student',
            search: '',
            grade: 'ม.1',
            classroom: 1,
            start: getDefaultDate(),
            end: getDefaultDate(),
        }
    }
    pagination.value.page = 1
    fetchData()
}

const goToPage = (page) => {
    if (page >= 1 && page <= pagination.value.total_pages) {
        pagination.value.page = page
        fetchData()
    }
}

const openDetailModal = (item, attendance = null) => {
    detailModal.value.openModal(item, attendance)
}

const classRoomService = new ClassRoomService()
const classrooms = ref([])

const availableGrades = computed(() => {
    if (!classrooms.value || classrooms.value.length === 0) return []
    const grades = [...new Set(classrooms.value.map(c => c.grade))]
    return grades.sort((a, b) => {
        const numA = parseInt((a || '').replace('ม.', ''))
        const numB = parseInt((b || '').replace('ม.', ''))
        return numA - numB
    })
})

const availableClassrooms = computed(() => {
    if (!filters.value.grade || !classrooms.value || classrooms.value.length === 0) return []
    const filtered = classrooms.value.filter(c => c.grade === filters.value.grade)
    const classNums = [...new Set(filtered.map(c => c.classroom))]
    return classNums.sort((a, b) => a - b)
})

onMounted(async () => {
    await fetchClassrooms()
    fetchData()
})

async function fetchClassrooms() {
    try {
        const res = await classRoomService.getClassRooms()
        if (res.message === 'Success' && res.data) {
            classrooms.value = res.data
        }
    } catch (e) {
        console.error('Error fetching classrooms:', e)
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped></style>