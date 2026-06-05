<template>
    <div class="max-[944px]:pt-16">
        <div class="w-full bg-white rounded-lg shadow-sm p-6">
            <div class="mb-6">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">เช็คระเบียบการแต่งตัว</h2>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">วันที่</label>
                        <input v-model="selectedDate" type="date" class="input input-bordered input-sm"
                            @change="loadUsers" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 gap-y-3 items-end lg:grid-cols-5 lg:gap-4">
                    <div class="w-full">
                        <label class="block text-sm font-medium text-gray-700 mb-2">ค้นหาชื่อ/รหัส</label>
                        <input v-model="searchQuery" type="text" class="input input-bordered w-full"
                            placeholder="ชื่อหรือรหัส..." @input="handleSearch" />
                    </div>

                    <div class="w-full">
                        <label class="block text-sm font-medium text-gray-700 mb-2">เพศ</label>
                        <select v-model="selectedGender" class="select select-bordered w-full" @change="applyFilters">
                            <option value="">ทั้งหมด</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                        </select>
                    </div>

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
                        <select v-model="selectedClassroom" class="select select-bordered w-full" @change="loadUsers">
                            <option value="">เลือกห้องเรียน</option>
                            <option v-for="classroom in filteredClassrooms" :key="classroom._id"
                                :value="classroom.classroom">
                                {{ classroom.classroom }}
                            </option>
                        </select>
                    </div>

                    <div v-if="residentRole === 'teacher'" class="w-full col-span-1 lg:col-start-5 flex justify-end">
                        <div class="p-2 text-white bg-primary rounded-md text-center min-w-[120px]">
                            <span class="block text-sm font-medium text-secondary">ชั้นปี / ห้อง</span>
                            <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <UniformInspectionTable :students="students" :selectedDate="selectedDate" :selectedGrade="selectedGrade"
                :selectedClassroom="selectedClassroom" :loading="loading" :saving="isSaving"
                :inspectionData="inspectionData" @update:inspectionData="inspectionData = $event"
                @save="saveWholeClassroomInspection" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import Swal from 'sweetalert2';
import { StudentService } from '../../api/student';
import { ClassRoomService } from '../../api/class-room';
import { ConductService } from '../../api/conduct';
import { UniformInspectionService } from '../../api/uniform_inspection';
import UniformInspectionTable from '../../components/Uniform Inspection/Table.vue';
import { mapGradeDisplay, toVisibleSortedGrades } from '../../utils/gradeSystem';

const studentService = new StudentService();
const classRoomService = new ClassRoomService();
const conductService = new ConductService();
const uniformInspectionService = new UniformInspectionService();

const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const students = ref([]);
const allStudents = ref([]);
const classrooms = ref([]);
const loading = ref(false);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const selectedGrade = ref(residentRole === 'teacher' && teacherGrade ? teacherGrade : '');
const selectedClassroom = ref(residentRole === 'teacher' && teacherClassroom ? teacherClassroom : '');
const searchQuery = ref('');
const selectedGender = ref('');
const inspectionData = ref({});
const isSaving = ref(false);
let searchTimer = null;

const malePrefixes = ['นาย', 'เด็กชาย', 'ดช', 'ด.ช', 'mr'];
const femalePrefixes = ['นางสาว', 'นาง', 'เด็กหญิง', 'ดญ', 'ด.ญ', 'mrs', 'ms', 'miss'];

const conductLabelToLevel = {
    'ตักเตือน ลงบันทึก': 1,
    'แจ้ง หรือ เชิญผู้ปกครองรับทราบ': 2,
    'เชิญผู้ปกครองทำ จค.กก.1/1 ครั้งที่ 1': 3,
    'เชิญผู้ปกครองทำ จค.กก.1/1 ครั้งที่ 2': 4,
    'เชิญผู้ปกครองทำทัณฑ์บน': 5,
};

const gradeList = computed(() => {
    return toVisibleSortedGrades(classrooms.value.map(c => c.grade));
});

const filteredClassrooms = computed(() => {
    if (!selectedGrade.value) return [];
    return classrooms.value.filter(c => c.grade === selectedGrade.value);
});

const normalizePrefix = (value) => {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\./g, '')
        .replace(/\s+/g, '');
};

const inferGender = (student) => {
    const preName = normalizePrefix(student?.pre_name);
    const firstToken = normalizePrefix(String(student?.name || '').trim().split(/\s+/)[0]);
    const token = preName || firstToken;
    if (!token) return '';

    if (malePrefixes.includes(token)) return 'male';
    if (femalePrefixes.includes(token)) return 'female';
    return '';
};

const applyFilters = () => {
    const q = searchQuery.value.trim().toLowerCase();
    const gender = selectedGender.value;

    students.value = allStudents.value.filter((s) => {
        const name = [s.pre_name, s.first_name, s.last_name, s.name].filter(Boolean).join(' ').toLowerCase();
        const userid = String(s.userid || '').toLowerCase();
        const matchesQuery = !q || name.includes(q) || userid.includes(q);
        const matchesGender = !gender || inferGender(s) === gender;
        return matchesQuery && matchesGender;
    });
};

const loadClassrooms = async () => {
    try {
        const response = await classRoomService.getClassRooms();
        classrooms.value = response.data || [];

        if (residentRole !== 'teacher') {
            const grades = gradeList.value;
            if (!selectedGrade.value && grades.length > 0) {
                selectedGrade.value = grades[0];
            }

            if (!selectedClassroom.value && selectedGrade.value) {
                const firstClassroom = classrooms.value.find(c => c.grade === selectedGrade.value);
                if (firstClassroom) {
                    selectedClassroom.value = firstClassroom.classroom;
                }
            }
        }
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อห้องเรียนได้', 'error');
        console.error('Load classrooms error:', error);
    }
};

const loadUsers = async () => {
    if (residentRole === 'teacher') {
        selectedGrade.value = teacherGrade;
        selectedClassroom.value = teacherClassroom;
    }

    if (!selectedGrade.value || !selectedClassroom.value) {
        students.value = [];
        allStudents.value = [];
        inspectionData.value = {};
        return;
    }

    loading.value = true;
    try {
        const response = await studentService.getStudents(selectedGrade.value, selectedClassroom.value);
        const studentList = response.data || [];
        allStudents.value = studentList;
        inspectionData.value = {};
        applyFilters();
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อนักเรียนได้', 'error');
        console.error('Load students error:', error);
    } finally {
        loading.value = false;
    }
};

const handleGradeChange = () => {
    selectedClassroom.value = '';
    searchQuery.value = '';
    students.value = [];
    allStudents.value = [];
    inspectionData.value = {};
};

const handleSearch = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        applyFilters();
    }, 300);
};

const normalizeClassroom = (value) => {
    if (value === '' || value === null || value === undefined) return value;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
};

const getStudentIdValue = (studentRef) => {
    return studentRef && typeof studentRef === 'object' ? studentRef._id : studentRef;
};

const getStudentNameValue = (studentRef) => {
    if (!studentRef || typeof studentRef !== 'object') return '';
    return studentRef.name || '';
};

const getStudentDisplayLabelById = (studentId) => {
    const targetId = String(studentId || '');
    if (!targetId) return '';

    const matched = (allStudents.value || []).find((student) => String(student?._id || '') === targetId);
    if (!matched) return targetId;

    return matched.name || String(matched.userid || targetId);
};

const toLocalDateKey = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const mergeInspectionStudents = (existingStudents, incomingStudents) => {
    const incomingIds = new Set(
        incomingStudents
            .map((item) => String(item?.student_id || ''))
            .filter(Boolean)
    );

    const normalizedExisting = (existingStudents || []).map((item) => {
        const studentId = getStudentIdValue(item?.student_id);
        return {
            student_id: studentId,
            ispass: item?.ispass === true,
            ...(item?.ispass === false
                ? {
                    issues: Array.isArray(item?.issues) ? item.issues : [],
                    remark: item?.remark || '',
                }
                : {}),
        };
    });

    const existingKeep = normalizedExisting.filter((item) => !incomingIds.has(String(item?.student_id || '')));
    return [...existingKeep, ...incomingStudents];
};

const parseConductRemark = (remark) => {
    const text = String(remark || '').trim();
    if (!text) return null;

    const match = text.match(/^(.*?)\s*-\s*(\d+)\s*คะแนน\s*$/u);
    if (!match) return null;

    const label = String(match[1] || '').trim();
    const level = conductLabelToLevel[label];
    if (!level) return null;

    const scoreValue = Number(match[2]);
    if (!Number.isFinite(scoreValue) || scoreValue <= 0) return null;
    const score = -Math.abs(scoreValue);

    return { label, level, score };
};

const createConductForFailedStudents = async (inspectionResponse) => {
    const failedStudents = (inspectionResponse?.data?.students || []).filter((item) => item?.ispass === false);

    if (!failedStudents.length) {
        return { total: 0, failed: 0 };
    }

    const studentsForDeduction = failedStudents
        .map((item) => {
            const conductRule = parseConductRemark(item?.remark);
            if (!conductRule) return null;

            const studentId = item?.student_id?._id || item?.student_id;
            if (!studentId) return null;

            const issuesText = Array.isArray(item?.issues) && item.issues.length
                ? item.issues.join(', ')
                : '';
            const description = issuesText
                ? `${conductRule.label}, ${issuesText}`
                : conductRule.label;

            return {
                studentId,
                behavior_level: conductRule.level,
                score: conductRule.score,
                description,
            };
        })
        .filter(Boolean);

    if (!studentsForDeduction.length) {
        return { total: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
        studentsForDeduction.map((item) => {
            return conductService.createConduct({
                student_id: item.studentId,
                behavior_type: 'หมวดร่างกายและการแต่งกาย',
                behavior: 'ผิดระเบียบเรื่องเครื่องแบบทรงผมและร่างกายตนเอง',
                behavior_level: item.behavior_level,
                description: item.description,
                score: item.score,
            });
        })
    );

    const failedCount = results.filter((result) => result.status === 'rejected').length;
    return {
        total: studentsForDeduction.length,
        failed: failedCount,
    };
};

const deleteOldConductForFailedStudents = async (existingInspection) => {
    const oldFailedStudents = (existingInspection?.students || []).filter((item) => item?.ispass === false);
    if (!oldFailedStudents.length) {
        return { deletedNames: [], deletedCount: 0, failed: 0 };
    }

    const targetDateKey = toLocalDateKey(existingInspection?.date);
    const deletedNames = new Set();
    let deletedCount = 0;
    let failedCount = 0;

    for (const oldItem of oldFailedStudents) {
        const studentId = getStudentIdValue(oldItem?.student_id);
        if (!studentId) continue;

        try {
            const conductResponse = await conductService.getStudentConduct(studentId);
            const conductList = conductResponse?.data || [];
            const toDelete = conductList.filter((conductItem) => {
                const conductDateKey = toLocalDateKey(conductItem?.created_at || conductItem?.createdAt);
                const isSameDate = conductDateKey && targetDateKey && conductDateKey === targetDateKey;
                const isUniformDeduction =
                    conductItem?.behavior_type === 'หมวดร่างกายและการแต่งกาย' &&
                    conductItem?.behavior === 'ผิดระเบียบเรื่องเครื่องแบบทรงผมและร่างกายตนเอง';
                return isSameDate && isUniformDeduction;
            });

            for (const conductItem of toDelete) {
                try {
                    await conductService.deleteConduct(conductItem?._id);
                    deletedCount += 1;
                    const deletedName =
                        getStudentNameValue(oldItem?.student_id) ||
                        getStudentDisplayLabelById(studentId);
                    if (deletedName) {
                        deletedNames.add(deletedName);
                    }
                } catch (error) {
                    failedCount += 1;
                }
            }
        } catch (error) {
            failedCount += 1;
        }
    }

    return {
        deletedNames: Array.from(deletedNames),
        deletedCount,
        failed: failedCount,
    };
};

const saveWholeClassroomInspection = async () => {
    if (!selectedDate.value || !selectedGrade.value || !selectedClassroom.value) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกวันที่ ชั้นเรียน และห้องเรียนก่อนบันทึก', 'warning');
        return;
    }

    if (!students.value.length) {
        Swal.fire('แจ้งเตือน', 'ไม่พบรายชื่อนักเรียนสำหรับการบันทึก', 'warning');
        return;
    }

    const studentsPayload = allStudents.value
        .filter((student) => {
            const status = inspectionData.value?.[student._id]?.ispass;
            return status === true || status === false;
        })
        .map((student) => {
            const entry = inspectionData.value?.[student._id] || {};
            return {
                student_id: student._id,
                ispass: entry.ispass === true,
                ...(entry.ispass === false
                    ? {
                        issues: Array.isArray(entry.issues) ? entry.issues : [],
                        remark: entry.remark || '',
                    }
                    : {}),
            };
        });

    if (!studentsPayload.length) {
        Swal.fire('แจ้งเตือน', 'กรุณาเลือกสถานะนักเรียนอย่างน้อย 1 คนก่อนบันทึก', 'warning');
        return;
    }

    isSaving.value = true;
    try {
        const inspectionResponse = await uniformInspectionService.createUniformInspection({
            date: selectedDate.value,
            grade: selectedGrade.value,
            classroom: normalizeClassroom(selectedClassroom.value),
            students: studentsPayload,
        });

        const conductSummary = await createConductForFailedStudents(inspectionResponse);

        if (conductSummary.total > 0 && conductSummary.failed > 0) {
            Swal.fire(
                'บันทึกสำเร็จบางส่วน',
                `บันทึกการตรวจสำเร็จแล้ว แต่หักคะแนนได้ ${conductSummary.total - conductSummary.failed}/${conductSummary.total} คน`,
                'warning'
            );
        } else {
            Swal.fire('สำเร็จ', 'บันทึกเช็คระเบียบและหักคะแนนเรียบร้อยแล้ว', 'success');
        }

        inspectionData.value = {};
    } catch (error) {
        const isDuplicateInspection = error?.response?.status === 409 && error?.response?.data?.data?._id;
        if (isDuplicateInspection) {
            try {
                const existingInspection = error.response.data.data;
                const mergedStudents = mergeInspectionStudents(existingInspection.students || [], studentsPayload);
                const deleteSummary = await deleteOldConductForFailedStudents(existingInspection);

                const updateResponse = await uniformInspectionService.updateUniformInspection(existingInspection._id, {
                    date: selectedDate.value,
                    grade: selectedGrade.value,
                    classroom: normalizeClassroom(selectedClassroom.value),
                    students: mergedStudents,
                });

                const conductSummary = await createConductForFailedStudents(updateResponse);
                const deletedNamesText = deleteSummary.deletedCount > 0
                    ? `ลบการหักคะแนนเดิม ${deleteSummary.deletedCount} รายการ${deleteSummary.deletedNames.length ? `: ${deleteSummary.deletedNames.join(', ')}` : ''}`
                    : '';
                const resultText = `หักคะแนนใหม่ได้ ${conductSummary.total - conductSummary.failed}/${conductSummary.total} คน`;
                const messageText = [deletedNamesText, resultText].filter(Boolean).join('\n');

                if ((conductSummary.total > 0 && conductSummary.failed > 0) || deleteSummary.failed > 0) {
                    Swal.fire(
                        'อัปเดตสำเร็จบางส่วน',
                        messageText,
                        'warning'
                    );
                } else {
                    const successText = deletedNamesText
                        ? `${deletedNamesText}\nอัปเดตข้อมูลและหักคะแนนใหม่เรียบร้อยแล้ว`
                        : 'อัปเดตข้อมูลและหักคะแนนใหม่เรียบร้อยแล้ว';
                    Swal.fire('สำเร็จ', successText, 'success');
                }

                inspectionData.value = {};
                return;
            } catch (updateError) {
                console.error('Update duplicate uniform inspection error:', updateError);
                Swal.fire('เกิดข้อผิดพลาด', 'อัปเดตข้อมูลซ้ำไม่สำเร็จ', 'error');
                return;
            }
        }

        console.error('Save whole classroom inspection error:', error);
        Swal.fire('เกิดข้อผิดพลาด', 'บันทึกเช็คระเบียบทั้งห้องไม่สำเร็จ', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(async () => {
    await loadClassrooms();
    await loadUsers();
});
</script>
