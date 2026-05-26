<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg mb-4">เพิ่มนักเรียน</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-semibold">
                        รูปภาพ <span class="text-gray-500">(ไม่บังคับ)</span>
                    </label>

                    <div v-if="previewImage" class="relative flex justify-center mb-4">
                        <div class="relative">
                            <img :src="previewImage" alt="Preview"
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

                    <div v-if="!previewImage" class="relative">
                        <label for="pictureInput"
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
                            <input id="pictureInput" type="file" @change="handleFileChange"
                                accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">รหัสนักเรียน</span>
                        </label>
                        <input v-model="formData.userid" type="text" class="input input-bordered w-full" required
                            @input="validateUserId" :class="{ 'input-error': useridError }" autocomplete="off" />
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
                            <option value="เด็กชาย">เด็กชาย</option>
                            <option value="เด็กหญิง">เด็กหญิง</option>
                            <option value="นาย">นาย</option>
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
                            <span class="label-text">เลขบัตร RFID <span class="text-gray-500">(ไม่บังคับ)</span></span>
                        </label>
                        <input v-model="formData.rfid" type="text" class="input input-bordered w-full"
                            @input="validateRfid" :class="{ 'input-error': rfidError }" autocomplete="off" />
                        <label v-if="rfidError" class="label">
                            <span class="label-text-alt text-error">{{ rfidError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เบอร์โทรผู้ปกครอง <span
                                    class="text-gray-500">(ไม่บังคับ)</span></span>
                        </label>
                        <input v-model="formData.guardian_phone" type="text" class="input input-bordered w-full"
                            @input="validateGuardianPhone" :class="{ 'input-error': guardianPhoneError }"
                            autocomplete="off" />
                        <label v-if="guardianPhoneError" class="label">
                            <span class="label-text-alt text-error">{{ guardianPhoneError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full md:col-span-2">
                        <label class="label">
                            <span class="label-text">ชั้นปี / ห้อง</span>
                        </label>
                        <template v-if="auth.user?.role === 'teacher'">
                            <div class="p-2 rounded bg-gray-100 border text-base">
                                ชั้น: {{ formData.grade }} ห้อง: {{ formData.classroom }}
                            </div>
                        </template>
                        <template v-else>
                            <div class="form-control w-full mb-2">
                                <label class="label">
                                    <span class="label-text">ชั้นปี</span>
                                </label>
                                <select v-model="formData.grade" @change="handleGradeChange"
                                    class="select select-bordered w-full" required>
                                    <option value="">เลือกชั้นปี</option>
                                    <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ grade }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-control w-full">
                                <label class="label">
                                    <span class="label-text">ห้อง</span>
                                </label>
                                <select v-model="formData.classroom" class="select select-bordered w-full" required>
                                    <option value="">เลือกห้อง</option>
                                    <option v-for="room in availableClassrooms" :key="room" :value="room">{{ room }}
                                    </option>
                                </select>
                            </div>
                        </template>
                    </div>
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
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const modalRef = ref(null)
const loading = ref(false)
const previewImage = ref('')
const fileError = ref('')
const firstNameError = ref('')
const lastNameError = ref('')
const rfidError = ref('')
const guardianPhoneError = ref('')
const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    rfid: '',
    guardian_phone: '',
    grade: '',
    classroom: '',
    picture: null
})

const useridError = ref('')

const props = defineProps({
    classrooms: {
        type: Array,
        default: () => []
    },
    fixedGrade: {
        type: String,
        default: ''
    },
    fixedClassroom: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['success'])

const availableGrades = computed(() => {
    const grades = [...new Set(props.classrooms.map(c => c.grade))]
    return grades.sort((a, b) => {
        const gradeA = parseInt(a.replace('ม.', ''))
        const gradeB = parseInt(b.replace('ม.', ''))
        return gradeA - gradeB
    })
})

watch(() => auth.user?.role, (role) => {
    if (role === 'teacher') {
        if (props.fixedGrade && props.fixedClassroom) {
            formData.value.grade = props.fixedGrade
            formData.value.classroom = props.fixedClassroom
        } else {
            formData.value.grade = localStorage.getItem('grade') || ''
            formData.value.classroom = localStorage.getItem('classroom') || ''
        }
    }
})

const availableClassrooms = computed(() => {
    const rooms = props.classrooms
        .filter(c => c.grade === formData.value.grade)
        .map(c => c.classroom)
    return rooms.sort((a, b) => a - b)
})

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
        return
    }

    if (!/^\d+$/.test(formData.value.rfid)) {
        rfidError.value = 'เลขบัตรต้องเป็นตัวเลขเท่านั้น'
    } else {
        rfidError.value = ''
    }
}

const validateGuardianPhone = () => {
    if (!formData.value.guardian_phone) {
        guardianPhoneError.value = ''
        return
    }

    if (!/^\d+$/.test(formData.value.guardian_phone)) {
        guardianPhoneError.value = 'เบอร์โทรผู้ปกครองต้องเป็นตัวเลขเท่านั้น'
    } else {
        guardianPhoneError.value = ''
    }
}

const isFormValid = computed(() => {
    return (
        !firstNameError.value &&
        !lastNameError.value &&
        !rfidError.value &&
        !guardianPhoneError.value &&
        formData.value.userid &&
        formData.value.pre_name &&
        formData.value.first_name &&
        formData.value.last_name &&
        formData.value.grade &&
        formData.value.classroom &&
        !fileError.value
    )
})

const openModal = (fixed = null) => {
    if (auth.user?.role === 'teacher' && fixed) {
        formData.value = {
            userid: '',
            pre_name: '',
            first_name: '',
            last_name: '',
            rfid: '',
            guardian_phone: '',
            grade: fixed.grade,
            classroom: fixed.classroom,
            picture: null
        }
    } else {
        formData.value = {
            userid: '',
            pre_name: '',
            first_name: '',
            last_name: '',
            rfid: '',
            guardian_phone: '',
            grade: '',
            classroom: '',
            picture: null
        }
    }
    previewImage.value = ''
    fileError.value = ''
    useridError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    rfidError.value = ''
    guardianPhoneError.value = ''
    modalRef.value.showModal()
}

const closeModal = () => {
    modalRef.value.close()
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        rfid: '',
        guardian_phone: '',
        grade: '',
        classroom: '',
        picture: null
    }
    previewImage.value = ''
    fileError.value = ''
    useridError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    rfidError.value = ''
    guardianPhoneError.value = ''
}

const handleGradeChange = () => {
    formData.value.classroom = ''
    if (availableClassrooms.value.length > 0) {
        formData.value.classroom = availableClassrooms.value[0]
    }
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

const removeImage = () => {
    previewImage.value = ''
    fileError.value = ''
    formData.value.picture = null
    const fileInput = document.getElementById('pictureInput')
    if (fileInput) {
        fileInput.value = ''
    }
}

const handleSubmit = async () => {
    validateFirstName()
    validateLastName()
    validateRfid()
    validateGuardianPhone()

    if (!isFormValid.value) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'ข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        return
    }

    emit('success', {
        ...formData.value,
        onError: async (err) => {
            const errStr = String(err).replace(/\s+/g, '').toLowerCase();
            if (errStr.includes('duplicatestudentuserid')) {
                useridError.value = 'มีรหัสนี้แล้ว กรุณาใช้รหัสอื่น'
            } else {
                closeModal();
                const { default: Swal } = await import('sweetalert2');
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเพิ่มนักเรียนได้',
                    confirmButtonColor: '#2563eb',
                    didOpen: () => {
                        document.getElementById('app')?.removeAttribute('aria-hidden')
                    }
                });
            }
        },
        onSuccess: () => {
            closeModal()
        }
    })
}

defineExpose({
    openModal
})
</script>

<style scoped></style>
