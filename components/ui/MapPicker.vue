<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-surface-500 mr-2">Quick jump:</span>
      <button
        v-for="city in cities"
        :key="city.name"
        type="button"
        @click="jumpToCity(city)"
        class="text-xs px-2.5 py-1.5 rounded-lg bg-surface-50 border border-surface-100 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all font-medium text-surface-700"
      >
        {{ city.name }}
      </button>
    </div>

    <div class="relative rounded-2xl overflow-hidden border border-surface-200 bg-surface-50 shadow-inner">
      <div id="map-picker-container" class="w-full h-80 z-10"></div>
      
      <!-- Overlay indicator -->
      <div class="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow border border-surface-100/50 text-[11px] font-medium text-surface-700">
        <span v-if="modelValue">
          📍 Latitude: {{ modelValue.lat.toFixed(6) }}, Longitude: {{ modelValue.lng.toFixed(6) }}
        </span>
        <span v-else class="text-surface-400">
          ❌ No location selected. Click the map to place a pin.
        </span>
      </div>

      <!-- Clear button -->
      <button
        v-if="modelValue"
        type="button"
        @click="clearSelection"
        class="absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
      >
        Clear Pin
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => null // format: { lat, lng }
  }
})

const emit = defineEmits(['update:modelValue'])

const cities = [
  { name: 'Tashkent', lat: 41.311081, lng: 69.240562 },
  { name: 'Samarkand', lat: 39.650774, lng: 66.965424 },
  { name: 'Bukhara', lat: 39.774720, lng: 64.428612 },
  { name: 'Namangan', lat: 40.998305, lng: 71.672579 },
  { name: 'Andijan', lat: 40.782060, lng: 72.344237 },
  { name: 'Fergana', lat: 40.386389, lng: 71.786389 },
  { name: 'Nukus', lat: 42.478206, lng: 59.605338 },
  { name: 'Chimgan', lat: 41.517926, lng: 70.053896 }
]

let L
const map = ref(null)
const marker = ref(null)

const setCoordinates = (lat, lng) => {
  emit('update:modelValue', { lat, lng })
  if (map.value) {
    if (marker.value) {
      marker.value.setLatLng([lat, lng])
    } else {
      marker.value = L.marker([lat, lng]).addTo(map.value)
    }
  }
}

const clearSelection = () => {
  emit('update:modelValue', null)
  if (marker.value && map.value) {
    map.value.removeLayer(marker.value)
    marker.value = null
  }
}

const jumpToCity = (city) => {
  if (map.value) {
    map.value.setView([city.lat, city.lng], 13)
    setCoordinates(city.lat, city.lng)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (!map.value || !L) return
  
  if (newVal && newVal.lat && newVal.lng) {
    const latlng = [newVal.lat, newVal.lng]
    if (marker.value) {
      marker.value.setLatLng(latlng)
    } else {
      marker.value = L.marker(latlng).addTo(map.value)
    }
    
    // Pan to position if map center is far away
    const center = map.value.getCenter()
    if (Math.abs(center.lat - newVal.lat) > 0.005 || Math.abs(center.lng - newVal.lng) > 0.005) {
      map.value.setView(latlng, 13)
    }
  } else if (!newVal && marker.value) {
    map.value.removeLayer(marker.value)
    marker.value = null
  }
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

    const initialLat = props.modelValue?.lat || 41.311081
    const initialLng = props.modelValue?.lng || 69.240562
    const initialZoom = props.modelValue ? 13 : 6

    map.value = L.map('map-picker-container', {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([initialLat, initialLng], initialZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map.value)

    if (props.modelValue && props.modelValue.lat && props.modelValue.lng) {
      marker.value = L.marker([props.modelValue.lat, props.modelValue.lng]).addTo(map.value)
    }

    map.value.on('click', (e) => {
      setCoordinates(e.latlng.lat, e.latlng.lng)
    })
  }
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
#map-picker-container {
  outline: none;
}
</style>
