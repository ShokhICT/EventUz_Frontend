<template>
  <div class="section bg-surface-50 min-h-screen">
    <div class="container-custom max-w-4xl">
      <div class="flex items-center gap-5 mb-8">
        <NuxtLink
          to="/my-events"
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-surface-200 hover:bg-surface-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow active:scale-95 group"
          :title="t('addEvent.cancelBtn')"
        >
          <span class="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-extrabold text-surface-900 leading-tight">{{ t('addEvent.title') }}</h1>
          <p class="text-sm text-surface-500 mt-1">{{ t('addEvent.subtitle') }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="bg-white rounded-3xl border border-surface-150 p-8 md:p-10 shadow-xl shadow-surface-100/40 space-y-8">
        <!-- Event Core Info -->
        <div class="space-y-6">
          <h2 class="text-lg font-bold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
            <span>📝</span> {{ t('addEvent.generalInfo') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="input-label">{{ t('addEvent.eventTitle') }}</label>
              <input v-model="form.title" type="text" class="input" placeholder="e.g., Tashkent Tech Meetup" required>
            </div>

            <div class="md:col-span-2">
              <label class="input-label">{{ t('addEvent.desc') }}</label>
              <textarea v-model="form.description" rows="5" class="input" placeholder="What is the event about? Highlight key topics, schedule..." required></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="input-label">{{ t('addEvent.shortDesc') }}</label>
              <input v-model="form.shortDescription" type="text" class="input" placeholder="A brief hook/summary for listings..." maxlength="300">
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.catLabel') }}</label>
              <select v-model="form.category" class="input" required>
                <option value="">{{ t('addEvent.selectCat') }}</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.orgName') }}</label>
              <input v-model="form.organizer" type="text" class="input" placeholder="e.g., GDG Tashkent, Independent">
            </div>
          </div>
        </div>

        <!-- Date & Time -->
        <div class="space-y-6 pt-4">
          <h2 class="text-lg font-bold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
            <span>📅</span> {{ t('addEvent.scheduleCapacity') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="input-label">{{ t('addEvent.startDate') }}</label>
              <input v-model="form.date" type="date" class="input" required>
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.endDate') }}</label>
              <input v-model="form.endDate" type="date" class="input">
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.startTime') }}</label>
              <input v-model="form.time" type="time" class="input">
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.capacity') }}</label>
              <input v-model.number="form.capacity" type="number" min="0" class="input" :placeholder="t('addEvent.unlimitedPlaceholder')">
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.price') }}</label>
              <input v-model.number="form.price" type="number" min="0" class="input" :placeholder="t('addEvent.freePlaceholder')">
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.tags') }}</label>
              <input v-model="form.tags" type="text" class="input" :placeholder="t('addEvent.tagsPlaceholder')">
            </div>
          </div>
        </div>

        <!-- Location & Map -->
        <div class="space-y-6 pt-4">
          <h2 class="text-lg font-bold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
            <span>📍</span> {{ t('addEvent.locationGeo') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="input-label">{{ t('addEvent.city') }}</label>
              <input v-model="form.location" type="text" class="input" placeholder="e.g., Tashkent, Samarkand" required>
            </div>

            <div>
              <label class="input-label">{{ t('addEvent.address') }}</label>
              <input v-model="form.address" type="text" class="input" placeholder="e.g., IT Park, Amirlar Street 14">
            </div>

            <div class="md:col-span-2 space-y-2">
              <label class="input-label">{{ t('addEvent.mapPinLabel') }}</label>
              <p class="text-xs text-surface-400">{{ t('addEvent.mapPinDesc') }}</p>
              <UiMapPicker v-model="form.coordinates" />
            </div>
          </div>
        </div>

        <!-- Event Poster -->
        <div class="space-y-6 pt-4">
          <h2 class="text-lg font-bold text-surface-900 border-b border-surface-100 pb-3 flex items-center gap-2">
            <span>🖼️</span> {{ t('addEvent.coverImage') }}
          </h2>

          <div>
            <label class="input-label">{{ t('addEvent.coverImage') }}</label>
            <div class="mt-2 flex items-center gap-6">
              <label class="relative cursor-pointer bg-white rounded-2xl border border-dashed border-surface-300 px-6 py-8 flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50/10 transition-all w-full md:w-64">
                <span class="text-3xl text-surface-400">📤</span>
                <span class="text-xs font-semibold text-surface-600 mt-2">{{ t('addEvent.chooseFile') }}</span>
                <span class="text-[10px] text-surface-400 mt-1">{{ t('addEvent.fileLimits') }}</span>
                <input type="file" accept="image/*" @change="onFileChange" class="hidden">
              </label>

              <div v-if="imagePreview" class="relative group">
                <img :src="imagePreview" alt="Preview" class="w-48 h-32 object-cover rounded-2xl border border-surface-150">
                <button type="button" @click="clearImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4 pt-6 border-t border-surface-100">
          <button type="submit" :disabled="submitting" class="btn-primary btn-lg flex-1 md:flex-none">
            <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span v-else>{{ t('addEvent.addBtn') }}</span>
          </button>
          <NuxtLink to="/my-events" class="btn-secondary btn-lg text-center">{{ t('addEvent.cancelBtn') }}</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: computed(() => `${t('addEvent.title')} — EventHub Uzbekistan`) })

const { get, upload } = useApi()
const { success, error: showError } = useToast()

const categories = ref([])
const submitting = ref(false)
const imageFile = ref(null)
const imagePreview = ref(null)

const form = ref({
  title: '',
  description: '',
  shortDescription: '',
  category: '',
  date: '',
  endDate: '',
  time: '',
  location: '',
  address: '',
  organizer: '',
  capacity: 0,
  price: 0,
  tags: '',
  coordinates: null
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      showError(t('addEvent.imageLimitError'))
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const clearImage = () => {
  imageFile.value = null
  imagePreview.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    
    Object.entries(form.value).forEach(([key, val]) => {
      if (key !== 'coordinates' && val !== undefined && val !== null && val !== '') {
        formData.append(key, val)
      }
    })

    if (form.value.coordinates) {
      formData.append('lat', form.value.coordinates.lat)
      formData.append('lng', form.value.coordinates.lng)
    }

    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    const data = await upload('/events', formData, 'POST')

    if (data.success) {
      success(t('addEvent.successToast'))
      navigateTo('/my-events')
    }
  } catch (e) {
    showError(e.data?.message || t('addEvent.errorToast'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const catsRes = await get('/categories')
    if (catsRes.success) {
      categories.value = catsRes.data.categories
    }
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
})
</script>
