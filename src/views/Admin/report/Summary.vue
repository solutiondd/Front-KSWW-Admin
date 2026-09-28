<template>
    <div class="space-y-6 max-[944px]:pt-16">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h1 class="text-lg md:text-3xl font-bold">สรุปข้อมูลนักเรียน</h1>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <div class="flex flex-col">
                    <label class="text-sm font-medium mb-1 md:mb-0 md:mr-1">ปีการศึกษา</label>
                    <select v-model.number="selectedYear" class="select select-sm select-bordered text-base-content"
                        @change="fetchAcademicCalendar">
                        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <label class="text-sm font-medium mb-1 md:mb-0 md:mr-1">เทอม</label>
                    <select v-model.number="selectedTermIndex"
                        class="select select-sm select-bordered text-base-content" :disabled="!terms.length"
                        @change="fetchHolidays">
                        <option v-for="(term, index) in terms" :key="index" :value="index">{{ term.term }}</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ค้นหารหัส/ชื่อ</span>
                    </label>
                    <input v-model="filters.search" type="text" placeholder="กรอกรหัสหรือชื่อ"
                        class="input input-sm input-bordered w-full" @keyup.enter="fetchStudents" />
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" class="select select-sm select-bordered w-full"
                        @change="handleGradeChange">
                        <!-- <option value="">ทั้งหมด</option> -->
                        <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ mapGradeDisplay(grade)
                        }}</option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ห้อง</span>
                    </label>
                    <select v-model="filters.classroom" class="select select-sm select-bordered w-full"
                        @change="fetchStudents">
                        <!-- <option value="">ทั้งหมด</option> -->
                        <option v-for="room in availableClassrooms" :key="room" :value="room">{{ room }}</option>
                    </select>
                </div>

                <div v-if="residentRole === 'teacher'" class="form-control">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">ชั้นปี / ห้อง</span>
                        <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                    </div>
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">แถวต่อหน้า</span>
                    </label>
                    <select v-model.number="pageSize" class="select select-sm select-bordered w-full">
                        <option :value="10">10</option>
                        <option :value="20">20</option>
                        <option :value="50">50</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end">
                <button class="btn btn-sm btn-primary" @click="fetchStudents">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    ค้นหา
                </button>
            </div>
        </div>

        <div v-if="error" class="alert alert-error shadow-lg">
            <span>{{ error }}</span>
        </div>

        <SummaryTable :students="students" :loading="loadingStudents" :total-days="totalDays" :term="selectedTerm"
            :page-size="pageSize" :filters="filters" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SummaryTable from '../../../components/Report/SummaryTable.vue'
import { StudentService } from '../../../api/student.js'
import { ClassRoomService } from '../../../api/class-room.js'
import { AcademicCalendarService } from '../../../api/academiccalendar.js'
import HolidaysAPI from '../../../api/holidays.js'
import { mapGradeDisplay, toVisibleSortedGrades } from '../../../utils/gradeSystem'

const studentService = new StudentService()
const classRoomService = new ClassRoomService()
const academicCalendarService = new AcademicCalendarService()

const residentRole = localStorage.getItem('residentRole') || ''
const teacherGrade = localStorage.getItem('grade') || ''
const teacherClassroom = localStorage.getItem('classroom') || ''

const pageSize = ref(10)

const filters = ref({
    grade: residentRole === 'teacher' ? teacherGrade : 'ม.1',
    classroom: residentRole === 'teacher' ? teacherClassroom : 1,
    search: '',
})

const students = ref([])
const loadingStudents = ref(false)
const error = ref(null)

const classrooms = ref([])
const availableGrades = computed(() => {
    if (!classrooms.value.length) return []
    return toVisibleSortedGrades(classrooms.value.map((c) => c.grade))
})
const availableClassrooms = computed(() => {
    if (!filters.value.grade || !classrooms.value.length) return []
    const filtered = classrooms.value.filter((c) => c.grade === filters.value.grade)
    return [...new Set(filtered.map((c) => c.classroom))].sort((a, b) => a - b)
})

const currentYear = new Date().getFullYear() + 543 - 543
const selectedYear = ref(currentYear)
const availableYears = computed(() => [currentYear - 1, currentYear, currentYear + 1])
const terms = ref([])
const selectedTermIndex = ref(0)
const selectedTerm = computed(() => terms.value[selectedTermIndex.value] || null)

const holidays = ref([])

function isWeekend(date) {
    const day = date.getDay()
    return day === 0 || day === 6
}

function countWeekdaysBetween(startStr, endStr) {
    if (!startStr || !endStr) return 0
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    let count = 0
    const cursor = new Date(start)
    while (cursor <= end) {
        if (!isWeekend(cursor)) count++
        cursor.setDate(cursor.getDate() + 1)
    }
    return count
}

function countWeekdayHolidays(holidayList) {
    return (holidayList || []).filter((h) => {
        const d = new Date(h.date || h.start_date)
        return !Number.isNaN(d.getTime()) && !isWeekend(d)
    }).length
}

const totalDays = computed(() => {
    if (!selectedTerm.value) return 0
    const weekdayCount = countWeekdaysBetween(selectedTerm.value.start_date, selectedTerm.value.end_date)
    const holidayCount = countWeekdayHolidays(holidays.value)
    return Math.max(0, weekdayCount - holidayCount)
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

async function fetchStudents() {
    loadingStudents.value = true
    error.value = null
    try {
        const search = String(filters.value.search || '').trim()
        const isNumeric = /^\d+$/.test(search)
        const userid = isNumeric ? search : ''
        const name = !isNumeric ? search : ''
        const res = await studentService.getStudents(filters.value.grade, filters.value.classroom, userid, name)
        students.value = res?.data || []
    } catch (e) {
        console.error('Error fetching students:', e)
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน'
        students.value = []
    } finally {
        loadingStudents.value = false
    }
}

function handleGradeChange() {
    const roomsInNewGrade = availableClassrooms.value

    if (roomsInNewGrade.length > 0) {
        if (!roomsInNewGrade.includes(filters.value.classroom)) {
            filters.value.classroom = roomsInNewGrade[0]
        }
    } else {
        filters.value.classroom = 1
    }

    fetchStudents()
}

async function fetchAcademicCalendar() {
    terms.value = []
    selectedTermIndex.value = 0
    try {
        const res = await academicCalendarService.getAcademicCalendarByYear(selectedYear.value)
        terms.value = res?.data?.terms || []
        const today = new Date()
        const idx = terms.value.findIndex((t) => {
            const start = new Date(t.start_date)
            const end = new Date(t.end_date)
            return today >= start && today <= end
        })
        selectedTermIndex.value = idx >= 0 ? idx : 0
    } catch (e) {
        console.error('Error fetching academic calendar:', e)
        terms.value = []
    }
    await fetchHolidays()
}

async function fetchHolidays() {
    if (!selectedTerm.value) {
        holidays.value = []
        return
    }
    try {
        const res = await HolidaysAPI.getHolidaysByRange(selectedTerm.value.start_date, selectedTerm.value.end_date)
        holidays.value = res?.data || res || []
    } catch (e) {
        console.error('Error fetching holidays:', e)
        holidays.value = []
    }
}

async function detectAcademicYear() {
    for (const year of [currentYear, currentYear - 1]) {
        try {
            const res = await academicCalendarService.getAcademicCalendarByYear(year)
            const t = res?.data?.terms || []
            const today = new Date()
            const containsToday = t.some((term) => {
                const start = new Date(term.start_date)
                const end = new Date(term.end_date)
                return today >= start && today <= end
            })
            if (containsToday) {
                selectedYear.value = year
                terms.value = t
                const idx = t.findIndex((term) => {
                    const start = new Date(term.start_date)
                    const end = new Date(term.end_date)
                    return today >= start && today <= end
                })
                selectedTermIndex.value = idx >= 0 ? idx : 0
                await fetchHolidays()
                return
            }
        } catch (e) {
            // try next year
        }
    }
    // fallback: use current year data even if today isn't within any term
    await fetchAcademicCalendar()
}

onMounted(async () => {
    await fetchClassrooms()
    await fetchStudents()
    await detectAcademicYear()
})
</script>

<style scoped></style>
