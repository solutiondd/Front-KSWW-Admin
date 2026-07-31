<template>
    <button @click="handleDelete" class="btn btn-ghost btn-xs text-error" :disabled="isDeleting">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="button-text">{{ isDeleting ? 'กำลังลบ...' : 'ลบ' }}</span>
    </button>
</template>

<script setup>
import { ref } from 'vue';
import ModelingService from '../../api/modeling.js';
import Swal from 'sweetalert2';

const props = defineProps({
    modelingId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    beforeAction: {
        type: Function,
        required: false,
    },
});

const emit = defineEmits(['deleted']);
const isDeleting = ref(false);

const handleDelete = async () => {
    if (props.beforeAction) {
        await props.beforeAction();
    }
    const result = await Swal.fire({
        title: 'ยืนยันการลบ',
        html: `ต้องการลบ Modeling ของ<br><strong>${props.name}</strong><br>อุปกรณ์: <strong>${props.location}</strong><br>หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
        isDeleting.value = true;
        try {
            const response = await ModelingService.deleteModeling(props.modelingId);
            if (response.message === 'Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'ลบ Modeling สำเร็จ',
                    timer: 1500,
                    showConfirmButton: false
                });
                emit('deleted');
            }
        } catch (error) {
            console.error('Error deleting modeling:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || 'ไม่สามารถลบ Modeling ได้'
            });
        } finally {
            isDeleting.value = false;
        }
    }
};
</script>

<style scoped></style>

<style scoped>
@media (max-width: 524px) {
    .button-text {
        display: none;
    }
}
</style>