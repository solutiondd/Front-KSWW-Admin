<template>
    <div>
        <div class="flex justify-end mb-2 gap-2">
            <button class="btn btn-sm btn-success" :disabled="loadingExport" @click="exportAllToExcel">
                <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ส่งออก Excel
            </button>
            <button v-if="role === 'teacher'" class="btn btn-sm btn-primary" :disabled="loadingExportDoc"
                @click="exportDocxReport">
                <span v-if="loadingExportDoc" class="loading loading-spinner loading-xs mr-2"></span>
                เอกสารสรุปการเข้างาน
            </button>
        </div>
        <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th class="text-center">รหัส</th>
                        <th class="text-center">โปรไฟล์</th>
                        <th>ชื่อ - นามสกุล</th>
                        <th class="text-center">
                            <span v-if="role === 'student'">ชั้น/ห้อง</span>
                            <span v-else>หน่วยงาน</span>
                        </th>
                        <th class="text-center">ลงเวลา</th>
                        <th class="text-center text-green-600">มาปกติ</th>
                        <th class="text-center text-red-500">ไม่ได้สแกน</th>
                        <th class="text-center text-blue-500">มาสาย</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="data.length === 0">
                        <td colspan="8" class="text-center py-8 text-base-content/60">
                            ไม่พบข้อมูล
                        </td>
                    </tr>
                    <tr v-for="item in data" :key="item._id">
                        <td class="text-center">{{ item.userid }}</td>
                        <td class="text-center">
                            <div v-if="item.picture" class="avatar inline-flex">
                                <div class="w-10 h-10 rounded">
                                    <img :src="imgProBaseUrl + item.picture" alt="profile"
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
                        <td class="text-center">
                            <span v-if="role === 'student'">{{ formatGradeClassroomDisplay(item.grade, item.classroom)
                                }}</span>
                            <span v-else>{{ item.department || '-' }}</span>
                        </td>
                        <td class="text-center">{{ totalDays }}</td>
                        <td class="text-center text-green-600">{{ countPresentNormal(item.attendances) }}</td>
                        <td class="text-center text-red-500">{{ totalDays - countPresentNormal(item.attendances) -
                            countLate(item) }}</td>
                        <td class="text-center text-blue-500">{{ countLate(item) }}</td>
                    </tr>
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
                        <p class="text-sm text-base-content/70">
                            <span v-if="role === 'student'">{{ formatGradeClassroomDisplay(item.grade, item.classroom)
                                }}</span>
                            <span v-else>{{ item.department || '-' }}</span>
                        </p>
                    </div>
                    <div>
                        <div v-if="item.picture" class="avatar">
                            <div class="w-12 h-12 rounded">
                                <img :src="imgProBaseUrl + item.picture" alt="profile" />
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
                        <span class="text-base-content/60">ลงเวลา</span>
                        <p class="font-medium">{{ totalDays }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/60">มาปกติ</span>
                        <p class="font-medium text-green-600">{{ countPresentNormal(item.attendances) }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/60">ไม่ได้สแกน</span>
                        <p class="font-medium text-red-500">{{ totalDays - countPresentNormal(item.attendances) -
                            countLate(item) }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/60">มาสาย</span>
                        <p class="font-medium text-blue-500">{{ countLate(item) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="pagination && pagination.total_pages > 1" class="flex justify-center mt-4">
        <div class="join">
            <button class="join-item btn btn-sm" @click="$emit('page-change', pagination.page - 1)"
                :disabled="pagination.page === 1">
                ‹
            </button>
            <button v-for="page in displayedPages" :key="page" class="join-item btn btn-sm"
                :class="{ 'btn-active': page === pagination.page }" @click="$emit('page-change', page)">
                {{ page }}
            </button>
            <button class="join-item btn btn-sm" @click="$emit('page-change', pagination.page + 1)"
                :disabled="pagination.page === pagination.total_pages">
                ›
            </button>
        </div>
    </div>
    <div v-if="pagination && pagination.total_items > 0"
        class="text-center text-sm text-white text-base-content/60 mt-2">
        ทั้งหมด {{ pagination.total_items }} รายการ (หน้า {{ pagination.page }} / {{ pagination.total_pages }})
    </div>
</template>

<script setup>
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, ImageRun } from 'docx'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import holidaysApi from '../../api/holidays.js'
import { ref, computed, computed as vueComputed } from 'vue'
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem'

const loadingExportDoc = ref(false)
async function exportDocxReport() {
    if (loadingExportDoc.value) return
    loadingExportDoc.value = true
    try {
        let singleDay = props.dateRange.start
        if (props.dateRange.start !== props.dateRange.end) {
            singleDay = props.dateRange.start
        }
        const params = {
            start: singleDay,
            end: singleDay,
            role: props.role,
            grade: props.role === 'student' ? (props.data[0]?.grade || '') : undefined,
            classroom: props.role === 'student' ? (props.data[0]?.classroom || '') : undefined,
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

        let holidays = []
        try {
            const holidaysRes = await holidaysApi.getHolidaysByRange(params.start, params.end)
            holidays = Array.isArray(holidaysRes.data) ? holidaysRes.data : holidaysRes
        } catch (e) {
            holidays = []
        }
        const holidaySet = new Set(holidays.map(h => {
            if (typeof h.date === 'string' && h.date.includes('/')) {
                const [d, m, y] = h.date.split('/')
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
            }
            return h.date
        }))

        function getDateRangeArray(start, end, holidaysArr = []) {
            return getWorkingDays(start, end, holidaysArr)
        }

        const groupMap = {}
        allData.forEach(item => {
            const group = item.department || '-'
            if (!groupMap[group]) {
                groupMap[group] = { total: 0, late: 0, present: 0, missing: 0, holiday: 0 }
            }
            groupMap[group].total++
            let hasAttendance = false
            let isLate = false
            const attendedDates = new Set(
                (item.attendances || []).map(att => att.date)
            )
            const allDates = getDateRangeArray(params.start, params.end, holidays.map(h => h.date))
            allDates.forEach(dateStr => {
                if (attendedDates.has(dateStr)) return
                if (holidaySet.has(dateStr)) {
                    groupMap[group].holiday++
                } else {
                    groupMap[group].missing++
                }
            })
            if (item.attendances && item.attendances.length > 0) {
                hasAttendance = true
                item.attendances.forEach(att => {
                    if (att.timeStamps && att.timeStamps.length > 0) {
                        const first = att.timeStamps.map(ts => ts.timestamp).sort()[0]
                        if (first && first.split(' ')[1] > '08:01:00') {
                            isLate = true
                        }
                    }
                })
            }
            if (isLate) groupMap[group].late++
            if (hasAttendance) groupMap[group].present++
        })
        const tableRows = []
        let idx = 1
        let sumTotal = 0, sumLate = 0, sumPresent = 0, sumMissing = 0, sumHoliday = 0
        Object.entries(groupMap).forEach(([group, val]) => {
            tableRows.push([
                idx++,
                group,
                val.total,
                val.late,
                val.present,
                val.holiday,
                val.missing,
                val.total
            ])
            sumTotal += val.total
            sumLate += val.late
            sumPresent += val.present
            sumMissing += val.missing
            sumHoliday += val.holiday
        })
        tableRows.push([
            'รวม',
            '',
            sumTotal,
            sumLate,
            sumPresent,
            sumHoliday,
            sumMissing,
            sumTotal
        ])

        const font = { name: 'TH SarabunPSK' }

        async function getBase64FromUrl(url) {
            const response = await fetch(url)
            const blob = await response.blob()
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result.split(',')[1])
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        }
        const imageBase64 = await getBase64FromUrl('/brand.jpg')

        function base64ToUint8Array(base64) {
            const binaryString = atob(base64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }
            return bytes
        }

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: font
                    }
                }
            },
            sections: [{
                properties: {},
                children: [
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '', font })] })],
                                        // children: [
                                        //     new Paragraph({
                                        //         children: [
                                        //             new ImageRun({
                                        //                 data: base64ToUint8Array(imageBase64),
                                        //                 transformation: { width: 100, height: 100 }
                                        //             })
                                        //         ]
                                        //     })
                                        // ],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        height: { value: 500, rule: 'atLeast' },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'บันทึกข้อความ', font, bold: true, size: 48 })], alignment: AlignmentType.CENTER })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ส่วนราชการ', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'งานบุคคล โรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น', font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ที่', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '.....................................', font, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'วันที่', font, bold: true, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '.....................................', font, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'เรื่อง', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'สรุปรายงานการปฏิบัติราชการของข้าราชการครู และบุคลากรทางการศึกษา', font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'เรียน', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น', font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: ` ด้วยงานปฏิบัติราชการของข้าราชการครูและบุคลากรทางการศึกษา ได้จัดทำสรุปรายงานการปฏิบัติราชการ ของ ข้าราชการครู บุคลากรทางการศึกษา ประจำวันที่ ${formatDateTHFull(singleDay)} ดังนี้`, font, size: 32 })],
                                        })],
                                        columnSpan: 4,
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                ]
                            }),
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        margins: { top: 113, bottom: 113, left: 113, right: 113 },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Table({
                        rows: [
                            new TableRow({
                                // repeatHeaderRow: true,
                                children: [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ที่', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 500, type: WidthType.DXA }, verticalAlign: 'center' }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ประเภท/กลุ่มสาระ', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 1200, type: WidthType.DXA }, verticalAlign: 'center' }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'จำนวนบุคลากรทั้งหมด', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 1000, type: WidthType.DXA }, verticalAlign: 'center' }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'มาปฏิบัติราชการสาย(คน)', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 1000, type: WidthType.DXA }, verticalAlign: 'center' }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'มาปฏิบัติราชการทั้งสิ้น(คน)', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 1000, type: WidthType.DXA }, verticalAlign: 'center' }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ไม่มาปฏิบัติราชการ (คน)', font, size: 32 })], alignment: AlignmentType.CENTER })],
                                        columnSpan: 2,
                                        width: { size: 1200, type: WidthType.DXA },
                                        verticalAlign: 'center'
                                    }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'รวม', font, size: 32 })], alignment: AlignmentType.CENTER })], rowSpan: 2, width: { size: 500, type: WidthType.DXA }, verticalAlign: 'center' }),
                                ]
                            }),
                            new TableRow({
                                // repeatHeaderRow: true,
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'วันหยุดตามปฏิทิน', font, size: 32 })], alignment: AlignmentType.CENTER })],
                                        width: { size: 600, type: WidthType.DXA },
                                        verticalAlign: 'center',
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ไม่ลงเวลา', font, size: 32 })], alignment: AlignmentType.CENTER })],
                                        width: { size: 600, type: WidthType.DXA },
                                        verticalAlign: 'center',
                                    }),
                                ]
                            }),
                            ...tableRows.map((row, rowIdx) => new TableRow({
                                children: row.map((cell, i) => {
                                    const widths = [
                                        { size: 500, type: WidthType.DXA },
                                        { size: 1200, type: WidthType.DXA },
                                        { size: 1000, type: WidthType.DXA },
                                        { size: 1000, type: WidthType.DXA },
                                        { size: 1000, type: WidthType.DXA },
                                        { size: 1200, type: WidthType.DXA },
                                        { size: 600, type: WidthType.DXA },
                                        { size: 600, type: WidthType.DXA },
                                        { size: 500, type: WidthType.DXA },
                                    ];
                                    if (row[0] === 'รวม' && i === 0) {
                                        return new TableCell({
                                            children: [new Paragraph({
                                                children: [new TextRun({ text: cell.toString(), font, size: 32 })],
                                                alignment: AlignmentType.CENTER
                                            })],
                                            width: { size: 500 + 1500, type: WidthType.DXA },
                                            columnSpan: 2,
                                            verticalAlign: 'center'
                                        });
                                    }
                                    if (row[0] === 'รวม' && i === 1) {
                                        return null;
                                    }
                                    return new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: cell.toString(), font, size: 32 })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        width: widths[i],
                                        verticalAlign: 'center'
                                    });
                                }).filter(Boolean)
                            }))
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        layout: 'fixed',
                        margins: { top: 113, bottom: 113, left: 113, right: 113 },
                        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, left: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, right: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' } }
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: 'ลงชื่อ....................................................ผู้บันทึกข้อมูล', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: 'ลงชื่อ....................................................รองผู้อำนวยการโรงเรียน ผู้ตรวจสอบข้อมูล', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: 'ลงชื่อ....................................................ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                ]
            }]
        })
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `รายงานการมา_${props.dateRange.start}_${props.dateRange.end}.docx`)
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Word')
        console.error(e)
    } finally {
        loadingExportDoc.value = false
    }
}


function formatDateTHFull(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} พ.ศ.${year}`;
}

function formatDateRangeTH(start, end) {
    if (!start || !end) return '-';
    if (start === end) {
        return formatDateTHFull(start);
    } else {
        return `${formatDateTHFull(start)} ถึง ${formatDateTHFull(end)}`;
    }
}

const loadingExport = ref(false)
const imgProBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL

function getInitials(name) {
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

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    dateRange: {
        type: Object,
        required: true,
    },
    pagination: {
        type: Object,
        required: false,
    }
    ,
    role: {
        type: String,
        required: false,
        default: 'student'
    }
})

defineEmits(['page-change'])

async function exportAllToExcel() {
    if (loadingExport.value) return
    loadingExport.value = true
    try {
        const params = {
            start: props.dateRange.start,
            end: props.dateRange.end,
            role: props.role,
            grade: props.role === 'student' ? (props.data[0]?.grade || '') : undefined,
            classroom: props.role === 'student' ? (props.data[0]?.classroom || '') : undefined,
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

        // โหลดวันหยุดใหม่ (sync กับ holidaysArr)
        let holidaysRaw = []
        try {
            const res = await holidaysApi.getHolidaysByRange(props.dateRange.start, props.dateRange.end)
            holidaysRaw = Array.isArray(res.data) ? res.data.map(h => h.date) : (res.data || [])
        } catch (e) {
            holidaysRaw = []
        }
        const workingDaysArr = getWorkingDays(props.dateRange.start, props.dateRange.end, holidaysRaw)
        const totalDaysVal = workingDaysArr.length
        const rows = allData.map(item => {
            const presentNormal = countPresentNormal(item.attendances)
            const late = countLate(item)
            return {
                'รหัส': item.userid,
                'ชื่อ - นามสกุล': item.name,
                [props.role === 'student' ? 'ชั้น/ห้อง' : 'หน่วยงาน']: props.role === 'student' ? formatGradeClassroomDisplay(item.grade, item.classroom) : (item.department || '-'),
                'ลงเวลา': totalDaysVal,
                'มาปกติ': presentNormal,
                'ไม่ได้สแกน': totalDaysVal - presentNormal - late,
                'มาสาย': late,
            }
        })

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('AttendanceSummary')



        function formatDateTH(dateStr) {
            if (!dateStr) return '-'
            const d = new Date(dateStr)
            return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })
        }
        const dateRangeText = `(${formatDateTH(props.dateRange.start)} - ${formatDateTH(props.dateRange.end)})`
        worksheet.addRow([`รายงานจำนวนเข้า-ออก ${dateRangeText}`])
        worksheet.mergeCells('A1:G1')
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getCell('A1').font = { bold: true }

        const header = [
            'รหัส',
            'ชื่อ - นามสกุล',
            props.role === 'student' ? 'ชั้น/ห้อง' : 'หน่วยงาน',
            'ลงเวลา',
            'มาปกติ',
            'ไม่ได้สแกน',
            'มาสาย',
        ]
        worksheet.addRow(header)

        rows.forEach(row => {
            worksheet.addRow([
                row['รหัส'],
                row['ชื่อ - นามสกุล'],
                row[props.role === 'student' ? 'ชั้น/ห้อง' : 'หน่วยงาน'],
                row['ลงเวลา'],
                row['มาปกติ'],
                row['ไม่ได้สแกน'],
                row['มาสาย'],
            ])
        })

        worksheet.columns = [
            { width: 15 },
            { width: 40 },
            { width: 40 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
        ]

        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' }

        worksheet.getRow(2).font = { bold: true }

        const buffer = await workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `AttendanceSummary_${props.dateRange.start}_${props.dateRange.end}.xlsx`)
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel')
        console.error(e)
    } finally {
        loadingExport.value = false
    }
}

const displayedPages = vueComputed(() => {
    if (!props.pagination) return []
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


// ฟังก์ชันคำนวณวันทำงานจริง (ไม่รวมวันหยุดและเสาร์-อาทิตย์)
function getWorkingDays(startStr, endStr, holidaysArr = []) {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const holidaySet = new Set(holidaysArr.map(d => {
        if (typeof d === 'string' && d.includes('/')) {
            const [day, month, year] = d.split('/')
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        return d
    }))
    let days = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay()
        const dateStr = d.toISOString().slice(0, 10)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue // 0=อาทิตย์, 6=เสาร์
        if (holidaySet.has(dateStr)) continue
        days.push(dateStr)
    }
    return days
}

// holidaysArr จะถูกโหลด async ใน mounted

const holidaysArr = ref([])

async function loadHolidays() {
    try {
        const res = await holidaysApi.getHolidaysByRange(props.dateRange.start, props.dateRange.end)
        holidaysArr.value = Array.isArray(res.data) ? res.data.map(h => h.date) : (res.data || [])
    } catch (e) {
        holidaysArr.value = []
    }
}

loadHolidays()

const totalDays = computed(() => {
    return getWorkingDays(props.dateRange.start, props.dateRange.end, holidaysArr.value).length
})

// มาปกติ = มาและไม่สาย
function countPresentNormal(attendances) {
    if (!attendances) return 0
    let count = 0
    attendances.forEach(att => {
        if (!att.timeStamps || att.timeStamps.length === 0) return
        const first = att.timeStamps.map(ts => ts.timestamp).sort()[0]
        if (first) {
            const time = first.split(' ')[1]
            if (time <= '08:01:00') count++
        }
    })
    return count
}

function countLate(item) {
    if (item && Array.isArray(item.late_dates)) {
        return item.late_dates.length
    }

    const attendances = item.attendances || item
    if (!Array.isArray(attendances)) return 0

    let lateCount = 0
    attendances.forEach(att => {
        if (!att.timeStamps || att.timeStamps.length === 0) return
        const first = att.timeStamps.map(ts => ts.timestamp).sort()[0]
        if (first) {
            const time = first.split(' ')[1]
            if (time > '08:01:00') lateCount++
        }
    })
    return lateCount
}
</script>
