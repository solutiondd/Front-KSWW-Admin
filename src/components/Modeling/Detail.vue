<template>
    <div>
        <button @click="openModal" class="btn btn-primary btn-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        </button>

        <dialog ref="modal" class="modal">
            <div class="modal-box max-w-3xl">
                <h3 class="font-bold text-lg mb-4">รายละเอียด Modeling</h3>

                <div class="bg-base-200 rounded-lg p-4 mb-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <span class="text-sm text-base-content/60">ชื่อ-สกุล:</span>
                            <div class="flex items-center gap-3 mt-1">
                                <div class="avatar">
                                    <div class="w-12 h-12 rounded-full">
                                        <img v-if="item.picture" :src="getPictureUrl(item.picture)" :alt="item.name"
                                            class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                            @click="openPictureModal(item.picture)" @error="item.picture = null" />
                                        <div v-else
                                            class="w-full h-full bg-primary text-primary-content flex items-center justify-center">
                                            <span class="text-lg font-semibold">{{ getInitials(item.name) }}</span>
                                        </div>
                                    </div>
                                </div>
                                <span class="font-medium">{{ item.name }}</span>
                            </div>
                        </div>
                        <div>
                            <span class="text-sm text-base-content/60">รหัส:</span>
                            <p class="font-medium">{{ item.userid }}</p>
                        </div>
                        <div>
                            <span class="text-sm text-base-content/60">ตำแหน่ง:</span>
                            <p class="font-medium">{{ item.position }}</p>
                        </div>
                        <div>
                            <span class="text-sm text-base-content/60">
                                <span v-if="item.role === 'student'">ห้องเรียน:</span>
                                <span v-else>แผนก:</span>
                            </span>
                            <p class="font-medium">
                                <span v-if="item.role === 'student'">
                                    {{ formatGradeClassroomDisplay(item.grade, item.classroom) }}
                                </span>
                                <span v-else>
                                    {{ item.department || '-' }}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <h4 class="font-semibold">รายการ Modeling ({{ item.modeling.length }} รายการ)</h4>
                    <div class="overflow-x-auto">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th class="text-center">ลำดับ</th>
                                    <th>ตำแหน่งอุปกรณ์</th>
                                    <th class="text-center">สถานะ</th>
                                    <th class="text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-if="!item.modeling || item.modeling.length === 0 || !item.modeling[0].device || Object.keys(item.modeling[0].device).length === 0">
                                    <td colspan="4" class="text-center text-base-content/60 py-8">
                                        ยังไม่ได้เชื่อมต่ออุปกรณ์</td>
                                </tr>
                                <tr v-for="(model, idx) in item.modeling" :key="idx" v-else>
                                    <td class="text-center">{{ idx + 1 }}</td>
                                    <td>{{ model.device.location }}</td>
                                    <td class="text-center">
                                        <div class="flex items-center justify-center gap-2">
                                            <div :class="[
                                                'w-3 h-3 rounded-full',
                                                statusColorClass(model.status)
                                            ]"></div>
                                            <span class="text-xs">{{ statusLabel(model.status) }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="flex justify-center gap-1">
                                            <ReModel :modeling-id="model.modeling_id" :location="model.device.location"
                                                @updated="handleUpdated" :before-action="closeModal" />
                                            <DeleteModeling :modeling-id="model.modeling_id" :name="item.name"
                                                :location="model.device.location" @deleted="handleUpdated"
                                                :before-action="closeModal" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-action">
                    <button @click="closeModal" class="btn">ปิด</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button type="button" @click="closeModal">close</button>
            </form>
        </dialog>

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
import { ref } from 'vue';
import ReModel from './ReModel.vue';
import DeleteModeling from './Delete.vue';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem'

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

const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['updated']);
const modal = ref(null);
const pictureModal = ref(null);
const pictureModalSrc = ref(null);

const openPictureModal = (pic) => {
    pictureModalSrc.value = getPictureUrl(pic);
    pictureModal.value?.showModal();
};

const openModal = () => {
    modal.value?.showModal();
};

const closeModal = () => {
    modal.value?.close();
};

const handleUpdated = () => {
    emit('updated');
    closeModal();
};

const statusLabel = (s) => {
    if (s === 2) return 'สำเร็จ';
    if (s === 1) return 'รอตรวจสอบ';
    return 'ไม่สำเร็จ';
};

const statusColorClass = (s) => {
    if (s === 2) return 'bg-success';
    if (s === 1) return 'bg-warning';
    return 'bg-error';
};
</script>

<style scoped></style>