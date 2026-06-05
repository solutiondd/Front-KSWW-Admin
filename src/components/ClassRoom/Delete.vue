<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4 text-error">ยืนยันการลบห้องเรียน</h3>
            <div class="mb-4">
                <p>คุณต้องการลบ <strong>{{ mapGradeDisplay(classroom?.grade) }} ห้อง {{ classroom?.classroom }}</strong>
                    ใช่หรือไม่?</p>
            </div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-sm btn-ghost" @click="closeModal">ยกเลิก</button>
                <button class="btn btn-sm btn-error" :disabled="loading" @click="confirmDelete">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    ลบ
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
import { ClassRoomService } from '../../api/class-room'
import { mapGradeDisplay } from '../../utils/gradeSystem'
const modalRef = ref(null)
const loading = ref(false)
const classroom = ref(null)
const emit = defineEmits(['deleted'])
const classRoomService = new ClassRoomService()

function openModal(classroomObj) {
    classroom.value = classroomObj
    modalRef.value?.showModal()
}
function closeModal() {
    modalRef.value?.close()
    classroom.value = null
    loading.value = false
}
async function confirmDelete() {
    if (!classroom.value?._id) return
    loading.value = true
    try {
        await classRoomService.deleteClassRoom(classroom.value._id)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'success',
            title: 'ลบห้องเรียนสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        emit('deleted')
        closeModal()
    } catch (error) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบห้องเรียนได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        loading.value = false
    }
}

defineExpose({ openModal, closeModal })
</script>
