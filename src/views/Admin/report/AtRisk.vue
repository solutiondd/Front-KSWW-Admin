<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h1 class="text-lg md:text-3xl font-bold">ตารางนักเรียนกลุ่มเสี่ยง</h1>
        </div>

        <AtRiskStudent />
    </div>
</template>

<script setup>
import AtRiskStudent from "../../../components/Report/AtRiskStudent.vue";
</script>
