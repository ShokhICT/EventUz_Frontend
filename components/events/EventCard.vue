<template>
  <div class="card group cursor-pointer" @click="$emit('click')">
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <div
        class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
        :style="event.image ? `background-image: url(${apiBase.replace('/api', '')}${event.image}); background-size: cover; background-position: center;` : ''"
      >
        <span v-if="!event.image" class="text-5xl opacity-50">📅</span>
      </div>
      <!-- Date badge -->
      <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center shadow-sm">
        <p class="text-xs font-bold text-primary-600 uppercase">{{ formatMonth(event.date) }}</p>
        <p class="text-lg font-bold text-surface-800 leading-tight">{{ formatDay(event.date) }}</p>
      </div>
      <!-- Status badge -->
      <div v-if="showStatus" class="absolute top-3 right-3">
        <span :class="statusClass">{{ event.status }}</span>
      </div>
      <!-- Free badge -->
      <div v-if="event.isFree || event.price === 0" class="absolute bottom-3 right-3">
        <span class="badge bg-emerald-500 text-white text-[10px]">FREE</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Category -->
      <div v-if="event.category" class="flex items-center gap-2 mb-2">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
          :style="{ backgroundColor: (event.category.color || '#6366f1') + '15', color: event.category.color || '#6366f1' }"
        >
          {{ event.category.icon }} {{ event.category.name }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-surface-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {{ event.title }}
      </h3>

      <!-- Short desc -->
      <p class="text-sm text-surface-500 line-clamp-2 mb-4">
        {{ event.shortDescription || event.description?.substring(0, 120) }}
      </p>

      <!-- Meta -->
      <div class="flex flex-col gap-2 text-sm text-surface-500">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{{ event.location }}</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ formatDate(event.date) }}{{ event.time ? ' • ' + event.time : '' }}</span>
        </div>
      </div>

      <!-- Bottom -->
      <div v-if="event.capacity > 0" class="mt-4 pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between text-xs">
          <span class="text-surface-500">{{ event.registrationCount || 0 }} / {{ event.capacity }} registered</span>
          <span :class="spotsLeft <= 5 ? 'text-red-500 font-semibold' : 'text-surface-400'">
            {{ spotsLeft }} spots left
          </span>
        </div>
        <div class="mt-1.5 h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="fillPercent > 80 ? 'bg-red-500' : fillPercent > 50 ? 'bg-accent-500' : 'bg-primary-500'"
            :style="{ width: fillPercent + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  event: { type: Object, required: true },
  showStatus: { type: Boolean, default: false }
})

defineEmits(['click'])

const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const spotsLeft = computed(() => {
  if (!props.event.capacity) return 0
  return Math.max(0, props.event.capacity - (props.event.registrationCount || 0))
})

const fillPercent = computed(() => {
  if (!props.event.capacity) return 0
  return Math.min(100, Math.round(((props.event.registrationCount || 0) / props.event.capacity) * 100))
})

const statusClass = computed(() => {
  const map = {
    approved: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
    draft: 'badge-info'
  }
  return map[props.event.status] || 'badge-info'
})

const formatDay = (date) => new Date(date).getDate()
const formatMonth = (date) => new Date(date).toLocaleString('en', { month: 'short' })
const formatDate = (date) => new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
</script>
