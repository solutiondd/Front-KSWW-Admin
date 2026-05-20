<template>
    <div>
        <div class="flex justify-end mb-2">
            <button class="btn btn-sm btn-success" :disabled="loadingExport" @click="exportAllToExcel">
                <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ส่งออก Excel
            </button>
        </div>
        <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table table-zebra w-full">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th class="text-center">รหัส</th>
                        <th class="text-center">โปรไฟล์</th>
                        <th>ชื่อ-สกุล</th>
                        <th class="text-center">ตำแหน่ง</th>
                        <th class="text-center">ชั้นเรียน/แผนก</th>
                        <th class="text-center">วันที่</th>
                        <th class="text-center">เข้า</th>
                        <th v-if="featureFlags.attendance.enableLineupColumn" class="text-center">เข้าแถว</th>
                        <th class="text-center">ออก</th>
                        <th class="text-center">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="data.length === 0">
                        <td colspan="10" class="text-center py-8 text-base-content/60">
                            ไม่พบข้อมูล
                        </td>
                    </tr>
                    <template v-for="item in data" :key="item._id">
                        <template v-if="item.attendances && item.attendances.length > 0">
                            <tr class="hover" :key="item._id + '-first'">
                                <td class="text-center">{{ item.userid }}</td>
                                <td class="text-center">
                                    <div v-if="item.picture" class="avatar cursor-pointer inline-flex"
                                        @click="openImage(item.picture)">
                                        <div class="w-10 h-10 rounded">
                                            <img :src="`${imgProBaseUrl}${item.picture}`" alt="profile"
                                                @error="item.picture = null" />
                                        </div>
                                    </div>
                                    <div v-else class="avatar placeholder inline-flex">
                                        <div
                                            class="bg-neutral text-neutral-content w-10 h-10 rounded flex items-center justify-center">
                                            <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ item.name }}</td>
                                <td class="text-center">{{ item.position }}</td>
                                <td class="text-center">
                                    <span v-if="item.department">{{ item.department }}</span>
                                    <span v-else>{{ item.grade }}/{{ item.classroom }}</span>
                                </td>
                                <td class="text-center">{{ formatDate(item.attendances[0].date) }}</td>
                                <td class="text-center">
                                    <span v-if="extractAttendanceByUsecase(item.attendances[0]).entry"
                                        class="badge badge-success badge-sm">{{
                                            extractAttendanceByUsecase(item.attendances[0]).entry.time }}</span>
                                    <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                </td>
                                <td v-if="featureFlags.attendance.enableLineupColumn" class="text-center">
                                    <span v-if="extractAttendanceByUsecase(item.attendances[0]).lineup"
                                        class="badge badge-success badge-sm">{{
                                            extractAttendanceByUsecase(item.attendances[0]).lineup.time }}</span>
                                    <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                </td>
                                <td class="text-center">
                                    <span v-if="extractAttendanceByUsecase(item.attendances[0]).exit"
                                        class="badge badge-success badge-sm">{{
                                            extractAttendanceByUsecase(item.attendances[0]).exit.time }}</span>
                                    <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                </td>
                                <td class="text-center">
                                    <button @click="$emit('viewDetail', item, item.attendances[0])"
                                        class="btn btn-sm btn-info btn-outline">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                            <template v-for="(att, attIdx) in item.attendances" :key="att.date + '-' + attIdx">
                                <tr v-if="attIdx > 0" class="hover">
                                    <td class="text-center"></td>
                                    <td class="text-center"></td>
                                    <td></td>
                                    <td class="text-center"></td>
                                    <td class="text-center"></td>
                                    <td class="text-center">{{ formatDate(att.date) }}</td>
                                    <td class="text-center">
                                        <span v-if="extractAttendanceByUsecase(att).entry"
                                            class="badge badge-success badge-sm">{{
                                                extractAttendanceByUsecase(att).entry.time }}</span>
                                        <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                    </td>
                                    <td v-if="featureFlags.attendance.enableLineupColumn" class="text-center">
                                        <span v-if="extractAttendanceByUsecase(att).lineup"
                                            class="badge badge-success badge-sm">{{
                                                extractAttendanceByUsecase(att).lineup.time }}</span>
                                        <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                    </td>
                                    <td class="text-center">
                                        <span v-if="extractAttendanceByUsecase(att).exit"
                                            class="badge badge-success badge-sm">{{
                                                extractAttendanceByUsecase(att).exit.time }}</span>
                                        <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                                    </td>
                                    <td class="text-center">
                                        <button @click="$emit('viewDetail', item, att)"
                                            class="btn btn-sm btn-info btn-outline">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </template>
                        <tr v-else class="hover">
                            <td class="text-center">{{ item.userid }}</td>
                            <td class="text-center">
                                <div v-if="item.picture" class="avatar cursor-pointer inline-flex"
                                    @click="openImage(item.picture)">
                                    <div class="w-10 h-10 rounded">
                                        <img :src="`${imgProBaseUrl}${item.picture}`" alt="profile"
                                            @error="item.picture = null" />
                                    </div>
                                </div>
                                <div v-else class="avatar placeholder inline-flex">
                                    <div
                                        class="bg-neutral text-neutral-content w-10 h-10 rounded flex items-center justify-center">
                                        <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                                    </div>
                                </div>
                            </td>
                            <td>{{ item.name }}</td>
                            <td class="text-center">{{ item.position }}</td>
                            <td class="text-center">
                                <span v-if="item.department">{{ item.department }}</span>
                                <span v-else>{{ item.grade }}/{{ item.classroom }}</span>
                            </td>
                            <td class="text-center">-</td>
                            <td class="text-center"><span class="badge badge-error badge-sm">ไม่มี</span></td>
                            <td v-if="featureFlags.attendance.enableLineupColumn" class="text-center"><span
                                    class="badge badge-error badge-sm">ไม่มี</span></td>
                            <td class="text-center"><span class="badge badge-error badge-sm">ไม่มี</span></td>
                            <td class="text-center">
                                <button @click="$emit('viewDetail', item)" class="btn btn-sm btn-info btn-outline">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <div class="lg:hidden space-y-4">
            <div v-if="data.length === 0"
                class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
                ไม่พบข้อมูล
            </div>
            <div v-for="item in data" :key="item._id" class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="badge badge-primary badge-sm mb-2">{{ item.userid }}</div>
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                        <p class="text-sm text-base-content/70">{{ item.position }}</p>
                    </div>
                    <div>
                        <div v-if="item.picture" class="avatar cursor-pointer" @click="openImage(item.picture)">
                            <div class="w-12 h-12 rounded">
                                <img :src="`${imgProBaseUrl}${item.picture}`" alt="profile" />
                            </div>
                        </div>
                        <div v-else class="avatar placeholder">
                            <div
                                class="bg-neutral text-neutral-content w-12 h-12 rounded flex items-center justify-center">
                                <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="divider my-2"></div>

                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-base-content/60">{{ item.department ? 'แผนก:' : 'ชั้นเรียน:' }}</span>
                        <p class="font-medium">{{ item.department || `${item.grade}/${item.classroom}` }}</p>
                    </div>
                </div>

                <div class="divider my-2"></div>

                <template v-if="item.attendances && item.attendances.length > 0">
                    <div v-for="(att, attIdx) in item.attendances" :key="att.date + '-' + attIdx"
                        class="mb-4 bg-base-200 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-base-content/80">{{ formatDate(att.date) }}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2 mb-2">
                            <div class="flex-1 text-center">
                                <span class="text-xs text-base-content/60 block">เข้า</span>
                                <span v-if="extractAttendanceByUsecase(att).entry"
                                    class="badge badge-success badge-sm">{{
                                        extractAttendanceByUsecase(att).entry.time }}</span>
                                <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                            </div>
                            <div v-if="featureFlags.attendance.enableLineupColumn" class="flex-1 text-center">
                                <span class="text-xs text-base-content/60 block">เข้าแถว</span>
                                <span v-if="extractAttendanceByUsecase(att).lineup"
                                    class="badge badge-success badge-sm">{{
                                        extractAttendanceByUsecase(att).lineup.time }}</span>
                                <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                            </div>
                            <div class="flex-1 text-center">
                                <span class="text-xs text-base-content/60 block">ออก</span>
                                <span v-if="extractAttendanceByUsecase(att).exit"
                                    class="badge badge-success badge-sm">{{
                                        extractAttendanceByUsecase(att).exit.time }}</span>
                                <span v-else class="badge badge-error badge-sm">ไม่มี</span>
                            </div>
                        </div>
                        <button @click="$emit('viewDetail', item, att)" class="btn btn-sm btn-info btn-outline w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            ดูรายละเอียด
                        </button>
                    </div>
                </template>
                <template v-else>
                    <div class="grid gap-2 mb-2"
                        :class="featureFlags.attendance.enableLineupColumn ? 'grid-cols-3' : 'grid-cols-2'">
                        <div class="flex-1 text-center">
                            <span class="text-xs text-base-content/60 block">เข้า</span>
                            <span class="badge badge-error badge-sm">ไม่มี</span>
                        </div>
                        <div v-if="featureFlags.attendance.enableLineupColumn" class="flex-1 text-center">
                            <span class="text-xs text-base-content/60 block">เข้าแถว</span>
                            <span class="badge badge-error badge-sm">ไม่มี</span>
                        </div>
                        <div class="flex-1 text-center">
                            <span class="text-xs text-base-content/60 block">ออก</span>
                            <span class="badge badge-error badge-sm">ไม่มี</span>
                        </div>
                    </div>
                    <button @click="$emit('viewDetail', item)" class="btn btn-sm btn-info btn-outline w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ดูรายละเอียด
                    </button>
                </template>
            </div>
        </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-4 text-xs">
        <div class="flex items-center gap-2 text-white">
            <span class="badge badge-warning badge-xs">เข้าแถว</span> เวลาแรกจาก person_confirmation
        </div>
        <div class="flex items-center gap-2 text-white">
            <span class="badge badge-success badge-xs">เวลา</span> แสดงเวลาที่เข้า/ออก
        </div>
        <div class="flex items-center gap-2 text-white">
            <span class="badge badge-error badge-xs">ไม่มี</span> ไม่มีข้อมูลเวลา
        </div>
    </div>

    <div v-if="pagination.total_pages > 1" class="flex justify-center mt-6">
        <div class="join">
            <button class="join-item btn btn-sm bg-transparent border-none"
                @click="$emit('page-change', pagination.page - 1)" :disabled="pagination.page === 1">
                ‹
            </button>
            <button v-for="page in displayedPages" :key="page" class="join-item btn btn-sm bg-transparent border-none"
                :class="page === pagination.page ? 'bg-base-content/20 font-bold' : ''"
                @click="$emit('page-change', page)">
                {{ page }}
            </button>
            <button class="join-item btn btn-sm bg-transparent border-none"
                @click="$emit('page-change', pagination.page + 1)"
                :disabled="pagination.page === pagination.total_pages">
                ›
            </button>
        </div>
    </div>

    <div v-if="pagination.total_items > 0" class="text-center text-sm text-base-content/60 mt-4 text-white">
        แสดง {{ ((pagination.page - 1) * pagination.limit) + 1 }} - {{
            Math.min(pagination.page * pagination.limit, pagination.total_items)
        }} จาก {{ pagination.total_items }} รายการ
    </div>

    <dialog ref="imageModal" class="modal">
        <div class="modal-box max-w-7xl w-full p-0">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
            </form>
            <img v-if="selectedImage" :src="`${imgProBaseUrl}${selectedImage}`" alt="profile-large"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import featureFlags from '../../config/featureFlags.js'
import { ref, computed } from 'vue'

const loadingExport = ref(false)

function normalizeCellValue(value) {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return value
}

function formatClassOrDepartment(item) {
    if (item?.department !== null && item?.department !== undefined && item?.department !== '') {
        return normalizeCellValue(item.department)
    }
    const grade = normalizeCellValue(item?.grade)
    const classroom = normalizeCellValue(item?.classroom)
    return `${grade}/${classroom}`
}

async function exportAllToExcel() {
    if (loadingExport.value) return
    loadingExport.value = true
    try {
        const filters = props.filters || {}
        const params = {
            start: filters.start,
            end: filters.end,
            role: filters.role,
            grade: filters.grade,
            classroom: filters.classroom,
            page: 1,
            limit: 50,
        }
        let allData = []
        let totalPages = 1
        do {
            const res = await reportApi.getAttendanceReport(params)
            if (res && res.data) {
                allData = allData.concat(res.data)
                totalPages = res.total_pages || 1
                params.page++
            } else {
                break
            }
        } while (params.page <= totalPages)

        function formatDateTH(dateStr) {
            if (!dateStr) return '-'
            const d = new Date(dateStr)
            return d.toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'short', year: 'numeric' })
        }

        function getStatus(att) {
            if (!att || !att.timeStamps || att.timeStamps.length === 0) return '-'
            const first = att.timeStamps.map(ts => ts.timestamp).sort()[0]
            if (!first) return '-'
            const time = first.split(' ')[1]
            if (time > '08:01:00') return 'มาสาย'
            return 'มาปกติ'
        }

        function getFirstTimeByUsecase(att, usecase) {
            if (!att || !att.timeStamps || att.timeStamps.length === 0) return '-'
            const sorted = att.timeStamps
                .filter(ts => ts.timestamp)
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            const found = sorted.find(ts => ts.usecase === usecase)
            return found ? found.timestamp.split(' ')[1] : '-'
        }

        function getLegacyEntryTime(att) {
            if (!att || !att.timeStamps || att.timeStamps.length === 0) return '-'
            const sorted = att.timeStamps
                .filter(ts => ts.timestamp)
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            return sorted[0] ? sorted[0].timestamp.split(' ')[1] : '-'
        }

        function getLegacyExitTime(att) {
            if (!att || !att.timeStamps || att.timeStamps.length === 0) return '-'
            const sorted = att.timeStamps
                .filter(ts => ts.timestamp)
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            return sorted.length > 1 ? sorted[sorted.length - 1].timestamp.split(' ')[1] : '-'
        }

        const rows = []
        allData.forEach(item => {
            if (item.attendances && item.attendances.length > 0) {
                item.attendances.forEach(att => {
                    const row = {
                        'รหัส': normalizeCellValue(item.userid),
                        'ชื่อ-สกุล': normalizeCellValue(item.name),
                        'ตำแหน่ง': normalizeCellValue(item.position),
                        'ชั้นเรียน/แผนก': formatClassOrDepartment(item),
                        'วันที่': formatDateTH(att.date),
                        'เวลาเข้า': getFirstTimeByUsecase(att, 'attendance') !== '-' ? getFirstTimeByUsecase(att, 'attendance') : getLegacyEntryTime(att),
                        'เวลาออก': getFirstTimeByUsecase(att, 'attendance') !== '-' ? getLegacyExitTime({
                            ...att,
                            timeStamps: att.timeStamps.filter(ts => ts.usecase === 'attendance')
                        }) : getLegacyExitTime(att),
                        'สถานะ': getStatus(att),
                    }
                    if (featureFlags.attendance.enableLineupColumn) {
                        row['เข้าแถว'] = getFirstTimeByUsecase(att, 'person_confirmation')
                    }
                    rows.push(row)
                })
            } else {
                const row = {
                    'รหัส': normalizeCellValue(item.userid),
                    'ชื่อ-สกุล': normalizeCellValue(item.name),
                    'ตำแหน่ง': normalizeCellValue(item.position),
                    'ชั้นเรียน/แผนก': formatClassOrDepartment(item),
                    'วันที่': '-',
                    'เวลาเข้า': '-',
                    'เวลาออก': '-',
                    'สถานะ': '-',
                }
                if (featureFlags.attendance.enableLineupColumn) {
                    row['เข้าแถว'] = '-'
                }
                rows.push(row)
            }
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('AttendanceDetail')

        const dateRangeText = filters.start && filters.end ? `(${formatDateTH(filters.start)} - ${formatDateTH(filters.end)})` : ''
        worksheet.addRow([`รายงานข้อมูลการเข้า-ออก ${dateRangeText}`])
        const mergeRange = featureFlags.attendance.enableLineupColumn ? 'A1:I1' : 'A1:H1'
        worksheet.mergeCells(mergeRange)
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getCell('A1').font = { bold: true }

        const header = ['รหัส', 'ชื่อ-สกุล', 'ตำแหน่ง', 'ชั้นเรียน/แผนก', 'วันที่', 'เวลาเข้า']
        if (featureFlags.attendance.enableLineupColumn) {
            header.push('เข้าแถว')
        }
        header.push('เวลาออก', 'สถานะ')
        worksheet.addRow(header)

        rows.forEach(row => {
            worksheet.addRow(header.map(h => row[h]))
        })

        const columnWidths = [10, 40, 40, 40, 15, 15]
        if (featureFlags.attendance.enableLineupColumn) {
            columnWidths.push(15)
        }
        columnWidths.push(15, 10)
        worksheet.columns = columnWidths.map(width => ({ width }))
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getRow(2).font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `AttendanceDetail_${filters.start || ''}_${filters.end || ''}.xlsx`)
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel')
        console.error(e)
    } finally {
        loadingExport.value = false
    }
}
const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    pagination: {
        type: Object,
        required: true
    },
    filters: {
        type: Object,
    }
})

defineEmits(['viewDetail', 'page-change'])

const imgProBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const imageModal = ref(null)
const selectedImage = ref(null)

const openImage = (image) => {
    if (!image) return
    selectedImage.value = image
    imageModal.value?.showModal()
}

const displayedPages = computed(() => {
    const total = props.pagination.total_pages
    const current = props.pagination.page
    const maxVisible = 5
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2))
    let endPage = Math.min(total, startPage + maxVisible - 1)
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }
    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    return pages
})


const extractEntryExit = (item) => {
    if (!item.attendances || item.attendances.length === 0) return { entry: null, exit: null }
    const attendance = item.attendances[0]
    if (!attendance.timeStamps || attendance.timeStamps.length === 0) return { lineup: null, entry: null, exit: null }
    return extractAttendanceByUsecase(attendance)
}

const extractAttendanceByUsecase = (attendance) => {
    if (!attendance.timeStamps || attendance.timeStamps.length === 0) return { lineup: null, entry: null, exit: null }
    const stamps = attendance.timeStamps.map(ts => ({
        raw: ts.timestamp,
        hour: parseInt(ts.timestamp.split(' ')[1].split(':')[0]),
        time: ts.timestamp.split(' ')[1].slice(0, 5),
        image: ts.image,
        location: ts.location,
        usecase: ts.usecase || ''
    })).sort((a, b) => a.raw.localeCompare(b.raw))

    const lineup = stamps.find(s => s.usecase === 'person_confirmation') || null
    const attendanceStamps = stamps.filter(s => s.usecase === 'attendance')

    if (attendanceStamps.length > 0) {
        const entry = attendanceStamps[0] || null
        const exit = attendanceStamps.find(s => s.hour >= 12) || null
        return { lineup, entry, exit }
    }

    const hasUsecase = stamps.some(s => !!s.usecase)
    if (hasUsecase) {
        return { lineup, entry: null, exit: null }
    }

    const entry = stamps.filter(s => s.hour < 12).sort((a, b) => a.raw.localeCompare(b.raw))[0] || stamps[0] || null
    const exit = stamps.filter(s => s.hour >= 12).sort((a, b) => a.raw.localeCompare(b.raw))[0] || null
    return { lineup: null, entry, exit }
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

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
</script>

<style scoped>
.join {
    border-radius: 1.5rem;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.06);
    background: #f8fafc;
}

.btn.bg-transparent {
    background: transparent;
}

.bg-base-content\/20 {
    background-color: #e5e7eb !important;
}
</style>