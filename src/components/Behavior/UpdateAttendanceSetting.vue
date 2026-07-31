<template>
    <dialog ref="modal" class="modal">
        <div class="modal-box max-w-lg">
            <h3 class="font-bold text-lg mb-4 text-primary">แก้ไขการตั้งค่าหักคะแนนอัตโนมัติ</h3>
            <div class="space-y-4" v-if="form">
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.enabled" class="toggle toggle-primary" />
                    <span class="font-medium">เปิดใช้งานระบบหักคะแนนอัตโนมัติ</span>
                </div>
                <div class="divider">มาสาย</div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.late.enabled" class="toggle toggle-warning" />
                    <span>เปิดใช้งานหักคะแนนมาสาย</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                        <label class="label"><span class="label-text">เวลาตัด (มาสาย)</span></label>
                        <input type="time" v-model="form.late.cutoff_time" class="input input-bordered input-sm"
                            step="1" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text">คะแนนที่หัก</span></label>
                        <input type="number" v-model.number="form.late.score" class="input input-bordered input-sm" />
                    </div>
                </div>
                <div class="divider">ขาดเรียน</div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.absent.enabled" class="toggle toggle-error" />
                    <span>เปิดใช้งานหักคะแนนขาดเรียน</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <!-- <div class="form-control">
                        <label class="label">
                            <span class="label-text">เวลาตัด (ขาดเรียน)</span>
                            <span class="label-text-alt text-base-content/50">ไม่บังคับ</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <input type="time" v-model="form.absent.cutoff_time"
                                class="input input-bordered input-sm flex-1" step="1"
                                :disabled="!form.absent.cutoff_time && !absentTimeEnabled" />
                            <input type="checkbox" v-model="absentTimeEnabled" class="toggle toggle-sm toggle-primary"
                                @change="onAbsentTimeToggle" />
                        </div>
                    </div> -->
                    <div class="form-control">
                        <label class="label"><span class="label-text">คะแนนที่หัก</span></label>
                        <input type="number" v-model.number="form.absent.score" class="input input-bordered input-sm" />
                    </div>
                </div>
            </div>
            <div class="modal-action mt-6">
                <button class="btn btn-ghost" @click="close">ยกเลิก</button>
                <button class="btn btn-primary" :disabled="saving" @click="save">
                    <span v-if="saving" class="loading loading-spinner loading-xs"></span>
                    บันทึก
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button @click="close">close</button></form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { BehaviorService } from '../../api/behavior'
import Swal from 'sweetalert2';

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
})

const cloneConductSetting = (setting) => ({
    ...createDefaultConductSetting(),
    ...(setting || {}),
    late: {
        ...createDefaultConductSetting().late,
        ...((setting && setting.late) || {}),
    },
    absent: {
        ...createDefaultConductSetting().absent,
        ...((setting && setting.absent) || {}),
    },
})

const emit = defineEmits(['updated'])

const modal = ref(null)
const form = ref(null)
const saving = ref(false)
const absentTimeEnabled = ref(false)
const service = new BehaviorService()
let originalSetting = null

const open = (conductSetting) => {
    const nextSetting = cloneConductSetting(conductSetting)
    originalSetting = cloneConductSetting(conductSetting)
    form.value = nextSetting
    absentTimeEnabled.value = !!nextSetting.absent?.cutoff_time
    modal.value?.showModal()
}

const onAbsentTimeToggle = () => {
    if (!absentTimeEnabled.value) {
        form.value.absent.cutoff_time = null
    } else if (!form.value.absent.cutoff_time) {
        form.value.absent.cutoff_time = '08:01:00'
    }
}

const close = () => {
    modal.value?.close()
    form.value = null
}

const save = async () => {
    saving.value = true
    try {
        const baseSetting = originalSetting || createDefaultConductSetting()
        const payload = {
            enabled: form.value.enabled,
            late: { ...baseSetting.late, ...form.value.late },
            absent: { ...baseSetting.absent, ...form.value.absent },
        }
        await service.updateAttendanceConductSetting(payload)
        close()
        emit('updated')
        await Swal.fire('บันทึกสำเร็จ!', '', 'success')
    } catch (e) {
        await Swal.fire('เกิดข้อผิดพลาด', e.message || 'บันทึกไม่สำเร็จ', 'error')
    } finally {
        saving.value = false
    }
}

defineExpose({ open })
</script>
