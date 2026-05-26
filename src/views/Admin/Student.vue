<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white">จัดการนักเรียน</h2>
            <div v-if="auth.user?.role !== 'viewer' && auth.user?.role !== 'discipline'"
                class="flex flex-wrap gap-2 w-full sm:w-auto">
                <button class="btn btn-success btn-sm" @click="openImportModal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 10l4 4m0 0l4-4m-4 4V4" />
                    </svg>
                    นำเข้า Excel
                </button>
                <button class="btn btn-primary btn-sm" @click="openCreateModal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    เพิ่มนักเรียน
                </button>
                <button v-if="auth.user?.role !== 'teacher' && (selectedGrade === 'ม.3' || selectedGrade === 'ม.6')"
                    class="btn btn-error btn-sm" @click="openDeleteAllModal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบทั้งหมด {{ selectedGrade }}
                </button>
            </div>
        </div>

        <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4">
                <div class="flex flex-col sm:flex-row gap-3">
                    <div v-if="auth.user?.role !== 'teacher'" class="form-control w-full sm:w-auto"
                        :class="searchUserid ? 'opacity-50 pointer-events-none' : ''">
                        <label class="label py-1">
                            <span class="label-text text-sm">ชั้นปี</span>
                        </label>
                        <select v-model="selectedGrade" @change="handleGradeChange"
                            class="select select-bordered select-sm w-full sm:w-32"
                            :disabled="isQueryFilter || !!searchUserid">
                            <option v-for="grade in availableGrades" :key="grade" :value="grade">{{ grade }}</option>
                        </select>
                    </div>

                    <div v-if="auth.user?.role !== 'teacher'" class="form-control w-full sm:w-auto"
                        :class="searchUserid ? 'opacity-50 pointer-events-none' : ''">
                        <label class="label py-1">
                            <span class="label-text text-sm">ห้อง</span>
                        </label>
                        <select v-model="selectedClassroom" @change="fetchStudents"
                            class="select select-bordered select-sm w-full sm:w-24"
                            :disabled="isQueryFilter || !!searchUserid">
                            <option v-for="room in availableClassrooms" :key="room" :value="room">{{ room }}</option>
                        </select>
                    </div>

                    <div class="w-full sm:flex-1">
                        <label class="label py-1">
                            <span class="label-text text-sm">ค้นหารหัส</span>
                        </label>
                        <div class="relative flex gap-2">
                            <input v-model="searchUserid" @input="debouncedSearchByUserid" type="text"
                                placeholder="ค้นหาชื่อหรือรหัสนักเรียน..."
                                class="input input-bordered input-sm w-full" />
                        </div>
                    </div>
                    <div class="flex justify-between sm:justify-start w-full sm:w-auto gap-2">
                        <div class="flex items-end">
                            <button @click="resetFilters" class="btn btn-ghost btn-sm">
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
                                <option :value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <StudentTable :students="filteredStudents" :loading="loading" :currentPage="currentPage"
            :itemsPerPage="itemsPerPage.value" @edit="openUpdateModal" @delete="openDeleteModal"
            @reset="openRePasswordModal" @detail="openDetailModal" />
        <CreateModal ref="createModalRef" :classrooms="classrooms" @success="handleCreateSuccess" />
        <ImportExcalModal ref="importModalRef" @success="handleImportSuccess" />
        <UpdateModal ref="updateModalRef" :classrooms="classrooms" @success="handleUpdateSuccess" />
        <DeleteModal ref="deleteModalRef" @success="handleDeleteSuccess" />
        <RePasswordModal ref="rePasswordModalRef" @success="fetchStudents" />
        <DeleteAllModal ref="deleteAllModalRef" @success="handleDeleteAllSuccess" />
        <DetailModal v-if="detailModalVisible && detailStudent" :visible="detailModalVisible" :student="detailStudent"
            @close="closeDetailModal" />

        <div v-if="totalPages > 1" class="flex justify-center">
            <div class="join">
                <button class="join-item btn btn-sm" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
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
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import StudentTable from '../../components/ListStudent/Table.vue'
import CreateModal from '../../components/ListStudent/Create.vue'
import ImportExcalModal from '../../components/ListStudent/ImportExcal.vue'
import UpdateModal from '../../components/ListStudent/Update.vue'
import DeleteModal from '../../components/ListStudent/Delete.vue'
import RePasswordModal from '../../components/ListStudent/RePassword.vue'
import DeleteAllModal from '../../components/ListStudent/DeleteAll.vue'
import DetailModal from '../../components/ListStudent/Detail.vue'
import { StudentService } from '../../api/student'
import { ClassRoomService } from '../../api/class-room'
import { useAuthStore } from '../../stores/auth'

const isQueryFilter = ref(false)
const auth = useAuthStore()
const route = useRoute()
const studentService = new StudentService()
const classRoomService = new ClassRoomService()
const students = ref([])
const classrooms = ref([])
const createModalRef = ref(null)
const importModalRef = ref(null)
const openImportModal = () => {
    importModalRef.value?.openModal()
}

const handleImportSuccess = async (importedStudents) => {
    if (Array.isArray(importedStudents)) {
        await fetchStudents()
    }
}
const updateModalRef = ref(null)
const rePasswordModalRef = ref(null)
const loading = ref(false)
const selectedGrade = ref('ม.1')
const selectedClassroom = ref('1')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const imageBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const lastFetchedGrade = ref('')
const lastFetchedClassroom = ref('')
const searchUserid = ref("");
const detailModalVisible = ref(false)
const detailStudent = ref(null)

const normalizeImagePath = (path) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    return imageBaseUrl + path
}

const normalizeGuardian = (guardianSource) => {
    if (!guardianSource) return null
    if (Array.isArray(guardianSource)) {
        return guardianSource.map(guardian => ({
            ...guardian,
            picture: normalizeImagePath(guardian?.picture)
        }))
    }
    return {
        ...guardianSource,
        picture: normalizeImagePath(guardianSource?.picture)
    }
}

const mapStudentRow = (student) => ({
    id: student._id,
    userid: student.userid,
    name: student.name,
    code: student.userid,
    grade: student.grade,
    room: student.classroom,
    rfid: student.rfid,
    guardian_phone: student.guardian_phone || student.parent_phone || '',
    guadians: normalizeGuardian(student.guadians),
    guardians: normalizeGuardian(student.guardians),
    score: Number.isFinite(Number(student.score)) ? Number(student.score) : 100,
    phone: student.phone || '-',
    picture: normalizeImagePath(student.picture),
    has_password: student.has_password
})

const openDetailModal = (student) => {
    detailStudent.value = student
    detailModalVisible.value = true
}
const closeDetailModal = () => {
    detailModalVisible.value = false
    detailStudent.value = null
}

const availableGrades = computed(() => {
    const grades = [...new Set(classrooms.value.map(c => c.grade))]
    return grades.sort((a, b) => {
        const gradeA = parseInt(a.replace('ม.', ''))
        const gradeB = parseInt(b.replace('ม.', ''))
        return gradeA - gradeB
    })
})

const availableClassrooms = computed(() => {
    const rooms = classrooms.value
        .filter(c => c.grade === selectedGrade.value)
        .map(c => c.classroom)
    return rooms.sort((a, b) => a - b)
})

const filteredBySearch = computed(() => {
    if (!searchQuery.value.trim()) {
        return students.value
    }
    const query = searchQuery.value.toLowerCase().trim()
    return students.value.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.code.toLowerCase().includes(query)
    )
})

const totalPages = computed(() => Math.ceil(filteredBySearch.value.length / itemsPerPage.value))

const filteredStudents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredBySearch.value.slice(start, end)
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

const handleSearch = () => {
    currentPage.value = 1
}

const handleGradeChange = () => {
    if (availableClassrooms.value.length > 0) {
        selectedClassroom.value = availableClassrooms.value[0]
    }
    fetchStudents()
}

const fetchClassRooms = async () => {
    try {
        const response = await classRoomService.getClassRooms()
        if (response.message === 'Success' && response.data) {
            classrooms.value = response.data
            if (availableGrades.value.length > 0) {
                selectedGrade.value = availableGrades.value[0]
                if (availableClassrooms.value.length > 0) {
                    selectedClassroom.value = availableClassrooms.value[0]
                }
            }
        }
    } catch (error) {
        console.error('Fetch classrooms error:', error)
    }
}

const fetchStudents = async () => {
    loading.value = true
    currentPage.value = 1
    searchQuery.value = ''
    try {
        const response = await studentService.getStudents(selectedGrade.value, selectedClassroom.value)
        if (response.message === 'Success' && response.data) {
            students.value = response.data.map(mapStudentRow)
            if (response.data.length > 0) {
                lastFetchedGrade.value = response.data[0].grade
                lastFetchedClassroom.value = response.data[0].classroom
            } else {
                lastFetchedGrade.value = ''
                lastFetchedClassroom.value = ''
            }
        }
    } catch (error) {
        console.error('Fetch students error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลนักเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        students.value = []
    } finally {
        loading.value = false
    }
}

const resetFilters = () => {
    if (availableGrades.value.length > 0) {
        selectedGrade.value = availableGrades.value[0]
        if (availableClassrooms.value.length > 0) {
            selectedClassroom.value = availableClassrooms.value[0]
        }
    }
    searchQuery.value = ''
    searchUserid.value = ''
    fetchStudents()
}

const openCreateModal = () => {
    if (auth.user?.role === 'teacher') {
        createModalRef.value.openModal({
            grade: lastFetchedGrade.value,
            classroom: lastFetchedClassroom.value
        })
    } else {
        createModalRef.value.openModal()
    }
}

const handleCreateSuccess = async (formData) => {
    loading.value = true
    const onError = formData.onError
    const onSuccess = formData.onSuccess
    try {
        const response = await studentService.createStudent(formData)
        if (response.message === 'Success') {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'เพิ่มนักเรียนเรียบร้อยแล้ว',
                timer: 2000,
                showConfirmButton: false,
                didOpen: () => {
                    document.getElementById('app')?.removeAttribute('aria-hidden')
                }
            })
            fetchStudents()
            if (onSuccess) onSuccess()
        }
    } catch (error) {
        if (
            error?.response?.status === 409 ||
            (error?.response?.data?.error && error.response.data.error.includes('duplicate student userid'))
        ) {
            if (onError) onError(error?.response?.data?.error || 'duplicate student userid')
            return
        }
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเพิ่มนักเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        if (onError) onError('other')
    } finally {
        loading.value = false
    }
}


const searchByUserid = async () => {
    if (!searchUserid.value) return;
    loading.value = true;
    try {
        let userid = '';
        let name = '';
        if (/^\d+$/.test(searchUserid.value)) {
            userid = searchUserid.value;
        } else {
            name = searchUserid.value;
        }
        const response = await studentService.getStudents(selectedGrade.value, selectedClassroom.value, userid, name);
        if (response.message === 'Success' && response.data) {
            students.value = response.data.map(mapStudentRow);
            currentPage.value = 1;
        } else {
            students.value = [];
        }
    } catch (error) {
        students.value = [];
    } finally {
        loading.value = false;
    }
}

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

const debouncedSearchByUserid = debounce(() => {
    if (searchUserid.value) {
        searchByUserid();
    } else {
        fetchStudents();
    }
}, 400);

const openUpdateModal = (student) => {
    updateModalRef.value.openModal(student)
}

const handleUpdateSuccess = () => {
    fetchStudents()
}

const deleteModalRef = ref(null)
const openDeleteModal = (student) => {
    deleteModalRef.value?.open(student)
}
const handleDeleteSuccess = () => {
    fetchStudents()
}

const deleteAllModalRef = ref(null)
const openDeleteAllModal = () => {
    deleteAllModalRef.value?.open(selectedGrade.value)
}
const handleDeleteAllSuccess = () => {
    fetchStudents()
}

const openRePasswordModal = (student) => {
    rePasswordModalRef.value?.open(student)
}

onMounted(async () => {
    await fetchClassRooms()
    const queryGrade = route.query.grade
    const queryClassroom = route.query.classroom
    if (queryGrade && availableGrades.value.includes(queryGrade)) {
        selectedGrade.value = queryGrade
        await nextTick()
        if (queryClassroom && availableClassrooms.value.includes(Number(queryClassroom))) {
            selectedClassroom.value = Number(queryClassroom)
        } else {
            selectedClassroom.value = availableClassrooms.value[0]
        }
    }
    isQueryFilter.value = false
    fetchStudents()
})
</script>

<style scoped></style>