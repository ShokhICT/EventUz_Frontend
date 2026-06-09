<template>
  <div>
    <h1 class="text-2xl font-bold text-surface-900 mb-6">Reports</h1>

    <!-- Top Events -->
    <div class="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-surface-900">Top Events by Registration</h2>
      </div>
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Registrations</th>
              <th>Capacity</th>
              <th>Fill Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in topEvents" :key="event._id">
              <td class="font-medium text-surface-800 max-w-[200px] truncate">{{ event.title }}</td>
              <td class="text-sm">{{ event.category?.icon }} {{ event.category?.name }}</td>
              <td class="text-sm text-surface-600">{{ formatDate(event.date) }}</td>
              <td class="text-sm font-semibold text-surface-800">{{ event.registrationCount }}</td>
              <td class="text-sm text-surface-500">{{ event.capacity || '∞' }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="event.fillRate > 80 ? 'bg-red-500' : event.fillRate > 50 ? 'bg-accent-500' : 'bg-primary-500'"
                      :style="{ width: event.fillRate + '%' }"
                    />
                  </div>
                  <span class="text-xs text-surface-500">{{ event.fillRate }}%</span>
                </div>
              </td>
              <td>
                <span :class="statusBg(event.status)" class="text-xs font-semibold px-2 py-1 rounded-lg">{{ event.status }}</span>
              </td>
            </tr>
            <tr v-if="topEvents.length === 0">
              <td colspan="7" class="text-center py-8 text-surface-400">No event data available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration Report -->
    <div class="bg-white rounded-2xl border border-surface-100 p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="text-lg font-bold text-surface-900">Registration Report</h2>
        <div class="flex gap-3">
          <input v-model="dateFrom" type="date" @change="fetchReport" class="input w-auto text-sm">
          <input v-model="dateTo" type="date" @change="fetchReport" class="input w-auto text-sm">
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-surface-50 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-surface-900">{{ reportData.summary?.total || 0 }}</p>
          <p class="text-xs text-surface-500">Total Registrations</p>
        </div>
        <div class="bg-surface-50 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-emerald-600">{{ reportData.summary?.attended || 0 }}</p>
          <p class="text-xs text-surface-500">Attended</p>
        </div>
        <div class="bg-surface-50 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-primary-600">{{ reportData.summary?.attendanceRate || 0 }}%</p>
          <p class="text-xs text-surface-500">Attendance Rate</p>
        </div>
      </div>

      <!-- Export -->
      <div class="flex justify-end">
        <button @click="exportCSV" class="btn-secondary btn-sm">
          📥 Export CSV
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Reports — EventHub Admin' })

const config = useRuntimeConfig()
const { get } = useApi()

const topEvents = ref([])
const reportData = ref({})
const dateFrom = ref('')
const dateTo = ref('')

const fetchTopEvents = async () => {
  try {
    const data = await get('/reports/events')
    if (data.success) topEvents.value = data.data.topEvents
  } catch (e) { /* ignore */ }
}

const fetchReport = async () => {
  try {
    const params = {}
    if (dateFrom.value) params.dateFrom = dateFrom.value
    if (dateTo.value) params.dateTo = dateTo.value
    const data = await get('/reports/registrations', params)
    if (data.success) reportData.value = data.data
  } catch (e) { /* ignore */ }
}

const exportCSV = () => {
  // Simple CSV export from report data
  if (!reportData.value.registrations?.length) return
  const header = 'User,Email,Event,Status,Date\n'
  const rows = reportData.value.registrations.map(r =>
    `"${r.user?.name || ''}","${r.user?.email || ''}","${r.event?.title || ''}","${r.status}","${r.registeredAt}"`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'registrations-report.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const formatDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

const statusBg = (s) => ({
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
})[s] || 'bg-surface-100'

onMounted(() => {
  fetchTopEvents()
  fetchReport()
})
</script>
