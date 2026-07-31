<template>
    <button @click="handleRemodeling" class="btn btn-ghost btn-xs" :disabled="isProcessing">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="button-text">{{ isProcessing ? 'กำลังประมวลผล...' : 'Re-modeling' }}</span>
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
    location: {
        type: String,
        required: true,
    },
    beforeAction: {
        type: Function,
        required: false,
    },
});

const emit = defineEmits(['updated']);
const isProcessing = ref(false);

const handleRemodeling = async () => {
    if (props.beforeAction) {
        await props.beforeAction();
    }
    const result = await Swal.fire({
        title: 'ยืนยัน Re-modeling',
        text: `ต้องการทำ Re-modeling สำหรับอุปกรณ์ "${props.location}" หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        isProcessing.value = true;
        try {
            const response = await ModelingService.updateModeling(props.modelingId);
            if (response.message === 'Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'ส่งคำขอ Re-modeling สำเร็จ',
                    timer: 1500,
                    showConfirmButton: false
                });
                emit('updated');
            }
        } catch (error) {
            console.error('Error remodeling:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.response?.data?.message || 'ไม่สามารถทำ Re-modeling ได้'
            });
        } finally {
            isProcessing.value = false;
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