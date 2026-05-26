<template>
    <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg">
        <table class="table table-zebra w-full">
            <thead>
                <tr class="bg-primary text-primary-content">
                    <th v-if="selectMode" class="text-center">
                        <input type="checkbox" :checked="selectedAll"
                            @change="toggleSelectAll($event.target.checked)" />
                    </th>
                    <th class="text-center">ลำดับ</th>
                    <th>ชื่อ-สกุล</th>
                    <th class="text-center">รหัสนักเรียน/รหัสอาจารย์</th>
                    <th class="text-center">ตำแหน่ง</th>
                    <th class="text-center">ห้องเรียน/แผนก</th>
                    <th class="text-center">สถานะการเชื่อมต่อ</th>
                    <th v-if="auth.user?.role !== 'viewer'" class="text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="data.length === 0">
                    <td :colspan="selectMode ? 8 : 7" class="text-center py-8 text-base-content/60">
                        ไม่พบข้อมูล
                    </td>
                </tr>
                <tr v-for="(item, index) in data" :key="item._id" class="hover"
                    :class="{ 'cursor-pointer': selectMode }" @click="handleRowClick(item)">
                    <td v-if="selectMode" class="text-center">
                        <input type="checkbox" :checked="isSelected(item)" @click.stop
                            @change="toggleSelect(item, $event.target.checked)" />
                    </td>
                    <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                    <td>
                        <div class="flex items-center gap-3">
                            <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                    <img v-if="item.picture" :src="getPictureUrl(item.picture)" :alt="item.name"
                                        class="w-full h-full object-cover" @error="item.picture = null" />
                                    <div v-else
                                        class="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                                        <span class="text-sm font-semibold">{{ getInitials(item.name) }}</span>
                                    </div>
                                </div>
                            </div>
                            <span class="font-medium">{{ item.name }}</span>
                        </div>
                    </td>
                    <td class="text-center">{{ item.userid }}</td>
                    <td class="text-center">{{ item.position }}</td>
                    <td class="text-center">
                        <span v-if="item.role === 'student'">
                            {{ item.grade }} / {{ item.classroom }}
                        </span>
                        <span v-else>
                            {{ item.department || '-' }}
                        </span>
                    </td>
                    <td>
                        <div v-if="!item.modeling || item.modeling.length === 0 || !item.modeling[0].device || Object.keys(item.modeling[0].device).length === 0"
                            class="text-center text-base-content/60">
                            ยังไม่ได้เชื่อมต่ออุปกรณ์
                        </div>
                        <div v-else class="flex items-center justify-center gap-2">
                            <div v-for="(model, idx) in item.modeling" :key="idx" class="tooltip tooltip-top"
                                :data-tip="`${model.device.location} - ${statusLabel(model.status)}${model.result_msg ? ' (' + model.result_msg + ')' : ''}`">
                                <div :class="[
                                    'w-3 h-3 rounded-full cursor-help transition-transform hover:scale-125',
                                    statusColorClass(model.status)
                                ]" :aria-label="statusLabel(model.status)" role="img"></div>
                            </div>
                        </div>
                    </td>
                    <td v-if="auth.user?.role !== 'viewer'" @click.stop>
                        <div class="flex justify-center gap-2">
                            <DetailModeling :item="item" @updated="$emit('updated')" />
                            <button class="btn btn-xs btn-warning" @click="handleEdit(item)" title="แก้ไข">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="lg:hidden space-y-4">
        <div v-if="data.length === 0" class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
            ไม่พบข้อมูล
        </div>
        <div v-for="(item, index) in data" :key="item._id" class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3"
            :class="{ 'cursor-pointer': selectMode }" @click="handleRowClick(item)">
            <div class="flex justify-between items-start">
                <div v-if="selectMode" class="mr-2 flex items-center" @click.stop>
                    <input type="checkbox" :checked="isSelected(item)"
                        @change="toggleSelect(item, $event.target.checked)" />
                </div>
                <div class="flex-1">
                    <div class="badge badge-primary badge-sm mb-2">{{ (page - 1) * limit + index + 1 }}</div>
                    <div class="flex items-center gap-3 mb-1">
                        <div class="avatar">
                            <div class="w-10 h-10 rounded-full">
                                <img v-if="item.picture" :src="getPictureUrl(item.picture)" :alt="item.name"
                                    class="w-full h-full object-cover" @error="item.picture = null" />
                                <div v-else
                                    class="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                                    <span class="text-sm font-semibold">{{ getInitials(item.name) }}</span>
                                </div>
                            </div>
                        </div>
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                    </div>
                    <p class="text-sm text-base-content/70">รหัส: {{ item.userid }}</p>
                </div>
            </div>

            <div class="divider my-2"></div>

            <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span class="text-base-content/60">ตำแหน่ง:</span>
                    <p class="font-medium">{{ item.position }}</p>
                </div>
                <div>
                    <span class="text-base-content/60">
                        <span v-if="item.role === 'student'">ห้องเรียน:</span>
                        <span v-else>แผนก:</span>
                    </span>
                    <p class="font-medium">
                        <span v-if="item.role === 'student'">
                            {{ item.grade }} / {{ item.classroom }}
                        </span>
                        <span v-else>
                            {{ item.department || '-' }}
                        </span>
                    </p>
                </div>
            </div>

            <div class="divider my-2"></div>

            <div>
                <span class="text-sm text-base-content/60 block mb-2">สถานะการเชื่อมต่อ:</span>
                <div v-if="!item.modeling || item.modeling.length === 0 || !item.modeling[0].device || Object.keys(item.modeling[0].device).length === 0"
                    class="text-center text-base-content/60">
                    ยังไม่ได้เชื่อมต่ออุปกรณ์
                </div>
                <div v-else class="flex flex-wrap gap-2">
                    <div v-for="(model, idx) in item.modeling" :key="idx" class="tooltip tooltip-top"
                        :data-tip="`${model.device.location} - ${statusLabel(model.status)}${model.result_msg ? ' (' + model.result_msg + ')' : ''}`">
                        <div :class="[
                            'w-4 h-4 rounded-full cursor-help transition-transform hover:scale-125',
                            statusColorClass(model.status)
                        ]" :aria-label="statusLabel(model.status)" role="img"></div>
                    </div>
                </div>
            </div>

            <div v-if="auth.user?.role !== 'viewer'" class="mt-3" @click.stop>
                <div class="divider my-2"></div>
                <div class="flex justify-end gap-2">
                    <DetailModeling :item="item" @updated="$emit('updated')" />
                    <button class="btn btn-xs btn-warning"
                        :class="detailItem && detailItem._id === item._id ? 'btn-outline' : ''"
                        @click="handleEdit(item)" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-4 text-xs">
        <div class="flex items-center gap-1 text-white">
            <span class="w-3 h-3 rounded-full bg-info inline-block"></span> กำลังเชื่อมโยงอุปกรณ์
        </div>
        <div class="flex items-center gap-1 text-white">
            <span class="w-3 h-3 rounded-full bg-success inline-block"></span> สำเร็จ
        </div>
        <div class="flex items-center gap-1 text-white">
            <span class="w-3 h-3 rounded-full bg-error inline-block"></span> เชื่อมโยงไม่สำเร็จ
        </div>
        <div class="flex items-center gap-1 text-white">
            <span class="w-3 h-3 rounded-full bg-warning inline-block"></span> กำลังลบเชื่อมโยงอุปกรณ์
        </div>
        <UpdateStudent ref="updateStudentRef" :classrooms="classrooms"
            @success="() => emit('updated', { refresh: true, key: Math.random() })" emitRaw />
        <UpdateTeacher ref="updateTeacherRef" :departments="departments" :positions="positions"
            @success="() => emit('updated', { refresh: true, key: Math.random() })" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import DetailModeling from './Detail.vue';
import UpdateTeacher from '../ListTeacher/Update.vue';
import UpdateStudent from '../ListStudent/Update.vue';
import { ClassRoomService } from '../../api/class-room.js';
import { DepartmentService } from '../../api/department.js';
import { PositionService } from '../../api/position.js';
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const classrooms = ref([])
const departments = ref([])
const positions = ref([])

onMounted(async () => {
    try {
        const classRoomService = new ClassRoomService();
        const departmentService = new DepartmentService();
        const positionService = new PositionService();

        const [classroomRes, departmentRes, positionRes] = await Promise.all([
            classRoomService.getClassRooms(),
            departmentService.getDepartments(),
            positionService.getPositions()
        ]);

        classrooms.value = classroomRes?.data || [];
        departments.value = departmentRes?.data || [];
        positions.value = positionRes?.data || [];
    } catch (e) {
        classrooms.value = [];
        departments.value = [];
        positions.value = [];
    }
});

const updateStudentRef = ref(null)
const updateTeacherRef = ref(null)

const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const handleEdit = (item) => {
    const pictureUrl = getPictureUrl(item.picture);
    if (item.role === 'student') {
        updateStudentRef.value?.openModal({
            id: item._id,
            name: item.name,
            userid: item.userid,
            code: item.userid,
            grade: item.grade,
            room: item.classroom,
            rfid: item.rfid,
            guardian_phone: item.guardian_phone,
            picture: pictureUrl
        });
    } else {
        updateTeacherRef.value?.openModal({
            id: item._id,
            name: item.name,
            userid: item.userid,
            position: item.position,
            department: item.department,
            rfid: item.rfid,
            guardian_phone: item.guardian_phone,
            picture: pictureUrl
        });
    }
};

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    page: {
        type: Number,
        default: 1,
    },
    limit: {
        type: Number,
        default: 10,
    },
    selectMode: {
        type: Boolean,
        default: false,
    },
    selectedIds: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['updated', 'selectedIds']);


const selectedAll = ref(false);

function isSelected(item) {
    return props.selectedIds.some(obj => obj._id === item._id);
}

function toggleSelect(item, checked) {
    let newArr = Array.isArray(props.selectedIds) ? [...props.selectedIds] : [];
    if (checked) {
        if (!newArr.some(obj => obj._id === item._id)) {
            newArr.push({
                _id: item._id,
                name: item.name,
                userid: item.userid,
                picture: item.picture || null
            });
        }
    } else {
        newArr = newArr.filter(obj => obj._id !== item._id);
    }
    emit('selectedIds', newArr);
}

function handleRowClick(item) {
    if (!props.selectMode) return;
    toggleSelect(item, !isSelected(item));
}

watch(() => props.selectMode, (val) => {
    if (!val) {
        selectedAll.value = false;
    }
});

const toggleSelectAll = (checked) => {
    let newArr = Array.isArray(props.selectedIds) ? [...props.selectedIds] : [];
    if (checked) {
        props.data.forEach(item => {
            if (!newArr.some(obj => obj._id === item._id)) {
                newArr.push({
                    _id: item._id,
                    name: item.name,
                    userid: item.userid,
                    picture: item.picture || null
                });
            }
        });
        selectedAll.value = true;
    } else {
        const idsInData = props.data.map(item => item._id);
        newArr = newArr.filter(obj => !idsInData.includes(obj._id));
        selectedAll.value = false;
    }
    emit('selectedIds', newArr);
};

const statusLabel = (s) => {
    if (s === 0) return 'กำลังเชื่อมโยงอุปกรณ์';
    if (s === 2) return 'สำเร็จ';
    if (s === 4) return 'เชื่อมโยงไม่สำเร็จ';
    if (s === 5) return 'กำลังลบเชื่อมโยงอุปกรณ์';
    return 'ไม่ทราบสถานะ';
}

const statusColorClass = (s) => {
    if (s === 0) return 'bg-info';
    if (s === 2) return 'bg-success';
    if (s === 4) return 'bg-error';
    if (s === 5) return 'bg-warning';
    return 'bg-base-300';
}

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '');
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '');
    }
    return parts[0][0] || '?';
};
const detailItem = ref(null);
</script>

<style scoped></style>
