<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h1 class="text-lg md:text-3xl font-bold">ตารางมาสาย</h1>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <input v-model="filters.start" type="date" @change="fetchData" :max="getDefaultDate()"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                <span>-</span>
                <input v-model="filters.end" type="date" @change="fetchData" :max="getDefaultDate()"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
            </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                        class="input input-sm input-bordered w-full" @input="fetchData" />
                </div>
                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">เลือกชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" @change="handleGradeChange"
                        class="select select-sm select-bordered w-full" :disabled="filters.role === 'teacher'">
                        <option value="">ทุกชั้นปี</option>
                        <option v-for="grade in allGrades" :key="grade" :value="grade">{{ mapGradeDisplay(grade) }}
                        </option>
                    </select>
                </div>
                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">เลือกห้อง</span>
                    </label>
                    <select v-model="filters.classroom" @change="handleClassroomChange"
                        class="select select-sm select-bordered w-full" :disabled="filters.role === 'teacher'">
                        <option value="">ทุกห้อง</option>
                        <option v-for="room in allRooms" :key="room" :value="room">{{ room }}</option>
                    </select>
                </div>
                <div v-if="residentRole === 'teacher'"
                    class="form-control md:col-start-4 flex flex-col items-center md:items-end md:justify-end md:h-full">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">ชั้นปี / ห้อง</span>
                        <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                    </div>
                </div>
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
            <LateTable 
            :data="paginatedData" 
            :pagination="paginationData" 
            :filters="filters" 
            :grade="filters.grade"
            :classroom="filters.classroom"
            :allowance-rules="allowanceRules"
            @page-change="goToPage" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import LateTable from '../../../components/Report/LateTable.vue'
import reportApi from '../../../api/report.js'
import { ClassRoomService } from '../../../api/class-room.js'
import { mapGradeDisplay, toVisibleSortedGrades } from '../../../utils/gradeSystem'
import { AllowanceService } from '../../../api/allowance';

const residentRole = localStorage.getItem('residentRole') || ''
const teacherGrade = localStorage.getItem('grade') || ''
const teacherClassroom = localStorage.getItem('classroom') || ''

const classRoomService = new ClassRoomService()
const allClassRooms = ref([])
const allGrades = ref([])
const allRooms = ref([])

const loading = ref(false)
const error = ref(null)
const lateData = ref([])

const allowanceRules = ref([]);

const fetchAllowanceSettings = async () => {
    try {
        const service = new AllowanceService();
        const res = await service.getAllowance();
        if (res?.data?.rules) {
            allowanceRules.value = res.data.rules;
        }
    } catch (error) {
        console.error("Error fetching allowance in Late.vue:", error);
    }
};

const filters = ref({
    role: 'student',
    start: getDefaultDate(),
    end: getDefaultDate(),
    search: '',
    grade: residentRole === 'teacher' ? teacherGrade : '',
    classroom: residentRole === 'teacher' ? teacherClassroom : ''
})

const pagination = ref({
    page: 1,
    limit: 10
})

function getDefaultDate() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
        let params = {
            start: filters.value.start,
            end: filters.value.end,
            role: filters.value.role,
            page: 1,
            limit: 50
        }
        const searchTerm = filters.value.search.trim();
        if (searchTerm) {
            if (/^\d+$/.test(searchTerm)) {
                params.userid = searchTerm;
            } else {
                params.name = searchTerm;
            }
        }
        if (filters.value.role === 'student') {
            params.grade = filters.value.grade;
            if (
                filters.value.classroom === '' ||
                filters.value.classroom === undefined ||
                filters.value.classroom === null ||
                isNaN(Number(filters.value.classroom))
            ) {
            } else {
                params.classroom = Number(filters.value.classroom);
            }
        }
        const response = await reportApi.getLateReport(params)
        if (response.message === 'Success') {
            lateData.value = response.data || []
            pagination.value.page = 1
        }
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง'
        console.error('Error fetching late report:', err)
    } finally {
        loading.value = false
    }
}


const handleRoleChange = () => {
    pagination.value.page = 1
    if (filters.value.role === 'teacher') {
        filters.value.grade = ''
        filters.value.classroom = ''
    } else {
        filters.value.grade = allGrades.value.length > 0 ? allGrades.value[0] : ''
        filters.value.classroom = allRooms.value.length > 0 ? allRooms.value[0] : '1'
    }
    fetchData()
}

const handleGradeChange = () => {
    pagination.value.page = 1
    fetchData()
}

const handleClassroomChange = () => {
    pagination.value.page = 1
    fetchData()
}

const isNumericSearch = computed(() => /^\d+$/.test(filters.value.search.trim()))

const filteredData = computed(() => {
    let base = lateData.value

    const grade = filters.value.grade
    const room = filters.value.classroom

    if (grade && room) {
        base = base.filter(item => String(item.grade) === String(grade) && String(item.classroom) === String(room))
    } else if (grade) {
        base = base.filter(item => String(item.grade) === String(grade))
    } else if (room) {
        base = base.filter(item => String(item.classroom) === String(room))
    }

    if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
        base = base.filter(item => {
            const match = item.grade.trim() === teacherGrade.trim()
                && Number(String(item.classroom).trim()) === Number(String(teacherClassroom).trim())
            return match
        })
    }

    const term = filters.value.search.trim()
    if (!term) return base
    if (isNumericSearch.value) {
        const foundById = base.filter(item => item.userid && item.userid.includes(term))
        if (foundById.length > 0) {
            return foundById
        } else {
            const lower = term.toLowerCase()
            return base.filter(item => item.name && item.name.toLowerCase().includes(lower))
        }
    }
    const lower = term.toLowerCase()
    return base.filter(item => item.name && item.name.toLowerCase().includes(lower))
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pagination.value.limit) || 1)

const paginatedData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit
    return filteredData.value.slice(start, start + pagination.value.limit)
})

const paginationData = computed(() => ({
    page: pagination.value.page,
    limit: pagination.value.limit,
    total_items: filteredData.value.length,
    total_pages: totalPages.value
}))

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        pagination.value.page = page
    }
}

onMounted(async () => {
    fetchAllowanceSettings();
    fetchData()
    try {
        const res = await classRoomService.getClassRooms()
        allClassRooms.value = res.data || []
        const gradesSet = new Set()
        const roomsSet = new Set()
        allClassRooms.value.forEach(item => {
            if (item.grade) gradesSet.add(item.grade)
            if (item.classroom) roomsSet.add(item.classroom)
        })
        allGrades.value = toVisibleSortedGrades(Array.from(gradesSet))
        allRooms.value = Array.from(roomsSet)
        if (filters.value.role === 'student' && !filters.value.grade) {
            filters.value.grade = allGrades.value[0] || ''
        }
    } catch (err) {
        console.error('Error fetching class rooms:', err)
    }
})
</script>

<style scoped></style>