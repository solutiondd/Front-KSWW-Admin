<template>
    <div class="max-[944px]:pt-16">
        <div class="w-full bg-white rounded-lg shadow-sm p-6">
            <div class="mb-6">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">เช็คชื่อ</h2>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">วันที่</label>
                        <input v-model="selectedDate" type="date" class="input input-bordered input-sm"
                            @change="loadUsers" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 gap-y-3 items-end lg:grid-cols-4 lg:gap-4">
                    <div class="w-full">
                        <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหาชื่อ/รหัส</label>
                        <input v-model="searchQuery" type="text" class="input input-bordered w-full"
                            placeholder="ชื่อหรือรหัส..." @input="handleSearch" />
                    </div>
                    <!-- <div v-if="residentRole !== 'teacher'" class="w-full">
                        <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                        <select v-model="selectedRole" class="select select-bordered w-full" @change="handleRoleChange">
                            <option value="student">นักเรียน</option>
                            <option value="teacher">ครู</option>
                        </select>
                    </div> -->
                    <template v-if="selectedRole === 'student'">
                        <div v-if="residentRole !== 'teacher'" class="w-full">
                            <label class="block text-sm font-medium text-gray-700 mb-2">ชั้นเรียน</label>
                            <select v-model="selectedGrade" class="select select-bordered w-full"
                                @change="handleGradeChange">
                                <option value="">เลือกชั้นเรียน</option>
                                <option v-for="grade in gradeList" :key="grade" :value="grade">
                                    {{ mapGradeDisplay(grade) }}
                                </option>
                            </select>
                        </div>
                        <div v-if="residentRole !== 'teacher'" class="w-full">
                            <label class="block text-sm font-medium text-gray-700 mb-2">ห้องเรียน</label>
                            <select v-model="selectedClassroom" class="select select-bordered w-full"
                                @change="loadUsers">
                                <option value="">เลือกห้องเรียน</option>
                                <option v-for="classroom in filteredClassrooms" :key="classroom._id"
                                    :value="classroom.classroom">
                                    {{ classroom.classroom }}
                                </option>
                            </select>
                        </div>
                        <div v-if="residentRole === 'teacher'"
                            class="w-full col-span-1 lg:col-start-4 flex justify-end">
                            <div class="p-2 text-white bg-primary rounded-md text-center min-w-[120px]">
                                <span class="block text-sm font-medium text-secondary">ชั้นปี / ห้อง</span>
                                <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="residentRole !== 'teacher'" class="w-full col-span-2 lg:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">แผนก</label>
                            <select v-model="selectedDepartment" class="select select-bordered w-full"
                                @change="loadUsers">
                                <option value="">เลือกแผนก</option>
                                <option v-for="dept in departmentList" :key="dept" :value="dept">
                                    {{ dept }}
                                </option>
                            </select>
                        </div>
                    </template>
                </div>
            </div>

            <CheckNameTable :students="students" :selectedDate="selectedDate" :selectedGrade="selectedGrade"
                :selectedClassroom="selectedClassroom" :selectedDepartment="selectedDepartment" :loading="loading"
                :attendanceData="attendanceData" :pendingLeaveApprovals="pendingLeaveApprovals"
                :selectedRole="selectedRole" @update:attendanceData="attendanceData = $event"
                @update:pendingLeaveApprovals="pendingLeaveApprovals = $event" @request:reload="loadUsers" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { StudentService } from '../../api/student';
import { TeacherService } from '../../api/teacher';
import { ClassRoomService } from '../../api/class-room';
import { DepartmentService } from '../../api/department';
import { PositionService } from '../../api/position';
import reportApi from '../../api/report';
import { LeaveService } from '../../api/leave';
import { ActivityService } from '../../api/activity';
import { AllowanceService } from '../../api/allowance';
import CheckNameTable from '../../components/CheckName/Table.vue';
import featureFlags from '../../config/featureFlags';
import { mapGradeDisplay, toVisibleSortedGrades } from '../../utils/gradeSystem';
import Swal from 'sweetalert2';

const studentService = new StudentService();
const teacherService = new TeacherService();
const classRoomService = new ClassRoomService();
const departmentService = new DepartmentService();
const positionService = new PositionService();
const leaveService = new LeaveService();
const activityService = new ActivityService();
const allowanceService = new AllowanceService();
const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const students = ref([]);
const allStudents = ref([]);
const classrooms = ref([]);
const departments = ref([]);
const positions = ref([]);
const loading = ref(false);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const selectedRole = ref('student');
const selectedGrade = ref(residentRole === 'teacher' && teacherGrade ? teacherGrade : '');
const selectedClassroom = ref(residentRole === 'teacher' && teacherClassroom ? teacherClassroom : '');
const selectedDepartment = ref('');
const searchQuery = ref('');
let searchTimer = null;
const attendanceData = ref({});
const pendingLeaveApprovals = ref({});
const allowanceSetting = ref(null);

const approvedLeaveStatuses = new Set(['approved']);
const pendingLeaveStatuses = new Set(['pending']);
const leaveStatusPriority = {
    approved: 2,
    pending: 1,
};

const DEFAULT_LATE_CUTOFF_TIME = '08:01:00';

const gradeList = computed(() => {
    return toVisibleSortedGrades(classrooms.value.map(c => c.grade));
});

const filteredClassrooms = computed(() => {
    if (!selectedGrade.value) return [];
    return classrooms.value.filter(c => c.grade === selectedGrade.value);
});

const departmentList = computed(() => {
    return departments.value.map(d => d.name_th || d.name || '').filter(Boolean);
});

const loadClassrooms = async () => {
    try {
        const response = await classRoomService.getClassRooms();
        classrooms.value = response.data || [];

        if (residentRole !== 'teacher' && selectedRole.value === 'student') {
            const grades = toVisibleSortedGrades(classrooms.value.map(c => c.grade));
            if (grades.length > 0) {
                selectedGrade.value = grades[0];
                const firstClassroom = classrooms.value.find(c => c.grade === grades[0]);
                if (firstClassroom) {
                    selectedClassroom.value = firstClassroom.classroom;
                    await loadUsers();
                }
            }
        }
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ไม่สามารถโหลดรายชื่อห้องเรียนได้', 'error');
        console.error('Load classrooms error:', error);
    }
};

const loadDepartmentsAndPositions = async () => {
    try {
        const [deptRes, posRes] = await Promise.all([
            departmentService.getDepartments(),
            positionService.getPositions()
        ]);
        departments.value = deptRes.data || [];
        positions.value = posRes.data || [];
    } catch (error) {
        console.error('Load departments and positions error:', error);
    }
};

const handleGradeChange = () => {
    selectedClassroom.value = '';
    searchQuery.value = '';
    loadUsers();
};

const handleSearch = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
        const q = searchQuery.value.trim();
        const roleForMap = selectedRole.value === 'teacher' ? 'teacher' : 'student';

        if (!q) {
            students.value = allStudents.value;
            await mapDailyStatus(allStudents.value, roleForMap);
            return;
        }

        const lower = q.toLowerCase();
        students.value = allStudents.value.filter((s) => {
            const name = [s.pre_name, s.first_name, s.last_name, s.name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            const userid = String(s.userid || '').toLowerCase();
            return name.includes(lower) || userid.includes(lower);
        });

        await mapDailyStatus(students.value, roleForMap);
    }, 300);
};

const handleRoleChange = () => {
    selectedGrade.value = '';
    selectedClassroom.value = '';
    selectedDepartment.value = '';
    searchQuery.value = '';
    students.value = [];
    allStudents.value = [];
    attendanceData.value = {};
    pendingLeaveApprovals.value = {};
    if (selectedRole.value === 'teacher') {
        loadUsers();
    } else {
        const grades = toVisibleSortedGrades(classrooms.value.map(c => c.grade));
        if (grades.length > 0) {
            selectedGrade.value = grades[0];
            const firstClassroom = classrooms.value.find(c => c.grade === grades[0]);
            if (firstClassroom) {
                selectedClassroom.value = firstClassroom.classroom;
                loadUsers();
            }
        }
    }
};

const parseTimeToSeconds = (value) => {
    if (!value || typeof value !== 'string') return null;
    const match = value.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || '0');
    if ([hours, minutes, seconds].some((item) => Number.isNaN(item))) return null;

    return (hours * 3600) + (minutes * 60) + seconds;
};

const parseTimestampToSeconds = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const normalized = raw.includes('T')
        ? raw
        : raw.includes(' ')
            ? raw.replace(' ', 'T')
            : raw;

    const parsedDate = new Date(normalized);
    if (!isNaN(parsedDate)) {
        return (parsedDate.getHours() * 3600) + (parsedDate.getMinutes() * 60) + parsedDate.getSeconds();
    }

    const timeMatch = raw.match(/(\d{2}:\d{2}(?::\d{2})?)/);
    if (!timeMatch) return null;
    return parseTimeToSeconds(timeMatch[1]);
};

const getLateCutoffTime = (roleType = 'student') => {
    const selectedRoleRule = Array.isArray(allowanceSetting.value?.rules)
        ? allowanceSetting.value.rules.find((rule) => rule?.role === roleType)
        : null;

    const lateCutoffTime = allowanceSetting.value?.late?.cutoff_time
        || allowanceSetting.value?.data?.late?.cutoff_time
        || selectedRoleRule?.late?.cutoff_time
        || selectedRoleRule?.allowance_time
        || DEFAULT_LATE_CUTOFF_TIME;

    return parseTimeToSeconds(lateCutoffTime) !== null ? lateCutoffTime : DEFAULT_LATE_CUTOFF_TIME;
};

const isAllowedAttendanceTimestamp = (timeStamp) => {
    if (featureFlags.checkName.presentMode === 'any_timestamp') {
        return true;
    }

    const usecase = String(timeStamp?.usecase || '').toLowerCase();
    return usecase === 'person_confirmation' || usecase === 'attendance';
};

const getFirstAttendanceSeconds = (student, date) => {
    const attendances = student?.attendances || [];
    let firstSeconds = null;

    attendances.forEach((attendance) => {
        if (attendance?.date !== date) {
            return;
        }

        const timeStamps = Array.isArray(attendance?.timeStamps) ? attendance.timeStamps : [];
        timeStamps.forEach((timeStamp) => {
            if (!isAllowedAttendanceTimestamp(timeStamp)) {
                return;
            }

            const currentSeconds = parseTimestampToSeconds(timeStamp?.timestamp);
            if (currentSeconds === null) {
                return;
            }

            if (firstSeconds === null || currentSeconds < firstSeconds) {
                firstSeconds = currentSeconds;
            }
        });
    });

    return firstSeconds;
};

const hasAttendanceOnDate = (student, date) => {
    return getFirstAttendanceSeconds(student, date) !== null;
};

const loadAllowanceSetting = async () => {
    try {
        const response = await allowanceService.getAllowance();
        allowanceSetting.value = response?.data || null;
    } catch (error) {
        console.error('Load allowance setting error:', error);
        allowanceSetting.value = null;
    }
};

const getLeaveStudentKeys = (leaveRequest) => {
    const user = leaveRequest?.user_id;
    return [user?._id, user?.userid, user].filter(Boolean).map((value) => String(value));
};

const isDateInLeaveRange = (date, startDate, endDate) => {
    if (!date || !startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
};

const normalizeDateString = (value) => {
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

const getActivityStudentKeys = (activity) => {
    const user = activity?.user_id;
    return [user?._id, user?.userid, user?.id, user].filter(Boolean).map((value) => String(value));
};

const isDateInActivityRange = (date, startDate, endDate) => {
    if (!date || !startDate || !endDate) return false;
    const start = normalizeDateString(startDate);
    const end = normalizeDateString(endDate);
    if (!start || !end) return false;
    return date >= start && date <= end;
};

const mapDailyStatus = async (studentList, roleType = 'student') => {
    if (!selectedDate.value) {
        attendanceData.value = {};
        pendingLeaveApprovals.value = {};
        return;
    }

    if (roleType === 'student' && (!selectedGrade.value || !selectedClassroom.value)) {
        attendanceData.value = {};
        pendingLeaveApprovals.value = {};
        return;
    }

    if (roleType === 'teacher' && !selectedDepartment.value) {
    }

    const studentKeys = new Set();
    studentList.forEach((student) => {
        [student?._id, student?.userid, student?.id].filter(Boolean).forEach((value) => {
            studentKeys.add(String(value));
        });
    });

    let attendanceParams = {
        start: selectedDate.value,
        end: selectedDate.value,
        role: roleType,
        name: '',
        department: '',
        userid: '',
        page: 1,
        limit: 50,
    };

    if (roleType === 'student') {
        attendanceParams.grade = selectedGrade.value;
        attendanceParams.classroom = selectedClassroom.value;
    } else {
        attendanceParams.department = selectedDepartment.value;
    }

    const activityFilters = {
        limit: 500,
        page: 1,
    };

    if (roleType === 'student') {
        activityFilters.grade = selectedGrade.value;
        activityFilters.classroom = selectedClassroom.value;
    }

    const [attendanceResponse, leaveResponse, activityResponse] = await Promise.all([
        reportApi.getAttendanceReport(attendanceParams),
        leaveService.getLeaveRequests({
            start_date: selectedDate.value,
            end_date: selectedDate.value,
            status: '',
            user_id: '',
        }),
        activityService.getActivities(selectedDate.value, selectedDate.value, activityFilters),
    ]);

    const attendanceRows = attendanceResponse?.data || [];
    const leaveRows = leaveResponse?.data || [];
    const activityRows = activityResponse?.data || [];
    const attendanceStatusByKey = new Map();
    const leaveByStudentKey = new Map();
    const activityByStudentKey = new Map();
    const lateCutoffSeconds = parseTimeToSeconds(getLateCutoffTime(roleType)) ?? parseTimeToSeconds(DEFAULT_LATE_CUTOFF_TIME);

    attendanceRows.forEach((student) => {
        const firstAttendanceSeconds = getFirstAttendanceSeconds(student, selectedDate.value);
        if (firstAttendanceSeconds === null) {
            return;
        }

        const attendanceKeys = [student?._id, student?.userid, student?.id]
            .filter(Boolean)
            .map((value) => String(value));

        if (!attendanceKeys.some((key) => studentKeys.has(key))) {
            return;
        }

        const status = firstAttendanceSeconds > lateCutoffSeconds ? 'late' : 'present';
        attendanceKeys.forEach((key) => {
            attendanceStatusByKey.set(key, status);
        });
    });

    leaveRows.forEach((leaveRequest) => {
        const status = String(leaveRequest?.status || '').toLowerCase();
        if (!approvedLeaveStatuses.has(status) && !pendingLeaveStatuses.has(status)) {
            return;
        }

        if (!isDateInLeaveRange(selectedDate.value, leaveRequest?.start_date, leaveRequest?.end_date)) {
            return;
        }

        getLeaveStudentKeys(leaveRequest).forEach((key) => {
            const currentLeave = leaveByStudentKey.get(key);
            const currentPriority = leaveStatusPriority[String(currentLeave?.status || '').toLowerCase()] || 0;
            const nextPriority = leaveStatusPriority[status] || 0;

            if (!currentLeave || nextPriority >= currentPriority) {
                leaveByStudentKey.set(key, leaveRequest);
            }
        });
    });

    activityRows.forEach((activity) => {
        if (!isDateInActivityRange(selectedDate.value, activity?.activity_date_start, activity?.activity_date_end)) {
            return;
        }

        getActivityStudentKeys(activity).forEach((key) => {
            if (!activityByStudentKey.has(key)) {
                activityByStudentKey.set(key, activity);
            }
        });
    });

    const nextAttendanceData = {};
    const nextPendingLeaveApprovals = {};

    studentList.forEach((student) => {
        const keys = [student?._id, student?.userid, student?.id].filter(Boolean).map((value) => String(value));
        const activity = keys.map((key) => activityByStudentKey.get(key)).find(Boolean);
        const previousActivity = activity
            ? {
                activityId: activity?._id || null,
                activityName: activity?.activity_name || 'มีกิจกรรม',
                activityDateStart: normalizeDateString(activity?.activity_date_start),
                activityDateEnd: normalizeDateString(activity?.activity_date_end),
                startTime: activity?.start_time || '',
                endTime: activity?.end_time || '',
                location: activity?.location || '',
                remark: activity?.remark || '',
            }
            : null;

        const leaveRequest = keys.map((key) => leaveByStudentKey.get(key)).find(Boolean);
        if (leaveRequest) {
            const leaveStatus = String(leaveRequest?.status || '').toLowerCase();
            const leaveTypeName = leaveRequest?.leave_type_id?.name || 'ลา';
            const reason = leaveRequest?.reason || '';
            const startDate = normalizeDateString(leaveRequest?.start_date);
            const endDate = normalizeDateString(leaveRequest?.end_date || leaveRequest?.start_date);
            const startTime = leaveRequest?.start_time || '';
            const endTime = leaveRequest?.end_time || '';

            nextAttendanceData[student._id] = {
                status: 'leave',
                leaveType: leaveTypeName,
                leaveTypeId: leaveRequest?.leave_type_id?._id || leaveRequest?.leave_type_id || '',
                remark: reason,
                leaveRequestId: leaveRequest?._id || null,
                startDate,
                endDate,
                startTime,
                endTime,
                leaveStatus,
                previousActivity,
            };

            if (pendingLeaveStatuses.has(leaveStatus)) {
                nextPendingLeaveApprovals[student._id] = {
                    requestId: leaveRequest?._id || null,
                    leaveType: leaveTypeName,
                    leaveTypeId: leaveRequest?.leave_type_id?._id || leaveRequest?.leave_type_id || '',
                    startDate,
                    endDate,
                    startTime,
                    endTime,
                    reason,
                    previousActivity,
                };
            }
            return;
        }

        if (activity) {
            nextAttendanceData[student._id] = {
                status: 'activity',
                activityId: activity?._id || null,
                activityName: activity?.activity_name || 'มีกิจกรรม',
                activityDateStart: normalizeDateString(activity?.activity_date_start),
                activityDateEnd: normalizeDateString(activity?.activity_date_end),
                startTime: activity?.start_time || '',
                endTime: activity?.end_time || '',
                location: activity?.location || '',
                remark: activity?.remark || '',
            };
            return;
        }

        const attendanceStatus = keys.map((key) => attendanceStatusByKey.get(key)).find(Boolean);
        if (attendanceStatus) {
            nextAttendanceData[student._id] = {
                status: attendanceStatus,
                leaveType: null,
                remark: '',
            };
        }
    });

    attendanceData.value = nextAttendanceData;
    pendingLeaveApprovals.value = nextPendingLeaveApprovals;
};

const loadUsers = async () => {
    if (selectedRole.value === 'student') {
        if (residentRole === 'teacher') {
            selectedGrade.value = teacherGrade;
            selectedClassroom.value = teacherClassroom;
        }

        if (!selectedClassroom.value) {
            students.value = [];
            attendanceData.value = {};
            pendingLeaveApprovals.value = {};
            return;
        }

        loading.value = true;
        try {
            const response = await studentService.getStudents(selectedGrade.value, selectedClassroom.value);
            const studentList = response.data || [];
            allStudents.value = studentList;
            students.value = studentList;
            await mapDailyStatus(studentList, 'student');
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ไม่สามารถโหลดรายชื่อนักเรียนได้', 'error');
            console.error('Load students error:', error);
        } finally {
            loading.value = false;
        }
    } else {
        loading.value = true;
        try {
            const response = await teacherService.getTeachers('', selectedDepartment.value);
            const teacherList = response.data || [];
            allStudents.value = teacherList;
            students.value = teacherList;
            await mapDailyStatus(teacherList, 'teacher');
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', error?.response?.data?.error || error?.message || 'ไม่สามารถโหลดรายชื่อครูได้', 'error');
            console.error('Load teachers error:', error);
        } finally {
            loading.value = false;
        }
    }
};

onMounted(() => {
    selectedDate.value = new Date().toISOString().split('T')[0];
    loadAllowanceSetting();
    loadClassrooms();
    loadDepartmentsAndPositions();

    if (residentRole === 'teacher') {
        selectedRole.value = 'student';
        loadUsers();
    }
});
</script>
