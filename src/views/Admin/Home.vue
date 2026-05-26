<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <DashBoardData @dateChange="handleDateChange" />
        <DashBoardGraph :date="selectedDate" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import DashBoardData from '../../components/DashBoard/DashBoard-data.vue'
import DashBoardGraph from '../../components/DashBoard/DashBoard-graph.vue'

const selectedDate = ref(new Date().toISOString().split('T')[0])

const handleDateChange = (newDate) => {
    selectedDate.value = newDate
}
</script>

<style scoped></style>
