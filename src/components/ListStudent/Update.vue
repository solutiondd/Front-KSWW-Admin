<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg mb-4">แก้ไขนักเรียน</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-semibold">รูปภาพ <span
                            class="text-gray-500">(ไม่บังคับ)</span></label>

                    <div v-if="currentImage || previewImage" class="relative flex justify-center mb-2">
                        <div class="relative">
                            <img :src="previewImage || currentImage" alt="Preview"
                                class="w-32 h-32 object-cover rounded-lg shadow-md" />
                            <button type="button" @click="removeImage"
                                class="absolute -top-2 -right-2 btn btn-circle btn-sm btn-error">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div v-if="!currentImage && !previewImage" class="relative">
                        <label for="pictureInputUpdate"
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span class="flex flex-col items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="text-sm font-medium text-gray-700">เลือกรูปภาพนักเรียน</span>
                                <span class="text-xs text-gray-500">JPG only (สูงสุด 70KB)</span>
                            </span>
                            <input id="pictureInputUpdate" type="file" @change="handleFileChange"
                                accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label"><span class="label-text">รหัสนักเรียน</span></label>
                        <input v-model="formData.userid" type="text" class="input input-bordered" required
                            :class="{ 'input-error': useridError }" autocomplete="off" />
                        <label v-if="useridError" class="label"><span class="label-text-alt text-error">{{ useridError
                        }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">คำนำหน้า</span></label>
                        <select v-model="formData.pre_name" class="select select-bordered" required>
                            <option value="">เลือกคำนำหน้า</option>
                            <option value="เด็กชาย">เด็กชาย</option>
                            <option value="เด็กหญิง">เด็กหญิง</option>
                            <option value="นาย">นาย</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">ชื่อ</span></label>
                        <input v-model="formData.first_name" type="text" class="input input-bordered" required
                            @input="validateFirstName" :class="{ 'input-error': firstNameError }" autocomplete="off" />
                        <label v-if="firstNameError" class="label"><span class="label-text-alt text-error">{{
                            firstNameError }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">นามสกุล</span></label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered" required
                            @input="validateLastName" :class="{ 'input-error': lastNameError }" autocomplete="off" />
                        <label v-if="lastNameError" class="label"><span class="label-text-alt text-error">{{
                            lastNameError }}</span></label>
                    </div>

                    <div v-if="auth.user?.role !== 'teacher'" class="form-control">
                        <label class="label"><span class="label-text">ชั้นปี</span></label>
                        <select v-model="formData.grade" @change="handleGradeChange" class="select select-bordered"
                            required>
                            <option value="">เลือกชั้นปี</option>
                            <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ grade }}</option>
                        </select>
                    </div>

                    <div v-if="auth.user?.role !== 'teacher'" class="form-control">
                        <label class="label"><span class="label-text">ห้อง</span></label>
                        <select v-model="formData.classroom" class="select select-bordered" required>
                            <option value="">เลือกห้อง</option>
                            <option v-for="room in availableClassrooms" :key="room" :value="room">
                                {{ room }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">เลขบัตร RFID <span
                                    class="text-gray-500">(ไม่บังคับ)</span></span></label>
                        <input v-model="formData.rfid" type="text" class="input input-bordered" @input="validateRfid"
                            autocomplete="off" />
                        <label v-if="rfidError" class="label"><span class="label-text-alt text-error">{{ rfidError
                        }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">เบอร์โทรผู้ปกครอง <span
                                    class="text-gray-500">(ไม่บังคับ)</span></span></label>
                        <input v-model="formData.guardian_phone" type="text" class="input input-bordered"
                            @input="validateGuardianPhone" :class="{ 'input-error': guardianPhoneError }"
                            autocomplete="off" />
                        <label v-if="guardianPhoneError" class="label"><span class="label-text-alt text-error">{{
                            guardianPhoneError
                                }}</span></label>
                    </div>

                </div>

                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="closeModal">ยกเลิก</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>บันทึก</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { StudentService } from '../../api/student'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const modalRef = ref(null)
const loading = ref(false)
const previewImage = ref('')
const currentImage = ref('')
const fileError = ref('')
const firstNameError = ref('')
const lastNameError = ref('')
const useridError = ref('')
const studentId = ref('')
const rfidError = ref('')
const guardianPhoneError = ref('')

const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    grade: '',
    classroom: '',
    picture: null,
    rfid: '',
    guardian_phone: ''
})

const props = defineProps({
    classrooms: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['success'])

const availableGrades = computed(() => {
    const grades = [...new Set(props.classrooms.map(c => c.grade))]
    return grades.sort((a, b) => parseInt(a.replace('ม.', '')) - parseInt(b.replace('ม.', '')))
})

const availableClassrooms = computed(() => {
    const rooms = props.classrooms.filter(c => c.grade === formData.value.grade).map(c => c.classroom)
    return rooms.sort((a, b) => a - b)
})

const nameRegex = /^[A-Za-z\u0E00-\u0E7F]+$/
const validateFirstName = () => {
    if (!formData.value.first_name) firstNameError.value = 'กรุณากรอกชื่อ'
    else if (!nameRegex.test(formData.value.first_name)) firstNameError.value = 'ใส่ได้เฉพาะตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น'
    else firstNameError.value = ''
}
const validateLastName = () => {
    if (!formData.value.last_name) lastNameError.value = 'กรุณากรอกนามสกุล'
    else if (!nameRegex.test(formData.value.last_name)) lastNameError.value = 'ใส่ได้เฉพาะตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น'
    else lastNameError.value = ''
}

const validateRfid = () => {
    if (!formData.value.rfid) {
        rfidError.value = ''
        return true
    }
    if (!/^\d+$/.test(formData.value.rfid)) {
        rfidError.value = 'เลขบัตรต้องเป็นตัวเลขเท่านั้น'
        return false
    }
    rfidError.value = ''
    return true
}

const validateGuardianPhone = () => {
    if (!formData.value.guardian_phone) {
        guardianPhoneError.value = ''
        return true
    }
    if (!/^\d+$/.test(formData.value.guardian_phone)) {
        guardianPhoneError.value = 'เบอร์โทรผู้ปกครองต้องเป็นตัวเลขเท่านั้น'
        return false
    }
    guardianPhoneError.value = ''
    return true
}

const isFormValid = computed(() => {
    return (
        formData.value.userid &&
        formData.value.pre_name &&
        formData.value.first_name &&
        formData.value.last_name &&
        formData.value.grade &&
        formData.value.classroom &&
        !firstNameError.value &&
        !lastNameError.value &&
        !rfidError.value &&
        !guardianPhoneError.value &&
        !fileError.value
    )
})

const parseName = (name) => {
    if (!name) return { pre: '', first: '', last: '' }
    const parts = name.trim().split(/\s+/)
    return {
        pre: parts[0] || '',
        first: parts[1] || '',
        last: parts.slice(2).join(' ') || ''
    }
}

const openModal = async (student) => {
    studentId.value = student.id
    const parsed = parseName(student.name)
    formData.value = {
        userid: student.userid || student.code || '',
        pre_name: parsed.pre,
        first_name: parsed.first,
        last_name: parsed.last,
        grade: student.grade || '',
        classroom: student.room || '',
        picture: null,
        rfid: student.rfid !== undefined && student.rfid !== null ? String(student.rfid) : '',
        guardian_phone: student.guardian_phone !== undefined && student.guardian_phone !== null
            ? String(student.guardian_phone)
            : ''
    }
    currentImage.value = getPictureUrl(student.picture) || ''
    previewImage.value = ''
    fileError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    useridError.value = ''
    rfidError.value = ''
    guardianPhoneError.value = ''

    if (student.picture) {
        try {
            const response = await fetch(student.picture)
            const blob = await response.blob()
            if (blob.size > 70 * 1024) {
                const resizedBlob = await resizeImage(blob, 70, 300, 300)
                if (resizedBlob.size <= 70 * 1024) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        currentImage.value = e.target.result
                        previewImage.value = ''
                    }
                    reader.readAsDataURL(resizedBlob)
                    formData.value.picture = new File([resizedBlob], 'student.jpg', { type: 'image/jpeg' })
                } else {
                    fileError.value = `ขนาดรูปนักเรียนเกิน 70KB (${(blob.size / 1024).toFixed(2)}KB)`
                }
            }
        } catch (err) {
            fileError.value = 'เกิดข้อผิดพลาดในการตรวจสอบหรือปรับขนาดรูปภาพ'
        }
    }

    if (formData.value.classroom && availableClassrooms.value.length > 0 && availableClassrooms.value.includes(formData.value.classroom)) {
        formData.value.classroom = availableClassrooms.value[0]
    }
    modalRef.value?.showModal()
}

const closeModal = () => {
    modalRef.value?.close()
    rfidError.value = ''
    guardianPhoneError.value = ''
}

const handleGradeChange = () => {
    if (availableClassrooms.value.length > 0) {
        formData.value.classroom = availableClassrooms.value[0]
    } else {
        formData.value.classroom = ''
    }
}


async function resizeImage(file, maxSizeKB = 70, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let quality = 0.85;
                function tryCompress() {
                    canvas.toBlob((b) => {
                        if (!b) return reject('บีบอัดรูปไม่สำเร็จ');
                        if (b.size / 1024 > maxSizeKB && quality > 0.4) {
                            quality -= 0.05;
                            tryCompress();
                        } else {
                            resolve(b);
                        }
                    }, 'image/jpeg', quality);
                }
                tryCompress();
            };
            img.onerror = () => reject('ไฟล์รูปไม่ถูกต้อง');
            img.src = e.target.result;
        };
        reader.onerror = () => reject('อ่านไฟล์รูปไม่สำเร็จ');
        reader.readAsDataURL(file);
    });
}

const handleFileChange = async (event) => {
    const file = event.target.files[0];
    fileError.value = '';
    if (file) {
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            fileError.value = 'กรุณาเลือกไฟล์ JPG เท่านั้น';
            event.target.value = '';
            return;
        }
        try {
            const resizedBlob = await resizeImage(file, 70, 300, 300);
            if (resizedBlob.size > 70 * 1024) {
                fileError.value = `ขนาดไฟล์หลังรีไซส์ยังเกิน 70KB (${(resizedBlob.size / 1024).toFixed(2)}KB)`;
                event.target.value = '';
                return;
            }
            formData.value.picture = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(resizedBlob);
        } catch (err) {
            fileError.value = 'เกิดข้อผิดพลาดในการรีไซส์รูปภาพ';
            event.target.value = '';
        }
    }
}

const removeImage = () => {
    previewImage.value = ''
    currentImage.value = ''
    formData.value.picture = null
    const fileInput = document.getElementById('pictureInputUpdate')
    if (fileInput) fileInput.value = ''
}

const handleSubmit = async () => {
    validateFirstName(); validateLastName();
    if (!validateRfid()) return;
    if (!validateGuardianPhone()) return;
    useridError.value = '';
    if (!isFormValid.value) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
            confirmButtonColor: '#2563eb',
            didOpen: () => { document.getElementById('app')?.removeAttribute('aria-hidden') }
        })
        return
    }
    loading.value = true
    try {
        const studentService = new StudentService()
        const { ...data } = formData.value
        const response = await studentService.updateStudent(studentId.value, data)
        if (response.message === 'Success') {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: 'แก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว',
                timer: 2000,
                showConfirmButton: false,
                didOpen: () => {
                    document.getElementById('app')?.removeAttribute('aria-hidden')
                }
            })
            emit('success')
            closeModal()
        }
    } catch (error) {
        const duplicate = error?.response?.status === 409 || (error?.response?.data?.error && error.response.data.error.includes('duplicate student userid'));
        if (duplicate) {
            useridError.value = 'มีรหัสนี้แล้ว กรุณาใช้รหัสอื่น';
            return;
        }
        console.error('Update student error:', error)
        closeModal();
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถแก้ไขข้อมูลนักเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

defineExpose({ openModal, closeModal })
</script>

<style scoped></style>
