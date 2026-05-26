<template>
    <dialog ref="infoModal" class="modal">
        <div class="modal-box max-w-3xl">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <div class="border-b-2 border-blue-200 pb-4 mb-6">
                <h3 class="text-xl font-bold text-blue-900">รายละเอียดการเข้า-ออก</h3>
            </div>
            <div v-if="user">
                <div class="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p class="text-xs text-blue-600 mb-1">รหัส</p>
                        <p class="font-semibold text-blue-900">{{ user.userid || user.code || user.id }}</p>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p class="text-xs text-yellow-600 mb-1">ชื่อ-สกุล</p>
                        <p class="font-semibold text-yellow-900">{{ user.name }}</p>
                    </div>
                    <div v-if="type === 'teacher'" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p class="text-xs text-blue-600 mb-1">ตำแหน่ง</p>
                        <p class="font-semibold text-blue-900">{{ user.position }}</p>
                    </div>
                    <div v-if="type === 'teacher'" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p class="text-xs text-yellow-600 mb-1">แผนก</p>
                        <p class="font-semibold text-yellow-900">{{ user.department }}</p>
                    </div>
                    <div v-if="type === 'student'" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p class="text-xs text-blue-600 mb-1">ระดับชั้น</p>
                        <p class="font-semibold text-blue-900">{{ user.grade }}</p>
                    </div>
                    <div v-if="type === 'student'" class="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p class="text-xs text-yellow-600 mb-1">ห้อง</p>
                        <p class="font-semibold text-yellow-900">{{ user.classroom || user.room }}</p>
                    </div>
                </div>
                <div v-if="attendance">
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-700">บันทึกเวลา - {{ formatDate(attendance.date) }}</h4>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="(ts, idx) in attendance.timeStamps" :key="idx"
                            class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                            @click="openImageModal(ts.image)">
                            <div class="w-full h-36 rounded-t-lg flex items-center justify-center bg-gray-100 relative">
                                <img v-if="ts.image" :src="`${imgBaseUrl}${ts.image}`" alt="attendance image"
                                    class="w-full h-36 object-cover rounded-t-lg absolute top-0 left-0"
                                    @error="imageErrorHandler($event, idx)" v-show="!imageError[idx]" />
                                <span v-if="!ts.image || imageError[idx]"
                                    class="text-4xl font-bold text-blue-700 select-none z-10">
                                    {{ getInitials(user.name) }}
                                </span>
                            </div>
                            <div class="p-3">
                                <p class="text-sm font-semibold text-blue-700 text-center mb-1">{{
                                    formatTime(ts.timestamp) }}</p>
                                <p class="text-xs text-gray-600 text-center">{{ ts.location }}</p>
                                <p v-if="hasSimilarity(ts.similarity)" class="text-xs text-gray-500 text-center mt-1">
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
            <img v-if="selectedImage" :src="`${imgBaseUrl}${selectedImage}`" alt="attendance image"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
const props = defineProps({
    user: { type: Object, required: true },
    attendance: { type: Object, default: null },
    type: { type: String, default: 'student' },
})
const imgBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const infoModal = ref(null)
const imageModal = ref(null)
const selectedImage = ref(null)
const imageError = reactive({})

const open = () => {
    infoModal.value.showModal()
    Object.keys(imageError).forEach(k => delete imageError[k])
}
const close = () => {
    infoModal.value.close()
}
const openImageModal = (image) => {
    selectedImage.value = image
    imageModal.value.showModal()
}
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return timestamp.split(' ')[1] || timestamp
}
const imageErrorHandler = (event, idx) => {
    imageError[idx] = true
}

const hasSimilarity = (value) => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    return true
}

const getInitials = (name) => {
    if (!name) return ''
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
        return parts[0][0] + parts[1][0]
    } else if (parts.length === 1) {
        return parts[0][0]
    }
    return ''
}
defineExpose({ open, close })
</script>

<style scoped></style>
