<template>
    <dialog ref="createModal" class="modal">
        <div class="modal-box w-11/12 max-w-2xl">
            <h3 class="font-bold text-lg mb-4 text-primary">เพิ่มอุปกรณ์ใหม่</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Serial Number <span class="text-error">*</span></span>
                    </label>
                    <input v-model="formData.serial_number" type="text" placeholder="กรอก Serial Number"
                        class="input input-bordered w-full" required />
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

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">ประเภทอุปกรณ์ <span class="text-error">*</span></span>
                    </label>
                    <select v-model="formData.device_type" class="select select-bordered w-full" required>
                        <option value="" disabled>เลือกประเภทอุปกรณ์</option>
                        <option value="ipcam">IP Camera</option>
                        <option value="Aifacescan">AI Face CC</option>
                        <option value="intfacecam">Int Face Cam</option>
                        <option value="hikfacescan">Hik Face Scan</option>
                        <option value="qsdmask_facescan">QSDMASK Face Scan</option>
                        <option value="megapixel_facescan">MEGAPIXEL Face Scan</option>
                    </select>
                </div>

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
                        <div class="relative">
                            <input v-model="formData.device_password" :type="showDevicePassword ? 'text' : 'password'"
                                placeholder="กรอก Password" class="input input-bordered w-full pr-12" />
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

                <div class="form-control">
                    <label class="label">
                        <span class="label-text" :class="{'text-error': macError}">MAC Address</span>
                        <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                    </label>
                    <input 
                        v-model="formData.mac" 
                        type="text" 
                        placeholder="เช่น 00:15:18:23:59:90 หรือ 00-15-18-23-59-90"
                        class="input input-bordered w-full" 
                        :class="{'input-error text-error': macError}"
                        @input="validateMac"
                        @blur="validateMac"
                    />
                    <label v-if="macError" class="label">
                        <span class="label-text-alt text-error">รูปแบบ MAC Address ไม่ถูกต้อง (เช่น 00:15:18:23:59:90)</span>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-3">
                        <input v-model="formData.use_attendance_time" type="checkbox" class="toggle toggle-primary" />
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
                    <button type="submit" class="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มอุปกรณ์
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
import featureFlags from '../../config/featureFlags.js'

const createModal = ref(null)
const emit = defineEmits(['success'])
const showDevicePassword = ref(false)
const macError = ref(false)

const formData = ref({
    serial_number: '',
    location: '',
    gate_type: '',
    device_type: '',
    device_username: '',
    device_password: '',
    usecase: '',
    attendance_start_time: '',
    attendance_end_time: '',
    use_attendance_time: false,
    mac: '',
})

const validateMac = () => {
    const macValue = formData.value.mac ? formData.value.mac.trim() : ''
    
    if (!macValue) {
        macError.value = false
        return
    }

    const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    macError.value = !macPattern.test(macValue)
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

const openModal = () => {
    if (createModal.value) {
        createModal.value.showModal()
    }
}

const closeModal = () => {
    if (createModal.value) {
        createModal.value.close()
        resetForm()
    }
}

const resetForm = () => {
    showDevicePassword.value = false
    macError.value = false
    formData.value = {
        serial_number: '',
        location: '',
        gate_type: '',
        device_type: '',
        device_username: '',
        device_password: '',
        usecase: '',
        attendance_start_time: '',
        attendance_end_time: '',
        use_attendance_time: false,
        mac: '',
    }
}

const handleSubmit = () => {
    validateMac()
    if (macError.value) return
    const { device_username, device_password, usecase, ...payload } = formData.value
    if (usecase) payload.usecase = usecase
    const encodedDeviceKey = encodeDeviceKey(device_username, device_password)
    if (encodedDeviceKey) payload.device_key = encodedDeviceKey
    payload.mac = formData.value.mac ? formData.value.mac.trim() : ''
    emit('success', payload)
}

defineExpose({
    openModal,
    closeModal
})
</script>

<style scoped></style>
