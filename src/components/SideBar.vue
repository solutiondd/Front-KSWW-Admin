<template>
    <div v-if="isMobileMenuOpen" @click="closeMobileMenu"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"></div>

    <aside @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" :class="[
        'min-h-screen bg-base-100 shadow-lg transition-all duration-300 ease-in-out relative',
        isExpanded ? 'w-64' : 'w-20',
        'max-[944px]:fixed max-[944px]:top-0 max-[944px]:left-0 max-[944px]:h-full max-[944px]:z-50',
        isMobileMenuOpen ? 'max-[944px]:translate-x-0' : 'max-[944px]:-translate-x-full'
    ]">

        <button @click="toggleSidebar"
            class="absolute -right-3 top-6 bg-orange-300 text-secondary-content rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform z-10 max-[944px]:hidden">
            <svg xmlns="http://www.w3.org/2000/svg"
                :class="['h-4 w-4 transition-transform', isExpanded ? '' : 'rotate-180']" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>

        <div class="p-4 border-b overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src="/src/assets/KSWW-logo.png" alt="KSWW Logo" class="w-full h-full object-contain" />
                </div>
                <div v-show="isExpanded" class="transition-opacity duration-300">
                    <h2 class="text-lg font-bold text-primary whitespace-nowrap">รร.เขาสวนกวางวิทยานุกูล</h2>
                    <p class="text-sm text-secondary font-medium whitespace-nowrap">จังหวัดขอนแก่น</p>
                </div>
            </div>
        </div>

        <nav class="menu p-4 max-[944px]:overflow-y-auto max-[944px]:h-[calc(100vh-96px)]">
            <ul class="space-y-2">
                <li>
                    <router-link to="/home/dashboard"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors relative group"
                        :class="{ 'bg-primary text-primary-content': isActive('/home/dashboard') }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">หน้าหลัก</span>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            หน้าหลัก
                        </div>
                    </router-link>
                </li>

                <li>
                    <div @click="togglePersonnel"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer relative group"
                        :class="{ 'bg-primary text-primary-content': isPersonnelActive }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">จัดการบุคลากร</span>
                        <svg v-show="isExpanded" xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 ml-auto transition-transform', isPersonnelOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            จัดการบุคลากร
                        </div>
                    </div>

                    <ul v-show="isExpanded && isPersonnelOpen" class="ml-4 mt-2 space-y-2">
                        <li v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'discipline'">
                            <router-link to="/home/teacher"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/teacher')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span class="text-sm">จัดการบุคลากร</span>
                            </router-link>
                        </li>

                        <li>
                            <router-link to="/home/student"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/student')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span class="text-sm">จัดการนักเรียน</span>
                            </router-link>
                        </li>
                    </ul>
                </li>

                <li v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'discipline'">
                    <div @click="toggleStructure"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer relative group"
                        :class="{ 'bg-primary text-primary-content': isStructureActive }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">จัดการโครงสร้าง</span>
                        <svg v-show="isExpanded" xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 ml-auto transition-transform', isStructureOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            จัดการโครงสร้าง
                        </div>
                    </div>

                    <ul v-show="isExpanded && isStructureOpen" class="ml-4 mt-2 space-y-2">
                        <li>
                            <router-link to="/home/department"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/department')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <span class="text-sm">จัดการแผนก</span>
                            </router-link>
                        </li>

                        <li>
                            <router-link to="/home/position"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/position')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span class="text-sm">จัดการตำแหน่ง</span>
                            </router-link>
                        </li>

                        <li>
                            <router-link to="/home/classroom"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/classroom')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span class="text-sm">จัดการห้องเรียน</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/holidays"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/holidays')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12z" />
                                </svg>
                                <span class="text-sm">จัดการวันหยุด</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/academiccalendar"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/academiccalendar')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span class="text-sm">ปฏิทินการศึกษา</span>
                            </router-link>
                        </li>
                    </ul>
                </li>

                <li v-if="auth.user?.role !== 'viewer'">
                    <div @click="toggleBehaviorMenu"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer relative group"
                        :class="{ 'bg-primary text-primary-content': isBehaviorMenuActive }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 3l8 4v5c0 5.25-3.75 10-8 10s-8-4.75-8-10V7l8-4z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">จัดการความประพฤติ</span>
                        <svg v-show="isExpanded" xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 ml-auto transition-transform', isBehaviorMenuOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            จัดการความประพฤติ
                        </div>
                    </div>
                    <ul v-show="isExpanded && isBehaviorMenuOpen" class="ml-4 mt-2 space-y-2">
                        <li v-if="auth.user?.role !== 'teacher'">
                            <router-link to="/home/behavior"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/behavior')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 12h8m-8 4h8M5 7h14" />
                                </svg>
                                <span class="text-sm">รายการพฤติกรรม</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/conduct"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/conduct')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 3l8 4v5c0 5.25-3.75 10-8 10s-8-4.75-8-10V7l8-4z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4" />
                                </svg>
                                <span class="text-sm">จัดการคะแนน</span>
                            </router-link>
                        </li>
                        <!-- <li v-if="auth.user?.role !== 'teacher'">
                            <router-link to="/home/leave"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/leave')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12z" />
                                </svg>
                                <span class="text-sm">จัดการวันลา</span>
                            </router-link>
                        </li> -->
                        <li>
                            <router-link to="/home/checkname"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/checkname')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm">เช็คชื่อ</span>
                            </router-link>
                        </li>
                        <li v-if="featureFlags.menu.enableUniformInspection">
                            <router-link to="/home/uniform-inspection"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/uniform-inspection')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm">ตรวจระเบียบ</span>
                            </router-link>
                        </li>
                    </ul>
                </li>

                <li v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'discipline'">
                    <div @click="toggleEquipment"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer relative group"
                        :class="{ 'bg-primary text-primary-content': isEquipmentActive }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">จัดการอุปกรณ์</span>
                        <svg v-show="isExpanded" xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 ml-auto transition-transform', isEquipmentOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            จัดการอุปกรณ์
                        </div>
                    </div>

                    <ul v-show="isExpanded && isEquipmentOpen" class="ml-4 mt-2 space-y-2">
                        <li>
                            <router-link to="/home/device"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/device')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span class="text-sm">จัดการอุปกรณ์</span>
                            </router-link>
                        </li>

                        <li>
                            <router-link to="/home/model"
                                class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors"
                                :class="submenuClass('/home/model')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                <span class="text-sm">จัดการเชื่อมต่ออุปกรณ์</span>
                            </router-link>
                        </li>
                    </ul>
                </li>

                <li>
                    <div @click="toggleReport"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer relative group"
                        :class="{ 'bg-primary text-primary-content': isReportActive }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">รายงาน</span>
                        <svg v-show="isExpanded" xmlns="http://www.w3.org/2000/svg"
                            :class="['h-4 w-4 ml-auto transition-transform', isReportOpen ? 'rotate-180' : '']"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            รายงาน
                        </div>
                    </div>

                    <ul v-show="isExpanded && isReportOpen" class="ml-4 mt-2 space-y-2">
                        <li>
                            <router-link to="/home/report"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>เข้า-ออก</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/late"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/late')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>มาสาย</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/leave"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/leave')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10m-12 8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12z" />
                                </svg>
                                <span>การลา</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/activity"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/activity')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>กิจกรรม</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/missed"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/missed')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>ขาดเรียน/ขาดงาน</span>
                            </router-link>
                        </li>
                        <li v-if="auth.user?.role !== 'teacher'">
                            <router-link to="/home/report/stranger"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/stranger')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4m0 4h.01" />
                                </svg>
                                <span>สแกนไม่สำเร็จ</span>
                            </router-link>
                        </li>
                        <li v-if="featureFlags.menu.enableReportUniformInspection">
                            <router-link to="/home/report/uniform-inspection"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/uniform-inspection')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4m0 4h.01" />
                                </svg>
                                <span>ตรวจระเบียบ</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/at-risk"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/at-risk')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6M5 7h14M5 10h14M7 16h10M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>พฤติกรรมเสี่ยง</span>
                            </router-link>
                        </li>
                        <li>
                            <router-link to="/home/report/stats"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm"
                                :class="submenuClass('/home/report/stats')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>สถิติ</span>
                            </router-link>
                        </li>
                    </ul>
                </li>

                <li v-if="auth.user?.role == 'super admin'">
                    <router-link to="/home/account"
                        class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors relative group"
                        :class="{ 'bg-primary text-primary-content': isActive('/home/account') }">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span v-show="isExpanded" class="font-medium whitespace-nowrap">จัดการผู้ดูแล</span>

                        <div v-show="!isExpanded"
                            class="absolute left-full ml-2 px-3 py-2 bg-base-300 text-base-content rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            จัดการผู้ดูแล
                        </div>
                    </router-link>
                </li>
            </ul>
        </nav>
    </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import featureFlags from '../config/featureFlags'
const auth = useAuthStore()

const route = useRoute()
const isExpanded = ref(true)
const isPinned = ref(true)
const isPersonnelOpen = ref(false)
const isStructureOpen = ref(false)
const isEquipmentOpen = ref(false)
const isReportOpen = ref(false)
const isMobileMenuOpen = ref(false)

const isActive = (path) => {
    return computed(() => route.path === path).value
}

const isPersonnelActive = computed(() => {
    return route.path === '/home/teacher' || route.path === '/home/student'
})

const isStructureActive = computed(() => {
    return route.path === '/home/department' || route.path === '/home/position' || route.path === '/home/classroom' || route.path === '/home/holidays' || route.path === '/home/academiccalendar'
})

const isEquipmentActive = computed(() => {
    return route.path === '/home/device' || route.path === '/home/model'
})

const isReportActive = computed(() => {
    return route.path === '/home/report' || route.path === '/home/report/late' || route.path === '/home/report/leave' || route.path === '/home/report/missed' || route.path === '/home/report/stranger' || route.path === '/home/report/at-risk' || route.path === '/home/report/stats'
})

const submenuClass = (path) => {
    return isActive(path) ? 'bg-orange-200 text-warning-content' : ''
}

const toggleSidebar = () => {
    isPinned.value = !isPinned.value
    isExpanded.value = isPinned.value
}

const togglePersonnel = () => {
    isPersonnelOpen.value = !isPersonnelOpen.value
}

const toggleStructure = () => {
    isStructureOpen.value = !isStructureOpen.value
}

const toggleEquipment = () => {
    isEquipmentOpen.value = !isEquipmentOpen.value
}

const toggleReport = () => {
    isReportOpen.value = !isReportOpen.value
}

const openMobileMenu = () => {
    isMobileMenuOpen.value = true
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

const handleMouseEnter = () => {
    isExpanded.value = true
}

const handleMouseLeave = () => {
    if (!isPinned.value) {
        isExpanded.value = false
    }
}

const isBehaviorMenuOpen = ref(false)
const isBehaviorMenuActive = computed(() => {
    return route.path === '/home/behavior' || route.path === '/home/conduct' || route.path === '/home/leave' || route.path === '/home/checkname'
})
const toggleBehaviorMenu = () => {
    isBehaviorMenuOpen.value = !isBehaviorMenuOpen.value
}

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

defineExpose({
    openMobileMenu,
    toggleMobileMenu
})
</script>

<style scoped></style>
