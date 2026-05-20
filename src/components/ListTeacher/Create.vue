<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl overflow-visible overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">เพิ่มบุคลากร</h3>

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
                                <span class="text-sm font-medium text-gray-700">เลือกรูปภาพอาจารย์</span>
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
                            <span class="label-text">รหัสบุคลากร</span>
                        </label>
                        <input v-model="formData.userid" type="text"
                            :class="['input input-bordered w-full', useridError ? 'border-error focus:border-error' : '']"
                            required />
                        <div v-if="useridError" class="text-sm text-error mt-1">{{ useridError }}</div>
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
                        <input v-model="formData.first_name" type="text" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">นามสกุล</span>
                        </label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control relative z-[100] w-full">
                        <label class="label">
                            <span class="label-text">ตำแหน่ง</span>
                        </label>
                        <div class="relative" ref="positionBoxRef">
                            <input ref="positionInputRef" v-model="positionQuery" type="text"
                                class="input input-bordered w-full" placeholder="พิมพ์เพื่อค้นหาและเลือกตำแหน่ง..."
                                @focus="positionOpen = true" @input="positionOpen = true" required />
                            <ul v-if="positionOpen"
                                class="bg-base-100 rounded-box shadow-lg border absolute z-[1000] top-full left-0 mt-1 w-full max-h-60 overflow-y-auto">
                                <li v-if="!filteredPositions.length" class="px-3 py-2 text-sm opacity-70">
                                    ไม่พบตำแหน่งที่ตรงกับคำค้นหา
                                </li>
                                <li v-for="pos in filteredPositions" :key="pos._id" class="block">
                                    <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200 block"
                                        @click="selectPosition(pos)">
                                        {{ pos.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-control relative z-[99] w-full">
                        <label class="label">
                            <span class="label-text">แผนก</span>
                        </label>
                        <div class="relative" ref="departmentBoxRef">
                            <input ref="departmentInputRef" v-model="departmentQuery" type="text"
                                class="input input-bordered w-full" placeholder="พิมพ์เพื่อค้นหาและเลือกแผนก..."
                                @focus="departmentOpen = true" @input="departmentOpen = true" required />
                            <ul v-if="departmentOpen"
                                class="bg-base-100 rounded-box shadow-lg border absolute z-[999] top-full left-0 mt-1 w-full max-h-60 overflow-y-auto">
                                <li v-if="!filteredDepartments.length" class="px-3 py-2 text-sm opacity-70">
                                    ไม่พบแผนกที่ตรงกับคำค้นหา
                                </li>
                                <li v-for="dept in filteredDepartments" :key="dept._id" class="block">
                                    <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200 block"
                                        @click="selectDepartment(dept)">
                                        {{ dept.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เลขบัตร RFID <span class="text-gray-500">(ไม่บังคับ)</span></span>
                        </label>
                        <input v-model="formData.rfid" type="text"
                            :class="['input input-bordered w-full', rfidError ? 'border-error focus:border-error' : '']"
                            @input="validateRfid" autocomplete="off" />
                        <div v-if="rfidError" class="text-sm text-error mt-1">{{ rfidError }}</div>
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
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">ยกเลิก</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>บันทึก</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const modalRef = ref(null)
const loading = ref(false)
const previewImage = ref('')
const fileName = ref('')
const fileError = ref('')
const useridError = ref('')
const rfidError = ref('')

const positionQuery = ref('')
const positionOpen = ref(false)
const positionBoxRef = ref(null)
const positionInputRef = ref(null)

const departmentQuery = ref('')
const departmentOpen = ref(false)
const departmentBoxRef = ref(null)
const departmentInputRef = ref(null)

const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    rfid: '',
    position: '',
    department: '',
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

const filteredPositions = computed(() => {
    const q = positionQuery.value.trim().toLowerCase()
    if (!q) return props.positions
    return props.positions.filter(pos => {
        const name = (pos.name || '').toLowerCase()
        return name.includes(q)
    })
})

const filteredDepartments = computed(() => {
    const q = departmentQuery.value.trim().toLowerCase()
    if (!q) return props.departments
    return props.departments.filter(dept => {
        const name = (dept.name || '').toLowerCase()
        return name.includes(q)
    })
})

const selectPosition = (pos) => {
    formData.value.position = pos.name
    positionQuery.value = pos.name
    positionOpen.value = false
}

const selectDepartment = (dept) => {
    formData.value.department = dept.name
    departmentQuery.value = dept.name
    departmentOpen.value = false
}

const clearPosition = () => {
    formData.value.position = ''
    positionQuery.value = ''
    positionOpen.value = false
}

const clearDepartment = () => {
    formData.value.department = ''
    departmentQuery.value = ''
    departmentOpen.value = false
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

let _onDocClickPosition = null
let _onDocClickDepartment = null

onMounted(() => {
    _onDocClickPosition = (e) => {
        if (!positionOpen.value) return
        const box = positionBoxRef.value
        if (box && !box.contains(e.target)) {
            positionOpen.value = false
        }
    }
    _onDocClickDepartment = (e) => {
        if (!departmentOpen.value) return
        const box = departmentBoxRef.value
        if (box && !box.contains(e.target)) {
            departmentOpen.value = false
        }
    }
    document.addEventListener('click', _onDocClickPosition)
    document.addEventListener('click', _onDocClickDepartment)
})

onBeforeUnmount(() => {
    if (_onDocClickPosition) document.removeEventListener('click', _onDocClickPosition)
    if (_onDocClickDepartment) document.removeEventListener('click', _onDocClickDepartment)
})

const openModal = () => {
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        rfid: '',
        position: '',
        department: '',
        status: '',
        picture: null
    }
    previewImage.value = ''
    fileName.value = ''
    fileError.value = ''
    useridError.value = ''
    rfidError.value = ''
    positionQuery.value = ''
    departmentQuery.value = ''
    positionOpen.value = false
    departmentOpen.value = false
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
        position: '',
        department: '',
        status: '',
        picture: null
    }
    previewImage.value = ''
    fileName.value = ''
    fileError.value = ''
    useridError.value = ''
    rfidError.value = ''
    positionQuery.value = ''
    departmentQuery.value = ''
    positionOpen.value = false
    departmentOpen.value = false
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
            fileName.value = file.name;
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
    fileName.value = ''
    fileError.value = ''
    formData.value.picture = null
    const fileInput = document.getElementById('pictureInput')
    if (fileInput) {
        fileInput.value = ''
    }
}

const handleSubmit = async () => {
    useridError.value = ''
    if (!validateRfid()) {
        return
    }
    loading.value = true
    emit('success', {
        ...formData.value,
        onError: async (err) => {
            const errStr = String(err).replace(/\s+/g, '').toLowerCase();
            if (errStr.includes('duplicateteacheruserid')) {
                useridError.value = 'มีรหัสนี้แล้ว กรุณาใช้รหัสอื่น'
            } else {
                closeModal();
                const { default: Swal } = await import('sweetalert2');
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเพิ่มบุคลากรได้',
                    confirmButtonColor: '#2563eb',
                    didOpen: () => {
                        document.getElementById('app')?.removeAttribute('aria-hidden')
                    }
                });
            }
            loading.value = false
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
