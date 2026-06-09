<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-surface-900">Events Management</h1>
      <NuxtLink to="/admin/events/create" class="btn-primary">+ Create Event</NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-surface-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
      <input v-model="search" type="text" placeholder="Search events..." class="input flex-1" @input="debouncedFetch">
      <select v-model="statusFilter" @change="fetchEvents" class="input sm:w-40">
        <option value="">All Status</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container bg-white">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Category</th>
            <th>Date</th>
            <th>Status</th>
            <th>Registrations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event._id">
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0 flex items-center justify-center"
                  :style="event.image ? `background-image: url(${apiBase.replace('/api', '')}${event.image}); background-size: cover;` : ''"
                >
                  <span v-if="!event.image" class="text-sm">📅</span>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-surface-800 truncate max-w-[200px]">{{ event.title }}</p>
                  <p class="text-xs text-surface-500">{{ event.location }}</p>
                </div>
              </div>
            </td>
            <td>
              <span v-if="event.category" class="text-sm">{{ event.category.icon }} {{ event.category.name }}</span>
            </td>
            <td class="text-sm text-surface-600">{{ formatDate(event.date) }}</td>
            <td>
              <select
                :value="event.status"
                @change="updateStatus(event._id, $event.target.value)"
                :class="['text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer', statusBg(event.status)]"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
            </td>
            <td class="text-sm text-surface-600">{{ event.registrationCount || 0 }}{{ event.capacity ? `/${event.capacity}` : '' }}</td>
            <td>
              <div class="flex gap-2">
                <NuxtLink :to="`/admin/events/${event._id}`" class="btn-ghost btn-sm text-xs">Edit</NuxtLink>
                <button @click="deleteEvent(event._id)" class="btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="events.length === 0">
            <td colspan="6" class="text-center py-8 text-surface-400">No events found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
      <button v-for="p in pagination.pages" :key="p" @click="fetchEvents(p)"
        :class="['w-9 h-9 rounded-lg text-sm font-medium transition-all', p === pagination.page ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50']">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Events Management — EventHub Admin' })

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { get, put, del } = useApi()
const { success, error: showError } = useToast()

const events = ref([])
const search = ref('')
const statusFilter = ref('')
const pagination = ref({ page: 1, total: 0, pages: 0 })

let searchTimeout = null
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchEvents(), 400)
}

const fetchEvents = async (page = 1) => {
  try {
    const params = { page, limit: 15, search: search.value, status: statusFilter.value }
    const data = await get('/events', params)
    if (data.success) {
      events.value = data.data.events
      pagination.value = data.data.pagination
    }
  } catch (e) { console.error(e) }
}

const updateStatus = async (id, status) => {
  try {
    await put(`/events/${id}/status`, { status })
    const event = events.value.find(e => e._id === id)
    if (event) event.status = status
    success(`Event ${status}`)
  } catch (e) { showError('Failed to update status') }
}

const deleteEvent = async (id) => {
  if (!confirm('Are you sure you want to delete this event?')) return
  try {
    await del(`/events/${id}`)
    events.value = events.value.filter(e => e._id !== id)
    success('Event deleted')
  } catch (e) { showError('Failed to delete event') }
}

const formatDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

const statusBg = (s) => ({
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  draft: 'bg-surface-100 text-surface-600',
})[s] || 'bg-surface-100'

onMounted(() => fetchEvents())
</script>
