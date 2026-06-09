<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden gradient-bg min-h-[600px] flex items-center">
      <!-- Decorative shapes -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s;" />
        <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;" />
      </div>

      <div class="container-custom relative z-10 py-20">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-8 animate-fade-in-down">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>{{ t('home.discoverSubtitle') }}</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-accent-300">
            {{ t('home.heroTitle') }}
          </h1>

          <p class="text-lg text-white/70 mb-10 max-w-xl mx-auto animate-fade-in-up" style="animation-delay: 0.2s;">
            {{ t('home.heroSubtitle') }}
          </p>

          <!-- Search bar -->
          <div class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto animate-fade-in-up" style="animation-delay: 0.3s;">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('home.searchPlaceholder')"
                class="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                @keyup.enter="goToSearch"
              >
            </div>
            <button @click="goToSearch" class="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5 active:scale-95">
              {{ t('home.searchBtn') }}
            </button>
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in-up" style="animation-delay: 0.5s;">
            <div class="text-center">
              <p class="text-2xl font-bold text-white">{{ stats.events }}</p>
              <p class="text-sm text-white/60">{{ t('home.statsEvents') }}</p>
            </div>
            <div class="w-px h-8 bg-white/20" />
            <div class="text-center">
              <p class="text-2xl font-bold text-white">{{ stats.users }}</p>
              <p class="text-sm text-white/60">{{ t('home.statsUsers') }}</p>
            </div>
            <div class="w-px h-8 bg-white/20" />
            <div class="text-center">
              <p class="text-2xl font-bold text-white">{{ stats.regions }}</p>
              <p class="text-sm text-white/60">{{ t('home.statsRegions') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Events -->
    <section class="section bg-white">
      <div class="container-custom">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-surface-900 mb-2">{{ t('home.discoverTitle') }}</h2>
            <p class="text-surface-500">{{ t('home.discoverSubtitle') }}</p>
          </div>
          <NuxtLink to="/events" class="btn-outline btn-sm hidden sm:inline-flex">
            {{ t('home.discoverAll') }}
          </NuxtLink>
        </div>

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card-flat p-0">
            <div class="h-48 skeleton rounded-b-none" />
            <div class="p-5 space-y-3">
              <div class="h-4 w-20 skeleton" />
              <div class="h-6 w-full skeleton" />
              <div class="h-4 w-3/4 skeleton" />
            </div>
          </div>
        </div>

        <div v-else-if="upcomingEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventsEventCard
            v-for="event in upcomingEvents.slice(0, 6)"
            :key="event._id"
            :event="event"
            @click="navigateTo(`/events/${event.slug}`)"
          />
        </div>

        <div v-else class="text-center py-12 bg-surface-50 rounded-3xl border border-surface-150">
          <div class="text-4xl mb-3">📅</div>
          <p class="text-surface-500 font-medium">{{ t('home.emptyEvents') }}</p>
        </div>

        <div class="text-center mt-8 sm:hidden">
          <NuxtLink to="/events" class="btn-outline">{{ t('home.discoverAll') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Events Map Section -->
    <section class="section bg-surface-50 border-t border-b border-surface-150">
      <div class="container-custom">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-surface-900 mb-2">{{ t('home.eventsMapTitle') }}</h2>
          <p class="text-surface-500">{{ t('home.eventsMapSubtitle') }}</p>
        </div>
        
        <ClientOnly>
          <EventsMap :events="upcomingEvents" />
          <template #fallback>
            <div class="w-full h-[500px] rounded-3xl bg-surface-100 animate-pulse flex items-center justify-center text-surface-400">
              Loading map...
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- Categories -->
    <section class="section bg-surface-50">
      <div class="container-custom">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-surface-900 mb-2">{{ t('home.categoriesTitle') }}</h2>
          <p class="text-surface-500">{{ t('home.categoriesSubtitle') }}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat._id"
            :to="`/events?category=${cat.slug}`"
            class="group bg-white rounded-2xl p-6 text-center border border-surface-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 transition-transform group-hover:scale-110"
              :style="{ backgroundColor: (cat.color || '#6366f1') + '15' }"
            >
              {{ cat.icon }}
            </div>
            <h3 class="font-semibold text-surface-800 group-hover:text-primary-600 transition-colors">{{ cat.name }}</h3>
            <p class="text-xs text-surface-400 mt-1">{{ cat.eventCount || 0 }} {{ t('home.statsEvents').toLowerCase() }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section bg-white">
      <div class="container-custom">
        <div class="gradient-bg rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
            <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-400/10 rounded-full blur-2xl" />
          </div>
          <div class="relative z-10">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ t('home.ctaTitle') }}</h2>
            <p class="text-white/70 mb-8 max-w-lg mx-auto">
              {{ t('home.ctaSubtitle') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink to="/register" class="btn-lg bg-white text-primary-700 hover:bg-surface-100 font-bold shadow-xl hover:-translate-y-1 transition-all">
                {{ t('home.ctaBtnStart') }}
              </NuxtLink>
              <NuxtLink to="/events" class="btn-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all">
                {{ t('home.ctaBtnBrowse') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()

definePageMeta({ layout: 'default' })

useHead({
  title: computed(() => `EventHub Uzbekistan — ${t('home.heroTitle')}`)
})

const config = useRuntimeConfig()
const searchQuery = ref('')
const loading = ref(true)
const upcomingEvents = ref([])
const categories = ref([])
const stats = ref({ events: 0, users: 0, regions: 14 })

const goToSearch = () => {
  navigateTo({ path: '/events', query: { search: searchQuery.value } })
}

onMounted(async () => {
  try {
    const [eventsRes, catsRes, statsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/events/upcoming?limit=24`),
      $fetch(`${config.public.apiBase}/categories`),
      $fetch(`${config.public.apiBase}/events/stats`).catch(() => null)
    ])
    if (eventsRes.success) upcomingEvents.value = eventsRes.data.events
    if (catsRes.success) categories.value = catsRes.data.categories
    if (statsRes && statsRes.success) stats.value = statsRes.data
  } catch (e) {
    console.error('Failed to load homepage data:', e)
  } finally {
    loading.value = false
  }
})
</script>
