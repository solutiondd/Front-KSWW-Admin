<template>
    <div class="w-full">
        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="table table-zebra w-full text-sm">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th class="hidden xl:table-cell">ตำแหน่ง</th>
                        <th class="hidden lg:table-cell">กิจกรรม</th>
                        <th class="hidden md:table-cell">วันที่กิจกรรม</th>
                        <!-- <th>สถานะ</th> -->
                        <th class="text-center"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="activity in activities"
                        :key="activity._id || `${activity.user_id?.userid}-${activity.activity_name}-${activity.activity_date_start || activity.date}`">
                        <td>{{ activity.user_id?.userid || '-' }}</td>
                        <td>{{ activity.user_id?.name || '-' }}</td>
                        <td class="hidden xl:table-cell">{{ formatRole(activity.user_id?.role) }}</td>
                        <td class="hidden lg:table-cell">{{ activity.activity_name || '-' }}</td>
                        <td class="hidden md:table-cell">{{ formatDate(activity.activity_date_start ||
                            activity.activity_date || activity.date) }}</td>
                        <!-- <td>
                            <div :class="['badge', getStatusBadgeClass(activity.status), 'w-3 h-3 p-0 md:w-auto md:h-auto md:px-3']"
                                :title="formatStatus(activity.status)">
                                <span class="hidden md:inline">{{ formatStatus(activity.status) }}</span>
                            </div>
                        </td> -->
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
                        <td colspan="7" class="text-center text-gray-500 py-6">ไม่พบข้อมูลกิจกรรม</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ActivityDetail ref="activityDetailRef" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ActivityService } from '../../api/activity';
import ActivityDetail from './ActivityDetail.vue';

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
});

const activityService = new ActivityService();
const loading = ref(false);
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

const openDetail = (activity) => {
    activityDetailRef.value?.openModal(activity);
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
