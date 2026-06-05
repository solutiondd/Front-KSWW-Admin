<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex justify-between items-center text-white">
            <h1 class="text-lg md:text-3xl font-bold">สแกนไม่สำเร็จ</h1>
            <input v-model="filters.date" type="date" @change="fetchData"
                class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
        </div>

        <div class="bg-base-100 rounded-lg shadow-lg p-4">
            <div class="form-control">
                <label class="label py-1">
                    <span class="label-text text-sm font-medium">สถานที่</span>
                </label>
                <select v-model="filters.device_sn" @change="handleDeviceChange"
                    class="select select-sm select-bordered w-full max-w-xs">
                    <option value="">ทั้งหมด</option>
                    <option v-for="device in devices" :key="device._id" :value="device.serial_number">
                        {{ device.location }}
                    </option>
                </select>
            </div>
        </div>

        <div v-if="error" class="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else>
            <StrangerTable :data="strangerData" :startIndex="(pagination.page - 1) * pagination.limit"
                @viewImage="openImageModal" />

            <div v-if="totalPages > 1" class="flex justify-center mt-6">
                <div class="join shadow-lg">
                    <button @click="goToPage(1)" class="join-item btn btn-sm" :disabled="pagination.page === 1">
                        ‹
                    </button>

                    <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                        :class="['join-item btn btn-sm', page === pagination.page ? 'btn-active' : '']"
                        :disabled="typeof page !== 'number'">
                        {{ page }}
                    </button>

                    <button @click="goToPage(totalPages)" class="join-item btn btn-sm"
                        :disabled="pagination.page === totalPages">
                        ›
                    </button>
                </div>
            </div>

            <div v-if="totalRecords > 0" class="text-center text-sm text-base-content/60 mt-4 text-white">
                ทั้งหมด {{ totalRecords }} รายการ (หน้า {{ pagination.page }} / {{ totalPages }})
            </div>
        </div>
    </div>

    <dialog ref="imageModal" class="modal">
        <div class="modal-box max-w-7xl w-full p-0">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
            </form>
            <img v-if="selectedImage" :src="`${imgBaseUrl}${selectedImage}`" alt="stranger image"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import StrangerTable from '../../../components/Report/StrangerTable.vue'
import reportApi from '../../../api/report.js'
import deviceService from '../../../api/device.js'

const imgBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL

const loading = ref(false)
const error = ref(null)
const strangerData = ref([])
const devices = ref([])
const selectedImage = ref(null)
const imageModal = ref(null)
const totalRecords = ref(0)
const totalPages = ref(1)

const filters = ref({
    date: getDefaultDate(),
    device_sn: ''
})

const pagination = ref({
    page: 1,
    limit: 10
})

function getDefaultDate() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const fetchDevices = async () => {
    try {
        const response = await deviceService.getDevices()
        if (response.message === 'Success') {
            devices.value = response.data || []
        }
    } catch (err) {
        console.error('Error fetching devices:', err)
    }
}

const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
        const params = {
            start: `${filters.value.date} 00:00:00`,
            end: `${filters.value.date} 23:59:59`,
            device_sn: filters.value.device_sn,
            page: pagination.value.page,
            limit: pagination.value.limit
        }

        const response = await reportApi.getStrangerReport(params)

        if (response.message === 'Success') {
            strangerData.value = response.data || []
            totalRecords.value = response.total_items || 0
            totalPages.value = response.total_pages || 1
            pagination.value.page = response.page || 1
            pagination.value.limit = response.limit || 10
        }
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง'
        console.error('Error fetching stranger report:', err)
    } finally {
        loading.value = false
    }
}

const handleDeviceChange = () => {
    pagination.value.page = 1
    fetchData()
}

const startItem = computed(() => totalRecords.value === 0 ? 0 : (pagination.value.page - 1) * pagination.value.limit + 1)
const endItem = computed(() => Math.min(pagination.value.page * pagination.value.limit, totalRecords.value))

const MAX_VISIBLE_PAGES = 3

const visiblePages = computed(() => {
    const current = pagination.value.page
    const total = totalPages.value
    const maxPagesToShow = MAX_VISIBLE_PAGES

    if (total <= 1) {
        return []
    }

    if (total <= maxPagesToShow) {
        const pages = []
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
        return pages
    }

    let startPage = current - Math.floor(maxPagesToShow / 2)
    let endPage = current + Math.floor(maxPagesToShow / 2)

    if (startPage < 1) {
        startPage = 1
        endPage = Math.min(total, maxPagesToShow)
    }

    if (endPage > total) {
        endPage = total
        startPage = Math.max(1, total - maxPagesToShow + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
})

const goToPage = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        pagination.value.page = page
        fetchData()
    }
}

const openImageModal = (image) => {
    selectedImage.value = image
    imageModal.value.showModal()
}

onMounted(() => {
    fetchDevices()
    fetchData()
})
</script>

<style scoped></style>