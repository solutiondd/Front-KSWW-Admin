<template>
    <div class="max-[944px]:pt-14">
        <Create :preselected-student="preselectedStudent" @student-selected="handleStudentSelected"
            @conduct-saved="handleConductSaved" />
        <ConductTable v-if="selectedStudentId" :studentId="selectedStudentId" :studentInfo="studentInfo"
            :refreshKey="tableRefreshKey" @conduct-updated="handleConductUpdated" />
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Create from '../../components/Conduct/Create.vue'
import ConductTable from '../../components/Conduct/Table.vue'
import { StudentService } from '../../api/student.js'

const route = useRoute()
const selectedStudentId = ref(null)
const studentInfo = ref(null)
const tableRefreshKey = ref(0)
const preselectedStudent = ref(null)

function isObjectId(value) {
    return /^[a-fA-F0-9]{24}$/.test(String(value || '').trim())
}

async function hydrateFromRouteQuery() {
    const queriedStudentId = route.query.studentId ? String(route.query.studentId) : ''
    const queriedUserid = route.query.userid ? String(route.query.userid) : ''
    const queriedName = route.query.name ? String(route.query.name) : ''
    const validStudentObjectId = isObjectId(queriedStudentId) ? queriedStudentId : ''

    if (!queriedStudentId && !queriedUserid && !queriedName) return

    try {
        const service = new StudentService()
        let student = null

        if (validStudentObjectId) {
            const res = await service.getStudentById(validStudentObjectId)
            student = res.data || null
        } else {
            const res = await service.searchStudent({
                userid: queriedUserid || queriedStudentId,
                name: queriedName,
            })
            const students = Array.isArray(res?.data) ? res.data : []
            const exact = students.find((item) => {
                const sameUserid = queriedUserid ? String(item?.userid || '') === queriedUserid : true
                const sameName = queriedName ? String(item?.name || '') === queriedName : true
                return sameUserid && sameName
            })
            student = exact || students[0] || null
        }

        if (student) {
            preselectedStudent.value = student
            const resolvedId = student?._id || student?.id || ''
            selectedStudentId.value = isObjectId(resolvedId) ? String(resolvedId) : null
            studentInfo.value = student
        } else {
            preselectedStudent.value = null
            selectedStudentId.value = null
            studentInfo.value = null
        }
    } catch (e) {
        preselectedStudent.value = null
        selectedStudentId.value = null
        studentInfo.value = null
    }
}

async function handleStudentSelected(studentId) {
    selectedStudentId.value = studentId
    try {
        const service = new StudentService()
        const res = await service.getStudentById(studentId)
        studentInfo.value = res.data || null
    } catch (e) {
        studentInfo.value = null
    }
}

async function handleConductSaved(studentId) {
    if (studentId) {
        await handleStudentSelected(studentId)
    }
    tableRefreshKey.value += 1
}

async function handleConductUpdated(studentId) {
    if (studentId) {
        await handleStudentSelected(studentId)
    }
}

watch(() => [route.query.studentId, route.query.userid, route.query.name], async () => {
    await hydrateFromRouteQuery()
})

onMounted(async () => {
    await hydrateFromRouteQuery()
})
</script>

<style scoped>
/* ...existing code... */
</style>