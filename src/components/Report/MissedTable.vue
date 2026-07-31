<template>
    <div class="flex justify-end mb-2 gap-2">
        <button v-if="role === 'teacher' && !hideExport" class="btn btn-sm btn-primary" :disabled="loadingExportDoc"
            @click="exportDocxLeaveReport">
            เอกสารสรุปการออกงาน
        </button>
        <button v-if="!hideExport" class="btn btn-sm btn-success" :disabled="loadingExport"
            @click="exportMissedToExcel">
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
                    <th class="text-center w-12">#</th>
                    <th class="text-center">รหัส</th>
                    <th class="text-center">รูป</th>
                    <th>ชื่อ-สกุล</th>
                    <th class="text-center">ตำแหน่ง</th>
                    <th class="text-center">ชั้นเรียน/แผนก</th>
                    <th class="text-center">วันที่ขาด</th>
                    <th class="text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="flattenedData.length === 0">
                    <td colspan="8" class="text-center py-8 text-base-content/60">
                        ไม่พบข้อมูล
                    </td>
                </tr>
                <template v-for="(group, groupIndex) in groupedData" :key="group[0]._id">
                    <tr class="hover">
                        <td class="text-center align-center">
                            {{ ((pagination?.page || 1) - 1) * (pagination?.limit || 10) + groupIndex + 1 }}
                        </td>
                        <td class="text-center align-center">{{ group[0].userid }}</td>
                        <td class="text-center align-center flex items-center justify-center">
                            <img v-if="group[0].picture" :src="`${imgProBaseUrl}${group[0].picture}`" alt="profile"
                                class="w-10 h-10 rounded-full object-cover cursor-pointer"
                                @click="viewImage(group[0].picture)" />
                            <div v-else class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                                <span class="text-base font-bold">{{ getInitials(group[0].name) }}</span>
                            </div>
                        </td>
                        <td class="align-center">{{ group[0].name }}</td>
                        <td class="text-center align-center">{{ group[0].position }}</td>
                        <td class="text-center align-center">
                            <span v-if="group[0].position === 'นักเรียน'">{{ formatGradeClassroomDisplay(group[0].grade,
                                group[0].classroom) }}</span>
                            <span v-else>{{ group[0].department || '-' }}</span>
                        </td>
                        <td class="text-center">{{ formatDate(group[0].missed_date) }}</td>
                        <td class="text-center">
                            <button class="btn btn-xs btn-outline btn-info" @click="openDetail(group[0])">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    <tr v-for="item in group.slice(1)" :key="item._id + '-' + item.missed_date" class="hover">
                        <td></td>
                        <td class="text-center"></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class="text-center">{{ formatDate(item.missed_date) }}</td>
                        <td></td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>

    <div class="lg:hidden space-y-4">
        <div v-if="flattenedData.length === 0"
            class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
            ไม่พบข้อมูล
        </div>
        <div v-for="(group, groupIndex) in groupedData" :key="group[0]._id + '-mobile-group'"
            class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
            <div class="flex items-start gap-3">
                <img v-if="group[0].picture" :src="`${imgProBaseUrl}${group[0].picture}`" alt="profile"
                    class="w-10 h-10 rounded-full object-cover cursor-pointer" @click="viewImage(group[0].picture)" />
                <div v-else class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                    <span class="text-base font-bold">{{ getInitials(group[0].name) }}</span>
                </div>
                <div class="flex-1">
                    <div class="flex gap-1">
                <div class="badge badge-neutral badge-sm mb-2">#{{ ((pagination?.page || 1) - 1) * (pagination?.limit || 10) + groupIndex + 1 }}</div>
                <div class="badge badge-primary badge-sm mb-2">{{ group[0].userid }}</div>
            </div>
                    <h3 class="font-bold text-md">{{ group[0].name }}</h3>
                    <p class="text-sm text-base-content/70">{{ group[0].position }}</p>
                </div>
            </div>

            <div class="divider my-2"></div>

            <div class="text-sm">
                <span class="text-base-content/60" v-if="group[0].position === 'นักเรียน'">ชั้นเรียน:</span>
                <span class="text-base-content/60" v-else>แผนก:</span>
                <p class="font-medium inline ml-2" v-if="group[0].position === 'นักเรียน'">{{
                    formatGradeClassroomDisplay(group[0].grade, group[0].classroom) }}</p>
                <p class="font-medium inline ml-2" v-else>{{ group[0].department || '-' }}</p>
            </div>

            <div class="divider my-2"></div>

            <div class="text-sm">
                <span class="text-base-content/60">วันที่ขาด:</span>
                <div class="space-y-1 mt-2">
                    <div v-for="item in group" :key="item._id + '-mobile-date-' + item.missed_date" class="font-medium">
                        {{ formatDate(item.missed_date) }}
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-2">
                <button class="btn btn-xs btn-outline btn-info" @click="openDetail(group[0])">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div v-if="pagination.total_pages > 1" class="flex justify-center mt-6">
        <div class="join shadow-lg">
            <button @click="$emit('page-change', 1)" class="join-item btn btn-sm" :disabled="pagination.page === 1">
                ‹
            </button>

            <button v-for="page in visiblePages" :key="page" @click="$emit('page-change', page)"
                :class="['join-item btn btn-sm', page === pagination.page ? 'btn-active' : '']">
                {{ page }}
            </button>

            <button @click="$emit('page-change', pagination.total_pages)" class="join-item btn btn-sm"
                :disabled="pagination.page === pagination.total_pages">
                ›
            </button>
        </div>
    </div>

    <div v-if="pagination.total_items > 0" class="text-center text-sm text-base-content/60 mt-4"
        :class="summaryTextColor">
        ทั้งหมด {{ pagination.total_items }} รายการ (หน้า {{ pagination.page }} / {{ pagination.total_pages }})
    </div>

    <dialog ref="imageModal" class="modal">
        <div class="modal-box max-w-7xl w-full p-0">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
            </form>
            <img v-if="selectedImage" :src="`${imgProBaseUrl}${selectedImage}`" alt="profile image"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <MissedTableDetail v-if="selectedStudent" ref="detailRef" :student="selectedStudent" :role="role"
        @close="showDetail = false" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import ExcelJS from 'exceljs'
import MissedTableDetail from './MissedTableDetail.vue'
import { formatGradeClassroomDisplay, mapGradeDisplay } from '../../utils/gradeSystem'

const loadingExportDoc = ref(false)
const loadingExport = ref(false)
const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    pagination: {
        type: Object,
        required: true
    },
    dateRange: {
        type: Object,
        required: true
    },
    role: {
        type: String,
        required: false,
        default: 'student'
    },
    grade: {
        type: [String, Number],
        required: false,
        default: undefined
    },
    classroom: {
        type: [String, Number],
        required: false,
        default: undefined
    },
    hideExport: {
        type: Boolean,
        required: false,
        default: false
    },
    summaryTextColor: {
        type: String,
        default: 'text-white'
    },
    disableLocalDetail: {
        type: Boolean,
        default: false
    }
})

const groupedData = computed(() => {
    const groups = {};
    flattenedData.value.forEach(item => {
        if (!groups[item._id]) groups[item._id] = [];
        groups[item._id].push(item);
    });
    return Object.values(groups);
});

const flattenedData = computed(() => {
    if (!props.data) return [];
    const arr = [];
    props.data.forEach(item => {
        if (Array.isArray(item.missed_date) && item.missed_date.length > 0) {
            item.missed_date.forEach(date => {
                arr.push({ ...item, missed_date: date });
            });
        } else {
            arr.push({ ...item, missed_date: null });
        }
    });
    return arr;
});

const selectedStudent = ref(null)
const showDetail = ref(false)
import { getCurrentInstance } from 'vue'
const detailRef = ref(null)
function openDetail(student) {
    const instance = getCurrentInstance()
    const hasParentHandler = !!(instance?.vnode.props && (
        instance.vnode.props['onShow-detail'] || instance.vnode.props['onShowDetail']
    ))
    emit('show-detail', { student, role: props.role })
    if (!hasParentHandler && !props.disableLocalDetail) {
        selectedStudent.value = student
        showDetail.value = true
        detailRef.value?.openModal(student, props.role)
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

const emit = defineEmits(['page-change', 'show-detail'])

const imgProBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL

const imageModal = ref(null)
const selectedImage = ref(null)

const MAX_VISIBLE_PAGES = 3

const visiblePages = computed(() => {
    const current = props.pagination.page
    const total = props.pagination.total_pages
    const maxPagesToShow = MAX_VISIBLE_PAGES

    if (total <= 1) {
        return []
    }

    if (total <= maxPagesToShow) {
        const pages = []
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
        return pages
    }

    let startPage = current - Math.floor(maxPagesToShow / 2)
    let endPage = current + Math.floor(maxPagesToShow / 2)

    if (startPage < 1) {
        startPage = 1
        endPage = Math.min(total, maxPagesToShow)
    }

    if (endPage > total) {
        endPage = total
        startPage = Math.max(1, total - maxPagesToShow + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
})

const viewImage = (image) => {
    selectedImage.value = image
    imageModal.value?.showModal()
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

async function exportMissedToExcel() {
    if (loadingExport.value) return;
    loadingExport.value = true;
    try {
        const params = {
            start: props.dateRange?.start,
            end: props.dateRange?.end,
            role: props.role,
            page: 1,
            limit: 50,
        };
        if (props.grade !== undefined && props.grade !== null && props.grade !== '') params.grade = props.grade;
        if (props.classroom !== undefined && props.classroom !== null && props.classroom !== '') params.classroom = props.classroom;
        let allData = [];
        let totalPages = 1;
        do {
            const res = await reportApi.getMissedReport(params);
            if (res && res.data) {
                allData = allData.concat(res.data);
                totalPages = res.total_pages || 1;
                params.page++;
            } else {
                break;
            }
        } while (params.page <= totalPages);


        const rows = [];
        allData.forEach(item => {
            if (Array.isArray(item.missed_date) && item.missed_date.length > 0) {
                item.missed_date.forEach(date => {
                    rows.push({
                        'รหัส': item.userid,
                        'ชื่อ-สกุล': item.name,
                        'ตำแหน่ง': item.position,
                        'ชั้นเรียน/แผนก': item.position === 'นักเรียน'
                            ? formatGradeClassroomDisplay(item.grade, item.classroom)
                            : (item.department || '-'),
                        'วันที่ขาด': formatDate(date),
                    });
                });
            } else {
                rows.push({
                    'รหัส': item.userid,
                    'ชื่อ-สกุล': item.name,
                    'ตำแหน่ง': item.position,
                    'ชั้นเรียน/แผนก': item.position === 'นักเรียน'
                        ? formatGradeClassroomDisplay(item.grade, item.classroom)
                        : (item.department || '-'),
                    'วันที่ขาด': '-',
                });
            }
        });

        let filteredRows = rows;
        if (props.role === 'student') {
            if (props.grade !== undefined && props.grade !== null && props.grade !== '') {
                filteredRows = filteredRows.filter(item => String(item['ชั้นเรียน/แผนก']).startsWith(String(mapGradeDisplay(props.grade) + '/')));
            }
            if (props.classroom !== undefined && props.classroom !== null && props.classroom !== '') {
                filteredRows = filteredRows.filter(item => String(item['ชั้นเรียน/แผนก']).endsWith('/' + String(props.classroom)));
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('MissedDetail');

        let reportRange = '';
        if (props.dateRange && props.dateRange.start && props.dateRange.end) {
            reportRange = `(${formatDate(props.dateRange.start)} - ${formatDate(props.dateRange.end)})`;
        }
        worksheet.addRow([`รายงานข้อมูลขาดเรียน/ขาดงาน ${reportRange}`]);
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { bold: true };

        const header = ['รหัส', 'ชื่อ-สกุล', 'ตำแหน่ง', 'ชั้นเรียน/แผนก', 'วันที่ขาด'];
        worksheet.addRow(header);

        filteredRows.forEach(row => {
            worksheet.addRow(header.map(h => row[h]));
        });

        worksheet.columns = [
            { width: 10 },
            { width: 40 },
            { width: 20 },
            { width: 40 },
            { width: 15 },
        ];
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `MissedDetail_${props.dateRange?.start || ''}_${props.dateRange?.end || ''}.xlsx`);
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel');
        console.error(e);
    } finally {
        loadingExport.value = false;
    }
}

async function exportDocxLeaveReport() {
    if (loadingExportDoc.value) return
    loadingExportDoc.value = true
    try {
        let pictureBuffer = null;
        try {
            const res = await fetch('/brand.jpg');
            if (res.ok) pictureBuffer = await res.arrayBuffer();
        } catch (e) { pictureBuffer = null; }

        const [stats, missed] = await Promise.all([
            reportApi.getDailyStats(props.dateRange.start, props.dateRange.start),
            reportApi.getMissedReport({ start: props.dateRange.start, end: props.dateRange.start, role: 'teacher', classroom: 0 }),
        ]);
        const totalTeachers = stats?.data?.total_teachers || 0;
        const notCheckOut = missed?.data?.length || 0;

        const font = { name: 'TH SarabunPSK' };
        const leaveTable = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: `ข้าราชการครู ครูอัตราจ้าง จำนวน ${totalTeachers} คน`, font, size: 32 })],
                            })],
                            columnSpan: 3,
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: `ไม่ลงเวลากลับ ${notCheckOut} คน`, font, size: 32 })],
                            })],
                            columnSpan: 3,
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'ไม่ลงเวลากลับ', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: `ข้าราชการครู ${notCheckOut} คน`, font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })] })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'ขออนุญาตออกนอกบริเวณ', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            rowSpan: 2,
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: `ไม่กลับมาลงเวลา ${notCheckOut} คน`, font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: `กลับมาลงเวลา ${totalTeachers - notCheckOut} คน`, font, size: 32 })], alignment: AlignmentType.CENTER })],
                            rowSpan: 2,
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                    ]
                })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: 'fixed',
            margins: { top: 113, bottom: 113, left: 113, right: 113 },
            columnWidths: [1650, 1800, 6000],
        });

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
                                        children: [
                                            new Paragraph({
                                                children: pictureBuffer ? [
                                                    new ImageRun({ data: pictureBuffer, transformation: { width: 100, height: 100 } })
                                                ] : [new TextRun({ text: '', font })]
                                            })
                                        ],
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
                                        children: [new Paragraph({ children: [new TextRun({ text: 'กลุ่มบริหารงานบุคคล โรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น่น', font, size: 32 })] })],
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
                                        children: [new Paragraph({ children: [new TextRun({ text: 'สรุปรายงานการลงเวลากลับของลูกจ้างประจำและบุคลากรทางการศึกษา', font, size: 32 })] })],
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
                                            children: [new TextRun({ text: `  ด้วยงานปฏิบัติราชการของบุคลากรทางการศึกษา ได้จัดทำสรุปรายงานการลงเวลากลับของข้าราชการครู ประจำวันที่ ${props.dateRange ? formatDateTHFull(props.dateRange.start) : ''} ดังนี้`, font, size: 32 })],
                                        })],
                                        columnSpan: 4,
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                ]
                            })
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        margins: { top: 113, bottom: 113, left: 113, right: 113 },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    leaveTable,
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: '   จึงเรียนมาเพื่อโปรดทราบ', font, size: 32 })] }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: '(.............................................)', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: 'ผู้บันทึกข้อมูล', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: '(.............................................)', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: 'ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                ]
            }]
        });
        const blob = await Packer.toBlob(doc)
        saveAs(blob, `รายงานการออกงาน_${new Date().toISOString().slice(0, 10)}.docx`)
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

</script>

<style scoped></style>