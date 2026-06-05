<template>
    <div>
        <button class="btn btn-sm btn-primary" :disabled="loadingExport" @click="exportDocx">
            <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            เอกสาร
        </button>

        <!-- Modal 1: เลือกประเภทเอกสาร -->
        <div v-if="showDocTypeModal" class="modal modal-open">
            <div class="modal-box max-w-sm">
                <h3 class="font-bold text-lg mb-4">เลือกเอกสารแบบไหน</h3>
                <div class="flex flex-col gap-2">
                    <label v-for="type in documentTypes" :key="type"
                        class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200"
                        :class="{ 'bg-base-200 font-semibold': selectedDocType === type }">
                        <input type="radio" :value="type" v-model="selectedDocType"
                            class="radio radio-primary radio-sm" />
                        <span>{{ type }}</span>
                        <button v-if="selectedDocType === type" class="btn btn-xs btn-ghost ml-auto"
                            @click.stop="showTemplatePreview(type)">
                            ดูตัวอย่าง
                        </button>
                    </label>
                </div>
                <div class="modal-action">
                    <button class="btn btn-ghost btn-sm" @click="cancelDocType">ยกเลิก</button>
                    <button class="btn btn-primary btn-sm" :disabled="!selectedDocType"
                        @click="confirmDocType">ถัดไป</button>
                </div>
            </div>
            <div class="modal-backdrop" @click="cancelDocType"></div>
        </div>

        <!-- Modal 3: แสดงตัวอย่างรูปแบบเอกสาร -->
        <div v-if="showTemplateModal" class="modal modal-open">
            <div class="modal-box max-w-2xl max-h-96 overflow-y-auto">
                <h3 class="font-bold text-lg mb-4">ตัวอย่างรูปแบบเอกสาร: {{ previewDocType }}</h3>
                <div class="bg-white border-2 border-gray-300 p-6 rounded-lg" v-html="documentTemplatePreview"></div>
                <div class="modal-action">
                    <button class="btn btn-primary btn-sm" @click="closeTemplatePreview">ปิด</button>
                </div>
            </div>
            <div class="modal-backdrop" @click="closeTemplatePreview"></div>
        </div>

        <!-- Modal 2: เลือกหัวข้อความผิด -->
        <div v-if="showMisconductModal" class="modal modal-open">
            <div :class="['modal-box p-0 overflow-hidden transition-all', showLivePreview ? 'max-w-5xl' : 'max-w-md']">
                <div class="flex">
                    <!-- Form column -->
                    <div class="flex-1 min-w-0 p-6 overflow-y-auto max-h-[85vh]">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold text-lg">ประพฤติผิดระเบียบของโรงเรียน ในเรื่อง</h3>
                            <button class="btn btn-xs btn-ghost gap-1 hidden lg:inline-flex"
                                @click="showLivePreview = !showLivePreview" title="เปิด/ปิด ตัวอย่าง">
                                <svg v-if="showLivePreview" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <!-- {{ showLivePreview ? 'ซ่อนตัวอย่าง' : 'แสดงตัวอย่าง' }} -->
                            </button>
                            <button class="btn btn-xs btn-ghost gap-1 lg:hidden" @click="showMobilePreviewModal = true"
                                title="ดูตัวอย่างเอกสาร">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                ดูตัวอย่าง
                            </button>
                        </div>
                        <div v-if="misconductDocType !== 'จค.กก 4' && misconductDocType !== 'จค.กก 5'"
                            class="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                            <label v-for="(item, idx) in categoryDefinitions" :key="item.label"
                                class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200">
                                <input type="checkbox" :value="item.label" v-model="misconductChecked"
                                    class="checkbox checkbox-primary checkbox-sm" />
                                <span>{{ idx + 1 }}. {{ item.label }}</span>
                            </label>
                        </div>
                        <div v-if="misconductDocType !== 'จค.กก 4' && misconductDocType !== 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">อื่น ๆ ( ไม่จำเป็น )</label>
                            <input type="text" v-model="othersText" class="input input-bordered input-sm w-full mt-1"
                                placeholder="ระบุเพิ่มเติม" />
                        </div>
                        <div class="mt-4">
                            <label class="text-sm font-medium">วันที่เอกสาร</label>
                            <input type="date" v-model="documentDateStr"
                                class="input input-bordered input-sm w-full mt-1" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 1'" class="mt-4">
                            <label class="text-sm font-medium">ต้องการภายในวันที่</label>
                            <input type="date" v-model="deadlineDateStr"
                                class="input input-bordered input-sm w-full mt-1" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 1/1'" class="mt-4">
                            <label class="text-sm font-medium">วันที่เกิดเหตุ / เวลาเกิดเหตุ</label>
                            <div class="flex gap-2">
                                <input type="date" v-model="incidentDateStr"
                                    class="input input-bordered input-sm w-full" style="max-width: 60%" />
                                <input type="time" v-model="incidentTimeStr"
                                    class="input input-bordered input-sm w-full" style="max-width: 40%" />
                            </div>
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 1/1'" class="mt-4">
                            <label class="text-sm font-medium">สถานที่เกิดเหตุ</label>
                            <input type="text" v-model="incidentLocation"
                                class="input input-bordered input-sm w-full mt-1" placeholder="ระบุสถานที่เกิดเหตุ" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 2'" class="mt-4">
                            <label class="text-sm font-medium">หมวดความผิดระเบียบวินัยสถานศึกษา</label>
                            <select v-model="selectedBehaviorTypeId"
                                class="select select-bordered select-sm w-full mt-1">
                                <option disabled value="">เลือกประเภทพฤติกรรม</option>
                                <option v-for="item in behaviorTypeOptions" :key="item._id" :value="item._id">{{
                                    item.name }}
                                </option>
                            </select>
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 2'" class="mt-4">
                            <label class="text-sm font-medium">นักเรียนทำผิดเป็นครั้งที่</label>
                            <input type="number" min="1" v-model="offenseCount"
                                class="input input-bordered input-sm w-full mt-1" placeholder="ระบุจำนวนครั้ง" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 2'" class="mt-4">
                            <label class="text-sm font-medium">การพิจารณาการลงโทษของกลุ่มบริหารกิจการนักเรียน</label>
                            <div class="flex flex-col gap-1 mt-2">
                                <label v-for="item in punishmentOptions" :key="item"
                                    class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200">
                                    <input type="checkbox" :value="item" v-model="punishmentChecked"
                                        class="checkbox checkbox-primary checkbox-sm" />
                                    <span>{{ item }}</span>
                                </label>
                            </div>
                            <div v-if="punishmentChecked.includes('หักคะแนนความประพฤติ')" class="mt-3">
                                <label class="text-sm font-medium">คะแนนที่จะหัก</label>
                                <input type="number" min="1" v-model="punishmentScore"
                                    class="input input-bordered input-sm w-full mt-1" placeholder="ระบุคะแนน" />
                            </div>
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 4'" class="mt-4">
                            <label class="text-sm font-medium">ประพฤติผิดระเบียบวินัยของโรงเรียนดังนี้</label>
                            <textarea v-model="doc4MisconductText"
                                class="textarea textarea-bordered textarea-sm w-full mt-1" rows="3"
                                placeholder="พิมพ์รายละเอียด"></textarea>
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 4'" class="mt-4">
                            <label class="text-sm font-medium">วันและเวลานัดพบที่โรงเรียน</label>
                            <div class="flex gap-2 mt-1">
                                <input type="date" v-model="meetingDateStr" class="input input-bordered input-sm w-full"
                                    style="max-width: 60%" />
                                <input type="time" v-model="meetingTimeStr" class="input input-bordered input-sm w-full"
                                    style="max-width: 40%" />
                            </div>
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">ชื่อผู้ปกครอง</label>
                            <input type="text" v-model="doc5GuardianName"
                                class="input input-bordered input-sm w-full mt-1" placeholder="เว้นว่างได้" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">ปัจจุบันที่อยู่</label>
                            <input type="text" v-model="doc5CurrentAddress"
                                class="input input-bordered input-sm w-full mt-1" placeholder="เว้นว่างได้" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">หมายเลขโทรศัพท์</label>
                            <input type="text" v-model="doc5Phone" class="input input-bordered input-sm w-full mt-1"
                                placeholder="เว้นว่างได้" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">เกี่ยวข้องกับนักเรียนเป็น</label>
                            <input type="text" v-model="doc5Relation" class="input input-bordered input-sm w-full mt-1"
                                placeholder="เว้นว่างได้" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">จะควบคุมดูแลและกวดขันให้...</label>
                            <input type="text" v-model="doc5StudentCareName"
                                class="input input-bordered input-sm w-full mt-1" placeholder="เว้นว่างได้" />
                        </div>
                        <div v-if="misconductDocType === 'จค.กก 5'" class="mt-4">
                            <label class="text-sm font-medium">ประพฤติผิดทำนองนี้อีกจะดำเนินการดังนี้</label>
                            <div class="flex flex-col gap-1 mt-2">
                                <label v-for="item in doc5ActionOptions" :key="item"
                                    class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-base-200">
                                    <input type="checkbox" :value="item" v-model="doc5ActionChecked"
                                        class="checkbox checkbox-primary checkbox-sm" />
                                    <span>{{ item }}</span>
                                </label>
                            </div>
                        </div>
                        <p v-if="misconductValidationMsg" class="text-error text-sm mt-2">{{ misconductValidationMsg }}
                        </p>
                        <div class="modal-action">
                            <button class="btn btn-ghost btn-sm" @click="cancelMisconduct">ยกเลิก</button>
                            <button class="btn btn-primary btn-sm" @click="confirmMisconduct">ยืนยัน</button>
                        </div>
                    </div>
                    <!-- Live Preview Panel -->
                    <div v-if="showLivePreview"
                        class="hidden lg:block w-[340px] shrink-0 bg-base-200 border-l border-base-300 p-4 overflow-y-auto max-h-[85vh]">
                        <div class="flex items-center gap-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <p class="font-semibold text-sm text-base-content/60">ตัวอย่างเอกสาร</p>
                        </div>
                        <div class="bg-white border border-base-300 rounded-lg p-4 shadow-sm"
                            v-html="liveDocumentPreview"></div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop" @click="cancelMisconduct"></div>
        </div>

        <!-- Mobile Preview Popup -->
        <div v-if="showMisconductModal && showMobilePreviewModal" class="modal modal-open lg:hidden">
            <div class="modal-box max-w-md max-h-[85vh] overflow-y-auto">
                <h3 class="font-bold text-lg mb-3">ตัวอย่างเอกสาร</h3>
                <div class="bg-white border border-base-300 rounded-lg p-4 shadow-sm" v-html="liveDocumentPreview">
                </div>
                <div class="modal-action">
                    <button class="btn btn-primary btn-sm" @click="showMobilePreviewModal = false">ปิด</button>
                </div>
            </div>
            <div class="modal-backdrop" @click="showMobilePreviewModal = false"></div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { saveAs } from 'file-saver'
import Swal from 'sweetalert2'
import { BehaviorService } from '../../api/behavior.js'
import { ClassRoomService } from '../../api/class-room.js'
import { TeacherService } from '../../api/teacher.js'
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem'
import {
    AlignmentType,
    BorderStyle,
    Document,
    Header,
    ImageRun,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx'

const props = defineProps({
    studentInfo: {
        type: Object,
        default: () => ({}),
    },
    conductList: {
        type: Array,
        default: () => [],
    },
})

const loadingExport = ref(false)
const showDocTypeModal = ref(false)
const selectedDocType = ref('')
const showMisconductModal = ref(false)
const misconductDocType = ref('')
const misconductChecked = ref([])
const othersText = ref('')
const behaviorTypeOptions = ref([])
const selectedBehaviorTypeId = ref('')
const offenseCount = ref('1')
const punishmentChecked = ref([])
const punishmentScore = ref('')
const doc4MisconductText = ref('')
const meetingDateStr = ref('')
const meetingTimeStr = ref('')
const documentDateStr = ref('')
const doc5GuardianName = ref('')
const doc5CurrentAddress = ref('')
const doc5Phone = ref('')
const doc5Relation = ref('')
const doc5StudentCareName = ref('')
const doc5ActionChecked = ref([])
const deadlineDateStr = ref('')
const incidentDateStr = ref('')
const incidentTimeStr = ref('')
const incidentLocation = ref('')
const misconductValidationMsg = ref('')
const showTemplateModal = ref(false)
const previewDocType = ref('')
const showLivePreview = ref(true)
const showMobilePreviewModal = ref(false)
const behaviorService = new BehaviorService()
let resolveDocType = null
let resolveMisconduct = null

const punishmentOptions = [
    'ว่ากล่าวตักเตือน',
    'หักคะแนนความประพฤติ',
    'ให้ทำกิจกรรมสาธารณประโยชน์',
    'เชิญผู้ปกครองมารับทราบการสั่งพักการเรียน',
    'เชิญผู้ปกครองมาทัณฑ์บน',
    'เชิญผู้ปกครองมาให้ย้ายสถานศึกษา',
]

const doc5ActionOptions = ['สั่งพักการเรียน', 'ให้ย้ายสถานศึกษา']

function openDocTypeModal() {
    selectedDocType.value = ''
    showDocTypeModal.value = true
    return new Promise((resolve) => { resolveDocType = resolve })
}
function confirmDocType() {
    showDocTypeModal.value = false
    resolveDocType?.(selectedDocType.value || null)
}
function cancelDocType() {
    showDocTypeModal.value = false
    resolveDocType?.(null)
}

async function ensureBehaviorTypesLoaded() {
    if (behaviorTypeOptions.value.length > 0) return behaviorTypeOptions.value
    try {
        const res = await behaviorService.getBehaviortypes()
        behaviorTypeOptions.value = res?.data || []
    } catch (_) {
        behaviorTypeOptions.value = []
    }
    return behaviorTypeOptions.value
}

function getMatchedBehaviorTypeId(typeName) {
    const normalized = String(typeName || '').trim().toLowerCase()
    if (!normalized) return ''
    const matched = behaviorTypeOptions.value.find(item =>
        String(item?.name || '').trim().toLowerCase() === normalized
    )
    return matched?._id || ''
}

function getBehaviorTypeNameById(typeId) {
    return behaviorTypeOptions.value.find(item => item?._id === typeId)?.name || ''
}

function openMisconductModal(initialChecked, options = {}) {
    misconductDocType.value = options.docType || ''
    misconductChecked.value = [...(initialChecked?.checkedLabels || [])]
    othersText.value = initialChecked?.others || ''
    selectedBehaviorTypeId.value = options.defaultBehaviorTypeId || ''
    offenseCount.value = options.defaultOffenseCount || '1'
    punishmentChecked.value = [...(options.defaultPunishments || [])]
    punishmentScore.value = options.defaultPunishmentScore || ''
    doc4MisconductText.value = options.defaultDoc4MisconductText || ''
    meetingDateStr.value = options.defaultMeetingDate || ''
    meetingTimeStr.value = options.defaultMeetingTime || ''
    documentDateStr.value = options.defaultDocumentDate || new Date().toISOString().slice(0, 10)
    doc5GuardianName.value = options.defaultDoc5GuardianName || ''
    doc5CurrentAddress.value = options.defaultDoc5CurrentAddress || ''
    doc5Phone.value = options.defaultDoc5Phone || ''
    doc5Relation.value = options.defaultDoc5Relation || ''
    doc5StudentCareName.value = options.defaultDoc5StudentCareName || ''
    doc5ActionChecked.value = [...(options.defaultDoc5Actions || [])]
    deadlineDateStr.value = options.defaultDeadline || ''
    incidentDateStr.value = options.defaultIncidentDate || ''
    incidentTimeStr.value = options.defaultIncidentTime || ''
    incidentLocation.value = options.defaultIncidentLocation || ''
    misconductValidationMsg.value = ''
    showMobilePreviewModal.value = false
    showMisconductModal.value = true
    return new Promise((resolve) => { resolveMisconduct = resolve })
}
function confirmMisconduct() {
    if (misconductDocType.value !== 'จค.กก 4' && misconductDocType.value !== 'จค.กก 5' && misconductChecked.value.length === 0 && !othersText.value.trim()) {
        misconductValidationMsg.value = 'กรุณาเลือกอย่างน้อย 1 รายการ หรือระบุ อื่น ๆ'
        return
    }
    if (misconductDocType.value === 'จค.กก 1/1' && !incidentDateStr.value) {
        misconductValidationMsg.value = 'กรุณาเลือกวันที่เกิดเหตุ'
        return
    }
    if (misconductDocType.value === 'จค.กก 1/1' && !incidentTimeStr.value) {
        misconductValidationMsg.value = 'กรุณาเลือกเวลาเกิดเหตุ'
        return
    }
    if (misconductDocType.value === 'จค.กก 1/1' && !incidentLocation.value.trim()) {
        misconductValidationMsg.value = 'กรุณาระบุสถานที่เกิดเหตุ'
        return
    }
    if (misconductDocType.value === 'จค.กก 2' && !selectedBehaviorTypeId.value) {
        misconductValidationMsg.value = 'กรุณาเลือกประเภทพฤติกรรม'
        return
    }
    if (misconductDocType.value === 'จค.กก 2' && (!offenseCount.value || Number(offenseCount.value) <= 0)) {
        misconductValidationMsg.value = 'กรุณาระบุจำนวนครั้งที่นักเรียนทำผิด'
        return
    }
    if (misconductDocType.value === 'จค.กก 2' && punishmentChecked.value.length === 0) {
        misconductValidationMsg.value = 'กรุณาเลือกการพิจารณาการลงโทษอย่างน้อย 1 รายการ'
        return
    }
    if (misconductDocType.value === 'จค.กก 2' && punishmentChecked.value.includes('หักคะแนนความประพฤติ') && (!punishmentScore.value || Number(punishmentScore.value) <= 0)) {
        misconductValidationMsg.value = 'กรุณาระบุคะแนนที่จะหัก'
        return
    }
    showMobilePreviewModal.value = false
    showMisconductModal.value = false
    resolveMisconduct?.({
        checkedLabels: new Set(misconductChecked.value),
        others: othersText.value.trim(),
        behaviorTypeId: selectedBehaviorTypeId.value || null,
        behaviorTypeName: getBehaviorTypeNameById(selectedBehaviorTypeId.value) || null,
        offenseCount: offenseCount.value || null,
        punishmentSelections: new Set(punishmentChecked.value),
        punishmentScore: punishmentScore.value || null,
        documentDate: documentDateStr.value || null,
        doc4MisconductText: doc4MisconductText.value.trim() || null,
        meetingDate: meetingDateStr.value || null,
        meetingTime: meetingTimeStr.value || null,
        doc5GuardianName: doc5GuardianName.value.trim() || null,
        doc5CurrentAddress: doc5CurrentAddress.value.trim() || null,
        doc5Phone: doc5Phone.value.trim() || null,
        doc5Relation: doc5Relation.value.trim() || null,
        doc5StudentCareName: doc5StudentCareName.value.trim() || null,
        doc5Actions: new Set(doc5ActionChecked.value),
        deadline: deadlineDateStr.value || null,
        incidentDate: incidentDateStr.value || null,
        incidentTime: incidentTimeStr.value || null,
        incidentLocation: incidentLocation.value.trim() || null,
    })
}
function cancelMisconduct() {
    showMobilePreviewModal.value = false
    showMisconductModal.value = false
    resolveMisconduct?.(null)
}

function showTemplatePreview(docType) {
    previewDocType.value = docType
    showTemplateModal.value = true
}

function closeTemplatePreview() {
    showTemplateModal.value = false
    previewDocType.value = ''
}

const misconductList = computed(() =>
    (props.conductList || []).filter(item => item.behavior_type !== 'บำเพ็ญประโยชน์')
)

const liveDocumentPreview = computed(() => {
    const doc = misconductDocType.value
    const studentName = props.studentInfo?.name || '(ชื่อนักเรียน)'
    const studentId = props.studentInfo?.userid || '........'
    const className = formatGradeClassroomDisplay(props.studentInfo?.grade || 'ม....', props.studentInfo?.classroom || '....')
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const mark = (label) => misconductChecked.value.includes(label) ? '☑' : '☐'
    const punishMark = (label) => punishmentChecked.value.includes(label) ? '☑' : '☐'
    const actionMark = (label) => doc5ActionChecked.value.includes(label) ? '☑' : '☐'
    const formatDate = (dateStr) => {
        if (!dateStr) return '__ / __ / __'
        const d = new Date(`${dateStr}T00:00:00`)
        if (isNaN(d.getTime())) return '__ / __ / __'
        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
        return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`
    }
    const allLabels = categoryDefinitions.map(c => c.label)

    if (doc === 'จค.กก 1') {
        return `
            <div class="text-xs leading-5">
                <div class="text-center mb-3 pb-2 border-b">
                    <p class="font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</p>
                    <p class="text-gray-400">หนังสือแจ้งนักเรียนประพฤติผิดระเบียบ (จค.กก 1)</p>
                </div>
                <p class="mb-1 border-t border-b py-1"><strong>วันที่:</strong> ${formatDate(documentDateStr.value)}</p>
                <p class="mb-1 mt-2">เรียน ครูที่ปรึกษา นักเรียน <strong class="text-blue-600">${esc(studentName)}</strong></p>
                <p class="mb-2">ชั้น <strong class="text-blue-600">${esc(className)}</strong> เลขประจำตัว <strong class="text-blue-600">${esc(studentId)}</strong></p>
                <p class="mb-1">ประพฤติผิดระเบียบของโรงเรียน ในเรื่อง</p>
                <div class="ml-3 mb-2">
                    ${allLabels.map(l => `<p>${mark(l)} ${l}</p>`).join('')}
                    ${othersText.value.trim() ? `<p>☑ อื่น ๆ: <span class="text-blue-600">${esc(othersText.value)}</span></p>` : '<p>☐ อื่น ๆ</p>'}
                </div>
                <p class="mb-2"><strong>ต้องการภายในวันที่:</strong> <span class="text-blue-600">${formatDate(deadlineDateStr.value)}</span></p>
                <p>จึงมีหนังสือแจ้งเตือนนี้ เพื่อให้ทราบและได้จัดการ</p>
                <div class="mt-4 pt-2 border-t">
                    <p>ลงชื่อ .............................</p>
                    <p class="text-gray-400">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
                </div>
            </div>`
    }
    if (doc === 'จค.กก 1/1') {
        return `
            <div class="text-xs leading-5">
                <div class="text-center mb-3 pb-2 border-b">
                    <p class="font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</p>
                    <p class="text-gray-400">แบบบันทึกการสอบสวน (จค.กก 1/1)</p>
                </div>
                <p class="mb-1">นักเรียน <strong class="text-blue-600">${esc(studentName)}</strong></p>
                <p class="mb-2">ชั้น <strong class="text-blue-600">${esc(className)}</strong> เลขประจำตัว <strong class="text-blue-600">${esc(studentId)}</strong></p>
                <div class="ml-3 mb-2">
                    <p>ได้กระทำผิด:</p>
                    ${allLabels.map(l => `<p>${mark(l)} ${l}</p>`).join('')}
                    ${othersText.value.trim() ? `<p>☑ อื่น ๆ: <span class="text-blue-600">${esc(othersText.value)}</span></p>` : '<p>☐ อื่น ๆ</p>'}
                </div>
                <p class="mb-1"><strong>วันที่เกิดเหตุ:</strong> <span class="text-blue-600">${formatDate(incidentDateStr.value)}</span> เวลา <span class="text-blue-600">${incidentTimeStr.value || '__ : __'}</span></p>
                <p class="mb-2"><strong>สถานที่เกิดเหตุ:</strong> <span class="text-blue-600">${esc(incidentLocation.value) || '..........................'}</span></p>
                <p>การกระทำของข้าพเจ้า เป็นการกระทำที่ไม่ถูกต้อง</p>
                <p>ข้าพเจ้ายินดีให้ทางโรงเรียนพิจารณาโทษได้ทุกกรณี</p>
                <div class="mt-4 pt-2 border-t">
                    <p>ลงชื่อ .............................</p>
                    <p class="text-gray-400">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
                </div>
            </div>`
    }
    if (doc === 'จค.กก 2') {
        const behaviorName = esc(getBehaviorTypeNameById(selectedBehaviorTypeId.value)) || '................................'
        return `
            <div class="text-xs leading-5">
                <div class="text-center mb-3 pb-2 border-b">
                    <p class="font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</p>
                    <p class="text-gray-400">หนังสือการพิจารณาการลงโทษ (จค.กก 2)</p>
                </div>
                <p class="mb-1">เรียน ผู้อำนวยการโรงเรียน</p>
                <p class="mb-2">นักเรียน <strong class="text-blue-600">${esc(studentName)}</strong> ชั้น <strong class="text-blue-600">${esc(className)}</strong></p>
                <div class="ml-3 mb-2">
                    <p>ได้กระทำผิด:</p>
                    ${allLabels.map(l => `<p>${mark(l)} ${l}</p>`).join('')}
                    ${othersText.value.trim() ? `<p>☑ อื่น ๆ: <span class="text-blue-600">${esc(othersText.value)}</span></p>` : '<p>☐ อื่น ๆ</p>'}
                </div>
                <p class="mb-1">กลุ่มบริหารกิจการนักเรียนได้พิจารณาแล้ว</p>
                <div class="ml-3 mb-2">
                    <p><strong>ประเภทพฤติกรรม:</strong> <span class="text-blue-600">${behaviorName}</span></p>
                    <p><strong>เป็นครั้งที่:</strong> <span class="text-blue-600">${esc(offenseCount.value) || '__'}</span></p>
                    <p><strong>การลงโทษ:</strong></p>
                    ${punishmentOptions.map(l => `<p>${punishMark(l)} ${l}${l === 'หักคะแนนความประพฤติ' && punishmentChecked.value.includes(l) ? ` <span class="text-blue-600">${esc(punishmentScore.value) || '__'}</span> คะแนน` : ''}</p>`).join('')}
                </div>
                <div class="mt-4 pt-2 border-t">
                    <p>ลงชื่อ .............................</p>
                    <p class="text-gray-400">(รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน)</p>
                </div>
            </div>`
    }
    if (doc === 'จค.กก 4') {
        return `
            <div class="text-xs leading-5">
                <div class="text-center mb-3 pb-2 border-b">
                    <p class="font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</p>
                    <p class="text-gray-400">หนังสือเชิญผู้ปกครองมารับทราบ (จค.กก 4)</p>
                </div>
                <p class="mb-1">เรียน ผู้ปกครอง/ผู้อุปการะของ</p>
                <p class="mb-2">นักเรียน <strong class="text-blue-600">${esc(studentName)}</strong> ชั้น <strong class="text-blue-600">${esc(className)}</strong></p>
                <p class="mb-1">นักเรียนดังกล่าวได้ประพฤติผิดระเบียบวินัยของโรงเรียน ดังนี้:</p>
                <div class="ml-3 mb-2 border-l-2 border-blue-300 pl-2">
                    <p class="text-blue-600">${esc(doc4MisconductText.value) || '.................................................................................'}</p>
                </div>
                <p class="mb-1"><strong>ขอให้มานัดพบที่โรงเรียน</strong></p>
                <p>วันที่ <span class="text-blue-600">${formatDate(meetingDateStr.value)}</span> เวลา <span class="text-blue-600">${meetingTimeStr.value || '__ : __'}</span> น.</p>
                <p class="mb-2">ณ สำนักงานกลุ่มบริหารกิจการนักเรียน</p>
                <div class="mt-4 pt-2 border-t">
                    <p>ลงชื่อ .............................</p>
                    <p class="text-gray-400">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
                </div>
            </div>`
    }
    if (doc === 'จค.กก 5') {
        return `
            <div class="text-xs leading-5">
                <div class="text-center mb-3 pb-2 border-b">
                    <p class="font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</p>
                    <p class="text-gray-400">หนังสือทัณฑ์บน (จค.กก 5)</p>
                </div>
                <div class="border-t border-b py-1 mb-2">
                    <p>วันที่ ${formatDate(documentDateStr.value)}</p>
                </div>
                <p class="mb-1">ชื่อ ผู้ปกครอง: <span class="text-blue-600">${esc(doc5GuardianName.value) || '.....................................................'}</span></p>
                <p class="mb-2">นักเรียน <strong class="text-blue-600">${esc(studentName)}</strong> ชั้น <strong class="text-blue-600">${esc(className)}</strong></p>
                <div class="ml-3 mb-2">
                    <p><strong>ที่อยู่:</strong> <span class="text-blue-600">${esc(doc5CurrentAddress.value) || '...................................................'}</span></p>
                    <p><strong>โทรศัพท์:</strong> <span class="text-blue-600">${esc(doc5Phone.value) || '............................'}</span></p>
                    <p><strong>เกี่ยวข้องกับนักเรียนเป็น:</strong> <span class="text-blue-600">${esc(doc5Relation.value) || '............................'}</span></p>
                </div>
                <p class="mb-1">จะควบคุมดูแล <span class="text-blue-600">${esc(doc5StudentCareName.value) || '........................................'}</span></p>
                <p class="mb-1">หากปรากฏว่านักเรียนประพฤติผิดทำนองนี้อีก:</p>
                <div class="ml-3 mb-2">
                    ${doc5ActionOptions.map(l => `<p>${actionMark(l)} ${l}</p>`).join('')}
                </div>
                <div class="mt-4 pt-2 border-t">
                    <p>ลงชื่อ .............. ผู้ปกครอง</p>
                    <p>ลงชื่อ .............. นักเรียน</p>
                    <p>ลงชื่อ .............. ครูที่ปรึกษา</p>
                    <p>ลงชื่อ .............. เจ้าหน้าที่</p>
                    <p>ลงชื่อ .............. รองผู้อำนวยการ</p>
                </div>
            </div>`
    }
    return '<p class="text-gray-400 text-xs">ไม่มีข้อมูลตัวอย่าง</p>'
})

const documentTemplatePreview = computed(() => {
    const doc = previewDocType.value
    const studentName = '(ชื่อนักเรียน)'
    const studentId = '........'
    const className = 'ม..../...'

    const templates = {
        'จค.กก 1': `
            <div class="text-center mb-6">
                <h2 class="text-lg font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</h2>
                <p class="text-sm">หนังสือแจ้งนักเรียนประพฤติผิดระเบียบ (จค.กก 1)</p>
            </div>
            <div class="border-t-2 border-b-2 py-3 mb-4">
                <p><strong>วันที่:</strong> __ / __ / __</p>
            </div>
            <p class="mb-3">เรียน ครูที่ปรึกษา นักเรียน ${studentName}</p>
            <p class="mb-4">ชั้น ${className} เลขประจำตัว ${studentId}</p>
            <p class="mb-4">ซึ่งเป็นนักเรียนในปกครองของท่านได้ประพฤติผิดระเบียบของโรงเรียน ในเรื่อง</p>
            <div class="ml-6 mb-4">
                <p>☐ แต่งกายผิดระเบียบบ่อยครั้ง</p>
                <p>☐ ทำลายทรัพย์สินของโรงเรียน</p>
                <p>☐ หนีเรียน</p>
            </div>
            <p class="mb-4"><strong>ต้องการภายในวันที่:</strong> __ / __ / __</p>
            <p class="mb-6">จึงมีหนังสือแจ้งเตือนนี้ เพื่อให้ทราบและได้จัดการ</p>
            <div class="mt-8">
                <p>ลงชื่อ .......................... วันที่ __ / __ / __</p>
                <p class="text-sm">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
            </div>
        `,
        'จค.กก 1/1': `
            <div class="text-center mb-6">
                <h2 class="text-lg font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</h2>
                <p class="text-sm">แบบบันทึกการสอบสวน (จค.กก 1/1)</p>
            </div>
            <p class="mb-3">นักเรียน ${studentName} ชั้น ${className} เลขประจำตัว ${studentId}</p>
            <div class="ml-6 mb-4">
                <p>ได้กระทำผิด:</p>
                <p>☐ แต่งกายผิดระเบียบบ่อยครั้ง</p>
                <p>☐ ทำลายทรัพย์สินของโรงเรียน</p>
                <p>☐ อื่น ๆ ..................................</p>
            </div>
            <p class="mb-4"><strong>วันที่เกิดเหตุ:</strong> __ / __ / __ เวลา __ : __</p>
            <p class="mb-4"><strong>สถานที่เกิดเหตุ:</strong> ..................................</p>
            <p class="mb-3">การกระทำของข้าพเจ้า เป็นการกระทำที่ไม่ถูกต้อง</p>
            <p class="mb-4">ข้าพเจ้ายินดีให้ทางโรงเรียนพิจารณาโทษได้ทุกกรณี</p>
            
            <div class="mt-8">
                <p>ลงชื่อ .......................... วันที่ __ / __ / __</p>
                <p class="text-sm">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
            </div>
        `,
        'จค.กก 2': `
            <div class="text-center mb-6">
                <h2 class="text-lg font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</h2>
                <p class="text-sm">หนังสือการพิจารณาการลงโทษ (จค.กก 2)</p>
            </div>
            <p class="mb-3">เรียน ผู้อำนวยการโรงเรียน </p>
            <p class="mb-4">นักเรียน ${studentName} ชั้น ${className} เลขประจำตัว ${studentId}</p>
            <div class="ml-6 mb-4">
                <p>ได้กระทำผิด:</p>
                <p>☐ แต่งกายผิดระเบียบบ่อยครั้ง</p>
                <p>☐ ทำลายทรัพย์สินของโรงเรียน</p>
                <p>☐ อื่น ๆ ..................................</p>
            </div>
            <p class="mb-4">กลุ่มบริหารกิจการนักเรียนได้พิจารณาแล้ว</p>
            <div class="ml-6 mb-4">
                <p><strong>ประเภทพฤติกรรม:</strong> ........................</p>
                <p><strong>เป็นครั้งที่:</strong> __</p>
                <p><strong>การลงโทษ:</strong></p>
                <p>☐ ว่ากล่าวตักเตือน</p>
                <p>☐ หักคะแนนความประพฤติ ____ คะแนน</p>
                <p>☐ ให้ทำกิจกรรมสาธารณประโยชน์</p>
            </div>
            <div class="mt-8">
                <p>ลงชื่อ .......................... วันที่ __ / __ / __</p>
                <p class="text-sm">(รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน)</p>
            </div>
        `,
        'จค.กก 4': `
            <div class="text-center mb-6">
                <h2 class="text-lg font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</h2>
                <p class="text-sm">หนังสือเชิญผู้ปกครองมารับทราบ (จค.กก 4)</p>
            </div>
            <p class="mb-3">เรียน ผู้ปกครอง/ผู้อุปการะของ </p>
            <p class="mb-4">นักเรียน ${studentName} ชั้น ${className} เลขประจำตัว ${studentId}</p>
            <p class="mb-4">นักเรียนดังกล่าวได้ประพฤติผิดระเบียบวินัยของโรงเรียน ดังนี้:</p>
            <div class="ml-6 mb-4 border-l-4 pl-3">
                <p>รายละเอียดประพฤติผิด: ....................................</p>
            </div>
            <p class="mb-4"><strong>ขอให้มานัดพบที่โรงเรียน</strong></p>
            <p>วันที่ __ / __ / __ เวลา __ : __</p>
            <p class="mb-6">ณ สำนักงานกลุ่มบริหารกิจการนักเรียน</p>
            <div class="mt-8">
                <p>ลงชื่อ .......................... วันที่ __ / __ / __</p>
                <p class="text-sm">(เจ้าหน้าที่ส่งเสริมความประพฤติ)</p>
            </div>
        `,
        'จค.กก 5': `
            <div class="text-center mb-6">
                <h2 class="text-lg font-bold">โรงเรียนเขาสวนกวางวิทยานุกูล</h2>
                <p class="text-sm">หนังสือทัณฑ์บน (จค.กก 5)</p>
            </div>
            <div class="border-t-2 border-b-2 py-2 mb-4 text-sm">
                <p>วันที่ __ / __ / __</p>
            </div>
            <p class="mb-3">ชื่อ ผู้ปกครอง/ผู้อุปการะของ</p>
            <p class="mb-4">นักเรียน ${studentName} ชั้น ${className} เลขประจำตัว ${studentId}</p>
            <div class="ml-6 mb-4 text-sm">
                <p><strong>ที่อยู่:</strong> .....................................................</p>
                <p><strong>โทรศัพท์:</strong> ..............................</p>
                <p><strong>เกี่ยวข้องกับนักเรียนเป็น:</strong> ..............................</p>
            </div>
            <p class="mb-4">หากปรากฏว่านักเรียนประพฤติผิดทำนองนี้อีก การดำเนินการจะเป็นดังนี้:</p>
            <div class="ml-6 mb-4">
                <p>☐ สั่งพักการเรียน</p>
                <p>☐ จัดส่งให้ย้ายสถานศึกษา</p>
            </div>
            <div class="mt-8">
                <p>ลงชื่อ .......................... ผู้ปกครอง</p>
                <p>ลงชื่อ .......................... นักเรียน</p>
                <p>ลงชื่อ .......................... ครูที่ปรึกษา</p>
                <p>ลงชื่อ .......................... เจ้าหน้าที่ส่งเสริมความประพฤติ</p>
                <p>ลงชื่อ .......................... รองผู้อำนวยการ</p>
            </div>
        `,
    }

    return templates[doc] || '<p class="text-gray-500">ไม่มีข้อมูลตัวอย่าง</p>'
})

const categoryDefinitions = [
    { label: 'แต่งกายผิดระเบียบบ่อยครั้ง', keywords: ['แต่งกาย', 'เครื่องแบบ', 'ทรงผม', 'ร่างกาย'] },
    { label: 'ทำลายทรัพย์สินของโรงเรียน', keywords: ['ทำลายทรัพย์สิน', 'ทรัพย์สินของโรงเรียน'] },
    { label: 'หนีเรียน', keywords: ['หนีเรียน', 'ขาดเรียน'] },
    { label: 'พกพาอาวุธ', keywords: ['อาวุธ'] },
    { label: 'ลักขโมย', keywords: ['ลักขโมย', 'ขโมย'] },
    { label: 'ทำร้ายร่างกายผู้อื่น', keywords: ['ทำร้าย', 'ร่างกายผู้อื่น'] },
    { label: 'เล่นการพนัน', keywords: ['พนัน'] },
    { label: 'เสพย์สิ่งเสพติด', keywords: ['เสพ', 'สิ่งเสพติด', 'ยาเสพ'] },
    { label: 'ชู้สาว', keywords: ['ชู้สาว'] },
    { label: 'ทะเลาะวิวาท', keywords: ['ทะเลาะ', 'วิวาท'] },
]

const documentTypes = ['จค.กก 1', 'จค.กก 1/1', 'จค.กก 2', 'จค.กก 4', 'จค.กก 5']

function createRun(text, options = {}) {
    return new TextRun({
        text,
        font: 'TH Sarabun New',
        size: options.size ?? 30,
        bold: options.bold ?? false,
        color: options.color,
        underline: options.underline,
        break: options.break ?? 0,
    })
}

function createParagraph(children, options = {}) {
    return new Paragraph({
        children: Array.isArray(children) ? children : [createRun(children, options)],
        alignment: options.alignment ?? AlignmentType.LEFT,
        indent: options.indent,
        spacing: options.spacing ?? { after: 80 },
    })
}

function makeCell(text, width) {
    return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: [createParagraph(text, { spacing: { after: 40 } })],
    })
}

function getDocDateParts(dateValue) {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
        return { day: '', month: '', year: '' }
    }
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ]
    return {
        day: String(date.getDate()),
        month: thaiMonths[date.getMonth()],
        year: String(date.getFullYear() + 543),
    }
}

function getSignatureName(name) {
    return name ? `( ${name} )` : '(................................................)'
}

function getMisconductSummary(items) {
    return items
        .map(item => item.description && item.description !== '-' ? item.description : item.behavior)
        .filter(Boolean)
        .join(', ')
}

function getCheckedCategories(items) {
    const text = items
        .map(item => [item.behavior_type, item.behavior, item.description].join(' '))
        .join(' ')
        .toLowerCase()

    const checked = categoryDefinitions.filter(category =>
        category.keywords.some(keyword => text.includes(keyword.toLowerCase()))
    )
    const checkedLabels = new Set(checked.map(item => item.label))
    const others = items
        .filter(item => !categoryDefinitions.some(category =>
            category.keywords.some(keyword =>
                [item.behavior_type, item.behavior, item.description].join(' ').toLowerCase().includes(keyword.toLowerCase())
            )
        ))
        .map(item => item.behavior)
        .filter(Boolean)

    return {
        checkedLabels,
        others: [...new Set(others)].join(', '),
    }
}

async function loadBrandImage() {
    try {
        const res = await fetch('/brand.jpg')
        if (!res.ok) return null
        const buffer = await res.arrayBuffer()
        return new Uint8Array(buffer)
    } catch (e) {
        return null
    }
}

async function exportDocx() {
    if (loadingExport.value) return
    if (!props.studentInfo?._id && !props.studentInfo?.userid) {
        await Swal.fire('ยังไม่มีข้อมูลนักเรียน', 'กรุณาเลือกนักเรียนก่อน', 'warning')
        return
    }
    if (misconductList.value.length === 0) {
        await Swal.fire('ไม่มีข้อมูลให้ส่งออก', 'ต้องมีรายการความประพฤติที่เป็นการหักคะแนนก่อน', 'warning')
        return
    }

    const selectedDocumentType = await openDocTypeModal()
    if (!selectedDocumentType) return

    let checked = getCheckedCategories(misconductList.value)

    if (selectedDocumentType === 'จค.กก 1' || selectedDocumentType === 'จค.กก 1/1' || selectedDocumentType === 'จค.กก 2' || selectedDocumentType === 'จค.กก 4' || selectedDocumentType === 'จค.กก 5') {
        const latestForDefault = [...misconductList.value].sort((a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0]
        const defaultFollowUp = new Date(latestForDefault?.created_at || Date.now())
        defaultFollowUp.setDate(defaultFollowUp.getDate() + 7)
        const defaultDeadlineStr = defaultFollowUp.toISOString().slice(0, 10)
        const defaultIncidentDateStr = new Date(latestForDefault?.created_at || Date.now()).toISOString().slice(0, 10)
        const defaultIncidentTimeStr = new Date(latestForDefault?.created_at || Date.now()).toTimeString().slice(0, 5)
        let defaultBehaviorTypeId = ''

        if (selectedDocumentType === 'จค.กก 2') {
            await ensureBehaviorTypesLoaded()
            const firstBehaviorTypeName = misconductList.value.find(item => item?.behavior_type)?.behavior_type || ''
            defaultBehaviorTypeId = getMatchedBehaviorTypeId(firstBehaviorTypeName)
        }

        const defaultDoc4MisconductText = selectedDocumentType === 'จค.กก 4'
            ? (getMisconductSummary(misconductList.value) || '')
            : ''
        const defaultDocumentDate = new Date().toISOString().slice(0, 10)
        const defaultMeetingDate = selectedDocumentType === 'จค.กก 4'
            ? new Date().toISOString().slice(0, 10)
            : ''
        const defaultMeetingTime = selectedDocumentType === 'จค.กก 4' ? '08:30' : ''
        const defaultDoc5Actions = []

        const selectedCheck = await openMisconductModal(checked, {
            docType: selectedDocumentType,
            defaultDeadline: defaultDeadlineStr,
            defaultIncidentDate: defaultIncidentDateStr,
            defaultIncidentTime: defaultIncidentTimeStr,
            defaultIncidentLocation: '',
            defaultBehaviorTypeId,
            defaultOffenseCount: String(misconductList.value.length || 1),
            defaultPunishments: [],
            defaultPunishmentScore: '',
            defaultDoc4MisconductText,
            defaultDocumentDate,
            defaultMeetingDate,
            defaultMeetingTime,
            defaultDoc5GuardianName: '',
            defaultDoc5CurrentAddress: '',
            defaultDoc5Phone: '',
            defaultDoc5Relation: '',
            defaultDoc5StudentCareName: '',
            defaultDoc5Actions,
        })
        if (!selectedCheck) return
        checked = selectedCheck
    }

    loadingExport.value = true

    // จค.กก 1 Document
    try {
        const now = checked.documentDate ? new Date(`${checked.documentDate}T00:00:00`) : new Date()
        const followUpDate = checked.deadline ? new Date(`${checked.deadline}T00:00:00`) : new Date(now)
        if (!checked.deadline) {
            followUpDate.setDate(followUpDate.getDate() + 7)
        }

        const dateParts = getDocDateParts(now)
        const followUpParts = getDocDateParts(followUpDate)
        const studentName = props.studentInfo?.name || '................................................'
        const studentClass = formatGradeClassroomDisplay(props.studentInfo?.grade || 'ม....', props.studentInfo?.classroom || '....')

        let adviserName = ''
        let deputyDirectorName = ''
        let principalName = ''
        try {
            const classRoomsRes = await new ClassRoomService().getClassRooms()
            const classRooms = classRoomsRes?.data || []
            const matched = classRooms.find(
                r => r.grade === props.studentInfo?.grade &&
                    String(r.classroom) === String(props.studentInfo?.classroom)
            )
            adviserName = matched?.adviser?.name || ''

            try {
                const teachersRes = await new TeacherService().getTeachers()
                const teachers = teachersRes?.data || []
                const deputy = teachers.find(t => t.position === 'รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน')
                deputyDirectorName = deputy?.name || ''

                const principal = teachers.find(t => t.position === 'ผู้อำนวยการสถานศึกษา')
                principalName = principal?.name || ''
            } catch (_) { }
        } catch (_) { }

        const brandImageData = await loadBrandImage()

        const categoryRows = [
            ['แต่งกายผิดระเบียบบ่อยครั้ง', 'ทำลายทรัพย์สินของโรงเรียน'],
            ['หนีเรียน', 'พกพาอาวุธ'],
            ['ลักขโมย', 'ทำร้ายร่างกายผู้อื่น'],
            ['เล่นการพนัน', 'เสพย์สิ่งเสพติด'],
            ['ชู้สาว', 'ทะเลาะวิวาท'],
        ]

        let doc

        // ════ START: จค.กก 1 Document ════
        if (selectedDocumentType === 'จค.กก 1') {
            doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 567,
                                right: 873,
                            },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0 },
                                    children: [createRun(selectedDocumentType, { size: 24, bold: true, color: '000000' })],
                                }),
                            ],
                        }),
                    },
                    children: [
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 18, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            verticalAlign: 'center',
                                            children: brandImageData
                                                ? [new Paragraph({
                                                    spacing: { after: 0 },
                                                    children: [
                                                        new ImageRun({
                                                            data: brandImageData,
                                                            transformation: {
                                                                width: 65,
                                                                height: 65,
                                                            },
                                                        }),
                                                    ],
                                                })]
                                                : [createParagraph('')],
                                        }),
                                        new TableCell({
                                            width: { size: 64, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            verticalAlign: 'center',
                                            children: [createParagraph('บันทึกข้อความ', {
                                                alignment: AlignmentType.CENTER,
                                                bold: true,
                                                spacing: { after: 120 },
                                                size: 28,
                                            })],
                                        }),
                                        new TableCell({
                                            width: { size: 18, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            children: [createParagraph('')],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph([
                            createRun('ส่วนราชการ ', { bold: true }),
                            createRun('โรงเรียนเขาสวนกวางวิทยานุกูล  จังหวัดขอนแก่น'),
                        ]),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [createParagraph([
                                                createRun('ที่ '),
                                                createRun('..............................'),
                                            ], { spacing: { after: 40 } })],
                                        }),
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [createParagraph([
                                                createRun('วันที่ '),
                                                createRun(`${dateParts.day} เดือน ${dateParts.month} พ.ศ. ${dateParts.year}`),
                                            ], { spacing: { after: 40 } })],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                createRun('เรื่อง ', { bold: true }),
                                createRun('แจ้งนักเรียนประพฤติผิดระเบียบของโรงเรียน'),
                            ],
                            spacing: { after: 120 },
                            border: {
                                bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 10,
                                    color: '000000',
                                },
                            },
                        }),
                        createParagraph([
                            createRun('เรียน '),
                            createRun(`ครูที่ปรึกษาชั้น ${studentClass}`),
                        ]),
                        new Paragraph({
                            children: [
                                createRun('เนื่องด้วย '),
                                createRun(studentName),
                                createRun(` นักเรียนชั้น ${studentClass} ซึ่งเป็นนักเรียนในปกครองของท่านได้ประพฤติผิดระเบียบของโรงเรียน ในเรื่อง`),
                            ],
                            indent: {
                                firstLine: 720,
                            },
                            spacing: { after: 80 },
                        }),
                        new Table({
                            width: { size: 88, type: WidthType.PERCENTAGE },
                            alignment: AlignmentType.CENTER,
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                ...categoryRows.map(([left, right]) => new TableRow({
                                    children: [
                                        makeCell(`${checked.checkedLabels.has(left) ? '(/)' : '( )'}  ${left}`, 44),
                                        makeCell(`${checked.checkedLabels.has(right) ? '(/)' : '( )'}  ${right}`, 56),
                                    ],
                                })),
                                new TableRow({
                                    children: [
                                        makeCell(`(${checked.others ? '/' : ' '})  อื่น ๆ ${checked.others || '.........................................'}`, 44),
                                    ],
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                createRun(`จึงเรียนมาเพื่อโปรดทำการสอบสวนแล้วรายงานให้ทราบ (ตามแบบการสอบสวน ${selectedDocumentType}) ภายในวันที่ ${followUpParts.day} เดือน ${followUpParts.month} พ.ศ. ${followUpParts.year} เพื่อดำเนินการต่อไป`),
                            ],
                            indent: {
                                firstLine: 720,
                            },
                            spacing: { after: 80 },
                        }),
                        createParagraph(''),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        makeCell('', 46),
                                        new TableCell({
                                            width: { size: 54, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ................................................', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('(................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('เจ้าหน้าที่ส่งเสริมความประพฤติและวินัยนักเรียน', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(''),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                new Paragraph({
                                                    children: [createRun('รับทราบ')],
                                                    indent: { firstLine: 720 },
                                                    spacing: { after: 40 },
                                                }),
                                                createParagraph('ลงชื่อ................................................', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph(getSignatureName(adviserName), { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('ครูที่ปรึกษา', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                            ],
                                        }),
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: {
                                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                            },
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                new Paragraph({
                                                    children: [createRun('รับทราบ')],
                                                    indent: { firstLine: 720 },
                                                    spacing: { after: 40 },
                                                }),
                                                createParagraph('ลงชื่อ................................................', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('(................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('นักเรียน', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(''),
                        createParagraph('ลงชื่อ................................................', { alignment: AlignmentType.CENTER }),
                        createParagraph(getSignatureName(deputyDirectorName), { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                        createParagraph('รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน', { alignment: AlignmentType.CENTER }),
                    ],
                }],
            })

            // ════ END: จค.กก 1 Document ════

            // ════ START: จค.กก 1/1 Document ════
        } else if (selectedDocumentType === 'จค.กก 1/1') {
            const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
            const tableB = { top: nb, bottom: nb, left: nb, right: nb, insideHorizontal: nb, insideVertical: nb }
            const cellB = { top: nb, bottom: nb, left: nb, right: nb }
            const categoryRows1_1 = [
                ['แต่งกายผิดระเบียบบ่อยครั้ง', 'ทำลายทรัพย์สินของโรงเรียน', 'หนีเรียน'],
                ['พกพาอาวุธ', 'ลักขโมย', 'ทำร้ายร่างกายผู้อื่น'],
                ['เล่นการพนัน', 'เสพย์สิ่งเสพติด', 'ทะเลาะวิวาท'],
            ]
            doc = new Document({
                sections: [{
                    properties: { page: { margin: { top: 567, right: 873 } } },
                    headers: {
                        default: new Header({
                            children: [new Paragraph({
                                alignment: AlignmentType.RIGHT,
                                spacing: { after: 0 },
                                children: [createRun(selectedDocumentType, { size: 24, bold: true, color: '000000' })],
                            })],
                        }),
                    },
                    children: [
                        createParagraph('แบบบันทึกการสอบสวนนักเรียนประพฤติผิดระเบียบของโรงเรียน', {
                            alignment: AlignmentType.CENTER, bold: true, size: 28, spacing: { after: 120 },
                        }),
                        createParagraph('โรงเรียนเขาสวนกวางวิทยานุกูล  จังหวัดขอนแก่น', { alignment: AlignmentType.RIGHT, spacing: { after: 40 } }),
                        createParagraph([
                            createRun('วันที่  '),
                            createRun(`${dateParts.day}  เดือน  ${dateParts.month}  พ.ศ.  ${dateParts.year}`),
                        ], { alignment: AlignmentType.RIGHT, spacing: { after: 120 } }),
                        new Paragraph({
                            children: [
                                createRun('ข้าพเจ้า..........'),
                                createRun(studentName),
                                createRun('..........  เลขประจำตัว.......'),
                                createRun(props.studentInfo?.userid || '.......................'),
                                createRun('.......  เลขที่  ..............'),
                            ],
                            indent: { firstLine: 720 },
                            spacing: { after: 80 },
                        }),
                        createParagraph([
                            createRun(`นักเรียนชั้น ${studentClass}  ได้กระทำผิดระเบียบของโรงเรียนเรื่อง  `),
                            createRun('.............................................'),
                        ]),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                ...categoryRows1_1.map(([c1, c2, c3]) => new TableRow({
                                    children: [
                                        makeCell(`${checked.checkedLabels.has(c1) ? '(/)' : '( )'}  ${c1}`, 33),
                                        makeCell(`${checked.checkedLabels.has(c2) ? '(/)' : '( )'}  ${c2}`, 33),
                                        makeCell(`${checked.checkedLabels.has(c3) ? '(/)' : '( )'}  ${c3}`, 34),
                                    ],
                                })),
                                new TableRow({
                                    children: [
                                        makeCell('( )  ขัดขืนให้เกิดการทะเลาะวิวาท', 33),
                                        makeCell(`${checked.checkedLabels.has('ชู้สาว') ? '(/)' : '( )'}  ชู้สาว`, 33),
                                        makeCell(`(${checked.others ? '/' : ' '})  อื่น ๆ  ${checked.others || '.........................'}`, 34),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph([
                            createRun('เหตุเกิดเมื่อ  วันที่  '),
                            createRun(`${getDocDateParts(checked.incidentDate || now).day}  เดือน  ${getDocDateParts(checked.incidentDate || now).month}  พ.ศ.  ${getDocDateParts(checked.incidentDate || now).year}`),
                            createRun(`  เวลา  ${checked.incidentTime || '....................'} น.`),
                        ]),
                        createParagraph([
                            createRun('สถานที่เกิดเหตุ  '),
                            createRun(checked.incidentLocation || '...................................................................................................'),
                        ]),
                        new Paragraph({
                            children: [createRun('การกระทำของข้าพเจ้าดังกล่าว ข้าพเจ้าทราบว่าเป็นการกระทำที่ไม่ถูกต้อง และข้าพเจ้าเคยได้รับการอบรม')],
                            indent: { firstLine: 720 },
                        }),
                        new Paragraph({
                            children: [createRun('สั่งสอน และตักเตือนอยู่เสมอ ข้าพเจ้าทราบรายละเอียดทั้งหมดที่มีอยู่ในคู่มือนักเรียนของโรงเรียนเขาสวนกวางวิทยานุกูล')],
                        }),
                        new Paragraph({
                            children: [createRun('จังหวัดขอนแก่น แต่ข้าพเจ้ายังไม่ปฏิบัติตาม นับได้ว่าข้าพเจ้าได้เป็นผู้กระทำผิดระเบียบของโรงเรียน อันจะนำความเสื่อม')],
                        }),
                        new Paragraph({
                            children: [createRun('เสียชื่อเสียงมาสู่โรงเรียนและหมู่คณะ ข้าพเจ้ายินดีให้ทางโรงเรียนพิจารณาโทษได้ทุกกรณี')],
                            spacing: { after: 220 },
                        }),
                        createParagraph(''),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ................................................นักเรียน', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph(getSignatureName(studentName), { alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
                                            ],
                                        }),
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ................................................ผู้ปกครอง', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('(................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
                                            ],
                                        }),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ................................................ครูที่ปรึกษา', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph(getSignatureName(adviserName), { alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
                                            ],
                                        }),
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ................................................เจ้าหน้าที่', { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                                                createParagraph('(................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(''),
                        createParagraph('ลงชื่อ  ........................................', { alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
                        createParagraph(getSignatureName(deputyDirectorName), { alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
                        createParagraph('รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน', { alignment: AlignmentType.CENTER }),
                    ],
                }],
            })
            // ════ END: จค.กก 1/1 Document ════

            // ════ START: จค.กก 2 Document ════
        } else if (selectedDocumentType === 'จค.กก 2') {
            const nb = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
            const tableB = { top: nb, bottom: nb, left: nb, right: nb, insideHorizontal: nb, insideVertical: nb }
            const cellB = { top: nb, bottom: nb, left: nb, right: nb }
            const mark = (label) => checked.checkedLabels.has(label) ? '(/)' : '( )'
            const punishmentMark = (label) => checked.punishmentSelections?.has(label) ? '(/)' : '( )'
            const classText = formatGradeClassroomDisplay(props.studentInfo?.grade || '....', props.studentInfo?.classroom || '....')
            const selectedBehaviorTypeName = checked.behaviorTypeName || '........................................'
            const offenseCountText = checked.offenseCount || '........'
            const makeCompactCell = (text, width) => new TableCell({
                width: { size: width, type: WidthType.PERCENTAGE },
                borders: cellB,
                margins: { top: 30, bottom: 30, left: 60, right: 60 },
                children: [createParagraph(text, { spacing: { after: 10 } })],
            })

            doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 567,
                                right: 873,
                                bottom: 340,
                            },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0 },
                                    children: [createRun('จค.กก. 2', { size: 24, bold: true, color: '000000' })],
                                }),
                            ],
                        }),
                    },
                    children: [
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 18, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            verticalAlign: 'center',
                                            children: brandImageData
                                                ? [new Paragraph({
                                                    spacing: { after: 0 },
                                                    children: [
                                                        new ImageRun({
                                                            data: brandImageData,
                                                            transformation: {
                                                                width: 65,
                                                                height: 65,
                                                            },
                                                        }),
                                                    ],
                                                })]
                                                : [createParagraph('')],
                                        }),
                                        new TableCell({
                                            width: { size: 64, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            verticalAlign: 'center',
                                            children: [createParagraph('บันทึกข้อความ', {
                                                alignment: AlignmentType.CENTER,
                                                bold: true,
                                                spacing: { after: 120 },
                                                size: 28,
                                            })],
                                        }),
                                        new TableCell({
                                            width: { size: 18, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 40, bottom: 40, left: 40, right: 40 },
                                            children: [createParagraph('')],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph([
                            createRun('ส่วนราชการ ', { bold: true }),
                            createRun('กลุ่มบริหารกิจการนักเรียน  โรงเรียนเขาสวนกวางวิทยานุกูล  จังหวัดขอนแก่น'),
                        ]),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 45, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [createParagraph([
                                                createRun('ที่ ', { bold: true }),
                                                createRun('........................................'),
                                            ], { spacing: { after: 40 } })],
                                        }),
                                        new TableCell({
                                            width: { size: 55, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [createParagraph(`วันที่ ${dateParts.day} เดือน ${dateParts.month} พ.ศ. ${dateParts.year}`, { spacing: { after: 40 } })],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                createRun('เรื่อง ', { bold: true }),
                                createRun('รายงานการสอบสวนนักเรียนประพฤติผิดระเบียบของโรงเรียน'),
                            ],
                            spacing: { after: 100 },
                            border: {
                                bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 10,
                                    color: '000000',
                                },
                            },
                        }),
                        createParagraph([
                            createRun('เรียน ', { bold: true }),
                            createRun('ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล  จังหวัดขอนแก่น'),
                        ], { spacing: { after: 80 } }),
                        new Paragraph({
                            children: [
                                createRun('ด้วย '),
                                createRun(studentName),
                                createRun(` นักเรียนชั้น ${classText} ได้ประพฤติผิดระเบียบของโรงเรียนในเรื่อง`),
                            ],
                            indent: { firstLine: 720 },
                            spacing: { after: 80 },
                        }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${mark('แต่งกายผิดระเบียบบ่อยครั้ง')}  แต่งกายผิดระเบียบบ่อยครั้ง`, 33),
                                        makeCompactCell(`${mark('ทำลายทรัพย์สินของโรงเรียน')}  ทำลายทรัพย์สินของผู้อื่น`, 33),
                                        makeCompactCell(`${mark('หนีเรียน')}  หนีเรียน`, 34),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${mark('พกพาอาวุธ')}  พกพาอาวุธ`, 33),
                                        makeCompactCell(`${mark('ลักขโมย')}  ลักขโมย`, 33),
                                        makeCompactCell(`${mark('ทำร้ายร่างกายผู้อื่น')}  ทำร้ายร่างกายผู้อื่น`, 34),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${mark('เล่นการพนัน')}  เล่นการพนัน`, 33),
                                        makeCompactCell(`${mark('เสพย์สิ่งเสพติด')}  สิ่งเสพติด......................`, 33),
                                        makeCompactCell(`${mark('ทะเลาะวิวาท')}  ทะเลาะวิวาท`, 34),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCompactCell('( )  ชักนำให้เกิดการทะเลาะวิวาท', 33),
                                        makeCompactCell(`${mark('ชู้สาว')}  ชู้สาว`, 33),
                                        makeCompactCell(`(${checked.others ? '/' : ' '})  อื่น ๆ ${checked.others || '.......................................'}`, 34),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(`ซึ่งเป็นหมวดความผิดระเบียบวินัยสถานศึกษา ${selectedBehaviorTypeName} และนักเรียนทำผิดเป็นครั้งที่ ${offenseCountText}`,
                            { indent: { firstLine: 720 }, spacing: { after: 40 } }),
                        createParagraph([
                            createRun('โดยได้ทำการสอบสวนแล้วปรากฏว่า '),
                            createRun(studentName),
                            createRun(` ประพฤติผิดระเบียบของโรงเรียนจริงตามแบบ จค.กก. 1/1 ที่แนบมาพร้อมนี้`),
                        ]),
                        new Paragraph({
                            children: [createRun('จึงเรียนมาเพื่อโปรดทราบและดำเนินการต่อไป')],
                            indent: { firstLine: 720 },
                            spacing: { after: 120 },
                        }),
                        createParagraph('ลงชื่อ.................................................................', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph(getSignatureName(adviserName), { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph(`ครูที่ปรึกษาชั้น ${classText}`, { alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
                        createParagraph('การพิจารณาการลงโทษของกลุ่มบริหารกิจการนักเรียน', { bold: true, spacing: { after: 30 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${punishmentMark('ว่ากล่าวตักเตือน')}  ว่ากล่าวตักเตือน`, 50),
                                        makeCompactCell(`${punishmentMark('หักคะแนนความประพฤติ')}  หักคะแนนความประพฤติ ${checked.punishmentSelections?.has('หักคะแนนความประพฤติ') ? checked.punishmentScore || '........' : '........'} คะแนน`, 50),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${punishmentMark('ให้ทำกิจกรรมสาธารณประโยชน์')}  ให้ทำกิจกรรมสาธารณประโยชน์`, 50),
                                        makeCompactCell(`${punishmentMark('เชิญผู้ปกครองมารับทราบการสั่งพักการเรียน')}  เชิญผู้ปกครองมารับทราบการสั่งพักการเรียน`, 50),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCompactCell(`${punishmentMark('เชิญผู้ปกครองมาทัณฑ์บน')}  เชิญผู้ปกครองมาทัณฑ์บน`, 50),
                                        makeCompactCell(`${punishmentMark('เชิญผู้ปกครองมาให้ย้ายสถานศึกษา')}  เชิญผู้ปกครองมาให้ย้ายสถานศึกษา`, 50),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(''),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: tableB,
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ.................................................................', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                                                createParagraph('(................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                                                createParagraph('เจ้าหน้าที่ส่งเสริมความประพฤติและวินัยนักเรียน', { alignment: AlignmentType.CENTER }),
                                            ],
                                        }),
                                        new TableCell({
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                            borders: cellB,
                                            margins: { top: 60, bottom: 60, left: 60, right: 60 },
                                            children: [
                                                createParagraph('ลงชื่อ.................................................................', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                                                createParagraph(getSignatureName(deputyDirectorName), { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                                                createParagraph('รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน', { alignment: AlignmentType.CENTER }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph(''),
                        createParagraph('ความคิดเห็นของผู้อำนวยการโรงเรียน', { bold: true, spacing: { after: 40 } }),
                        createParagraph('..........................................................................................................................................................................', { spacing: { after: 20 } }),
                        createParagraph('..........................................................................................................................................................................', { spacing: { after: 40 } }),
                        createParagraph('ลงชื่อ.................................................................', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph(getSignatureName(principalName), { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph('ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล  จังหวัดขอนแก่น', { alignment: AlignmentType.CENTER }),
                    ],
                }],
            })
            // ════ END: จค.กก 2 Document ════

            // ════ START: จค.กก 4 Document ════
        } else if (selectedDocumentType === 'จค.กก 4') {
            const classText = formatGradeClassroomDisplay(props.studentInfo?.grade || 'ม....', props.studentInfo?.classroom || '....')
            const misconductSummary = checked.doc4MisconductText || '.................................................................................'
            const meetingParts = getDocDateParts(checked.meetingDate)
            const meetingTimeText = checked.meetingTime || '................'

            doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 567,
                                right: 873,
                                bottom: 567,
                            },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0 },
                                    children: [createRun('จค.กก. 4', { size: 24, bold: true, color: '000000' })],
                                }),
                            ],
                        }),
                    },
                    children: [
                        createParagraph('โรงเรียนเขาสวนกวางวิทยานุกูล   จังหวัดขอนแก่น', { alignment: AlignmentType.RIGHT, spacing: { after: 40 } }),
                        createParagraph(`วันที่ ${dateParts.day} เดือน ${dateParts.month} พ.ศ. ${dateParts.year}`, { alignment: AlignmentType.RIGHT, spacing: { after: 80 } }),
                        createParagraph([createRun('เรื่อง '), createRun('ขอเชิญผู้ปกครองพบเพื่อปรึกษาหารือ')], { spacing: { after: 60 } }),
                        createParagraph([createRun('เรียน '), createRun(`ผู้ปกครองของ ${studentName}`)], { spacing: { after: 220 } }),
                        createParagraph([
                            createRun('เนื่องด้วย '),
                            createRun(studentName),
                            createRun(` นักเรียนชั้น ${classText}`),
                        ], { indent: { firstLine: 720 }, spacing: { after: 40 } }),
                        createParagraph('โรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น ซึ่งเป็นนักเรียนในปกครองของท่าน ได้ประพฤติผิดระเบียบวินัยของโรงเรียนดังนี้'),
                        createParagraph(misconductSummary, { spacing: { after: 20 } }),
                        createParagraph(`จึงขอเชิญท่านไปพบที่โรงเรียนเขาสวนกวางวิทยานุกูล ในวันที่ ${meetingParts.day || '..............'} เดือน ${meetingParts.month || '..........................'} พ.ศ. ${meetingParts.year || '..............'} เวลา ${meetingTimeText} น.`, { indent: { firstLine: 720 } }),
                        createParagraph(`ที่กลุ่มบริหารกิจการนักเรียน เพื่อทราบรายละเอียดต่าง ๆ และร่วมมือกับทางโรงเรียนเพื่อหาวิธีปรับปรุงแก้ไขในทางที่ดี`),
                        createParagraph('หากท่านไม่ไปพบตามวันเวลาดังกล่าวทางโรงเรียนถือว่าท่านไม่ประสงค์ให้เด็กในความปกครองของท่านเรียนใน'),
                        createParagraph('โรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น โรงเรียนจะพิจารณาดำเนินการต่อไป', { spacing: { after: 220 } }),
                        createParagraph('จึงเรียนมาเพื่อทราบและหวังว่าจะได้รับความร่วมมือจากท่านเป็นอย่างดี', { alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
                        createParagraph('ขอแสดงความนับถือ', { alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
                        createParagraph('', { alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
                        createParagraph(getSignatureName(principalName), { alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
                        createParagraph('ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูล จังหวัดขอนแก่น', { alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
                        createParagraph('..........................................................................................................................................................................', { spacing: { after: 40 } }),
                        createParagraph('แบบตอบรับ', { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 40 } }),
                        createParagraph('เรียน    ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูลิทยานุกูล    จังหวัดขอนแก่น'),
                        createParagraph('          ข้าพเจ้า........................................................ผู้ปกครองของ........................................................'),
                        createParagraph(`นักเรียนชั้น ม....../......   ( ) ยินดี   ( ) ขัดข้อง  มาตามวันที่นัดหมายคือวันที่........เดือน....................พ.ศ....................`),
                        createParagraph('หรือ  ขอเลื่อนเป็นวันที่........เดือน....................พ.ศ....................', { spacing: { after: 40 } }),
                        createParagraph('          จึงเรียนมาเพื่อทราบ', { spacing: { after: 100 } }),
                        createParagraph('ลงชื่อ........................................................', { alignment: AlignmentType.CENTER }),
                        createParagraph('(....................................................)', { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph('ผู้ปกครอง', { alignment: AlignmentType.CENTER }),
                    ],
                }],
            })
            // ════ END: จค.กก 4 Document ════

            // ════ START: จค.กก 5 Document ════
        } else if (selectedDocumentType === 'จค.กก 5') {
            const classText = formatGradeClassroomDisplay(props.studentInfo?.grade || 'ม....', props.studentInfo?.classroom || '....')
            const studentCode = props.studentInfo?.userid || '................'
            const guardianNameText = checked.doc5GuardianName || '.....................................................'
            const currentAddressText = checked.doc5CurrentAddress || '...................................................'
            const phoneText = checked.doc5Phone || '................................'
            const relationText = checked.doc5Relation || '................................'
            const studentCareNameText = checked.doc5StudentCareName || '........................................'
            const actionMark = (label) => checked.doc5Actions?.has(label) ? '(/)' : '( )'

            doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 567,
                                right: 873,
                                bottom: 567,
                            },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0 },
                                    children: [createRun('จค.กก. 5', { size: 24, bold: true, color: '000000' })],
                                }),
                            ],
                        }),
                    },
                    children: [
                        createParagraph('บันทึกการทำทัณฑ์บนกับนักเรียน', { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 80 } }),
                        createParagraph('โรงเรียนเขาสวนกวางวิทยานุกูลิทยานุกูล   จังหวัดขอนแก่น่น', { alignment: AlignmentType.RIGHT, spacing: { after: 40 } }),
                        createParagraph('อำเภอเมือง   จังหวัดขอนแก่น', { alignment: AlignmentType.RIGHT, spacing: { after: 40 } }),
                        createParagraph(`วันที่ ${dateParts.day} เดือน ${dateParts.month} พ.ศ. ${dateParts.year}`, { alignment: AlignmentType.RIGHT, spacing: { after: 80 } }),

                        createParagraph(`ข้าพเจ้า ${guardianNameText} เป็นผู้ปกครองของ ${studentName}`, { indent: { firstLine: 720 }, spacing: { after: 30 } }),
                        createParagraph(`นักเรียนชั้น ${classText} เลขประจำตัว ${studentCode} ปัจจุบันที่อยู่ ${currentAddressText}`, { spacing: { after: 30 } }),
                        ...(checked.doc5CurrentAddress
                            ? []
                            : [createParagraph('ตำบล................................อำเภอ................................จังหวัด................................', { spacing: { after: 30 } })]),
                        createParagraph(`หมายเลขโทรศัพท์(ที่สามารถติดต่อได้) ${phoneText} เกี่ยวข้องกับนักเรียนเป็น ${relationText}`, { spacing: { after: 30 } }),
                        createParagraph(`ได้รับทราบความผิดของ ${studentName} ที่ได้กระทำไปแล้ว`, { spacing: { after: 60 } }),

                        createParagraph('เป็นการกระทำที่ไม่เหมาะสมกับสภาพความเป็นนักเรียนอย่างยิ่ง จึงยินยอมทำทัณฑ์บนไว้ให้แก่', { indent: { firstLine: 720 }, spacing: { after: 30 } }),
                        createParagraph(`${studentName} นักเรียนโรงเรียนเขาสวนกวางวิทยานุกูลิทยานุกูล จังหวัดขอนแก่น ว่าข้าพเจ้า`, { spacing: { after: 30 } }),
                        createParagraph(`จะควบคุมดูแลและกวดขันให้${studentCareNameText} ซึ่งเป็นนักเรียนในความปกครองของข้าพเจ้า`, { spacing: { after: 30 } }),
                        createParagraph('ไม่ให้ประพฤติเช่นนี้อีกต่อไป อันจะนำความเสื่อมเสียมาสู่ตนเอง สถานศึกษา และจะเข้มงวดให้', { spacing: { after: 30 } }),
                        createParagraph(`${studentName} ปฏิบัติตามระเบียบวินัยของโรงเรียนโดยเคร่งครัด`, { spacing: { after: 30 } }),
                        createParagraph(`หากปรากฏว่า ${studentName} ประพฤติผิดทำนองนี้อีกหรือ`, { indent: { firstLine: 720 }, spacing: { after: 30 } }),
                        createParagraph('อย่างอื่นอันเป็นการฝ่าฝืนทัณฑ์บนนี้ไม่ว่ากรณีใดๆ ข้าพเจ้ายินยอมให้โรงเรียนพิจารณาสภาพความเป็นนักเรียน โดย', { spacing: { after: 30 } }),
                        createParagraph(`ดำเนินการดังนี้   ${actionMark('สั่งพักการเรียน')}  สั่งพักการเรียน                 ${actionMark('ให้ย้ายสถานศึกษา')}  ให้ย้ายสถานศึกษา`, { spacing: { after: 90 } }),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        makeCell('', 28),
                                        makeCell('ลงชื่อ.....................................................ผู้ทำทัณฑ์บน(ผู้ปกครอง)', 72),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCell('', 28),
                                        makeCell('ลงชื่อ.....................................................นักเรียนผู้กระทำความผิด', 72),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCell('', 28),
                                        makeCell('ลงชื่อ.....................................................ครูที่ปรึกษา', 72),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCell('', 28),
                                        makeCell('ลงชื่อ.....................................................เจ้าหน้าที่ส่งเสริมความประพฤติและวินัยนักเรียน', 72),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        makeCell('', 28),
                                        makeCell('ลงชื่อ.....................................................รองผู้อำนวยการกลุ่มบริหารกิจการนักเรียน', 72),
                                    ],
                                }),
                            ],
                        }),
                        createParagraph('', { spacing: { after: 20 } }),

                        createParagraph('บันทึกเพิ่มเติม', { bold: true, underline: {}, spacing: { after: 20 } }),
                        createParagraph('..............................................................................................................................................................', { spacing: { after: 20 } }),
                        createParagraph('..............................................................................................................................................................', { spacing: { after: 20 } }),
                        createParagraph('..............................................................................................................................................................', { spacing: { after: 320 } }),
                        createParagraph('', { alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
                        createParagraph(getSignatureName(principalName), { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
                        createParagraph('ผู้อำนวยการโรงเรียนเขาสวนกวางวิทยานุกูลิทยานุกูล จังหวัดขอนแก่น', { alignment: AlignmentType.CENTER }),
                    ],
                }],
            })
            // ════ END: จค.กก 5 Document ════
        }

        const blob = await Packer.toBlob(doc)
        const safeDocType = String(selectedDocumentType || 'document').replace(/[\\/:*?"<>|]/g, '-')
        const fileName = `${safeDocType}.docx`
        saveAs(blob, fileName)
    } catch (error) {
        console.error(error)
        await Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกเอกสารได้', 'error')
    } finally {
        loadingExport.value = false
    }
}
</script>
