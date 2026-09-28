<template>
    <button class="btn btn-ghost btn-sm" :disabled="loading || !students.length" title="ดาวน์โหลดรายชื่อ"
        @click="exportToExcel">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    </button>
</template>

<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import featureFlags from '../../config/featureFlags'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const props = defineProps({
    students: {
        type: Array,
        default: () => []
    },
    grade: {
        type: String,
        default: ''
    },
    classroom: {
        type: [String, Number],
        default: ''
    }
})

const loading = ref(false)

const getLineStatus = (student) => {
    return student?.lineuser_id ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'
}

const buildTitle = () => {
    const gradeText = props.grade ? mapGradeDisplay(props.grade) : ''
    let title = 'รายชื่อนักเรียน'
    if (gradeText) title += `ชั้น${gradeText}`
    if (props.classroom !== '' && props.classroom !== null && props.classroom !== undefined) {
        title += ` ห้อง ${props.classroom}`
    }
    return title
}

const exportToExcel = async () => {
    if (loading.value || !props.students.length) return
    loading.value = true
    try {
        const showLineStatus = featureFlags.student.enableLineStatusFilter

        const header = ['ลำดับ', 'รหัส', 'ชื่อ-สกุล', 'ชั้น', 'ห้อง']
        if (showLineStatus) header.push('สถานะไลน์')

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('รายชื่อนักเรียน')

        worksheet.addRow([buildTitle()])
        worksheet.mergeCells(1, 1, 1, header.length)
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
        worksheet.getCell('A1').font = { bold: true, size: 14 }

        worksheet.addRow(header)
        const headerRow = worksheet.getRow(2)
        headerRow.font = { bold: true }
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

        props.students.forEach((student, index) => {
            const row = [
                index + 1,
                student.code || student.userid || '-',
                student.name || '-',
                mapGradeDisplay(student.grade) || '-',
                student.room ?? '-'
            ]
            if (showLineStatus) row.push(getLineStatus(student))
            worksheet.addRow(row)
        })

        const columnWidths = [8, 15, 30, 12, 10]
        if (showLineStatus) columnWidths.push(18)
        worksheet.columns = columnWidths.map(width => ({ width }))

        for (let i = 3; i <= props.students.length + 2; i++) {
            worksheet.getCell(`A${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
            worksheet.getCell(`B${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
            worksheet.getCell(`D${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
            worksheet.getCell(`E${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
            if (showLineStatus) worksheet.getCell(`F${i}`).alignment = { horizontal: 'center', vertical: 'middle' }
        }

        const buffer = await workbook.xlsx.writeBuffer()
        const gradeText = props.grade ? mapGradeDisplay(props.grade) : 'ทั้งหมด'
        const roomText = props.classroom !== '' && props.classroom !== null && props.classroom !== undefined ? `_${props.classroom}` : ''
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `StudentList_${gradeText}${roomText}.xlsx`)
    } catch (error) {
        console.error('Export students error:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถส่งออกไฟล์ Excel ได้',
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped></style>
