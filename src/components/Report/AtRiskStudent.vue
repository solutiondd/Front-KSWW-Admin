<template>
    <div class="space-y-4">
        <div class="flex justify-end items-center">
            <button class="btn btn-sm btn-primary" :disabled="loading" @click="fetchRiskStudents">
                <span v-if="loading" class="loading loading-spinner loading-xs mr-2"></span>
                รีเฟรช
            </button>
        </div>

        <div v-if="errorMessage" class="alert alert-error shadow-sm">
            <span>{{ errorMessage }}</span>
        </div>

        <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
            <table class="table table-zebra w-full">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th class="text-center">ลำดับ</th>
                        <th class="text-center">รหัส</th>
                        <th class="text-center">โปรไฟล์</th>
                        <th>ชื่อ-สกุล</th>
                        <th class="text-center">ชั้น/ห้อง</th>
                        <th class="text-center">คะแนนเสี่ยง</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="6" class="text-center py-8 text-base-content/60">กำลังโหลดข้อมูล...</td>
                    </tr>
                    <tr v-else-if="riskStudents.length === 0">
                        <td colspan="6" class="text-center py-8 text-base-content/60">ไม่พบข้อมูล</td>
                    </tr>
                    <tr v-for="(item, index) in riskStudents" :key="item._id || item.userid" class="hover">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="text-center">{{ item.userid || '-' }}</td>
                        <td class="text-center">
                            <div v-if="item.picture" class="avatar inline-flex">
                                <div class="w-10 h-10 rounded">
                                    <img :src="`${imgProfileBaseUrl}${item.picture}`" alt="profile"
                                        @error="item.picture = null" />
                                </div>
                            </div>
                            <div v-else class="avatar placeholder inline-flex">
                                <div
                                    class="bg-neutral text-neutral-content w-10 h-10 rounded flex items-center justify-center">
                                    <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                                </div>
                            </div>
                        </td>
                        <td>{{ item.name || '-' }}</td>
                        <td class="text-center">{{ formatClassroom(item) }}</td>
                        <td class="text-center">
                            <button type="button" class="badge hover:opacity-90 cursor-pointer"
                                :class="scoreBadgeClass(item.score)" @click="openConductByStudent(item)"
                                :title="`จัดการคะแนนของ ${item.name || item.userid || 'นักเรียน'}`">
                                {{ item.score ?? '-' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="lg:hidden space-y-4">
            <div v-if="loading" class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
                กำลังโหลดข้อมูล...
            </div>
            <div v-else-if="riskStudents.length === 0"
                class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
                ไม่พบข้อมูล
            </div>

            <div v-for="(item, index) in riskStudents" :key="item._id || item.userid"
                class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
                <div class="flex items-start gap-3">
                    <div v-if="item.picture" class="avatar">
                        <div class="w-12 h-12 rounded-full">
                            <img :src="`${imgProfileBaseUrl}${item.picture}`" alt="profile"
                                @error="item.picture = null" />
                        </div>
                    </div>
                    <div v-else class="avatar placeholder">
                        <div
                            class="bg-neutral text-neutral-content w-12 h-12 rounded-full flex items-center justify-center">
                            <span class="text-base font-bold">{{ getInitials(item.name) }}</span>
                        </div>
                    </div>

                    <div class="flex-1">
                        <div class="badge badge-primary badge-sm mb-2">{{ index + 1 }}</div>
                        <h3 class="font-bold text-base">{{ item.name || '-' }}</h3>
                        <p class="text-sm text-base-content/70">รหัส: {{ item.userid || '-' }}</p>
                    </div>

                    <button type="button" class="badge hover:opacity-90 cursor-pointer"
                        :class="scoreBadgeClass(item.score)" @click="openConductByStudent(item)"
                        :title="`จัดการคะแนนของ ${item.name || item.userid || 'นักเรียน'}`">
                        {{ item.score ?? '-' }}
                    </button>
                </div>

                <div class="divider my-1"></div>

                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-base-content/60">ระดับชั้น</span>
                        <p class="font-medium">{{ mapGradeDisplay(item.grade) || '-' }}</p>
                    </div>
                    <div>
                        <span class="text-base-content/60">ห้อง</span>
                        <p class="font-medium">{{ item.classroom || '-' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import reportApi from "../../api/report.js";
import { formatGradeClassroomDisplay, mapGradeDisplay } from '../../utils/gradeSystem';

const imgProfileBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const router = useRouter();

const riskStudents = ref([]);
const loading = ref(false);
const errorMessage = ref("");

const fetchRiskStudents = async () => {
    loading.value = true;
    errorMessage.value = "";

    try {
        const response = await reportApi.getRiskStudentReport();
        riskStudents.value = Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
        riskStudents.value = [];
        errorMessage.value = "ไม่สามารถดึงข้อมูลนักเรียนกลุ่มเสี่ยงได้";
        console.error("Error loading risk student report:", error);
    } finally {
        loading.value = false;
    }
};

const getInitials = (name) => {
    if (!name) return "-";
    const parts = String(name).trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0]?.[0] || "-";
};

const formatClassroom = (item) => {
    if (!item) return "-";
    return formatGradeClassroomDisplay(item.grade, item.classroom);
};

const scoreBadgeClass = (score) => {
    const value = Number(score);
    if (Number.isNaN(value)) return "badge-ghost";
    if (value >= 41 && value <= 60) return "bg-yellow-300 text-yellow-900 border-yellow-400";
    if (value >= 21 && value <= 40) return "bg-orange-500 text-white border-orange-500";
    if (value >= 1 && value <= 20) return "bg-red-500 text-white border-red-600";
    if (value <= 0) return "bg-black text-white border-black";
    return "badge-ghost";
};

const openConductByStudent = (item) => {
    if (!item) return;

    const rawStudentId = item._id || item.id || "";
    const studentId = /^[a-fA-F0-9]{24}$/.test(String(rawStudentId)) ? String(rawStudentId) : "";
    const userid = item.userid ? String(item.userid) : "";
    const name = item.name ? String(item.name) : "";

    router.push({
        name: "Conduct",
        query: {
            ...(studentId ? { studentId: String(studentId) } : {}),
            ...(userid ? { userid } : {}),
            ...(name ? { name } : {}),
        },
    });
};

onMounted(fetchRiskStudents);
</script>

<style scoped></style>
