<template>
    <button class="btn btn-success btn-xs" :class="{ 'btn-disabled': loadingExport }" @click="exportToExcel"
        :disabled="loadingExport">
        <span v-if="loadingExport" class="loading loading-spinner loading-xs"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16" />
        </svg>
        {{ loadingExport ? 'กำลังส่งออก...' : 'Export Excel' }}
    </button>
</template>

<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Swal from 'sweetalert2'
import ModelingService from '../../api/modeling.js'

const loadingExport = ref(false)

const props = defineProps({
    filters: {
        type: Object,
        required: true,
    }
})

const statusTextMap = {
    all: 'ทั้งหมด',
    fail: 'ไม่สำเร็จ',
    notlinked: 'ไม่ได้เชื่อมต่อ',
}

const commonPrefixes = new Set([
    'ด.ช.', 'ด.ญ.', 'ดช.', 'ดญ.', 'เด็กชาย', 'เด็กหญิง',
    'นาย', 'นาง', 'นางสาว', 'Mr.', 'Mrs.', 'Ms.', 'Miss',
    'Teacher', 'Dr.', 'Prof.', 'พระ', 'ว่าที่ร้อยตรี', 'ว่าที่ร.ต.',
])

function hasDevice(model) {
    return !!(model?.device && Object.keys(model.device).length > 0)
}

function normalizeRowsStatus(rows, status) {
    if (status === 'fail') {
        return rows.filter(row => Array.isArray(row?.modeling) && row.modeling.some(model => hasDevice(model) && model.status === 4))
    }
    if (status === 'notlinked') {
        return rows.filter(row => !Array.isArray(row?.modeling) || row.modeling.length === 0 || row.modeling.every(model => !hasDevice(model)))
    }
    return rows
}

function splitFullName(item) {
    if (item?.pre_name || item?.first_name || item?.last_name) {
        return {
            prefix: item?.pre_name || '-',
            firstName: item?.first_name || '-',
            lastName: item?.last_name || '-',
        }
    }

    const normalizedName = String(item?.name || '').trim().replace(/\s+/g, ' ')
    if (!normalizedName) {
        return { prefix: '-', firstName: '-', lastName: '-' }
    }

    const parts = normalizedName.split(' ')
    if (parts.length === 1) {
        return { prefix: '-', firstName: parts[0], lastName: '-' }
    }

    const hasKnownPrefix = commonPrefixes.has(parts[0])
    if (hasKnownPrefix) {
        if (parts.length === 2) {
            return { prefix: parts[0], firstName: parts[1], lastName: '-' }
        }

        return {
            prefix: parts[0],
            firstName: parts[1] || '-',
            lastName: parts.slice(2).join(' ') || '-',
        }
    }

    return {
        prefix: '-',
        firstName: parts[0] || '-',
        lastName: parts.slice(1).join(' ') || '-',
    }
}

function getExportConfig(role) {
    if (role === 'teacher') {
        return {
            headers: ['รหัส', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ตำแหน่ง', 'แผนก'],
            columns: [
                { width: 18 },
                { width: 14 },
                { width: 20 },
                { width: 24 },
                { width: 22 },
                { width: 24 },
            ],
            mapRow: item => {
                const { prefix, firstName, lastName } = splitFullName(item)
                return [
                    item?.userid || '-',
                    prefix,
                    firstName,
                    lastName,
                    item?.position || '-',
                    item?.department || '-',
                ]
            },
        }
    }

    return {
        headers: ['รหัส', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'ชั้นปี', 'ห้อง'],
        columns: [
            { width: 18 },
            { width: 14 },
            { width: 20 },
            { width: 24 },
            { width: 14 },
            { width: 14 },
        ],
        mapRow: item => {
            const { prefix, firstName, lastName } = splitFullName(item)
            return [
                item?.userid || '-',
                prefix,
                firstName,
                lastName,
                item?.grade || '-',
                item?.classroom || '-',
            ]
        },
    }
}

async function fetchAllRows() {
    const status = props.filters?.status || 'all'

    const baseParams = {
        role: props.filters?.role || 'student',
        name: props.filters?.name || '',
        department: props.filters?.department || '',
        userid: props.filters?.userid || '',
        status,
        grade: props.filters?.grade || '',
        classroom: props.filters?.classroom || '',
        page: 1,
        limit: 50,
    }

    if (baseParams.role === 'student') {
        baseParams.department = ''
    } else if (baseParams.role === 'teacher') {
        baseParams.grade = ''
        baseParams.classroom = '0'
    }

    let allRows = []
    let totalPages = 1
    let page = 1

    do {
        const res = await ModelingService.getModelings({ ...baseParams, page })
        const pageRows = Array.isArray(res?.data) ? res.data : []
        allRows = allRows.concat(pageRows)
        totalPages = Number(res?.total_pages) || 1
        page += 1
    } while (page <= totalPages)

    return normalizeRowsStatus(allRows, status)
}

async function exportToExcel() {
    if (loadingExport.value) return
    loadingExport.value = true
    try {
        const rows = await fetchAllRows()
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Modeling')

        const selectedRole = props.filters?.role || 'student'
        const exportConfig = getExportConfig(selectedRole)

        worksheet.addRow(exportConfig.headers)
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' }

        rows.forEach(item => {
            worksheet.addRow(exportConfig.mapRow(item))
        })

        worksheet.columns = exportConfig.columns

        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' }

        const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Modeling.xlsx`)
    } catch (error) {
        console.error('Error exporting modeling excel:', error)
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถส่งออก Excel ได้',
        })
    } finally {
        loadingExport.value = false
    }
}
</script>

<style scoped></style>
