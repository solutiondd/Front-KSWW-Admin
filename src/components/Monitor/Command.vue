<template>
  <div class="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
    <h2 class="text-xl font-bold text-gray-800">ตั้งค่ามอนิเตอร์</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">ตั้งค่า</label>
        <select v-model="form.cmd" @change="handleCmdChange" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" required>
          <option value="switch">เวลาเปิดปิด</option>
          <option value="change">เปลี่ยนสถานะสตรีม</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">อุปกรณ์ (sn)</label>
        <select v-model="form.sn" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" required>
          <option value="" disabled>-- เลือก --</option>
          <option v-for="device in devices" :key="device._id" :value="device.serial_number">
            {{ device.location }} ({{ device.serial_number }})
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">กำหนด</label>
        
        <div v-if="form.cmd === 'switch'" class="flex items-center space-x-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">เวลาเปิด</label>
            <input 
              type="time" 
              v-model="switchTime.open" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
              required 
            />
          </div>
          <span class="pt-5 text-gray-500">ถึง</span>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">เวลาปิด</label>
            <input 
              type="time" 
              v-model="switchTime.close" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
              required 
            />
          </div>
        </div>

        <div v-if="form.cmd === 'change'">
          <select v-model="form.data" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" required>
            <option value="" disabled>-- เลือก --</option>
            <option value="stream">เปิดสตีม</option>
            <option value="img">ปิดสตีม (แสดงรูปภาพ)</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        class="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        :disabled="loading"
      >
        {{ loading ? 'Sending...' : 'ส่งคำสั่ง' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DeviceService from '../../api/device'
import Swal from 'sweetalert2'

const devices = ref([])
const loading = ref(false)

const form = ref({
  cmd: 'switch',
  sn: '',
  data: ''
})

const switchTime = ref({
  open: '',
  close: ''
})

const fetchDevices = async () => {
  try {
    const res = await DeviceService.getDevices()
    devices.value = res.data || res 
  } catch (error) {
    console.error('Failed to load devices', error)
  }
}

onMounted(() => {
  fetchDevices()
})

const handleCmdChange = () => {
  form.value.data = ''
  switchTime.value.open = ''
  switchTime.value.close = ''
}

const handleSubmit = async () => {
  loading.value = true

  if (form.value.cmd === 'switch') {
    form.value.data = `${switchTime.value.open}, ${switchTime.value.close}`
  }

  try {
    const response = await DeviceService.sendCommand(form.value)
    console.log(response)
    
    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'ส่งคำสั่งเรียบร้อยแล้ว',
      confirmButtonText: 'ตกลง'
    })
  } catch (error) {
    console.error(error)
    
    const errorMsg = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการส่งคำสั่ง'
    
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: errorMsg,
      confirmButtonText: 'ตกลง'
    })
  } finally {
    loading.value = false
  }
}
</script>