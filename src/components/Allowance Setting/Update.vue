<template>
    <dialog class="modal" :class="{ 'modal-open': isOpen }">
        <div class="modal-box max-w-md border border-base-200">
            <h3 class="font-bold text-lg text-base-content mb-1">แก้ไขเวลาอนุโลมการเช็คชื่อ</h3>
            <p class="text-xs text-base-content/50 mb-4">กำหนดสัดส่วนเวลาเรียนแยกตามรายกลุ่ม</p>

            <div class="space-y-6 my-4">
                <div v-for="(rule, index) in localRules" :key="index"
                    class="p-4 border border-base-200 rounded-xl bg-base-50/30">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-md capitalize text-primary">
                            {{ rule.role === 'student' ? 'กลุ่มนักเรียน' : 'กลุ่มคุณครู' }}
                        </span>
                    </div>

                    <div class="form-control w-full">
                        <label class="label py-1">
                            <span class="label-text-alt font-medium">เวลาอนุโลมสาย (น.)</span>
                        </label>
                        <input type="time" step="1" v-model="rule.allowance_time"
                            class="input input-bordered w-full text-center text-lg font-semibold" />
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
import { BehaviorService } from '../../api/behavior';
import Swal from 'sweetalert2';

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    rules: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);

const allowanceService = new AllowanceService();
const behaviorService = new BehaviorService();
const submitting = ref(false);
const localRules = ref([]);

const createDefaultAllowanceRules = () => ([
    { role: 'student', allowance_time: '08:01:00' },
    { role: 'teacher', allowance_time: '08:01:00' },
]);

const createDefaultConductSetting = () => ({
    enabled: false,
    late: {
        enabled: false,
        cutoff_time: '08:01:00',
        score: -1,
        behavior_type: 'attendance',
        behavior: 'มาสาย',
        behavior_level: 1,
        description_template: 'มาสายในวันที่ {{date}} เวลาเข้าเรียนครั้งแรก {{first_time}}',
    },
    absent: {
        enabled: false,
        cutoff_time: null,
        score: -3,
        behavior_type: 'attendance',
        behavior: 'ขาดเรียน',
        behavior_level: 2,
        description_template: 'ขาดเรียนในวันที่ {{date}} เนื่องจากไม่พบข้อมูลเข้าเรียน',
    },
});

const normalizeTime = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return null;
    const parts = timeValue.split(':');
    if (parts.length < 2) return null;
    const [hh, mm, ss = '00'] = parts;
    return `${hh}:${mm}:${ss}`;
};

const toConductUpdatePayload = (setting) => {
    const defaults = createDefaultConductSetting();
    const source = setting || {};

    return {
        enabled: typeof source.enabled === 'boolean' ? source.enabled : defaults.enabled,
        late: {
            enabled: typeof source?.late?.enabled === 'boolean' ? source.late.enabled : defaults.late.enabled,
            cutoff_time: normalizeTime(source?.late?.cutoff_time) || defaults.late.cutoff_time,
            score: Number.isFinite(Number(source?.late?.score)) ? Number(source.late.score) : defaults.late.score,
            behavior_type: source?.late?.behavior_type || defaults.late.behavior_type,
            behavior: source?.late?.behavior || defaults.late.behavior,
            behavior_level: Number.isFinite(Number(source?.late?.behavior_level))
                ? Number(source.late.behavior_level)
                : defaults.late.behavior_level,
            description_template: source?.late?.description_template || defaults.late.description_template,
        },
        absent: {
            enabled: typeof source?.absent?.enabled === 'boolean'
                ? source.absent.enabled
                : defaults.absent.enabled,
            cutoff_time: normalizeTime(source?.absent?.cutoff_time),
            score: Number.isFinite(Number(source?.absent?.score))
                ? Number(source.absent.score)
                : defaults.absent.score,
            behavior_type: source?.absent?.behavior_type || defaults.absent.behavior_type,
            behavior: source?.absent?.behavior || defaults.absent.behavior,
            behavior_level: Number.isFinite(Number(source?.absent?.behavior_level))
                ? Number(source.absent.behavior_level)
                : defaults.absent.behavior_level,
            description_template: source?.absent?.description_template || defaults.absent.description_template,
        },
    };
};

const syncLateCutoffFromStudentAllowance = async (studentAllowanceTime) => {
    const normalizedTime = normalizeTime(studentAllowanceTime);
    if (!normalizedTime) return;

    const current = await behaviorService.getAttendanceConductSetting();
    const currentSetting = toConductUpdatePayload(current?.data);
    const payload = {
        ...currentSetting,
        late: {
            ...currentSetting.late,
            cutoff_time: normalizedTime,
        },
    };

    await behaviorService.updateAttendanceConductSetting(payload);
};

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        const rules = props.rules.length ? props.rules : createDefaultAllowanceRules();
        localRules.value = JSON.parse(JSON.stringify(rules));
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
        const studentRule = localRules.value.find((rule) => rule.role === 'student');
        if (studentRule?.allowance_time) {
            await syncLateCutoffFromStudentAllowance(studentRule.allowance_time);
        }
        await Swal.fire('บันทึกสำเร็จ', '', 'success');
        emit('success');
    } catch (error) {
        console.error("Failed to update allowances:", error);
        const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'บันทึกไม่สำเร็จ';
        await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    } finally {
        submitting.value = false;
    }
};
</script>