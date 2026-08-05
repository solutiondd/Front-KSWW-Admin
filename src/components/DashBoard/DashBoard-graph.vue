<template>
    <div class="space-y-6">
        <transition name="slide-up">
            <div v-show="showGraphCard" class="grid grid-cols-1">
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <div class="flex items-center justify-between lg:flex gap-2 hidden lg:flex">
                            <h2 class="card-title flex items-center gap-2">สถิติรายวัน
                                <div class="flex items-center gap-1">
                                    <span class="badge badge-outline text-xs">{{ weekLabel }}</span>
                                </div>
                            </h2>
                            <!-- <router-link to="/home/report/stats" class="btn btn-xs btn-ghost">
                                ดูเพิ่มเติม →
                            </router-link> -->
                        </div>
                        <div class="flex items-center justify-between gap-2 lg:hidden">
                            <div class="flex flex-col items-start">
                                <span class="font-bold text-lg leading-tight">สถิติ</span>
                                <span class="font-bold text-lg leading-tight">รายวัน</span>
                            </div>
                            <div class="flex-1 flex justify-center">
                                <span class="px-4 py-1 border rounded-full text-xs font-medium bg-base-100 shadow-sm">{{
                                    weekLabel }}</span>
                            </div>
                            <!-- <router-link to="/home/report/stats" class="btn btn-xs btn-ghost whitespace-nowrap">
                                ดูเพิ่มเติม →
                            </router-link> -->
                        </div>
                        <div class="h-80">
                            <canvas class="z-50" ref="barChartRef"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import reportApi from '../../api/report.js'

const props = defineProps({
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    }
})

const barChartRef = ref(null)
let barChart = null

const currentWeekStart = ref(new Date())
const totals = ref({ total_students: 0, total_teachers: 0 })
const rawStats = ref([])
const strangerCount = ref(0)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const showGraphCard = ref(false)

function getUtilityBgColor(className) {
    const el = document.createElement('div')
    el.className = className
    el.style.display = 'none'
    document.body.appendChild(el)
    const color = getComputedStyle(el).backgroundColor
    document.body.removeChild(el)
    return color || 'rgba(0,0,0,1)'
}

function getThemeColors() {
    const primary = getUtilityBgColor('bg-primary')
    const primaryLight = getUtilityBgColor('bg-primary/70')
    const secondary = getUtilityBgColor('bg-secondary')
    const secondaryLight = getUtilityBgColor('bg-secondary/70')
    return { primary, primaryLight, secondary, secondaryLight }
}

function formatDateISO(d) {
    return d.toISOString().split('T')[0]
}

function formatDateThai(date) {
    const d = new Date(date)
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const day = d.getDate()
    const month = thaiMonths[d.getMonth()]
    const buddhistYear = d.getFullYear() + 543
    return `${day} ${month} ${buddhistYear}`
}

function getMonday(d) {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
}

function getSunday(monday) {
    const date = new Date(monday)
    date.setDate(date.getDate() + 6)
    return date
}

const weekLabel = computed(() => {
    const monday = getMonday(currentWeekStart.value)
    const sunday = getSunday(monday)
    return `${formatDateThai(monday)} - ${formatDateThai(sunday)}`
})

async function fetchDailyStats() {
    loading.value = true
    try {
        const monday = getMonday(currentWeekStart.value)
        const sunday = getSunday(monday)
        const start = formatDateISO(monday)
        const end = formatDateISO(sunday)

        const response = await reportApi.getDailyStats(start, end)
        if (response.message === 'Success') {
            totals.value.total_students = response.data.total_students || 0
            totals.value.total_teachers = response.data.total_teachers || 0
            rawStats.value = response.data.daily_stats || []

            await fetchStrangerData()
            buildBarChart(start, end)
        }
    } catch (e) {
        console.error('Daily stats error', e)
    } finally {
        loading.value = false
    }
}

async function fetchStrangerData() {
    try {
        const params = {
            start: `${selectedDate.value} 00:00:00`,
            end: `${selectedDate.value} 23:59:59`,
            device_sn: '',
            page: 1,
            limit: 1
        }
        const response = await reportApi.getStrangerReport(params)
        if (response.message === 'Success') {
            strangerCount.value = response.total_items || 0
        }
    } catch (e) {
        console.error('Stranger data error', e)
        strangerCount.value = 0
    }
}

function buildBarChart(start, end) {
    if (!barChartRef.value) return
    if (barChart) barChart.destroy()

    const ChartLib = window.Chart
    if (!ChartLib) return

    const startDate = new Date(start)
    const todayISO = new Date().toISOString().split('T')[0]
    const labelsISO = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate)
        d.setDate(startDate.getDate() + i)
        const dISO = d.toISOString().split('T')[0]
        if (dISO <= todayISO) {
            labelsISO.push(dISO)
        }
    }

    const map = {}
    rawStats.value.forEach(s => { map[`${s.role}_${s.date}`] = s })

    const studentOntime = []
    const studentLate = []
    const studentNotScan = []
    const teacherOntime = []
    const teacherLate = []
    const teacherNotScan = []

    labelsISO.forEach(date => {
        const stu = map[`student_${date}`]
        const tea = map[`teacher_${date}`]
        const stuLate = stu ? stu.late : 0
        const stuOntime = stu ? stu.ontime ?? Math.max((stu.total ?? 0) - (stu.late ?? 0) - (stu.not_scan ?? 0), 0) : 0
        const stuTotal = stu ? stu.total ?? 0 : 0
        const stuNotScan = Math.max((totals.value.total_students ?? 0) - stuTotal, 0)
        studentOntime.push(stuOntime)
        studentLate.push(stuLate)
        studentNotScan.push(stuNotScan)
        const teaLate = tea ? tea.late : 0
        const teaOntime = tea ? tea.ontime ?? Math.max((tea.total ?? 0) - (tea.late ?? 0) - (tea.not_scan ?? 0), 0) : 0
        const teaTotal = tea ? tea.total ?? 0 : 0
        const teaNotScan = Math.max((totals.value.total_teachers ?? 0) - teaTotal, 0)
        teacherOntime.push(teaOntime)
        teacherLate.push(teaLate)
        teacherNotScan.push(teaNotScan)
    })

    const weekdayLabels = labelsISO.map(d => {
        const dt = new Date(d)
        const dayIdx = dt.getDay()
        const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
        return thaiDays[dayIdx]
    })

    const { primary, primaryLight, secondary, secondaryLight } = getThemeColors()
    const black = 'rgba(0,0,0,0.85)'
    const red = 'rgba(239,68,68,0.85)'
    const blue = 'rgba(59,130,246,0.7)'

    const isTeacher = localStorage.getItem('residentRole') === 'teacher'
    let datasets = [
        { label: 'นักเรียน (ตรงเวลา)', data: studentOntime, backgroundColor: primary, borderColor: primary },
        { label: 'นักเรียน (สาย)', data: studentLate, backgroundColor: black, borderColor: black },
        { label: 'นักเรียน (ไม่ได้สแกน)', data: studentNotScan, backgroundColor: red, borderColor: red }
    ]
    if (!isTeacher) {
        datasets.push(
            { label: 'ครู (ตรงเวลา)', data: teacherOntime, backgroundColor: secondary, borderColor: secondary },
            { label: 'ครู (สาย)', data: teacherLate, backgroundColor: black, borderColor: black },
            { label: 'ครู (ไม่ได้สแกน)', data: teacherNotScan, backgroundColor: red, borderColor: red }
        )
    }

    const groupLabelPlugin = {
        id: 'groupLabelPlugin',
        afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart
            if (!ctx || !chartArea) return
            if (isTeacher) return

            // if (window.innerWidth < 640) return

            const days = chart.data.labels.length

            for (let i = 0; i < days; i++) {
                const meta0 = chart.getDatasetMeta(0)
                const bar0 = meta0.data[i]
                const meta5 = chart.getDatasetMeta(5)
                const bar5 = meta5.data[i]
                if (!bar0 || !bar5) continue

                const metaStu0 = chart.getDatasetMeta(0)
                const metaStu2 = chart.getDatasetMeta(2)
                const barStu0 = metaStu0.data[i]
                const barStu2 = metaStu2.data[i]
                if (!barStu0 || !barStu2) continue
                const stuLeft = Math.min(barStu0.x, barStu2.x) - barStu0.width / 2
                const stuRight = Math.max(barStu0.x, barStu2.x) + barStu2.width / 2

                const metaTea3 = chart.getDatasetMeta(3)
                const metaTea5 = chart.getDatasetMeta(5)
                const barTea3 = metaTea3.data[i]
                const barTea5 = metaTea5.data[i]
                if (!barTea3 || !barTea5) continue
                const teaLeft = Math.min(barTea3.x, barTea5.x) - barTea3.width / 2
                const teaRight = Math.max(barTea3.x, barTea5.x) + barTea5.width / 2

                const marginX = 1;
                const marginY = 1;

                ctx.save()
                ctx.strokeStyle = '#eff6ff'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    stuLeft - marginX,
                    chartArea.top - marginY,
                    (stuRight - stuLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()

                ctx.save()
                ctx.strokeStyle = '#fefce8'
                ctx.lineWidth = 2.5
                ctx.beginPath()
                ctx.rect(
                    teaLeft - marginX,
                    chartArea.top - marginY,
                    (teaRight - teaLeft) + marginX * 2,
                    (chartArea.bottom - chartArea.top) + marginY * 2
                )
                ctx.stroke()
                ctx.restore()

                if (window.innerWidth >= 640) {
                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('นักเรียน', (stuLeft + stuRight) / 2, chartArea.top + 30)
                    ctx.restore()

                    ctx.save()
                    ctx.font = 'bold 12px sans-serif'
                    ctx.fillStyle = '#222'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('ครู', (teaLeft + teaRight) / 2, chartArea.top + 30)
                    ctx.restore()
                }
            }
        }
    }

    barChart = new ChartLib(barChartRef.value, {
        type: 'bar',
        data: {
            labels: weekdayLabels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const idx = items[0]?.dataIndex ?? 0
                            const iso = labelsISO[idx]
                            return formatDateThai(iso)
                        },
                        label: (ctx) => {
                            const v = ctx.parsed.y || 0
                            return `${ctx.dataset.label}: ${Math.round(v)}`
                        },
                        footer: (items) => {
                            const total = items.reduce((sum, it) => sum + it.parsed.y, 0)
                            return 'รวม: ' + Math.round(total)
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#222',
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { stacked: false },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        callback: (v) => Math.round(v)
                    }
                }
            },
            layout: {
                padding: {
                    top: 40,
                }
            }
        },
        plugins: [groupLabelPlugin, window.ChartDataLabels]
    })
}

watch(() => props.date, (newDate) => {
    selectedDate.value = newDate
    const date = new Date(newDate)
    const monday = getMonday(date)
    currentWeekStart.value = monday
    fetchDailyStats()
})

onMounted(async () => {
    const Chart = (await import('chart.js/auto')).default
    const ChartDataLabels = (await import('chartjs-plugin-datalabels')).default
    window.Chart = Chart
    window.ChartDataLabels = ChartDataLabels
    selectedDate.value = props.date
    const date = new Date(props.date)
    const monday = getMonday(date)
    currentWeekStart.value = monday
    fetchDailyStats()

    showGraphCard.value = false
    setTimeout(() => {
        showGraphCard.value = true
    }, 100)
})

onUnmounted(() => {
    if (barChart) barChart.destroy()
})
</script>

<style scoped>
.slide-up-enter-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-up-leave-active {
    transition: all 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(60px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(60px);
}
</style>
