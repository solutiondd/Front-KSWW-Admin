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

async function hydrateFromRouteQuery() {
    const queriedStudentId = route.query.studentId ? String(route.query.studentId) : ''
    if (!queriedStudentId) return

    try {
        const service = new StudentService()
        const res = await service.getStudentById(queriedStudentId)
        const student = res.data || null
        if (student) {
            preselectedStudent.value = student
            selectedStudentId.value = student._id || queriedStudentId
            studentInfo.value = student
        }
    } catch (e) {
        preselectedStudent.value = null
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

watch(() => route.query.studentId, async () => {
    await hydrateFromRouteQuery()
})

onMounted(async () => {
    await hydrateFromRouteQuery()
})
</script>

<style scoped>
/* ...existing code... */
</style>