<template>
    <div class="card bg-base-100 shadow-xl border border-base-200">
        <div class="card-body p-5">
            <!-- <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-4 mb-4">
                <div>
                    <h2 class="card-title text-xl font-bold text-base-content">ตั้งค่าเวลาอนุโลมการเช็คชื่อ</h2>
                </div>
                <div v-if="allowanceData" :class="[
                    'badge p-3 font-semibold text-xs gap-1',
                    allowanceData.enabled ? 'badge-success text-success-content' : 'badge-ghost text-base-content/50'
                ]">
                    <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {{ allowanceData.enabled ? 'ระบบเปิดใช้งาน' : 'ระบบปิดใช้งาน' }}
                </div>
            </div> -->

            <div v-if="loading" class="flex justify-center items-center py-12">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>

            <div v-else-if="allowanceData && allowanceData.rules">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(rule, index) in allowanceData.rules" :key="index"
                        class="border border-base-200 rounded-xl overflow-hidden bg-base-50/50">

                        <div class="bg-primary p-4 text-primary-content flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <svg v-if="rule.role === 'student'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span class="font-bold text-md capitalize">{{ rule.role === 'student' ? 'นักเรียน' :
                                    'ครู' }}</span>
                            </div>
                        </div>

                        <div class="p-4">
                            <div class="flex flex-col items-center justify-center py-3">
                                <span class="text-xs text-base-content/50 font-medium mb-1">เวลาอนุโลมปัจจุบัน</span>
                                <div class="text-3xl font-extrabold text-base-content tracking-tight">
                                    {{ formatTime(rule.allowance_time) }} <span
                                        class="text-sm font-normal text-base-content/50">น.</span>
                                </div>
                            </div>

                            <!-- <div class="mt-2 pt-3 border-t border-base-200 text-xs text-base-content/70 flex justify-between">
                                <span>สถานะรายบุคคล:</span>
                                <span :class="rule.enabled ? 'text-success font-semibold' : 'text-base-content/40'">
                                    {{ rule.enabled ? 'เปิดการอนุโลม' : 'ปิดการใช้งาน' }}
                                </span>
                            </div> -->
                        </div>
                    </div>
                </div>

                <div
                    class="mt-6 pt-4 border-t border-base-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div class="text-xs text-base-content/70 flex flex-col gap-1 w-full sm:w-auto">
                        <div>
                            <span>แก้ไขล่าสุดโดย: </span>
                            <span class="font-bold text-base-content">
                                {{ allowanceData.updated_by?.name || '-' }}
                                <span v-if="allowanceData.updated_by?.role"
                                    class="font-normal text-base-content/50 text-[10px] bg-base-200 px-1.5 py-0.5 rounded ml-1 capitalize">
                                    {{ allowanceData.updated_by.role }}
                                </span>
                            </span>
                        </div>
                        <div v-if="allowanceData.updatedAt"
                            class="text-base-content/50 flex items-center gap-1 text-[11px]">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>เมื่อ: {{ formatDateTime(allowanceData.updatedAt) }}</span>
                        </div>
                    </div>

                    <button @click="handleEditAll"
                        class="btn btn-warning btn-sm text-white gap-1 shadow-sm w-full sm:w-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        แก้ไข
                    </button>
                </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                <div class="p-3 bg-warning/10 text-warning rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-md font-bold text-base-content/80">ไม่มีข้อมูลปฏิทินหรือการตั้งค่าเวลา</h3>
                <p class="text-xs text-base-content/50 max-w-xs mt-1">
                    ระบบยังไม่มีการกำหนดเวลาอนุโลมการเช็คชื่อเข้าเรียนหรือทำงานในขณะนี้
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { AllowanceService } from '../../api/allowance';

const emit = defineEmits(['edit-all']);
const loading = ref(false);
const allowanceData = ref(null);

const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.split(':').slice(0, 2).join(':');
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    
    const formattedDate = date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const formattedTime = date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return `${formattedDate} เวลา ${formattedTime} น.`;
};

const handleEditAll = () => {
    if (allowanceData.value?.rules) {
        emit('edit-all', allowanceData.value.rules);
    }
};

const fetchData = async () => {
    loading.value = true;
    try {
        const service = new AllowanceService();
        const res = await service.getAllowance();
        allowanceData.value = res?.data ?? null;
    } catch (error) {
        console.error("Error fetching allowances:", error);
        allowanceData.value = null;
    } finally {
        loading.value = false;
    }
};

const props = defineProps({
    refreshKey: {
        type: Number,
        default: 0
    }
});

watch(() => props.refreshKey, fetchData);
onMounted(fetchData);
</script>