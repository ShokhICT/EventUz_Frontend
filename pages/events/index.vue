<template>
  <div class="section">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-surface-900 mb-2">{{ t('events.title') }}</h1>
        <p class="text-surface-500">{{ t('events.subtitle') }}</p>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white rounded-2xl border border-surface-100 p-4 mb-8 flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="filters.search"
            type="text"
            :placeholder="t('events.searchPlaceholder')"
            class="input pl-10"
            @input="debouncedSearch"
          >
        </div>

        <!-- Category -->
        <select v-model="filters.category" @change="fetchEvents" class="input lg:w-48">
          <option value="">{{ t('events.allCats') }}</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat.slug">{{ cat.icon }} {{ cat.name }}</option>
        </select>

        <!-- Location -->
        <select v-model="filters.location" @change="fetchEvents" class="input lg:w-40">
          <option value="">{{ t('events.allLocs') }}</option>
          <option v-for="loc in locations" :key="loc">{{ loc }}</option>
        </select>

        <!-- Date -->
        <input v-model="filters.dateFrom" type="date" @change="fetchEvents" class="input lg:w-44" :placeholder="t('events.fromDate')">

        <!-- Clear -->
        <button v-if="hasFilters" @click="clearFilters" class="btn-ghost btn-sm whitespace-nowrap">
          {{ t('events.clearBtn') }}
        </button>

        <!-- View Mode Switcher -->
        <div class="flex bg-surface-50 p-1 rounded-xl gap-0.5 border border-surface-150 ml-auto self-stretch lg:self-auto">
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 flex-1 lg:flex-none', viewMode === 'grid' ? 'bg-white text-surface-900 shadow-sm border border-surface-100' : 'text-surface-400 hover:text-surface-700']"
          >
            📋 {{ t('events.listView') }}
          </button>
          <button
            type="button"
            @click="viewMode = 'map'"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 flex-1 lg:flex-none', viewMode === 'map' ? 'bg-white text-surface-900 shadow-sm border border-surface-100' : 'text-surface-400 hover:text-surface-700']"
          >
            🗺️ {{ t('events.mapView') }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card-flat p-0">
          <div class="h-48 skeleton rounded-b-none" />
          <div class="p-5 space-y-3">
            <div class="h-4 w-24 skeleton" />
            <div class="h-6 w-full skeleton" />
            <div class="h-4 w-2/3 skeleton" />
          </div>
        </div>
      </div>

      <div v-else-if="events.length > 0">
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'">
          <p class="text-sm text-surface-500 mb-4">{{ pagination.total }} {{ t('events.eventsFound') }}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventsEventCard
              v-for="event in events"
              :key="event._id"
              :event="event"
              @click="navigateTo(`/events/${event.slug}`)"
            />
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="flex items-center justify-center gap-2 mt-10">
            <button
              :disabled="pagination.page <= 1"
              @click="goToPage(pagination.page - 1)"
              class="btn-ghost btn-sm font-semibold"
            >
              ← {{ t('events.prev') || 'Previous' }}
            </button>
            <template v-for="p in paginationRange" :key="p">
              <button
                v-if="typeof p === 'number'"
                @click="goToPage(p)"
                :class="['w-10 h-10 rounded-xl text-sm font-medium transition-all', p === pagination.page ? 'bg-primary-600 text-white shadow-lg' : 'text-surface-600 hover:bg-surface-100']"
              >
                {{ p }}
              </button>
              <span v-else class="text-surface-400">...</span>
            </template>
            <button
              :disabled="pagination.page >= pagination.pages"
              @click="goToPage(pagination.page + 1)"
              class="btn-ghost btn-sm font-semibold"
            >
              {{ t('events.next') || 'Next' }} →
            </button>
          </div>
        </div>

        <!-- Map View -->
        <div v-else-if="viewMode === 'map'">
          <p class="text-sm text-surface-500 mb-4">{{ t('events.eventsOnMap') }}: {{ events.length }}</p>
          <ClientOnly>
            <EventsMap :events="events" />
            <template #fallback>
              <div class="w-full h-[500px] rounded-3xl bg-surface-100 animate-pulse flex items-center justify-center text-surface-400">
                Loading map...
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-20 bg-white rounded-3xl border border-surface-150">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-surface-800 mb-2">{{ t('events.emptyStateTitle') }}</h3>
        <p class="text-surface-500 mb-6">{{ t('events.emptyStateSubtitle') }}</p>
        <button @click="clearFilters" class="btn-primary">{{ t('events.emptyStateClear') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

definePageMeta({ layout: 'default' })
useHead({ title: computed(() => `${t('events.title')} — EventHub Uzbekistan`) })

const config = useRuntimeConfig()
const route = useRoute()

const events = ref([])
const categories = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, limit: 12, total: 0, pages: 0 })
const viewMode = ref('grid')

const filters = ref({
  search: route.query.search || '',
  category: route.query.category || '',
  location: route.query.location || '',
  dateFrom: '',
})

const locations = ['Tashkent', 'Samarkand', 'Bukhara', 'Fergana', 'Namangan', 'Andijan', 'Nukus', 'Khiva', 'Chimgan']

const hasFilters = computed(() => {
  return filters.value.search || filters.value.category || filters.value.location || filters.value.dateFrom
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchEvents(), 400)
}

const fetchEvents = async (page = 1) => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', 12)
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.category) params.append('category', filters.value.category)
    if (filters.value.location) params.append('location', filters.value.location)
    if (filters.value.dateFrom) params.append('dateFrom', filters.value.dateFrom)

    const data = await $fetch(`${config.public.apiBase}/events?${params.toString()}`)
    if (data.success) {
      events.value = data.data.events
      pagination.value = data.data.pagination
    }
  } catch (e) {
    console.error('Failed to fetch events:', e)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  fetchEvents(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  filters.value = { search: '', category: '', location: '', dateFrom: '' }
  fetchEvents()
}

const paginationRange = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

onMounted(async () => {
  try {
    const catsRes = await $fetch(`${config.public.apiBase}/categories`)
    if (catsRes.success) categories.value = catsRes.data.categories
  } catch (e) { /* ignore */ }
  fetchEvents()
})
</script>
