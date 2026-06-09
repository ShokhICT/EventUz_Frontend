<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100 transition-all duration-300">
    <div class="container-custom">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transition-transform group-hover:scale-110">
            <span class="text-white font-bold text-lg">E</span>
          </div>
          <span class="text-xl font-bold text-surface-900">Event<span class="gradient-text">Hub</span></span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-lg text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            active-class="!text-primary-600 !bg-primary-50"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <div class="relative">
            <button
              @click="showLangMenu = !showLangMenu"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium text-sm"
            >
              <span>{{ activeLang.flag }}</span>
              <span class="hidden sm:inline font-semibold">{{ activeLang.code.toUpperCase() }}</span>
              <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <Transition name="dropdown">
              <div v-if="showLangMenu" class="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-surface-100 overflow-hidden py-1.5 z-50">
                <button
                  v-for="lang in languages"
                  :key="lang.code"
                  @click="changeLang(lang.code)"
                  class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors w-full text-left"
                  :class="{ 'text-primary-600 font-semibold bg-primary-50/50': currentLocale === lang.code }"
                >
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Notifications (authenticated) -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="relative p-2 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span
                v-if="notifStore.unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in"
              >
                {{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
              </span>
            </button>

            <!-- Dropdown -->
            <Transition name="dropdown">
              <div
                v-if="showNotifications"
                class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-100 overflow-hidden"
              >
                <div class="p-4 border-b border-surface-100 flex items-center justify-between">
                  <h3 class="font-semibold text-surface-800">{{ t('nav.notifications') || 'Notifications' }}</h3>
                  <button
                    v-if="notifStore.unreadCount > 0"
                    @click="notifStore.markAllAsRead()"
                    class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {{ t('nav.markAllRead') || 'Mark all read' }}
                  </button>
                </div>
                <div class="max-h-64 overflow-y-auto">
                  <div
                    v-for="notif in notifStore.notifications.slice(0, 5)"
                    :key="notif._id"
                    :class="['px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer', !notif.read && 'bg-primary-50/50']"
                    @click="notifStore.markAsRead(notif._id)"
                  >
                    <p class="text-sm font-medium text-surface-800">{{ notif.title }}</p>
                    <p class="text-xs text-surface-500 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                  </div>
                  <div v-if="notifStore.notifications.length === 0" class="px-4 py-8 text-center text-sm text-surface-400">
                    {{ t('nav.noNotifications') || 'No notifications yet' }}
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Auth buttons -->
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/login" class="btn-ghost btn-sm hidden sm:inline-flex">{{ t('nav.login') }}</NuxtLink>
            <NuxtLink to="/register" class="btn-primary btn-sm">{{ t('nav.signUp') }}</NuxtLink>
          </template>

          <!-- User menu -->
          <template v-else>
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-all"
              >
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {{ authStore.userName?.charAt(0) || 'U' }}
                </div>
                <span class="text-sm font-medium text-surface-700 hidden sm:block">{{ authStore.userName }}</span>
                <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <Transition name="dropdown">
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-100 overflow-hidden py-2">
                  <NuxtLink to="/my-events" class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors" @click="showUserMenu = false">
                    <span>🎫</span> {{ t('nav.myEvents') }}
                  </NuxtLink>
                  <NuxtLink to="/events/create" class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors" @click="showUserMenu = false">
                    <span>➕</span> {{ t('nav.addEvent') }}
                  </NuxtLink>
                  <NuxtLink to="/profile" class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors" @click="showUserMenu = false">
                    <span>👤</span> {{ t('nav.profile') }}
                  </NuxtLink>
                  <NuxtLink v-if="authStore.isAdmin" to="/admin" class="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-600 hover:bg-surface-50 transition-colors" @click="showUserMenu = false">
                    <span>⚙️</span> {{ t('nav.admin') }}
                  </NuxtLink>
                  <hr class="my-2 border-surface-100">
                  <button @click="handleLogout" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                    <span>🚪</span> {{ t('nav.logout') }}
                  </button>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Mobile menu button -->
          <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="md:hidden pb-4 border-t border-surface-100 mt-2 pt-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

const authStore = useAuthStore()
const notifStore = useNotificationStore()
const { t, setLocale, currentLocale } = useI18n()

const mobileOpen = ref(false)
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showLangMenu = ref(false)

const languages = [
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

const activeLang = computed(() => {
  return languages.find(l => l.code === currentLocale.value) || languages[0]
})

const changeLang = (code) => {
  setLocale(code)
  showLangMenu.value = false
}

const navLinks = computed(() => [
  { to: '/', label: t('nav.home') },
  { to: '/events', label: t('nav.events') },
])

const handleLogout = () => {
  showUserMenu.value = false
  authStore.logout()
}

// Close dropdowns when clicking outside
if (import.meta.client) {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
      showNotifications.value = false
      showLangMenu.value = false
    }
  })
}

// Fetch notifications if authenticated
watch(() => authStore.isAuthenticated, (val) => {
  if (val) notifStore.fetchNotifications()
}, { immediate: true })
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.2s ease-out; }
.dropdown-leave-active { transition: all 0.15s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.95); }
.dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.95); }

.mobile-menu-enter-active { transition: all 0.3s ease-out; }
.mobile-menu-leave-active { transition: all 0.2s ease-in; }
.mobile-menu-enter-from { opacity: 0; max-height: 0; }
.mobile-menu-enter-to { opacity: 1; max-height: 300px; }
.mobile-menu-leave-from { opacity: 1; max-height: 300px; }
.mobile-menu-leave-to { opacity: 0; max-height: 0; }
</style>
