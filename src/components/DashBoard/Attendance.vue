<template>
    <div class="px-2 sm:px-4 md:px-8 w-full max-w-7xl mx-auto">
        <!-- Input Controls -->
        <div class="flex flex-wrap gap-2 mb-4 items-center sm:flex-row flex-col">
            <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                <input v-if="!props.hideSearch" v-model="searchText" @keyup.enter="handleSearch" type="text"
                    class="input input-sm input-bordered w-full sm:w-44" placeholder="ค้นหาชื่อหรือรหัส" />
                <select v-if="props.role !== 'teacher' && !props.hideDropdown" v-model="selectedGrade"
                    @change="handleGradeChange" class="select select-sm select-bordered w-full sm:w-32">
                    <option value="">เลือกชั้น</option>
                    <option v-for="grade in grades" :key="grade" :value="grade">{{ mapGradeDisplay(grade) }}</option>
                </select>
                <select v-if="props.role !== 'teacher' && !props.hideDropdown" v-model="selectedClassroom"
                    @change="handleClassroomChange" class="select select-sm select-bordered w-full sm:w-32">
                    <option value="">เลือกห้อง</option>
                    <option v-for="room in classrooms" :key="room" :value="room">{{ room }}</option>
                </select>
                <button v-if="!props.hideSearch" class="btn btn-sm btn-primary w-full sm:w-auto"
                    @click="handleSearch">ค้นหา</button>
            </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table table-zebra w-full min-w-[600px]">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th>รหัส</th>
                        <th>ชื่อ</th>
                        <th>ตำแหน่ง</th>
                        <th v-if="props.role !== 'teacher'">ชั้น</th>
                        <th>เวลาเข้า</th>
                        <th>รูปเข้า</th>
                        <th>ดูรายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="7" class="text-center">กำลังโหลดข้อมูล...</td>
                    </tr>
                    <tr v-if="!loading && data.length === 0">
                        <td colspan="7" class="text-center">ไม่พบข้อมูล</td>
                    </tr>
                    <tr v-for="item in data" :key="item._id">
                        <td>{{ item.userid }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.position }}</td>
                        <td v-if="props.role !== 'teacher'">{{ item.department ||
                            formatGradeClassroomDisplay(item.grade, item.classroom) }}
                        </td>
                        <td>{{ getEntryTime(item) }}</td>
                        <td>
                            <img v-if="getEntryImage(item)" :src="imgBaseUrl + getEntryImage(item)" alt="entry"
                                class="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                                @error="item.attendance[0].imageUrl = null" />
                            <span v-else class="text-gray-400">โหลดรูปไม่สำเร็จ</span>
                        </td>
                        <td>
                            <button class="btn btn-xs sm:btn-sm btn-info"
                                @click="viewDetail(item)">ดูรายละเอียด</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card List -->
        <div class="lg:hidden space-y-4">
            <div v-if="loading" class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
                กำลังโหลดข้อมูล...
            </div>
            <div v-if="!loading && data.length === 0"
                class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
                ไม่พบข้อมูล
            </div>
            <div v-for="item in data" :key="item._id" class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="badge badge-primary badge-sm mb-2">{{ item.userid }}</div>
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                        <p class="text-sm text-base-content/70">{{ item.position }}</p>
                    </div>
                    <div>
                        <img v-if="getEntryImage(item)" :src="imgBaseUrl + getEntryImage(item)" alt="entry"
                            class="w-12 h-12 object-cover rounded" @error="item.attendance[0].imageUrl = null" />
                        <span v-else class="text-gray-400">โหลดรูปไม่สำเร็จ</span>
                    </div>
                </div>
                <div class="divider my-2"></div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-base-content/60">{{ item.department ? 'แผนก:' : 'ชั้นเรียน:' }}</span>
                        <p class="font-medium">{{ item.department || formatGradeClassroomDisplay(item.grade,
                            item.classroom) }}</p>
                    </div>
                </div>
                <div class="divider my-2"></div>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p class="text-xs text-base-content/60 mb-1">เข้า</p>
                        <span v-if="getEntryTime(item) !== '-'" class="badge badge-success badge-sm">{{
                            getEntryTime(item) }}</span>
                        <span v-else class="badge badge-error badge-sm">ไม่มีเข้า</span>
                    </div>
                    <div>
                        <p class="text-xs text-base-content/60 mb-1">รูปเข้า</p>
                        <span v-if="getEntryImage(item)" class="badge badge-success badge-sm">มีรูป</span>
                        <span v-else class="badge badge-error badge-sm">ไม่มีรูป</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-info btn-outline w-full mt-2"
                    @click="viewDetail(item)">ดูรายละเอียด</button>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="flex flex-wrap justify-center mt-4 gap-2">
            <button class="btn btn-xs sm:btn-sm" @click="changePage(pagination.page - 1)"
                :disabled="pagination.page === 1">‹</button>
            <button v-for="page in displayedPages" :key="page" class="btn btn-xs sm:btn-sm"
                :class="{ 'btn-active': page === pagination.page }" @click="changePage(page)">{{ page }}</button>
            <button class="btn btn-xs sm:btn-sm" @click="changePage(pagination.page + 1)"
                :disabled="pagination.page === pagination.total_pages">›</button>
        </div>
        <DetailAttendance ref="detailRef" :role="props.role" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import DetailAttendance from './DetailAttendance.vue'
import reportApi from '../../api/report.js'
import { ClassRoomService } from '../../api/class-room.js'
import { formatGradeClassroomDisplay, mapGradeDisplay, toVisibleSortedGrades } from '../../utils/gradeSystem'
const imgBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL
const data = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, limit: 5, total_items: 0, total_pages: 1 })
const detailRef = ref(null)
const props = defineProps({
    role: { type: String, default: 'student' },
    date: { type: String, default: '' },
    fixedGrade: { type: String, default: '' },
    fixedClassroom: { type: [String, Number], default: '' },
    fixedName: { type: String, default: '' },
    hideDropdown: { type: Boolean, default: false },
    hideSearch: { type: Boolean, default: false }
})

const searchText = ref('')
const selectedGrade = ref(props.fixedGrade || '')
const selectedClassroom = ref(props.fixedClassroom || '')
const grades = ref([])
const classrooms = ref([])
const allClassrooms = ref([])
async function fetchClassRooms() {
    const service = new ClassRoomService()
    try {
        const res = await service.getClassRooms()
        if (res.message === 'Success' && res.data) {
            allClassrooms.value = res.data
            grades.value = toVisibleSortedGrades(res.data.map(c => c.grade))
        }
    } catch (e) {
        grades.value = []
        allClassrooms.value = []
    }
}

function handleGradeChange() {
    selectedClassroom.value = ''
    if (!selectedGrade.value) {
        classrooms.value = []
        return
    }
    const filtered = allClassrooms.value.filter(c => c.grade === selectedGrade.value)
    classrooms.value = [...new Set(filtered.map(c => c.classroom))]
}

function handleClassroomChange() {
}

function handleSearch() {
    fetchData(1)
}

const displayedPages = computed(() => {
    const total = pagination.value.total_pages
    const current = pagination.value.page
    const maxVisible = 5
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2))
    let endPage = Math.min(total, startPage + maxVisible - 1)
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }
    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    return pages
})

function getEntryTime(item) {
    if (!item.attendance || item.attendance.length === 0) return '-'
    const ts = item.attendance[0].timeStamp || item.attendance[0].timeStamps?.[0]?.timestamp
    return ts ? ts.split(' ')[1].slice(0, 5) : '-'
}
function getEntryImage(item) {
    if (!item.attendance || item.attendance.length === 0) return ''
    return item.attendance[0].imageUrl || item.attendance[0].timeStamps?.[0]?.image || ''
}
function viewDetail(item) {
    detailRef.value?.openModal(item)
}

async function fetchData(page = 1) {
    loading.value = true
    try {
        let params = {
            date: props.date,
            role: props.role,
            name: '',
            department: '',
            userid: '',
            page,
            limit: 5,
            grade: props.fixedGrade || selectedGrade.value,
            classroom: props.fixedClassroom !== '' ? props.fixedClassroom : (selectedClassroom.value || 0)
        }
        if (props.fixedName) {
            params.name = props.fixedName
        } else if (!props.hideSearch && searchText.value) {
            params.page = 1
            if (/^\d+$/.test(searchText.value)) {
                params.userid = searchText.value
                params.name = ''
            } else {
                params.name = searchText.value
                params.userid = ''
            }
        }
        const result = await reportApi.getCommingPersonReport(params)
        data.value = result.data || []
        pagination.value.page = result.page || page
        pagination.value.limit = result.limit || 5
        pagination.value.total_items = result.total_items || (result.data?.length || 0)
        pagination.value.total_pages = result.total_pages || 1
    } catch (e) {
        data.value = []
    } finally {
        loading.value = false
    }
}
function changePage(page) {
    if (page >= 1 && page <= pagination.value.total_pages) {
        fetchData(page)
    }
}

onMounted(() => {
    fetchClassRooms()
    if (props.fixedGrade) selectedGrade.value = props.fixedGrade
    if (props.fixedClassroom !== '') selectedClassroom.value = props.fixedClassroom
    fetchData(1)
})

watch(() => props.date, (newDate, oldDate) => {
    if (newDate !== oldDate) {
        fetchData(1)
    }
})
</script>
