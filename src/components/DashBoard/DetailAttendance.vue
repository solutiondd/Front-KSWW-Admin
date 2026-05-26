<template>
    <dialog ref="detailModal" class="modal">
        <div class="modal-box max-w-3xl">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <div class="border-b-2 border-blue-200 pb-4 mb-6">
                <h3 class="text-xl font-bold text-blue-900">รายละเอียดการเข้า-ออก</h3>
            </div>
            <div v-if="selectedItem">
                <div class="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p class="text-xs text-blue-600 mb-1">รหัส</p>
                        <p class="font-semibold text-blue-900">{{ selectedItem.userid }}</p>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p class="text-xs text-yellow-600 mb-1">ชื่อ-สกุล</p>
                        <p class="font-semibold text-yellow-900">{{ selectedItem.name }}</p>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p class="text-xs text-blue-600 mb-1">ตำแหน่ง</p>
                        <p class="font-semibold text-blue-900">{{ selectedItem.position }}</p>
                    </div>
                    <div v-if="props.role !== 'teacher'" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p class="text-xs text-yellow-600 mb-1">ชั้นเรียน</p>
                        <p class="font-semibold text-yellow-900">
                            {{ `${selectedItem.grade}/${selectedItem.classroom}` }}
                        </p>
                    </div>
                </div>
                <div v-if="selectedItem.attendance && selectedItem.attendance.length > 0">
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-700">บันทึกเวลา</h4>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="(ts, idx) in selectedItem.attendance" :key="idx"
                            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                            @click="ts.imageUrl ? openImageModal(ts.imageUrl) : null">
                            <template v-if="ts.imageUrl">
                                <img :src="`${imgBaseUrl}${ts.imageUrl}`" alt="attendance image"
                                    class="w-full h-36 object-cover rounded-t-lg" @error="ts.imageUrl = null" />
                            </template>
                            <template v-else>
                                <div
                                    class="flex items-center justify-center w-full h-36 bg-gray-100 rounded-t-lg text-gray-400">
                                    โหลดรูปไม่สำเร็จ</div>
                            </template>
                            <div class="p-3">
                                <p class="text-sm font-semibold text-blue-700 text-center mb-1">{{
                                    formatTime(ts.timeStamp) }}</p>
                                <p v-if="hasSimilarity(ts.similarity)" class="text-xs text-gray-500 text-center">
                                    ความเหมือน: {{ ts.similarity }}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลการเข้า-ออก
                </div>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="imageModal" class="modal">
        <div class="modal-box max-w-7xl w-full p-0">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
            </form>
            <img v-if="selectedImage" :src="imgBaseUrl + selectedImage" alt="attendance image"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
<script setup>
import { ref } from 'vue'
const imgBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const detailModal = ref(null)
const imageModal = ref(null)
const selectedItem = ref(null)
const selectedImage = ref(null)
const props = defineProps({ role: { type: String, default: 'student' } })
const openModal = (item) => {
    selectedItem.value = item
    detailModal.value.showModal()
}
const openImageModal = (image) => {
    selectedImage.value = image
    imageModal.value.showModal()
}
const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const parts = timestamp.split(' ')
    return parts.length > 1 ? parts[1] : timestamp
}

const hasSimilarity = (value) => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    return true
}

defineExpose({ openModal })
</script>