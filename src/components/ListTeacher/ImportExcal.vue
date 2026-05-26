<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-primary">นำเข้าข้อมูลครูจาก Excel 📝</h3>
                <button class="btn btn-sm btn-circle btn-ghost" @click="closeModal">✕</button>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 mb-4 p-4 border rounded-lg bg-base-200">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">เลือกไฟล์ Excel (.xlsx, .xls)</span>
                    </label>
                    <input type="file" accept=".xlsx,.xls" @change="onExcelChange"
                        class="file-input file-input-bordered file-input-sm w-full max-w-xs" />
                    <p v-if="excelFile" class="text-xs text-success mt-1">ไฟล์ที่เลือก: {{ excelFile.name }}</p>
                    <div class="mt-2">
                        <a :href="exampleExcelUrl" download class="link link-primary text-xs">
                            ดาวน์โหลดไฟล์ตัวอย่าง Excel
                        </a>
                    </div>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">เลือกไฟล์รูปภาพ (หลายไฟล์ได้)</span>
                    </label>
                    <input type="file" accept="image/*" multiple @change="onImagesChange"
                        class="file-input file-input-bordered file-input-sm w-full max-w-xs" />
                    <p v-if="imageFiles.length" class="text-xs text-success mt-1">รูปภาพที่เลือก: {{ imageFiles.length
                    }} ไฟล์</p>
                    <p class="text-xs text-gray-500 mt-1">กรุณาตั้งชื่อไฟล์รูปภาพให้ตรงกับคอลัมน์ ชื่อรูป เช่น
                        <b>image001.jpg</b>
                        เพื่อให้ระบบแมปข้อมูลอัตโนมัติ
                    </p>
                </div>
            </div>

            <div class="flex gap-2">
                <button class="btn btn-warning" @click="previewExcel" :disabled="!excelFile || isPreviewing">
                    <span v-if="isPreviewing" class="loading loading-spinner"></span>
                    ดูตัวอย่าง
                </button>
            </div>

            <div v-if="previewData.length" class="mt-6">
                <h3 class="font-bold mb-2 text-secondary">ตัวอย่างข้อมูลครู ({{ previewData.length }} แถว)</h3>
                <div class="overflow-x-auto max-h-96">
                    <table class="table table-zebra w-full table-sm">
                        <thead>
                            <tr class="bg-base-300">
                                <th>รหัส</th>
                                <th>คำนำหน้า</th>
                                <th>ชื่อ</th>
                                <th>นามสกุล</th>
                                <th>รหัสบัตร</th>
                                <th>ตำแหน่ง</th>
                                <th>แผนก</th>
                                <th>ชื่อรูปภาพ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(teacher, idx) in pagedPreviewData" :key="idx">
                                <td>{{ teacher.userid }}</td>
                                <td>{{ teacher.pre_name }}</td>
                                <td>{{ teacher.first_name }}</td>
                                <td>{{ teacher.last_name }}</td>
                                <td>{{ teacher.rfid || '-' }}</td>
                                <td>{{ teacher.position }}</td>
                                <td>{{ teacher.department }}</td>
                                <td>
                                    <span
                                        :class="teacher.imageMatched ? 'text-success font-semibold' : 'text-error font-semibold'">
                                        {{ teacher.imageName || '-' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-xs mt-2">
                    <span class="text-success font-semibold">สีเขียว</span> = จับคู่ไฟล์รูปได้,
                    <span class="text-error font-semibold">สีแดง</span> = ยังไม่พบไฟล์รูปที่ตรงกับคอลัมน์ชื่อรูป
                </p>
                <div class="flex justify-center items-center gap-2 mt-2">
                    <button class="btn btn-xs" @click="currentPage--" :disabled="currentPage === 1">‹</button>
                    <span class="text-xs">หน้า {{ currentPage }} / {{ totalPages }}</span>
                    <button class="btn btn-xs" @click="currentPage++" :disabled="currentPage === totalPages">›</button>
                </div>
                <button class="btn btn-success mt-4" @click="handleImport" :disabled="isImporting">
                    <span v-if="isImporting" class="loading loading-spinner"></span>
                    ✅ บันทึกและนำเข้าข้อมูล
                </button>
            </div>

            <div v-if="!excelFile && !previewData.length" class="text-center p-8 text-gray-500">
                กรุณาเลือกไฟล์ Excel เพื่อเริ่มต้นการนำเข้า
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="closeModal">close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TeacherService } from '../../api/teacher'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'

async function resizeImage(file, maxSizeKB = 70, targetWidth = 450) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxBytes = maxSizeKB * 1024;
                let width = targetWidth > 0 ? targetWidth : img.width;
                let height = Math.max(1, Math.round((img.height * width) / img.width));
                let quality = 0.9;

                function tryCompress() {
                    canvas.width = Math.max(1, Math.round(width));
                    canvas.height = Math.max(1, Math.round(height));
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((b) => {
                        if (!b) return reject('บีบอัดรูปไม่สำเร็จ');

                        if (b.size <= maxBytes) {
                            resolve(b);
                            return;
                        }

                        if (quality > 0.45) {
                            quality -= 0.07;
                            tryCompress();
                            return;
                        }

                        if (width > 120) {
                            width = Math.max(120, Math.round(width * 0.9));
                            height = Math.max(1, Math.round((img.height * width) / img.width));
                            quality = 0.9;
                            tryCompress();
                            return;
                        }

                        reject(`ไม่สามารถบีบอัดรูปให้ไม่เกิน ${maxSizeKB}KB ได้`);
                    }, 'image/jpeg', quality);
                }

                tryCompress();
            };
            img.onerror = () => reject('ไฟล์รูปไม่ถูกต้อง');
            img.src = e.target.result;
        };
        reader.onerror = () => reject('อ่านไฟล์รูปไม่สำเร็จ');
        reader.readAsDataURL(file);
    });
}

function mapHeader(header, row) {
    const keys = Object.keys(row)
    return keys.find(k => k.trim().toLowerCase() === header.trim().toLowerCase())
        ? row[keys.find(k => k.trim().toLowerCase() === header.trim().toLowerCase())]
        : undefined
}

const excelFile = ref(null)
const imageFiles = ref([])
const previewData = ref([])
const currentPage = ref(1)
const pageSize = 5
const pagedPreviewData = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return previewData.value.slice(start, start + pageSize)
})
const totalPages = computed(() => Math.ceil(previewData.value.length / pageSize) || 1)
const isPreviewing = ref(false)
const isImporting = ref(false)
const modalRef = ref(null)

const exampleExcelUrl = '/Excal-Teacher.xlsx'

const emit = defineEmits(['success'])
const teacherService = new TeacherService()

const openModal = () => {
    modalRef.value?.showModal()
}

const closeModal = () => {
    modalRef.value?.close()
    excelFile.value = null
    imageFiles.value = []
    previewData.value = []
    isPreviewing.value = false
    isImporting.value = false
}

defineExpose({ openModal })

function onExcelChange(e) {
    excelFile.value = e.target.files[0]
    previewData.value = []
    currentPage.value = 1
    e.target.value = null
}
function onImagesChange(e) {
    imageFiles.value = Array.from(e.target.files)
    e.target.value = null
    if (excelFile.value) {
        previewExcel()
    }
}

function previewExcel() {
    if (!excelFile.value) {
        Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกไฟล์ Excel ก่อน', 'warning')
        return
    }

    isPreviewing.value = true
    previewData.value = []
    currentPage.value = 1

    const getImageName = (key) => {
        key = key?.toString().trim();
        const found = imageFiles.value.find(file => file.name.split('.')[0].toString().trim() === key);
        return found ? found.name : '';
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
        try {
            const data = new Uint8Array(evt.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const json = XLSX.utils.sheet_to_json(sheet)

            if (!json || json.length === 0) {
                Swal.fire('ข้อมูลว่างเปล่า', 'ไม่พบข้อมูลในไฟล์ Excel ที่เลือก', 'warning')
            } else {
                previewData.value = json.map(row => {
                    const userid = (mapHeader('รหัส', row) || mapHeader('userid', row) || '').toString().trim();
                    const imageNameFromSheet = (
                        mapHeader('ชื่อรูป', row) ||
                        mapHeader('ชื่อรูปภาพ', row) ||
                        mapHeader('image_name', row) ||
                        mapHeader('imageName', row)
                    )?.toString().trim() || '';

                    const imageLookupKey = (imageNameFromSheet || userid)
                        .toString()
                        .trim()
                        .replace(/\.[^/.]+$/, '');

                    const matchedImageName = getImageName(imageLookupKey);
                    const imageMatched = Boolean(matchedImageName);

                    return {
                        userid,
                        pre_name: mapHeader('คำนำหน้า', row) || mapHeader('pre_name', row) || '',
                        first_name: mapHeader('ชื่อ', row) || mapHeader('first_name', row) || '',
                        last_name: mapHeader('นามสกุล', row) || mapHeader('last_name', row) || '',
                        rfid: (mapHeader('รหัสบัตร (rfid)', row) || mapHeader('rfid', row) || '').toString().trim(),
                        position: mapHeader('ตำแหน่ง', row) || mapHeader('position', row) || '',
                        department: mapHeader('แผนก', row) || mapHeader('department', row) || '',
                        status: 'ปกติ',
                        imageName: matchedImageName || imageNameFromSheet,
                        imageMatched
                    }
                })
            }

        } catch (error) {
            console.error('Error reading Excel:', error)
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอ่านไฟล์ Excel ได้ ลองตรวจสอบรูปแบบไฟล์', 'error')
            previewData.value = []
        } finally {
            isPreviewing.value = false
        }
    }
    reader.onerror = () => {
        isPreviewing.value = false
        Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดไฟล์', 'error')
    }
    reader.readAsArrayBuffer(excelFile.value)
}

async function handleImport() {
    if (!previewData.value.length || !excelFile.value) {
        Swal.fire('แจ้งเตือน', 'กรุณาดูตัวอย่างข้อมูลและตรวจสอบความถูกต้องก่อนบันทึก', 'warning')
        return
    }

    isImporting.value = true
    try {
        const imageMap = {};
        const resizedImageCache = {};
        for (const file of imageFiles.value) {
            const baseName = file.name.split('.')[0];
            if (file.type.startsWith('image/')) {
                imageMap[baseName] = file;
            }
        }

        async function getResizedImageByKey(key) {
            const normalizedKey = (key || '')
                .toString()
                .trim()
                .replace(/\.[^/.]+$/, '');

            if (!normalizedKey) return null;

            if (resizedImageCache[normalizedKey]) {
                return resizedImageCache[normalizedKey];
            }

            const sourceFile = imageMap[normalizedKey];
            if (!sourceFile) return null;

            try {
                const resizedBlob = await resizeImage(sourceFile, 70, 450);
                const resizedFile = new File([resizedBlob], sourceFile.name, { type: 'image/jpeg' });
                resizedImageCache[normalizedKey] = resizedFile;
                return resizedFile;
            } catch (err) {
                return null;
            }
        }

        function cleanLastName(val) {
            if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '')) return '';
            if (val === '-') return ' ';
            if (typeof val === 'string' && val.trim() === '-') return ' ';
            return val;
        }

        function cleanRfid(val) {
            if (val === undefined || val === null) return '';
            const text = String(val).trim();
            if (!text || text === '-') return '';
            return text;
        }

        const importedTeachers = [];
        const failedTeachers = [];
        for (const teacher of previewData.value) {
            const cleanedTeacher = {
                ...teacher,
                last_name: cleanLastName(teacher.last_name),
                rfid: cleanRfid(teacher.rfid)
            };

            const imageNameKey = (cleanedTeacher.imageName || '')
                .toString()
                .trim()
                .replace(/\.[^/.]+$/, '');

            const resolvedImageFile = await getResizedImageByKey(imageNameKey)
                || await getResizedImageByKey(cleanedTeacher.userid);

            const formData = {
                userid: cleanedTeacher.userid,
                pre_name: cleanedTeacher.pre_name,
                first_name: cleanedTeacher.first_name,
                last_name: cleanedTeacher.last_name,
                position: cleanedTeacher.position,
                department: cleanedTeacher.department,
                rfid: cleanedTeacher.rfid,
                status: 'ปกติ',
                picture: resolvedImageFile || null
            };
            try {
                const response = await teacherService.createTeacher(formData);
                if (response.message === 'Success') {
                    importedTeachers.push(response.data);
                } else {
                    failedTeachers.push({
                        userid: cleanedTeacher.userid,
                        name: `${cleanedTeacher.pre_name}${cleanedTeacher.first_name} ${cleanedTeacher.last_name}`,
                        reason: response.message || 'ไม่ทราบสาเหตุ'
                    });
                }
            } catch (err) {
                const apiError = err?.response?.data;
                let reason = apiError?.error || apiError?.message || err.message || 'ไม่ทราบสาเหตุ';
                if (apiError?.message === 'Validation error' && apiError?.error?.includes('"pre_name" must be one of')) {
                    reason = 'คำนำหน้าไม่ถูกต้อง กรุณาตรวจสอบ เช่น นาย, นาง, นางสาว, Mr., Ms., Mrs.';
                } else if (apiError?.message === 'Duplicate data' && apiError?.error?.includes('duplicate teacher userid')) {
                    reason = 'รหัสนี้มีคนใช้งานแล้ว กรุณาตรวจสอบข้อมูลในไฟล์ Excel';
                } else if (reason === '"last_name" is not allowed to be empty' || reason === 'last_name" is not allowed to be empty') {
                    reason = 'กรุณากรอกนามสกุล';
                } else if (/fails to match the required pattern/.test(reason) && /last_name/.test(reason)) {
                    reason = 'นามสกุลต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น';
                } else if (/fails to match the required pattern/.test(reason) && /first_name/.test(reason)) {
                    reason = 'ชื่อต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น';
                } else if (/is required/.test(reason)) {
                    reason = 'กรุณากรอกข้อมูลให้ครบถ้วน';
                }
                failedTeachers.push({
                    userid: cleanedTeacher.userid,
                    name: `${cleanedTeacher.pre_name}${cleanedTeacher.first_name} ${cleanedTeacher.last_name}`,
                    reason
                });
            }
        }

        let msg = `<div style='text-align:left;'>`
            + `บันทึกสำเร็จ <b>${importedTeachers.length}</b> รายการ`
            + `<br>บันทึกไม่สำเร็จ <b>${failedTeachers.length}</b> รายการ`;
        if (failedTeachers.length > 0) {
            msg += `<br><br><b>รายการที่บันทึกไม่สำเร็จ:</b>`;
            msg += `<div style='max-height:220px;overflow:auto;'><table style='border-collapse:collapse;width:100%;font-size:13px;'>`;
            msg += `<thead><tr style='background:#f3f4f6;'><th style='border:1px solid #ddd;padding:4px;'>รหัส</th><th style='border:1px solid #ddd;padding:4px;'>ชื่อ</th><th style='border:1px solid #ddd;padding:4px;'>สาเหตุ</th></tr></thead><tbody>`;
            msg += failedTeachers.map(f => {
                return `<tr><td style='border:1px solid #ddd;padding:4px;'>${f.userid}</td><td style='border:1px solid #ddd;padding:4px;'>${f.name}</td><td style='border:1px solid #ddd;padding:4px;color:#b91c1c;'>${f.reason}</td></tr>`;
            }).join('');
            msg += `</tbody></table></div>`;
        }
        msg += `</div>`;
        Swal.fire({
            title: 'สำเร็จ',
            html: msg,
            icon: failedTeachers.length > 0 ? 'warning' : 'success',
            width: 600
        });
        emit('success', importedTeachers);
        closeModal();
    } catch (e) {
        console.error('Import error:', e);
        const errorMessage = e.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล';
        Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    } finally {
        isImporting.value = false;
    }
}
</script>
