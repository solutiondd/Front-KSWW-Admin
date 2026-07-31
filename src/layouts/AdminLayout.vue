<template>
    <div class="bg flex min-h-screen bg-base-200">
        <SideBar ref="sidebarRef" />
        <div class="flex-1 flex flex-col">
            <Navbar @toggleMobileMenu="handleToggleMobileMenu" />
            <main class="flex-1 p-2 min-[410px]:p-5">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '../components/SideBar.vue'
import Navbar from '../components/Navbar.vue'

const sidebarRef = ref(null)

const handleToggleMobileMenu = () => {
    if (sidebarRef.value) {
        sidebarRef.value.toggleMobileMenu()
    }
}
</script>

<style scoped>
.bg{
    background: linear-gradient(120deg, #1e3a8a 50%, #ffbc40 80%, #ff8a65 100%);
}
</style>
