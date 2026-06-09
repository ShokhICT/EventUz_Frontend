<template>
  <div>
    <div class="flex items-center gap-5 mb-6">
      <NuxtLink
        to="/admin/events"
        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-surface-200 hover:bg-surface-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow active:scale-95 group"
        title="Back"
      >
        <span class="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-surface-900">{{ isEdit ? 'Edit Event' : 'Create Event' }}</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl border border-surface-100 p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="lg:col-span-2">
          <label class="input-label">Title *</label>
          <input v-model="form.title" type="text" class="input" placeholder="Event title" required>
        </div>

        <div class="lg:col-span-2">
          <label class="input-label">Description *</label>
          <textarea v-model="form.description" rows="5" class="input" placeholder="Detailed event description" required></textarea>
        </div>

        <div class="lg:col-span-2">
          <label class="input-label">Short Description</label>
          <input v-model="form.shortDescription" type="text" class="input" placeholder="Brief summary (max 300 chars)" maxlength="300">
        </div>

        <div>
          <label class="input-label">Category *</label>
          <select v-model="form.category" class="input" required>
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.icon }} {{ cat.name }}</option>
          </select>
        </div>

        <div>
          <label class="input-label">Status</label>
          <select v-model="form.status" class="input">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label class="input-label">Start Date *</label>
          <input v-model="form.date" type="date" class="input" required>
        </div>

        <div>
          <label class="input-label">End Date</label>
          <input v-model="form.endDate" type="date" class="input">
        </div>

        <div>
          <label class="input-label">Time</label>
          <input v-model="form.time" type="time" class="input">
        </div>

        <div>
          <label class="input-label">Location *</label>
          <input v-model="form.location" type="text" class="input" placeholder="City" required>
        </div>

        <div class="lg:col-span-2">
          <label class="input-label">Address</label>
          <input v-model="form.address" type="text" class="input" placeholder="Full address">
        </div>

        <div class="lg:col-span-2">
          <label class="input-label">Select Event Geolocation on Map</label>
          <UiMapPicker v-model="form.coordinates" />
        </div>

        <div>
          <label class="input-label">Organizer</label>
          <input v-model="form.organizer" type="text" class="input" placeholder="Organizer name">
        </div>

        <div>
          <label class="input-label">Capacity</label>
          <input v-model.number="form.capacity" type="number" min="0" class="input" placeholder="0 = unlimited">
        </div>

        <div>
          <label class="input-label">Price (UZS)</label>
          <input v-model.number="form.price" type="number" min="0" class="input" placeholder="0 = free">
        </div>

        <div>
          <label class="input-label">Tags (comma-separated)</label>
          <input v-model="form.tags" type="text" class="input" placeholder="tech, education, free">
        </div>

        <div class="lg:col-span-2">
          <label class="input-label">Event Image</label>
          <input type="file" accept="image/*" @change="onFileChange" class="input">
          <div v-if="imagePreview" class="mt-3">
            <img :src="imagePreview" alt="Preview" class="w-48 h-32 object-cover rounded-xl">
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-8 pt-6 border-t border-surface-100">
        <button type="submit" :disabled="submitting" class="btn-primary">
          <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span v-else>{{ isEdit ? 'Update Event' : 'Create Event' }}</span>
        </button>
        <NuxtLink to="/admin/events" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const config = useRuntimeConfig()
const { get, upload } = useApi()
const { success, error: showError } = useToast()

const isEdit = computed(() => !!route.params.id)
useHead({ title: computed(() => isEdit.value ? 'Edit Event — EventHub Admin' : 'Create Event — EventHub Admin') })

const categories = ref([])
const submitting = ref(false)
const imageFile = ref(null)
const imagePreview = ref(null)

const form = ref({
  title: '', description: '', shortDescription: '', category: '',
  date: '', endDate: '', time: '', location: '', address: '',
  organizer: '', capacity: 0, price: 0, tags: '', status: 'pending',
  coordinates: null
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    Object.entries(form.value).forEach(([key, val]) => {
      if (key !== 'coordinates' && val !== undefined && val !== null && val !== '') formData.append(key, val)
    })
    if (form.value.coordinates) {
      formData.append('lat', form.value.coordinates.lat)
      formData.append('lng', form.value.coordinates.lng)
    }
    if (imageFile.value) formData.append('image', imageFile.value)

    const endpoint = isEdit.value ? `/events/${route.params.id}` : '/events'
    const method = isEdit.value ? 'PUT' : 'POST'
    const data = await upload(endpoint, formData, method)

    if (data.success) {
      success(isEdit.value ? 'Event updated' : 'Event created')
      navigateTo('/admin/events')
    }
  } catch (e) {
    showError(e.data?.message || 'Failed to save event')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const catsRes = await get('/categories')
    if (catsRes.success) categories.value = catsRes.data.categories
  } catch (e) { /* ignore */ }

  if (isEdit.value) {
    try {
      // Fetch event by ID - need to find it
      const data = await get(`/events`, { limit: 100 })
      if (data.success) {
        const event = data.data.events.find(e => e._id === route.params.id)
        if (event) {
          form.value = {
            title: event.title,
            description: event.description,
            shortDescription: event.shortDescription || '',
            category: event.category?._id || '',
            date: event.date?.substring(0, 10) || '',
            endDate: event.endDate?.substring(0, 10) || '',
            time: event.time || '',
            location: event.location,
            address: event.address || '',
            organizer: event.organizer || '',
            capacity: event.capacity || 0,
            price: event.price || 0,
            tags: event.tags?.join(', ') || '',
            status: event.status,
            coordinates: event.coordinates || null,
          }
          if (event.image) {
            imagePreview.value = `${config.public.apiBase.replace('/api', '')}${event.image}`
          }
        }
      }
    } catch (e) { /* ignore */ }
  }
})
</script>
