<template>
    <div class="max-[570px]:pt-16">
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
                    <div v-if="residentRole !== 'teacher'" class="w-full">
                        <label class="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                        <select v-model="selectedRole" class="select select-bordered w-full" @change="handleRoleChange">
                            <option value="student">นักเรียน</option>
                            <option value="teacher">ครู</option>
                        </select>
                    </div>
                    <template v-if="selectedRole === 'student'">
                        <div v-if="residentRole !== 'teacher'" class="w-full">
                            <label class="block text-sm font-medium text-gray-700 mb-2">ชั้นเรียน</label>
                            <select v-model="selectedGrade" class="select select-bordered w-full"
                                @change="handleGradeChange">
                                <option value="">เลือกชั้นเรียน</option>
                                <option v-for="grade in gradeList" :key="grade" :value="grade">
                                    {{ grade }}
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
                                <span>{{ teacherGrade }}/{{ teacherClassroom }}</span>
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
                :loading="loading" :attendanceData="attendanceData" :pendingLeaveApprovals="pendingLeaveApprovals"
                :selectedRole="selectedRole" @update:attendanceData="attendanceData = $event"
                @update:pendingLeaveApprovals="pendingLeaveApprovals = $event" />
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
import CheckNameTable from '../../components/CheckName/Table.vue';
import featureFlags from '../../config/featureFlags';
import Swal from 'sweetalert2';

const studentService = new StudentService();
const teacherService = new TeacherService();
const classRoomService = new ClassRoomService();
const departmentService = new DepartmentService();
const positionService = new PositionService();
const leaveService = new LeaveService();
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

const approvedLeaveStatuses = new Set(['approved']);
const pendingLeaveStatuses = new Set(['pending']);
const leaveStatusPriority = {
    approved: 2,
    pending: 1,
};

const gradeList = computed(() => {
    const grades = new Set(classrooms.value.map(c => c.grade));
    return Array.from(grades).sort((a, b) => {
        const numA = parseInt(a.split('.')[1]);
        const numB = parseInt(b.split('.')[1]);
        return numA - numB;
    });
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
            const grades = Array.from(new Set(classrooms.value.map(c => c.grade))).sort((a, b) => {
                const numA = parseInt(a.split('.')[1]);
                const numB = parseInt(b.split('.')[1]);
                return numA - numB;
            });
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
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อห้องเรียนได้', 'error');
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
        if (!q) {
            students.value = allStudents.value;
            return;
        }
        if (residentRole !== 'teacher' && selectedRole.value === 'student') {
            loading.value = true;
            try {
                const isNumeric = /^\d+$/.test(q);
                const response = await studentService.searchStudent({
                    name: isNumeric ? '' : q,
                    userid: isNumeric ? q : '',
                });
                const result = response.data || [];
                students.value = result;
                await mapDailyStatus(result, 'student');
            } catch (error) {
                console.error('Search student error:', error);
            } finally {
                loading.value = false;
            }
        } else {
            const lower = q.toLowerCase();
            students.value = allStudents.value.filter(s => {
                const name = [s.pre_name, s.first_name, s.last_name, s.name].filter(Boolean).join(' ').toLowerCase();
                const userid = String(s.userid || '').toLowerCase();
                return name.includes(lower) || userid.includes(lower);
            });
        }
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
        const grades = Array.from(new Set(classrooms.value.map(c => c.grade))).sort((a, b) => {
            const numA = parseInt(a.split('.')[1]);
            const numB = parseInt(b.split('.')[1]);
            return numA - numB;
        });
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

const hasAttendanceOnDate = (student, date) => {
    const attendances = student?.attendances || [];
    return attendances.some((attendance) => {
        if (attendance?.date !== date) {
            return false;
        }

        if (!Array.isArray(attendance?.timeStamps) || attendance.timeStamps.length === 0) {
            return false;
        }

        if (featureFlags.checkName.presentMode === 'any_timestamp') {
            return attendance.timeStamps.length > 0;
        }

        return attendance.timeStamps.some(
            (timeStamp) => timeStamp?.usecase === 'person_confirmation'
        );
    });
};

const getLeaveStudentKeys = (leaveRequest) => {
    const user = leaveRequest?.user_id;
    return [user?._id, user?.userid, user].filter(Boolean).map((value) => String(value));
};

const isDateInLeaveRange = (date, startDate, endDate) => {
    if (!date || !startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
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

    const [attendanceResponse, leaveResponse] = await Promise.all([
        reportApi.getAttendanceReport(attendanceParams),
        leaveService.getLeaveRequests({
            start_date: selectedDate.value,
            end_date: selectedDate.value,
            status: '',
            user_id: '',
        }),
    ]);

    const attendanceRows = attendanceResponse?.data || [];
    const leaveRows = leaveResponse?.data || [];
    const presentKeys = new Set();
    const leaveByStudentKey = new Map();

    attendanceRows.forEach((student) => {
        if (!hasAttendanceOnDate(student, selectedDate.value)) {
            return;
        }

        const attendanceKeys = [student?._id, student?.userid, student?.id]
            .filter(Boolean)
            .map((value) => String(value));

        if (!attendanceKeys.some((key) => studentKeys.has(key))) {
            return;
        }

        attendanceKeys.forEach((key) => {
            presentKeys.add(key);
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

    const nextAttendanceData = {};
    const nextPendingLeaveApprovals = {};

    studentList.forEach((student) => {
        const keys = [student?._id, student?.userid, student?.id].filter(Boolean).map((value) => String(value));
        const isPresent = keys.some((key) => presentKeys.has(key));

        if (isPresent) {
            nextAttendanceData[student._id] = {
                status: 'present',
                leaveType: null,
                remark: '',
            };
            return;
        }

        const leaveRequest = keys.map((key) => leaveByStudentKey.get(key)).find(Boolean);
        if (!leaveRequest) {
            return;
        }

        const leaveStatus = String(leaveRequest?.status || '').toLowerCase();
        const leaveTypeName = leaveRequest?.leave_type_id?.name || 'ลา';
        const reason = leaveRequest?.reason || '';

        nextAttendanceData[student._id] = {
            status: 'leave',
            leaveType: leaveTypeName,
            remark: reason,
            leaveRequestId: leaveRequest?._id || null,
            leaveStatus,
        };

        if (pendingLeaveStatuses.has(leaveStatus)) {
            nextPendingLeaveApprovals[student._id] = {
                requestId: leaveRequest?._id || null,
                leaveType: leaveTypeName,
                reason,
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
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อนักเรียนได้', 'error');
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
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อครูได้', 'error');
            console.error('Load teachers error:', error);
        } finally {
            loading.value = false;
        }
    }
};

onMounted(() => {
    selectedDate.value = new Date().toISOString().split('T')[0];
    loadClassrooms();
    loadDepartmentsAndPositions();

    if (residentRole === 'teacher') {
        selectedRole.value = 'student';
        loadUsers();
    }
});
</script>
