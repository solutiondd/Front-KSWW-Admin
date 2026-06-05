<template>
    <div class="max-w-full my-7 mx-auto bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-6">
        <div class="mb-3 flex justify-end items-center gap-3 flex-wrap">
            <div v-if="auth.user?.role === 'teacher'" class="flex gap-2 flex-wrap justify-end">
                <span class="score-badge !py-[4px] !px-[10px] bg-emerald-50 text-emerald-700 cursor-help"
                    title="คะแนนที่เพิ่มให้นักเรียนคนนี่">ให้แล้ว +{{
                        teacherGivenScore }}</span>
                <span class="score-badge !py-[4px] !px-[10px] bg-blue-50 text-blue-700 cursor-help"
                    title="คะแนนที่ยังสามารถเพิ่มให้นักเรียนคนนี่ได้">คงเหลือ {{ teacherRemainingScore
                    }}</span>
            </div>
            <ExportDocs v-if="auth.user?.role !== 'teacher'" :studentInfo="studentInfo" :conductList="conductList" />
        </div>
        <div v-if="studentInfo"
            class="bg-gray-100 rounded-[10px] py-[14px] px-[18px] mb-[18px] text-[1.08rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-bold text-[#1e293b] text-[1.15rem] mb-[2px]">{{ studentInfo.name }}</div>
                    <div class="text-[#334155] mb-[2px]">รหัส: {{ studentInfo.userid }}</div>
                    <div class="text-[#334155]">ระดับชั้น: {{ mapGradeDisplay(studentInfo.grade) }} ห้อง {{
                        studentInfo.classroom }}
                    </div>
                </div>
                <div class="flex flex-col items-end min-w-[80px] ml-[24px]">
                    <span class="text-[#64748b] font-medium text-[0.95rem] mb-[2px]">คะแนน</span>
                    <span class="font-bold text-[#2563eb] text-[1.35rem]">{{ studentInfo.score }}</span>
                    <div class="flex gap-2 mt-[6px] flex-wrap justify-end">
                        <span class="score-badge badge-deduct">หัก {{ totalDeducted }}</span>
                        <span class="score-badge badge-add">เพิ่ม +{{ totalAdded }}</span>
                        <span class="score-badge badge-net">สุทธิ {{ totalNet >= 0 ? '+' : '' }}{{ totalNet }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="loading" class="flex items-center justify-center text-[#3b82f6] text-[1.1rem] m-4">กำลังโหลดข้อมูล...
        </div>
        <div v-else>
            <table class="conduct-table">
                <thead>
                    <tr>
                        <th>ประเภท</th>
                        <th>รายการ</th>
                        <th>หัก</th>
                        <th>เพิ่ม</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedList" :key="item._id">
                        <td>{{ item.behavior_type }}</td>
                        <td>{{ item.behavior }}</td>
                        <td v-if="item.behavior_type !== 'บำเพ็ญประโยชน์'" :class="'score-negative'">{{ item.score }}
                        </td>
                        <td v-else></td>
                        <td v-if="item.behavior_type === 'บำเพ็ญประโยชน์'" :class="'score-positive'">{{ item.score }}
                        </td>
                        <td v-else></td>
                        <td class="">
                            <div class="flex items-center justify-center gap-2">
                                <button class="text-blue-600 hover:text-blue-700 transition-colors"
                                    @click="viewDetail(item)" aria-label="ดูรายละเอียด">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button class="text-red-500 hover:text-red-700 transition-colors"
                                    @click="confirmDelete(item)" aria-label="ลบ">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="conductList.length === 0"
                class="flex items-center justify-center text-[#64748b] text-[1.1rem] m-4">ไม่พบข้อมูล</div>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center mt-4">
            <div class="join">
                <button class="join-item btn btn-sm" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    ‹
                </button>
                <button v-for="page in displayedPages" :key="page" class="join-item btn btn-sm"
                    :class="{ 'btn-active': page === currentPage }" @click="goToPage(page)">
                    {{ page }}
                </button>
                <button class="join-item btn btn-sm" @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages">
                    ›
                </button>
            </div>
        </div>

        <Detail v-model="isDetailOpen" :detail="selectedDetail" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ConductService } from '../../api/conduct.js'
import Detail from './Detail.vue'
import ExportDocs from './ExportDocs.vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '../../stores/auth'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const auth = useAuthStore()
const conductList = ref([])
const loading = ref(true)
const totalScore = ref(0)
const isDetailOpen = ref(false)
const selectedDetail = ref({})
const currentPage = ref(1)
const itemsPerPage = 3
const teacherMaxPositiveScore = 10

const teacherIdFromToken = computed(() => {
    const token = auth.token || localStorage.getItem('token') || ''
    if (!token || !token.includes('.')) return ''

    try {
        const payload = token.split('.')[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const normalizedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
        const decoded = JSON.parse(atob(normalizedBase64))
        return String(decoded?.userid || decoded?._id || decoded?.id || decoded?.sub || '')
    } catch (_) {
        return ''
    }
})

const totalDeducted = computed(() =>
    conductList.value
        .filter(i => i.behavior_type !== 'บำเพ็ญประโยชน์')
        .reduce((sum, i) => sum + Number(i.score), 0)
)
const totalAdded = computed(() =>
    conductList.value
        .filter(i => i.behavior_type === 'บำเพ็ญประโยชน์')
        .reduce((sum, i) => sum + Number(i.score), 0)
)
const totalNet = computed(() => totalDeducted.value + totalAdded.value)

const teacherGivenScore = computed(() => {
    if (auth.user?.role !== 'teacher' || !teacherIdFromToken.value) return 0

    return conductList.value
        .filter(item => String(item?.teacher_id?._id || '') === teacherIdFromToken.value)
        .filter(item => Number(item?.score) > 0)
        .reduce((sum, item) => sum + Number(item.score), 0)
})

const teacherRemainingScore = computed(() => {
    if (auth.user?.role !== 'teacher') return teacherMaxPositiveScore
    return Math.max(teacherMaxPositiveScore - teacherGivenScore.value, 0)
})

const totalPages = computed(() => Math.ceil(conductList.value.length / itemsPerPage))

const paginatedList = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return conductList.value.slice(start, start + itemsPerPage)
})

const displayedPages = computed(() => {
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    return pages
})

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const props = defineProps({
    studentId: String,
    studentInfo: Object,
    refreshKey: {
        type: Number,
        default: 0,
    },
})
const emit = defineEmits(['conduct-updated'])

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function viewDetail(item) {
    selectedDetail.value = item || {}
    isDetailOpen.value = true
}

async function confirmDelete(item) {
    const result = await Swal.fire({
        title: 'ยืนยันการลบ?',
        text: `ลบรายการ "${item.behavior}" ของนักเรียนนี้?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#dc2626',
    })
    if (!result.isConfirmed) return
    try {
        const service = new ConductService()
        await service.deleteConduct(item._id)
        await Swal.fire('ลบสำเร็จ', '', 'success')
        await loadConductList(props.studentId)
        emit('conduct-updated', props.studentId)
    } catch (e) {
        Swal.fire('เกิดข้อผิดพลาด', e.message || 'ลบไม่สำเร็จ', 'error')
    }
}

async function loadConductList(studentId) {
    loading.value = true
    try {
        const service = new ConductService()
        const res = await service.getStudentConduct(studentId)
        conductList.value = res.data || []
        totalScore.value = conductList.value.reduce((sum, item) => sum + Number(item.score), 0)
        currentPage.value = 1
    } catch (e) {
        conductList.value = []
    }
    loading.value = false
}

onMounted(() => {
    loadConductList(props.studentId)
})

watch(() => props.studentId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        loadConductList(newId)
    }
})

watch(() => props.refreshKey, () => {
    if (props.studentId) {
        loadConductList(props.studentId)
    }
})
</script>

<style scoped>
.score-positive {
    color: #22c55e;
}

.score-negative {
    color: #ef4444;
}

.conduct-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
}

.conduct-table th,
.conduct-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
}

.conduct-table th {
    background: #f3f4f6;
    font-weight: 600;
}

.conduct-table tr:hover {
    background: #f9fafb;
}

.score-badge {
    font-size: 0.78rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
}

.badge-deduct {
    background: #fee2e2;
    color: #dc2626;
}

.badge-add {
    background: #dcfce7;
    color: #16a34a;
}

.badge-net {
    background: #dbeafe;
    color: #2563eb;
}
</style>
