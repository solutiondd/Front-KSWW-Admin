<template>
    <div class="space-y-4">
        <div class="flex justify-end">
            <button class="btn btn-sm btn-success text-white"
                :disabled="loadingExport || loading || isBatchLoading || !students.length" @click="exportToExcel">
                <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ส่งออก Excel
            </button>
        </div>

        <!-- Desktop Table (md ขึ้นไป) -->
        <div class="hidden md:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table table-zebra w-full">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th class="text-center">ลำดับ</th>
                        <th class="text-center">รหัส</th>
                        <th>ชื่อ</th>
                        <th class="text-center">วันทั้งหมด</th>
                        <th class="text-center">มา</th>
                        <th class="text-center">สาย</th>
                        <th class="text-center">ลา</th>
                        <th class="text-center">กิจกรรม</th>
                        <th class="text-center">ขาด</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="loading || isBatchLoading">
                        <tr v-for="i in 5" :key="'skeleton-' + i" class="border-b border-gray-200 bg-gray-50">
                            <td class="py-3 px-4">
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-16 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-28 skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                            <td>
                                <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr v-if="pagedStudents.length === 0">
                            <td colspan="9" class="text-center py-8 text-base-content/60">ไม่พบข้อมูล</td>
                        </tr>
                        <tr v-for="(student, index) in pagedStudents" :key="student.userid" class="hover">
                            <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                            <td class="text-center">{{ student.userid }}</td>
                            <td>{{ student.name }}</td>
                            <td class="text-center">{{ totalDays }}</td>
                            <template v-if="rowStats[student.userid]?.loading">
                                <td colspan="5" class="text-center">
                                    <div class="h-5 bg-gray-200 rounded w-full mx-auto skeleton-pulse"></div>
                                </td>
                            </template>
                            <template v-else>
                                <td class="text-center">{{ rowStats[student.userid]?.present ?? '-' }}</td>
                                <td class="text-center">{{ rowStats[student.userid]?.late ?? '-' }}</td>
                                <td class="text-center">{{ rowStats[student.userid]?.leave ?? '-' }}</td>
                                <td class="text-center">{{ rowStats[student.userid]?.activity ?? '-' }}</td>
                                <td class="text-center">{{ rowStats[student.userid]?.absent ?? '-' }}</td>
                            </template>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <div class="md:hidden space-y-3">
            <template v-if="loading || isBatchLoading">
                <div v-for="i in 5" :key="'card-skel-' + i"
                    class="bg-base-100 rounded-lg shadow-md p-4 space-y-3 border border-base-200">
                    <div class="flex justify-between items-center">
                        <div class="h-5 bg-gray-200 rounded w-1/2 skeleton-pulse"></div>
                        <div class="h-5 bg-gray-200 rounded w-16 skeleton-pulse"></div>
                    </div>
                    <div class="grid grid-cols-5 gap-2">
                        <div v-for="c in 5" :key="c" class="h-12 bg-gray-200 rounded skeleton-pulse"></div>
                    </div>
                    <div class="h-2 bg-gray-200 rounded w-full skeleton-pulse"></div>
                </div>
            </template>
            <template v-else>
                <div v-if="pagedStudents.length === 0"
                    class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow">
                    ไม่พบข้อมูล
                </div>

                <div v-for="(student, index) in pagedStudents" :key="'card-' + student.userid"
                    class="bg-base-100 rounded-lg shadow-md p-4 space-y-3 border border-base-200">
                    <div class="flex justify-between items-start gap-2">
                        <div class="flex items-center gap-2 flex-1 min-w-0">
                            <span class="badge badge-neutral badge-sm flex-shrink-0">
                                #{{ (page - 1) * limit + index + 1 }}
                            </span>
                            <span class="font-bold text-sm sm:text-base truncate text-base-content">
                                {{ student.name }}
                            </span>
                        </div>
                        <span class="badge badge-primary badge-sm flex-shrink-0">
                            {{ student.userid }}
                        </span>
                    </div>

                    <template v-if="rowStats[student.userid]?.loading">
                        <div class="h-12 bg-gray-200 rounded w-full skeleton-pulse"></div>
                    </template>
                    <template v-else>
                        <div class="grid grid-cols-5 gap-1.5 text-center text-xs">
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-1.5">
                                <span class="text-blue-700 block font-medium">มา</span>
                                <span class="text-blue-800 font-bold text-sm">
                                    {{ rowStats[student.userid]?.present ?? '-' }}
                                </span>
                            </div>
                            <div class="bg-gray-50 border border-gray-200 rounded-lg p-1.5">
                                <span class="text-gray-700 block font-medium">สาย</span>
                                <span class="text-gray-800 font-bold text-sm">
                                    {{ rowStats[student.userid]?.late ?? '-' }}
                                </span>
                            </div>
                            <div class="bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                                <span class="text-amber-700 block font-medium">ลา</span>
                                <span class="text-amber-800 font-bold text-sm">
                                    {{ rowStats[student.userid]?.leave ?? '-' }}
                                </span>
                            </div>
                            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-1.5">
                                <span class="text-indigo-700 block font-medium">กิจกรรม</span>
                                <span class="text-indigo-800 font-bold text-sm">
                                    {{ rowStats[student.userid]?.activity ?? '-' }}
                                </span>
                            </div>
                            <div class="bg-rose-50 border border-rose-200 rounded-lg p-1.5">
                                <span class="text-rose-700 block font-medium">ขาด</span>
                                <span class="text-rose-800 font-bold text-sm">
                                    {{ rowStats[student.userid]?.absent ?? '-' }}
                                </span>
                            </div>
                        </div>

                        <div class="space-y-1 pt-1">
                            <div class="flex justify-between text-xs text-base-content/70">
                                <span>วันทั้งหมด: <b class="text-base-content">{{ totalDays }}</b> วัน</span>
                                <span class="text-emerald-600 font-semibold">
                                    มาเรียน {{ getAttendancePercent(student.userid) }}%
                                </span>
                            </div>
                            <div class="flat-bar-container">
                                <div class="flat-fill-green"
                                    :style="{ width: getAttendancePercent(student.userid) + '%' }"></div>
                                <div class="flat-fill-red"
                                    :style="{ width: (100 - getAttendancePercent(student.userid)) + '%' }"></div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </div>

        <div class="mt-4 space-y-3">
            <div v-if="totalPages > 1" class="flex justify-center">
                <div class="join bg-white">
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="goToPage(page - 1)"
                        :disabled="page === 1">
                        ‹
                    </button>
                    <button v-for="p in displayedPages" :key="p" class="join-item btn btn-sm border-none"
                        :class="p === page ? 'bg-base-content/20 font-bold' : 'bg-transparent'" @click="goToPage(p)">
                        {{ p }}
                    </button>
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="goToPage(page + 1)"
                        :disabled="page === totalPages">
                        ›
                    </button>
                </div>
            </div>

            <div v-if="students.length > 0" class="text-center text-sm text-base-content/60 text-white">
                ทั้งหมด {{ students.length }} รายการ (หน้า {{ page }} / {{ totalPages }})
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import { LeaveService } from '../../api/leave.js'
import { ActivityService } from '../../api/activity.js'

const props = defineProps({
    students: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    totalDays: { type: Number, default: 0 },
    term: { type: Object, default: null },
    holidays: { type: Array, default: () => [] },
    pageSize: { type: Number, default: 10 },
    filters: { type: Object, default: () => ({}) },
})

const leaveService = new LeaveService()
const activityService = new ActivityService()

const loadingExport = ref(false)
const isBatchLoading = ref(false)

const page = ref(1)
const limit = computed(() => props.pageSize || 10)

const totalPages = computed(() => Math.max(1, Math.ceil(props.students.length / limit.value)))

const pagedStudents = computed(() => {
    const start = (page.value - 1) * limit.value
    return props.students.slice(start, start + limit.value)
})

const displayedPages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const maxVisible = 5
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2))
    let endPage = Math.min(total, startPage + maxVisible - 1)
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }
    const pages = []
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    return pages
})

function goToPage(p) {
    if (p >= 1 && p <= totalPages.value) {
        page.value = p
    }
}

const rowStats = ref({})

function extractRows(response) {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.results)) return response.results
    return []
}

function normalizeDateKey(value) {
    return String(value || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
}

function isWeekdayDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return false
    }
    const dayOfWeek = date.getUTCDay()
    return dayOfWeek !== 0 && dayOfWeek !== 6
}

function isSchoolDate(dateKey, holidayDateSet) {
    return Boolean(dateKey) && isWeekdayDate(dateKey) && !holidayDateSet.has(dateKey)
}

function getSchoolDatesBetween(startValue, endValue, holidayDateSet) {
    const startKey = normalizeDateKey(startValue)
    const endKey = normalizeDateKey(endValue || startValue)
    if (!startKey || !endKey) return []

    const start = new Date(`${startKey}T00:00:00.000Z`)
    const end = new Date(`${endKey}T00:00:00.000Z`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return []

    const dates = []
    for (let timestamp = start.getTime(); timestamp <= end.getTime(); timestamp += 86400000) {
        const dateKey = new Date(timestamp).toISOString().slice(0, 10)
        if (isSchoolDate(dateKey, holidayDateSet)) dates.push(dateKey)
    }
    return dates
}

function isFullDayLeave(item) {
    return [item.start_time, item.end_time].every((time) => time == null || String(time).trim() === '')
}

async function fetchAllAttendance(params) {
    let all = []
    let p = 1
    let totalPages = 1
    const pLimit = 50
    do {
        const res = await reportApi.getAttendanceReport({ ...params, page: p, limit: pLimit })
        const rows = extractRows(res)
        all = all.concat(rows)
        totalPages = res?.total_pages || 1
        p++
    } while (p <= totalPages && p <= 5)
    return all
}

async function fetchAllLate(params) {
    let all = []
    let p = 1
    let totalPages = 1
    const pLimit = 50
    do {
        const res = await reportApi.getLateReport({ ...params, page: p, limit: pLimit })
        const rows = extractRows(res)
        all = all.concat(rows)
        totalPages = res?.total_pages || 1
        p++
    } while (p <= totalPages && p <= 5)
    return all
}

async function loadBatchStats() {
    if (!props.term?.start_date || !props.term?.end_date || !props.students.length) {
        return
    }

    isBatchLoading.value = true
    try {
        const search = String(props.filters?.search || '').trim()
        const isNumeric = /^\d+$/.test(search)
        const baseParams = {
            start: props.term.start_date,
            end: props.term.end_date,
            role: 'student',
            grade: props.filters?.grade || '',
            classroom: props.filters?.classroom || '',
            name: isNumeric ? '' : search,
            userid: isNumeric ? search : '',
        }

        const leaveFilters = {
            start_date: props.term.start_date,
            end_date: props.term.end_date,
            status: 'approved',
            role: 'student',
        }
        if (search) {
            leaveFilters.userid = search
        } else {
            leaveFilters.grade = props.filters?.grade || ''
            leaveFilters.classroom = props.filters?.classroom || ''
        }

        const activityFilters = {
            grade: props.filters?.grade || '',
            classroom: props.filters?.classroom || '',
            limit: 50,
        }
        if (search) {
            activityFilters.userid = search
        }

        const [attSettled, lateSettled, leaveSettled, actSettled] = await Promise.allSettled([
            fetchAllAttendance(baseParams),
            fetchAllLate(baseParams),
            leaveService.getLeaveRequests(leaveFilters),
            activityService.getActivities(props.term.start_date, props.term.end_date, activityFilters),
        ])

        if (attSettled.status === 'rejected') console.error('Batch attendance error:', attSettled.reason)
        if (lateSettled.status === 'rejected') console.error('Batch late error:', lateSettled.reason)
        if (leaveSettled.status === 'rejected') console.error('Batch leave error:', leaveSettled.reason)
        if (actSettled.status === 'rejected') console.error('Batch activity error:', actSettled.reason)

        const attRows = attSettled.status === 'fulfilled' ? attSettled.value : []
        const lateRows = lateSettled.status === 'fulfilled' ? lateSettled.value : []
        const leaveRows = leaveSettled.status === 'fulfilled' ? extractRows(leaveSettled.value) : []
        const actRows = actSettled.status === 'fulfilled' ? extractRows(actSettled.value) : []
        const holidayDateSet = new Set(
            props.holidays.map((holiday) => normalizeDateKey(holiday.date || holiday.start_date)).filter(Boolean)
        )

        const lateMap = new Map()
        for (const item of lateRows) {
            const uid = String(item.userid || '').trim()
            if (uid) {
                const lateDates = (Array.isArray(item.late_dates) ? item.late_dates : [])
                    .map((late) => normalizeDateKey(late.date))
                    .filter((date) => isSchoolDate(date, holidayDateSet))
                lateMap.set(uid, new Set(lateDates))
            }
        }

        const attMap = new Map()
        for (const item of attRows) {
            const uid = String(item.userid || '').trim()
            if (uid) {
                const lateDates = lateMap.get(uid) || new Set()
                const attendanceDates = (Array.isArray(item.attendances) ? item.attendances : [])
                    .map((attendance) => normalizeDateKey(attendance.date))
                    .filter((date) => isSchoolDate(date, holidayDateSet) && !lateDates.has(date))
                attMap.set(uid, new Set(attendanceDates).size)
            }
        }

        const leaveMap = new Map()
        for (const item of leaveRows) {
            const uid = String(item.user_id?.userid || item.user_id || '').trim()
            if (uid && isFullDayLeave(item)) {
                const leaveDates = leaveMap.get(uid) || new Set()
                for (const date of getSchoolDatesBetween(item.start_date, item.end_date, holidayDateSet)) {
                    leaveDates.add(date)
                }
                leaveMap.set(uid, leaveDates)
            }
        }

        const actMap = new Map()
        for (const item of actRows) {
            const uid = String(item.user_id?.userid || item.user_id || '').trim()
            if (uid) {
                const activityDates = actMap.get(uid) || new Set()
                for (const date of getSchoolDatesBetween(
                    item.activity_date_start || item.activity_date || item.date,
                    item.activity_date_end || item.activity_date_start || item.activity_date || item.date,
                    holidayDateSet
                )) {
                    activityDates.add(date)
                }
                actMap.set(uid, activityDates)
            }
        }

        const newStats = {}
        for (const student of props.students) {
            const uid = String(student.userid || '').trim()
            const present = attMap.get(uid) || 0
            const late = lateMap.get(uid)?.size || 0
            const leave = leaveMap.get(uid)?.size || 0
            const activity = actMap.get(uid)?.size || 0
            const absent = Math.max(0, props.totalDays - present - late - leave - activity)

            newStats[uid] = {
                present,
                late,
                leave,
                activity,
                absent,
                loading: false,
            }
        }

        rowStats.value = newStats
    } catch (e) {
        console.error('Error in loadBatchStats:', e)
    } finally {
        isBatchLoading.value = false
    }
}

function getAttendancePercent(userid) {
    if (!props.totalDays || props.totalDays <= 0) return 0
    const present = rowStats.value[userid]?.present
    if (typeof present !== 'number') return 0
    return Math.min(100, Math.max(0, Math.round((present / props.totalDays) * 100)))
}

async function exportToExcel() {
    if (loadingExport.value || !props.students.length || isBatchLoading.value) return
    loadingExport.value = true
    try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('SummaryReport')

        const termTitle = props.term?.term
            ? `${props.term.term} (${props.term.start_date} ถึง ${props.term.end_date})`
            : ''
        worksheet.addRow([`รายงานสรุปข้อมูลการเข้าเรียน ${termTitle}`])
        worksheet.mergeCells('A1:I1')
        const titleCell = worksheet.getCell('A1')
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        titleCell.font = { bold: true, size: 14 }
        worksheet.getRow(1).height = 28

        const headers = ['ลำดับ', 'รหัส', 'ชื่อ-สกุล', 'วันทั้งหมด', 'มา', 'สาย', 'ลา', 'กิจกรรม', 'ขาด']
        worksheet.addRow(headers)

        const headerRow = worksheet.getRow(2)
        headerRow.font = { bold: true }
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
        headerRow.height = 24

        props.students.forEach((student, index) => {
            const stats = rowStats.value[student.userid] || {}
            const rowData = [
                index + 1,
                student.userid || '-',
                student.name || '-',
                props.totalDays || 0,
                stats.present ?? 0,
                stats.late ?? 0,
                stats.leave ?? 0,
                stats.activity ?? 0,
                stats.absent ?? 0,
            ]
            worksheet.addRow(rowData)
        })

        const columnWidths = [10, 15, 30, 15, 12, 12, 12, 12, 12]
        worksheet.columns = columnWidths.map(width => ({ width }))

        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(2).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(3).alignment = { horizontal: 'left', vertical: 'middle' }
        worksheet.getColumn(4).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(5).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(6).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(7).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(8).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(9).alignment = { horizontal: 'center', vertical: 'middle' }

        const buffer = await workbook.xlsx.writeBuffer()
        const termName = props.term?.term || 'summary'
        const startDate = props.term?.start_date || ''
        const endDate = props.term?.end_date || ''
        saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `SummaryReport_${termName}_${startDate}_${endDate}.xlsx`
        )
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel')
        console.error('Export excel error:', e)
    } finally {
        loadingExport.value = false
    }
}

watch([() => props.students, () => props.term, () => props.totalDays, () => props.holidays], () => {
    loadBatchStats()
}, { immediate: true, deep: true })

watch(() => props.students, () => {
    page.value = 1
})

watch(() => props.pageSize, () => {
    page.value = 1
})
</script>

<style scoped>
.skeleton-pulse {
    animation: pulse 1.5s infinite ease-in-out;
    background-image: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
}

@keyframes pulse {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.btn.bg-transparent {
    background: transparent;
}

.bg-base-content\/20 {
    background-color: #e5e7eb !important;
}

.flat-bar-container {
    position: relative;
    width: 100%;
    height: 8px;
    background: #f1f5f9;
    border-radius: 9999px;
    overflow: hidden;
    display: flex;
    border: 1px solid #e2e8f0;
}

.flat-fill-green {
    background-color: #10b981;
    height: 100%;
    transition: width 0.4s ease-in-out;
}

.flat-fill-red {
    background-color: #f43f5e;
    height: 100%;
    transition: width 0.4s ease-in-out;
}
</style>

<style scoped>
.skeleton-pulse {
    animation: pulse 1.5s infinite ease-in-out;
    background-image: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
}

@keyframes pulse {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.btn.bg-transparent {
    background: transparent;
}

.bg-base-content\/20 {
    background-color: #e5e7eb !important;
}

.flat-bar-container {
    position: relative;
    width: 100%;
    height: 8px;
    background: #f1f5f9;
    border-radius: 9999px;
    overflow: hidden;
    display: flex;
    border: 1px solid #e2e8f0;
}

.flat-fill-green {
    background-color: #10b981;
    height: 100%;
    transition: width 0.4s ease-in-out;
}

.flat-fill-red {
    background-color: #f43f5e;
    height: 100%;
    transition: width 0.4s ease-in-out;
}
</style>
