<template>
    <div class="w-full space-y-4">
        <div class="flex items-center justify-end">
            <div class="flex items-center gap-2">
                <label class="text-sm text-gray-700">รายการ:</label>
                <select v-model.number="pageSize" class="select select-sm select-bordered w-18"
                    @change="handlePageSizeChange">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                </select>
                <span class="text-sm text-gray-700">ต่อหน้า</span>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else>
            <table class="table table-zebra w-full text-xs sm:text-[10px] xl:text-sm">
                <thead>
                    <tr class="bg-gray-100">
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th class="w-40 max-[444px]:w-28 text-center">สถานะ</th>
                        <th class="w-48 max-[444px]:hidden">หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in paginatedStudents" :key="student._id" class="hover">
                        <td class="text-xs sm:text-[10px] xl:text-sm">{{ student.userid }}</td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="font-semibold text-xs sm:text-[10px] xl:text-sm">
                                    <span v-if="student.name">{{ student.name }}</span>
                                    <span v-else>{{ [student.pre_name, student.first_name,
                                    student.last_name].filter(Boolean).join(' ') }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="text-center align-middle max-[444px]:px-1">
                            <div v-if="localPendingLeaveApprovals[student._id]"
                                class="flex flex-col items-center gap-1">
                                <div class="dropdown dropdown-center">
                                    <button type="button" tabindex="0"
                                        class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                        <span class="badge badge-warning gap-2 max-[444px]:badge-xs">
                                            รออนุมัติ
                                        </span>
                                    </button>
                                    <ul tabindex="0"
                                        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="approveLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                อนุญาต
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="rejectLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                ไม่อนุญาต
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="cancelLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                ยกเลิก
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="editLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                    </path>
                                                </svg>
                                                แก้ไข
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <div v-if="getPendingActivity(student._id)" class="dropdown dropdown-center">
                                    <button type="button" tabindex="0"
                                        class="btn btn-xs btn-ghost border-0 shadow-none bg-transparent hover:bg-base-200 px-1.5 min-h-6 h-6">
                                        <span class="badge badge-info max-[444px]:badge-xs">
                                            กิจกรรม
                                        </span>
                                    </button>
                                    <ul tabindex="0"
                                        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="editPendingActivity(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                    </path>
                                                </svg>
                                                แก้ไขกิจกรรม
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="deletePendingActivity(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16">
                                                    </path>
                                                </svg>
                                                ลบกิจกรรม
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <span v-else-if="localAttendanceData[student._id]?.status === 'present'"
                                class="badge badge-success gap-2 max-[444px]:badge-xs">
                                มา
                            </span>
                            <span v-else-if="localAttendanceData[student._id]?.status === 'leave'"
                                class="badge badge-warning max-[444px]:badge-xs">
                                ลา
                            </span>
                            <div v-else-if="localAttendanceData[student._id]?.status === 'activity'"
                                class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span class="badge badge-info max-[444px]:badge-xs">
                                        กิจกรรม
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="editActivity(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                </path>
                                            </svg>
                                            แก้ไข
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="deleteActivity(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16">
                                                </path>
                                            </svg>
                                            ลบ
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div v-else class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span v-if="displayAttendanceStatus(student._id) === 'absent'"
                                        class="inline-flex items-center justify-center rounded-full bg-error px-3 py-1 text-xs font-medium leading-none text-error-content whitespace-nowrap max-[444px]:px-2 max-[444px]:py-0.5 max-[444px]:text-[10px]">
                                        ไม่ได้สแกน
                                    </span>
                                    <span v-else class="badge badge-ghost max-[444px]:badge-xs">
                                        ว่าง
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markPresent(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            มาเรียน
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openLeaveModal(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            ลา
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openActivityModal(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            กิจกรรม
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td class="text-xs sm:text-[10px] xl:text-sm max-[444px]:hidden">
                            <div v-if="localAttendanceData[student._id]?.status === 'leave'" class="text-warning">
                                <span class="font-medium">{{ localAttendanceData[student._id]?.leaveType }}</span>
                                <div v-if="localAttendanceData[student._id]?.remark"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ localAttendanceData[student._id]?.remark }}
                                </div>
                            </div>
                            <div v-else-if="localAttendanceData[student._id]?.status === 'activity'" class="text-info">
                                <span class="font-medium">{{ localAttendanceData[student._id]?.activityName ||
                                    'มีกิจกรรม' }}</span>
                                <div v-if="localAttendanceData[student._id]?.location"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    สถานที่: {{ localAttendanceData[student._id]?.location }}
                                </div>
                                <div v-if="localAttendanceData[student._id]?.remark"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ localAttendanceData[student._id]?.remark }}
                                </div>
                            </div>
                            <div v-else-if="localAttendanceData[student._id]?.remark">
                                {{ localAttendanceData[student._id]?.remark }}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalPages > 1" class="flex flex-col items-center gap-2">
            <div class="flex justify-center gap-2">
                <div class="join shadow-lg">
                    <button @click="currentPage = 1" class="join-item btn btn-sm" :disabled="currentPage === 1">
                        ‹
                    </button>
                    <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                        :class="['join-item btn btn-sm', page === currentPage ? 'btn-active' : '']">
                        {{ page }}
                    </button>
                    <button @click="currentPage = totalPages" class="join-item btn btn-sm"
                        :disabled="currentPage === totalPages">
                        ›
                    </button>
                </div>
            </div>

            <div v-if="totalItems > 0" class="text-center text-sm text-gray-600">
                ทั้งหมด {{ totalItems }} รายการ (หน้า {{ currentPage }} / {{ totalPages }})
            </div>
        </div>

        <!-- Modals การลา -->
        <dialog v-if="leaveModal.show" class="modal modal-open">
            <div class="modal-box w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6 overflow-x-hidden">
                <h3 class="font-bold text-lg mb-4">บันทึกการลา</h3>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">ประเภทการลา</span>
                    </label>
                    <select v-model="leaveModal.form.leaveType" class="select select-bordered">
                        <option value="" disabled>เลือกประเภทการลา</option>
                        <option v-for="type in allowedLeaveTypes" :key="type._id" :value="type._id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">วันเริ่มลา</span>
                        </label>
                        <input type="date" v-model="leaveModal.form.leaveStartDate" class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">วันสิ้นสุดลา</span>
                        </label>
                        <input type="date" v-model="leaveModal.form.leaveEndDate" class="input input-bordered" />
                    </div>
                </div>

                <p class="text-sm text-gray-500 mb-4">
                    บันทึกการลาช่วงวันที่
                    {{ formatThaiDate(leaveModal.form.leaveStartDate || selectedDate) }}
                    -
                    {{ formatThaiDate(leaveModal.form.leaveEndDate || leaveModal.form.leaveStartDate || selectedDate) }}
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เวลาเริ่ม <span class="text-gray-400 text-xs">(ไม่เลือก =
                                    เต็มวัน)</span></span>
                        </label>
                        <input type="time" v-model="leaveModal.form.startTime" class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เวลาสิ้นสุด <span class="text-gray-400 text-xs">(ไม่เลือก =
                                    เต็มวัน)</span></span>
                        </label>
                        <input type="time" v-model="leaveModal.form.endTime" class="input input-bordered" />
                    </div>
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">รายละเอียด</span>
                    </label>
                    <textarea v-model="leaveModal.form.reason" class="textarea textarea-bordered"
                        placeholder="กรอกรายละเอียดการลา" rows="3"></textarea>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeLeaveModal">ยกเลิก</button>
                    <button class="btn btn-primary" :disabled="autoSaving" @click="createLeaveRequest">
                        {{ leaveModal.mode === 'edit' ? 'บันทึกการแก้ไข' : 'ยืนยัน' }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="closeLeaveModal">
                <button>close</button>
            </form>
        </dialog>

        <!-- Modal กิจกรรม -->
        <dialog v-if="activityModal.show" class="modal modal-open">
            <div class="modal-box w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6 overflow-x-hidden">
                <h3 class="font-bold text-lg mb-4">
                    {{ activityModal.mode === 'edit' ? 'แก้ไขกิจกรรม' : 'บันทึกกิจกรรม' }}
                </h3>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">ชื่อกิจกรรม</span>
                    </label>
                    <input type="text" v-model="activityModal.form.activity_name" class="input input-bordered"
                        placeholder="กรอกชื่อกิจกรรม" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">วันเริ่มกิจกรรม</span>
                        </label>
                        <input type="date" v-model="activityModal.form.activity_date_start"
                            class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">วันสิ้นสุดกิจกรรม</span>
                        </label>
                        <input type="date" v-model="activityModal.form.activity_date_end"
                            class="input input-bordered" />
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เวลาเริ่ม <span class="text-gray-400 text-xs">(ไม่เลือก =
                                    เต็มวัน)</span></span>
                        </label>
                        <input type="time" v-model="activityModal.form.start_time" class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">เวลาสิ้นสุด <span class="text-gray-400 text-xs">(ไม่เลือก =
                                    เต็มวัน)</span></span>
                        </label>
                        <input type="time" v-model="activityModal.form.end_time" class="input input-bordered" />
                    </div>
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">สถานที่ <span class="text-gray-400 text-xs">(ไม่บังคับ)</span></span>
                    </label>
                    <input type="text" v-model="activityModal.form.location" class="input input-bordered"
                        placeholder="กรอกสถานที่" />
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">หมายเหตุ <span class="text-gray-400 text-xs">(ไม่บังคับ)</span></span>
                    </label>
                    <textarea v-model="activityModal.form.remark" class="textarea textarea-bordered"
                        placeholder="กรอกรายละเอียดเพิ่มเติม" rows="3"></textarea>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeActivityModal">ยกเลิก</button>
                    <button class="btn btn-primary" :disabled="autoSaving" @click="createActivityRequest">
                        {{ activityModal.mode === 'edit' ? 'บันทึกการแก้ไข' : 'ยืนยัน' }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="closeActivityModal">
                <button>close</button>
            </form>
        </dialog>

    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { LeaveService } from '../../api/leave';
import { ActivityService } from '../../api/activity';
import Swal from 'sweetalert2';

const leaveService = new LeaveService();
const activityService = new ActivityService();

const props = defineProps({
    students: Array,
    selectedDate: String,
    selectedGrade: String,
    loading: Boolean,
    attendanceData: Object,
    pendingLeaveApprovals: Object,
    selectedRole: {
        type: String,
        default: 'student'
    },
});

const pageSize = ref(10);
const currentPage = ref(1);

const totalItems = computed(() => (props.students || []).length);

const totalPages = computed(() => Math.ceil((props.students?.length || 0) / pageSize.value));

const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return (props.students || []).slice(start, end);
});

const MAX_VISIBLE_PAGES = 3;
const visiblePages = computed(() => {
    const total = totalPages.value;
    if (total <= 1) return [];
    if (total <= MAX_VISIBLE_PAGES) {
        const pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return pages;
    }
    let startPage = currentPage.value - Math.floor(MAX_VISIBLE_PAGES / 2);
    let endPage = currentPage.value + Math.floor(MAX_VISIBLE_PAGES / 2);
    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(total, MAX_VISIBLE_PAGES);
    }
    if (endPage > total) {
        endPage = total;
        startPage = Math.max(1, total - MAX_VISIBLE_PAGES + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

const handlePageSizeChange = () => {
    currentPage.value = 1;
};

const emit = defineEmits(['update:attendanceData', 'update:pendingLeaveApprovals']);

const imgBaseUrl = ref(import.meta.env.VITE_APP_IMG_URL);
const autoSaving = ref(false);
const localAttendanceData = ref({});
const localPendingLeaveApprovals = ref({});
const leaveTypes = ref([]);

const leaveModal = ref({
    show: false,
    mode: 'create',
    requestId: null,
    studentId: null,
    form: {
        leaveStartDate: '',
        leaveEndDate: '',
        leaveType: '',
        startTime: '',
        endTime: '',
        reason: '',
    },
});

const activityModal = ref({
    show: false,
    mode: 'create',
    activityId: null,
    studentId: null,
    form: {
        activity_name: '',
        activity_date_start: '',
        activity_date_end: '',
        start_time: '',
        end_time: '',
        location: '',
        remark: '',
    },
});

watch(() => props.attendanceData, (newVal) => {
    localAttendanceData.value = { ...newVal };
}, { deep: true });

watch(() => props.pendingLeaveApprovals, (newVal) => {
    localPendingLeaveApprovals.value = { ...newVal };
}, { deep: true });

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const toDateOnly = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isSelectedDateInPast = computed(() => {
    const selected = toDateOnly(props.selectedDate);
    if (!selected) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return selected < today;
});

const displayAttendanceStatus = (studentId) => {
    const status = localAttendanceData.value?.[studentId]?.status;
    if (status) return status;
    if (isSelectedDateInPast.value) return 'absent';
    return '';
};

const toTimeNow = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

const getLeaveTypeNameById = (leaveTypeId) => {
    return leaveTypes.value.find(type => type._id === leaveTypeId)?.name || '';
};

const allowedLeaveTypeNames = ['ลาป่วย', 'ลากิจ'];
const normalizeLeaveTypeName = (value) => String(value || '').trim().toLowerCase();
const allowedLeaveTypeSet = new Set(allowedLeaveTypeNames.map((name) => normalizeLeaveTypeName(name)));

const allowedLeaveTypes = computed(() => {
    return leaveTypes.value.filter((type) => allowedLeaveTypeSet.has(normalizeLeaveTypeName(type?.name)));
});

const getLeaveTypeIdByName = (name) => {
    const target = String(name || '').trim().toLowerCase();
    return leaveTypes.value.find(type => String(type?.name || '').trim().toLowerCase() === target)?._id || '';
};

const loadLeaveTypes = async () => {
    try {
        const response = await leaveService.getLeaveTypes();
        leaveTypes.value = response?.data || [];
    } catch (error) {
        console.error('Load leave types error:', error);
        leaveTypes.value = [];
    }
};

const markPresent = async (studentId) => {
    if (autoSaving.value) return;
    localAttendanceData.value[studentId] = {
        status: 'present',
        leaveType: null,
        remark: '',
    };
    emit('update:attendanceData', localAttendanceData.value);

    if (!props.selectedDate) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันที่ก่อน', 'warning');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.manualAttendance({
            user_id: studentId,
            date: props.selectedDate,
            time: toTimeNow(),
            remark: '',
        });
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'บันทึกสถานะมาเรียนไม่สำเร็จ', 'error');
        console.error('Auto save present error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const openLeaveModal = async (studentId, mode = 'create') => {
    const pending = localPendingLeaveApprovals.value[studentId] || {};
    const attendance = localAttendanceData.value[studentId] || {};

    const fallbackLeaveTypeId = allowedLeaveTypes.value[0]?._id || '';
    const leaveType = mode === 'edit'
        ? (pending.leaveTypeId || attendance.leaveTypeId || getLeaveTypeIdByName(pending.leaveType || attendance.leaveType) || fallbackLeaveTypeId)
        : fallbackLeaveTypeId;

    const selectedLeaveTypeId = allowedLeaveTypes.value.some((type) => type._id === leaveType)
        ? leaveType
        : fallbackLeaveTypeId;

    leaveModal.value.studentId = studentId;
    leaveModal.value.mode = mode;
    leaveModal.value.requestId = mode === 'edit' ? (pending.requestId || attendance.leaveRequestId || null) : null;
    const defaultDate = props.selectedDate || '';
    const startDate = mode === 'edit'
        ? (pending.startDate || pending.leaveDate || defaultDate)
        : defaultDate;
    const endDate = mode === 'edit'
        ? (pending.endDate || pending.leaveDate || defaultDate)
        : defaultDate;
    leaveModal.value.form = {
        leaveStartDate: startDate,
        leaveEndDate: endDate,
        leaveType: selectedLeaveTypeId,
        startTime: mode === 'edit' ? (pending.startTime || '') : '',
        endTime: mode === 'edit' ? (pending.endTime || '') : '',
        reason: mode === 'edit' ? (pending.reason || attendance.remark || '') : '',
    };
    await nextTick();
    leaveModal.value.show = true;
};

const closeLeaveModal = () => {
    leaveModal.value.show = false;
    leaveModal.value.mode = 'create';
    leaveModal.value.requestId = null;
    leaveModal.value.studentId = null;
};

const normalizeDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const d = new Date(value);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const openActivityModal = async (studentId, mode = 'create') => {
    const current = mode === 'edit'
        ? (getCurrentActivitySnapshot(studentId) || localAttendanceData.value[studentId] || {})
        : (localAttendanceData.value[studentId] || {});
    activityModal.value.studentId = studentId;
    activityModal.value.mode = mode;
    activityModal.value.activityId = mode === 'edit' ? (current.activityId || null) : null;
    const defaultDate = props.selectedDate || '';
    activityModal.value.form = {
        activity_name: mode === 'edit' ? (current.activityName || '') : '',
        activity_date_start: mode === 'edit'
            ? (normalizeDateInput(current.activityDateStart) || defaultDate)
            : defaultDate,
        activity_date_end: mode === 'edit'
            ? (normalizeDateInput(current.activityDateEnd) || normalizeDateInput(current.activityDateStart) || defaultDate)
            : defaultDate,
        start_time: mode === 'edit' ? (current.startTime || '') : '',
        end_time: mode === 'edit' ? (current.endTime || '') : '',
        location: mode === 'edit' ? (current.location || '') : '',
        remark: mode === 'edit' ? (current.remark || '') : '',
    };
    await nextTick();
    activityModal.value.show = true;
};

const closeActivityModal = () => {
    activityModal.value.show = false;
    activityModal.value.mode = 'create';
    activityModal.value.activityId = null;
    activityModal.value.studentId = null;
};

const isSelectedDateInActivityRange = (startDate, endDate) => {
    if (!props.selectedDate || !startDate || !endDate) return false;
    return props.selectedDate >= startDate && props.selectedDate <= endDate;
};

const pickActivitySnapshot = (source) => {
    if (!source) return null;
    const activityId = source.activityId || source._id || null;
    const activityName = source.activityName || source.activity_name || '';
    const activityDateStart = normalizeDateInput(source.activityDateStart || source.activity_date_start || source.startDate || source.leaveDate || '');
    const activityDateEnd = normalizeDateInput(source.activityDateEnd || source.activity_date_end || source.endDate || source.leaveDate || source.activityDateStart || source.activity_date_start || '');
    const startTime = source.startTime || source.start_time || '';
    const endTime = source.endTime || source.end_time || '';
    const location = source.location || '';
    const remark = source.remark || '';

    if (!activityId && !activityName && !activityDateStart && !activityDateEnd) {
        return null;
    }

    return {
        activityId,
        activityName,
        activityDateStart,
        activityDateEnd,
        startTime,
        endTime,
        location,
        remark,
    };
};

const getPendingActivity = (studentId) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    const pendingActivity = pickActivitySnapshot(pending?.previousActivity);
    if (pendingActivity) return pendingActivity;

    const attendance = localAttendanceData.value?.[studentId];
    if (!attendance) return null;

    return pickActivitySnapshot({
        activityId: attendance.activityId || attendance.activity_id || null,
        activityName: attendance.activityName || attendance.activity_name || '',
        activityDateStart: attendance.activityDateStart || attendance.activity_date_start || '',
        activityDateEnd: attendance.activityDateEnd || attendance.activity_date_end || '',
        startTime: attendance.startTime || attendance.start_time || '',
        endTime: attendance.endTime || attendance.end_time || '',
        location: attendance.location || '',
        remark: attendance.activityRemark || attendance.activity_remark || attendance.remark || '',
    });
};

const getCurrentActivitySnapshot = (studentId) => {
    const currentAttendance = localAttendanceData.value?.[studentId];
    const pendingActivity = getPendingActivity(studentId);
    if (pendingActivity) return pendingActivity;
    if (currentAttendance?.status === 'activity') {
        return pickActivitySnapshot(currentAttendance);
    }
    return pickActivitySnapshot(currentAttendance?.previousActivity);
};

const restoreActivityAfterLeaveDecision = (studentId) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    const previousActivity = pickActivitySnapshot(pending?.previousActivity);

    if (!previousActivity) {
        delete localAttendanceData.value[studentId];
        return;
    }

    localAttendanceData.value[studentId] = {
        status: 'activity',
        ...previousActivity,
    };
};

const setPendingPreviousActivity = (studentId, previousActivity) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    if (pending) {
        if (previousActivity) {
            pending.previousActivity = previousActivity;
        } else {
            delete pending.previousActivity;
        }
    }

    const attendance = localAttendanceData.value?.[studentId];
    if (attendance) {
        if (previousActivity) {
            attendance.previousActivity = previousActivity;
        } else {
            delete attendance.previousActivity;
        }
    }
};

const createActivityRequest = async () => {
    if (autoSaving.value) return;

    const isEditMode = activityModal.value.mode === 'edit';

    if (!activityModal.value.form.activity_name) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อกิจกรรม', 'warning');
        return;
    }

    const studentId = activityModal.value.studentId;
    const activityDateStart = activityModal.value.form.activity_date_start || props.selectedDate || '';
    const activityDateEnd = activityModal.value.form.activity_date_end || activityDateStart;

    if (!studentId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบรหัสนักเรียน', 'warning');
        return;
    }

    if (!activityDateStart || !activityDateEnd) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันเริ่มและวันสิ้นสุดกิจกรรม', 'warning');
        return;
    }

    if (activityDateEnd < activityDateStart) {
        Swal.fire('แจ้งเตือน', 'วันสิ้นสุดกิจกรรมต้องไม่น้อยกว่าวันเริ่มกิจกรรม', 'warning');
        return;
    }

    autoSaving.value = true;
    try {
        const payload = {
            activity_name: activityModal.value.form.activity_name,
            activity_date_start: activityDateStart,
            activity_date_end: activityDateEnd,
            start_time: activityModal.value.form.start_time || '',
            end_time: activityModal.value.form.end_time || '',
            location: activityModal.value.form.location || '',
            status: 'เข้าร่วม',
            remark: activityModal.value.form.remark || '',
        };

        let activityId = activityModal.value.activityId || null;

        if (isEditMode) {
            if (!activityId) {
                Swal.fire('แจ้งเตือน', 'ไม่พบรหัสกิจกรรมสำหรับแก้ไข', 'warning');
                return;
            }
            await activityService.updateActivity(activityId, payload);
        } else {
            const response = await activityService.createActivity({
                ...payload,
                user_id: studentId,
            });
            activityId = response?.data?._id || response?._id || activityId;
        }

        const pending = localPendingLeaveApprovals.value?.[studentId];
        if (pending) {
            const nextPreviousActivity = isSelectedDateInActivityRange(activityDateStart, activityDateEnd)
                ? {
                    activityId,
                    activityName: activityModal.value.form.activity_name,
                    activityDateStart,
                    activityDateEnd,
                    startTime: activityModal.value.form.start_time || '',
                    endTime: activityModal.value.form.end_time || '',
                    location: activityModal.value.form.location || '',
                    remark: activityModal.value.form.remark || '',
                }
                : null;

            setPendingPreviousActivity(studentId, nextPreviousActivity);
            emit('update:attendanceData', localAttendanceData.value);
            emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
            closeActivityModal();
            Swal.fire('สำเร็จ', isEditMode ? 'แก้ไขกิจกรรมเรียบร้อยแล้ว' : 'บันทึกกิจกรรมเรียบร้อยแล้ว', 'success');
            return;
        }

        if (isSelectedDateInActivityRange(activityDateStart, activityDateEnd)) {
            localAttendanceData.value[studentId] = {
                status: 'activity',
                activityId,
                activityName: activityModal.value.form.activity_name,
                activityDateStart: activityDateStart,
                activityDateEnd: activityDateEnd,
                startTime: activityModal.value.form.start_time || '',
                endTime: activityModal.value.form.end_time || '',
                location: activityModal.value.form.location || '',
                remark: activityModal.value.form.remark || '',
            };
            emit('update:attendanceData', localAttendanceData.value);
        }

        closeActivityModal();
        Swal.fire('สำเร็จ', isEditMode ? 'แก้ไขกิจกรรมเรียบร้อยแล้ว' : 'บันทึกกิจกรรมเรียบร้อยแล้ว', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', isEditMode ? 'แก้ไขกิจกรรมไม่สำเร็จ' : 'บันทึกกิจกรรมไม่สำเร็จ', 'error');
        console.error('Save activity request error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const editActivity = async (studentId) => {
    if (autoSaving.value) return;
    await openActivityModal(studentId, 'edit');
};

const editPendingActivity = async (studentId) => {
    if (autoSaving.value) return;
    await openActivityModal(studentId, 'edit');
};

const deletePendingActivity = async (studentId) => {
    if (autoSaving.value) return;

    const activity = getPendingActivity(studentId);
    if (!activity?.activityId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบรหัสกิจกรรมสำหรับลบ', 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: 'ยืนยันการลบกิจกรรม?',
        text: activity.activityName || 'กิจกรรมนี้จะถูกลบถาวร',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    autoSaving.value = true;
    try {
        await activityService.deleteActivity(activity.activityId);
        setPendingPreviousActivity(studentId, null);
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'ลบกิจกรรมเรียบร้อยแล้ว', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ลบกิจกรรมไม่สำเร็จ', 'error');
        console.error('Delete pending activity error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const deleteActivity = async (studentId) => {
    if (autoSaving.value) return;

    const activity = localAttendanceData.value[studentId] || {};
    if (!activity.activityId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบรหัสกิจกรรมสำหรับลบ', 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: 'ยืนยันการลบกิจกรรม?',
        text: activity.activityName || 'กิจกรรมนี้จะถูกลบถาวร',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    autoSaving.value = true;
    try {
        await activityService.deleteActivity(activity.activityId);
        delete localAttendanceData.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        Swal.fire('สำเร็จ', 'ลบกิจกรรมเรียบร้อยแล้ว', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ลบกิจกรรมไม่สำเร็จ', 'error');
        console.error('Delete activity error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const editLeave = async (studentId) => {
    if (autoSaving.value) return;
    await openLeaveModal(studentId, 'edit');
};

const isSelectedDateInLeaveRange = (startDate, endDate) => {
    if (!props.selectedDate || !startDate || !endDate) return false;
    return props.selectedDate >= startDate && props.selectedDate <= endDate;
};

const createLeaveRequest = async () => {
    if (autoSaving.value) return;
    if (!leaveModal.value.form.leaveType) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกประเภทการลา', 'warning');
        return;
    }

    const studentId = leaveModal.value.studentId;
    const leaveType = leaveModal.value.form.leaveType;
    const reason = leaveModal.value.form.reason;
    const leaveStartDate = leaveModal.value.form.leaveStartDate || props.selectedDate;
    const leaveEndDate = leaveModal.value.form.leaveEndDate || leaveStartDate;

    if (!leaveStartDate || !leaveEndDate) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันเริ่มลาและวันสิ้นสุดลา', 'warning');
        return;
    }

    if (leaveEndDate < leaveStartDate) {
        Swal.fire('แจ้งเตือน', 'วันสิ้นสุดลาต้องไม่น้อยกว่าวันเริ่มลา', 'warning');
        return;
    }

    const leaveTypeId = leaveType;
    const leaveTypeName = getLeaveTypeNameById(leaveTypeId);
    const startTime = leaveModal.value.form.startTime || '';
    const endTime = leaveModal.value.form.endTime || '';

    if (!allowedLeaveTypes.value.some((type) => type._id === leaveTypeId)) {
        Swal.fire('แจ้งเตือน', 'ประเภทการลาต้องเป็น ลาป่วย หรือ ลากิจ เท่านั้น', 'warning');
        return;
    }

    if (!leaveTypeId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบประเภทลาในระบบ กรุณาตรวจสอบประเภทลา', 'warning');
        return;
    }

    autoSaving.value = true;
    try {
        const isEditMode = leaveModal.value.mode === 'edit';
        let leaveRequestId = leaveModal.value.requestId;
        let leaveStatus = 'pending';
        const previousActivity = getCurrentActivitySnapshot(studentId);

        if (isEditMode && leaveRequestId) {
            await leaveService.updateLeaveRequest(leaveRequestId, {
                leave_type_id: leaveTypeId,
                start_date: leaveStartDate,
                end_date: leaveEndDate,
                start_time: startTime,
                end_time: endTime,
                reason,
                attachment_url: '',
            });
        } else {
            const response = await leaveService.createLeaveRequest({
                leave_type_id: leaveTypeId,
                user_id: studentId,
                start_date: leaveStartDate,
                end_date: leaveEndDate,
                start_time: startTime,
                end_time: endTime,
                reason,
                attachment_url: '',
            });
            leaveRequestId = response?.data?._id || response?._id || null;

            if (leaveRequestId) {
                await leaveService.approveLeaveRequest(leaveRequestId, 'อนุมัติการลา');
                leaveStatus = 'approved';
            }
        }

        const shouldShowLeaveOnCurrentDate = isSelectedDateInLeaveRange(leaveStartDate, leaveEndDate);

        if (shouldShowLeaveOnCurrentDate) {
            localAttendanceData.value[studentId] = {
                status: 'leave',
                leaveType: leaveTypeName,
                leaveTypeId,
                remark: reason,
                leaveRequestId,
                leaveStatus,
                previousActivity,
            };

            if (leaveStatus === 'pending') {
                localPendingLeaveApprovals.value[studentId] = {
                    requestId: leaveRequestId,
                    startDate: leaveStartDate,
                    endDate: leaveEndDate,
                    leaveTypeId,
                    leaveType: leaveTypeName,
                    startTime,
                    endTime,
                    reason,
                    previousActivity,
                };
            } else {
                delete localPendingLeaveApprovals.value[studentId];
            }
        } else {
            delete localAttendanceData.value[studentId];
            delete localPendingLeaveApprovals.value[studentId];
        }

        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        closeLeaveModal();
        if (isEditMode) {
            Swal.fire('สำเร็จ', 'แก้ไขคำขอลาเรียบร้อยแล้ว', 'success');
        }
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', leaveModal.value.mode === 'edit' ? 'แก้ไขคำขอลาไม่สำเร็จ' : 'บันทึกการลาไม่สำเร็จ', 'error');
        console.error('Create leave request error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const approveLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบรายการลาที่ต้องอนุมัติ', 'warning');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.approveLeaveRequest(pending.requestId, 'อนุมัติการลา');

        const previousActivity = pickActivitySnapshot(pending?.previousActivity);
        if (previousActivity?.activityId) {
            await activityService.deleteActivity(previousActivity.activityId);
        }

        localAttendanceData.value[studentId] = {
            ...localAttendanceData.value[studentId],
            status: 'leave',
            leaveStatus: 'approved',
            previousActivity: null,
        };
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'อนุมัติการลาแล้ว', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'บันทึกการอนุมัติลาไม่สำเร็จ', 'error');
        console.error('Approve leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const rejectLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'ไม่อนุมัติการลา', 'success');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.rejectLeaveRequest(pending.requestId, 'ไม่อนุมัติการลา');
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'ไม่อนุมัติการลา', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'บันทึกการไม่อนุมัติลาไม่สำเร็จ', 'error');
        console.error('Reject leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const cancelLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'ยกเลิกรายการลาแล้ว', 'success');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.cancelLeaveRequest(pending.requestId);
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire('สำเร็จ', 'ยกเลิกรายการลาแล้ว', 'success');
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ยกเลิกรายการลาไม่สำเร็จ', 'error');
        console.error('Cancel leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

onMounted(() => {
    loadLeaveTypes();
});
</script>