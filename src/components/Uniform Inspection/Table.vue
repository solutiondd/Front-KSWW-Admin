<template>
    <div class="w-full space-y-4">
        <div class="flex items-center justify-end gap-3">
            <button v-if="hasSelectedStatus" class="btn btn-primary btn-sm mr-auto" :disabled="autoSaving || loading"
                @click="emit('save')">
                {{ autoSaving ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
            <div class="flex items-center gap-2">
                <label class="text-sm text-gray-700">รายการ:</label>
                <select v-model.number="pageSize" class="select select-sm select-bordered w-18"
                    @change="handlePageSizeChange">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                </select>
                <span class="text-sm text-gray-700">ต่อหน้า</span>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else>
            <table class="table table-zebra w-full text-xs sm:text-[10px] xl:text-sm">
                <thead>
                    <tr class="bg-gray-100">
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th class="w-40 max-[444px]:w-28 text-center">สถานะ</th>
                        <th class="w-48 max-[444px]:hidden">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in paginatedStudents" :key="student._id" class="hover">
                        <td class="text-xs sm:text-[10px] xl:text-sm">{{ student.userid }}</td>
                        <td>
                            <div class="font-semibold text-xs sm:text-[10px] xl:text-sm">
                                <span v-if="student.name">{{ student.name }}</span>
                                <span v-else>{{ [student.pre_name, student.first_name,
                                student.last_name].filter(Boolean).join(' ') }}</span>
                            </div>
                        </td>
                        <td class="text-center align-middle max-[444px]:px-1">
                            <div class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span v-if="localInspectionData[student._id]?.ispass === true"
                                        class="badge badge-success max-[444px]:badge-xs">
                                        ผ่าน
                                    </span>
                                    <span v-else-if="localInspectionData[student._id]?.ispass === false"
                                        class="badge badge-error max-[444px]:badge-xs">
                                        ไม่ผ่าน
                                    </span>
                                    <span v-else class="badge badge-ghost max-[444px]:badge-xs">
                                        ว่าง
                                    </span>
                                </button>

                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markPass(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            ผ่านระเบียบ
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openFailModal(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            ไม่ผ่านระเบียบ
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="clearStatus(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            ล้างสถานะ
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td class="text-xs sm:text-[10px] xl:text-sm max-[444px]:hidden">
                            <div v-if="localInspectionData[student._id]?.ispass === false" class="text-error">
                                <div v-if="(localInspectionData[student._id]?.issues || []).length" class="font-medium">
                                    {{ (localInspectionData[student._id]?.issues || []).join(', ') }}
                                </div>
                                <div v-if="localInspectionData[student._id]?.remark"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ localInspectionData[student._id]?.remark }}
                                </div>
                            </div>
                            <div v-else-if="localInspectionData[student._id]?.ispass === true" class="text-success">
                                เรียบร้อย
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalPages > 1" class="flex flex-col items-center gap-2">
            <div class="flex justify-center gap-2">
                <div class="join shadow-lg">
                    <button @click="currentPage = 1" class="join-item btn btn-sm" :disabled="currentPage === 1">
                        ‹
                    </button>
                    <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                        :class="['join-item btn btn-sm', page === currentPage ? 'btn-active' : '']">
                        {{ page }}
                    </button>
                    <button @click="currentPage = totalPages" class="join-item btn btn-sm"
                        :disabled="currentPage === totalPages">
                        ›
                    </button>
                </div>
            </div>

            <div v-if="students.length > 0" class="text-center text-sm text-gray-600">
                ทั้งหมด {{ students.length }} รายการ (หน้า {{ currentPage }} / {{ totalPages }})
            </div>
        </div>

        <dialog v-if="failModal.show" class="modal modal-open">
            <div class="modal-box w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6 overflow-x-hidden">
                <h3 class="font-bold text-lg mb-4">บันทึกการแต่งกายไม่ผ่านระเบียบ</h3>

                <div class="form-control w-full mb-3">
                    <label class="label">
                        <span class="label-text">สาเหตุที่ไม่ผ่าน</span>
                    </label>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label v-for="issue in issueOptions" :key="issue"
                            class="label cursor-pointer justify-start gap-2">
                            <input type="checkbox" class="checkbox checkbox-sm" :value="issue"
                                v-model="failModal.form.issues" />
                            <span class="label-text">{{ issue }}</span>
                        </label>
                    </div>
                </div>

                <div class="form-control w-full mb-3">
                    <label class="label">
                        <span class="label-text">ปัญหาอื่นๆ (ไม่บังคับ)</span>
                    </label>
                    <input type="text" v-model="failModal.form.customIssue" class="input input-bordered"
                        placeholder="เช่น ทรงผมไม่ถูกระเบียบ" />
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">หมายเหตุ (ไม่บังคับ)</span>
                    </label>
                    <select v-model="failModal.form.remark" class="select select-bordered w-full">
                        <option value="">ไม่เลือก (ไม่หักคะแนน)</option>
                        <option v-for="option in remarkOptions" :key="option" :value="option">
                            {{ option }}
                        </option>
                    </select>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeFailModal">ยกเลิก</button>
                    <button class="btn btn-primary" :disabled="autoSaving" @click="saveFailStatus">บันทึก</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="closeFailModal">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import Swal from 'sweetalert2';

const props = defineProps({
    students: {
        type: Array,
        default: () => [],
    },
    selectedDate: {
        type: String,
        default: '',
    },
    selectedGrade: {
        type: String,
        default: '',
    },
    selectedClassroom: {
        type: [String, Number],
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    inspectionData: {
        type: Object,
        default: () => ({}),
    },
    saving: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:inspectionData', 'save']);

const pageSize = ref(10);
const currentPage = ref(1);
const localInspectionData = ref({});
const autoSaving = computed(() => props.saving);

const issueOptions = [
    'รองเท้าไม่ถูกระเบียบ',
    'ทรงผมไม่ถูกระเบียบ',
    'เสื้อไม่ถูกระเบียบ',
    'กางเกง/กระโปรงไม่ถูกระเบียบ',
    'เครื่องประดับไม่ถูกระเบียบ',
];

const remarkOptions = [
    'ตักเตือน ลงบันทึก -5 คะแนน',
    'แจ้ง หรือ เชิญผู้ปกครองรับทราบ -10 คะแนน',
    'เชิญผู้ปกครองทำ จค.กก.1/1 ครั้งที่ 1 -15 คะแนน',
    'เชิญผู้ปกครองทำ จค.กก.1/1 ครั้งที่ 2 -15 คะแนน',
    'เชิญผู้ปกครองทำทัณฑ์บน -30 คะแนน',
];

const DEFAULT_REMARK = 'ตักเตือน ลงบันทึก -5 คะแนน';

const failModal = ref({
    show: false,
    studentId: null,
    form: {
        issues: [],
        customIssue: '',
        remark: DEFAULT_REMARK,
    },
});

watch(() => props.inspectionData, (newVal) => {
    localInspectionData.value = { ...(newVal || {}) };
}, { deep: true, immediate: true });

watch(() => props.students, () => {
    const total = totalPages.value;
    if (currentPage.value > total) {
        currentPage.value = total || 1;
    }
}, { deep: true });

const totalPages = computed(() => Math.ceil((props.students?.length || 0) / pageSize.value));
const hasSelectedStatus = computed(() => {
    return Object.values(localInspectionData.value || {}).some((entry) => {
        return entry?.ispass === true || entry?.ispass === false;
    });
});

const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return (props.students || []).slice(start, end);
});

const MAX_VISIBLE_PAGES = 3;
const visiblePages = computed(() => {
    const total = totalPages.value;
    if (total <= 1) return [];
    if (total <= MAX_VISIBLE_PAGES) {
        const pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return pages;
    }
    let startPage = currentPage.value - Math.floor(MAX_VISIBLE_PAGES / 2);
    let endPage = currentPage.value + Math.floor(MAX_VISIBLE_PAGES / 2);
    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(total, MAX_VISIBLE_PAGES);
    }
    if (endPage > total) {
        endPage = total;
        startPage = Math.max(1, total - MAX_VISIBLE_PAGES + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

const handlePageSizeChange = () => {
    currentPage.value = 1;
};

const syncLocalState = () => {
    emit('update:inspectionData', localInspectionData.value);
};

const markPass = (studentId) => {
    localInspectionData.value[studentId] = {
        ispass: true,
        issues: [],
        remark: '',
    };

    syncLocalState();
};

const openFailModal = (studentId) => {
    const existing = localInspectionData.value[studentId] || {};
    const existingIssues = Array.isArray(existing.issues) ? existing.issues : [];

    const selectedPresetIssues = existingIssues.filter((issue) => issueOptions.includes(issue));
    const customIssues = existingIssues.filter((issue) => !issueOptions.includes(issue));
    const hasSavedRemark = Object.prototype.hasOwnProperty.call(existing, 'remark');
    const selectedRemark = hasSavedRemark
        ? (remarkOptions.includes(existing.remark) ? existing.remark : '')
        : DEFAULT_REMARK;

    failModal.value.studentId = studentId;
    failModal.value.form = {
        issues: selectedPresetIssues,
        customIssue: customIssues.join(', '),
        remark: selectedRemark,
    };
    failModal.value.show = true;
};

const closeFailModal = () => {
    failModal.value.show = false;
    failModal.value.studentId = null;
};

const saveFailStatus = () => {
    const studentId = failModal.value.studentId;
    if (!studentId) return;

    const customIssueList = String(failModal.value.form.customIssue || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    const issues = [...failModal.value.form.issues, ...customIssueList];
    if (!issues.length) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกหรือระบุสาเหตุอย่างน้อย 1 รายการ', 'warning');
        return;
    }

    localInspectionData.value[studentId] = {
        ispass: false,
        issues,
        remark: failModal.value.form.remark || '',
    };

    closeFailModal();
    syncLocalState();
};

const clearStatus = (studentId) => {
    delete localInspectionData.value[studentId];
    syncLocalState();
};
</script>
