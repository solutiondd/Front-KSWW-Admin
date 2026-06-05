<template>
    <div v-if="loading" class="flex justify-center items-center py-12">
        <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="groupedClassrooms.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-300 mb-4" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-base-content/60 text-white">ไม่มีข้อมูลห้องเรียน</p>
    </div>

    <div v-else class="space-y-6">
        <div v-for="grade in groupedClassrooms" :key="grade.grade" class="card bg-base-100 shadow-md">
            <div class="card-body">
                <div class="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
                    <h3 class="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
                        <div :class="[
                            'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md',
                            getGradeColor(grade.grade)
                        ]">
                            {{ getGradeBadge(grade.grade) }}
                        </div>
                        <span class="text-base md:text-xl">{{ getGradeLabel(grade.grade) }}</span>
                    </h3>
                    <div class="badge badge-primary badge-sm md:badge-lg px-2 py-1 md:p-3 mt-1 md:mt-0">มี {{
                        grade.classrooms.length }} ห้อง</div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div v-for="classroom in grade.classrooms" :key="classroom._id"
                        class="relative group cursor-pointer">
                        <div
                            class="p-4 rounded-lg border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 h-full flex flex-col cursor-pointer">
                            <div class="text-center flex-1 flex flex-col justify-between">
                                <div @click="goToStudent(classroom.grade, classroom.classroom)">
                                    <div class="text-2xl font-bold text-primary mb-1">ห้อง {{ classroom.classroom }}
                                    </div>
                                    <div class="text-xs text-secondary font-medium">{{ getGradeLabel(classroom.grade) }}
                                    </div>
                                </div>
                                <div class="flex items-center justify-center mt-2">
                                    <span v-if="classroom.chanel_id"
                                        class="flex items-center gap-1 text-green-600 text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M9.999 15.999c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336zm0 0c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336zm0 0c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336z" />
                                            <path
                                                d="M21.996 2.004c-.024-.024-.048-.048-.072-.072-.264-.264-.624-.408-.984-.408-.072 0-.144.008-.216.024l-19.2 4.8c-.408.104-.72.432-.792.84-.072.408.096.816.432 1.056l6.48 4.704 2.88 8.64c.12.36.432.624.816.672.048.008.096.008.144.008.336 0 .648-.192.792-.504l3.072-6.576 6.48-13.44c.168-.336.12-.744-.144-1.008zm-7.464 13.464l-2.304-6.912 8.064-5.856-5.76 12.768zm-2.304-6.912l-6.048-4.392 15.36-3.84-9.312 8.232zm-1.104 8.208l-2.304-6.912 8.064-5.856-5.76 12.768z" />
                                        </svg>
                                        มี Telegram
                                    </span>
                                    <span v-else class="flex items-center gap-1 text-gray-400 text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M9.999 15.999c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336zm0 0c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336zm0 0c-.396 0-.792-.144-1.104-.432l-2.4-2.16c-.408-.36-.456-.984-.096-1.392.36-.408.984-.456 1.392-.096l2.4 2.16c.408.36.456.984.096 1.392-.192.216-.456.336-.688.336z" />
                                            <path
                                                d="M21.996 2.004c-.024-.024-.048-.048-.072-.072-.264-.264-.624-.408-.984-.408-.072 0-.144.008-.216.024l-19.2 4.8c-.408.104-.72.432-.792.84-.072.408.096.816.432 1.056l6.48 4.704 2.88 8.64c.12.36.432.624.816.672.048.008.096.008.144.008.336 0 .648-.192.792-.504l3.072-6.576 6.48-13.44c.168-.336.12-.744-.144-1.008zm-7.464 13.464l-2.304-6.912 8.064-5.856-5.76 12.768zm-2.304-6.912l-6.048-4.392 15.36-3.84-9.312 8.232zm-1.104 8.208l-2.304-6.912 8.064-5.856-5.76 12.768z" />
                                        </svg>
                                        ยังไม่มี Telegram
                                    </span>
                                </div>
                                <div @click="auth.user?.role !== 'viewer' && $emit('edit', classroom)"
                                    :class="[auth.user?.role !== 'viewer' ? 'cursor-pointer hover:bg-primary/10' : '', 'mt-2 pt-2 border-t border-primary/20 rounded']">
                                    <div class="text-xs text-base-content/70">ครูที่ปรึกษา</div>
                                    <div class="text-xs font-semibold text-primary mt-1">
                                        <template
                                            v-if="(classroom.adviser && classroom.adviser.name) || (classroom.adviser2 && classroom.adviser2.name)">
                                            <template v-if="classroom.adviser && classroom.adviser.name">
                                                {{ classroom.adviser.name }}<span v-if="classroom.adviser.position">
                                                    ({{ classroom.adviser.position }})</span>
                                            </template>
                                            <template v-if="classroom.adviser2 && classroom.adviser2.name">
                                                <br />{{ classroom.adviser2.name }}<span
                                                    v-if="classroom.adviser2.position"> ({{
                                                        classroom.adviser2.position }})</span>
                                            </template>
                                        </template>
                                        <template v-else>
                                            -
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'"
                            @click.stop="$emit('delete', classroom)"
                            class="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { compareGrades, getGradeSortOrder, getGradeUiBadge, getGradeUiLabel } from '../../utils/gradeSystem'

const auth = useAuthStore()
const router = useRouter()

const goToStudent = (grade, classroom) => {
    router.push({ name: 'Student', query: { grade, classroom } })
}

const props = defineProps({
    classrooms: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

defineEmits(['delete', 'edit'])

const groupedClassrooms = computed(() => {
    const groups = {}
    props.classrooms.forEach(classroom => {
        if (!groups[classroom.grade]) {
            groups[classroom.grade] = {
                grade: classroom.grade,
                classrooms: []
            }
        }
        groups[classroom.grade].classrooms.push(classroom)
    })

    return Object.values(groups)
        .sort((a, b) => compareGrades(a.grade, b.grade))
        .map(group => ({
            ...group,
            classrooms: group.classrooms.sort((a, b) => a.classroom - b.classroom)
        }))
})

const getGradeLabel = (grade) => {
    return getGradeUiLabel(grade)
}

const getGradeColor = (grade) => {
    const order = getGradeSortOrder(grade)
    if (order <= 3) return 'bg-teal-500'
    if (order <= 6) return 'bg-green-500'
    if (order <= 9) return 'bg-cyan-500'
    if (order <= 12) return 'bg-blue-600'
    if (order <= 15) return 'bg-indigo-600'
    return 'bg-primary'
}

const getGradeBadge = (grade) => {
    return getGradeUiBadge(grade)
}
</script>

<style scoped></style>
