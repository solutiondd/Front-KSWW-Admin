<template>
    <div class="w-full">
        <div class="flex justify-end mb-2" v-if="!hideExport">
            <button class="btn btn-sm btn-success" :disabled="loadingExport" @click="exportLeaveToExcel">
                <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                ส่งออก Excel
            </button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="bg-white rounded-lg shadow overflow-x-auto w-full">
            <table class="table table-zebra w-full text-sm">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th class="text-center w-12">#</th>
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th>ชั้น</th>
                        <!-- <th class="hidden xl:table-cell">ตำแหน่ง</th> -->
                        <th class="hidden md:table-cell">วันที่ลา</th>
                        <th class="hidden min-[480px]:table-cell">สถานะลา</th>
                        <th class="hidden min-[612px]:table-cell">การเข้าเรียน</th>
                        <th class="text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(request, index) in leaveRequests" :key="request._id">
                        <td class="text-center text-xs min-[433px]:text-sm font-medium">{{ index + 1 }}</td>
                        <td class="text-xs min-[433px]:text-sm">{{ request.user_id?.userid || '-' }}</td>
                        <td class="text-xs min-[433px]:text-sm">{{ request.user_id?.name || '-' }}</td>
                        <td class="text-xs min-[433px]:text-sm">{{ formatClassroomDisplay(request.user_id) }}</td>
                        <!-- <td class="hidden xl:table-cell">{{ formatRole(request.user_id?.role) }}</td> -->
                        <td class="hidden md:table-cell">
                            {{ formatDate(request.start_date) }}
                            <span v-if="request.start_time" class="text-xs text-gray-500 block">
                                ({{ request.start_time }} - {{ request.end_time }})
                            </span>
                        </td>
                        <td class="hidden min-[480px]:table-cell">
                            <div
                                :class="['hidden min-[518px]:inline-flex badge h-auto py-1 whitespace-nowrap', getStatusBadgeClass(request.status)]">
                                {{ formatStatus(request.status) }}
                            </div>

                            <div class="inline-flex min-[518px]:hidden items-center justify-center"
                                :title="formatStatus(request.status)">
                                <svg v-if="request.status === 'approved'" class="w-6 h-6 text-emerald-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>

                                <svg v-else-if="request.status === 'pending'" class="w-6 h-6 text-amber-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>

                                <svg v-else-if="request.status === 'rejected'" class="w-6 h-6 text-rose-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>

                                <svg v-else-if="request.status === 'cancelled'" class="w-6 h-6 text-gray-400"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>

                                <span v-else class="text-xs text-gray-400">-</span>
                            </div>
                        </td>

                        <td class="hidden min-[612px]:table-cell">
                            <div
                                :class="['badge gap-1 h-auto py-1 text-center whitespace-normal md:whitespace-nowrap', checkAttendanceStatus(request).badgeClass]">
                                {{ checkAttendanceStatus(request).label }}
                            </div>
                            <div v-if="getValidAttendance(request).length" class="text-xs text-gray-400 mt-1">
                                สแกนล่าสุด: {{ getValidAttendance(request)[getValidAttendance(request).length - 1].time
                                }} น.
                            </div>
                        </td>

                        <td class="text-center">
                            <button @click="openDetail(request)" title="ดูข้อมูลเพิ่มเติม">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 stroke-blue-500" fill="none"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!leaveRequests.length">
                        <td colspan="8" class="text-center text-gray-500 py-6">ไม่พบข้อมูลใบลา</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <LeaveReqDetail ref="leaveReqDetailRef" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LeaveService } from '../../api/leave';
import LeaveReqDetail from './LeaveReqDetail.vue';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const props = defineProps({
    filters: {
        type: Object,
        default: () => ({
            start_date: '',
            end_date: '',
            search: '',
            status: 'approved',
            role: '',
        }),
    },
    hideExport: {
        type: Boolean,
        default: false,
    },
});

const leaveService = new LeaveService();
const loading = ref(false);
const loadingExport = ref(false);
const leaveRequests = ref([]);
const leaveReqDetailRef = ref(null);

const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const formatRole = (role) => {
    if (role === 'student') return 'นักเรียน';
    if (role === 'teacher') return 'ครู';
    return role || '-';
};

const formatClassroomDisplay = (user) => {
    if (!user) return 'ครู';
    if (user.role === 'teacher') return 'ครู';

    if (user.grade && user.classroom) {
        return formatGradeClassroomDisplay ? formatGradeClassroomDisplay(user.grade, user.classroom) : `${user.grade}/${user.classroom}`;
    }

    return 'ครู';
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

const openDetail = (request) => {
    leaveReqDetailRef.value?.openModal(request);
};

const getLeaveTypeLabel = (leaveType) => {
    const typeName =
        (typeof leaveType === 'object' ? leaveType?.name : leaveType) ||
        '';

    if (!typeName) return '-';
    if (typeName === 'sick') return 'ลาป่วย';
    if (typeName === 'personal') return 'ลากิจ';
    if (typeName === 'vacation') return 'ลาพักร้อน';
    return typeName;
};

const exportLeaveToExcel = async () => {
    if (loadingExport.value) return;
    loadingExport.value = true;

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('LeaveRequests');

        let reportRange = '';
        if (props.filters?.start_date && props.filters?.end_date) {
            reportRange = `(${formatDate(props.filters.start_date)} - ${formatDate(props.filters.end_date)})`;
        }

        worksheet.addRow([`รายงานใบลา ${reportRange}`]);
        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { bold: true };

        const headers = [
            'ลำดับ',
            'รหัส',
            'ชื่อ',
            'ตำแหน่ง',
            'ประเภทการลา',
            'วันที่ลา',
            'สถานะ',
            'เหตุผล',
        ];

        worksheet.addRow(headers);

        leaveRequests.value.forEach((item, index) => {
            worksheet.addRow([
                index + 1,
                item.user_id?.userid || '-',
                item.user_id?.name || '-',
                formatRole(item.user_id?.role),
                getLeaveTypeLabel(item.leave_type_id || item.leave_type || item.type),
                formatDate(item.start_date),
                formatStatus(item.status),
                item.reason || '-',
            ]);
        });

        worksheet.columns = [
            { width: 10 },
            { width: 16 },
            { width: 24 },
            { width: 14 },
            { width: 18 },
            { width: 18 },
            { width: 16 },
            { width: 48 },
        ];

        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(4).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(5).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(6).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(7).alignment = { horizontal: 'center', vertical: 'middle' };

        const safeStart = props.filters?.start_date || '';
        const safeEnd = props.filters?.end_date || '';
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `LeaveRequests_${safeStart}_${safeEnd}.xlsx`);
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel');
        console.error('Error exporting leave requests:', error);
    } finally {
        loadingExport.value = false;
    }
};

const loadLeaveRequests = async () => {
    loading.value = true;
    try {
        let filters = {
            start_date: props.filters.start_date || '',
            end_date: props.filters.end_date || '',
            status: props.filters.status ?? '',
            grade: props.filters.grade || '',
            classroom: props.filters.classroom || '',
        };

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            filters.grade = teacherGrade;
            filters.classroom = teacherClassroom;
        }

        const response = await leaveService.getLeaveRequests(filters);

        let data = response.data || response;
        if (props.filters.role) {
            data = data.filter((item) => item.user_id?.role === props.filters.role);
        }

        if (props.filters.search) {
            const search = props.filters.search.toLowerCase();
            data = data.filter(
                (item) =>
                    item.user_id?.name?.toLowerCase().includes(search) ||
                    item.user_id?.userid?.toLowerCase().includes(search)
            );
        }

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            data = data.filter(
                (item) =>
                    item.user_id?.grade === teacherGrade &&
                    item.user_id?.classroom === teacherClassroom
            );
        }

        leaveRequests.value = data;
    } catch (error) {
        console.error('Error loading leave requests:', error);
        leaveRequests.value = [];
    } finally {
        loading.value = false;
    }
};

const getValidAttendance = (req) => {
    if (!req || !req.attendance || !req.attendance.length) return [];

    const startDate = req.start_date;
    const endDate = req.end_date || req.start_date;

    return req.attendance.filter(att => {
        if (!att.date) return false;
        return att.date >= startDate && att.date <= endDate;
    });
};

const isFullDayLeave = (startTime, endTime) => {
    if (!startTime || !endTime) return true;

    const [endHour, endMin] = endTime.split(':').map(Number);
    const endInMinutes = endHour * 60 + (endMin || 0);
    const threshold16PM = 16 * 60;

    return endInMinutes >= threshold16PM;
};

const checkAttendanceStatus = (request) => {
    if (!request) return { label: '-', badgeClass: 'badge-outline' };

    const validAttendance = getValidAttendance(request);
    const hasAttendance = validAttendance.length > 0;

    let isFullDay = false;
    if (!request.end_time) {
        isFullDay = true;
    } else {
        const [hour] = request.end_time.split(':').map(Number);
        if (hour >= 16) {
            isFullDay = true;
        }
    }

    if (hasAttendance) {
        if (!isFullDay) {
            return {
                label: 'มาเรียนแล้ว',
                badgeClass: 'badge-info text-info-content',
                type: 'present_half'
            };
        }
        return {
            label: 'ลงเวลามา',
            badgeClass: 'badge-success text-success-content',
            type: 'present'
        };
    }

    if (isFullDay) {
        return {
            label: 'ลาทั้งวัน',
            badgeClass: 'badge-neutral text-neutral-content',
            type: 'full_day_leave'
        };
    }

    const now = new Date();
    const endDateStr = request.end_date;
    const endTimeStr = request.end_time || '12:00:00';
    const endDateTime = new Date(`${endDateStr}T${endTimeStr}`);

    if (now > endDateTime) {
        return {
            label: 'ยังไม่สแกน',
            badgeClass: 'badge-error text-error-content',
            type: 'expired_absent'
        };
    }

    return {
        label: 'อยู่ระหว่างการลา',
        badgeClass: 'badge-warning text-warning-content',
        type: 'on_leave'
    };
};

watch(() => props.filters, loadLeaveRequests, { deep: true });

loadLeaveRequests();
</script>
