<template>
    <div class="w-full space-y-6 max-[944px]:pt-16">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h2 class="text-lg md:text-3xl font-bold">ตารางการลา</h2>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <input v-model="filters.start_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                <span>-</span>
                <input v-model="filters.end_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ค้นหารหัส</span>
                    </label>
                    <input v-model="filters.search" type="text" placeholder="กรอกรหัส"
                        class="input input-sm input-bordered w-full" />
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">สถานะ</span>
                    </label>
                    <select v-model="filters.status" class="select select-sm select-bordered w-full">
                        <option value="">ทั้งหมด</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="approved">อนุมัติแล้ว</option>
                        <option value="rejected">ไม่อนุมัติ</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ประเภท</span>
                    </label>
                    <select v-model="filters.role" class="select select-sm select-bordered w-full">
                        <option value="">ทั้งหมด</option>
                        <option value="student">นักเรียน</option>
                        <option value="teacher">ครู</option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">ทุกชั้นปี</option>
                        <option v-for="grade in allGrades" :key="grade" :value="grade">
                            {{ mapGradeDisplay(grade) }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ห้อง</span>
                    </label>
                    <select v-model="filters.classroom" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">ทุกห้อง</option>
                        <option v-for="room in allRooms" :key="room" :value="room">
                            {{ room }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole === 'teacher'" class="form-control flex justify-end items-center md:items-end">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">ชั้นปี / ห้อง</span>
                        <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                    </div>
                </div>

            </div>
        </div>

        <div class="w-full max-w-full overflow-hidden">
            <LeaveRequest :filters="filters" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import LeaveRequest from '../../../components/Report/LeaveRequest.vue';
import { ClassRoomService } from '../../../api/class-room.js';
import { mapGradeDisplay, toVisibleSortedGrades } from '../../../utils/gradeSystem';

const today = new Date().toISOString().split('T')[0];
const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const classRoomService = new ClassRoomService();
const allGrades = ref([]);
const allRooms = ref([]);

const filters = ref({
    search: '',
    start_date: today,
    end_date: today,
    status: 'approved',
    role: '',
    grade: '',
    classroom: '',
});

watch(
    () => filters.value.role,
    (role) => {
        if (role === 'teacher') {
            filters.value.grade = '';
            filters.value.classroom = '';
        }
    }
);

onMounted(async () => {
    if (residentRole === 'teacher') {
        filters.value.grade = teacherGrade;
        filters.value.classroom = teacherClassroom;
        return;
    }

    try {
        const res = await classRoomService.getClassRooms();
        const classRooms = Array.isArray(res?.data) ? res.data : [];
        const gradesSet = new Set();
        const roomsSet = new Set();

        classRooms.forEach((item) => {
            if (item?.grade) gradesSet.add(item.grade);
            if (item?.classroom) roomsSet.add(String(item.classroom));
        });

        allGrades.value = toVisibleSortedGrades(Array.from(gradesSet));
        allRooms.value = Array.from(roomsSet);
    } catch (error) {
        console.error('Error fetching class rooms:', error);
    }
});
</script>
