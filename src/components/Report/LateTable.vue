<template>
    <div>
        <div class="flex justify-end mb-2" v-if="!hideExport">
            <button class="btn btn-sm btn-success" :disabled="loadingExport" @click="exportLateToExcel">
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
                        <th class="text-center w-20 min-w-[60px] max-w-[80px]">รหัส</th>
                        <th class="text-center w-20 min-w-[60px] max-w-[80px]">โปรไฟล์</th>
                        <th>ชื่อ-สกุล</th>
                        <th class="text-center">ตำแหน่ง</th>
                        <th class="text-center">ชั้นเรียน/แผนก</th>
                        <th class="text-center">วันที่</th>
                        <th class="text-center">เวลา</th>
                        <th class="text-center">เวลาสาย</th>
                        <th class="text-center">รูปภาพ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="data.length === 0">
                        <td colspan="9" class="text-center py-8 text-base-content/60">
                            ไม่พบข้อมูล
                        </td>
                    </tr>
                    <template v-for="item in sortedData" :key="item._id">
                        <template v-if="item.late_dates && item.late_dates.length > 0">
                            <tr class="hover" :key="item._id + '-first'">
                                <td class="text-center w-20 min-w-[60px] max-w-[80px]">{{ item.userid }}</td>
                                <td class="text-center w-20 min-w-[60px] max-w-[80px]">
                                    <div v-if="item.picture" class="avatar cursor-pointer inline-flex"
                                        @click="viewImage(item.picture, true)">
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
                                    <span v-if="item.position === 'นักเรียน'">{{ formatGradeClassroomDisplay(item.grade,
                                        item.classroom) }}</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="text-center">{{ formatDate(item.late_dates[0].date) }}</td>
                                <td class="text-center">
                                    <span v-if="getEntry(item.late_dates[0]) !== '-'"
                                        class="badge badge-info badge-md px-4 py-2">{{
                                            getEntry(item.late_dates[0]).substring(0, 5) }}</span>
                                    <span v-else class="badge badge-error badge-md px-4 py-2">-</span>
                                </td>
                                <td class="text-center">
                                    <span v-if="getEntry(item.late_dates[0]) !== '-'"
                                        class="badge badge-warning badge-md px-4 py-2">{{
                                            computeLateTime(getEntry(item.late_dates[0]), item.role) }}</span>
                                    <span v-else class="badge badge-warning badge-md px-4 py-2">-</span>
                                </td>
                                <td class="text-center">
                                    <div class="flex flex-wrap gap-1 justify-center">
                                        <template
                                            v-if="item.late_dates[0].timeStamps && item.late_dates[0].timeStamps.length > 0">
                                            <template v-if="!item.late_dates[0]._imgError">
                                                <img :src="`${imgProBaseUrl}${item.late_dates[0].timeStamps[0].imageUrl}`"
                                                    alt="snap"
                                                    class="w-14 h-14 rounded object-cover cursor-pointer border border-base-200"
                                                    @click="viewImage(item.late_dates[0].timeStamps[0].imageUrl)"
                                                    @error="item.late_dates[0]._imgError = true" />
                                                <p v-if="hasSimilarity(item.late_dates[0].timeStamps[0].similarity)"
                                                    class="text-xs text-gray-500 text-center mt-1 w-full">
                                                    ความเหมือน: {{ item.late_dates[0].timeStamps[0].similarity }}%
                                                </p>
                                            </template>
                                            <template v-else>
                                                <div class="avatar placeholder inline-flex">
                                                    <div
                                                        class="bg-neutral text-neutral-content w-14 h-14 rounded flex items-center justify-center">
                                                        <span class="text-base font-bold">{{ getInitials(item.name)
                                                        }}</span>
                                                    </div>
                                                </div>
                                            </template>
                                        </template>
                                        <span v-else>-</span>
                                    </div>
                                </td>
                            </tr>
                            <template v-for="(late, lateIdx) in item.late_dates" :key="item._id + '-late-' + lateIdx">
                                <tr v-if="lateIdx > 0" class="hover">
                                    <td class="text-center w-20 min-w-[60px] max-w-[80px]"></td>
                                    <td class="text-center w-20 min-w-[60px] max-w-[80px]"></td>
                                    <td></td>
                                    <td class="text-center"></td>
                                    <td class="text-center"></td>
                                    <td class="text-center">{{ formatDate(late.date) }}</td>
                                    <td class="text-center">
                                        <span v-if="getEntry(late) !== '-'"
                                            class="badge badge-info badge-md px-4 py-2">{{
                                                getEntry(late).substring(0, 5) }}</span>
                                        <span v-else class="badge badge-error badge-md px-4 py-2">-</span>
                                    </td>
                                    <td class="text-center">
                                        <span v-if="getEntry(late) !== '-'"
                                            class="badge badge-warning badge-md px-4 py-2">{{
                                                computeLateTime(getEntry(late), item.role) }}</span>
                                        <span v-else class="badge badge-warning badge-md px-4 py-2">-</span>
                                    </td>
                                    <td class="text-center">
                                        <div class="flex flex-wrap gap-1 justify-center">
                                            <template v-if="late.timeStamps && late.timeStamps.length > 0">
                                                <template v-if="!late._imgError">
                                                    <img :src="`${imgProBaseUrl}${late.timeStamps[0].imageUrl}`"
                                                        alt="snap"
                                                        class="w-14 h-14 rounded object-cover cursor-pointer border border-base-200"
                                                        @click="viewImage(late.timeStamps[0].imageUrl)"
                                                        @error="late._imgError = true" />
                                                    <p v-if="hasSimilarity(late.timeStamps[0].similarity)"
                                                        class="text-xs text-gray-500 text-center mt-1 w-full">
                                                        ความเหมือน: {{ late.timeStamps[0].similarity }}%
                                                    </p>
                                                </template>
                                                <template v-else>
                                                    <div class="avatar placeholder inline-flex">
                                                        <div
                                                            class="bg-neutral text-neutral-content w-14 h-14 rounded flex items-center justify-center">
                                                            <span class="text-base font-bold">{{ getInitials(item.name)
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                </template>
                                            </template>
                                            <span v-else>-</span>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </template>
                        <tr v-else class="hover">
                            <td class="text-center w-20 min-w-[60px] max-w-[80px]">{{ item.userid }}</td>
                            <td class="text-center w-20 min-w-[60px] max-w-[80px]">
                                <div v-if="item.picture" class="avatar cursor-pointer inline-flex"
                                    @click="viewImage(item.picture, true)">
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
                                <span v-if="item.position === 'นักเรียน'">{{ formatGradeClassroomDisplay(item.grade,
                                    item.classroom) }}</span>
                                <span v-else>-</span>
                            </td>
                            <td class="text-center">-</td>
                            <td class="text-center"><span class="badge badge-error badge-sm">-</span></td>
                            <td class="text-center"><span class="badge badge-error badge-sm">-</span></td>
                            <td class="text-center">-</td>
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
                <div class="flex items-start gap-3">
                    <img v-if="item.picture" :src="`${imgProBaseUrl}${item.picture}`" alt="profile"
                        class="w-10 h-10 rounded-full object-cover cursor-pointer"
                        @click="viewImage(item.picture, true)" @error="item.picture = null" />
                    <div v-else class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                        <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                    </div>
                    <div class="flex-1">
                        <div class="badge badge-primary badge-sm mb-2">{{ item.userid }}</div>
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                        <p class="text-sm text-base-content/70">{{ item.position }}</p>
                    </div>
                </div>
                <div class="divider my-2"></div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-base-content/60" v-if="item.position === 'นักเรียน'">ชั้นเรียน:</span>
                        <span class="text-base-content/60" v-else>แผนก:</span>
                        <p class="font-medium" v-if="item.position === 'นักเรียน'">{{
                            formatGradeClassroomDisplay(item.grade,
                                item.classroom) }}
                        </p>
                        <p class="font-medium" v-else>{{ item.department || '-' }}</p>
                    </div>
                </div>
                <div class="divider my-2"></div>
                <template v-if="item.late_dates && item.late_dates.length > 0">
                    <div v-for="(late, lateIdx) in item.late_dates" :key="item._id + '-late-mobile-' + lateIdx"
                        class="mb-4 bg-base-200 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-base-content/80">{{ formatDate(late.date) }}</span>
                        </div>
                        <div class="flex gap-2 mb-2">
                            <div class="flex-1 text-center">
                                <span class="text-xs text-base-content/60 block">เข้า</span>
                                <span v-if="getEntry(late) !== '-'" class="badge badge-success badge-sm">{{
                                    getEntry(late).substring(0, 5) }}</span>
                                <span v-else class="badge badge-error badge-sm">ไม่มีเข้า</span>
                            </div>
                            <div class="flex-1 text-center">
                                <span class="text-xs text-base-content/60 block">เวลาสาย</span>
                                <span class="badge badge-warning badge-sm" v-if="getEntry(late) !== '-'">{{
                                    computeLateTime(getEntry(late), item.role) }}</span>
                                <span class="badge badge-error badge-sm" v-else>-</span>
                            </div>
                        </div>
                        <div v-if="late.timeStamps && late.timeStamps.length > 0" class="flex justify-center">
                            <div v-if="late.timeStamps[0].imageUrl && !late._imgError"
                                class="flex flex-col items-center">
                                <img :src="`${imgProBaseUrl}${late.timeStamps[0].imageUrl}`" alt="late snapshot"
                                    class="h-20 object-cover rounded-md cursor-pointer"
                                    @click="viewImage(late.timeStamps[0].imageUrl)" @error="late._imgError = true" />
                                <p v-if="hasSimilarity(late.timeStamps[0].similarity)"
                                    class="text-xs text-gray-500 text-center mt-1 w-full">
                                    ความเหมือน: {{ late.timeStamps[0].similarity }}%
                                </p>
                            </div>
                            <div v-else
                                class="avatar placeholder flex items-center justify-center h-20 w-20 bg-neutral text-neutral-content rounded-md">
                                <span class="text-3xl font-bold">{{ getInitials(item.name) }}</span>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="flex gap-2 mb-2">
                        <div class="flex-1 text-center">
                            <span class="text-xs text-base-content/60 block">เข้า</span>
                            <span class="badge badge-error badge-sm">ไม่มีเข้า</span>
                        </div>
                        <div class="flex-1 text-center">
                            <span class="text-xs text-base-content/60 block">ออก</span>
                            <span class="badge badge-error badge-sm">ไม่มีออก</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div v-if="pagination.total_pages > 1" class="flex justify-center mt-6">
            <div class="join bg-white">
                <button class="join-item btn btn-sm bg-transparent border-none"
                    @click="$emit('page-change', pagination.page - 1)" :disabled="pagination.page === 1">
                    ‹
                </button>
                <template v-for="page in displayedPages" :key="page">
                    <button class="join-item btn btn-sm border-none"
                        :class="[page === pagination.page ? 'bg-base-content/20 font-bold' : 'bg-transparent']"
                        @click="$emit('page-change', page)">
                        {{ page }}
                    </button>
                </template>
                <button class="join-item btn btn-sm bg-transparent border-none"
                    @click="$emit('page-change', pagination.page + 1)"
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
                <img v-if="selectedImage"
                    :src="`${selectedImageType === 'profile' ? imgProBaseUrl : imgProBaseUrl}${selectedImage}`"
                    alt="late image" class="w-full h-auto max-h-[90vh] object-contain" />
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem'

const loadingExport = ref(false)
async function exportLateToExcel() {
    if (loadingExport.value) return;
    loadingExport.value = true;
    try {
        const params = {
            start: props.filters?.start,
            end: props.filters?.end,
            role: props.filters?.role,
            name: props.filters?.search || "",
            grade: props.filters.grade,
            classroom: props.filters.classroom,
            page: 1,
            limit: 50,
        };
        let allData = [];
        let totalPages = 1;
        do {
            const res = await reportApi.getLateReport(params);
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
            if (item.late_dates && item.late_dates.length > 0) {
                item.late_dates.forEach(late => {
                    rows.push({
                        'รหัส': item.userid,
                        'ชื่อ-สกุล': item.name,
                        'ตำแหน่ง': item.position,
                        'ชั้นเรียน/แผนก': item.position === 'นักเรียน'
                            ? formatGradeClassroomDisplay(item.grade, item.classroom)
                            : (item.department || '-'),
                        'วันที่': formatDate(late.date),
                        'เวลาเข้า': getFirstTime(late),
                        'มาสาย(ชม.)': computeLateTime(getFirstTimeFull(late), item.role),
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
                    'วันที่': '-',
                    'เวลาเข้า': '-',
                    'มาสาย(ชม.)': '-',
                });
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('LateDetail');

        let reportRange = '';
        if (props.filters && props.filters.start && props.filters.end) {
            reportRange = `(${formatDate(props.filters.start)} - ${formatDate(props.filters.end)})`;
        }
        worksheet.addRow([`รายงานข้อมูลมาสาย ${reportRange}`]);
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { bold: true };

        const header = ['รหัส', 'ชื่อ-สกุล', 'ตำแหน่ง', 'ชั้นเรียน/แผนก', 'วันที่', 'เวลาเข้า', 'มาสาย(ชม.)'];
        worksheet.addRow(header);

        rows.forEach(row => {
            worksheet.addRow(header.map(h => row[h]));
        });

        worksheet.columns = [
            { width: 10 },
            { width: 40 },
            { width: 20 },
            { width: 40 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
        ];
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `LateDetail_${props.filters?.start || ''}_${props.filters?.end || ''}.xlsx`);
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel');
        console.error(e);
    } finally {
        loadingExport.value = false;
    }
}

function getFirstTime(late) {
    if (!late || !late.timeStamps || late.timeStamps.length === 0) return '-';
    const first = late.timeStamps[0];
    if (!first || !first.timeStamp) return '-';
    return first.timeStamp.split(' ')[1].substring(0, 5);
}

function getFirstTimeFull(late) {
    if (!late || !late.timeStamps || late.timeStamps.length === 0) return '-';
    const first = late.timeStamps[0];
    if (!first || !first.timeStamp) return '-';
    return first.timeStamp.split(' ')[1];
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
        required: false
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
        default: false
    },
    summaryTextColor: {
        type: String,
        default: 'text-white'
    },
    allowanceRules: {
        type: Array,
        default: () => []
    }
})

const sortedData = computed(() => {
    if (!props.data) return [];
    const withLate = props.data.filter(item => item.late_dates && item.late_dates.length > 0);
    const withoutLate = props.data.filter(item => !item.late_dates || item.late_dates.length === 0);
    return [...withLate, ...withoutLate];
});

const displayedPages = computed(() => {
    const pages = [];
    const { page, total_pages } = props.pagination || {};
    if (!total_pages || total_pages < 2) return [1];
    let start = Math.max(1, page - 2);
    let end = Math.min(total_pages, page + 2);
    if (end - start < 4) {
        if (start === 1) {
            end = Math.min(total_pages, start + 4);
        } else if (end === total_pages) {
            start = Math.max(1, end - 4);
        }
    }
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

const emit = defineEmits(['page-change'])

const imgProBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL

const imageModal = ref(null)
const selectedImage = ref(null)
const selectedImageType = ref('snap')

function formatDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH-u-ca-buddhist', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

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

function getEntry(late) {
    if (!late || !late.timeStamps || late.timeStamps.length === 0) return '-';
    const first = late.timeStamps[0];
    if (!first || !first.timeStamp) return '-';

    return first.timeStamp.split(' ')[1].substring(0, 8);
}

function hasSimilarity(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
}

function viewImage(image, isProfile = false) {
    selectedImage.value = image
    selectedImageType.value = isProfile ? 'profile' : 'snap'
    imageModal.value?.showModal()
}

const computeLateTime = (timeStr, role) => {
    if (!timeStr || timeStr === '-' || timeStr === 'ไม่มีเข้า') return '-';

    let h1 = 8;
    let m1 = 1;
    let s1 = 0;

    if (props.allowanceRules && props.allowanceRules.length > 0) {
        const currentRule = props.allowanceRules.find(r => {
            const targetRole = role || (props.grade ? 'student' : 'teacher');
            return r.role === targetRole && r.enabled;
        });
        if (currentRule && currentRule.allowance_time) {
            const [allowH, allowM, allowS] = currentRule.allowance_time.split(':').map(Number);
            h1 = allowH;
            m1 = allowM;
            s1 = allowS || 0;
        }
    }

    const [h2, m2, s2] = timeStr.split(':').map(Number);

    const totalSeconds1 = (h1 * 3600) + (m1 * 60) + s1;
    const totalSeconds2 = (h2 * 3600) + (m2 * 60) + (s2 || 0);

    if (totalSeconds2 <= totalSeconds1) return 'ไม่สาย';

    const diffSeconds = totalSeconds2 - totalSeconds1;

    if (h2 === h1 && m2 === m1) {
        const displaySec = String(s2 || 0).padStart(2, '0');
        return `00:00:${displaySec}`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;

    const displayHour = String(h).padStart(2, '0');
    const displayMin = String(m).padStart(2, '0');

    return `${displayHour}:${displayMin}`;
};
</script>

<style scoped>
.table {
    table-layout: fixed;
}

.table th,
.table td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>