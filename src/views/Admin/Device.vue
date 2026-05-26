<template>
    <div class="max-[944px]:pt-14">
        <div class="w-full bg-base-200 min-h-full rounded-lg shadow-md p-6">
            <div class="flex flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 class="text-xl sm:text-3xl font-bold text-primary">จัดการอุปกรณ์</h1>
                    <p class="text-sm sm:text-base text-base-content/60 mt-1">ระบบจัดการข้อมูลอุปกรณ์</p>
                </div>
                <button v-if="auth.user?.role !== 'viewer'" @click="openCreateModal" class="btn btn-primary gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 sm:h-5 w-3 sm:w-5" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มอุปกรณ์
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="stats shadow bg-base-100">
                    <div class="stat">
                        <div class="stat-figure text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div class="stat-title">อุปกรณ์ทั้งหมด</div>
                        <div class="stat-value text-primary">{{ devices.length }}</div>
                        <div class="stat-desc">รายการอุปกรณ์ในระบบ</div>
                    </div>
                </div>
            </div>

            <div class="bg-base-100 rounded-lg shadow-lg p-6">
                <Table :devices="devices" @edit="handleEdit" @delete="handleDelete" @detail="handleDetail" />
            </div>
        </div>

        <DetailModal ref="detailModal" />
        <CreateModal ref="createModal" @success="handleCreateSuccess" />
        <UpdateModal ref="updateModal" @success="handleUpdateSuccess" />
        <DeleteModal v-if="showDeleteModal" ref="deleteModal" @deleted="handleDeletedSuccess"
            @deleteError="handleDeleteError" @close="closeDeleteModal" />
    </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import Table from '../../components/Device/Table.vue'
import DetailModal from '../../components/Device/Detail.vue'
import CreateModal from '../../components/Device/Create.vue'
import UpdateModal from '../../components/Device/Update.vue'
import DeleteModal from '../../components/Device/Delete.vue'
import DeviceService from '../../api/device'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const showDeleteModal = ref(false)

const openDeleteModal = (device) => {
    showDeleteModal.value = true
    nextTick(() => {
        if (deleteModal.value) deleteModal.value.openModal(device)
    })
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
}

const devices = ref([])
const detailModal = ref(null)
const createModal = ref(null)
const updateModal = ref(null)
const deleteModal = ref(null)

const fetchDevices = async () => {
    try {
        const response = await DeviceService.getDevices()
        if (response.message === 'Success' && response.data) {
            devices.value = response.data
        }
    } catch (error) {
        console.error('Error fetching devices:', error)
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลอุปกรณ์ได้',
            confirmButtonText: 'ตรวจสอบอีกครั้ง'
        })
    }
}

const openCreateModal = () => {
    if (createModal.value) {
        createModal.value.openModal()
    }
}

const handleCreateSuccess = async (formData) => {
    try {
        await DeviceService.createDevice(formData)
        if (createModal.value) {
            createModal.value.closeModal()
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มอุปกรณ์สำเร็จ',
                    text: 'เพิ่มข้อมูลอุปกรณ์เรียบร้อยแล้ว',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchDevices()
                })
            }, 300)
            return
        }
    } catch (error) {
        console.error('Error creating device:', error)
        if (createModal.value) {
            createModal.value.closeModal()
        }
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเพิ่มอุปกรณ์ได้',
            confirmButtonText: 'ตรวจสอบอีกครั้ง'
        })
    }
}

const handleEdit = (device) => {
    if (updateModal.value) {
        updateModal.value.openModal(device)
    }
}

const handleDetail = (device) => {
    if (detailModal.value) {
        detailModal.value.openModal(device)
    }
}

const handleUpdateSuccess = async (formData) => {
    try {
        const { id, ...updateData } = formData
        await DeviceService.updateDevice(id, updateData)
        if (updateModal.value) {
            await updateModal.value.closeModal()
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'แก้ไขอุปกรณ์สำเร็จ',
                    text: 'แก้ไขข้อมูลอุปกรณ์เรียบร้อยแล้ว',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchDevices()
                })
            }, 300)
            return
        }
    } catch (error) {
        console.error('Error updating device:', error)
        if (updateModal.value) {
            updateModal.value.closeModal()
        }
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถแก้ไขอุปกรณ์ได้',
            confirmButtonText: 'ตรวจสอบอีกครั้ง'
        })
    }
}

const handleDelete = (id) => {
    const target = devices.value.find(d => d._id === id)
    if (target) {
        openDeleteModal(target)
    }
}
const handleDeletedSuccess = async () => {
    closeDeleteModal()
    await nextTick()
    Swal.fire({
        icon: 'success',
        title: 'ลบอุปกรณ์สำเร็จ',
        text: 'ลบข้อมูลอุปกรณ์เรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        fetchDevices()
    })
}

const handleDeleteError = async () => {
    closeDeleteModal()
    await nextTick()
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบอุปกรณ์ได้',
        confirmButtonText: 'ตรวจสอบอีกครั้ง'
    })
}

let refreshInterval = null
onMounted(() => {
    fetchDevices()
    refreshInterval = setInterval(() => {
        fetchDevices()
    }, 60000)
})
onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped></style>
