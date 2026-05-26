<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white">จัดการห้องเรียน</h2>
            <div class="flex gap-2">
                <button v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'" @click="openCreateModal"
                    class="btn btn-primary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มห้องเรียน
                </button>
                <Promote v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'"
                    @success="fetchClassRooms" />
            </div>
        </div>

        <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4">
                <div class="flex flex-wrap gap-2">
                    <button v-for="grade in availableGrades" :key="grade.value" @click="selectedGrade = grade.value"
                        :class="[
                            'btn btn-sm',
                            selectedGrade === grade.value ? 'btn-secondary' : 'btn-ghost'
                        ]">
                        {{ grade.label }}
                    </button>
                </div>
            </div>
        </div>

        <CardView :classrooms="filteredClassrooms" :loading="loading" @delete="openDeleteModal"
            @edit="openUpdateModal" />

        <CreateModal ref="createModalRef" :classrooms="classrooms" :teachers="teachers"
            :availableGrades="availableGrades" @success="handleCreateSuccess" />

        <UpdateModal v-if="auth.user?.role !== 'teacher'" ref="updateModalRef" :teachers="teachers"
            @success="handleUpdateSuccess" />

        <DeleteModal ref="deleteModalRef" @deleted="handleDeleteSuccess" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateModal from '../../components/ClassRoom/Create.vue'
import UpdateModal from '../../components/ClassRoom/Update.vue'
import CardView from '../../components/ClassRoom/CardView.vue'
import DeleteModal from '../../components/ClassRoom/Delete.vue'
import Promote from '../../components/ClassRoom/Promote.vue'
import { ClassRoomService } from '../../api/class-room'
import { TeacherService } from '../../api/teacher'
import { useAuthStore } from '../../stores/auth'
const auth = useAuthStore()

const classRoomService = new ClassRoomService()
const teacherService = new TeacherService()

const classrooms = ref([])
const teachers = ref([])
const loading = ref(false)
const createModalRef = ref(null)
const updateModalRef = ref(null)
const deleteModalRef = ref(null)
const selectedGrade = ref('ม.1')

const availableGrades = [
    { value: 'ม.1', label: 'มัธยมศึกษาปีที่ 1' },
    { value: 'ม.2', label: 'มัธยมศึกษาปีที่ 2' },
    { value: 'ม.3', label: 'มัธยมศึกษาปีที่ 3' },
    { value: 'ม.4', label: 'มัธยมศึกษาปีที่ 4' },
    { value: 'ม.5', label: 'มัธยมศึกษาปีที่ 5' },
    { value: 'ม.6', label: 'มัธยมศึกษาปีที่ 6' }
]

const filteredClassrooms = computed(() => {
    if (!selectedGrade.value) return classrooms.value
    return classrooms.value.filter(classroom => classroom.grade === selectedGrade.value)
})

const fetchClassRooms = async () => {
    loading.value = true
    try {
        const response = await classRoomService.getClassRooms()
        if (response.message === 'Success' && response.data) {
            classrooms.value = response.data
        }
    } catch (error) {
        console.error('Fetch classrooms error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลห้องเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        classrooms.value = []
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    createModalRef.value.openModal()
}

const openUpdateModal = (classroom) => {
    updateModalRef.value.openModal(classroom)
}

const handleCreateSuccess = async (formData) => {
    try {
        if (!formData.adviser) {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเลือกครูที่ปรึกษาอย่างน้อย 1 คน',
                confirmButtonColor: '#2563eb',
                didOpen: () => {
                    document.getElementById('app').removeAttribute('aria-hidden')
                }
            })
            return
        }

        await classRoomService.createClassRoom({
            grade: formData.grade,
            classroom: formData.classroom,
            adviser: formData.adviser,
            adviser2: formData.adviser2 || ''
        })
        await fetchClassRooms()
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มห้องเรียนสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Create classroom error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.response?.data?.error || 'ไม่สามารถเพิ่มห้องเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

const handleUpdateSuccess = async (formData) => {
    try {
        await classRoomService.updateClassRoom(formData.id, {
            adviser: formData.adviser,
            adviser2: formData.adviser2 || ''
        })
        await fetchClassRooms()
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'success',
            title: 'แก้ไขห้องเรียนสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Update classroom error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถแก้ไขห้องเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

function openDeleteModal(classroom) {
    deleteModalRef.value.openModal(classroom)
}

async function handleDeleteSuccess() {
    await fetchClassRooms()
}

const fetchTeachers = async () => {
    try {
        const response = await teacherService.getTeachers()
        if (response.message === 'Success' && response.data) {
            teachers.value = response.data
        }
    } catch (error) {
        console.error('Fetch teachers error:', error)
        teachers.value = []
    }
}

onMounted(() => {
    fetchClassRooms()
    fetchTeachers()
})
</script>

<style scoped></style>
