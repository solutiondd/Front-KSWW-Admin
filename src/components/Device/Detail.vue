<template>
    <dialog ref="detailModal" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
            <h3 class="font-bold text-lg mb-4 text-primary">รายละเอียดอุปกรณ์</h3>

            <div v-if="currentDevice" class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">Serial Number</div>
                        <div class="font-semibold">{{ currentDevice.serial_number || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">Model</div>
                        <div class="font-semibold">{{ currentDevice.modelname || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">IP Address</div>
                        <div class="font-semibold">{{ currentDevice.ipaddress || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">MAC Address</div>
                        <div class="font-semibold">{{ currentDevice.mac || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">สถานที่</div>
                        <div class="font-semibold">{{ currentDevice.location || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">ประเภทประตู</div>
                        <div class="font-semibold">{{ formatGateType(currentDevice.gate_type) }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">เวลาปัจจุบันจากอุปกรณ์</div>
                        <div class="font-semibold">{{ formatDateTime(currentDevice.current_time) }}</div>
                    </div>
                </div>

                <div class="divider my-2">การตั้งเวลา</div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">การใช้งานเวลาเข้าเรียน</div>
                        <div class="font-semibold">
                            <span class="badge"
                                :class="parseUseAttendanceTime(currentDevice.use_attendance_time) ? 'badge-success' : 'badge-ghost'">
                                {{ parseUseAttendanceTime(currentDevice.use_attendance_time) ? 'เปิดใช้งาน' :
                                    'ไม่ใช้งาน' }}
                            </span>
                        </div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">เวลาเริ่มเช็คชื่อ</div>
                        <div class="font-semibold">{{ currentDevice.attendance_start_time || '-' }}</div>
                    </div>
                    <div class="bg-base-200 rounded-lg p-3">
                        <div class="text-xs text-base-content/60">เวลาสิ้นสุดเช็คชื่อ</div>
                        <div class="font-semibold">{{ currentDevice.attendance_end_time || '-' }}</div>
                    </div>
                </div>
            </div>

            <div class="modal-action">
                <button type="button" class="btn" @click="closeModal">ปิด</button>
            </div>
        </div>

        <form method="dialog" class="modal-backdrop">
            <button @click="closeModal">close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'

const detailModal = ref(null)
const currentDevice = ref(null)

const parseUseAttendanceTime = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1'
    return false
}

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    try {
        const date = new Date(dateTimeString)
        return date.toLocaleString('th-TH-u-ca-buddhist', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    } catch (error) {
        return dateTimeString
    }
}

const formatGateType = (gateType) => {
    if (!gateType) return '-'
    const s = String(gateType).toLowerCase()
    if (s === 'in' || s === 'enter' || s === 'entry') return 'เข้า'
    if (s === 'out' || s === 'exit') return 'ออก'
    return gateType
}

const openModal = (device) => {
    currentDevice.value = device || null
    if (detailModal.value) {
        detailModal.value.showModal()
    }
}

const closeModal = () => {
    if (detailModal.value) {
        detailModal.value.close()
    }
    currentDevice.value = null
}

defineExpose({
    openModal,
    closeModal
})
</script>

<style scoped></style>