<template>
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs sm:max-w-md relative max-h-full overflow-y-auto">
            <button @click="closePopup" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <h3 class="text-lg font-bold mb-4">แก้ไขรายการ</h3>
            <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">ชื่อรายการ</label>
                    <input v-model="form.name" type="text" class="input input-bordered w-full" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">คะแนน</label>
                    <input v-model="form.score" type="number" class="input input-bordered w-full" min="1" required />
                </div>
                <div class="mt-6 flex justify-end gap-2">
                    <button type="button" class="btn btn-secondary" @click="closePopup">ยกเลิก</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>บันทึก</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MeritService } from '../../api/merit.js'
import Swal from 'sweetalert2'

const props = defineProps({
    merit: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])
const loading = ref(false)
const form = ref({ name: '', score: '' })

watch(() => props.merit, (val) => {
    if (val) {
        form.value = { name: val.name, score: val.score }
    }
}, { immediate: true })

function closePopup() {
    emit('close')
}

async function handleSubmit() {
    loading.value = true
    try {
        const service = new MeritService()
        await service.updateMeritType(props.merit._id, { name: form.value.name, score: form.value.score })
        Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'ข้อมูลถูกแก้ไขเรียบร้อยแล้ว',
        })
        emit('updated')
        closePopup()
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: err?.response?.data?.error || err?.message || 'ไม่สามารถบันทึกข้อมูลได้',
        })
    }
    loading.value = false
}
</script>

<style scoped>
.input {
    margin-bottom: 0.5rem;
}
</style>