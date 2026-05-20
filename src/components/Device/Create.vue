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
                        <input v-model="formData.device_password" type="password" placeholder="กรอก Password"
                            class="input input-bordered w-full" />
                    </div>
                </div>

                <div v-if="featureFlags.device.enableUseCase" class="form-control">
                    <label class="label">
                        <span class="label-text">Use Case</span>
                        <span class="label-text-alt text-base-content/60">(ไม่บังคับ)</span>
                    </label>
                    <select v-model="formData.usecase" class="select select-bordered w-full">
                        <option value="" disabled>เลือกการใช้งาน</option>
                        <option value="access_control">Access Control</option>
                        <option value="attendance">Attendance</option>
                        <option value="person_confirmation">Person Confirmation</option>
                    </select>
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
        use_attendance_time: false
    }
}

const handleSubmit = () => {
    const { device_username, device_password, ...payload } = formData.value
    emit('success', {
        ...payload,
        device_key: encodeDeviceKey(device_username, device_password)
    })
}

defineExpose({
    openModal,
    closeModal
})
</script>

<style scoped></style>
