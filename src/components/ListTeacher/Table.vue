<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <!-- Mobile Card View -->
            <div class="block md:hidden">
                <div v-if="loading" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>
                <div v-else-if="teachers.length === 0" class="text-center py-8 text-base-content/50">
                    ไม่มีข้อมูลบุคลากร
                </div>
                <div v-else class="space-y-4">
                    <div v-for="teacher in teachers" :key="teacher.id"
                        class="bg-base-200 rounded-lg p-4 flex flex-col gap-2 shadow hover:bg-base-300">
                        <div class="flex items-center gap-3">
                            <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                    <img v-if="teacher.picture" :src="teacher.picture" :alt="teacher.name"
                                        class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        @click.stop="openPictureModal(teacher.picture)"
                                        @error="teacher.picture = null" />
                                    <div v-else
                                        class="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                                        <span class="text-sm font-semibold">{{ getInitials(teacher.name) }}</span>
                                        <svg class="ml-1 w-4 h-4 text-base-content/50" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span class="font-medium">{{ teacher.name }}</span>
                                <div class="text-xs text-base-content/70">รหัส: {{ teacher.code }}</div>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 text-sm mt-2">
                            <span class="badge badge-ghost badge-sm">{{ teacher.department }}</span>
                            <span class="badge badge-outline badge-sm">{{ teacher.position }}</span>
                        </div>
                        <div class="flex flex-col gap-2 mt-2">
                            <div>
                                <template v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'">
                                    <button class="btn btn-ghost btn-xs"
                                        :title="teacher.has_password ? 'มีรหัสผ่าน' : 'ยังไม่มีรหัสผ่าน'"
                                        @click="emitReset(teacher)">
                                        <span :class="teacher.has_password ? 'bg-green-500' : 'bg-red-500'"
                                            class="inline-block w-3 h-3 rounded-full"></span>
                                        <span class="ml-2 text-xs">{{ teacher.has_password ? 'มีรหัสผ่าน' :
                                            'ยังไม่มีรหัสผ่าน' }}</span>
                                    </button>
                                </template>
                                <template v-else>
                                    <span :class="teacher.has_password ? 'bg-green-500' : 'bg-red-500'"
                                        class="inline-block w-3 h-3 rounded-full"></span>
                                    <span class="ml-2 text-xs">{{ teacher.has_password ? 'มีรหัสผ่าน' :
                                        'ยังไม่มีรหัสผ่าน'
                                    }}</span>
                                </template>
                            </div>
                            <div v-if="auth.user?.role !== 'teacher'"
                                class="flex gap-2 flex-wrap xs:flex-col xs:items-stretch xs:w-full">
                                <button class="btn btn-sm btn-info btn-outline" @click="emit('detail', teacher)"
                                    title="ดูรายละเอียด">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button v-if="auth.user?.role !== 'viewer'" class="btn btn-sm btn-warning btn-outline"
                                    @click="$emit('edit', teacher)" title="แก้ไข">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button v-if="auth.user?.role !== 'viewer'" class="btn btn-sm btn-error btn-outline"
                                    @click="$emit('delete', teacher)" title="ลบ">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Desktop Table View -->
            <div class="hidden md:block">
                <table class="table table-zebra table-xs sm:table-sm md:table-md">
                    <thead>
                        <tr>
                            <th class="bg-primary text-primary-content hidden xl:table-cell">#</th>
                            <th class="bg-primary text-primary-content">ชื่อ-นามสกุล</th>
                            <th class="bg-primary text-primary-content hidden sm:table-cell">รหัสบุคลากร</th>
                            <th class="bg-primary text-primary-content hidden md:table-cell">
                                <div class="dropdown dropdown-end">
                                    <label tabindex="0"
                                        class="btn btn-ghost btn-xs text-primary-content hover:bg-primary-focus">
                                        แผนก
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </label>
                                    <ul tabindex="0"
                                        class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 text-black border border-base-300 max-h-96 overflow-y-auto"
                                        style="z-index: 1000;">
                                        <li><a @click.prevent="handleDepartmentFilter('')">ทั้งหมด</a></li>
                                        <li v-for="dept in departments" :key="dept._id">
                                            <a @click.prevent="handleDepartmentFilter(dept.name)">
                                                {{ getShortDepartmentName(dept.name) }}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </th>
                            <th class="bg-primary text-primary-content hidden lg:table-cell">
                                <div class="dropdown dropdown-end">
                                    <label tabindex="0"
                                        class="btn btn-ghost btn-xs text-primary-content hover:bg-primary-focus">
                                        ตำแหน่ง
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </label>
                                    <ul tabindex="0"
                                        class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-64 text-black border border-base-300 max-h-96 overflow-y-auto"
                                        style="z-index: 1000;">
                                        <li><a @click.prevent="handlePositionFilter('')">ทั้งหมด</a></li>
                                        <li v-for="pos in positions" :key="pos._id">
                                            <a @click.prevent="handlePositionFilter(pos.name)">{{ pos.name }}</a>
                                        </li>
                                    </ul>
                                </div>
                            </th>
                            <th class="bg-primary text-primary-content text-center">สถานะ</th>
                            <th v-if="auth.user?.role !== 'teacher'"
                                class="bg-primary text-primary-content w-24 text-center">จัดการ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="8" class="text-center py-8">
                                <span class="loading loading-spinner loading-lg text-primary"></span>
                            </td>
                        </tr>
                        <tr v-else-if="teachers.length === 0">
                            <td colspan="8" class="text-center py-8 text-base-content/50">
                                ไม่มีข้อมูลบุคลากร
                            </td>
                        </tr>
                        <tr v-else v-for="(teacher, index) in teachers" :key="teacher.id" class="hover">
                            <td class="hidden xl:table-cell">{{ getRowNumber(index) }}</td>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="avatar">
                                        <div class="w-10 h-10 rounded-full">
                                            <img v-if="teacher.picture" :src="teacher.picture" :alt="teacher.name"
                                                class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                @click.stop="openPictureModal(teacher.picture)"
                                                @error="teacher.picture = null" />
                                            <div v-else
                                                class="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                                                <span class="text-sm font-semibold">{{ getInitials(teacher.name)
                                                    }}</span>
                                                <svg class="ml-1 w-4 h-4 text-base-content/50" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="font-medium">{{ teacher.name }}</span>
                                </div>
                            </td>
                            <td class="hidden sm:table-cell">{{ teacher.code }}</td>
                            <td class="hidden md:table-cell">
                                <span class="badge badge-ghost badge-sm">{{ teacher.department }}</span>
                            </td>
                            <td class="hidden lg:table-cell text-xs">{{ teacher.position }}</td>
                            <td class="text-center">
                                <template v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'">
                                    <button class="btn btn-ghost btn-xs"
                                        :title="teacher.has_password ? 'มีรหัสผ่าน' : 'ยังไม่มีรหัสผ่าน'"
                                        @click="emitReset(teacher)">
                                        <span :class="teacher.has_password ? 'bg-green-500' : 'bg-red-500'"
                                            class="inline-block w-3 h-3 rounded-full"></span>
                                    </button>
                                </template>
                                <template v-else>
                                    <span :class="teacher.has_password ? 'bg-green-500' : 'bg-red-500'"
                                        class="inline-block w-3 h-3 rounded-full"></span>
                                </template>
                            </td>
                            <td v-if="auth.user?.role !== 'teacher'">
                                <div class="flex gap-1 lg:gap-2 justify-center">
                                    <button class="btn btn-xs lg:btn-sm btn-info btn-outline"
                                        @click="emit('detail', teacher)" title="ดูรายละเอียด">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button v-if="auth.user?.role !== 'viewer'" @click="$emit('edit', teacher)"
                                        class="btn btn-xs lg:btn-sm btn-warning btn-outline" title="แก้ไข">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button v-if="auth.user?.role !== 'viewer'" @click="$emit('delete', teacher)"
                                        class="btn btn-xs lg:btn-sm btn-error btn-outline" title="ลบ">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <dialog ref="pictureModal" class="modal">
            <div class="modal-box max-w-xl w-full p-0">
                <form method="dialog">
                    <button
                        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
                </form>
                <img v-if="pictureModalSrc" :src="pictureModalSrc" alt="profile"
                    class="w-full h-auto max-h-[80vh] object-contain" />
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()

const emit = defineEmits(['filterDepartment', 'filterPosition', 'edit', 'reset', 'detail'])

const props = defineProps({
    teachers: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    departmentFilter: {
        type: String,
        default: ''
    },
    positionFilter: {
        type: String,
        default: ''
    },
    departments: {
        type: Array,
        default: () => []
    },
    positions: {
        type: Array,
        default: () => []
    },
    currentPage: {
        type: Number,
        default: 1
    },
    itemsPerPage: {
        type: Number,
        default: 5
    }
})

const localDepartmentFilter = ref(props.departmentFilter)
const localPositionFilter = ref(props.positionFilter)
const pictureModal = ref(null)
const pictureModalSrc = ref(null)

const openPictureModal = (src) => {
    pictureModalSrc.value = src
    pictureModal.value?.showModal()
}

watch(() => props.departmentFilter, (newVal) => {
    localDepartmentFilter.value = newVal
})

watch(() => props.positionFilter, (newVal) => {
    localPositionFilter.value = newVal
})

const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '')
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '')
    }
    return parts[0][0] || '?'
}

const getShortDepartmentName = (name) => {
    if (!name) return ''

    if (name.startsWith('กลุ่มสาระการเรียนรู้')) {
        const shortName = name.replace('กลุ่มสาระการเรียนรู้', 'กลุ่ม')
        return shortName.replace(' และ', '')
    }

    return name
}

const getRowNumber = (index) => {
    return (props.currentPage - 1) * props.itemsPerPage + index + 1
}

const handleDepartmentFilter = (value) => {
    localDepartmentFilter.value = value
    emit('filterDepartment', value)
}

const handlePositionFilter = (value) => {
    localPositionFilter.value = value
    emit('filterPosition', value)
}

const emitReset = (teacher) => {
    emit('reset', teacher)
}
</script>

<style scoped></style>
