<template>
  <div class="min-h-screen flex bg-surface-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-surface-900 text-white transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-surface-700/50">
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-lg">E</span>
          </div>
          <span v-if="sidebarOpen" class="text-lg font-bold whitespace-nowrap">EventHub</span>
        </NuxtLink>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-surface-400 hover:text-white transition-colors hidden lg:block"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 py-6 overflow-y-auto scrollbar-hide">
        <ul class="space-y-1 px-3">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.to)
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              ]"
            >
              <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
              <span v-if="sidebarOpen" class="whitespace-nowrap">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Bottom -->
      <div class="p-3 border-t border-surface-700/50">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
        >
          <span class="text-xl">🌐</span>
          <span v-if="sidebarOpen">View Site</span>
        </NuxtLink>
        <button
          @click="logout"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-all w-full mt-1"
        >
          <span class="text-xl">🚪</span>
          <span v-if="sidebarOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
    />

    <!-- Main Content -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20']">
      <!-- Top bar -->
      <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-surface-100 h-16 flex items-center px-6">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden text-surface-600 hover:text-surface-800 mr-4"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <div class="flex-1" />

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-semibold text-surface-800">{{ authStore.userName }}</p>
            <p class="text-xs text-surface-500">Administrator</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
            {{ authStore.userName?.charAt(0) || 'A' }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(true)

const navItems = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/events', icon: '📅', label: 'Events' },
  { to: '/admin/categories', icon: '📁', label: 'Categories' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/registrations', icon: '🎫', label: 'Registrations' },
  { to: '/admin/reports', icon: '📈', label: 'Reports' },
]

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const logout = () => {
  authStore.logout()
}

// Collapse sidebar on mobile by default
onMounted(() => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
})
</script>
