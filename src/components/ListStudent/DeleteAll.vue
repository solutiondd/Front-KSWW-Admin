<template>
    <dialog ref="modalRef" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg text-error">ยืนยันการลบทั้งหมด</h3>
            <p class="py-4">คุณต้องการลบข้อมูลนักเรียนทั้งหมดใน <span class="font-semibold">{{ mapGradeDisplay(grade)
                    }}</span>
                ใช่หรือไม่?</p>
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="close">ยกเลิก</button>
                <button type="button" class="btn btn-error" @click="confirmSecond" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    ถัดไป
                </button>
            </div>
        </form>
    </dialog>
    <dialog ref="secondDialogRef" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg text-error">ยืนยันอีกครั้ง</h3>
            <p class="py-4">คุณแน่ใจหรือไม่ว่าต้องการลบ <span class="font-semibold">{{ mapGradeDisplay(grade) }}</span>
                ทั้งหมด?
                <br>การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="closeSecond">ยกเลิก</button>
                <button type="button" class="btn btn-error" @click="deleteAll" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    ยืนยันลบจริง
                </button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { StudentService } from '../../api/student'
import { mapGradeDisplay } from '../../utils/gradeSystem'
const modalRef = ref(null)
const secondDialogRef = ref(null)
const grade = ref('')
const loading = ref(false)
const emit = defineEmits(['success'])

const open = (selectedGrade) => {
    grade.value = selectedGrade
    modalRef.value.showModal()
}
const close = () => {
    modalRef.value.close()
}
const confirmSecond = () => {
    modalRef.value.close()
    secondDialogRef.value.showModal()
}
const closeSecond = () => {
    secondDialogRef.value.close()
}
const deleteAll = async () => {
    loading.value = true
    try {
        const service = new StudentService()
        const res = await service.deleteAllByGrade(grade.value)
        if (res.message === 'Success') {
            emit('success')
            closeSecond()
        } else {
            alert('เกิดข้อผิดพลาดในการลบ')
        }
    } catch (e) {
        alert('เกิดข้อผิดพลาดในการลบ')
    } finally {
        loading.value = false
    }
}
defineExpose({ open })
</script>
