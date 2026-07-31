<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-4xl">
            <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 class="font-bold text-lg">รายละเอียดใบลา</h3>
                    <p class="text-xs text-base-content/60">ข้อมูลการลาและสถานะการอนุมัติ</p>
                </div>

                <div class="flex flex-col items-end min-[444px]:flex-row min-[444px]:items-center gap-2" v-if="request">
                    <div :class="['badge gap-1 h-auto py-1 text-center whitespace-normal min-[444px]:whitespace-nowrap', checkAttendanceStatus(request).badgeClass]">
                        {{ checkAttendanceStatus(request).label }}
                    </div>
                    <div :class="['badge h-auto py-1 whitespace-nowrap', getStatusBadgeClass(request.status)]">
                        {{ formatStatus(request.status) }}
                    </div>
                </div>
            </div>

            <div v-if="request" class="text-sm">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">ข้อมูลผู้ลา</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">รหัส</span>
                                <span class="font-semibold">{{ request.user_id?.userid || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อ</span>
                                <span class="font-semibold">{{ request.user_id?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(request.user_id?.role) }}</span>
                            </div>
                            <div v-if="formatStudentLevel(request.user_id?.grade, request.user_id?.classroom)"
                                class="flex justify-between">
                                <span class="text-base-content/70">ชั้น</span>
                                <span class="font-semibold">{{ formatStudentLevel(request.user_id?.grade,
                                    request.user_id?.classroom) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">รายละเอียดการลา</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">รายการ</span>
                                <span class="font-semibold">{{ request.leave_type_id?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">เหตุผล</span>
                                <span class="font-semibold text-right break-words">{{ request.reason || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ช่วงการลา</span>
                                <span class="font-semibold">{{ formatDateRange(request.start_date, request.end_date)
                                    }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">เวลา</span>
                                <span class="font-semibold">{{ formatTimeDisplay(request.start_time, request.end_time)
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">อนุมัติโดย</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อ</span>
                                <span class="font-semibold">{{ request.approved_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(request.approved_by?.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">อนุมัติวันเวลา</span>
                                <span class="font-semibold">{{ formatDate(request.approved_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">ผู้ขอลา</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ชื่อ</span>
                                <span class="font-semibold">{{ request.created_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">ตำแหน่ง</span>
                                <span class="font-semibold">{{ formatRole(request.created_by?.role) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border border-base-300 p-4">
                    <h4 class="font-bold text-base mb-3 text-slate-700">
                        บันทึกเวลา - {{ formatDateThaiFull(request.start_date) }}
                    </h4>

                    <div v-if="filteredAttendance.length > 0" class="flex flex-wrap gap-4">
                        <div v-for="att in filteredAttendance" :key="att._id"
                            class="w-36 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col items-center p-2 text-center">
                            <img :src="getAttendanceImage(att.imageUrl)" alt="รูปถ่ายเวลาเข้า"
                                class="w-full h-32 object-cover rounded-md mb-2 bg-slate-100" />
                            <div class="text-blue-600 font-bold text-base">
                                {{ att.time }}
                            </div>
                            <div class="text-xs text-gray-500 mt-0.5">
                                {{ att.sn || 'ipc_2_in' }}
                            </div>
                            <div class="text-xs text-gray-400 mt-0.5">
                                ความเหมือน: {{ att.similarity || 0 }}%
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-6 text-gray-400">
                        ยังไม่มีข้อมูลการสแกนบันทึกเวลาของวันที่ลานี้
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
import { ref, computed } from 'vue';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const modalRef = ref(null);
const request = ref(null);

const formatRole = (role) => {
    if (role === 'student') return 'นักเรียน';
    if (role === 'teacher') return 'ครู';
    return role || '-';
};

const formatStatus = (status) => {
    if (!status) return '-';
    if (status === 'approved') return 'อนุมัติแล้ว';
    if (status === 'pending') return 'รอดำเนินการ';
    if (status === 'rejected') return 'ไม่อนุมัติ';
    if (status === 'cancelled') return 'ยกเลิก';
    return status;
};

const getStatusBadgeClass = (status) => {
    if (status === 'approved') return 'badge-success text-success-content';
    if (status === 'pending') return 'badge-warning text-warning-content';
    if (status === 'rejected') return 'badge-error text-error-content';
    if (status === 'cancelled') return 'badge-neutral text-neutral-content';
    return 'badge-outline';
};

const formatStudentLevel = (grade, classroom) => {
    if (!grade && !classroom) return null;
    return formatGradeClassroomDisplay(grade, classroom);
};

const getValidAttendance = (req) => {
    if (!req || !req.attendance || !req.attendance.length) return [];
    const startDate = req.start_date;
    const endDate = req.end_date || req.start_date;

    return req.attendance.filter(att => att.date >= startDate && att.date <= endDate);
};

const filteredAttendance = computed(() => {
    return getValidAttendance(request.value);
});

const isFullDayLeave = (startTime, endTime) => {
    if (!endTime) return true;
    const [endHour, endMin] = endTime.split(':').map(Number);
    const endInMinutes = endHour * 60 + (endMin || 0);
    return endInMinutes >= 16 * 60;
};

const formatTimeDisplay = (startTime, endTime) => {
    if (isFullDayLeave(startTime, endTime)) {
        return 'ลาทั้งวัน';
    }
    return `${startTime} - ${endTime}`;
};

const checkAttendanceStatus = (req) => {
    if (!req) return { label: '-', badgeClass: 'badge-outline' };

    const validAttendance = getValidAttendance(req);
    const hasAttendance = validAttendance.length > 0;
    const isFullDay = isFullDayLeave(req.start_time, req.end_time);

    if (hasAttendance) {
        if (!isFullDay) {
            return {
                label: 'มาเรียนแล้ว',
                badgeClass: 'badge-info text-info-content'
            };
        }
        return {
            label: 'ลงเวลามา',
            badgeClass: 'badge-success text-success-content'
        };
    }

    if (isFullDay) {
        return {
            label: 'ลาทั้งวัน',
            badgeClass: 'badge-neutral text-neutral-content'
        };
    }

    const now = new Date();
    const endDateStr = req.end_date; 
    const endTimeStr = req.end_time || '12:00:00';
    const endDateTime = new Date(`${endDateStr}T${endTimeStr}`);

    if (now > endDateTime) {
        return {
            label: 'ยังไม่สแกน',
            badgeClass: 'badge-error text-error-content'
        };
    }

    return {
        label: 'อยู่ระหว่างการลา',
        badgeClass: 'badge-warning text-warning-content'
    };
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

const formatDateThaiFull = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
};

const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '-';
    if (startDate === endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const getAttendanceImage = (imageUrl) => {
    if (!imageUrl) return '/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `/${imageUrl}`;
};

const openModal = (data) => {
    request.value = data;
    modalRef.value?.showModal();
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>