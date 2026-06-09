<template>
  <div>
    <h1 class="text-2xl font-bold text-surface-900 mb-6">Registrations Management</h1>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-surface-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
      <select v-model="statusFilter" @change="fetchRegistrations" class="input sm:w-40">
        <option value="">All Status</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="attended">Attended</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container bg-white">
      <table class="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Event</th>
            <th>Status</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reg in registrations" :key="reg._id">
            <td>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                  {{ reg.user?.name?.charAt(0) || '?' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-surface-800">{{ reg.user?.name }}</p>
                  <p class="text-xs text-surface-500">{{ reg.user?.email }}</p>
                </div>
              </div>
            </td>
            <td class="text-sm text-surface-700 max-w-[200px] truncate">{{ reg.event?.title }}</td>
            <td>
              <select
                :value="reg.status"
                @change="updateStatus(reg._id, $event.target.value)"
                :class="['text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer', statusBg(reg.status)]"
              >
                <option value="confirmed">Confirmed</option>
                <option value="attended">Attended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
            <td class="text-sm text-surface-500">{{ formatDate(reg.registeredAt || reg.createdAt) }}</td>
            <td>
              <button v-if="reg.status !== 'cancelled'" @click="updateStatus(reg._id, 'cancelled')" class="btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50">
                Cancel
              </button>
            </td>
          </tr>
          <tr v-if="registrations.length === 0">
            <td colspan="5" class="text-center py-8 text-surface-400">No registrations found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
      <button v-for="p in pagination.pages" :key="p" @click="fetchRegistrations(p)"
        :class="['w-9 h-9 rounded-lg text-sm font-medium transition-all', p === pagination.page ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50']">
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Registrations — EventHub Admin' })

const { get, put } = useApi()
const { success, error: showError } = useToast()

const registrations = ref([])
const statusFilter = ref('')
const pagination = ref({ page: 1, total: 0, pages: 0 })

const fetchRegistrations = async (page = 1) => {
  try {
    const data = await get('/registrations', { page, limit: 20, status: statusFilter.value })
    if (data.success) {
      registrations.value = data.data.registrations
      pagination.value = data.data.pagination
    }
  } catch (e) { console.error(e) }
}

const updateStatus = async (id, status) => {
  try {
    await put(`/registrations/${id}/status`, { status })
    const reg = registrations.value.find(r => r._id === id)
    if (reg) reg.status = status
    success(`Status updated to ${status}`)
  } catch (e) { showError('Failed to update status') }
}

const formatDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

const statusBg = (s) => ({
  confirmed: 'bg-emerald-50 text-emerald-700',
  attended: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
})[s] || 'bg-surface-100'

onMounted(() => fetchRegistrations())
</script>
