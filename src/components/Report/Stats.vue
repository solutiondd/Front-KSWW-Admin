<template>
    <div class="p-1 sm:p-2 md:p-6 space-y-2 sm:space-y-4 md:space-y-6 w-full">
        <div class="flex flex-col md:flex-row md:items-center justify-between items-center gap-2 md:gap-4">
            <div class="flex flex-col">
                <h1 class="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-0">
                    สถิติการเข้า-ออก
                </h1>
                <div v-if="residentRole === 'teacher'" class="mb-2 flex items-center gap-2">
                    <span class="label-text text-sm font-medium text-secondary">ชั้นปี / ห้อง</span>
                    <span class="font-bold text-secondary">{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom
                        }}</span>
                </div>
            </div>
            <div
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto md:justify-end">
                <div class="md:w-auto mb-2 md:mb-0 w-full">
                    <select v-model="viewMode" @change="handleViewModeChange"
                        class="select select-xs sm:select-sm select-bordered w-full md:w-auto">
                        <option value="week">รายอาทิตย์</option>
                        <option value="month">รายเดือน</option>
                    </select>
                </div>
                <div v-if="viewMode === 'week'" class="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                    <button @click="navigateWeek(-1)" class="btn btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span class="text-sm whitespace-nowrap text-white">{{ weekLabel }}</span>
                    <button @click="navigateWeek(1)" class="btn btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <span v-if="primaryLoading" class="loading loading-spinner loading-xs"></span>
                </div>
                <div v-else-if="viewMode === 'month'" class="flex items-center gap-1 sm:gap-2 w-full md:w-auto">
                    <button @click="navigateMonth(-1)" class="btn btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span class="text-sm whitespace-nowrap text-white">{{ monthLabel }}</span>
                    <button @click="navigateMonth(1)" class="btn btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <span v-if="primaryLoading" class="loading loading-spinner loading-xs"></span>
                </div>

                <button v-if="!isMdOrLess" @click="toggleCompare" class="btn btn-xs sm:btn-sm btn-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {{ compareMode ? 'ปิดการเปรียบเทียบ' : 'เปรียบเทียบ' }}
                </button>
            </div>
        </div>

        <div :class="['grid', compareMode && !isMdOrLess ? 'lg:grid-cols-2' : 'lg:grid-cols-1', 'gap-4 md:gap-6']">
            <div class="space-y-4">
                <div v-if="primary.data" class="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                    <div class="stat bg-base-100 shadow rounded-lg p-3">
                        <div class="stat-title text-xs">นักเรียนทั้งหมด</div>
                        <div class="stat-value text-2xl text-primary">{{ primary.data.total_students || 0 }}</div>
                    </div>
                    <div class="stat bg-base-100 shadow rounded-lg p-3">
                        <div class="stat-title text-xs">ครูทั้งหมด</div>
                        <div class="stat-value text-2xl text-secondary">{{ primary.data.total_teachers || 0 }}</div>
                    </div>
                </div>

                <div v-if="primary.stats" class="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                    <div class="card bg-primary/100 shadow-sm p-3">
                        <div class="text-xs font-medium text-white">วันที่เข้ามากที่สุด</div>
                        <div class="text-lg font-bold text-warning">{{ primary.stats.maxDay.date }}</div>
                        <div class="text-xs text-base-content/70 text-white">{{ primary.stats.maxDay.total }} คน</div>
                    </div>
                    <div class="card bg-warning/100 shadow-sm p-3">
                        <div class="text-xs font-medium text-white">วันที่สายมากที่สุด</div>
                        <div class="text-lg font-bold text-primary">{{ primary.stats.maxLateDay.date }}</div>
                        <div class="text-xs text-base-content/70 text-white">{{ primary.stats.maxLateDay.late }} คน
                        </div>
                    </div>
                </div>

                <div v-if="primary.data" class="bg-base-100 rounded-lg shadow-lg p-1 sm:p-2 md:p-4">
                    <div class="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                        <h3 class="font-semibold text-xs sm:text-sm md:text-base">กราฟ</h3>
                        <select v-model="primary.chartType" @change="buildPrimaryChart"
                            class="select select-xs sm:select-sm select-bordered">
                            <option value="bar">กราฟแท่ง</option>
                            <option value="line">กราฟเส้น</option>
                        </select>
                    </div>
                    <div class="h-80 sm:h-48 md:h-80 transition-all duration-300">
                        <canvas ref="primaryChartRef"></canvas>
                    </div>
                </div>
            </div>

            <div v-if="compareMode && !isMdOrLess" class="space-y-1 sm:space-y-2 md:space-y-4">
                <div class="bg-base-100 rounded-lg shadow-lg p-1 sm:p-2 md:p-4">
                    <div class="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                        <h2 class="text-xs sm:text-base md:text-lg font-semibold">ช่วงที่ 2 (เปรียบเทียบ)</h2>
                        <div class="flex items-center gap-2">
                            <div v-if="viewMode === 'week'" class="flex items-center gap-2">
                                <button @click="navigateCompareWeek(-1)" class="btn btn-xs btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span class="text-sm whitespace-nowrap">{{ compareWeekLabel }}</span>
                                <button @click="navigateCompareWeek(1)" class="btn btn-xs btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <span v-if="compareLoading" class="loading loading-spinner loading-xs"></span>
                            </div>
                            <div v-else-if="viewMode === 'month'" class="flex items-center gap-2">
                                <button @click="navigateCompareMonth(-1)" class="btn btn-xs btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span class="text-sm whitespace-nowrap">{{ compareMonthLabel }}</span>
                                <button @click="navigateCompareMonth(1)" class="btn btn-xs btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <span v-if="compareLoading" class="loading loading-spinner loading-xs"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="compare.stats" class="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3">
                    <div class="card bg-success/10 shadow-sm p-3">
                        <div class="text-xs font-medium">วันที่เข้ามากที่สุด</div>
                        <div class="text-lg font-bold text-success">{{ compare.stats.maxDay.date }}</div>
                        <div class="text-xs text-base-content/70">{{ compare.stats.maxDay.total }} คน</div>
                    </div>
                    <div class="card bg-warning/10 shadow-sm p-3">
                        <div class="text-xs font-medium">วันที่สายมากที่สุด</div>
                        <div class="text-lg font-bold text-warning">{{ compare.stats.maxLateDay.date }}</div>
                        <div class="text-xs text-base-content/70">{{ compare.stats.maxLateDay.late }} คน</div>
                    </div>
                </div>

                <div v-if="compare.data" class="bg-base-100 rounded-lg shadow-lg p-1 sm:p-2 md:p-4">
                    <div class="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                        <h3 class="font-semibold text-xs sm:text-sm md:text-base">กราฟ</h3>
                        <select v-model="compare.chartType" @change="buildCompareChart"
                            class="select select-xs sm:select-sm select-bordered">
                            <option value="bar">กราฟแท่ง</option>
                            <option value="line">กราฟเส้น</option>
                        </select>
                    </div>
                    <div class="h-80 sm:h-48 md:h-80 transition-all duration-300">
                        <canvas ref="compareChartRef"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import reportApi from '../../api/report.js'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const residentRole = localStorage.getItem('residentRole') || ''
const teacherGrade = localStorage.getItem('grade') || ''
const teacherClassroom = localStorage.getItem('classroom') || ''

const compareMode = ref(false)
const primaryLoading = ref(false)
const compareLoading = ref(false)
const viewMode = ref('week')

const currentWeekStart = ref(new Date())
const currentMonthDate = ref(new Date())
const compareWeekStart = ref(new Date())
const compareMonthDate = ref(new Date())

const primary = ref({
    startDate: '',
    endDate: '',
    chartType: 'bar',
    data: null,
    stats: null
})

const compare = ref({
    startDate: '',
    endDate: '',
    chartType: 'bar',
    data: null,
    stats: null
})

const primaryChartRef = ref(null)
const compareChartRef = ref(null)
let primaryChart = null
let compareChart = null

function getUtilityBgColor(className) {
    const el = document.createElement('div')
    el.className = className
    el.style.display = 'none'
    document.body.appendChild(el)
    const color = getComputedStyle(el).backgroundColor
    document.body.removeChild(el)
    return color || 'rgba(0,0,0,1)'
}

function getThemeColors() {
    const primary = getUtilityBgColor('bg-primary')
    const primaryLight = getUtilityBgColor('bg-primary/70')
    const secondary = getUtilityBgColor('bg-secondary')
    const secondaryLight = getUtilityBgColor('bg-secondary/70')
    return { primary, primaryLight, secondary, secondaryLight }
}

function getMonday(d) {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
}

function getSunday(monday) {
    const date = new Date(monday)
    date.setDate(date.getDate() + 6)
    return date
}

function getFirstDayOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

function getLastDayOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function formatDate(date) {
    return date.toISOString().split('T')[0]
}

function formatDateThai(date) {
    const d = new Date(date)
    return d.toLocaleDateString('th-TH-u-ca-buddhist', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

function getThaiMonth(monthIndex) {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
    return months[monthIndex]
}

const weekLabel = computed(() => {
    if (viewMode.value !== 'week') return ''
    const monday = getMonday(currentWeekStart.value)
    const sunday = getSunday(monday)
    return `${formatDateThai(monday)} - ${formatDateThai(sunday)}`
})

const monthLabel = computed(() => {
    if (viewMode.value !== 'month') return ''
    const date = new Date(currentMonthDate.value)
    return `${getThaiMonth(date.getMonth())} ${date.getFullYear() + 543}`
})

const compareWeekLabel = computed(() => {
    if (viewMode.value !== 'week') return ''
    const monday = getMonday(compareWeekStart.value)
    const sunday = getSunday(monday)
    return `${formatDateThai(monday)} - ${formatDateThai(sunday)}`
})

const compareMonthLabel = computed(() => {
    if (viewMode.value !== 'month') return ''
    const date = new Date(compareMonthDate.value)
    return `${getThaiMonth(date.getMonth())} ${date.getFullYear() + 543}`
})

function initializeCurrentWeek() {
    const monday = getMonday(new Date())
    currentWeekStart.value = monday
    const sunday = getSunday(monday)
    primary.value.startDate = formatDate(monday)
    primary.value.endDate = formatDate(sunday)
}

function initializeCurrentMonth() {
    const now = new Date()
    currentMonthDate.value = now
    primary.value.startDate = formatDate(getFirstDayOfMonth(now))
    primary.value.endDate = formatDate(getLastDayOfMonth(now))
}

function navigateWeek(direction) {
    const monday = getMonday(currentWeekStart.value)
    monday.setDate(monday.getDate() + (direction * 7))
    currentWeekStart.value = monday
    const sunday = getSunday(monday)
    primary.value.startDate = formatDate(monday)
    primary.value.endDate = formatDate(sunday)
}

function navigateMonth(direction) {
    const date = new Date(currentMonthDate.value)
    date.setMonth(date.getMonth() + direction)
    currentMonthDate.value = date
    primary.value.startDate = formatDate(getFirstDayOfMonth(date))
    primary.value.endDate = formatDate(getLastDayOfMonth(date))
}

function navigateCompareWeek(direction) {
    const monday = getMonday(compareWeekStart.value)
    monday.setDate(monday.getDate() + (direction * 7))
    compareWeekStart.value = monday
    const sunday = getSunday(monday)
    compare.value.startDate = formatDate(monday)
    compare.value.endDate = formatDate(sunday)
}

function navigateCompareMonth(direction) {
    const date = new Date(compareMonthDate.value)
    date.setMonth(date.getMonth() + direction)
    compareMonthDate.value = date
    compare.value.startDate = formatDate(getFirstDayOfMonth(date))
    compare.value.endDate = formatDate(getLastDayOfMonth(date))
}

function handleViewModeChange() {
    if (viewMode.value === 'week') {
        initializeCurrentWeek()
    } else {
        initializeCurrentMonth()
    }
    if (compareMode.value) {
        compareMode.value = false
        compare.value.data = null
        compare.value.stats = null
        if (compareChart) compareChart.destroy()
    }
}

function toggleCompare() {
    compareMode.value = !compareMode.value
    if (compareMode.value) {
        if (viewMode.value === 'week') {
            const nextMonday = new Date(currentWeekStart.value)
            nextMonday.setDate(nextMonday.getDate() + 7)
            compareWeekStart.value = nextMonday
            const nextSunday = getSunday(nextMonday)
            compare.value.startDate = formatDate(nextMonday)
            compare.value.endDate = formatDate(nextSunday)
        } else if (viewMode.value === 'month') {
            const nextMonth = new Date(currentMonthDate.value)
            nextMonth.setMonth(nextMonth.getMonth() + 1)
            compareMonthDate.value = nextMonth
            compare.value.startDate = formatDate(getFirstDayOfMonth(nextMonth))
            compare.value.endDate = formatDate(getLastDayOfMonth(nextMonth))
        }
    } else {
        compare.value.data = null
        compare.value.stats = null
        if (compareChart) compareChart.destroy()
    }
}

async function fetchPrimaryStats() {
    primaryLoading.value = true
    try {
        const response = await reportApi.getDailyStats(primary.value.startDate, primary.value.endDate)
        if (response.message === 'Success') {
            primary.value.data = response.data
            primary.value.stats = computeStats(response.data.daily_stats)
            buildPrimaryChart()
        }
    } catch (e) {
        console.error('Primary stats error', e)
    } finally {
        primaryLoading.value = false
    }
}

async function fetchCompareStats() {
    compareLoading.value = true
    try {
        const response = await reportApi.getDailyStats(compare.value.startDate, compare.value.endDate)
        if (response.message === 'Success') {
            compare.value.data = response.data
            compare.value.stats = computeStats(response.data.daily_stats)
            buildCompareChart()
        }
    } catch (e) {
        console.error('Compare stats error', e)
    } finally {
        compareLoading.value = false
    }
}

function computeStats(dailyStats) {
    if (!dailyStats || dailyStats.length === 0) {
        return {
            maxDay: { date: '-', total: 0 },
            minDay: { date: '-', total: 0 },
            maxLateDay: { date: '-', late: 0 },
            minLateDay: { date: '-', late: 0 }
        }
    }

    const dayTotals = {}
    const dayLates = {}

    dailyStats.forEach(s => {
        if (!dayTotals[s.date]) dayTotals[s.date] = 0
        if (!dayLates[s.date]) dayLates[s.date] = 0
        dayTotals[s.date] += s.total
        dayLates[s.date] += s.late
    })

    const totalEntries = Object.entries(dayTotals)
    const lateEntries = Object.entries(dayLates)

    const maxDay = totalEntries.reduce((a, b) => (b[1] > a[1] ? b : a), totalEntries[0])
    const minDay = totalEntries.reduce((a, b) => (b[1] < a[1] ? b : a), totalEntries[0])
    const maxLateDay = lateEntries.reduce((a, b) => (b[1] > a[1] ? b : a), lateEntries[0])
    const minLateDay = lateEntries.reduce((a, b) => (b[1] < a[1] ? b : a), lateEntries[0])

    const formatDisplayDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-'
        return new Date(dateStr).toLocaleDateString('th-TH-u-ca-buddhist', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return {
        maxDay: { date: formatDisplayDate(maxDay[0]), total: maxDay[1] },
        minDay: { date: formatDisplayDate(minDay[0]), total: minDay[1] },
        maxLateDay: { date: formatDisplayDate(maxLateDay[0]), late: maxLateDay[1] },
        minLateDay: { date: formatDisplayDate(minLateDay[0]), late: minLateDay[1] }
    }
}

function formatLabelDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (window.innerWidth <= 768) {
        return date.toLocaleDateString('th-TH-u-ca-buddhist', {
            day: 'numeric',
            month: 'short'
        })
    }
    return date.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function buildPrimaryChart() {
    if (!primaryChartRef.value || !primary.value.data) return
    if (primaryChart) primaryChart.destroy()

    const ChartLib = window.Chart
    if (!ChartLib) return

    const dailyStats = primary.value.data.daily_stats || []
    const dates = [...new Set(dailyStats.map(s => s.date))].sort()

    const map = {}
    dailyStats.forEach(s => { map[`${s.role}_${s.date}`] = s })


    const studentOntime = []
    const studentLate = []
    const teacherOntime = []
    const teacherLate = []

    const studentNotScan = []
    const teacherNotScan = []

    const totalStudents = primary.value.data?.total_students || 0
    const totalTeachers = primary.value.data?.total_teachers || 0

    dates.forEach(date => {
        const stu = map[`student_${date}`]
        const tea = map[`teacher_${date}`]
        const stuLate = stu ? stu.late : 0
        const stuTotal = stu ? stu.total : 0
        const teaLate = tea ? tea.late : 0
        const teaTotal = tea ? tea.total : 0
        studentLate.push(stuLate)
        studentOntime.push(Math.max(stuTotal - stuLate, 0))
        teacherLate.push(teaLate)
        teacherOntime.push(Math.max(teaTotal - teaLate, 0))
        const notScanStudent = Math.max(totalStudents - stuTotal, 0)
        const notScanTeacher = Math.max(totalTeachers - teaTotal, 0)
        studentNotScan.push(notScanStudent)
        teacherNotScan.push(notScanTeacher)
    })

    const { primary: primaryColor, secondary: secondaryColor } = getThemeColors()
    const black = 'rgba(0,0,0,0.85)'
    const blue = 'rgba(59, 130, 246, 0.9)'
    const yellow = 'rgba(234, 179, 8, 0.9)'
    const red = 'rgba(220,38,38,0.85)'



    let datasets = [
        { label: 'นักเรียน (ตรงเวลา)', data: studentOntime, backgroundColor: primaryColor, borderColor: primaryColor },
        { label: 'นักเรียน (สาย)', data: studentLate, backgroundColor: black, borderColor: black },
        { label: 'นักเรียน (ไม่ได้สแกน)', data: studentNotScan, backgroundColor: red, borderColor: red },
        { label: 'ครู (ตรงเวลา)', data: teacherOntime, backgroundColor: secondaryColor, borderColor: secondaryColor },
        { label: 'ครู (สาย)', data: teacherLate, backgroundColor: black, borderColor: black },
        { label: 'ครู (ไม่ได้สแกน)', data: teacherNotScan, backgroundColor: red, borderColor: red }
    ]

    if (primary.value.chartType === 'line') {
        const toFill = (color, alpha) => {
            if (color.startsWith('rgba')) {
                const parts = color.replace(/rgba\(|\)/g, '').split(',').map(p => p.trim())
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
            }
            if (color.startsWith('rgb')) {
                const parts = color.replace(/rgb\(|\)/g, '').split(',').map(p => p.trim())
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
            }
            return color
        }
        datasets.forEach(ds => {
            if (ds.label === 'นักเรียน (ตรงเวลา)') {
                ds.borderColor = blue
            } else if (ds.label === 'ครู (ตรงเวลา)') {
                ds.borderColor = yellow
            }

            ds.fill = 'origin'
            ds.borderWidth = 2
            ds.tension = 0.4
            ds.pointRadius = 0
            ds.pointHoverRadius = 0
            const isLate = /สาย/.test(ds.label)
            const alpha = isLate ? 0.22 : 0.18
            ds.backgroundColor = toFill(ds.borderColor, alpha)
        })
    }


    const groupLabelPlugin = {
        id: 'groupLabelPlugin',
        afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart
            if (!ctx || !chartArea) return
            // if (window.innerWidth < 640) return
            if (chart.data.datasets.length < 6) return
            const days = chart.data.labels.length
            for (let i = 0; i < days; i++) {
                const metaStu0 = chart.getDatasetMeta(0)
                const metaStu2 = chart.getDatasetMeta(2)
                const barStu0 = metaStu0.data[i]
                const barStu2 = metaStu2.data[i]
                if (!barStu0 || !barStu2) continue
                const stuLeft = Math.min(barStu0.x, barStu2.x) - barStu0.width / 2
                const stuRight = Math.max(barStu0.x, barStu2.x) + barStu2.width / 2
                const metaTea3 = chart.getDatasetMeta(3)
                const metaTea5 = chart.getDatasetMeta(5)
                const barTea3 = metaTea3.data[i]
                const barTea5 = metaTea5.data[i]
                if (!barTea3 || !barTea5) continue
                const teaLeft = Math.min(barTea3.x, barTea5.x) - barTea3.width / 2
                const teaRight = Math.max(barTea3.x, barTea5.x) + barTea5.width / 2
                const marginX = 1;
                const marginY = 1;
                ctx.save()
                ctx.strokeStyle = '#eff6ff'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    stuLeft - marginX,
                    chartArea.top - marginY,
                    (stuRight - stuLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()
                ctx.save()
                ctx.strokeStyle = '#fefce8'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    teaLeft - marginX,
                    chartArea.top - marginY,
                    (teaRight - teaLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()
                if (window.innerWidth >= 640) {
                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('นักเรียน', (stuLeft + stuRight) / 2, chartArea.top + 30)
                    ctx.restore()

                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('ครู', (teaLeft + teaRight) / 2, chartArea.top + 30)
                    ctx.restore()
                }
            }
        }
    }
    primaryChart = new ChartLib(primaryChartRef.value, {
        type: primary.value.chartType,
        data: { labels: dates.map(formatLabelDate), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (ctx) => {
                            const v = ctx.parsed.y || 0
                            return `${ctx.dataset.label}: ${Math.round(v)}`
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#222',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => value > 0 ? value : '',
                    display: true
                }
            },
            scales: {
                x: { stacked: false },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        callback: (v) => Math.round(v)
                    }
                }
            },
            layout: {
                padding: {
                    top: 40,
                }
            }
        },
        plugins: window.ChartDataLabels ? [groupLabelPlugin, window.ChartDataLabels] : []
    })
}

function buildCompareChart() {
    if (!compareChartRef.value || !compare.value.data) return
    if (compareChart) compareChart.destroy()

    const ChartLib = window.Chart
    if (!ChartLib) return

    const dailyStats = compare.value.data.daily_stats || []
    const dates = [...new Set(dailyStats.map(s => s.date))].sort()

    const map = {}
    dailyStats.forEach(s => { map[`${s.role}_${s.date}`] = s })


    const studentOntime = []
    const studentLate = []
    const teacherOntime = []
    const teacherLate = []

    const studentNotScan = []
    const teacherNotScan = []

    const totalStudents = compare.value.data?.total_students || 0
    const totalTeachers = compare.value.data?.total_teachers || 0

    dates.forEach(date => {
        const stu = map[`student_${date}`]
        const tea = map[`teacher_${date}`]
        const stuLate = stu ? stu.late : 0
        const stuTotal = stu ? stu.total : 0
        const teaLate = tea ? tea.late : 0
        const teaTotal = tea ? tea.total : 0
        studentLate.push(stuLate)
        studentOntime.push(Math.max(stuTotal - stuLate, 0))
        teacherLate.push(teaLate)
        teacherOntime.push(Math.max(teaTotal - teaLate, 0))
        const notScanStudent = Math.max(totalStudents - stuTotal, 0)
        const notScanTeacher = Math.max(totalTeachers - teaTotal, 0)
        studentNotScan.push(notScanStudent)
        teacherNotScan.push(notScanTeacher)
    })

    const { primary: primaryColor, secondary: secondaryColor } = getThemeColors()
    const black = 'rgba(0,0,0,0.85)'
    const blue = 'rgba(59, 130, 246, 0.9)'
    const yellow = 'rgba(234, 179, 8, 0.9)'
    const red = 'rgba(220,38,38,0.85)'



    let datasets = [
        { label: 'นักเรียน (ตรงเวลา)', data: studentOntime, backgroundColor: primaryColor, borderColor: primaryColor },
        { label: 'นักเรียน (สาย)', data: studentLate, backgroundColor: black, borderColor: black },
        { label: 'นักเรียน (ไม่ได้สแกน)', data: studentNotScan, backgroundColor: red, borderColor: red },
        { label: 'ครู (ตรงเวลา)', data: teacherOntime, backgroundColor: secondaryColor, borderColor: secondaryColor },
        { label: 'ครู (สาย)', data: teacherLate, backgroundColor: black, borderColor: black },
        { label: 'ครู (ไม่ได้สแกน)', data: teacherNotScan, backgroundColor: red, borderColor: red }
    ]

    if (compare.value.chartType === 'line') {
        const toFill = (color, alpha) => {
            if (color.startsWith('rgba')) {
                const parts = color.replace(/rgba\(|\)/g, '').split(',').map(p => p.trim())
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
            }
            if (color.startsWith('rgb')) {
                const parts = color.replace(/rgb\(|\)/g, '').split(',').map(p => p.trim())
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
            }
            return color
        }
        datasets.forEach(ds => {
            if (ds.label === 'นักเรียน (ตรงเวลา)') {
                ds.borderColor = blue
            } else if (ds.label === 'ครู (ตรงเวลา)') {
                ds.borderColor = yellow
            }

            ds.fill = 'origin'
            ds.borderWidth = 2
            ds.tension = 0.4
            ds.pointRadius = 0
            ds.pointHoverRadius = 0
            const isLate = /สาย/.test(ds.label)
            const alpha = isLate ? 0.22 : 0.18
            ds.backgroundColor = toFill(ds.borderColor, alpha)
        })
    }

    const groupLabelPlugin = {
        id: 'groupLabelPlugin',
        afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart
            if (!ctx || !chartArea) return
            if (chart.data.datasets.length < 6) return
            const days = chart.data.labels.length
            for (let i = 0; i < days; i++) {
                const metaStu0 = chart.getDatasetMeta(0)
                const metaStu2 = chart.getDatasetMeta(2)
                const barStu0 = metaStu0.data[i]
                const barStu2 = metaStu2.data[i]
                if (!barStu0 || !barStu2) continue
                const stuLeft = Math.min(barStu0.x, barStu2.x) - barStu0.width / 2
                const stuRight = Math.max(barStu0.x, barStu2.x) + barStu2.width / 2
                const metaTea3 = chart.getDatasetMeta(3)
                const metaTea5 = chart.getDatasetMeta(5)
                const barTea3 = metaTea3.data[i]
                const barTea5 = metaTea5.data[i]
                if (!barTea3 || !barTea5) continue
                const teaLeft = Math.min(barTea3.x, barTea5.x) - barTea3.width / 2
                const teaRight = Math.max(barTea3.x, barTea5.x) + barTea5.width / 2
                const marginX = 1;
                const marginY = 1;
                ctx.save()
                ctx.strokeStyle = '#eff6ff'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    stuLeft - marginX,
                    chartArea.top - marginY,
                    (stuRight - stuLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()
                ctx.save()
                ctx.strokeStyle = '#fefce8'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    teaLeft - marginX,
                    chartArea.top - marginY,
                    (teaRight - teaLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()
                if (window.innerWidth >= 640) {
                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('นักเรียน', (stuLeft + stuRight) / 2, chartArea.top + 30)
                    ctx.restore()

                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('ครู', (teaLeft + teaRight) / 2, chartArea.top + 30)
                    ctx.restore()
                }
            }
        }
    }
    compareChart = new ChartLib(compareChartRef.value, {
        type: compare.value.chartType,
        data: { labels: dates.map(formatLabelDate), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (ctx) => {
                            const v = ctx.parsed.y || 0
                            return `${ctx.dataset.label}: ${Math.round(v)}`
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#222',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => value > 0 ? value : '',
                    display: true
                }
            },
            scales: {
                x: { stacked: false },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        callback: (v) => Math.round(v)
                    }
                }
            },
            layout: {
                padding: {
                    top: 40,
                }
            }
        },
        plugins: window.ChartDataLabels ? [groupLabelPlugin, window.ChartDataLabels] : []
    })
}

const isMdOrLess = ref(window.innerWidth <= 768)
const handleResize = () => {
    isMdOrLess.value = window.innerWidth <= 768
    if (isMdOrLess.value && compareMode.value) {
        compareMode.value = false
    }
}
onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

onMounted(async () => {
    const Chart = (await import('chart.js/auto')).default
    const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default
    window.Chart = Chart
    window.ChartDataLabels = ChartDataLabels
    initializeCurrentWeek()
    fetchPrimaryStats()
})

watch(() => primary.value.startDate, () => {
    if (primary.value.startDate && primary.value.endDate) {
        fetchPrimaryStats()
    }
})

watch(() => primary.value.endDate, () => {
    if (primary.value.startDate && primary.value.endDate) {
        fetchPrimaryStats()
    }
})

watch(() => compare.value.startDate, () => {
    if (compare.value.startDate && compare.value.endDate && compareMode.value) {
        fetchCompareStats()
    }
})

watch(() => compare.value.endDate, () => {
    if (compare.value.startDate && compare.value.endDate && compareMode.value) {
        fetchCompareStats()
    }
})

onUnmounted(() => {
    if (primaryChart) primaryChart.destroy()
    if (compareChart) compareChart.destroy()
})
</script>

<style scoped></style>