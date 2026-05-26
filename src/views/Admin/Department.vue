<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex justify-between items-center">
            <h1 class="text-xl sm:text-2xl font-bold text-white">จัดการแผนก</h1>
            <button v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'" class="btn btn-primary" @click="openCreateModal">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มแผนก
            </button>
        </div>

        <DepartmentTable :departments="departments" :loading="loading" @delete="openDeleteModal" />

        <CreateModal ref="createModalRef" @success="handleCreateSuccess" />
        <DeleteModal ref="deleteModalRef" @success="handleDeleteSuccess" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import DepartmentTable from '../../components/Department/Table.vue'
import CreateModal from '../../components/Department/Create.vue'
import DeleteModal from '../../components/Department/Delete.vue'
import { DepartmentService } from '../../api/department'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()

const departmentService = new DepartmentService()

const departments = ref([])
const loading = ref(false)
const createModalRef = ref(null)
const deleteModalRef = ref(null)

const fetchDepartments = async () => {
    loading.value = true
    try {
        const response = await departmentService.getDepartments()
        if (response.message === 'Success' && response.data) {
            departments.value = response.data
        }
    } catch (error) {
        console.error('Fetch departments error:', error)
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลแผนกได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    createModalRef.value.openModal()
}

const handleCreateSuccess = async (name) => {
    try {
        await departmentService.createDepartment(name)
        await fetchDepartments()
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มแผนกสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Create department error:', error)
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเพิ่มแผนกได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

const openDeleteModal = (department) => {
    deleteModalRef.value.openModal(department)
}

const handleDeleteSuccess = async (id) => {
    try {
        await departmentService.deleteDepartment(id)
        await fetchDepartments()
        Swal.fire({
            icon: 'success',
            title: 'ลบแผนกสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Delete department error:', error)
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบแผนกได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

onMounted(() => {
    fetchDepartments()
})
</script>

<style scoped></style>
