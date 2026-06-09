<template>
  <div>
    <h1 class="text-2xl font-bold text-surface-900 mb-6">Users Management</h1>

    <!-- Search -->
    <div class="bg-white rounded-2xl border border-surface-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
      <input v-model="search" type="text" placeholder="Search users by name or email..." class="input flex-1" @input="debouncedFetch">
      <select v-model="roleFilter" @change="fetchUsers" class="input sm:w-36">
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container bg-white">
      <table class="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {{ user.name?.charAt(0) || '?' }}
                </div>
                <span class="font-medium text-surface-800">{{ user.name }}</span>
              </div>
            </td>
            <td class="text-sm text-surface-600">{{ user.email }}</td>
            <td class="text-sm text-surface-500">{{ user.phone || '—' }}</td>
            <td>
              <span :class="user.role === 'admin' ? 'badge-primary' : 'badge-info'">{{ user.role }}</span>
            </td>
            <td class="text-sm text-surface-500">{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="flex gap-2">
                <button @click="viewUser(user)" class="btn-ghost btn-sm text-xs">View</button>
                <button v-if="user.role !== 'admin'" @click="deleteUser(user._id)" class="btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="text-center py-8 text-surface-400">No users found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
      <button v-for="p in pagination.pages" :key="p" @click="fetchUsers(p)"
        :class="['w-9 h-9 rounded-lg text-sm font-medium transition-all', p === pagination.page ? 'bg-primary-600 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50']">
        {{ p }}
      </button>
    </div>

    <!-- User Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedUser" class="overlay flex items-center justify-center p-4" @click.self="selectedUser = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-surface-900">User Details</h2>
              <button @click="selectedUser = null" class="text-surface-400 hover:text-surface-600 transition-colors">✕</button>
            </div>
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                {{ selectedUser.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-surface-900">{{ selectedUser.name }}</p>
                <p class="text-sm text-surface-500">{{ selectedUser.email }}</p>
              </div>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between py-2 border-b border-surface-100">
                <span class="text-surface-500">Phone</span>
                <span class="text-surface-800">{{ selectedUser.phone || '—' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-surface-100">
                <span class="text-surface-500">Role</span>
                <span :class="selectedUser.role === 'admin' ? 'badge-primary' : 'badge-info'">{{ selectedUser.role }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-surface-100">
                <span class="text-surface-500">Bio</span>
                <span class="text-surface-800 text-right max-w-[200px]">{{ selectedUser.bio || '—' }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-surface-500">Joined</span>
                <span class="text-surface-800">{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Users — EventHub Admin' })

const { get, del } = useApi()
const { success, error: showError } = useToast()

const users = ref([])
const search = ref('')
const roleFilter = ref('')
const pagination = ref({ page: 1, total: 0, pages: 0 })
const selectedUser = ref(null)

let searchTimeout = null
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchUsers(), 400)
}

const fetchUsers = async (page = 1) => {
  try {
    const data = await get('/users', { page, limit: 20, search: search.value, role: roleFilter.value })
    if (data.success) {
      users.value = data.data.users
      pagination.value = data.data.pagination
    }
  } catch (e) { console.error(e) }
}

const viewUser = (user) => { selectedUser.value = user }

const deleteUser = async (id) => {
  if (!confirm('Delete this user? This will also remove their registrations.')) return
  try {
    await del(`/users/${id}`)
    users.value = users.value.filter(u => u._id !== id)
    success('User deleted')
  } catch (e) { showError(e.data?.message || 'Failed to delete user') }
}

const formatDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

onMounted(() => fetchUsers())
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
