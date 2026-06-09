<template>
  <div>
    <h1 class="text-2xl font-bold text-surface-900 mb-6">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-md transition-all">
        <div class="flex items-center justify-between mb-3">
          <span class="text-2xl">{{ stat.icon }}</span>
          <span :class="['badge text-[10px]', stat.trend > 0 ? 'badge-success' : 'badge-info']">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </span>
        </div>
        <p class="text-2xl font-bold text-surface-900">{{ stat.value }}</p>
        <p class="text-sm text-surface-500 mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Registration Chart -->
      <div class="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-4">Registrations Trend</h2>
        <div class="h-48 flex items-end gap-2">
          <div
            v-for="(bar, i) in chartData"
            :key="i"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="text-xs font-semibold text-surface-600">{{ bar.count }}</span>
            <div
              class="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-700"
              :style="{ height: bar.height + '%', minHeight: '8px' }"
            />
            <span class="text-[10px] text-surface-400">{{ bar.label }}</span>
          </div>
        </div>
      </div>

      <!-- Events by Category -->
      <div class="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-4">Events by Category</h2>
        <div class="space-y-3">
          <div v-for="cat in categoryData" :key="cat.name" class="flex items-center gap-3">
            <span class="text-lg">{{ cat.icon }}</span>
            <div class="flex-1">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-surface-700">{{ cat.name }}</span>
                <span class="text-surface-500">{{ cat.count }}</span>
              </div>
              <div class="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{ width: cat.percent + '%', backgroundColor: cat.color }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div class="bg-white rounded-2xl border border-surface-100 p-6">
        <h2 class="text-lg font-bold text-surface-900 mb-4">Recent Registrations</h2>
        <div class="space-y-3">
          <div v-for="reg in dashData.recentRegistrations?.slice(0, 6)" :key="reg._id" class="flex items-center gap-3 py-2">
            <div class="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
              {{ reg.user?.name?.charAt(0) || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-800 truncate">{{ reg.user?.name }}</p>
              <p class="text-xs text-surface-500 truncate">{{ reg.event?.title }}</p>
            </div>
            <span class="text-xs text-surface-400 whitespace-nowrap">{{ timeAgo(reg.registeredAt) }}</span>
          </div>
          <p v-if="!dashData.recentRegistrations?.length" class="text-sm text-surface-400 text-center py-4">No registrations yet</p>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="bg-white rounded-2xl border border-surface-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-surface-900">Upcoming Events</h2>
          <NuxtLink to="/admin/events" class="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</NuxtLink>
        </div>
        <div class="space-y-3">
          <div v-for="event in dashData.upcomingEvents" :key="event._id" class="flex items-center gap-3 py-2">
            <div
              class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
              :style="{ backgroundColor: (event.category?.color || '#6366f1') + '15' }"
            >
              <span>{{ event.category?.icon || '📅' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-800 truncate">{{ event.title }}</p>
              <p class="text-xs text-surface-500">{{ formatDate(event.date) }}</p>
            </div>
            <span class="text-xs text-surface-500">{{ event.registrationCount || 0 }} reg.</span>
          </div>
          <p v-if="!dashData.upcomingEvents?.length" class="text-sm text-surface-400 text-center py-4">No upcoming events</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin Dashboard — EventHub' })

const { get } = useApi()

const dashData = ref({})
const loading = ref(true)

const statCards = computed(() => [
  { icon: '📅', label: 'Total Events', value: dashData.value.stats?.totalEvents || 0, trend: 12 },
  { icon: '👥', label: 'Total Users', value: dashData.value.stats?.totalUsers || 0, trend: 8 },
  { icon: '🎫', label: 'Registrations', value: dashData.value.stats?.totalRegistrations || 0, trend: 15 },
  { icon: '⏳', label: 'Pending Approval', value: dashData.value.stats?.pendingEvents || 0, trend: 0 },
])

const chartData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = dashData.value.registrationsByMonth || []
  const maxCount = Math.max(1, ...data.map(d => d.count))
  return data.map(d => ({
    label: months[d._id.month - 1],
    count: d.count,
    height: Math.max(5, (d.count / maxCount) * 100)
  }))
})

const categoryData = computed(() => {
  const data = dashData.value.eventsByCategory || []
  const maxCount = Math.max(1, ...data.map(d => d.count))
  return data.map(d => ({
    name: d.name,
    icon: d.icon,
    color: d.color,
    count: d.count,
    percent: Math.max(5, (d.count / maxCount) * 100)
  }))
})

const formatDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

onMounted(async () => {
  try {
    const data = await get('/reports/dashboard')
    if (data.success) dashData.value = data.data
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  }
  loading.value = false
})
</script>
