<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
            <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 class="font-bold text-lg">รายละเอียดการตรวจระเบียบการแต่งตัว</h3>
                    <p class="text-xs text-base-content/60">ข้อมูลภาพรวมและรายการนักเรียน</p>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-10">
                <span class="loading loading-spinner loading-lg"></span>
            </div>

            <div v-else-if="detail" class="text-sm space-y-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">ข้อมูลการตรวจ</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชั้น/ห้อง</span>
                                <span class="font-semibold">{{ formatGradeClassroomDisplay(detail.grade,
                                    detail.classroom) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ผู้สร้าง</span>
                                <span class="font-semibold">{{ detail.inspector?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">Role ผู้สร้าง</span>
                                <span class="font-semibold">{{ detail.inspector?.role || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">วันที่ตรวจ</span>
                                <span class="font-semibold">{{ formatThaiDate(detail.date) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">วันที่สร้าง</span>
                                <span class="font-semibold">{{ formatThaiDateTime(detail.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">สรุปผล</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">อัปเดตโดย</span>
                                <span class="font-semibold">{{ detail.updated_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">Role อัปเดตโดย</span>
                                <span class="font-semibold">{{ detail.updated_by?.role || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">จำนวนทั้งหมด</span>
                                <span class="font-semibold">{{ summary.total }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ผ่าน</span>
                                <span class="font-semibold text-success">{{ summary.pass }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ไม่ผ่าน</span>
                                <span class="font-semibold text-error">{{ summary.not_pass }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border border-base-300 p-4 overflow-x-auto">
                    <h4 class="font-semibold mb-3 text-base">รายการนักเรียน</h4>
                    <table class="table table-zebra w-full text-sm">
                        <thead>
                            <tr>
                                <th>รหัส</th>
                                <th>ชื่อ</th>
                                <th class="text-center">สถานะ</th>
                                <th>ปัญหา</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in detail.students || []"
                                :key="`${item?.student_id?._id || 'row'}-${index}`">
                                <td>{{ item?.student_id?.userid || '-' }}</td>
                                <td>{{ item?.student_id?.name || '-' }}</td>
                                <td class="text-center">
                                    <span v-if="item?.ispass"
                                        class="badge badge-success whitespace-nowrap max-[509px]:badge-xs">ผ่าน</span>
                                    <span v-else
                                        class="badge badge-error whitespace-nowrap max-[509px]:badge-xs">ไม่ผ่าน</span>
                                </td>
                                <td>{{ Array.isArray(item?.issues) && item.issues.length ? item.issues.join(', ') : '-'
                                    }}</td>
                                <td>{{ item?.remark || '-' }}</td>
                            </tr>
                            <tr v-if="!(detail.students || []).length">
                                <td colspan="5" class="text-center text-gray-500 py-4">ไม่พบข้อมูลนักเรียน</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="text-center py-10 text-base-content/60">
                ไม่พบข้อมูลรายละเอียด
            </div>

            <div class="modal-action">
                <button class="btn" @click="closeModal">ปิด</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { UniformInspectionService } from '../../api/uniform_inspection';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const modalRef = ref(null);
const loading = ref(false);
const detail = ref(null);
const uniformInspectionService = new UniformInspectionService();

const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const formatThaiDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const summary = computed(() => {
    const students = detail.value?.students || [];
    const total = students.length;
    const pass = students.filter((item) => item?.ispass === true).length;
    const notPass = students.filter((item) => item?.ispass === false).length;
    return {
        total,
        pass,
        not_pass: notPass,
    };
});

const openModal = async (id) => {
    if (!id) return;
    loading.value = true;
    detail.value = null;
    modalRef.value?.showModal();
    try {
        const response = await uniformInspectionService.getUniformInspectionById(id);
        detail.value = response?.data || null;
    } catch (error) {
        console.error('Load uniform inspection detail error:', error);
        detail.value = null;
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>
