<template>
    <div class="w-full space-y-6 max-[570px]:pt-14">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h2 class="text-lg md:text-3xl font-bold">ตารางการลา</h2>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <input v-model="filters.start_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                <span>-</span>
                <input v-model="filters.end_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ค้นหารหัส</span>
                    </label>
                    <input v-model="filters.search" type="text" placeholder="กรอกรหัส"
                        class="input input-sm input-bordered w-full" />
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">สถานะ</span>
                    </label>
                    <select v-model="filters.status" class="select select-sm select-bordered w-full">
                        <option value="">ทั้งหมด</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="approved">อนุมัติแล้ว</option>
                        <option value="rejected">ไม่อนุมัติ</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">ประเภท</span>
                    </label>
                    <select v-model="filters.role" class="select select-sm select-bordered w-full">
                        <option value="">ทั้งหมด</option>
                        <option value="student">นักเรียน</option>
                        <option value="teacher">ครู</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="">
            <LeaveRequest :filters="filters" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import LeaveRequest from '../../../components/Report/LeaveRequest.vue';

const today = new Date().toISOString().split('T')[0];

const filters = ref({
    search: '',
    start_date: today,
    end_date: today,
    status: 'approved',
    role: '',
});
</script>
