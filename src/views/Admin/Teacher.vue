<template>
    <div class="space-y-6 max-[944px]:pt-16">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white">จัดการบุคลากร</h2>
            <div v-if="auth.user?.role !== 'viewer'" class="flex gap-2">
                <button v-if="auth.user?.role !== 'teacher'" class="btn btn-success btn-sm" @click="openImportModal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 10l4 4m0 0l4-4m-4 4V4" />
                    </svg>
                    นำเข้า Excel
                </button>
                <button v-if="auth.user?.role !== 'teacher'" @click="openCreateModal" class="btn btn-primary btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มบุคลากร
                </button>
            </div>
        </div>


        <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4">
                <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0">
                    <div class="form-control w-full sm:flex-1">
                        <label class="label py-1">
                            <span class="label-text text-sm">ค้นหา</span>
                        </label>
                        <div class="relative">
                            <input v-model="searchQuery" @input="fetchTeachers" type="text"
                                placeholder="ค้นหาชื่อหรือรหัสครู..." class="input input-bordered input-sm w-full" />
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div class="flex justify-between sm:justify-start w-full sm:w-auto gap-2">
                        <div class="flex items-end">
                            <button @click="resetSearch" class="btn btn-ghost btn-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                รีเซ็ต
                            </button>
                        </div>

                        <div class="flex sm:form-control w-auto gap-1">
                            <label class="label py-1">
                                <span class="label-text text-sm">แถวต่อหน้า</span>
                            </label>
                            <select v-model.number="itemsPerPage" @change="handleItemsPerPageChange"
                                class="select select-bordered select-sm">
                                <option :value="5">5</option>
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <TeacherTable :teachers="paginatedTeachers" :loading="loading" :departmentFilter="filterDepartment"
            :positionFilter="filterPosition" :departments="departments" :positions="positions"
            :currentPage="currentPage" :itemsPerPage="itemsPerPage" @filterDepartment="handleFilterDepartment"
            @filterPosition="handleFilterPosition" @edit="openEditModal" @delete="openDeleteModal"
            @reset="openRePasswordModal" @detail="openDetailModal" />

        <div v-if="totalPages > 1" class="flex flex-col items-center gap-2">
            <div class="flex justify-center">
                <div class="join">
                    <button class="join-item btn btn-sm" @click="goToPage(currentPage - 1)"
                        :disabled="currentPage === 1">
                        ‹
                    </button>
                    <button v-for="page in displayedPages" :key="page" class="join-item btn btn-sm"
                        :class="{ 'btn-active': page === currentPage }" @click="goToPage(page)">
                        {{ page }}
                    </button>
                    <button class="join-item btn btn-sm" @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages">
                        ›
                    </button>
                </div>
            </div>
            <div class="text-sm text-base-content/60 text-center text-white">
                ทั้งหมด {{ totalItems }} รายการ (หน้า {{ currentPage }} / {{ totalPages }})
            </div>
        </div>

        <UpdateModal ref="updateModalRef" :departments="departments" :positions="positions"
            @success="handleUpdateSuccess" />

        <CreateModal ref="createModalRef" :departments="departments" :positions="positions"
            @success="handleCreateSuccess" />

        <ImportExcalModal ref="importModalRef" @success="handleImportSuccess" />

        <DeleteModal ref="deleteModalRef" @success="handleDeleteSuccess" />

        <RePasswordModal ref="rePasswordModalRef" @success="fetchTeachers" />

        <DetailModal v-if="detailModalVisible && detailTeacher" :visible="detailModalVisible" :teacher="detailTeacher"
            @close="closeDetailModal" />
    </div>
</template>

<script setup>
import ImportExcalModal from '../../components/ListTeacher/ImportExcal.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import TeacherTable from '../../components/ListTeacher/Table.vue'
import UpdateModal from '../../components/ListTeacher/Update.vue'
import CreateModal from '../../components/ListTeacher/Create.vue'
import DeleteModal from '../../components/ListTeacher/Delete.vue'
import RePasswordModal from '../../components/ListStudent/RePassword.vue'
import DetailModal from '../../components/ListTeacher/Detail.vue'
import { TeacherService } from '../../api/teacher'
import { DepartmentService } from '../../api/department'
import { PositionService } from '../../api/position'
import { useAuthStore } from '../../stores/auth'

const importModalRef = ref(null)
const openImportModal = () => {
    importModalRef.value?.openModal()
}

const handleImportSuccess = async (importedTeachers) => {
    if (Array.isArray(importedTeachers)) {
        await fetchTeachers()
    }
}

const route = useRoute()

const detailModalVisible = ref(false)
const detailTeacher = ref(null)

const openDetailModal = (teacher) => {
    detailTeacher.value = teacher
    detailModalVisible.value = true
}

const closeDetailModal = () => {
    detailModalVisible.value = false
    detailTeacher.value = null
}

const auth = useAuthStore()

const teacherService = new TeacherService()
const departmentService = new DepartmentService()
const positionService = new PositionService()

const teachers = ref([])
const departments = ref([])
const positions = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterDepartment = ref('')
const filterPosition = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const imageBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const updateModalRef = ref(null)
const createModalRef = ref(null)
const deleteModalRef = ref(null)
const rePasswordModalRef = ref(null)

const totalItems = computed(() => teachers.value.length)

const totalPages = computed(() => Math.ceil(teachers.value.length / itemsPerPage.value))

const paginatedTeachers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return teachers.value.slice(start, end)
})

const displayedPages = computed(() => {
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    return pages
})

const handleItemsPerPageChange = () => {
    currentPage.value = 1
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const fetchTeachers = async () => {
    loading.value = true
    currentPage.value = 1
    try {
        const response = await teacherService.getTeachers(searchQuery.value, filterDepartment.value, filterPosition.value)
        if (response.message === 'Success' && response.data) {
            teachers.value = response.data.map(teacher => ({
                id: teacher._id,
                userid: teacher.userid,
                name: teacher.name,
                code: teacher.userid,
                rfid: teacher.rfid,
                department: teacher.department || '-',
                position: teacher.position || '-',
                email: teacher.userid + '@ksww.ac.th',
                phone: teacher.phone || '-',
                picture: teacher.picture ? imageBaseUrl + teacher.picture : '',
                has_password: teacher.has_password
            }))
        }
    } catch (error) {
        console.error('Fetch teachers error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error?.response?.data?.error || error?.message || 'ไม่สามารถโหลดข้อมูลอาจารย์ได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        teachers.value = []
    } finally {
        loading.value = false
    }
}

const resetSearch = () => {
    searchQuery.value = ''
    filterDepartment.value = ''
    filterPosition.value = ''
    fetchTeachers()
}

const handleFilterDepartment = (value) => {
    filterDepartment.value = value
    fetchTeachers()
}

const handleFilterPosition = (value) => {
    filterPosition.value = value
    fetchTeachers()
}

const fetchDepartments = async () => {
    try {
        const response = await departmentService.getDepartments()
        if (response.message === 'Success' && response.data) {
            departments.value = response.data
        }
    } catch (error) {
        console.error('Fetch departments error:', error)
    }
}

const fetchPositions = async () => {
    try {
        const response = await positionService.getPositions()
        if (response.message === 'Success' && response.data) {
            positions.value = response.data
        }
    } catch (error) {
        console.error('Fetch positions error:', error)
    }
}

const openEditModal = (teacher) => {
    updateModalRef.value.openModal(teacher)
}

const openCreateModal = () => {
    createModalRef.value.openModal()
}

const openDeleteModal = (teacher) => {
    deleteModalRef.value?.open(teacher)
}

const openRePasswordModal = (teacher) => {
    rePasswordModalRef.value?.open(teacher)
}

const handleDeleteSuccess = () => {
    fetchTeachers()
}

const handleUpdateSuccess = () => {
    fetchTeachers()
}

const handleCreateSuccess = async (formData) => {
    const onError = formData.onError
    const onSuccess = formData.onSuccess
    try {
        await teacherService.createTeacher(formData)
        await fetchTeachers()
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มอาจารย์สำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        if (onSuccess) onSuccess()
    } catch (error) {
        console.error('Create teacher error:', error)
        if (
            (error?.response?.status === 409) ||
            (error?.response?.data?.error && error.response.data.error.includes('duplicate teacher userid'))
        ) {
            if (onError) onError(error?.response?.data?.error || 'duplicate teacher userid')
            return
        }
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error?.response?.data?.error || error?.message || 'ไม่สามารถเพิ่มอาจารย์ได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        if (onError) onError(error)
    }
}

onMounted(() => {
    fetchDepartments()
    fetchPositions()
    if (route.query.search) {
        searchQuery.value = route.query.search
    }
    fetchTeachers()
})
</script>

<style scoped></style>
