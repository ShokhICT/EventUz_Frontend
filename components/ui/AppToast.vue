<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-xl animate-slide-in-right',
            typeClasses[toast.type]
          ]"
        >
          <span class="text-lg flex-shrink-0 mt-0.5">{{ typeIcons[toast.type] }}</span>
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
const { toasts, removeToast } = useToast()

const typeClasses = {
  success: 'bg-emerald-50/90 border-emerald-200 text-emerald-800',
  error: 'bg-red-50/90 border-red-200 text-red-800',
  info: 'bg-blue-50/90 border-blue-200 text-blue-800',
  warning: 'bg-amber-50/90 border-amber-200 text-amber-800',
}

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}
</style>
