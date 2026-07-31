<template>
    <div class="space-y-6 max-[944px]:pt-16">
        <DashBoardData @dateChange="handleDateChange" />
        <DashBoardGraph :date="selectedDate" />
        <transition v-if="featureFlags.home.enableProgress && auth.user?.role !== 'teacher'" name="fade-slide-up">
            <Progress v-if="showProgress" :data="progressData" :loading="progressLoading" :date="selectedDate"
                @date-change="fetchProgressReport" />
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashBoardData from '../../components/DashBoard/DashBoard-data.vue'
import DashBoardGraph from '../../components/DashBoard/DashBoard-graph.vue'
import Progress from '../../components/DashBoard/Progress.vue'
import reportApi from '../../api/report.js'
import { useAuthStore } from '../../stores/auth'
import featureFlags from '../../config/featureFlags'

const selectedDate = ref(new Date().toISOString().split('T')[0])
const progressData = ref([])
const progressLoading = ref(false)

const showProgress = ref(false)
const auth = useAuthStore()

async function fetchProgressReport(date) {
    if (!featureFlags.home.enableProgress || !date) return
    progressLoading.value = true
    try {
        const res = await reportApi.getProgressReport({ date: date })
        if (res && res.message === 'Success') {
            progressData.value = res.data || []
        } else {
            progressData.value = []
        }
    } catch (error) {
        console.error('Error fetching progress report in Home.vue:', error)
        progressData.value = []
    } finally {
        progressLoading.value = false
    }
}

const handleDateChange = (newDate) => {
    selectedDate.value = newDate
    if (featureFlags.home.enableProgress) {
        fetchProgressReport(newDate)
    }
}

onMounted(() => {
    if (featureFlags.home.enableProgress) {
        fetchProgressReport(selectedDate.value)
    }
    setTimeout(() => {
        showProgress.value = featureFlags.home.enableProgress
    }, 450)
})
</script>

<style scoped>
.fade-slide-up-enter-active {
    transition: all 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.fade-slide-up-enter-from {
    opacity: 0;
    transform: translateY(40px);
}
</style>