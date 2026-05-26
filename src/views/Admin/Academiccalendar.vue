<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <h1 class="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">ปฏิทินการศึกษา</h1>
            <div class="flex gap-2 items-center w-full sm:w-auto">
                <select v-model="selectedYear"
                    class="select select-bordered select-sm text-xs sm:text-base flex-1 sm:flex-none">
                    <option v-for="y in yearOptions" :key="y" :value="y">{{ y + 543 }}</option>
                </select>
                <button v-if="auth.user?.role !== 'viewer'" class="btn btn-primary btn-sm" @click="openCreateModal">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span class="hidden sm:inline">เพิ่มรายการ</span>
                </button>
            </div>
        </div>

        <TermSummary :year="selectedYear" :refresh-key="refreshKey" :selected-term-key="selectedTermKey" />

        <AcademicCalendarTable :year="selectedYear" :refresh-key="refreshKey" @edit="handleEdit"
            @delete="openDeleteModal" @select-term="handleSelectTerm" />

        <CreateModal :is-open="isCreateModalOpen" :year="selectedYear" @close="closeCreateModal"
            @success="handleCreateSuccess" />

        <UpdateModal :is-open="isUpdateModalOpen" :year="selectedYear" :terms="selectedTerms" @close="closeUpdateModal"
            @success="handleUpdateSuccess" />

        <DeleteModal :is-open="isDeleteModalOpen" :year="selectedYear" @close="closeDeleteModal"
            @success="handleDeleteSuccess" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import AcademicCalendarTable from '../../components/Academiccalendar/Table.vue'
import TermSummary from '../../components/Academiccalendar/TermSummary.vue'
import CreateModal from '../../components/Academiccalendar/Create.vue'
import UpdateModal from '../../components/Academiccalendar/Update.vue'
import DeleteModal from '../../components/Academiccalendar/Delete.vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const refreshKey = ref(0)
const isCreateModalOpen = ref(false)
const isUpdateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedTerms = ref([])
const selectedTermKey = ref('term1')

const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const openCreateModal = () => {
    isCreateModalOpen.value = true
}

const closeCreateModal = () => {
    isCreateModalOpen.value = false
}

const handleEdit = (data) => {
    selectedTerms.value = Array.isArray(data.terms) ? data.terms : []
    isUpdateModalOpen.value = true
}

const closeUpdateModal = () => {
    isUpdateModalOpen.value = false
    selectedTerms.value = []
}

const openDeleteModal = () => {
    isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
}

const handleCreateSuccess = () => {
    closeCreateModal()
    handleRefresh()
    setTimeout(() => {
        Swal.fire({
            title: 'เพิ่มปฏิทินการศึกษาสำเร็จ!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'ตกลง',
            allowOutsideClick: true,
            didOpen: () => {
                const appElement = document.getElementById('app')
                if (appElement) {
                    appElement.removeAttribute('aria-hidden')
                }
            }
        })
    }, 300)
}

const handleUpdateSuccess = () => {
    closeUpdateModal()
    handleRefresh()
    setTimeout(() => {
        Swal.fire({
            title: 'แก้ไขสำเร็จ!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'ตกลง',
            allowOutsideClick: true,
            didOpen: () => {
                const appElement = document.getElementById('app')
                if (appElement) {
                    appElement.removeAttribute('aria-hidden')
                }
            }
        })
    }, 300)
}

const handleDeleteSuccess = () => {
    closeDeleteModal()
    handleRefresh()
    setTimeout(() => {
        Swal.fire({
            title: 'ลบปฏิทินการศึกษาสำเร็จ!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#2563eb',
            confirmButtonText: 'ตกลง',
            allowOutsideClick: true,
            didOpen: () => {
                const appElement = document.getElementById('app')
                if (appElement) {
                    appElement.removeAttribute('aria-hidden')
                }
            }
        })
    }, 300)
}

const handleRefresh = () => {
    refreshKey.value += 1
}

const handleSelectTerm = (termKey) => {
    selectedTermKey.value = termKey === 'term2' ? 'term2' : 'term1'
}
</script>
