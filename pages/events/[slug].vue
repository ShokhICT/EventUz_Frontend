<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-surface-500">{{ currentLocale === 'uz' ? 'Yuklanmoqda...' : currentLocale === 'ru' ? 'Загрузка...' : 'Loading event...' }}</p>
      </div>
    </div>

    <template v-else-if="event">
      <!-- Hero -->
      <section class="relative h-[400px] md:h-[500px]">
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900"
          :style="event.image ? `background-image: url(${apiBase.replace('/api', '')}${event.image}); background-size: cover; background-position: center;` : ''"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>

        <!-- Floating Back Button -->
        <div class="absolute top-6 left-6 z-20">
          <NuxtLink
            to="/events"
            class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-white/25 hover:border-white/45 transition-all duration-200 shadow-lg active:scale-95 group"
            :title="t('addEvent.cancelBtn')"
          >
            <span class="text-lg transition-transform group-hover:-translate-x-0.5">←</span>
          </NuxtLink>
        </div>

        <div class="container-custom relative h-full flex items-end pb-12 z-10">
          <div class="max-w-3xl animate-fade-in-up">
            <div v-if="event.category" class="mb-4">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold bg-white/20 backdrop-blur-sm text-white"
              >
                {{ event.category.icon }} {{ event.category.name }}
              </span>
              <span v-if="event.isFree || event.price === 0" class="ml-2 badge bg-emerald-500 text-white">{{ t('eventDetail.free').toUpperCase() }}</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4">{{ event.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span class="flex items-center gap-1.5">
                📅 {{ formatDate(event.date) }}{{ event.time ? ` • ${event.time}` : '' }}
              </span>
              <span class="flex items-center gap-1.5">
                📍 {{ event.location }}
              </span>
              <span v-if="event.organizer" class="flex items-center gap-1.5">
                🏢 {{ event.organizer }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="section">
        <div class="container-custom">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Main -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-2xl border border-surface-100 p-8">
                <h2 class="text-2xl font-bold text-surface-900 mb-6">{{ t('eventDetail.about') }}</h2>
                <div class="prose prose-surface max-w-none text-surface-600 leading-relaxed whitespace-pre-line">
                  {{ event.description }}
                </div>

                <div v-if="event.tags?.length" class="mt-8 pt-6 border-t border-surface-100">
                  <h3 class="text-sm font-semibold text-surface-500 mb-3">{{ t('eventDetail.tags') }}</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in event.tags"
                      :key="tag"
                      class="px-3 py-1 bg-surface-100 text-surface-600 rounded-lg text-sm"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Registration Card -->
              <div class="bg-white rounded-2xl border border-surface-100 p-6 sticky top-24">
                <div v-if="event.price > 0" class="mb-4">
                  <p class="text-3xl font-bold text-surface-900">{{ event.price.toLocaleString() }} <span class="text-sm font-normal text-surface-500">UZS</span></p>
                </div>
                <div v-else class="mb-4">
                  <p class="text-3xl font-bold text-emerald-600">{{ t('eventDetail.free') }}</p>
                </div>

                <!-- Capacity bar -->
                <div v-if="event.capacity > 0" class="mb-4">
                  <div class="flex justify-between text-sm text-surface-500 mb-1.5">
                    <span>{{ event.registrationCount || 0 }} {{ t('eventDetail.registeredCount') }}</span>
                    <span>{{ spotsLeft }} {{ t('eventDetail.spotsLeft') }}</span>
                  </div>
                  <div class="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="fillPercent > 80 ? 'bg-red-500' : 'bg-primary-500'"
                      :style="{ width: fillPercent + '%' }"
                    />
                  </div>
                </div>

                <button
                  v-if="!isRegistered"
                  @click="registerForEvent"
                  :disabled="registering || (event.capacity > 0 && spotsLeft <= 0)"
                  class="btn-primary w-full"
                >
                  <span v-if="registering" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span v-else>{{ spotsLeft <= 0 && event.capacity > 0 ? t('eventDetail.soldOut') : t('eventDetail.registerBtn') }}</span>
                </button>
                <div v-else class="text-center">
                  <div class="inline-flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl w-full justify-center font-semibold mb-3">
                    {{ t('eventDetail.registeredBadge') }}
                  </div>
                  <button @click="cancelRegistration" class="text-sm text-red-500 hover:text-red-600 transition-colors">
                    {{ t('eventDetail.cancelReg') }}
                  </button>
                </div>

                <!-- Event details -->
                <div class="mt-6 pt-6 border-t border-surface-100 space-y-4">
                  <div class="flex items-start gap-3 text-sm">
                    <span class="text-surface-400 mt-0.5">📅</span>
                    <div>
                      <p class="font-medium text-surface-800">{{ formatDate(event.date) }}</p>
                      <p v-if="event.endDate" class="text-surface-500">
                        {{ currentLocale === 'uz' ? formatDate(event.endDate) + ' gacha' : (currentLocale === 'ru' ? 'до ' : 'to ') + formatDate(event.endDate) }}
                      </p>
                      <p v-if="event.time" class="text-surface-500">{{ event.time }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3 text-sm">
                    <span class="text-surface-400 mt-0.5">📍</span>
                    <div>
                      <p class="font-medium text-surface-800">{{ event.location }}</p>
                      <p v-if="event.address" class="text-surface-500">{{ event.address }}</p>
                    </div>
                  </div>
                  <div v-if="event.organizer" class="flex items-start gap-3 text-sm">
                    <span class="text-surface-400 mt-0.5">🏢</span>
                    <p class="font-medium text-surface-800">{{ event.organizer }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Not found -->
    <div v-else class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-2xl font-bold text-surface-800 mb-2">{{ t('eventDetail.notFoundTitle') }}</h2>
        <p class="text-surface-500 mb-6">{{ t('eventDetail.notFoundSubtitle') }}</p>
        <NuxtLink to="/events" class="btn-primary">{{ t('eventDetail.browseBtn') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, currentLocale } = useI18n()

definePageMeta({ layout: 'default' })

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const authStore = useAuthStore()
const { success, error: showError } = useToast()

const event = ref(null)
const loading = ref(true)
const registering = ref(false)
const isRegistered = ref(false)
const myRegistrationId = ref(null)

useHead(() => ({
  title: event.value ? `${event.value.title} — EventHub` : 'Event — EventHub'
}))

const spotsLeft = computed(() => {
  if (!event.value?.capacity) return 999
  return Math.max(0, event.value.capacity - (event.value.registrationCount || 0))
})

const fillPercent = computed(() => {
  if (!event.value?.capacity) return 0
  return Math.min(100, Math.round(((event.value.registrationCount || 0) / event.value.capacity) * 100))
})

const formatDate = (date) => new Date(date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const registerForEvent = async () => {
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  registering.value = true
  try {
    const { post } = useApi()
    const data = await post('/registrations', { eventId: event.value._id })
    if (data.success) {
      isRegistered.value = true
      myRegistrationId.value = data.data.registration._id
      event.value.registrationCount = (event.value.registrationCount || 0) + 1
      
      const regSuccessMsg = {
        uz: 'Tadbirga muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
        ru: 'Вы успешно зарегистрировались на мероприятие!',
        en: 'Successfully registered for this event!'
      }[currentLocale.value] || 'Successfully registered for this event!'
      success(regSuccessMsg)
    }
  } catch (e) {
    const regFailMsg = {
      uz: 'Ro\'yxatdan o\'tishda xatolik yuz berdi',
      ru: 'Не удалось зарегистрироваться',
      en: 'Failed to register'
    }[currentLocale.value] || 'Failed to register'
    showError(e.data?.message || regFailMsg)
  } finally {
    registering.value = false
  }
}

const cancelRegistration = async () => {
  if (!myRegistrationId.value) return
  try {
    const { del } = useApi()
    await del(`/registrations/${myRegistrationId.value}`)
    isRegistered.value = false
    myRegistrationId.value = null
    event.value.registrationCount = Math.max(0, (event.value.registrationCount || 1) - 1)
    
    const cancelSuccessMsg = {
      uz: 'Ro\'yxatdan o\'tish bekor qilindi',
      ru: 'Регистрация отменена',
      en: 'Registration cancelled'
    }[currentLocale.value] || 'Registration cancelled'
    success(cancelSuccessMsg)
  } catch (e) {
    const cancelFailMsg = {
      uz: 'Ro\'yxatdan o\'tishni bekor qilishda xatolik yuz berdi',
      ru: 'Не удалось отменить регистрацию',
      en: 'Failed to cancel registration'
    }[currentLocale.value] || 'Failed to cancel registration'
    showError(cancelFailMsg)
  }
}

const checkRegistration = async () => {
  if (!authStore.isAuthenticated || !event.value) return
  try {
    const { get } = useApi()
    const data = await get('/registrations/my')
    if (data.success) {
      const reg = data.data.registrations.find(r => r.event?._id === event.value._id && r.status !== 'cancelled')
      if (reg) {
        isRegistered.value = true
        myRegistrationId.value = reg._id
      }
    }
  } catch (e) { /* ignore */ }
}

onMounted(async () => {
  try {
    const data = await $fetch(`${apiBase}/events/${route.params.slug}`)
    if (data.success) {
      event.value = data.data.event
      await checkRegistration()
    }
  } catch (e) {
    event.value = null
  } finally {
    loading.value = false
  }
})
</script>
