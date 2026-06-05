<template>
    <div class="w-full space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h2 class="text-lg md:text-3xl font-bold">รายงานตรวจระเบียบการแต่งตัว</h2>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <input v-model="filters.date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชั้นเรียน</span>
                    </label>
                    <select v-model="filters.grade" class="select select-sm select-bordered w-full"
                        @change="onGradeChange">
                        <option value="">ทั้งหมด</option>
                        <option v-for="grade in gradeOptions" :key="grade" :value="grade">
                            {{ mapGradeDisplay(grade) }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ห้องเรียน</span>
                    </label>
                    <select v-model="filters.classroom" class="select select-sm select-bordered w-full"
                        :disabled="!filters.grade">
                        <option value="">ทั้งหมด</option>
                        <option v-for="room in classroomOptions" :key="room" :value="room">
                            {{ room }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole === 'teacher'" class="form-control col-span-2 flex items-end">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">ชั้นปี / ห้อง</span>
                        <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                    </div>
                </div>

            </div>
        </div>

        <UniformInspectionTable :filters="appliedFilters" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ClassRoomService } from '../../../api/class-room';
import UniformInspectionTable from '../../../components/Report/UniformInspectionTable.vue';
import { mapGradeDisplay, toVisibleSortedGrades } from '../../../utils/gradeSystem';

const classRoomService = new ClassRoomService();

const today = new Date().toISOString().split('T')[0];
const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const classrooms = ref([]);
const filters = ref({
    date: today,
    grade: residentRole === 'teacher' ? teacherGrade : '',
    classroom: residentRole === 'teacher' ? teacherClassroom : '',
    limit: 50,
    page: 1,
});

const appliedFilters = ref({
    date: today,
    grade: residentRole === 'teacher' ? teacherGrade : '',
    classroom: residentRole === 'teacher' ? teacherClassroom : '',
    limit: 50,
    page: 1,
});

const gradeOptions = computed(() => {
    return toVisibleSortedGrades((classrooms.value || []).map((c) => c.grade).filter(Boolean));
});

const classroomOptions = computed(() => {
    if (!filters.value.grade) return [];
    const rooms = (classrooms.value || [])
        .filter((c) => c.grade === filters.value.grade)
        .map((c) => c.classroom)
        .filter((v) => v !== null && v !== undefined && v !== '');
    return [...new Set(rooms)].sort((a, b) => Number(a) - Number(b));
});

const onGradeChange = () => {
    filters.value.classroom = '';
};

const applyFilters = () => {
    appliedFilters.value = {
        date: filters.value.date || '',
        grade: filters.value.grade || '',
        classroom: filters.value.classroom || '',
        limit: 50,
        page: 1,
    };
};

const loadClassrooms = async () => {
    try {
        const response = await classRoomService.getClassRooms();
        classrooms.value = response?.data || [];
    } catch (error) {
        console.error('Load classrooms error:', error);
        classrooms.value = [];
    }
};

onMounted(async () => {
    await loadClassrooms();
});

watch(
    () => [filters.value.date, filters.value.grade, filters.value.classroom],
    () => {
        applyFilters();
    },
    { immediate: true }
);
</script>
