<template>
    <div class="container mx-auto p-4 max-w-5xl max-[944px]:pt-14">
        <div class="flex items-center gap-2 mb-6">
            <div>
                <h1 class="text-xl sm:text-2xl font-bold text-white">ระบบตั้งค่าการเข้าเรียน/ทำงาน</h1>
            </div>
        </div>

        <CardView 
            :refresh-key="refreshKey" 
            @edit-all="openEditModal" 
        />

        <UpdateModal
            :is-open="isModalOpen"
            :rules="selectedRules"
            @close="isModalOpen = false"
            @success="handleUpdateSuccess"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import CardView from '../../components/Allowance Setting/CardView.vue';
import UpdateModal from '../../components/Allowance Setting/Update.vue';

const refreshKey = ref(0);
const isModalOpen = ref(false);
const selectedRules = ref([]);

const openEditModal = (rules) => {
    selectedRules.value = rules;
    isModalOpen.value = true;
};

const handleUpdateSuccess = () => {
    refreshKey.value++;
    isModalOpen.value = false;
};
</script>