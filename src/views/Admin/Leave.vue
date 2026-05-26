<template>
	<div class="max-[944px]:pt-16">
		<div class="mb-4 flex items-center justify-between gap-3">
			<h2 class="text-2xl font-bold text-white">จัดการรายการลา</h2>
			<button type="button" class="btn btn-primary btn-sm" @click="openCreateModal">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
					stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				เพิ่มรายการ</button>
		</div>

		<LeaveTable ref="leaveTableRef" class="bg-white w-full shadow-sm" />
		<LeaveCreate ref="leaveCreateRef" @created="handleCreated" />
	</div>
</template>

<script setup>
import { ref } from 'vue';
import LeaveCreate from '../../components/Leave/Create.vue';
import LeaveTable from '../../components/Leave/Table.vue';

const leaveCreateRef = ref(null);
const leaveTableRef = ref(null);

const openCreateModal = () => {
	leaveCreateRef.value?.openModal();
};

const handleCreated = () => {
	leaveTableRef.value?.refresh?.();
};
</script>
