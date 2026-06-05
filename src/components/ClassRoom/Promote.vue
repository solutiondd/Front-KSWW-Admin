<template>
    <button class="btn btn-warning btn-sm flex items-center gap-1" :disabled="loading" @click="handlePromote">
        <template v-if="!loading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-5 5m5-5l5 5" />
            </svg>
            <span>เลื่อนชั้น</span>
        </template>
        <template v-else>
            <span>กำลังดำเนินการ...</span>
        </template>
    </button>
</template>

<script setup>
import { ref } from 'vue'
import { ClassRoomService } from '../../api/class-room'
import { StudentService } from '../../api/student'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const emit = defineEmits(['success'])
const loading = ref(false)
const classRoomService = new ClassRoomService()
const studentService = new StudentService()

async function handlePromote() {
    const { default: Swal } = await import('sweetalert2')
    const terminalGradeA = mapGradeDisplay('ม.3')
    const terminalGradeB = mapGradeDisplay('ม.6')
    // Confirm 1
    const confirm1 = await Swal.fire({
        icon: 'warning',
        title: `การยืนยันครั้งนี้จะลบชั้น ${terminalGradeA} และ ${terminalGradeB} ออกทุกห้อง`,
        text: 'ยืนยันใช่ไหม?',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        didOpen: () => {
            document.getElementById('app').removeAttribute('aria-hidden')
        }
    })
    if (!confirm1.isConfirmed) return

    // Confirm 2
    const confirm2 = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการเลื่อนชั้นใช่ไหม?',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        didOpen: () => {
            document.getElementById('app').removeAttribute('aria-hidden')
        }
    })
    // if (!confirm2.isConfirmed) return

    // Confirm 3
    // const confirm3 = await Swal.fire({
    //     icon: 'warning',
    //     title: 'การยืนยันครั้งนี้จะลบนักเรียนชั้น ม.3 และ ม.6 ทุกห้องออกด้วย',
    //     text: 'ยืนยันการลบใช่หรือไหม?',
    //     showCancelButton: true,
    //     confirmButtonText: 'ยืนยัน',
    //     cancelButtonText: 'ยกเลิก',
    //     confirmButtonColor: '#2563eb',
    //     cancelButtonColor: '#d33',
    //     didOpen: () => {
    //         document.getElementById('app').removeAttribute('aria-hidden')
    //     }
    // })
    if (!confirm2.isConfirmed) return

    loading.value = true
    try {
        await studentService.deleteAllByGrade('ม.3')
        await studentService.deleteAllByGrade('ม.6')
        await classRoomService.promoteClassRoom({})
        await Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลและเลื่อนชั้นสำเร็จ',
            showConfirmButton: false,
            timer: 1800,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        emit('success')
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.response?.data?.error || 'ไม่สามารถลบข้อมูลหรืเลื่อนชั้นได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}
</script>
