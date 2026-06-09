<template>
  <div class="space-y-4">
    <div class="relative rounded-3xl overflow-hidden border border-surface-150 bg-surface-50 shadow-lg">
      <div id="events-map-container" class="w-full h-[500px] z-10"></div>
      
      <!-- Overlay Information/Stats Card -->
      <div class="absolute bottom-6 left-6 z-20 max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-surface-150/50 flex items-center gap-4 animate-fade-in-up">
        <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 text-2xl flex-shrink-0 font-bold">
          📍
        </div>
        <div>
          <h4 class="font-bold text-surface-900 text-sm">Interactive Event Map</h4>
          <p class="text-xs text-surface-500 mt-0.5">Showing {{ mappedEventsCount }} upcoming events on the map across Uzbekistan.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const config = useRuntimeConfig()
let L
const map = ref(null)
const markersLayer = ref(null)

const mappedEventsCount = computed(() => {
  return props.events.filter(e => e.coordinates && e.coordinates.lat && e.coordinates.lng).length
})

const makePopupHtml = (event) => {
  const imageUrl = event.image
    ? `${config.public.apiBase.replace('/api', '')}${event.image}`
    : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=300&q=80'
  const categoryIcon = event.category?.icon || '📅'
  const categoryName = event.category?.name || 'Event'
  const categoryColor = event.category?.color || '#6366f1'
  const dateStr = new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = event.time || ''

  return `
    <div class="w-56 overflow-hidden bg-white font-sans text-surface-800 m-0">
      <div class="h-24 w-full bg-cover bg-center rounded-xl" style="background-image: url('${imageUrl}')"></div>
      <div class="pt-2 space-y-1.5">
        <div class="flex items-center">
          <span class="px-2 py-0.5 text-[9px] font-bold rounded-full text-white" style="background-color: ${categoryColor}">
            ${categoryIcon} ${categoryName}
          </span>
        </div>
        <h3 class="font-bold text-xs leading-snug line-clamp-2 text-surface-900 m-0 p-0" style="margin-top: 4px !important;">${event.title}</h3>
        <p class="text-[10px] text-surface-500 m-0 flex items-center gap-1">
          <span>📅</span> ${dateStr} ${timeStr ? `• ${timeStr}` : ''}
        </p>
        <p class="text-[10px] text-surface-500 m-0 flex items-center gap-1">
          <span>📍</span> ${event.location}
        </p>
        <div class="pt-1.5">
          <a href="/events/${event.slug}" class="block text-center bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all" style="text-decoration: none !important; color: white !important;">
            View Details
          </a>
        </div>
      </div>
    </div>
  `
}

const renderMarkers = () => {
  if (!map.value || !L) return

  // Clear existing markers
  if (markersLayer.value) {
    map.value.removeLayer(markersLayer.value)
  }

  markersLayer.value = L.layerGroup().addTo(map.value)

  const bounds = []

  props.events.forEach(event => {
    if (event.coordinates && event.coordinates.lat && event.coordinates.lng) {
      const latlng = [event.coordinates.lat, event.coordinates.lng]
      bounds.push(latlng)

      const marker = L.marker(latlng)
        .bindPopup(makePopupHtml(event), {
          maxWidth: 240,
          className: 'custom-event-popup'
        })
      
      markersLayer.value.addLayer(marker)
    }
  })

  // Fit map to markers bounds if there are any
  if (bounds.length > 0) {
    if (bounds.length === 1) {
      map.value.setView(bounds[0], 12)
    } else {
      map.value.fitBounds(bounds, { padding: [50, 50] })
    }
  }
}

watch(() => props.events, () => {
  renderMarkers()
}, { deep: true })

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')

    // Fix leaflet marker default icon path resolving issues in bundlers
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
    L.Marker.prototype.options.icon = defaultIcon

    // Initialize map centered on Uzbekistan
    map.value = L.map('events-map-container', {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView([41.3775, 64.5853], 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map.value)

    renderMarkers()
  }
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style>
/* Clean up leaflet popup styles to look premium */
.custom-event-popup .leaflet-popup-content-wrapper {
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.custom-event-popup .leaflet-popup-content {
  margin: 10px !important;
  width: 224px !important;
}
.custom-event-popup .leaflet-popup-close-button {
  top: 8px !important;
  right: 8px !important;
  color: white !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
  border-radius: 9999px !important;
  width: 18px !important;
  height: 18px !important;
  line-height: 18px !important;
  font-size: 10px !important;
  font-weight: bold !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.custom-event-popup .leaflet-popup-close-button:hover {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
.custom-event-popup .leaflet-popup-tip-container {
  margin-top: -1px;
}
</style>
