<template>
    <div class="card bg-base-100 shadow-xl max-w-[1300px] mx-auto">
        <div class="card-body p-2 sm:p-4">
            <div class="flex items-center justify-between mb-2 sm:mb-3">
                <button class="btn btn-sm btn-ghost" @click="prevMonth">‹</button>
                <div class="font-bold text-sm sm:text-lg">{{ monthYearLabel }}</div>
                <button class="btn btn-sm btn-ghost" @click="nextMonth">›</button>
            </div>

            <div class="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-bold mb-1">
                <div v-for="(d) in weekDays" :key="d" class="py-1">
                    {{ d }}
                </div>
            </div>

            <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
                <div v-for="cell in calendarCells" :key="cell.key"
                    class="min-h-[50px] sm:min-h-[92px] border rounded p-0.5 sm:p-1 text-xs sm:text-sm flex flex-col justify-between transition-colors"
                    :class="[
                        !cell.inMonth 
                            ? 'bg-base-300/40 border-transparent text-base-content/30' 
                            : (cell.isWeekend 
                                ? 'bg-base-200/80 border-base-300 text-base-content/50' 
                                : 'bg-base-100 border-base-200 font-semibold shadow-xs'),
                        
                        { 'ring-2 ring-primary ring-offset-1': cell.isToday }
                    ]">
                    
                    <div class="text-right pr-0.5 font-bold leading-none"
                         :class="{ 
                             'text-base-content/50': cell.inMonth && cell.dayOfWeek === 0,
                             'text-base-content/50': cell.inMonth && cell.dayOfWeek === 6 
                         }">
                        {{ cell.day }}
                    </div>

                    <div class="flex flex-col gap-0.5 mt-0.5">
                        <div v-for="h in cell.holidays" :key="h._id || h.summary + h.date" class="w-full">
                            
                            <div class="sm:hidden flex items-center justify-between bg-error/10 text-error rounded px-1 py-0.5 text-[10px] leading-tight"
                                 :title="h.summary">
                                <span class="truncate font-semibold">{{ h.summary }}</span>
                                <button v-if="canManage" type="button" class="shrink-0 text-[10px] ml-0.5 font-bold"
                                    @click.stop="$emit('delete', h)">✕</button>
                            </div>

                            <div class="hidden sm:flex items-center justify-between bg-error/10 text-error rounded px-1 py-0.5 leading-tight"
                                :title="h.summary">
                                <span class="truncate">{{ h.summary }}</span>
                                <button v-if="canManage" type="button" class="shrink-0"
                                    @click.stop="$emit('delete', h)">✕</button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    holidays: {
        type: Array,
        default: () => []
    },
    month: {
        type: String,
        required: true
    },
    canManage: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:month', 'delete'])

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

const currentYear = computed(() => Number(props.month.split('-')[0]))
const currentMonthIndex = computed(() => Number(props.month.split('-')[1]) - 1)

const monthYearLabel = computed(() => `${thaiMonths[currentMonthIndex.value]} ${currentYear.value + 543}`)

function toMonthString(year, monthIndex) {
    const y = String(year)
    const m = String(monthIndex + 1).padStart(2, '0')
    return `${y}-${m}`
}

function prevMonth() {
    let year = currentYear.value
    let monthIndex = currentMonthIndex.value - 1
    if (monthIndex < 0) {
        monthIndex = 11
        year -= 1
    }
    emit('update:month', toMonthString(year, monthIndex))
}

function nextMonth() {
    let year = currentYear.value
    let monthIndex = currentMonthIndex.value + 1
    if (monthIndex > 11) {
        monthIndex = 0
        year += 1
    }
    emit('update:month', toMonthString(year, monthIndex))
}

function toISODate(date) {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
    }
    if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const [d, m, y] = date.split('/')
        return `${y}-${m}-${d}`
    }
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return null
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, '0')
    const d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const holidaysByDate = computed(() => {
    const map = {}
    for (const h of props.holidays) {
        const iso = toISODate(h.date)
        if (!iso) continue
        if (!map[iso]) map[iso] = []
        map[iso].push(h)
    }
    return map
})

const calendarCells = computed(() => {
    const year = currentYear.value
    const monthIndex = currentMonthIndex.value
    const firstDayOfMonth = new Date(year, monthIndex, 1)
    const startOffset = firstDayOfMonth.getDay()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

    const now = new Date()
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const cells = []

    for (let i = 0; i < startOffset; i++) {
        const day = daysInPrevMonth - startOffset + i + 1
        const dayOfWeek = i
        cells.push({ 
            key: `prev-${day}`, 
            day, 
            inMonth: false, 
            isToday: false, 
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            dayOfWeek,
            holidays: [] 
        })
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const dayOfWeek = new Date(year, monthIndex, day).getDay()
        cells.push({
            key: `cur-${day}`,
            day,
            inMonth: true,
            isToday: iso === todayISO,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            dayOfWeek,
            holidays: holidaysByDate.value[iso] || []
        })
    }

    let nextDay = 1
    while (cells.length % 7 !== 0) {
        const dayOfWeek = cells.length % 7
        cells.push({ 
            key: `next-${nextDay}`, 
            day: nextDay, 
            inMonth: false, 
            isToday: false, 
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            dayOfWeek,
            holidays: [] 
        })
        nextDay += 1
    }

    return cells
})
</script>