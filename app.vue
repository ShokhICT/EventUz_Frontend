<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiAppToast />
  </div>
</template>

<script setup>
const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>
