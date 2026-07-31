<template>
    <div class="card bg-white border border-gray-200 shadow-xl mt-6 text-black">
        <div class="card-body p-4">
            <div class="flex flex-row justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                    <h4 class="card-title font-bold flex items-center gap-2 m-0">
                        <p class="fas fa-tasks text-sm sm:text-lg">ความคืบหน้าการสแกน</p>
                    </h4>
                    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                </div>

                <div class="flex items-center">
                    <input type="date" v-model="selectedDate" @change="handleDateChange"
                        class="input input-bordered input-sm bg-white border-gray-300 text-black focus:border-orange-500 focus:outline-none rounded-lg font-medium" />
                </div>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table class="table w-full text-black">
                    <thead class="bg-gray-100 text-gray-700 font-semibold text-sm border-b border-gray-200">
                        <tr>
                            <th class="py-3 px-4 text-left">ระดับชั้น</th>
                            <th class="text-center py-3 col-total">ทั้งหมด</th>
                            <th class="text-center py-3 text-green-600 font-bold col-arrival">มาทั้งหมด</th>
                            <th class="text-center py-3 text-primary col-timedata">ตรงเวลา</th>
                            <th class="text-center py-3 text-black col-timedata">สาย</th>
                            <th class="text-center py-3 text-warning col-leave">ลา</th>
                            <th class="text-center py-3 text-blue-600 col-activity">กิจกรรม</th>
                            <th class="text-center py-3 text-red-600 col-noscan">ไม่สแกน</th>
                            <th class="text-center py-3 w-full sm:w-1/3">มา / ยังไม่มา</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200">
                        <template v-if="loading">
                            <tr v-for="i in 5" :key="'skeleton-' + i" class="border-b border-gray-200 bg-gray-50">
                                <td class="py-3 px-4">
                                    <div class="h-5 bg-gray-200 rounded w-28 skeleton-pulse"></div>
                                </td>
                                <td>
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse col-total"></div>
                                </td>
                                <td class="col-arrival">
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td class="col-timedata">
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td class="col-timedata">
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td>
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td>
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td>
                                    <div class="h-5 bg-gray-200 rounded w-10 mx-auto skeleton-pulse"></div>
                                </td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <div class="h-4 bg-gray-200 rounded w-8 skeleton-pulse"></div>
                                        <div class="h-3 bg-gray-200 rounded w-full skeleton-pulse"></div>
                                        <div class="h-4 bg-gray-200 rounded w-8 skeleton-pulse"></div>
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <template v-else v-for="(gradeGroup, gIdx) in processedData" :key="gIdx">
                            <tr 
                                @click="toggleGrade(gradeGroup.grade)"
                                class="font-bold bg-gray-300/70 text-gray-900 border-b border-gray-300 cursor-pointer hover:bg-gray-300/90 transition-colors select-none"
                            >
                                <td class="text-black py-3 px-4">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs transition-transform duration-200" :class="{ 'rotate-90': isGradeExpanded(gradeGroup.grade) }">
                                            ▶
                                        </span>
                                        <span class="text-full">{{ formatGradeTitle(gradeGroup.grade) }}</span>
                                        <span class="text-short">{{ gradeGroup.grade }}</span>
                                    </div>
                                </td>
                                <td class="text-center py-3 col-total">{{ gradeGroup.total }}</td>
                                <td class="text-center py-3 text-green-600 font-bold col-arrival">{{ gradeGroup.arrive }}</td>
                                <td class="text-center py-3 text-primary col-timedata">{{ gradeGroup.normal }}</td>
                                <td class="text-center py-3 text-black col-timedata">{{ gradeGroup.late }}</td>
                                <td class="text-center py-3 text-warning col-leave">{{ gradeGroup.leave }}</td>
                                <td class="text-center py-3 text-blue-600 col-activity">{{ gradeGroup.activity }}</td>
                                <td class="text-center py-3 text-red-600 font-bold col-noscan">{{ gradeGroup.notScan }}</td>
                                <td class="py-3">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-mono w-10 text-right text-green-600 font-bold">
                                            {{ gradeGroup.percent }}%
                                        </span>

                                        <div class="tooltip tooltip-top before:text-xs before:max-w-none flex-1"
                                            :data-tip="`มาแล้ว ${gradeGroup.arrive} คน / ยังไม่มา ${gradeGroup.notScan} คน`">
                                            <div class="flat-bar-container cursor-pointer">
                                                <div class="flat-fill-green"
                                                    :style="{ width: gradeGroup.percent + '%' }"></div>
                                                <div class="flat-fill-red"
                                                    :style="{ width: (100 - gradeGroup.percent) + '%' }"></div>
                                            </div>
                                        </div>

                                        <span class="text-xs font-mono w-10 text-left text-red-600 font-bold">
                                            {{ 100 - gradeGroup.percent }}%
                                        </span>
                                    </div>
                                </td>
                            </tr>

                            <template v-if="isGradeExpanded(gradeGroup.grade)">
                                <tr v-for="(room, rIdx) in gradeGroup.rooms" :key="rIdx" :class="[
                                    rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/80',
                                    'hover:bg-gray-100 border-b border-gray-100 transition-colors text-gray-700'
                                ]">
                                    <td class="pl-10 py-2.5 text-gray-900">
                                        <span class="text-full">{{ formatGradeTitle(gradeGroup.grade) }} ห้อง {{ room.classroom }}</span>
                                        <span class="text-short">{{ gradeGroup.grade }}/{{ room.classroom }}</span>
                                    </td>
                                    <td class="text-center py-2.5 text-gray-600 col-total">{{ room.total }}</td>
                                    <td class="text-center py-2.5 text-green-600 font-semibold col-arrival">{{ room.arrive }}</td>
                                    <td class="text-center py-2.5 text-primary/90 col-timedata">{{ room.normal }}</td>
                                    <td class="text-center py-2.5 text-black/90 col-timedata">{{ room.late }}</td>
                                    <td class="text-center py-2.5 text-warning/90 col-leave">{{ room.leave }}</td>
                                    <td class="text-center py-2.5 text-blue-600/90 col-activity">{{ room.activity }}</td>
                                    <td class="text-center py-2.5 text-red-600/90 font-semibold col-noscan">{{ room.notScan }}</td>
                                    <td class="py-2.5">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-mono w-10 text-right text-green-600">
                                                {{ room.percent }}%
                                            </span>

                                            <div class="tooltip tooltip-top before:text-xs before:max-w-none flex-1"
                                                :data-tip="`มาแล้ว ${room.arrive} คน / ยังไม่มา ${room.notScan} คน`">
                                                <div class="flat-bar-container h-2.5 cursor-pointer">
                                                    <div class="flat-fill-green" :style="{ width: room.percent + '%' }"></div>
                                                    <div class="flat-fill-red" :style="{ width: (100 - room.percent) + '%' }"></div>
                                                </div>
                                            </div>

                                            <span class="text-xs font-mono w-10 text-left text-red-600/80">
                                                {{ 100 - room.percent }}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </template>

                        <tr v-if="processedData.length === 0 && !loading">
                            <td colspan="9" class="text-center py-8 text-gray-400 bg-gray-50">
                                ไม่มีข้อมูลความคืบหน้าในวันนี้
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    }
})

const selectedDate = ref(props.date)

const expandedGrades = ref(new Set())

const toggleGrade = (grade) => {
    if (expandedGrades.value.has(grade)) {
        expandedGrades.value.delete(grade)
    } else {
        expandedGrades.value.add(grade)
    }
}

const isGradeExpanded = (grade) => {
    return expandedGrades.value.has(grade)
}

watch(() => props.date, (newVal) => {
    if (newVal) {
        selectedDate.value = newVal
    }
})

const emit = defineEmits(['date-change'])

const handleDateChange = () => {
    emit('date-change', selectedDate.value)
}

const formatGradeTitle = (grade) => {
    const safeGrade = typeof grade === 'string' ? grade : ''
    if (safeGrade.includes('ม.')) {
        return safeGrade.replace('ม.', 'มัธยมศึกษาปีที่ ')
    }
    return safeGrade || '-'
}

const processedData = computed(() => {
    const sourceData = Array.isArray(props.data) ? props.data : []

    return sourceData.filter(Boolean).map(item => {
        const safeItem = item || {}
        let total = 0, normal = 0, late = 0, arrive = 0, leave = 0, activity = 0

        const classroomsList = safeItem.classrooms || safeItem.rooms || []
        const rooms = (Array.isArray(classroomsList) ? classroomsList : []).filter(Boolean).map(room => {
            const safeRoom = room || {}
            const roomArrive = safeRoom.arrive || 0
            const roomTotal = safeRoom.total || 0
            const roomLeave = safeRoom.leave || 0
            const roomActivity = safeRoom.activity || 0
            const roomNotScan = roomTotal - roomArrive

            const percent = roomTotal > 0 ? Math.round((roomArrive / roomTotal) * 100) : 0

            total += roomTotal
            normal += (safeRoom.normal || 0)
            late += (safeRoom.late || 0)
            arrive += roomArrive
            leave += roomLeave
            activity += roomActivity

            return { 
                ...safeRoom, 
                leave: roomLeave,
                activity: roomActivity,
                notScan: roomNotScan,
                percent 
            }
        })

        const gradePercent = total > 0 ? Math.round((arrive / total) * 100) : 0
        const gradeNotScan = total - arrive

        return {
            grade: safeItem.grade,
            total,
            normal,
            late,
            arrive,
            leave,
            activity,
            notScan: gradeNotScan,
            percent: gradePercent,
            rooms
        }
    })
})
</script>

<style scoped>
.text-short {
    display: none;
}

.text-full {
    display: inline;
}

@media (max-width: 1164px) {
    .col-leave, .col-activity {
        display: none !important;
    }
}
@media (max-width: 1087px) {
    .col-timedata {
        display: none !important;
    }
}

@media (max-width: 1300px) {
    .text-full {
        display: none !important;
    }

    .text-short {
        display: inline !important;
    }
}

@media (max-width: 604px) {
    .col-arrival, .col-noscan {
        display: none !important;
    }
}

@media (max-width: 396px) {
    .col-total {
        display: none !important;
    }
}

.flat-bar-container {
    position: relative;
    width: 100%;
    height: 14px;
    background: #f1f5f9;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    border: 1px solid #e2e8f0;
}

.flat-fill-green {
    background-color: #009e08;
    height: 100%;
    transform-origin: left;
    animation: growLeft 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    transition: width 0.5s ease-in-out;
}

.flat-fill-red {
    background-color: #ff7a7a;
    height: 100%;
    transform-origin: right;
    animation: growRight 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    transition: width 0.5s ease-in-out;
}

@keyframes growLeft {
    from {
        transform: scaleX(0);
    }

    to {
        transform: scaleX(1);
    }
}

@keyframes growRight {
    from {
        transform: scaleX(0);
    }

    to {
        transform: scaleX(1);
    }
}

.skeleton-pulse {
    animation: pulse 1.5s infinite ease-in-out;
    background-image: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
}

@keyframes pulse {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

:deep(.tooltip):before {
    background-color: #1e293b !important;
    color: #ffffff !important;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    bottom: 100% !important;
    left: auto !important;
    right: 0% !important;
    transform: translate(0, -0.5rem) !important;
    white-space: nowrap !important;
}

:deep(.tooltip):after {
    border-top-color: #1e293b !important;
    bottom: 100% !important;
    left: auto !important;
    right: 1rem !important;
    transform: translate(0, 0) !important;
}
</style>