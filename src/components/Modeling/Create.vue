<template>
    <div>
        <div class="flex gap-2 items-center">
            <template v-if="!selectMode">
                <button @click="openModal" class="btn btn-primary btn-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มการเชื่อมต่ออุปกรณ์
                </button>
                <button class="btn btn-warning btn-sm flex items-center gap-1" @click="handleSelectMode">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    เลือกบุคคล
                </button>
            </template>
            <template v-else>
                <button class="btn btn-ghost btn-sm flex items-center gap-1" @click="cancelSelectMode">
                    ยกเลิก
                </button>
                <button class="btn btn-info btn-sm flex items-center gap-1" @click="showBasket = true">
                    จำนวน ({{ selectedIds.length }})
                </button>
                <button class="btn btn-primary btn-sm flex items-center gap-1" @click="openCreateModalWithSelected">
                    ยืนยัน
                </button>
            </template>
            <dialog ref="basketDialog" class="modal">
                <div class="modal-box max-w-2xl">
                    <h3 class="font-bold text-lg mb-4">รายการที่เลือก ({{ selectedIds.length }})</h3>
                    <div v-if="selectedIds.length === 0" class="text-center text-base-content/60 py-8">
                        ยังไม่มีรายการที่เลือก
                    </div>
                    <div v-else>
                        <table class="table table-zebra w-full mb-4">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>รูป</th>
                                    <th>ชื่อ</th>
                                    <th>รหัส</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, idx) in pagedSelected" :key="item._id">
                                    <td>{{ (basketPage - 1) * basketPerPage + idx + 1 }}</td>
                                    <td>
                                        <img v-if="item.picture" :src="getPictureUrl(item.picture)" alt="avatar"
                                            class="w-8 h-8 rounded-full object-cover" />
                                    </td>
                                    <td>{{ item.name }}</td>
                                    <td>{{ item.userid }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-if="basketTotalPages > 1" class="flex justify-center mb-2">
                            <div class="join">
                                <button class="join-item btn btn-sm" @click="goToBasketPage(basketPage - 1)"
                                    :disabled="basketPage === 1">‹</button>
                                <button v-for="page in basketDisplayedPages" :key="page" class="join-item btn btn-sm"
                                    :class="{ 'btn-active': page === basketPage }" @click="goToBasketPage(page)">
                                    {{ page }}
                                </button>
                                <button class="join-item btn btn-sm" @click="goToBasketPage(basketPage + 1)"
                                    :disabled="basketPage === basketTotalPages">›</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-action">
                        <button class="btn btn-ghost" @click="closeBasket">ปิด</button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button type="button" @click="closeBasket">close</button>
                </form>
            </dialog>
        </div>

        <dialog ref="modal" class="modal">
            <div class="modal-box max-w-md">
                <h3 class="font-bold text-lg mb-4">เพิ่มการเชื่อมต่ออุปกรณ์</h3>
                <form @submit.prevent="handleSubmit">
                    <div v-if="!hideType" class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">ประเภท <span class="text-error">*</span></span>
                        </label>
                        <select v-model="formData.option" class="select select-bordered w-full" required>
                            <option value="" disabled>เลือกประเภท</option>
                            <option value="student">นักเรียน</option>
                            <option value="teacher">อาจารย์</option>
                        </select>
                    </div>

                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">เลือกอุปกรณ์ <span class="text-error">*</span></span>
                        </label>
                        <div v-if="loadingDevices" class="flex justify-center py-4">
                            <span class="loading loading-spinner loading-sm"></span>
                        </div>
                        <div v-else class="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                            <label v-for="device in devices" :key="device._id"
                                class="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                                <input type="checkbox" :value="device._id" v-model="formData.device_id"
                                    class="checkbox checkbox-primary checkbox-sm" />
                                <span class="text-sm">{{ device.location }}</span>
                            </label>
                            <div v-if="devices.length === 0" class="text-center text-sm text-base-content/60 py-4">
                                ไม่พบอุปกรณ์
                            </div>
                        </div>
                        <label class="label">
                            <span class="label-text-alt text-base-content/60">เลือกอุปกรณ์อย่างน้อย 1 รายการ</span>
                        </label>
                    </div>

                    <div class="modal-action flex justify-between items-center">
                        <button v-if="hideType" type="button" @click="backToSelectPerson" class="btn btn-warning">
                            กลับ
                        </button>
                        <div class="flex gap-2">
                            <button type="button" @click="closeModal" class="btn btn-ghost">ยกเลิก</button>
                            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
                                {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button type="button" @click="closeModal">close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ModelingService from '../../api/modeling.js';
import DeviceService from '../../api/device.js';
import Swal from 'sweetalert2';

const emit = defineEmits(['created', 'selectModeChanged', 'selectedIds']);
const selectMode = ref(false);

const modal = ref(null);
const basketDialog = ref(null);
const showBasket = ref(false);

function closeBasket() {
    showBasket.value = false;
    basketDialog.value?.close();
}

watch(showBasket, (val) => {
    if (val) {
        basketDialog.value?.showModal();
    } else {
        basketDialog.value?.close();
    }
});

const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
function getPictureUrl(pic) {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
}
const isSubmitting = ref(false);
const loadingDevices = ref(false);
const devices = ref([]);

const basketPage = ref(1);
const basketPerPage = 5;
const pagedSelected = computed(() => {
    const reversed = [...selectedIds.value].reverse();
    const start = (basketPage.value - 1) * basketPerPage;
    const end = start + basketPerPage;
    return reversed.slice(start, end);
});
const basketTotalPages = computed(() => Math.ceil(selectedIds.value.length / basketPerPage));
const basketDisplayedPages = computed(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, basketPage.value - Math.floor(maxVisible / 2));
    let endPage = Math.min(basketTotalPages.value, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});
function goToBasketPage(page) {
    if (page >= 1 && page <= basketTotalPages.value) {
        basketPage.value = page;
    }
}
watch(showBasket, (val) => {
    if (val) basketPage.value = 1;
    if (val) {
        basketDialog.value?.showModal();
    } else {
        basketDialog.value?.close();
    }
});

const formData = ref({
    option: 'student',
    device_id: []
});

const hideType = ref(false);


const props = defineProps({
    selectedIds: {
        type: Array,
        default: () => [],
    },
});

const selectedIds = computed(() => props.selectedIds);

const openCreateModalWithSelected = () => {
    openModal();
    hideType.value = true;
};

const openModal = () => {
    modal.value?.showModal();
    loadDevices();
};

const closeModal = () => {
    modal.value?.close();
    resetForm();
    selectMode.value = false;
    hideType.value = false;
    emit('selectModeChanged', false);
};

const resetForm = () => {
    formData.value = {
        option: 'student',
        device_id: []
    };
};

const loadDevices = async () => {
    loadingDevices.value = true;
    try {
        const response = await DeviceService.getDevices();
        if (response.message === 'Success') {
            devices.value = response.data || [];
        }
    } catch (error) {
        console.error('Error loading devices:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error?.response?.data?.error || error?.message || 'ไม่สามารถโหลดข้อมูลอุปกรณ์ได้'
        });
    } finally {
        loadingDevices.value = false;
    }
};

const handleSelectMode = () => {
    selectMode.value = !selectMode.value;
    emit('selectModeChanged', selectMode.value);
};

const cancelSelectMode = () => {
    selectMode.value = false;
    emit('selectModeChanged', false);
    emit('selectedIds', []);
};

const handleSubmit = async () => {
    if (formData.value.device_id.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือน',
            text: 'กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ'
        });
        return;
    }

    isSubmitting.value = true;
    try {

        let payload;
        if (hideType.value) {
            payload = {
                option: "user selected",
                device_id: formData.value.device_id,
                user_id: selectedIds.value.map(obj => obj._id)
            };
        } else {
            payload = formData.value;
        }

        const response = await ModelingService.createModeling(payload);

        if (response.message === 'Success') {
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'สร้าง Modeling สำเร็จ',
                timer: 1500,
                showConfirmButton: false
            });
            closeModal();
            emit('created');
        }
    } catch (error) {
        console.error('Error creating modeling:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error?.response?.data?.error || error?.response?.data?.message || error?.message || 'ไม่สามารถสร้าง Modeling ได้'
        });
    } finally {
        isSubmitting.value = false;
    }
};

const backToSelectPerson = () => {
    hideType.value = false;
    modal.value?.close();
};

onMounted(() => {
});
</script>

<style scoped></style>