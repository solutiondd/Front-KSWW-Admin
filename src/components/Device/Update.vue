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

                <div v-if="featureFlags.device.enableUseCase" class="form-control">
                    <label class="label">
                        <span class="label-text">Use Case <span class="text-error">*</span></span>
                    </label>
                    <select v-model="formData.usecase" class="select select-bordered w-full" required>
                        <option value="" disabled>เลือก Use Case</option>
                        <option value="access_control">Access Control</option>
                        <option value="attendance">Attendance</option>
                        <option value="person_confirmation">Person Confirmation</option>
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
                            class="input input-bordered w-full" :required="Boolean(formData.device_password)" />
                    </div>

                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Password อุปกรณ์</span>
                            <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                        </label>
                        <div class="relative">
                            <input v-model="formData.device_password" :type="showDevicePassword ? 'text' : 'password'"
                                placeholder="กรอก Password" class="input input-bordered w-full pr-12"
                                :required="Boolean(formData.device_username)" />
                            <button type="button" class="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                                @click="showDevicePassword = !showDevicePassword"
                                :aria-label="showDevicePassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'">
                                <svg v-if="showDevicePassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-7-10-7a18.347 18.347 0 014.176-4.772M9.88 9.88a3 3 0 104.243 4.243M6.1 6.1L3 3m0 0l18 18" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.27 2.943 9.542 7-1.273 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
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
import Swal from 'sweetalert2'
import featureFlags from '../../config/featureFlags.js'

const updateModal = ref(null)
const emit = defineEmits(['success'])
const showDevicePassword = ref(false)

const currentDevice = ref(null)
const formData = ref({
    location: '',
    gate_type: '',
    usecase: '',
    device_username: '',
    device_password: '',
    attendance_start_time: '',
    attendance_end_time: '',
    use_attendance_time: false
})
const originalFormData = ref({
    location: '',
    gate_type: '',
    usecase: '',
    device_username: '',
    device_password: '',
    attendance_start_time: '',
    attendance_end_time: '',
    use_attendance_time: false
})

const decodeDeviceKey = (deviceKey) => {
    if (!deviceKey) {
        return { username: '', password: '' }
    }

    try {
        const binary = atob(deviceKey)
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
        const credential = new TextDecoder().decode(bytes)
        const separatorIndex = credential.indexOf(':')

        if (separatorIndex === -1) {
            return { username: credential, password: '' }
        }

        return {
            username: credential.slice(0, separatorIndex),
            password: credential.slice(separatorIndex + 1)
        }
    } catch {
        return { username: '', password: '' }
    }
}

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
    showDevicePassword.value = false
    const existingDeviceKey = device.device_key || device.key || ''
    const { username, password } = decodeDeviceKey(existingDeviceKey)
    const normalizedFormData = {
        location: device.location || '',
        gate_type: device.gate_type || '',
        usecase: device.usecase || '',
        device_username: username,
        device_password: password,
        attendance_start_time: device.attendance_start_time || '',
        attendance_end_time: device.attendance_end_time || '',
        use_attendance_time: parseUseAttendanceTime(device.use_attendance_time)
    }

    currentDevice.value = device
    formData.value = { ...normalizedFormData }
    originalFormData.value = { ...normalizedFormData }
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
    showDevicePassword.value = false
    currentDevice.value = null
    formData.value = {
        location: '',
        gate_type: '',
        usecase: '',
        device_username: '',
        device_password: '',
        attendance_start_time: '',
        attendance_end_time: '',
        use_attendance_time: false
    }
    originalFormData.value = {
        location: '',
        gate_type: '',
        usecase: '',
        device_username: '',
        device_password: '',
        attendance_start_time: '',
        attendance_end_time: '',
        use_attendance_time: false
    }
}

const handleSubmit = () => {
    const { device_username, device_password, ...payload } = formData.value

    if ((device_username && !device_password) || (!device_username && device_password)) {
        Swal.fire({
            icon: 'warning',
            title: 'กรอกข้อมูลไม่ครบ',
            text: 'กรุณากรอก Username และ Password ให้ครบทั้งคู่',
            confirmButtonText: 'ตกลง'
        })
        return
    }

    const { device_username: origUsername, device_password: origPassword, ...originalPayload } = originalFormData.value

    if (device_username || device_password) {
        payload.device_key = encodeDeviceKey(device_username, device_password)
    }

    const credentialChanged = device_username !== origUsername || device_password !== origPassword
    const fieldChanged = Object.keys(originalPayload).some((key) => payload[key] !== originalPayload[key])
    const hasChanges = fieldChanged || credentialChanged

    if (!hasChanges) {
        Swal.fire({
            icon: 'info',
            title: 'ไม่มีการเปลี่ยนแปลง',
            text: 'ยังไม่มีข้อมูลที่แก้ไข',
            timer: 1200,
            showConfirmButton: false
        })
        return
    }

    if (!payload.usecase) delete payload.usecase

    emit('success', {
        id: currentDevice.value._id,
        ...payload
    })
}

defineExpose({
    openModal,
    closeModal
})
</script>

<style scoped></style>
