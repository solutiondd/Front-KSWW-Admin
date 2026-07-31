<template>
    <div class="w-full">
        <div class="flex justify-end mb-2" v-if="!hideExport">
            <button class="btn btn-sm btn-success" :disabled="loadingExport" @click="exportActivityToExcel">
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
            <th class="text-center w-12">ลำดับ</th> <!-- เพิ่มคอลัมน์ลำดับ -->
            <th>รหัส</th>
            <th>ชื่อ</th>
            <th>ชั้น</th>
            <th class="hidden min-[560px]:table-cell">กิจกรรม</th>
            <th class="hidden md:table-cell">วันที่กิจกรรม</th>
            <th class="hidden lg:table-cell">การเข้าเรียน</th>
            <th class="text-center"></th>
        </tr>
    </thead>
    <tbody>
        <!-- เพิ่ม index ใน v-for -->
        <tr v-for="(activity, index) in activities"
            :key="activity._id || `${activity.user_id?.userid}-${activity.activity_name}`">
            <td class="text-center text-xs min-[503px]:text-sm font-medium">{{ index + 1 }}</td> <!-- แสดง ลำดับ -->
            <td class="text-xs min-[503px]:text-sm">{{ activity.user_id?.userid || '-' }}</td>
            <td class="text-xs min-[503px]:text-sm">{{ activity.user_id?.name || '-' }}</td>
            <td class="text-xs min-[503px]:text-sm">{{ formatClassroomDisplay(activity.user_id) }}</td>
            <td class="hidden min-[560px]:table-cell">{{ activity.activity_name || '-' }}</td>
            <td class="hidden md:table-cell">
                {{ formatDate(activity.activity_date_start || activity.activity_date || activity.date) }}
                <span v-if="activity.start_time" class="text-xs text-gray-500 block">
                    ({{ formatTimeRange(activity.start_time, activity.end_time) }})
                </span>
            </td>

            <td class="hidden lg:table-cell">
                <div
                    :class="['badge gap-1 h-auto py-1 text-center whitespace-normal md:whitespace-nowrap', checkAttendanceStatus(activity).badgeClass]">
                    {{ checkAttendanceStatus(activity).label }}
                </div>
                <div v-if="getValidAttendance(activity).length" class="text-xs text-gray-400 mt-1">
                    สแกนล่าสุด: {{ getValidAttendance(activity)[getValidAttendance(activity).length - 1].time }} น.
                </div>
            </td>

            <td class="text-center">
                <button @click="openDetail(activity)" class="bg-transparent border-none shadow-none p-0"
                    title="ดูข้อมูลเพิ่มเติม">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="#3b82f6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </td>
        </tr>
        <tr v-if="!activities.length">
            <td colspan="8" class="text-center text-gray-500 py-6">ไม่พบข้อมูลกิจกรรม</td> <!-- ปรับ colspan เป็น 8 -->
        </tr>
    </tbody>
</table>
        </div>

        <ActivityDetail ref="activityDetailRef" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ActivityService } from '../../api/activity';
import ActivityDetail from './ActivityDetail.vue';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const props = defineProps({
    filters: {
        type: Object,
        default: () => ({
            start_date: '',
            end_date: '',
            search: '',
            status: '',
            role: '',
            activity_name: '',
            grade: '',
            classroom: '',
        }),
    },
    hideExport: {
        type: Boolean,
        default: false,
    },
});

const activityService = new ActivityService();
const loading = ref(false);
const loadingExport = ref(false);
const activities = ref([]);
const activityDetailRef = ref(null);

const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

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

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d);
};

const getValidAttendance = (req) => {
    if (!req || !req.attendance || !req.attendance.length) return [];
    const startDate = req.activity_date_start ? req.activity_date_start.split('T')[0] : '';
    const endDate = req.activity_date_end ? req.activity_date_end.split('T')[0] : startDate;

    return req.attendance.filter(att => {
        if (!att.date) return false;
        return att.date >= startDate && att.date <= endDate;
    });
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
        if (hour >= 16) isFullDay = true;
    }

    if (hasAttendance) {
        if (!isFullDay) {
            return { label: 'มาเรียนแล้ว', badgeClass: 'badge-info text-info-content', type: 'present_half' };
        }
        return { label: 'ลงเวลามา', badgeClass: 'badge-success text-success-content', type: 'present' };
    }

    if (isFullDay) {
        return { label: 'กิจกรรมทั้งวัน', badgeClass: 'badge-neutral text-neutral-content', type: 'full_day' };
    }

    const now = new Date();
    const endDateStr = request.activity_date_end ? request.activity_date_end.split('T')[0] : '';
    const endTimeStr = request.end_time || '12:00:00';
    const endDateTime = new Date(`${endDateStr}T${endTimeStr}`);

    if (now > endDateTime) {
        return { label: 'ยังไม่สแกน', badgeClass: 'badge-error text-error-content', type: 'expired_absent' };
    }

    return { label: 'อยู่ระหว่างกิจกรรม', badgeClass: 'badge-warning text-warning-content', type: 'on_activity' };
};

const formatClassroomDisplay = (user) => {
    if (!user) return '-';
    if (user.role === 'teacher') return 'ครู';
    if (user.grade && user.classroom) {
        return formatGradeClassroomDisplay
            ? formatGradeClassroomDisplay(user.grade, user.classroom)
            : `${user.grade}/${user.classroom}`;
    }
    return '-';
};

const formatTime = (time) => {
    if (!time) return '';
    const parts = String(time).split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
};

const openDetail = (activity) => {
    activityDetailRef.value?.openModal(activity);
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '-';
    const formattedStart = formatTime(startTime);
    const formattedEnd = formatTime(endTime);

    if (formattedStart && formattedEnd) return `${formattedStart} - ${formattedEnd}`;
    return formattedStart || formattedEnd || '-';
};

const exportActivityToExcel = async () => {
    if (loadingExport.value) return;
    loadingExport.value = true;

    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('ActivityReport');

        let reportRange = '';
        if (props.filters?.start_date && props.filters?.end_date) {
            reportRange = `(${formatDate(props.filters.start_date)} - ${formatDate(props.filters.end_date)})`;
        }

        worksheet.addRow([`รายงานกิจกรรม ${reportRange}`]);
        worksheet.mergeCells('A1:I1');
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { bold: true };

        const headers = [
            'ลำดับ',
            'รหัส',
            'ชื่อ',
            'ตำแหน่ง',
            'ชื่อกิจกรรม',
            'สถานที่',
            'ช่วงเวลา',
            'วันที่กิจกรรม',
            'สถานะ',
        ];
        worksheet.addRow(headers);

        activities.value.forEach((item, index) => {
            worksheet.addRow([
                index + 1,
                item.user_id?.userid || '-',
                item.user_id?.name || '-',
                formatRole(item.user_id?.role),
                item.activity_name || '-',
                item.location || '-',
                formatTimeRange(item.start_time, item.end_time),
                formatDate(item.activity_date_start || item.activity_date || item.date),
                formatStatus(item.status),
            ]);
        });

        worksheet.columns = [
            { width: 10 },
            { width: 16 },
            { width: 24 },
            { width: 14 },
            { width: 36 },
            { width: 28 },
            { width: 20 },
            { width: 18 },
            { width: 16 },
        ];

        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(4).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(6).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(7).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(8).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(9).alignment = { horizontal: 'center', vertical: 'middle' };

        const safeStart = props.filters?.start_date || '';
        const safeEnd = props.filters?.end_date || '';
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `ActivityReport_${safeStart}_${safeEnd}.xlsx`);
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการส่งออก Excel');
        console.error('Error exporting activity report:', error);
    } finally {
        loadingExport.value = false;
    }
};

const extractRows = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.results)) return response.results;
    return [];
};

const loadActivities = async () => {
    loading.value = true;
    try {
        const startDate = props.filters.start_date || '';
        const endDate = props.filters.end_date || '';
        const filters = {};

        if (props.filters.status) {
            filters.status = props.filters.status;
        }

        if (props.filters.activity_name) {
            filters.activity_name = props.filters.activity_name;
        }

        if (props.filters.grade) {
            filters.grade = props.filters.grade;
        }

        if (props.filters.classroom) {
            filters.classroom = props.filters.classroom;
        }

        const search = String(props.filters.search || '').trim();
        if (search && /^\d+$/.test(search)) {
            filters.userid = search;
        }

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            filters.grade = teacherGrade;
            filters.classroom = teacherClassroom;
        }

        const response = await activityService.getActivities(startDate, endDate, filters);
        let data = extractRows(response);

        if (props.filters.role) {
            data = data.filter((item) => item.user_id?.role === props.filters.role);
        }

        if (search) {
            const keyword = search.toLowerCase();
            data = data.filter(
                (item) =>
                    item.user_id?.name?.toLowerCase().includes(keyword) ||
                    item.user_id?.userid?.toLowerCase().includes(keyword) ||
                    item.activity_name?.toLowerCase().includes(keyword)
            );
        }

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            data = data.filter(
                (item) =>
                    item.user_id?.grade === teacherGrade &&
                    item.user_id?.classroom === teacherClassroom
            );
        }

        activities.value = data;
    } catch (error) {
        console.error('Error loading activities:', error);
        activities.value = [];
    } finally {
        loading.value = false;
    }
};

watch(() => props.filters, loadActivities, { deep: true });

loadActivities();
</script>
