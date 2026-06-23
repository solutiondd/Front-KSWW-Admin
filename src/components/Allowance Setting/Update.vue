<template>
    <dialog class="modal" :class="{ 'modal-open': isOpen }">
        <div class="modal-box max-w-md border border-base-200">
            <h3 class="font-bold text-lg text-base-content mb-1">แก้ไขเวลาอนุโลมการเช็คชื่อ</h3>
            <p class="text-xs text-base-content/50 mb-4">กำหนดสัดส่วนเวลาเรียนแยกตามรายกลุ่ม</p>

            <div class="space-y-6 my-4">
                <div v-for="(rule, index) in localRules" :key="index" class="p-4 border border-base-200 rounded-xl bg-base-50/30">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-md capitalize text-primary">
                            {{ rule.role === 'student' ? 'กลุ่มนักเรียน' : 'กลุ่มคุณครู' }}
                        </span>
                    </div>

                    <div class="form-control w-full">
                        <label class="label py-1">
                            <span class="label-text-alt font-medium">เวลาอนุโลมสาย (น.)</span>
                        </label>
                        <input 
                            type="time" 
                            step="1" 
                            v-model="rule.allowance_time" 
                            class="input input-bordered w-full text-center text-lg font-semibold"
                        />
                    </div>

                    <!-- <div class="form-control mt-3">
                        <label class="label cursor-pointer justify-between py-1">
                            <span class="label-text-alt font-medium">เปิดใช้งานการอนุโลมสถานะนี้</span>
                            <input 
                                type="checkbox" 
                                v-model="rule.enabled" 
                                class="toggle toggle-success toggle-sm" 
                            />
                        </label>
                    </div> -->
                </div>
            </div>

            <div class="modal-action gap-2 mt-6">
                <button @click="handleClose" class="btn btn-ghost btn-sm" :disabled="submitting">
                    ยกเลิก
                </button>
                <button @click="handleSave" class="btn btn-primary btn-sm text-white" :disabled="submitting">
                    <span v-if="submitting" class="loading loading-spinner loading-xs"></span>
                    บันทึก
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="handleClose"></div>
    </dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { AllowanceService } from '../../api/allowance';

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    rules: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);

const allowanceService = new AllowanceService();
const submitting = ref(false);
const localRules = ref([]);

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        localRules.value = JSON.parse(JSON.stringify(props.rules));
    }
});

const handleClose = () => {
    if (submitting.value) return;
    emit('close');
};

const handleSave = async () => {
    submitting.value = true;
    try {
        const payload = {
            rules: localRules.value.map(r => ({
                role: r.role,
                allowance_time: r.allowance_time
            }))
        };

        await allowanceService.updateAllowance(payload);
        emit('success');
    } catch (error) {
        console.error("Failed to update allowances:", error);
    } finally {
        submitting.value = false;
    }
};
</script>