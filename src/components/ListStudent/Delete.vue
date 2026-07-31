<template>
    <dialog ref="dialogRef" class="modal">
        <div class="modal-box p-4">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M5.07 19h13.86A2.07 2.07 0 0021 16.93V7.07A2.07 2.07 0 0018.93 5H5.07A2.07 2.07 0 003 7.07v9.86A2.07 2.07 0 005.07 19z" />
                </svg>
                ยืนยันการลบ
            </h3>
            <p class="text-sm mb-4" v-if="student">ต้องการลบนักเรียน <span class="font-semibold">{{ student.name
                    }}</span> ใช่หรือไม่?</p>
            <p v-else class="text-sm mb-4">กำลังเตรียมข้อมูล...</p>

            <div class="flex justify-end gap-2 mt-2">
                <button class="btn btn-sm" @click="close" :disabled="loading">ยกเลิก</button>
                <button class="btn btn-sm btn-error" @click="confirmDelete" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    <span v-else>ลบ</span>
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="close">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { StudentService } from '../../api/student'

const dialogRef = ref(null)
const student = ref(null)
const loading = ref(false)
const emit = defineEmits(['success'])
const studentService = new StudentService()

function open(targetStudent) {
    student.value = targetStudent
    dialogRef.value?.showModal()
}

function close() {
    dialogRef.value?.close()
}

async function confirmDelete() {
    if (!student.value) return
    loading.value = true
    try {
        const response = await studentService.deleteStudent(student.value.id)
        if (response.message === 'Success') {
            close()
            emit('success')
            await showSuccess()
        } else {
            await showError()
        }
    } catch (e) {
        console.error('Delete student error:', e)
        await showError(e)
    } finally {
        loading.value = false
    }
}

async function showSuccess() {
    const { default: Swal } = await import('sweetalert2')
    await Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ',
        text: 'ลบนักเรียนเรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 1600,
        didOpen: () => { document.getElementById('app')?.removeAttribute('aria-hidden') }
    })
}

async function showError(error = null) {
    const { default: Swal } = await import('sweetalert2')
    await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error?.response?.data?.error || error?.message || 'ไม่สามารถลบนักเรียนได้',
        confirmButtonColor: '#2563eb',
        didOpen: () => { document.getElementById('app')?.removeAttribute('aria-hidden') }
    })
}

defineExpose({ open })
</script>

<style scoped></style>
