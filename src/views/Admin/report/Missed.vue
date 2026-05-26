<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h1 class="text-lg md:text-3xl font-bold">ตารางขาดเรียน/ขาดงาน</h1>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <div class="flex flex-col">
                    <label class="text-sm font-medium">จาก</label>
                    <input v-model="filters.start" type="date" :max="filters.end" @change="fetchData"
                        class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                </div>
                <div class="flex flex-col">
                    <label class="text-sm font-medium">ถึง</label>
                    <input v-model="filters.end" type="date" :min="filters.start" :max="getDefaultDate()"
                        @change="fetchData"
                        class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                </div>
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
                        class="input input-sm input-bordered w-full" />
                </div>
                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">เลือกชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" @change="handleGradeChange"
                        class="select select-sm select-bordered w-full" :disabled="filters.role === 'teacher'">
                        <option value="">ทุกชั้นปี</option>
                        <option v-for="grade in allGrades" :key="grade" :value="grade">{{ grade }}</option>
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
                        <span>{{ teacherGrade }}/{{ teacherClassroom }}</span>
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
            <MissedTable :data="paginatedData" :pagination="paginationData" :role="filters.role"
                :dateRange="{ start: filters.start, end: filters.end }" :grade="filters.grade"
                :classroom="filters.classroom" @page-change="goToPage" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MissedTable from '../../../components/Report/MissedTable.vue'
import reportApi from '../../../api/report.js'
import { ClassRoomService } from '../../../api/class-room.js'

const residentRole = localStorage.getItem('residentRole') || ''
const teacherGrade = localStorage.getItem('grade') || ''
const teacherClassroom = localStorage.getItem('classroom') || ''

const loading = ref(false)
const error = ref(null)
const missedData = ref([])

const classRoomService = new ClassRoomService()
const allClassRooms = ref([])
const allGrades = ref([])
const allRooms = ref([])

const today = getDefaultDate();
const filters = ref({
    role: 'student',
    start: today,
    end: today,
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
        const rawSearch = filters.value.search.trim()
        const isNumeric = /^\d+$/.test(rawSearch)
        let gradeValue = filters.value.grade;
        if (gradeValue === '' || gradeValue === undefined || gradeValue === null) {
            gradeValue = '';
        }
        let classroomValue = filters.value.classroom;
        if (classroomValue === '' || classroomValue === undefined || classroomValue === null) {
            classroomValue = '';
        }
        if (filters.value.role === 'teacher') {
            gradeValue = '';
            classroomValue = 0;
        }
        let params = {
            start: filters.value.start,
            end: filters.value.end,
            role: filters.value.role,
            name: isNumeric ? '' : rawSearch,
            department: "",
            userid: isNumeric ? rawSearch : '',
        };
        if (gradeValue !== '') params.grade = gradeValue;
        if (classroomValue !== '' && classroomValue !== undefined) params.classroom = classroomValue;
        const response = await reportApi.getMissedReport(params)

        if (response.message === 'Success') {
            missedData.value = response.data || []
        }
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง'
        console.error('Error fetching missed report:', err)
    } finally {
        loading.value = false
    }
}

const handleRoleChange = () => {
    pagination.value.page = 1
    if (filters.value.role === 'teacher') {
        filters.value.grade = ''
        filters.value.classroom = 0
    } else {
        filters.value.grade = 'ม.1'
        filters.value.classroom = '1'
    }
    fetchData()
}

const isNumericSearch = computed(() => /^\d+$/.test(filters.value.search.trim()))

const filteredData = computed(() => {
    let base = missedData.value

    const grade = filters.value.grade
    const room = filters.value.classroom

    function normalizeGrade(val) {
        if (!val) return '';
        const str = String(val).trim();
        const match = str.match(/(\d+)/);
        return match ? match[1] : str;
    }
    function normalizeRoom(val) {
        if (!val) return '';
        return String(val).trim();
    }

    if (grade && room) {
        base = base.filter(item =>
            normalizeGrade(item.grade) === normalizeGrade(grade) &&
            normalizeRoom(item.classroom) === normalizeRoom(room)
        );
    } else if (grade) {
        base = base.filter(item => normalizeGrade(item.grade) === normalizeGrade(grade));
    } else if (room) {
        base = base.filter(item => normalizeRoom(item.classroom) === normalizeRoom(room));
    }

    const term = filters.value.search.trim()
    if (!term) return base
    if (isNumericSearch.value) {
        return base.filter(item => item.userid && item.userid.includes(term))
    }
    const lower = term.toLowerCase()
    return base.filter(item => item.name && item.name.toLowerCase().includes(lower))
})

const handleGradeChange = () => {
    pagination.value.page = 1
    fetchData()
}
const handleClassroomChange = () => {
    pagination.value.page = 1
    fetchData()
}



const paginatedData = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit;
    const end = start + pagination.value.limit;
    return filteredData.value.slice(start, end);
});

const paginationData = computed(() => {
    const totalItems = filteredData.value.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pagination.value.limit));
    return {
        page: pagination.value.page,
        limit: pagination.value.limit,
        total_items: totalItems,
        total_pages: totalPages
    };
});

function goToPage(page) {
    if (page < 1 || page > paginationData.value.total_pages) return;
    pagination.value.page = page;
}

onMounted(() => {
    fetchData()
    try {
        classRoomService.getClassRooms().then(res => {
            allClassRooms.value = res.data || []
            const gradesSet = new Set()
            const roomsSet = new Set()
            allClassRooms.value.forEach(item => {
                if (item.grade) gradesSet.add(item.grade)
                if (item.classroom) roomsSet.add(item.classroom)
            })
            allGrades.value = Array.from(gradesSet)
            allRooms.value = Array.from(roomsSet)
        })
    } catch (err) {
        console.error('Error fetching class rooms:', err)
    }
})
</script>

<style scoped></style>