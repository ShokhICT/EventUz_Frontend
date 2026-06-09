<template>
  <div>
    <h1 class="text-2xl font-bold text-surface-900 mb-6">Categories Management</h1>

    <!-- Create Form -->
    <div class="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
      <h2 class="font-semibold text-surface-800 mb-4">{{ editingId ? 'Edit Category' : 'Add Category' }}</h2>
      <form @submit.prevent="handleSubmit" class="flex flex-col sm:flex-row gap-3">
        <input v-model="form.name" type="text" class="input flex-1" placeholder="Category name" required>
        <input v-model="form.description" type="text" class="input flex-1" placeholder="Description">
        <input v-model="form.icon" type="text" class="input w-20" placeholder="Icon">
        <input v-model="form.color" type="color" class="input w-16 p-1 h-[46px]" title="Color">
        <button type="submit" :disabled="submitting" class="btn-primary whitespace-nowrap">
          {{ editingId ? 'Update' : 'Add' }}
        </button>
        <button v-if="editingId" type="button" @click="cancelEdit" class="btn-ghost whitespace-nowrap">Cancel</button>
      </form>
    </div>

    <!-- Table -->
    <div class="table-container bg-white">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Description</th>
            <th>Color</th>
            <th>Events</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat._id">
            <td class="text-xl">{{ cat.icon }}</td>
            <td class="font-medium text-surface-800">{{ cat.name }}</td>
            <td class="text-sm text-surface-500 max-w-[200px] truncate">{{ cat.description }}</td>
            <td>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-md" :style="{ backgroundColor: cat.color }" />
                <span class="text-xs text-surface-500">{{ cat.color }}</span>
              </div>
            </td>
            <td class="text-sm">{{ cat.eventCount || 0 }}</td>
            <td>
              <div class="flex gap-2">
                <button @click="startEdit(cat)" class="btn-ghost btn-sm text-xs">Edit</button>
                <button @click="deleteCategory(cat._id)" class="btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="6" class="text-center py-8 text-surface-400">No categories yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Categories — EventHub Admin' })

const { get, post, put, del } = useApi()
const { success, error: showError } = useToast()

const categories = ref([])
const editingId = ref(null)
const submitting = ref(false)
const form = ref({ name: '', description: '', icon: '📌', color: '#6366f1' })

const fetchCategories = async () => {
  try {
    const data = await get('/categories')
    if (data.success) categories.value = data.data.categories
  } catch (e) { /* ignore */ }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingId.value) {
      const data = await put(`/categories/${editingId.value}`, form.value)
      if (data.success) {
        success('Category updated')
        cancelEdit()
        fetchCategories()
      }
    } else {
      const data = await post('/categories', form.value)
      if (data.success) {
        success('Category created')
        form.value = { name: '', description: '', icon: '📌', color: '#6366f1' }
        fetchCategories()
      }
    }
  } catch (e) {
    showError(e.data?.message || 'Failed to save category')
  } finally {
    submitting.value = false
  }
}

const startEdit = (cat) => {
  editingId.value = cat._id
  form.value = { name: cat.name, description: cat.description || '', icon: cat.icon, color: cat.color }
}

const cancelEdit = () => {
  editingId.value = null
  form.value = { name: '', description: '', icon: '📌', color: '#6366f1' }
}

const deleteCategory = async (id) => {
  if (!confirm('Delete this category?')) return
  try {
    await del(`/categories/${id}`)
    categories.value = categories.value.filter(c => c._id !== id)
    success('Category deleted')
  } catch (e) {
    showError(e.data?.message || 'Failed to delete category')
  }
}

onMounted(() => fetchCategories())
</script>
