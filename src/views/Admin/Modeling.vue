<template>
    <div class="space-y-6 max-[570px]:pt-14">
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <h1 class="text-lg md:text-3xl font-bold text-white">จัดการเชื่อมต่ออุปกรณ์</h1>
            <div v-if="auth.user?.role !== 'viewer'" class="w-full sm:w-auto flex justify-end">
                <CreateModeling v-if="auth.user?.role !== 'teacher'" @created="fetchData"
                    @selectModeChanged="handleSelectModeChanged" :selected-ids="selectedIds" />
            </div>
        </div>

        <div class="bg-base-100 rounded-lg shadow-lg p-4">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div v-if="auth.user?.role !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ประเภท</span>
                    </label>
                    <select v-model="filters.role" @change="fetchData" class="select select-bordered select-sm w-full">
                        <option value="student">นักเรียน</option>
                        <option value="teacher">อาจารย์</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชื่อ</span>
                    </label>
                    <input v-model="filters.name" type="text" placeholder="ค้นหาชื่อ..."
                        class="input input-bordered input-sm w-full" @keyup.enter="searchByNameOrUserid" />
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">รหัส</span>
                    </label>
                    <input v-model="filters.userid" type="text" placeholder="ค้นหารหัส..."
                        class="input input-bordered input-sm w-full" @keyup.enter="searchByNameOrUserid" />
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">สถานะ</span>
                    </label>
                    <select v-model="filters.status" @change="fetchData"
                        class="select select-bordered select-sm w-full">
                        <option value="all">ทั้งหมด</option>
                        <option value="fail">ไม่สำเร็จ</option>
                        <option value="notlinked">ไม่ได้เชื่อมต่อ</option>
                    </select>
                </div>

                <div v-if="filters.role === 'student' && auth.user?.role !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ชั้นปี</span>
                    </label>
                    <select v-model="filters.grade" @change="fetchData" class="select select-bordered select-sm w-full">
                        <option value="">ทั้งหมด</option>
                        <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
                    </select>
                </div>
                <div v-if="filters.role === 'student' && auth.user?.role !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ห้อง</span>
                    </label>
                    <select v-model="filters.classroom" @change="fetchData"
                        class="select select-bordered select-sm w-full">
                        <option value="">ทั้งหมด</option>
                        <option v-for="room in availableClassrooms" :key="room" :value="room">{{ room }}</option>
                    </select>
                </div>

                <div v-if="filters.role === 'teacher' && auth.user?.role !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">แผนก</span>
                    </label>
                    <select v-model="filters.department" @change="fetchData"
                        class="select select-bordered select-sm w-full">
                        <option value="">ทั้งหมด</option>
                        <option v-for="dept in departments" :key="dept._id" :value="dept.name">{{ dept.name }}</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-3">
                <button @click="resetFilters" class="btn btn-ghost btn-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    รีเซ็ต
                </button>
                <button @click="searchByNameOrUserid" class="btn btn-primary btn-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    ค้นหา
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else>
            <ModelingTable :data="modelings" :page="currentPage" :limit="filters.limit" :selectMode="selectMode"
                :selected-ids="selectedIds" @updated="fetchData" @selectedIds="handleSelectedIds" />

            <div v-if="totalPages > 1" class="flex justify-center mt-6">
                <div class="join">
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="changePage(1)"
                        :disabled="currentPage === 1">
                        «
                    </button>
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="changePage(currentPage - 1)"
                        :disabled="currentPage === 1">
                        ‹
                    </button>
                    <button v-for="page in visiblePages" :key="page"
                        class="join-item btn btn-sm bg-transparent border-none"
                        :class="page === currentPage ? 'bg-base-content/20 font-bold' : ''" @click="changePage(page)">
                        {{ page }}
                    </button>
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="changePage(currentPage + 1)"
                        :disabled="currentPage === totalPages">
                        ›
                    </button>
                    <button class="join-item btn btn-sm bg-transparent border-none" @click="changePage(totalPages)"
                        :disabled="currentPage === totalPages">
                        »
                    </button>
                </div>
            </div>
            <div class="flex flex-col items-center gap-4 mt-6">
                <div class="text-sm text-base-content/60 text-white">
                    ทั้งหมด {{ totalItems }} รายการ (หน้า {{ currentPage }} / {{ totalPages }})
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ClassRoomService } from '../../api/class-room.js';
import { DepartmentService } from '../../api/department.js';
import ModelingTable from "../../components/Modeling/Table.vue";
import CreateModeling from "../../components/Modeling/Create.vue";
import ModelingService from "../../api/modeling.js";
import Swal from "sweetalert2";
import { useAuthStore } from "../../stores/auth.js";

const auth = useAuthStore();

const loading = ref(false);
const modelings = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const selectMode = ref(false);
const selectedIds = ref([]);

const filters = ref({
    role: "student",
    name: "",
    department: "",
    userid: "",
    status: "all",
    limit: 10,
    grade: "",
    classroom: ""
});

const classrooms = ref([]);
const grades = ref([]);
const departments = ref([]);

const availableClassrooms = computed(() => {
    if (!filters.value.grade) return [];
    return classrooms.value.filter(c => c.grade === filters.value.grade).map(c => c.classroom).sort((a, b) => a - b);
});

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});

const fetchData = async () => {
    loading.value = true;
    try {
        let params = { ...filters.value, page: currentPage.value };
        if (params.role === 'student') {
            params.department = '';
        } else if (params.role === 'teacher') {
            params.grade = '';
            params.classroom = '0';
        }
        if (params.status === 'notlinked') {
            params.status = 'notlinked';
        }
        const response = await ModelingService.getModelings(params);

        if (response.message === "Success") {
            const rows = Array.isArray(response.data) ? response.data : [];
            modelings.value = rows.map((row) => ({
                ...row,
                rfid: row?.rfid,
                guardian_phone: row?.guardian_phone
            }));
            totalItems.value = response.total_items || response.data.length;
            totalPages.value = response.total_pages || 1;
        }
    } catch (error) {
        console.error("Error fetching modelings:", error);
        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถโหลดข้อมูลได้",
        });
    } finally {
        loading.value = false;
    }
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchData();
    }
};

const resetFilters = () => {
    filters.value = {
        role: "student",
        name: "",
        department: "",
        userid: "",
        status: "all",
        limit: 10,
    };
    currentPage.value = 1;
    fetchData();
};

function handleSelectedIds(selectedObjs) {
    selectedIds.value = selectedObjs;
}

function handleSelectModeChanged(val) {
    selectMode.value = val;
    if (!val) {
        selectedIds.value = [];
    }
}

function searchByNameOrUserid() {
    currentPage.value = 1;
    fetchData();
}

onMounted(async () => {
    fetchData();
    try {
        const classRoomService = new ClassRoomService();
        const departmentService = new DepartmentService();
        const [classroomRes, departmentRes] = await Promise.all([
            classRoomService.getClassRooms(),
            departmentService.getDepartments()
        ]);
        classrooms.value = classroomRes?.data || [];
        const gradeSet = new Set();
        (classroomRes?.data || []).forEach(room => {
            if (room.grade) gradeSet.add(room.grade);
        });
        grades.value = Array.from(gradeSet);
        departments.value = departmentRes?.data || [];
    } catch (e) {
        classrooms.value = [];
        grades.value = [];
        departments.value = [];
    }
});
</script>

<style scoped>
.join {
    border-radius: 1.5rem;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.06);
    background: #f8fafc;
}

.btn.bg-transparent {
    background: transparent;
}

.bg-base-content\/20 {
    background-color: #e5e7eb !important;
}
</style>
