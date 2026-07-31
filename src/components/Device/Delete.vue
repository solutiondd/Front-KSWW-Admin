<template>
    <dialog ref="deleteModal" class="modal">
        <div class="modal-box w-11/12 max-w-md">
            <h3 class="font-bold text-lg text-error flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M8 21h8a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 009.586 3H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                ยืนยันการลบอุปกรณ์
            </h3>

            <div class="mt-4 space-y-2 text-sm">
                <p class="text-base-content/70">คุณกำลังจะลบอุปกรณ์นี้ออกจากระบบ:</p>
                <div class="p-3 rounded bg-base-200 text-xs space-y-1">
                    <p><span class="font-semibold">Serial:</span> {{ device?.serial_number || '-' }}</p>
                    <p><span class="font-semibold">IP:</span> {{ device?.ipaddress || '-' }}</p>
                    <p><span class="font-semibold">สถานที่:</span> {{ device?.location || '-' }}</p>
                </div>
                <p class="text-warning text-xs">การลบไม่สามารถย้อนกลับได้</p>
            </div>

            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="closeModal" :disabled="loading">ยกเลิก</button>
                <button type="button" class="btn btn-error" @click="confirmDelete" :disabled="loading">
                    <span v-if="!loading" class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ลบ
                    </span>
                    <span v-else class="loading loading-spinner loading-sm"></span>
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="closeModal">close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import DeviceService from '../../api/device'
import Swal from 'sweetalert2'
import { nextTick } from 'vue'

const deleteModal = ref(null)
const device = ref(null)
const loading = ref(false)
const emit = defineEmits(['deleted', 'deleteError'])

const openModal = (d) => {
    device.value = d
    if (deleteModal.value) deleteModal.value.showModal()
}

const closeModal = async () => {
    if (loading.value) return
    if (deleteModal.value) deleteModal.value.close()
    await nextTick()
    device.value = null
    emit('close')
}

const confirmDelete = async () => {
    if (!device.value?._id) return
    loading.value = true
    try {
        await DeviceService.deleteDevice(device.value._id)
        await closeModal()
        emit('deleted', device.value._id)
    } catch (error) {
        console.error('Delete error:', error)
        await closeModal()
        emit('deleteError', error)
    } finally {
        loading.value = false
    }
}

defineExpose({ openModal, closeModal })
</script>

<style scoped></style>
