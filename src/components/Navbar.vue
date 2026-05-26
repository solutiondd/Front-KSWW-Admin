<template>
    <header class="navbar bg-base-100 shadow-md px-6 max-[944px]:fixed max-[944px]:top-0 max-[944px]:left-0 max-[944px]:w-full max-[944px]:z-30">
        <button @click="toggleMobileMenu" class="btn btn-ghost btn-circle mr-2 max-[944px]:flex hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div class="flex-1">
            <h1 class="text-xl font-semibold">{{ pageTitle }}</h1>
        </div>

        <div class="flex-none gap-4">
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div
                        class="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center shadow-md overflow-hidden">
                        <img v-if="showProfileImage" :src="profilePictureUrl" alt="profile"
                            class="w-full h-full object-cover" @error="showProfileImage = false" />
                        <span v-else class="text-lg font-semibold">{{ getProfileInitial(profileName) }}</span>
                    </div>
                </div>
                <ul tabindex="0"
                    class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-72">
                    <li>
                        <a class="justify-between">
                            {{ profileName || 'โปรไฟล์' }}
                            <span class="badge">{{ residentRole }}</span>
                        </a>
                    </li>
                    <li><a @click="goToUpdatePassword">ตั้งค่ารหัสผ่าน</a></li>
                    <li><a @click="handleLogout">ออกจากระบบ</a></li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits(['toggleMobileMenu'])

const pageTitle = computed(() => {
    const path = route.path
    if (path.startsWith('/home/teacher') || path.startsWith('/home/student')) {
        return 'จัดการบุคลากร'
    }
    if (path.startsWith('/home/department') || path.startsWith('/home/position') || path.startsWith('/home/classroom') || path.startsWith('/home/holidays')) {
        return 'จัดการโครงสร้าง'
    }
    if (path.startsWith('/home/device') || path.startsWith('/home/model')) {
        return 'จัดการอุปกรณ์'
    }
    if (path.startsWith('/home/report')) {
        return 'รายงาน'
    }
    if (path.startsWith('/home/account')) {
        return 'จัดการผู้ดูแล'
    }
    const titles = {
        'Dashboard': 'แดชบอร์ด',
        'Teacher': 'จัดการบุคลากร',
        'Student': 'จัดการนักเรียน',
        'Account': 'จัดการผู้ดูแล'
    }
    return titles[route.name] || 'ระบบจัดการ'
})

const goToUpdatePassword = () => {
    router.push('/update-password')
}

const toggleMobileMenu = () => {
    emit('toggleMobileMenu')
}

const handleLogout = async () => {
    const result = await Swal.fire({
        title: 'ยืนยันการออกจากระบบ',
        text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
    })
    if (result.isConfirmed) {
        authStore.logout()
        localStorage.removeItem('profileName')
        localStorage.removeItem('profilePicture')
        localStorage.removeItem('residentRole')
        localStorage.removeItem('classroom')
        localStorage.removeItem('grade')
        router.push('/')
    }
}

const profileName = ref(localStorage.getItem('profileName') || '')
const profilePicture = ref(localStorage.getItem('profilePicture') || '')
const residentRole = ref(localStorage.getItem('residentRole') || '')

const profilePictureUrl = computed(() => {
    if (!profilePicture.value) return ''
    const baseUrl = import.meta.env.VITE_IMG_PROFILE_URL || ''
    return profilePicture.value.startsWith('http')
        ? profilePicture.value
        : baseUrl + profilePicture.value
})

const showProfileImage = ref(!!profilePicture.value)

const getProfileInitial = (name) => {
    if (!name) return 'A'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '')
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '')
    }
    return parts[0][0] || 'A'
}

watch(profilePicture, (val) => {
    showProfileImage.value = !!val
})
</script>

<style scoped></style>
