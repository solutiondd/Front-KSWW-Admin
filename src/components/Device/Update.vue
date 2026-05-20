<template>
    <dialog ref="updateModal" class="modal">
        <div class="modal-box w-11/12 max-w-2xl">
            <h3 class="font-bold text-lg mb-4 text-primary">แก้ไขอุปกรณ์</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Serial Number</span>
                    </label>
                    <input :value="currentDevice?.serial_number" type="text"
                        class="input input-bordered w-full bg-base-200" disabled />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">IP Address</span>
                    </label>
                    <input :value="currentDevice?.ipaddress" type="text" class="input input-bordered w-full bg-base-200"
                        disabled />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">สถานที่ <span class="text-error">*</span></span>
                    </label>
                    <input v-model="formData.location" type="text" placeholder="กรอกสถานที่ติดตั้ง"
                        class="input input-bordered w-full" required />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">ประเภทประตู <span class="text-error">*</span></span>
                    </label>
                    <select v-model="formData.gate_type" class="select select-bordered w-full" required>
                        <option value="" disabled>เลือกประเภทประตู</option>
                        <option value="in">ทางเข้า (In)</option>
                        <option value="out">ทางออก (Out)</option>
                    </select>
                </div>

                <!-- <div class="form-control">
                    <label class="label">
                        <span class="label-text">ประเภทอุปกรณ์</span>
                    </label>
                    <input :value="currentDevice?.device_type" type="text"
                        class="input input-bordered w-full bg-base-200" disabled />
                </div> -->

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Username อุปกรณ์</span>
                            <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                        </label>
                        <input v-model="formData.device_username" type="text" placeholder="กรอก Username"
                            class="input input-bordered w-full" />
                    </div>

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Password อุปกรณ์</span>
                            <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                        </label>
                        <input v-model="formData.device_password" type="password" placeholder="กรอก Password"
                            class="input input-bordered w-full" />
                    </div>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-3">
                        <input v-model="formData.use_attendance_time" type="checkbox" class="toggle toggle-warning" />
                        <span class="label-text">เปิดใช้งานช่วงเวลาบันทึกเข้าเรียน</span>
                    </label>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">เวลาเริ่มเช็คชื่อ</span>
                            <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                        </label>
                        <input v-model="formData.attendance_start_time" type="time" class="input input-bordered w-full"
                            :disabled="!formData.use_attendance_time" />
                    </div>

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">เวลาสิ้นสุดเช็คชื่อ</span>
                            <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                        </label>
                        <input v-model="formData.attendance_end_time" type="time" class="input input-bordered w-full"
                            :disabled="!formData.use_attendance_time" />
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">ยกเลิก</button>
                    <button type="submit" class="btn btn-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        บันทึกการแก้ไข
                    </button>
                </div>
            </form>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="closeModal">close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'

const updateModal = ref(null)
const emit = defineEmits(['success'])

const currentDevice = ref(null)
const formData = ref({
    location: '',
    gate_type: '',
    device_username: '',
    device_password: '',
    attendance_start_time: '',
    attendance_end_time: '',
    use_attendance_time: false
})

const encodeDeviceKey = (username, password) => {
    if (!username && !password) return ''

    const credential = `${username}:${password}`
    const bytes = new TextEncoder().encode(credential)
    let binary = ''
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
    })
    return btoa(binary)
}

const parseUseAttendanceTime = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1'
    return false
}

const openModal = (device) => {
    currentDevice.value = device
    formData.value = {
        location: device.location || '',
        gate_type: device.gate_type || '',
        device_username: '',
        device_password: '',
        attendance_start_time: device.attendance_start_time || '',
        attendance_end_time: device.attendance_end_time || '',
        use_attendance_time: parseUseAttendanceTime(device.use_attendance_time)
    }
    if (updateModal.value) {
        updateModal.value.showModal()
    }
}

const closeModal = () => {
    if (updateModal.value) {
        updateModal.value.close()
        resetForm()
    }
}

const resetForm = () => {
    currentDevice.value = null
    formData.value = {
        location: '',
        gate_type: '',
        device_username: '',
        device_password: '',
        attendance_start_time: '',
        attendance_end_time: '',
        use_attendance_time: false
    }
}

const handleSubmit = () => {
    const { device_username, device_password, ...payload } = formData.value
    const encodedDeviceKey = encodeDeviceKey(device_username, device_password)

    emit('success', {
        id: currentDevice.value._id,
        ...payload,
        ...(encodedDeviceKey ? { device_key: encodedDeviceKey } : {})
    })
}

defineExpose({
    openModal,
    closeModal
})
</script>

<style scoped></style>
