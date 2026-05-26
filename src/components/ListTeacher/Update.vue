<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">แก้ไขข้อมูลบุคลากร</h3>
            <form @submit.prevent="handleSubmit">
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
                        <label for="pictureInputUpdateTeacher"
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span class="flex flex-col items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="text-sm font-medium text-gray-700">เลือกรูปภาพบุคลากร</span>
                                <span class="text-xs text-gray-500">JPG only (สูงสุด 70KB)</span>
                            </span>
                            <input id="pictureInputUpdateTeacher" ref="fileInputRef" type="file"
                                @change="handleFileChange" accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">รหัสบุคลากร</span>
                        </label>
                        <input v-model="formData.userid" type="text" class="input input-bordered w-full" required
                            :class="{ 'input-error': useridError }" autocomplete="off" />
                        <label v-if="useridError" class="label">
                            <span class="label-text-alt text-error">{{ useridError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">คำนำหน้า</span>
                        </label>
                        <select v-model="formData.pre_name" class="select select-bordered w-full" required>
                            <option value="">เลือกคำนำหน้า</option>
                            <option value="นาย">นาย</option>
                            <option value="นาง">นาง</option>
                            <option value="นางสาว">นางสาว</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">ชื่อ</span>
                        </label>
                        <input v-model="formData.first_name" type="text" class="input input-bordered w-full" required
                            @input="validateFirstName" :class="{ 'input-error': firstNameError }" autocomplete="off" />
                        <label v-if="firstNameError" class="label">
                            <span class="label-text-alt text-error">{{ firstNameError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">นามสกุล</span>
                        </label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered w-full" required
                            @input="validateLastName" :class="{ 'input-error': lastNameError }" autocomplete="off" />
                        <label v-if="lastNameError" class="label">
                            <span class="label-text-alt text-error">{{ lastNameError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">ตำแหน่ง</span>
                        </label>
                        <select v-model="formData.position" class="select select-bordered w-full" required>
                            <option value="">เลือกตำแหน่ง</option>
                            <option v-for="pos in positions" :key="pos._id" :value="pos.name">{{ pos.name }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">แผนก</span>
                        </label>
                        <select v-model="formData.department" class="select select-bordered w-full" required>
                            <option value="">เลือกแผนก</option>
                            <option v-for="dept in departments" :key="dept._id" :value="dept.name">{{ dept.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เลขบัตร RFID <span class="text-gray-500">(ไม่บังคับ)</span></span>
                        </label>
                        <input v-model="formData.rfid" type="text" class="input input-bordered w-full"
                            @input="validateRfid" autocomplete="off" />
                        <label v-if="rfidError" class="label"><span class="label-text-alt text-error">{{ rfidError
                        }}</span></label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">สถานะ</span>
                        </label>
                        <select v-model="formData.status" class="select select-bordered w-full" required>
                            <option value="">เลือกสถานะ</option>
                            <option value="ปกติ">ปกติ</option>
                            <option value="พักงาน">พักงาน</option>
                        </select>
                    </div>

                    <!-- <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">รูปภาพ (ถ้าต้องการเปลี่ยน)</span>
                        </label>
                        <input ref="fileInputRef" type="file" @change="handleFileChange" accept="image/jpeg,image/jpg"
                            class="file-input file-input-bordered w-full" />
                        <label class="label">
                            <span class="label-text-alt text-gray-500">JPG only (สูงสุด 70KB)</span>
                        </label>
                        <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                    </div> -->
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">ยกเลิก</button>
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
import { TeacherService } from '../../api/teacher'
import { ref, computed } from 'vue'

const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const modalRef = ref(null)
const loading = ref(false)
const teacherId = ref('')
const currentImage = ref('')
const previewImage = ref('')
const fileError = ref('')
const fileInputRef = ref(null)
const firstNameError = ref('')
const lastNameError = ref('')
const useridError = ref('')
const rfidError = ref('')
const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    rfid: '',
    status: '',
    picture: null
})

const props = defineProps({
    departments: {
        type: Array,
        default: () => []
    },
    positions: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['success'])

const openModal = async (teacher) => {
    teacherId.value = teacher.id
    currentImage.value = getPictureUrl(teacher.picture) || ''
    previewImage.value = ''
    fileError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    formData.value = {
        userid: teacher.userid,
        pre_name: teacher.name.split(' ')[0] || '',
        first_name: teacher.name.split(' ')[1] || '',
        last_name: teacher.name.split(' ').slice(2).join(' ') || '',
        position: teacher.position,
        department: teacher.department,
        status: 'ปกติ',
        picture: null,
        rfid: teacher.rfid !== undefined && teacher.rfid !== null ? String(teacher.rfid) : ''
    }
    useridError.value = ''
    rfidError.value = ''

    if (teacher.picture) {
        try {
            const response = await fetch(teacher.picture)
            const blob = await response.blob()
            if (blob.size > 70 * 1024) {
                const resizedBlob = await resizeImage(blob, 70, 0)
                if (resizedBlob.size <= 70 * 1024) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        currentImage.value = e.target.result
                        previewImage.value = ''
                    }
                    reader.readAsDataURL(resizedBlob)
                    formData.value.picture = new File([resizedBlob], 'teacher.jpg', { type: 'image/jpeg' })
                } else {
                    fileError.value = `ขนาดรูปบุคลากรเกิน 70KB (${(blob.size / 1024).toFixed(2)}KB)`
                }
            }
        } catch (err) {
            fileError.value = 'เกิดข้อผิดพลาดในการตรวจสอบหรือปรับขนาดรูปภาพ'
        }
    }

    modalRef.value.showModal()
}

const closeModal = () => {
    modalRef.value.close()
    rfidError.value = ''
    currentImage.value = ''
    previewImage.value = ''
    fileError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        position: '',
        department: '',
        status: '',
        picture: null
    }
    useridError.value = ''
}


async function resizeImage(file, maxSizeKB = 70, targetWidth = 450) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxBytes = maxSizeKB * 1024;
                let width = targetWidth > 0 ? targetWidth : img.width;
                let height = Math.max(1, Math.round((img.height * width) / img.width));
                let quality = 0.9;

                function tryCompress() {
                    canvas.width = Math.max(1, Math.round(width));
                    canvas.height = Math.max(1, Math.round(height));
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((b) => {
                        if (!b) return reject('บีบอัดรูปไม่สำเร็จ');

                        if (b.size <= maxBytes) {
                            resolve(b);
                            return;
                        }

                        if (quality > 0.45) {
                            quality -= 0.07;
                            tryCompress();
                            return;
                        }

                        if (width > 120) {
                            width = Math.max(120, Math.round(width * 0.9));
                            height = Math.max(1, Math.round((img.height * width) / img.width));
                            quality = 0.9;
                            tryCompress();
                            return;
                        }

                        reject(`ไม่สามารถบีบอัดรูปให้ไม่เกิน ${maxSizeKB}KB ได้`);
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
            const resizedBlob = await resizeImage(file, 70, 450);
            formData.value.picture = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(resizedBlob);
        } catch (err) {
            fileError.value = err?.message || String(err) || 'เกิดข้อผิดพลาดในการรีไซส์รูปภาพ';
            event.target.value = '';
        }
    }
}

const nameRegex = /^[A-Za-z\u0E00-\u0E7F]+$/

const validateFirstName = () => {
    if (!formData.value.first_name) {
        firstNameError.value = 'กรุณากรอกชื่อ'
    } else if (!nameRegex.test(formData.value.first_name)) {
        firstNameError.value = 'ใส่ได้เฉพาะตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น'
    } else {
        firstNameError.value = ''
    }
}

const validateLastName = () => {
    if (!formData.value.last_name) {
        lastNameError.value = 'กรุณากรอกนามสกุล'
    } else if (!nameRegex.test(formData.value.last_name)) {
        lastNameError.value = 'ใส่ได้เฉพาะตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น'
    } else {
        lastNameError.value = ''
    }
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

const isFormValid = computed(() => {
    return (
        !firstNameError.value &&
        !lastNameError.value &&
        formData.value.first_name &&
        formData.value.last_name &&
        !rfidError.value &&
        !fileError.value
    )
})

const removeImage = () => {
    previewImage.value = ''
    currentImage.value = ''
    formData.value.picture = null
    if (fileInputRef.value) {
        fileInputRef.value.value = ''
    }
}

const handleSubmit = async () => {
    validateFirstName()
    validateLastName()
    if (!validateRfid()) return
    useridError.value = ''
    if (!isFormValid.value) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกชื่อและนามสกุลเป็นตัวอักษรเท่านั้น',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        return
    }
    loading.value = true
    try {
        const teacherService = new TeacherService()
        const response = await teacherService.updateTeacher(teacherId.value, formData.value)
        if (response.message === 'Success') {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'success',
                title: 'แก้ไขข้อมูลอาจารย์สำเร็จ',
                showConfirmButton: false,
                timer: 1500,
                didOpen: () => {
                    document.getElementById('app')?.removeAttribute('aria-hidden')
                }
            })
            emit('success')
            closeModal()
        }
    } catch (error) {
        const duplicate = error?.response?.status === 409 || (error?.response?.data?.error && error.response.data.error.includes('duplicate teacher userid'));
        if (duplicate) {
            useridError.value = 'มีรหัสนี้แล้ว กรุณาใช้รหัสอื่น';
            return;
        }
        console.error('Update teacher error:', error)
        closeModal();
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถแก้ไขข้อมูลอาจารย์ได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

defineExpose({
    openModal
})
</script>

<style scoped></style>
