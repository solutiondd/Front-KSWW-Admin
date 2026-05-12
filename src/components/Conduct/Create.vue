<template>
    <div class="conduct-form-container max-w-full">
        <h2 class="form-title">บันทึกพฤติกรรม</h2>
        <form @submit.prevent="handleSubmit" class="conduct-form">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label"><span class="icon">🔎</span> รหัสนักเรียน</label>
                    <div class="input-wrapper">
                        <input v-model="searchStudentIdText" @input="searchStudentById" placeholder="รหัสนักเรียน"
                            class="input input-bordered" ref="studentIdInput" @focus="studentIdDropdownOpen = true"
                            @blur="handleStudentIdBlur" />
                        <teleport to="body">
                            <div v-if="studentIdResults.length && studentIdDropdownOpen"
                                :style="dropdownPosition('studentId')" class="dropdown-list">
                                <div v-for="student in studentIdResults" :key="student._id"
                                    @mousedown.prevent="selectStudentId(student)" class="dropdown-item">
                                    <span class=""></span> ({{ student.userid }}) {{ student.name }}
                                </div>
                            </div>
                        </teleport>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><span class="icon">👤</span> ชื่อนักเรียน</label>
                    <div class="input-wrapper">
                        <input v-model="searchStudentNameText" @input="searchStudentByName" placeholder="ชื่อนักเรียน"
                            class="input input-bordered" ref="studentNameInput" @focus="studentNameDropdownOpen = true"
                            @blur="handleStudentNameBlur" />
                        <teleport to="body">
                            <div v-if="studentNameResults.length && studentNameDropdownOpen"
                                :style="dropdownPosition('studentName')" class="dropdown-list">
                                <div v-for="student in studentNameResults" :key="student._id"
                                    @mousedown.prevent="selectStudentName(student)" class="dropdown-item">
                                    <span class=""></span> ({{ student.userid }}) {{ student.name }}
                                </div>
                            </div>
                        </teleport>
                    </div>
                </div>
            </div>

            <div class="form-row" v-if="selectedStudent">
                <div class="form-group">
                    <label class="form-label"><span class="icon">📂</span> ประเภทพฤติกรรม</label>
                    <div class="input-wrapper">
                        <input v-model="searchTypeText" @input="searchType" placeholder="ค้นหาหรือเลือกประเภท"
                            class="input input-bordered" ref="typeInput" @focus="handleTypeFocus"
                            @blur="handleTypeBlur" />
                        <teleport to="body">
                            <div v-if="typeResults.length && typeDropdownOpen" :style="dropdownPosition('type')"
                                class="dropdown-list">
                                <div v-for="type in typeResults" :key="type._id" @mousedown.prevent="selectType(type)"
                                    class="dropdown-item"
                                    :class="selectedType && selectedType._id === type._id ? 'dropdown-item-selected' : ''">
                                    <span class=""></span> {{ type.name }}
                                </div>
                            </div>
                        </teleport>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><span class="icon">📝</span> รายการพฤติกรรม</label>
                    <div class="input-wrapper">
                        <input v-model="searchBehaviorText" @input="searchBehavior" placeholder="ค้นหาหรือเลือกรายการ"
                            class="input input-bordered" ref="behaviorInput" @focus="behaviorDropdownOpen = true"
                            @blur="handleBehaviorBlur" />
                        <teleport to="body">
                            <div v-if="behaviorResults.length && behaviorDropdownOpen"
                                :style="dropdownPosition('behavior')" class="dropdown-list">
                                <div v-for="behavior in behaviorResults" :key="behavior._id || behavior.name"
                                    @mousedown.prevent="selectBehavior(behavior)" class="dropdown-item">
                                    <span class=""></span> {{ behavior.name }}
                                </div>
                            </div>
                        </teleport>
                    </div>
                </div>
            </div>

            <div class="form-row" v-if="selectedType && (selectedType.name === 'บำเพ็ญประโยชน์' || selectedBehavior)">
                <div v-if="showLevel" class="form-group">
                    <label class="form-label"><span class="icon">🏷️</span> ระดับ</label>
                    <div class="input-wrapper">
                        <input v-model="searchLevelText" @input="searchLevel" placeholder="ค้นหาหรือเลือกระดับ"
                            class="input input-bordered" ref="levelInput" @focus="levelDropdownOpen = true"
                            @blur="handleLevelBlur" />
                        <teleport to="body">
                            <div v-if="levelResults.length && levelDropdownOpen" :style="dropdownPosition('level')"
                                class="dropdown-list">
                                <div v-for="level in levelResults" :key="level._id"
                                    @mousedown.prevent="selectLevel(level)" class="dropdown-item">
                                    <span class="icon"></span> {{ level.level }} : {{ level.name }}
                                </div>
                            </div>
                        </teleport>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><span class="icon">💬</span> รายละเอียด</label>
                    <div class="input-wrapper">
                        <template v-if="selectedType && selectedType.name !== 'บำเพ็ญประโยชน์'">
                            <input v-model="form.description" @input="searchDescription"
                                placeholder="ค้นหาหรือเลือกรายละเอียด" class="input input-bordered"
                                ref="descriptionInput" @focus="handleDescriptionFocus" @blur="handleDescriptionBlur" />
                            <teleport to="body">
                                <div v-if="descriptionResults.length && descriptionDropdownOpen"
                                    :style="dropdownPosition('description')" class="dropdown-list">
                                    <div v-for="description in descriptionResults" :key="description._id"
                                        @mousedown.prevent="selectDescription(description)" class="dropdown-item">
                                        <span class="icon"></span> {{ description.name }}
                                    </div>
                                </div>
                            </teleport>
                        </template>
                        <input v-else v-model="form.description" placeholder="รายละเอียด"
                            class="input input-bordered" />
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label"><span class="icon">⭐</span> คะแนน</label>
                    <div class="input-wrapper">
                        <input v-model="form.score" type="number" class="input input-bordered"
                            @input="handleScoreInput" />
                    </div>
                </div>
            </div>
            <div class="flex justify-end max-w-full">
                <button type="submit" class="btn-submit">บันทึก</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { StudentService } from '../../api/student.js'
import { ConductService } from '../../api/conduct.js'
import { BehaviorService } from '../../api/behavior.js'
import { MeritService } from '../../api/merit.js'
import Swal from 'sweetalert2'

const typeInput = ref(null);
const studentService = new StudentService()
const conductService = new ConductService()
const behaviorService = new BehaviorService()
const meritService = new MeritService()
const emit = defineEmits(['student-selected', 'conduct-saved'])
const searchStudentIdText = ref('')
const searchStudentNameText = ref('')
const studentIdResults = ref([])
const studentNameResults = ref([])
const selectedStudent = ref(null)

const searchTypeText = ref('')
const typeResults = ref([])
const selectedType = ref(null)

const searchBehaviorText = ref('')
const behaviorResults = ref([])
const allBehaviorResults = ref([])
const selectedBehavior = ref(null)

const searchLevelText = ref('')
const levelResults = ref([])
const allLevelResults = ref([])
const selectedLevel = ref(null)
const descriptionResults = ref([])
const behaviorInput = ref(null);

const levelInput = ref(null);
const studentIdInput = ref(null);
const studentNameInput = ref(null);
const descriptionInput = ref(null);

const props = defineProps({
    preselectedStudent: {
        type: Object,
        default: null,
    },
})

const form = ref({
    description: '',
    score: '',
})
const showLevel = ref(false)

let behaviorDropdownOpen = ref(false);
let levelDropdownOpen = ref(false);
let studentIdDropdownOpen = ref(false);
let studentNameDropdownOpen = ref(false);
let typeDropdownOpen = ref(false)
let descriptionDropdownOpen = ref(false)

function handleBehaviorBlur() {
    setTimeout(() => {
        behaviorDropdownOpen.value = false;
    }, 100);
}

function handleLevelBlur() {
    setTimeout(() => {
        levelDropdownOpen.value = false;
    }, 100);
}

function handleDescriptionFocus() {
    if (selectedType.value && selectedType.value.name !== 'บำเพ็ญประโยชน์') {
        descriptionDropdownOpen.value = true;
        searchDescription();
    }
}

function handleDescriptionBlur() {
    setTimeout(() => {
        descriptionDropdownOpen.value = false;
    }, 100);
}

function handleStudentIdBlur() {
    setTimeout(() => {
        studentIdDropdownOpen.value = false;
    }, 100);
}

function handleStudentNameBlur() {
    setTimeout(() => {
        studentNameDropdownOpen.value = false;
    }, 100);
}

function handleTypeFocus() {
    typeDropdownOpen.value = true;
    searchType();
}

function handleTypeBlur() {
    setTimeout(() => {
        typeDropdownOpen.value = false;
    }, 100);
}

function dropdownPosition(type) {
    let refEl = null;
    if (type === 'type') refEl = typeInput.value;
    if (type === 'studentId') refEl = studentIdInput.value;
    if (type === 'studentName') refEl = studentNameInput.value;
    if (type === 'behavior') refEl = behaviorInput.value;
    if (type === 'level') refEl = levelInput.value;
    if (type === 'description') refEl = descriptionInput.value;
    if (!refEl) return 'position: absolute; width: 100%; left: 0; top: 0;';
    const rect = refEl.getBoundingClientRect();
    return `position: absolute; left: ${rect.left + window.scrollX}px; top: ${rect.bottom + window.scrollY}px; width: ${rect.width}px;`;
}

async function searchStudentById() {
    const name = '';
    const userid = searchStudentIdText.value ? String(searchStudentIdText.value) : '';
    if (!userid) {
        studentIdResults.value = [];
        return;
    }
    try {
        const res = await studentService.searchStudent({ name, userid });
        studentIdResults.value = res.data || [];
    } catch (e) {
        studentIdResults.value = [];
        Swal.fire('เกิดข้อผิดพลาด', e.message || 'ค้นหานักเรียนไม่สำเร็จ', 'error');
    }
}

async function searchStudentByName() {
    const name = searchStudentNameText.value ? String(searchStudentNameText.value) : '';
    const userid = '';
    if (!name) {
        studentNameResults.value = [];
        return;
    }
    try {
        const res = await studentService.searchStudent({ name, userid });
        studentNameResults.value = res.data || [];
    } catch (e) {
        studentNameResults.value = [];
        Swal.fire('เกิดข้อผิดพลาด', e.message || 'ค้นหานักเรียนไม่สำเร็จ', 'error');
    }
}

function selectStudentId(student) {
    searchStudentIdText.value = student.userid || '';
    searchStudentNameText.value = student.name || '';
    selectedStudent.value = student;
    studentIdResults.value = [];
    emit('student-selected', student._id)
}

function selectStudentName(student) {
    searchStudentIdText.value = student.userid || '';
    searchStudentNameText.value = student.name || '';
    selectedStudent.value = student;
    studentNameResults.value = [];
    emit('student-selected', student._id)
}

function applyPreselectedStudent(student) {
    if (!student || !student._id) return
    searchStudentIdText.value = student.userid || ''
    searchStudentNameText.value = student.name || ''
    selectedStudent.value = student
    studentIdResults.value = []
    studentNameResults.value = []
    emit('student-selected', student._id)
}

watch(() => props.preselectedStudent, (student) => {
    applyPreselectedStudent(student)
}, { immediate: true })

async function searchType() {
    const res = await behaviorService.getBehaviortypes();
    let types = res.data || [];
    if (!types.some(t => t.name === 'บำเพ็ญประโยชน์')) {
        types.unshift({ _id: 'merit', name: 'บำเพ็ญประโยชน์' });
    }
    typeResults.value = types.filter(type => type.name.includes(searchTypeText.value));
}

function selectType(type) {
    selectedType.value = type;
    searchTypeText.value = type.name;
    typeResults.value = [];
    searchBehaviorText.value = '';
    selectedBehavior.value = null;
    behaviorResults.value = [];
    allBehaviorResults.value = [];
    searchLevelText.value = '';
    selectedLevel.value = null;
    levelResults.value = [];
    allLevelResults.value = [];
    descriptionResults.value = [];
    descriptionDropdownOpen.value = false;
    form.value.description = '';
    form.value.score = '';

    if (type.name === 'บำเพ็ญประโยชน์') {
        showLevel.value = false;
        loadMeritTypes();
    } else {
        showLevel.value = true;
        loadBehaviorsByType(type._id);
    }
}

async function loadMeritTypes() {
    const res = await meritService.getMeritTypes()
    allBehaviorResults.value = res.data || []
    behaviorResults.value = [...allBehaviorResults.value]
}

async function loadBehaviorsByType(typeId) {
    const res = await behaviorService.getBehaviorsByType(typeId)
    allBehaviorResults.value = res.data || []
    behaviorResults.value = [...allBehaviorResults.value]
}

async function searchBehavior() {
    const q = (searchBehaviorText.value || '').trim().toLowerCase()
    behaviorResults.value = !q
        ? [...allBehaviorResults.value]
        : allBehaviorResults.value.filter(
            b => (b.name || '').toLowerCase().includes(q)
        )
}

function selectBehavior(behavior) {
    selectedBehavior.value = behavior;
    searchBehaviorText.value = behavior.name;
    behaviorResults.value = [];
    behaviorDropdownOpen.value = false;
    if (selectedType.value && selectedType.value.name === 'บำเพ็ญประโยชน์') {
        form.value.score = behavior.score;
        form.value.description = '';
        selectedLevel.value = { level: 1 };
    } else {
        loadLevelsByBehavior(behavior._id);
    }
}

async function loadLevelsByBehavior(behaviorId) {
    const res = await behaviorService.getBehaviorLevelsByBehaviorId(behaviorId)
    allLevelResults.value = res.data || []
    levelResults.value = [...allLevelResults.value]
    descriptionResults.value = [...allLevelResults.value]
}

async function searchLevel() {
    const q = (searchLevelText.value || '').trim().toLowerCase()
    levelResults.value = !q
        ? [...allLevelResults.value]
        : allLevelResults.value.filter(
            l => `${l.level} ${l.name || ''}`.toLowerCase().includes(q)
        )
}

function searchDescription() {
    const q = (form.value.description || '').trim().toLowerCase()
    descriptionResults.value = !q
        ? [...allLevelResults.value]
        : allLevelResults.value.filter(
            level => (level.name || '').toLowerCase().includes(q)
        )
}

function applyLevelSelection(level) {
    selectedLevel.value = level;
    searchLevelText.value = String(level.level ?? '');
    form.value.description = level.name || '';
    descriptionResults.value = [];
    descriptionDropdownOpen.value = false;
    if (selectedType.value && selectedType.value.name !== 'บำเพ็ญประโยชน์') {
        form.value.score = `-${level.score}`;
    } else {
        form.value.score = level.score;
    }
}

function normalizeScoreByType(rawScore) {
    if (rawScore === '' || rawScore === null || rawScore === undefined) return ''
    const parsed = Number(rawScore)
    if (!Number.isFinite(parsed)) return ''

    if (selectedType.value && selectedType.value.name !== 'บำเพ็ญประโยชน์') {
        return String(-Math.abs(parsed))
    }

    return String(Math.abs(parsed))
}

function handleScoreInput() {
    const normalized = normalizeScoreByType(form.value.score)
    if (normalized !== '') {
        form.value.score = normalized
    }
}

function selectLevel(level) {
    levelResults.value = [];
    levelDropdownOpen.value = false;
    applyLevelSelection(level);
}

function selectDescription(level) {
    applyLevelSelection(level);
}

async function handleSubmit() {
    if (!selectedStudent.value || !selectedType.value) {
        Swal.fire('กรุณากรอกข้อมูลให้ครบ', '', 'warning')
        return
    }

    if (selectedType.value.name !== 'บำเพ็ญประโยชน์' && !selectedBehavior.value) {
        Swal.fire('กรุณากรอกข้อมูลให้ครบ', '', 'warning')
        return
    }

    if (selectedType.value.name === 'บำเพ็ญประโยชน์') {
        if (!selectedBehavior.value && !(form.value.description || '').trim()) {
            Swal.fire('กรุณากรอกข้อมูลให้ครบ', '', 'warning')
            return
        }
    }

    const description = String(form.value.description || '').trim() || '-'
    const normalizedScore = normalizeScoreByType(form.value.score)
    if (normalizedScore === '') {
        Swal.fire('กรุณากรอกคะแนนให้ถูกต้อง', '', 'warning')
        return
    }

    const payload = {
        student_id: selectedStudent.value._id,
        behavior_type: selectedType.value.name,
        behavior: selectedBehavior.value?.name || form.value.description || 'บำเพ็ญประโยชน์',
        behavior_level: selectedLevel.value ? selectedLevel.value.level : 1,
        description,
        score: Number(normalizedScore),
    }
    try {
        await conductService.createConduct(payload)
        emit('conduct-saved', payload.student_id)
        Swal.fire('บันทึกสำเร็จ', '', 'success')
        searchStudentIdText.value = ''
        searchStudentNameText.value = ''
        selectedStudent.value = null
        searchTypeText.value = ''
        selectedType.value = null
        searchBehaviorText.value = ''
        selectedBehavior.value = null
        searchLevelText.value = ''
        selectedLevel.value = null
        descriptionResults.value = []
        descriptionDropdownOpen.value = false
        form.value = { description: '', score: '' }
    } catch (e) {
        const errDetail = e?.response?.data?.error || ''
        if (errDetail === 'teacher give score reached limit of 10') {
            Swal.fire('ไม่สามารถบันทึกได้', 'ครูให้คะแนนบวกได้ไม่เกิน 10 คะแนน', 'warning')
        } else if (errDetail === 'max teacher give score is 10') {
            Swal.fire('คะแนนเกินกำหนด', 'คะแนนบวกสูงสุดที่ให้ได้คือ 10 คะแนน', 'warning')
        } else {
            const errorMessage = e?.response?.data?.message || e.message || 'บันทึกไม่สำเร็จ'
            Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error')
        }
    }
}
</script>

<style scoped>
.form-row {
    display: flex;
    gap: 18px;
    margin-bottom: 0px;
}

.form-row>.form-group {
    flex: 1;
}

.conduct-form-container {
    padding: 32px 24px;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid #e0e0e0;
}

.form-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 24px;
    text-align: center;
    color: #1e293b;
}

.conduct-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-weight: 500;
    color: #334155;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.input-wrapper {
    position: relative;
}

.input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #fff;
    font-size: 1rem;
    transition: border-color 0.2s;
    margin-bottom: 0;
}

.input:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 2px #3b82f633;
}

.btn-submit {
    padding: 10px;
    background: #3b82f6;
    color: #fff;
    border-radius: 12px;
    transition: background 0.2s, box-shadow 0.2s;
}

.btn-submit:hover {
    background: #2563eb;
    box-shadow: 0 4px 16px #3b82f655;
}

.dropdown-list {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 9999;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
    border: 1px solid #cbd5e1;
    padding: 4px 0;
}

.dropdown-item {
    padding: 10px 18px;
    cursor: pointer;
    font-size: 1rem;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, color 0.15s;
}

.dropdown-item:hover {
    background: #e0e7ff;
    color: #1e293b;
}

.dropdown-item-selected {
    background: #bae6fd;
    color: #2563eb;
}

.icon {
    font-size: 1.1em;
    vertical-align: middle;
}

@media (max-width: 900px) {
    .form-row {
        flex-direction: column;
        gap: 10px;
    }

    .form-title {
        font-size: 1.1rem;
    }
}
</style>
