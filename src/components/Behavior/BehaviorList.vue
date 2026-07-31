<template>
    <div class="py-2 px-1">
        <div v-if="conductSetting" class="card bg-base-100 shadow-md mb-6">
            <div class="card-body">
                <div class="flex items-center justify-between mb-3 cursor-pointer"
                    @click="conductSettingOpen = !conductSettingOpen">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-lg font-bold text-primary">ตั้งค่าการหักคะแนนอัตโนมัติ</span>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 transition-transform text-base-content/60', conductSettingOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <button v-if="auth.user?.role !== 'viewer'" @click.stop="openConductSettingModal"
                        class="bg-transparent border-none shadow-none p-0" title="แก้ไขการตั้งค่า">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="#fbbf24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
                <div v-show="conductSettingOpen" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    <div class="rounded-lg border border-warning/40 bg-warning/5 p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-semibold text-warning">มาสาย</span>
                            <span
                                :class="conductSetting.late?.enabled ? 'badge badge-warning badge-sm' : 'badge badge-ghost badge-sm'">
                                {{ conductSetting.late?.enabled ? 'เปิด' : 'ปิด' }}
                            </span>
                        </div>
                        <div class="text-sm space-y-1 text-base-content/80">
                            <div>เวลาตัด: <span class="font-medium">{{ conductSetting.late?.cutoff_time || '-' }}</span>
                            </div>
                            <div>หักคะแนน: <span class="font-medium text-error">{{ conductSetting.late?.score }}</span>
                            </div>
                            <div>พฤติกรรม: <span class="font-medium">{{ conductSetting.late?.behavior }}</span></div>
                        </div>
                    </div>
                    <div class="rounded-lg border border-error/40 bg-error/5 p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-semibold text-error">ขาดเรียน</span>
                            <span
                                :class="conductSetting.absent?.enabled ? 'badge badge-error badge-sm' : 'badge badge-ghost badge-sm'">
                                {{ conductSetting.absent?.enabled ? 'เปิด' : 'ปิด' }}
                            </span>
                        </div>
                        <div class="text-sm space-y-1 text-base-content/80">
                            <div>เวลาตัด: <span class="font-medium">{{ conductSetting.absent?.cutoff_time || '-'
                            }}</span></div>
                            <div>หักคะแนน: <span class="font-medium text-error">{{ conductSetting.absent?.score
                                    }}</span></div>
                            <div>พฤติกรรม: <span class="font-medium">{{ conductSetting.absent?.behavior }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <UpdateAttendanceSetting ref="updateAttendanceSettingModal" @updated="fetchConductSetting" />

        <div v-if="behaviortypes.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-300 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-base-content/60 text-white">ไม่มีข้อมูลหมวดพฤติกรรม</p>
        </div>
        <div v-else class="space-y-6">
            <div v-for="type in behaviortypes" :key="type._id" class="card bg-base-100 shadow-md">
                <div class="card-body">
                    <div class="flex flex-row gap-2 items-center justify-between">
                        <div class="flex items-center gap-2 cursor-pointer" @click="toggleType(type._id)">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform"
                                :class="expandedType === type._id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                            <span class="text-lg md:text-xl font-bold text-primary">{{ type.name }}</span>
                        </div>
                        <div class="action-buttons flex gap-2 ml-auto">
                            <button v-if="auth.user?.role !== 'viewer'" @click="openEdit('type', type)"
                                class="bg-transparent border-none shadow-none p-0" title="แก้ไข">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="#fbbf24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button v-if="auth.user?.role !== 'viewer'" @click="deleteType(type)"
                                class="bg-transparent border-none shadow-none p-0" title="ลบ">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="#ef4444">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div v-if="expandedType === type._id">
                        <div class="flex flex-col gap-2">
                            <div v-for="behavior in behaviors" :key="behavior._id"
                                class="relative group cursor-pointer">
                                <div
                                    class="p-4 rounded-lg border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 h-full flex flex-col cursor-pointer">
                                    <div class="flex flex-col">
                                        <div class="flex flex-row gap-2 items-center justify-between w-full">
                                            <div class="text-lg font-bold text-primary mb-1 flex items-center gap-2 cursor-pointer"
                                                @click="toggleBehavior(behavior._id)">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    class="h-5 w-5 transition-transform"
                                                    :class="expandedBehavior === behavior._id ? 'rotate-180' : ''"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                <span>{{ behavior.name }}</span>
                                            </div>
                                            <div class="action-buttons flex gap-2">
                                                <button v-if="auth.user?.role !== 'viewer'"
                                                    @click="openEdit('behavior', behavior)"
                                                    class="bg-transparent border-none shadow-none p-0" title="แก้ไข">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                        viewBox="0 0 24 24" stroke="#fbbf24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button v-if="auth.user?.role !== 'viewer'"
                                                    @click="deleteBehavior(behavior)"
                                                    class="bg-transparent border-none shadow-none p-0" title="ลบ">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                        viewBox="0 0 24 24" stroke="#ef4444">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <div class="text-xs text-secondary font-medium">หมวด: {{ type.name }}</div> -->
                                    <div v-if="expandedBehavior === behavior._id"
                                        class="mt-3 bg-base-200 p-4 rounded-lg">
                                        <div v-if="behaviorLevels.length === 0" class="text-xs text-gray-400">
                                            ไม่มีข้อมูลระดับ</div>
                                        <div v-else>
                                            <div v-for="level in behaviorLevels" :key="level._id"
                                                class="level-row mb-2">
                                                <span class="font-semibold text-primary">{{ level.level }} : {{
                                                    level.name
                                                    }}</span>
                                                <div class="flex items-center justify-between w-full md:w-auto">
                                                    <span class="text-xs text-gray-500 score">หักคะแนน: {{ level.score
                                                    }}</span>
                                                    <div class="">
                                                        <button v-if="auth.user?.role !== 'viewer'"
                                                            @click="openEdit('level', level)"
                                                            class="bg-transparent border-none shadow-none p-0 ml-2"
                                                            title="แก้ไข">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                                fill="none" viewBox="0 0 24 24" stroke="#fbbf24">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button v-if="auth.user?.role !== 'viewer'"
                                                            @click="deleteLevel(level)"
                                                            class="bg-transparent border-none shadow-none p-0 ml-2"
                                                            title="ลบ">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                                fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Update v-if="showEditModal" :type="editType" :data="editData" @close="closeEdit"
            @updated="fetchBehaviortypes" />
    </div>
</template>

<script>
import { BehaviorService } from '../../api/behavior';
import Update from './Update.vue';
import UpdateAttendanceSetting from './UpdateAttendanceSetting.vue';
import { useAuthStore } from '../../stores/auth';

const createDefaultConductSetting = () => ({
    enabled: false,
    late: {
        enabled: false,
        cutoff_time: '08:01:00',
        score: -1,
        behavior_type: 'attendance',
        behavior: 'มาสาย',
        behavior_level: 1,
        description_template: 'มาสายในวันที่ {{date}} เวลาเข้าเรียนครั้งแรก {{first_time}}',
    },
    absent: {
        enabled: false,
        cutoff_time: null,
        score: -3,
        behavior_type: 'attendance',
        behavior: 'ขาดเรียน',
        behavior_level: 2,
        description_template: 'ขาดเรียนในวันที่ {{date}} เนื่องจากไม่พบข้อมูลเข้าเรียน',
    },
});

export default {
    name: 'BehaviorList',
    components: {
        Update,
        UpdateAttendanceSetting,
    },
    props: {
        expandedTypeId: {
            type: String,
            default: null,
        },
        expandedBehaviorId: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            behaviortypes: [],
            behaviors: [],
            behaviorLevels: [],
            expandedType: null,
            expandedBehavior: null,
            service: new BehaviorService(),
            showEditModal: false,
            editType: null,
            editData: null,
            auth: useAuthStore(),
            conductSetting: createDefaultConductSetting(),
            conductSettingOpen: false,
        };
    },
    mounted() {
        this.fetchBehaviortypes();
        this.fetchConductSetting();
    },
    watch: {
        expandedTypeId(newVal) {
            if (newVal) {
                this.expandTypeAndBehavior(newVal, this.expandedBehaviorId);
            }
        },
        expandedBehaviorId(newVal) {
            if (newVal && this.expandedTypeId) {
                this.expandTypeAndBehavior(this.expandedTypeId, newVal);
            }
        },
    },
    methods: {
        openEdit(type, data) {
            this.editType = type;
            this.editData = data;
            this.showEditModal = true;
        },
        closeEdit() {
            this.showEditModal = false;
            this.editType = null;
            this.editData = null;
            setTimeout(() => {
                this.fetchBehaviortypes();
            }, 500);
        },
        async deleteType(type) {
            const Swal = await import('sweetalert2');
            const result = await Swal.default.fire({
                title: 'ยืนยันการลบหมวดพฤติกรรม?',
                text: `คุณต้องการลบ "${type.name}" หรือไม่?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ลบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#d33',
            });
            if (result.isConfirmed) {
                try {
                    await this.service.deleteBehaviortype(type._id);
                    await Swal.default.fire('ลบสำเร็จ!', '', 'success');
                    this.fetchBehaviortypes();
                } catch (e) {
                    Swal.default.fire('เกิดข้อผิดพลาด', e.message || 'ลบไม่สำเร็จ', 'error');
                }
            }
        },
        async deleteBehavior(behavior) {
            const Swal = await import('sweetalert2');
            const result = await Swal.default.fire({
                title: 'ยืนยันการลบพฤติกรรม?',
                text: `คุณต้องการลบ "${behavior.name}" หรือไม่?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ลบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#d33',
            });
            if (result.isConfirmed) {
                try {
                    await this.service.deleteBehavior(behavior._id);
                    await Swal.default.fire('ลบสำเร็จ!', '', 'success');
                    this.fetchBehaviortypes();
                } catch (e) {
                    Swal.default.fire('เกิดข้อผิดพลาด', e.message || 'ลบไม่สำเร็จ', 'error');
                }
            }
        },
        async deleteLevel(level) {
            const Swal = await import('sweetalert2');
            const result = await Swal.default.fire({
                title: 'ยืนยันการลบระดับ?',
                text: `คุณต้องการลบ "${level.name}" หรือไม่?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ลบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#d33',
            });
            if (result.isConfirmed) {
                try {
                    await this.service.deleteBehaviorLevel(level._id);
                    await Swal.default.fire('ลบสำเร็จ!', '', 'success');
                    this.fetchBehaviortypes();
                } catch (e) {
                    Swal.default.fire('เกิดข้อผิดพลาด', e.message || 'ลบไม่สำเร็จ', 'error');
                }
            }
        },
        async fetchBehaviortypes() {
            const res = await this.service.getBehaviortypes();
            this.behaviortypes = res.data || [];
            if (this.expandedTypeId) {
                this.expandTypeAndBehavior(this.expandedTypeId, this.expandedBehaviorId);
            }
        },
        async toggleType(typeId) {
            this.expandedType = this.expandedType === typeId ? null : typeId;
            this.behaviors = [];
            this.behaviorLevels = [];
            if (this.expandedType) {
                const res = await this.service.getBehaviorsByType(typeId);
                this.behaviors = res.data || [];
            }
            this.expandedBehavior = null;
        },
        async toggleBehavior(behaviorId) {
            this.expandedBehavior = this.expandedBehavior === behaviorId ? null : behaviorId;
            this.behaviorLevels = [];
            if (this.expandedBehavior) {
                const res = await this.service.getBehaviorLevelsByBehaviorId(behaviorId);
                this.behaviorLevels = res.data || [];
            }
        },
        async fetchConductSetting() {
            try {
                const res = await this.service.getAttendanceConductSetting();
                this.conductSetting = res.data ? {
                    ...createDefaultConductSetting(),
                    ...res.data,
                    late: {
                        ...createDefaultConductSetting().late,
                        ...(res.data.late || {}),
                    },
                    absent: {
                        ...createDefaultConductSetting().absent,
                        ...(res.data.absent || {}),
                    },
                } : createDefaultConductSetting();
            } catch (e) {
                console.error('Fetch conduct setting error:', e);
                this.conductSetting = createDefaultConductSetting();
            }
        },
        openConductSettingModal() {
            if (!this.conductSetting) return;
            this.$refs.updateAttendanceSettingModal?.open(this.conductSetting);
        },
        async expandTypeAndBehavior(typeId, behaviorId) {
            this.expandedType = typeId;
            this.behaviors = [];
            this.behaviorLevels = [];
            if (typeId) {
                const res = await this.service.getBehaviorsByType(typeId);
                this.behaviors = res.data || [];
                if (behaviorId) {
                    this.expandedBehavior = behaviorId;
                    const res2 = await this.service.getBehaviorLevelsByBehaviorId(behaviorId);
                    this.behaviorLevels = res2.data || [];
                } else {
                    this.expandedBehavior = null;
                }
            }
        },
    },
};
</script>

<style scoped>
.card {
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(35, 58, 124, 0.08);
    overflow: hidden;
}

.card-body {
    padding: 24px 20px;
}

.badge {
    font-size: 0.95rem;
    font-weight: 500;
}

.text-primary {
    color: #233a7c;
}

.text-secondary {
    color: #f7c800;
}

.bg-base-100 {
    background: #fff;
}

.shadow-md {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.rounded-lg {
    border-radius: 8px;
}

.border-primary {
    border-color: #233a7c;
}

.border-primary\/30 {
    border-color: rgba(35, 58, 124, 0.3);
}

.hover\:border-primary:hover {
    border-color: #233a7c;
}

.hover\:shadow-lg:hover {
    box-shadow: 0 8px 32px rgba(35, 58, 124, 0.15);
}

.bg-gradient-to-br {
    background: linear-gradient(135deg, #233a7c 0%, #f7c800 100%);
}

.from-primary\/10 {
    background: rgba(35, 58, 124, 0.1);
}

.via-primary\/5 {
    background: rgba(35, 58, 124, 0.05);
}

.to-secondary\/10 {
    background: rgba(247, 200, 0, 0.1);
}

.level-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.level-row .score {
    margin-left: auto;
}

@media (max-width: 640px) {
    .level-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .level-row .score {
        margin-left: 0;
        margin-top: 2px;
    }

    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 0 !important;
    }
}
</style>
