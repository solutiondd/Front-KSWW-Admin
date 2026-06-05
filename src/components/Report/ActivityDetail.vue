<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
            <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 class="font-bold text-lg">รายละเอียดกิจกรรม</h3>
                    <p class="text-xs text-base-content/60">ข้อมูลกิจกรรมและสถานะการเข้าร่วม</p>
                </div>
                <div v-if="activity" :class="['badge', getStatusBadgeClass(activity.status)]">
                    {{ formatStatus(activity.status) }}
                </div>
            </div>

            <div v-if="activity" class="text-sm">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">ข้อมูลผู้เข้าร่วม</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">รหัส</span>
                                <span class="font-semibold">{{ activity.user_id?.userid || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อ</span>
                                <span class="font-semibold">{{ activity.user_id?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(activity.user_id?.role) }}</span>
                            </div>
                            <div v-if="formatStudentLevel(activity.user_id?.grade, activity.user_id?.classroom)"
                                class="flex justify-between">
                                <span class="text-base-content/70">ชั้น</span>
                                <span class="font-semibold">{{ formatStudentLevel(activity.user_id?.grade,
                                    activity.user_id?.classroom) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">รายละเอียดกิจกรรม</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อกิจกรรม</span>
                                <span class="font-semibold text-right break-words">{{ activity.activity_name || '-'
                                }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">สถานที่</span>
                                <span class="font-semibold text-right break-words">{{ activity.location || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ช่วงวันที่</span>
                                <span class="font-semibold">{{ formatDateRange(
                                    activity.activity_date_start || activity.activity_date || activity.date,
                                    activity.activity_date_end || activity.activity_date_start || activity.activity_date
                                    || activity.date
                                ) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">เวลา</span>
                                <span class="font-semibold">{{ formatTimeRange(activity.start_time, activity.end_time)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">ผู้บันทึกข้อมูล</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อ</span>
                                <span class="font-semibold">{{ activity.created_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(activity.created_by?.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">บันทึกเมื่อ</span>
                                <span class="font-semibold">{{ formatDate(activity.created_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">การแก้ไขล่าสุด</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">แก้ไขโดย</span>
                                <span class="font-semibold">{{ activity.updated_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(activity.updated_by?.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">แก้ไขเมื่อ</span>
                                <span class="font-semibold">{{ formatDate(activity.updated_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
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
import { ref } from 'vue';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const modalRef = ref(null);
const activity = ref(null);

const formatRole = (role) => {
    if (role === 'student') return 'นักเรียน';
    if (role === 'teacher') return 'ครู';
    return role || '-';
};

const formatStatus = (status) => {
    if (!status) return '-';
    const value = String(status).toLowerCase();
    if (value === 'participated' || value === 'joined' || status === 'เข้าร่วม') return 'เข้าร่วม';
    if (value === 'late' || status === 'สาย') return 'สาย';
    if (value === 'absent' || status === 'ขาด') return 'ขาด';
    if (value === 'leave' || status === 'ลา') return 'ลา';
    return status;
};

const getStatusBadgeClass = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'participated' || value === 'joined' || status === 'เข้าร่วม') return 'badge-success text-success-content';
    if (value === 'late' || status === 'สาย') return 'badge-warning text-warning-content';
    if (value === 'absent' || status === 'ขาด') return 'badge-error text-error-content';
    if (value === 'leave' || status === 'ลา') return 'badge-info text-info-content';
    return 'badge-outline';
};

const formatStudentLevel = (grade, classroom) => {
    if (!grade && !classroom) return null;
    return formatGradeClassroomDisplay(grade, classroom);
};

const formatTime = (time) => {
    if (!time) return '-';
    return time;
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '-';
    if (startTime && endTime) return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    return formatTime(startTime) || formatTime(endTime);
};

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d);
};

const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '-';
    if (startDate === endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const openModal = (data) => {
    activity.value = data;
    modalRef.value?.showModal();
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>
