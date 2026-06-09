<template>
  <div class="section bg-surface-50 min-h-screen">
    <div class="container-custom">
      <h1 class="text-3xl font-extrabold text-surface-900 mb-2 leading-tight">{{ t('myEvents.title') }}</h1>
      <p class="text-sm text-surface-500 mb-8">{{ t('myEvents.subtitle') }}</p>

      <!-- Tabs -->
      <div class="flex border-b border-surface-150 mb-8 gap-6">
        <button
          @click="activeTab = 'registered'"
          type="button"
          :class="['pb-4 text-sm font-bold border-b-2 transition-all', activeTab === 'registered' ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-400 hover:text-surface-700']"
        >
          {{ t('myEvents.tabRegistered') }}
        </button>
        <button
          @click="activeTab = 'proposed'"
          type="button"
          :class="['pb-4 text-sm font-bold border-b-2 transition-all', activeTab === 'proposed' ? 'border-primary-600 text-primary-600' : 'border-transparent text-surface-400 hover:text-surface-700']"
        >
          {{ t('myEvents.tabAdded') }}
        </button>
      </div>

      <!-- Tab 1: Registered Events -->
      <div v-if="activeTab === 'registered'">
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="card-flat p-6 flex gap-6">
            <div class="w-32 h-24 skeleton rounded-xl" />
            <div class="flex-1 space-y-2">
              <div class="h-5 w-48 skeleton" />
              <div class="h-4 w-32 skeleton" />
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Upcoming -->
          <div v-if="upcoming.length > 0" class="mb-10">
            <h2 class="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {{ t('myEvents.upcomingTitle') }} ({{ upcoming.length }})
            </h2>
            <div class="space-y-4">
              <div
                v-for="reg in upcoming"
                :key="reg._id"
                class="bg-white rounded-2xl border border-surface-150 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all cursor-pointer"
                @click="navigateTo(`/events/${reg.event?.slug}`)"
              >
                <div
                  class="w-full sm:w-36 h-24 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0 flex items-center justify-center"
                  :style="reg.event?.image ? `background-image: url(${apiBase.replace('/api', '')}${reg.event.image}); background-size: cover; background-position: center;` : ''"
                >
                  <span v-if="!reg.event?.image" class="text-3xl opacity-50">📅</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="font-bold text-surface-850 hover:text-primary-600 transition-colors truncate">{{ reg.event?.title }}</h3>
                      <p class="text-sm text-surface-500 mt-1">
                        📅 {{ formatDate(reg.event?.date) }} • 📍 {{ reg.event?.location }}
                      </p>
                    </div>
                    <span :class="statusClass(reg.status)">{{ getLocalizedStatus(reg.status) }}</span>
                  </div>
                </div>
                <button
                  @click.stop="cancelReg(reg._id)"
                  class="self-center btn-ghost btn-sm text-red-500 hover:bg-red-50 whitespace-nowrap"
                >
                  {{ t('myEvents.cancelBtn') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Past -->
          <div v-if="past.length > 0">
            <h2 class="text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 bg-surface-450 rounded-full" />
              {{ t('myEvents.pastTitle') }} ({{ past.length }})
            </h2>
            <div class="space-y-4">
              <div
                v-for="reg in past"
                :key="reg._id"
                class="bg-white rounded-2xl border border-surface-150 p-5 flex flex-col sm:flex-row gap-5 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                @click="navigateTo(`/events/${reg.event?.slug}`)"
              >
                <div
                  class="w-full sm:w-36 h-24 rounded-xl bg-gradient-to-br from-surface-300 to-surface-400 flex-shrink-0 flex items-center justify-center"
                  :style="reg.event?.image ? `background-image: url(${apiBase.replace('/api', '')}${reg.event.image}); background-size: cover; background-position: center;` : ''"
                >
                  <span v-if="!reg.event?.image" class="text-3xl opacity-50">📅</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-surface-850 truncate">{{ reg.event?.title }}</h3>
                  <p class="text-sm text-surface-500 mt-1">
                    📅 {{ formatDate(reg.event?.date) }} • 📍 {{ reg.event?.location }}
                  </p>
                </div>
                <span :class="statusClass(reg.status)">{{ getLocalizedStatus(reg.status) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-if="upcoming.length === 0 && past.length === 0" class="text-center py-20 bg-white rounded-3xl border border-surface-150">
            <div class="text-6xl mb-4">🎫</div>
            <h3 class="text-xl font-bold text-surface-800 mb-2">{{ t('myEvents.noRegsTitle') }}</h3>
            <p class="text-surface-500 mb-6">{{ t('myEvents.noRegsSubtitle') }}</p>
            <NuxtLink to="/events" class="btn-primary">{{ t('myEvents.exploreBtn') }}</NuxtLink>
          </div>
        </template>
      </div>

      <!-- Tab 2: Proposed Events -->
      <div v-else-if="activeTab === 'proposed'">
        <div v-if="loadingProposed" class="space-y-4">
          <div v-for="i in 3" :key="i" class="card-flat p-6 flex gap-6">
            <div class="w-32 h-24 skeleton rounded-xl" />
            <div class="flex-1 space-y-2">
              <div class="h-5 w-48 skeleton" />
              <div class="h-4 w-32 skeleton" />
            </div>
          </div>
        </div>

        <template v-else>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold text-surface-800">{{ t('myEvents.listHeaderAdded') }}</h2>
            <NuxtLink to="/events/create" class="btn-primary btn-sm">+ {{ t('myEvents.addEventBtn') }}</NuxtLink>
          </div>

          <div v-if="proposedEvents.length > 0" class="space-y-4">
            <div
              v-for="event in proposedEvents"
              :key="event._id"
              class="bg-white rounded-2xl border border-surface-150 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all cursor-pointer"
              @click="event.status === 'approved' ? navigateTo(`/events/${event.slug}`) : null"
            >
              <div
                class="w-full sm:w-36 h-24 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0 flex items-center justify-center"
                :style="event.image ? `background-image: url(${apiBase.replace('/api', '')}${event.image}); background-size: cover; background-position: center;` : ''"
              >
                <span v-if="!event.image" class="text-3xl opacity-50">📅</span>
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <h3 class="font-bold text-surface-850 truncate" :class="event.status === 'approved' && 'hover:text-primary-600 transition-colors'">{{ event.title }}</h3>
                      <p class="text-sm text-surface-500 mt-1">
                        📅 {{ formatDate(event.date) }} • 📍 {{ event.location }}
                      </p>
                    </div>
                    <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full border', eventStatusClass(event.status)]">
                      {{ getLocalizedEventStatus(event.status) }}
                    </span>
                  </div>
                </div>
                <div class="text-[11px] text-surface-400 mt-2 flex items-center gap-1.5">
                  <span v-if="event.status === 'pending'">{{ t('myEvents.waitingReview') }}</span>
                  <span v-else-if="event.status === 'approved'">{{ t('myEvents.liveNotice') }}</span>
                  <span v-else-if="event.status === 'cancelled'">{{ t('myEvents.cancelledNotice') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Proposed -->
          <div v-else class="text-center py-20 bg-white rounded-3xl border border-surface-150">
            <div class="text-6xl mb-4">✍️</div>
            <h3 class="text-xl font-bold text-surface-800 mb-2">{{ t('myEvents.noAddedTitle') }}</h3>
            <p class="text-surface-500 mb-6">{{ t('myEvents.noAddedSubtitle') }}</p>
            <NuxtLink to="/events/create" class="btn-primary">{{ t('myEvents.addEventBtn') }}</NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, currentLocale } = useI18n()

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: computed(() => `${t('myEvents.title')} — EventHub Uzbekistan`) })

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { get, del } = useApi()
const { success, error: showError } = useToast()

const activeTab = ref('registered')
const registrations = ref([])
const proposedEvents = ref([])
const loading = ref(true)
const loadingProposed = ref(false)

const upcoming = computed(() => {
  return registrations.value.filter(r => r.event && new Date(r.event.date) >= new Date() && r.status !== 'cancelled')
})

const past = computed(() => {
  return registrations.value.filter(r => r.event && (new Date(r.event.date) < new Date() || r.status === 'cancelled'))
})

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const statusClass = (status) => {
  const map = { confirmed: 'badge-success', cancelled: 'badge-danger', attended: 'badge-primary' }
  return map[status] || 'badge-info'
}

const getLocalizedStatus = (status) => {
  const map = {
    confirmed: { uz: 'Tasdiqlangan', ru: 'Подтверждено', en: 'Confirmed' },
    cancelled: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
    attended: { uz: 'Qatnashgan', ru: 'Посетил', en: 'Attended' }
  }
  return map[status]?.[currentLocale.value] || status
}

const eventStatusClass = (status) => {
  return {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/50',
    cancelled: 'bg-red-50 text-red-700 border-red-200/50',
    draft: 'bg-surface-50 text-surface-500 border-surface-200/50'
  }[status] || 'bg-surface-100'
}

const getLocalizedEventStatus = (status) => {
  const map = {
    approved: { uz: t('myEvents.statusApproved'), ru: t('myEvents.statusApproved'), en: t('myEvents.statusApproved') },
    pending: { uz: t('myEvents.statusPending'), ru: t('myEvents.statusPending'), en: t('myEvents.statusPending') },
    cancelled: { uz: t('myEvents.statusCancelled'), ru: t('myEvents.statusCancelled'), en: t('myEvents.statusCancelled') },
    draft: { uz: 'Qoralama', ru: 'Черновик', en: 'Draft' }
  }
  return map[status]?.[currentLocale.value] || status
}

const cancelReg = async (id) => {
  const confirmMsg = {
    uz: 'Ushbu ro\'yxatdan o\'tishni bekor qilmoqchimisiz?',
    ru: 'Вы уверены, что хотите отменить эту регистрацию?',
    en: 'Are you sure you want to cancel this registration?'
  }[currentLocale.value] || 'Are you sure you want to cancel this registration?'

  if (!confirm(confirmMsg)) return
  try {
    await del(`/registrations/${id}`)
    const reg = registrations.value.find(r => r._id === id)
    if (reg) reg.status = 'cancelled'
    
    const successMsg = {
      uz: 'Ro\'yxatdan o\'tish bekor qilindi',
      ru: 'Регистрация отменена',
      en: 'Registration cancelled'
    }[currentLocale.value] || 'Registration cancelled'
    success(successMsg)
  } catch (e) {
    const failMsg = {
      uz: 'Bekor qilishda xatolik yuz berdi',
      ru: 'Не удалось отменить регистрацию',
      en: 'Failed to cancel registration'
    }[currentLocale.value] || 'Failed to cancel registration'
    showError(failMsg)
  }
}

const fetchProposedEvents = async () => {
  loadingProposed.value = true
  try {
    const data = await get('/events', { my: 'true' })
    if (data.success) {
      proposedEvents.value = data.data.events
    }
  } catch (e) {
    const failLoadMsg = {
      uz: 'Tadbirlarni yuklashda xatolik',
      ru: 'Не удалось загрузить события',
      en: 'Failed to load proposed events'
    }[currentLocale.value] || 'Failed to load proposed events'
    showError(failLoadMsg)
  } finally {
    loadingProposed.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'proposed' && proposedEvents.value.length === 0) {
    fetchProposedEvents()
  }
})

onMounted(async () => {
  try {
    const data = await get('/registrations/my')
    if (data.success) registrations.value = data.data.registrations
  } catch (e) { /* ignore */ }
  loading.value = false
})
</script>
