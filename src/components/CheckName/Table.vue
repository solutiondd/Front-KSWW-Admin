<template>
    <div class="w-full space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
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
            <div class="flex items-center gap-2">
                <!-- <span v-if="draftCount > 0" class="badge badge-warning badge-sm">
                    รอการบันทึก {{ draftCount }} รายการ
                </span> -->
                <button type="button" class="btn btn-sm btn-ghost text-error" :disabled="draftCount === 0 || autoSaving"
                    @click="clearAllDraftChanges" title="ล้างทั้งหมด">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <button type="button" class="btn btn-primary btn-sm" :disabled="draftCount === 0 || autoSaving"
                    @click="saveAllDraftChanges" title="บันทึกทั้งหมด">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
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
                            <div v-if="isDraftChange(student._id)" class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span :class="['badge max-[444px]:badge-xs', getDraftBadgeClass(student._id)]">
                                        {{ getDraftLabel(student._id) }}
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
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
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openLeaveModal(student._id, 'draft-edit')">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            ลา
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openActivityModal(student._id, 'draft-edit')">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            กิจกรรม
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2 text-error"
                                            @click.stop.prevent="removeDraftChange(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            ยกเลิกรายการที่เลือก
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div v-else-if="localPendingLeaveApprovals[student._id]"
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

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text font-medium">ช่วงเวลาลา</span>
                    </label>
                    <div class="flex flex-wrap gap-4 bg-base-200 p-3 rounded-lg">
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="all_day" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ทั้งวัน</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="morning" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ช่วงเช้า</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="afternoon" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ช่วงบ่าย</span>
                        </label>
                    </div>
                    <div class="text-xs text-gray-500 mt-2 px-1">
                        <span v-if="leaveModal.form.timeOption === 'all_day'">• ทั้งวัน (ไม่ระบุเวลาเจาะจง)</span>
                        <span v-else-if="leaveModal.form.timeOption === 'morning'">• ช่วงเวลา: 07:00 - 13:00 น.</span>
                        <span v-else-if="leaveModal.form.timeOption === 'afternoon'">• ช่วงเวลา: 12:00 - 17:00 น.</span>
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

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text font-medium">ช่วงเวลากิจกรรม</span>
                    </label>
                    <div class="flex flex-wrap gap-4 bg-base-200 p-3 rounded-lg">
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="all_day" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ทั้งวัน</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="morning" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ช่วงเช้า</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="afternoon" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">ช่วงบ่าย</span>
                        </label>
                    </div>
                    <div class="text-xs text-gray-500 mt-2 px-1">
                        <span v-if="activityModal.form.timeOption === 'all_day'">• ทั้งวัน (ไม่ระบุเวลาเจาะจง)</span>
                        <span v-else-if="activityModal.form.timeOption === 'morning'">• ช่วงเวลา: 07:00 - 13:00
                            น.</span>
                        <span v-else-if="activityModal.form.timeOption === 'afternoon'">• ช่วงเวลา: 12:00 - 17:00
                            น.</span>
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
    selectedClassroom: String,
    selectedDepartment: String,
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

const emit = defineEmits(['update:attendanceData', 'update:pendingLeaveApprovals', 'request:reload']);

const imgBaseUrl = ref(import.meta.env.VITE_APP_IMG_URL);
const autoSaving = ref(false);
const localAttendanceData = ref({});
const localPendingLeaveApprovals = ref({});
const leaveTypes = ref([]);
const draftChanges = ref({});

const DRAFT_STORAGE_PREFIX = 'checkname-draft-queue-v1';
const draftStorageKey = computed(() => {
    const role = props.selectedRole || 'student';
    const date = props.selectedDate || '';
    const grade = props.selectedGrade || '';
    const classroom = props.selectedClassroom || '';
    const department = props.selectedDepartment || '';
    return `${DRAFT_STORAGE_PREFIX}:${role}:${date}:${grade}:${classroom}:${department}`;
});

const draftCount = computed(() => Object.keys(draftChanges.value || {}).length);

const saveDraftsToStorage = () => {
    try {
        const hasDraft = draftCount.value > 0;
        if (!hasDraft) {
            localStorage.removeItem(draftStorageKey.value);
            return;
        }
        localStorage.setItem(draftStorageKey.value, JSON.stringify(draftChanges.value));
    } catch (error) {
        console.error('Save draft changes error:', error);
    }
};

const loadDraftsFromStorage = () => {
    try {
        const raw = localStorage.getItem(draftStorageKey.value);
        if (!raw) {
            draftChanges.value = {};
            return;
        }
        const parsed = JSON.parse(raw);
        draftChanges.value = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Load draft changes error:', error);
        draftChanges.value = {};
    }
};

const pickLeavePreviousActivity = (source) => {
    if (!source) return null;
    return {
        activityId: source.activityId || null,
        activityName: source.activityName || '',
        activityDateStart: source.activityDateStart || '',
        activityDateEnd: source.activityDateEnd || '',
        startTime: source.startTime || '',
        endTime: source.endTime || '',
        location: source.location || '',
        remark: source.remark || '',
    };
};

const sanitizeBaseAttendance = (source) => {
    const next = {};
    Object.entries(source || {}).forEach(([studentId, value]) => {
        if (!studentId || !value) return;
        const leaveStatus = String(value?.leaveStatus || '').toLowerCase();
        if (value?.isDraft || leaveStatus === 'draft') return;
        next[studentId] = value;
    });
    return next;
};

const applyDraftChangesToLocalState = () => {
    const nextAttendance = sanitizeBaseAttendance(props.attendanceData);
    const nextPending = { ...(props.pendingLeaveApprovals || {}) };

    Object.entries(draftChanges.value || {}).forEach(([studentId, change]) => {
        if (!studentId || !change) return;

        if (change.action === 'present') {
            nextAttendance[studentId] = {
                status: 'present',
                leaveType: null,
                remark: '',
                isDraft: true,
            };
            delete nextPending[studentId];
            return;
        }

        if (change.action === 'leave') {
            nextAttendance[studentId] = {
                status: 'leave',
                leaveType: change.leaveTypeName || '',
                leaveTypeId: change.leaveTypeId || '',
                remark: change.reason || '',
                leaveRequestId: change.requestId || null,
                leaveStatus: 'draft',
                previousActivity: pickLeavePreviousActivity(change.previousActivity),
                isDraft: true,
            };
            delete nextPending[studentId];
            return;
        }

        if (change.action === 'activity') {
            nextAttendance[studentId] = {
                status: 'activity',
                activityId: change.activityId || null,
                activityName: change.activityName || 'มีกิจกรรม',
                activityDateStart: change.activityDateStart || '',
                activityDateEnd: change.activityDateEnd || '',
                startTime: change.startTime || '',
                endTime: change.endTime || '',
                location: change.location || '',
                remark: change.remark || '',
                isDraft: true,
            };
            delete nextPending[studentId];
        }
    });

    localAttendanceData.value = nextAttendance;
    localPendingLeaveApprovals.value = nextPending;
};

const upsertDraftChange = (studentId, change) => {
    if (!studentId || !change) return;
    draftChanges.value = {
        ...(draftChanges.value || {}),
        [studentId]: {
            ...change,
            updatedAt: Date.now(),
        },
    };
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const removeDraftChange = (studentId) => {
    if (!draftChanges.value?.[studentId]) return;
    const next = { ...(draftChanges.value || {}) };
    delete next[studentId];
    draftChanges.value = next;
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const clearAllDraftChanges = () => {
    draftChanges.value = {};
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const isDraftChange = (studentId) => Boolean(draftChanges.value?.[studentId]);
const getDraftChange = (studentId) => draftChanges.value?.[studentId] || null;
const getDraftLabel = (studentId) => {
    const action = getDraftChange(studentId)?.action;
    if (action === 'present') return 'มา';
    if (action === 'leave') return 'ลา';
    if (action === 'activity') return 'กิจกรรม';
    return 'รอบันทึก';
};

const getDraftBadgeClass = (studentId) => {
    const action = getDraftChange(studentId)?.action;
    if (action === 'present') return 'badge-success';
    if (action === 'leave') return 'badge-warning';
    if (action === 'activity') return 'badge-info';
    return 'badge-ghost';
};

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

watch(() => props.attendanceData, () => {
    applyDraftChangesToLocalState();
}, { deep: true });

watch(() => props.pendingLeaveApprovals, () => {
    applyDraftChangesToLocalState();
}, { deep: true });

watch(draftStorageKey, () => {
    loadDraftsFromStorage();
    applyDraftChangesToLocalState();
}, { immediate: true });

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

const toAttendanceSubmitTime = () => {
    const now = new Date();
    const eightAM = new Date(now);
    eightAM.setHours(8, 0, 0, 0);

    if (now > eightAM) {
        return '08:00:00';
    }

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

const normalizeTimeInput = (value) => {
    if (!value) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    return value;
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
    if (!props.selectedDate) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันที่ก่อน', 'warning');
        return;
    }

    upsertDraftChange(studentId, {
        action: 'present',
    });
};

const openLeaveModal = async (studentId, mode = 'create') => {
    const pending = localPendingLeaveApprovals.value[studentId] || {};
    const attendance = localAttendanceData.value[studentId] || {};
    const draft = getDraftChange(studentId);
    const useDraft = mode === 'draft-edit' && draft?.action === 'leave';

    const draftLeaveTypeName = useDraft ? draft.leaveTypeName : '';
    const draftFallbackLeaveTypeId = draftLeaveTypeName
        ? getLeaveTypeIdByName(draftLeaveTypeName)
        : '';

    const fallbackLeaveTypeId = allowedLeaveTypes.value[0]?._id || '';
    const leaveType = useDraft
        ? (draft.leaveTypeId || draftFallbackLeaveTypeId || fallbackLeaveTypeId)
        : mode === 'edit'
            ? (pending.leaveTypeId || attendance.leaveTypeId || getLeaveTypeIdByName(pending.leaveType || attendance.leaveType) || fallbackLeaveTypeId)
            : fallbackLeaveTypeId;

    const selectedLeaveTypeId = allowedLeaveTypes.value.some((type) => type._id === leaveType)
        ? leaveType
        : fallbackLeaveTypeId;

    leaveModal.value.studentId = studentId;
    leaveModal.value.mode = mode;
    leaveModal.value.requestId = useDraft
        ? (draft.requestId || null)
        : mode === 'edit'
            ? (pending.requestId || attendance.leaveRequestId || null)
            : null;

    const defaultDate = props.selectedDate || '';
    const startDate = useDraft
        ? (draft.startDate || defaultDate)
        : mode === 'edit'
            ? (pending.startDate || pending.leaveDate || defaultDate)
            : defaultDate;
    const endDate = useDraft
        ? (draft.endDate || draft.startDate || defaultDate)
        : mode === 'edit'
            ? (pending.endDate || pending.leaveDate || defaultDate)
            : defaultDate;

    const rawStartTime = useDraft ? (draft.startTime || '') : mode === 'edit' ? (pending.startTime || '') : '';
    const rawEndTime = useDraft ? (draft.endTime || '') : mode === 'edit' ? (pending.endTime || '') : '';

    leaveModal.value.form = {
        leaveStartDate: startDate,
        leaveEndDate: endDate,
        leaveType: selectedLeaveTypeId,
        timeOption: getTimeOptionFromValues(rawStartTime, rawEndTime), // Default 'all_day' หากไม่แมตช์
        reason: useDraft ? (draft.reason || '') : mode === 'edit' ? (pending.reason || attendance.remark || '') : '',
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

const getTimeValuesByOption = (option) => {
    if (option === 'morning') {
        return { startTime: '07:00', endTime: '13:00' };
    }
    if (option === 'afternoon') {
        return { startTime: '12:00', endTime: '17:00' };
    }
    return { startTime: '', endTime: '' };
};

const getTimeOptionFromValues = (startTime, endTime) => {
    if (startTime === '07:00' && endTime === '13:00') return 'morning';
    if (startTime === '12:00' && endTime === '17:00') return 'afternoon';
    return 'all_day';
};

const openActivityModal = async (studentId, mode = 'create') => {
    const current = mode === 'edit'
        ? (getCurrentActivitySnapshot(studentId) || localAttendanceData.value[studentId] || {})
        : (localAttendanceData.value[studentId] || {});
    const draft = getDraftChange(studentId);
    const useDraft = mode === 'draft-edit' && draft?.action === 'activity';

    const draftCurrent = useDraft
        ? {
            activityId: draft.activityId || null,
            activityName: draft.activityName || '',
            activityDateStart: draft.activityDateStart || '',
            activityDateEnd: draft.activityDateEnd || '',
            startTime: draft.startTime || '',
            endTime: draft.endTime || '',
            location: draft.location || '',
            remark: draft.remark || '',
        }
        : null;

    activityModal.value.studentId = studentId;
    activityModal.value.mode = mode;
    activityModal.value.activityId = useDraft
        ? (draftCurrent.activityId || null)
        : mode === 'edit'
            ? (current.activityId || null)
            : null;
    const defaultDate = props.selectedDate || '';

    const rawStartTime = useDraft ? (draftCurrent.startTime || '') : mode === 'edit' ? (current.startTime || '') : '';
    const rawEndTime = useDraft ? (draftCurrent.endTime || '') : mode === 'edit' ? (current.endTime || '') : '';

    activityModal.value.form = {
        activity_name: useDraft ? (draftCurrent.activityName || '') : mode === 'edit' ? (current.activityName || '') : '',
        activity_date_start: useDraft
            ? (normalizeDateInput(draftCurrent.activityDateStart) || defaultDate)
            : mode === 'edit'
                ? (normalizeDateInput(current.activityDateStart) || defaultDate)
                : defaultDate,
        activity_date_end: useDraft
            ? (normalizeDateInput(draftCurrent.activityDateEnd) || normalizeDateInput(draftCurrent.activityDateStart) || defaultDate)
            : mode === 'edit'
                ? (normalizeDateInput(current.activityDateEnd) || normalizeDateInput(current.activityDateStart) || defaultDate)
                : defaultDate,
        timeOption: getTimeOptionFromValues(rawStartTime, rawEndTime), // Default 'all_day'
        location: useDraft ? (draftCurrent.location || '') : mode === 'edit' ? (current.location || '') : '',
        remark: useDraft ? (draftCurrent.remark || '') : mode === 'edit' ? (current.remark || '') : '',
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

const formatTimeToSeconds = (timeStr) => {
    if (!timeStr) return '';
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return `${timeStr}:00`;
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
    }
    return timeStr;
}

const createActivityRequest = async () => {
    if (autoSaving.value) return;

    const isEditMode = activityModal.value.mode === 'edit' || activityModal.value.mode === 'draft-edit';

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

    const { startTime, endTime } = getTimeValuesByOption(activityModal.value.form.timeOption);

    const shouldShow = isSelectedDateInActivityRange(activityDateStart, activityDateEnd);
    if (!shouldShow) {
        removeDraftChange(studentId);
        closeActivityModal();
        return;
    }

    upsertDraftChange(studentId, {
        action: 'activity',
        studentId,
        activityId: activityModal.value.activityId || null,
        activityName: activityModal.value.form.activity_name,
        activityDateStart,
        activityDateEnd,
        startTime: startTime ? formatTimeToSeconds(startTime) : '',
        endTime: endTime ? formatTimeToSeconds(endTime) : '',
        location: activityModal.value.form.location || '',
        remark: activityModal.value.form.remark || '',
        mode: isEditMode ? 'edit' : 'create',
    });

    closeActivityModal();
    Swal.fire('สำเร็จ', 'เพิ่มรายการกิจกรรมเข้าคิวบันทึกแล้ว', 'success');
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
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ลบกิจกรรมไม่สำเร็จ', 'error');
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
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ลบกิจกรรมไม่สำเร็จ', 'error');
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

    const { startTime, endTime } = getTimeValuesByOption(leaveModal.value.form.timeOption);

    if (!allowedLeaveTypes.value.some((type) => type._id === leaveTypeId)) {
        Swal.fire('แจ้งเตือน', 'ประเภทการลาต้องเป็น ลาป่วย หรือ ลากิจ เท่านั้น', 'warning');
        return;
    }

    if (!leaveTypeId) {
        Swal.fire('แจ้งเตือน', 'ไม่พบประเภทลาในระบบ กรุณาตรวจสอบประเภทลา', 'warning');
        return;
    }

    const isEditMode = leaveModal.value.mode === 'edit' || leaveModal.value.mode === 'draft-edit';
    const shouldShowLeaveOnCurrentDate = isSelectedDateInLeaveRange(leaveStartDate, leaveEndDate);
    if (!shouldShowLeaveOnCurrentDate) {
        removeDraftChange(studentId);
        closeLeaveModal();
        return;
    }

    const previousActivity = getCurrentActivitySnapshot(studentId);
    upsertDraftChange(studentId, {
        action: 'leave',
        studentId,
        requestId: leaveModal.value.requestId || null,
        leaveTypeId,
        leaveTypeName,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        startTime,
        endTime,
        reason,
        previousActivity,
        mode: isEditMode ? 'edit' : 'create',
    });

    closeLeaveModal();
    Swal.fire('สำเร็จ', 'เพิ่มรายการลาเข้าคิวบันทึกแล้ว', 'success');
};

const saveSingleDraftChange = async (studentId, draftChange) => {
    if (!studentId || !draftChange) return;

    if (draftChange.action === 'present') {
        await leaveService.manualAttendance({
            user_id: studentId,
            date: props.selectedDate,
            time: toAttendanceSubmitTime(),
            remark: '',
        });
        return;
    }

    if (draftChange.action === 'leave') {
        let leaveRequestId = draftChange.requestId || null;
        const payload = {
            leave_type_id: draftChange.leaveTypeId,
            start_date: draftChange.startDate,
            end_date: draftChange.endDate,
            start_time: normalizeTimeInput(draftChange.startTime),
            end_time: normalizeTimeInput(draftChange.endTime),
            reason: draftChange.reason || '',
            attachment_url: '',
        };

        if (draftChange.mode === 'edit' && leaveRequestId) {
            await leaveService.updateLeaveRequest(leaveRequestId, payload);
        } else {
            const response = await leaveService.createLeaveRequest({
                ...payload,
                user_id: studentId,
            });
            leaveRequestId = response?.data?._id || response?._id || null;
            if (leaveRequestId) {
                await leaveService.approveLeaveRequest(leaveRequestId, 'อนุมัติการลา');
            }
        }
        return;
    }

    if (draftChange.action === 'activity') {
        const payload = {
            activity_name: draftChange.activityName,
            activity_date_start: draftChange.activityDateStart,
            activity_date_end: draftChange.activityDateEnd,
            start_time: normalizeTimeInput(draftChange.startTime || '00:00'),
            end_time: normalizeTimeInput(draftChange.endTime || '23:59'),
            location: draftChange.location || '',
            status: 'เข้าร่วม',
            remark: draftChange.remark || '',
        };

        if (draftChange.mode === 'edit' && draftChange.activityId) {
            await activityService.updateActivity(draftChange.activityId, payload);
        } else {
            await activityService.createActivity({
                ...payload,
                user_id: studentId,
            });
        }
    }
};

const saveAllDraftChanges = async () => {
    if (autoSaving.value || draftCount.value === 0) return;
    if (!props.selectedDate) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันที่ก่อน', 'warning');
        return;
    }

    autoSaving.value = true;
    let successCount = 0;
    let failCount = 0;

    const entries = Object.entries(draftChanges.value || {}).sort((a, b) => {
        const timeA = Number(a?.[1]?.updatedAt || 0);
        const timeB = Number(b?.[1]?.updatedAt || 0);
        return timeA - timeB;
    });

    for (const [studentId, draftChange] of entries) {
        try {
            await saveSingleDraftChange(studentId, draftChange);
            removeDraftChange(studentId);
            successCount += 1;
        } catch (error) {
            failCount += 1;
            console.error(`Save queued checkname failed for ${studentId}:`, error);
        }
    }

    autoSaving.value = false;

    if (successCount > 0) {
        emit('request:reload');
    }

    if (failCount === 0) {
        Swal.fire('สำเร็จ', `บันทึกรายการสำเร็จ ${successCount} รายการ`, 'success');
    } else {
        Swal.fire('บันทึกไม่ครบ', `สำเร็จ ${successCount} รายการ, ไม่สำเร็จ ${failCount} รายการ`, 'warning');
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
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'บันทึกการอนุมัติลาไม่สำเร็จ', 'error');
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
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'บันทึกการไม่อนุมัติลาไม่สำเร็จ', 'error');
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
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ยกเลิกรายการลาไม่สำเร็จ', 'error');
        console.error('Cancel leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

onMounted(() => {
    loadLeaveTypes();
});
</script>