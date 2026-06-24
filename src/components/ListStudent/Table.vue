<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <div class="block md:hidden">
                <div v-if="loading" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>
                <div v-else-if="students.length === 0" class="text-center py-8 text-base-content/50">
                    ไม่มีข้อมูลนักเรียน
                </div>
                <div v-else class="space-y-4">
                    <div v-for="student in students" :key="student.id"
                        class="bg-base-200 rounded-lg p-4 flex flex-col gap-2 shadow hover:bg-base-300">
                        <div class="flex items-center gap-3">
                            <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                    <img v-if="student.picture" :src="student.picture" :alt="student.name"
                                        class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        @click.stop="openPictureModal(student.picture)" />
                                    <div v-else
                                        class="w-full h-full bg-secondary text-secondary-content flex items-center justify-center">
                                        <span class="text-sm font-semibold">{{ getInitials(student.name) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span class="font-medium">{{ student.name }}</span>
                                <div class="text-xs text-base-content/70">รหัส: {{ student.code }}</div>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 text-sm mt-2">
                            <span class="badge badge-primary badge-sm">{{ mapGradeDisplay(student.grade) }}</span>
                            <span class="badge badge-outline badge-sm">ห้อง {{ student.room }}</span>
                            <span class="badge badge-sm font-semibold" :class="getScoreBadgeClass(student.score)">
                                คะแนน {{ getScoreDisplay(student.score) }}
                            </span>
                        </div>
                        <div class="flex flex-col gap-2 mt-2">
                            <div class="flex items-center justify-between gap-2">
                                <div class="inline-flex items-center gap-1">
                                    <template v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'">
                                        <button class="btn btn-ghost btn-xs"
                                            :title="student.has_password ? 'มีรหัสผ่าน' : 'ยังไม่มีรหัสผ่าน'"
                                            @click="emitReset(student)">
                                            <span :class="student.has_password ? 'bg-green-500' : 'bg-red-500'"
                                                class="inline-block w-3 h-3 rounded-full"></span>
                                            <span class="ml-2 text-xs">{{ student.has_password ? 'มีรหัสผ่าน' :
                                                'ยังไม่มีรหัสผ่าน' }}</span>
                                        </button>
                                    </template>
                                    <template v-else>
                                        <span :class="student.has_password ? 'bg-green-500' : 'bg-red-500'"
                                            class="inline-block w-3 h-3 rounded-full"></span>
                                        <span class="text-xs">{{ student.has_password ? 'มีรหัสผ่าน' :
                                            'ยังไม่มีรหัสผ่าน'
                                            }}</span>
                                    </template>
                                </div>
                                <span v-if="hasGuardian(student)" class="inline-flex items-center shrink-0">
                                    <span class="guardian-popover-root relative inline-flex items-center">
                                        <button type="button"
                                            class="relative inline-flex h-5 min-w-10 items-center justify-center rounded-full bg-[#06C755] px-2 text-[10px] font-bold tracking-wide text-white cursor-pointer"
                                            :aria-expanded="isGuardianOpen(student)"
                                            @click.stop="toggleGuardian(student)">
                                            <span>LINE</span>
                                            <span v-if="getGuardianCount(student) > 1"
                                                class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-error-content shadow">
                                                {{ getGuardianCount(student) }}
                                            </span>
                                        </button>
                                        <div v-if="isGuardianOpen(student)" @click.stop
                                            class="absolute right-full top-1/2 z-50 mr-2 w-64 max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-xl border border-base-300 bg-base-100 p-3 text-left shadow-xl md:left-auto md:right-0 md:translate-x-0">
                                            <div v-for="(guardian, guardianIndex) in getGuardians(student)"
                                                :key="guardian.key" class="flex items-start justify-between gap-3"
                                                :class="guardianIndex < getGuardianCount(student) - 1 ? 'mb-3 border-b border-base-200 pb-3' : ''">
                                                <div class="flex items-center gap-3 min-w-0">
                                                    <div class="avatar">
                                                        <div class="w-12 h-12 rounded-full bg-base-200 overflow-hidden">
                                                            <img v-if="guardian.picture" :src="guardian.picture"
                                                                :alt="guardian.name || 'guardian'"
                                                                class="w-full h-full object-cover" />
                                                            <div v-else
                                                                class="w-full h-full flex items-center justify-center text-xs text-base-content/60">
                                                                ไม่มีรูป
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="min-w-0">
                                                        <div class="text-xs text-base-content/60">
                                                            ผู้ปกครอง LINE{{ getGuardianCount(student) > 1 ? `
                                                            ${guardianIndex + 1}` : '' }}
                                                        </div>
                                                        <div class="font-medium truncate">{{ guardian.name || '-' }}
                                                        </div>
                                                        <div class="text-xs text-base-content/70">{{ guardian.phone ||
                                                            '-' }}</div>
                                                    </div>
                                                </div>
                                                <button type="button" class="btn btn-ghost btn-xs btn-square text-error"
                                                    :title="guardian.lineuserId ? 'ลบ' : 'ไม่พบ lineuser_id'"
                                                    :disabled="guardianDeletingKey === guardian.key"
                                                    @click.stop="deleteGuardianLine(student, guardian)">
                                                    <span v-if="guardianDeletingKey === guardian.key"
                                                        class="loading loading-spinner loading-xs"></span>
                                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </span>
                                </span>
                            </div>
                            <div class="flex gap-2 flex-wrap xs:flex-col xs:items-stretch xs:w-full">
                                <button class="btn btn-sm btn-info btn-outline" @click="emitDetail(student)"
                                    title="ดูรายละเอียด">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'"
                                    class="btn btn-sm btn-warning btn-outline" @click="emitEdit(student)" title="แก้ไข">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'"
                                    class="btn btn-sm btn-error btn-outline" @click="emitDelete(student)" title="ลบ">
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
            <div class="hidden md:block">
                <table class="table table-zebra table-xs sm:table-sm md:table-md student-table">
                    <thead>
                        <tr>
                            <th class="bg-primary text-primary-content hidden lg:table-cell">#</th>
                            <th class="bg-primary text-primary-content">ชื่อ-นามสกุล</th>
                            <th class="bg-primary text-primary-content hidden sm:table-cell">รหัสนักเรียน</th>
                            <th class="bg-primary text-primary-content">ระดับชั้น</th>
                            <th class="bg-primary text-primary-content hidden md:table-cell">ห้อง</th>
                            <th class="bg-primary text-primary-content text-center hidden xl:table-cell">คะแนน</th>
                            <th class="bg-primary text-primary-content text-center">สถานะ</th>
                            <th class="bg-primary text-primary-content text-center">
                                จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="p-0">
                        <tr v-if="loading">
                            <td colspan="8" class="text-center py-8">
                                <span class="loading loading-spinner loading-lg text-primary"></span>
                            </td>
                        </tr>
                        <tr v-else-if="students.length === 0">
                            <td colspan="8" class="text-center py-8 text-base-content/50">
                                ไม่มีข้อมูลนักเรียน
                            </td>
                        </tr>
                        <tr v-else v-for="(student, index) in students" :key="student.id" class="hover">
                            <td class="hidden lg:table-cell">{{ getRowNumber(index) }}</td>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="avatar">
                                        <div class="w-10 h-10 rounded-full">
                                            <img v-if="student.picture" :src="student.picture" :alt="student.name"
                                                class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                @click.stop="openPictureModal(student.picture)"
                                                @error="student.picture = null" />
                                            <div v-else
                                                class="w-full h-full bg-secondary text-secondary-content flex items-center justify-center">
                                                <span class="text-sm font-semibold">{{ getInitials(student.name)
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
                                    <span class="font-medium">{{ student.name }}</span>
                                </div>
                            </td>
                            <td class="hidden sm:table-cell">{{ student.code }}</td>
                            <td>
                                <span class="badge badge-primary badge-sm">{{ mapGradeDisplay(student.grade) }}</span>
                            </td>
                            <td class="hidden md:table-cell">{{ student.room }}</td>
                            <td class="text-center hidden xl:table-cell">
                                <span class="badge badge-sm font-semibold" :class="getScoreBadgeClass(student.score)">
                                    {{ getScoreDisplay(student.score) }}
                                </span>
                            </td>
                            <td class="text-center">
                                <div
                                    class="flex items-center justify-center gap-2 max-[1070px]:flex-col max-[1070px]:gap-1">
                                    <template v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'">
                                        <button class="btn btn-ghost btn-xs"
                                            :title="student.has_password ? 'มีรหัสผ่าน' : 'ยังไม่มีรหัสผ่าน'"
                                            @click="emitReset(student)">
                                            <span :class="student.has_password ? 'bg-green-500' : 'bg-red-500'"
                                                class="inline-block w-3 h-3 rounded-full"></span>
                                        </button>
                                    </template>
                                    <template v-else>
                                        <span :class="student.has_password ? 'bg-green-500' : 'bg-red-500'"
                                            class="inline-block w-3 h-3 rounded-full"></span>
                                    </template>

                                    <span v-if="hasGuardian(student)"
                                        class="guardian-popover-root relative inline-flex items-center">
                                        <button type="button"
                                            class="relative inline-flex h-5 min-w-10 items-center justify-center rounded-full bg-[#06C755] px-2 text-[10px] font-bold tracking-wide text-white cursor-pointer"
                                            :aria-expanded="isGuardianOpen(student)"
                                            @click.stop="toggleGuardian(student)">
                                            <span>LINE</span>
                                            <span v-if="getGuardianCount(student) > 1"
                                                class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-error-content shadow">
                                                {{ getGuardianCount(student) }}
                                            </span>
                                        </button>
                                        <div v-if="isGuardianOpen(student)" @click.stop
                                            class="absolute right-full top-1/2 z-50 mr-2 w-64 max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-xl border border-base-300 bg-base-100 p-3 text-left shadow-xl md:left-auto md:right-0 md:translate-x-0">
                                            <div v-for="(guardian, guardianIndex) in getGuardians(student)"
                                                :key="guardian.key" class="flex items-start justify-between gap-3"
                                                :class="guardianIndex < getGuardianCount(student) - 1 ? 'mb-3 border-b border-base-200 pb-3' : ''">
                                                <div class="flex items-center gap-3 min-w-0">
                                                    <div class="avatar">
                                                        <div class="w-12 h-12 rounded-full bg-base-200 overflow-hidden">
                                                            <img v-if="guardian.picture" :src="guardian.picture"
                                                                :alt="guardian.name || 'guardian'"
                                                                class="w-full h-full object-cover" />
                                                            <div v-else
                                                                class="w-full h-full flex items-center justify-center text-xs text-base-content/60">
                                                                ไม่มีรูป
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="min-w-0">
                                                        <div class="text-xs text-base-content/60">
                                                            ผู้ปกครอง LINE{{ getGuardianCount(student) > 1 ? `
                                                            ${guardianIndex + 1}`
                                                                : '' }}
                                                        </div>
                                                        <div class="font-medium truncate">{{ guardian.name || '-' }}
                                                        </div>
                                                        <div class="text-xs text-base-content/70">{{ guardian.phone ||
                                                            '-' }}</div>
                                                    </div>
                                                </div>
                                                <button type="button" class="btn btn-ghost btn-xs btn-square text-error"
                                                    :title="guardian.lineuserId ? 'ลบ' : 'ไม่พบ lineuser_id'"
                                                    :disabled="guardianDeletingKey === guardian.key"
                                                    @click.stop="deleteGuardianLine(student, guardian)">
                                                    <span v-if="guardianDeletingKey === guardian.key"
                                                        class="loading loading-spinner loading-xs"></span>
                                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div class="flex gap-1 lg:gap-2 justify-center">
                                    <button class="btn btn-xs xl:btn-sm btn-info btn-outline"
                                        @click="emitDetail(student)" title="ดูรายละเอียด">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <button v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'"
                                        class="btn btn-xs xl:btn-sm btn-warning btn-outline" @click="emitEdit(student)"
                                        title="แก้ไข">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'"
                                        class="btn btn-xs xl:btn-sm btn-error btn-outline" @click="emitDelete(student)"
                                        title="ลบ">
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { StudentService } from '../../api/student'
import { mapGradeDisplay } from '../../utils/gradeSystem'
const auth = useAuthStore()
const openGuardianKey = ref(null)
const guardianDeletingKey = ref(null)
const studentService = new StudentService()
const pictureModal = ref(null)
const pictureModalSrc = ref(null)

const openPictureModal = (src) => {
    pictureModalSrc.value = src
    pictureModal.value?.showModal()
}
const props = defineProps({
    students: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
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

const emit = defineEmits(['edit', 'delete', 'reset', 'detail', 'refresh'])

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

const getRowNumber = (index) => {
    return (props.currentPage - 1) * props.itemsPerPage + index + 1
}

const getScoreDisplay = (score) => {
    const value = Number(score)
    return Number.isNaN(value) ? '-' : value
}

const getScoreBadgeClass = (score) => {
    const value = Number(score)
    if (Number.isNaN(value)) return 'badge-ghost'
    if (value >= 101) return 'bg-gradient-to-r from-blue-800 to-emerald-500 text-white border-transparent'
    if (value >= 81) return 'bg-green-600 text-white border-green-700'
    if (value >= 61) return 'bg-lime-300 text-lime-900 border-lime-400'
    if (value >= 41) return 'bg-yellow-300 text-yellow-900 border-yellow-400'
    if (value >= 21) return 'bg-orange-400 text-white border-orange-500'
    if (value >= 1) return 'bg-red-500 text-white border-red-600'
    return 'bg-black text-white border-black'
}

const getGuardianLineUserId = (guardian, student) => {
    if (guardian) {
        return guardian?._id || guardian?.lineuser_id || guardian?.line_user_id || guardian?.lineUserId || ''
    }
    const guardianSource = student?.guadians ?? student?.guardians
    const primaryGuardian = Array.isArray(guardianSource) ? guardianSource[0] : guardianSource
    return primaryGuardian?._id || primaryGuardian?.lineuser_id || primaryGuardian?.line_user_id || primaryGuardian?.lineUserId || student?.lineuser_id || student?.line_user_id || ''
}

const getGuardians = (student) => {
    const guardianSource = student?.guadians ?? student?.guardians

    if (!guardianSource) {
        return []
    }

    const guardianList = Array.isArray(guardianSource) ? guardianSource : [guardianSource]

    return guardianList.map((guardian, index) => ({
        key: `${getGuardianKey(student)}-${getGuardianLineUserId(guardian, student) || index}`,
        name: guardian?.name || '',
        picture: guardian?.picture || '',
        phone: guardian?.guardian_phone || guardian?.phone || (guardianList.length === 1 ? student?.guardian_phone || '' : ''),
        lineuserId: getGuardianLineUserId(guardian, student)
    }))
}

const getGuardianCount = (student) => getGuardians(student).length

const hasGuardian = (student) => {
    return getGuardianCount(student) > 0
}

const getGuardianKey = (student) => {
    return student?.id ?? student?.userid ?? student?.code ?? student?.name ?? null
}

const isGuardianOpen = (student) => {
    return openGuardianKey.value === getGuardianKey(student)
}

const toggleGuardian = (student) => {
    const key = getGuardianKey(student)
    openGuardianKey.value = openGuardianKey.value === key ? null : key
}

const deleteGuardianLine = async (student, guardian) => {
    const lineuser_id = guardian?.lineuserId || getGuardianLineUserId(null, student)
    if (!lineuser_id) return

    const { default: Swal } = await import('sweetalert2')
    const confirmResult = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบใช่ไหม',
        text: 'ต้องการลบไลน์ผู้ปกครองรายการนี้หรือไม่',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        didOpen: () => {
            document.getElementById('app')?.removeAttribute('aria-hidden')
        }
    })

    if (!confirmResult.isConfirmed) return

    const key = guardian?.key || getGuardianKey(student)
    guardianDeletingKey.value = key
    try {
        const result = await studentService.deleteLineStudent({
            lineuser_id,
            userid: student?.userid || student?.code || ''
        })
        if (result?.message === 'Success' || result?.success === true) {
            if (isGuardianOpen(student)) closeGuardian()
            emit('refresh')
        }
    } catch (error) {
        console.error('Delete line guardian error:', error)
    } finally {
        guardianDeletingKey.value = null
    }
}

const closeGuardian = () => {
    openGuardianKey.value = null
}

const handleDocumentClick = (event) => {
    if (!openGuardianKey.value) return
    const target = event?.target
    if (target?.closest?.('.guardian-popover-root')) return
    closeGuardian()
}

onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
})

const emitEdit = (student) => {
    emit('edit', student)
}

const emitDelete = (student) => {
    emit('delete', student)
}

const emitReset = (student) => {
    emit('reset', student)
}

const emitDetail = (student) => {
    emit('detail', student)
}
</script>

<style scoped>
@media (max-width: 1032px) {

    .student-table :deep(th),
    .student-table :deep(td) {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
    }
}
</style>
