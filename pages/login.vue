<template>
  <div class="glass rounded-2xl p-8 animate-scale-in">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-surface-900 mb-2">{{ t('auth.welcomeBack') }}</h1>
      <p class="text-surface-500">{{ t('auth.signInSubtitle') }}</p>
    </div>
 
    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="input-label">{{ t('auth.email') }}</label>
        <input v-model="form.email" type="email" class="input" :class="{ 'input-error': errors.email }" placeholder="you@example.com" required>
        <p v-if="errors.email" class="input-error-text">{{ errors.email }}</p>
      </div>
 
      <div>
        <label class="input-label">{{ t('auth.password') }}</label>
        <div class="relative">
          <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="input pr-12" :class="{ 'input-error': errors.password }" placeholder="••••••••" required>
          <button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
            {{ showPass ? '🙈' : '👁️' }}
          </button>
        </div>
        <p v-if="errors.password" class="input-error-text">{{ errors.password }}</p>
      </div>
 
      <p v-if="apiError" class="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2">{{ apiError }}</p>
 
      <button type="submit" :disabled="submitting" class="btn-primary w-full">
        <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span v-else>{{ t('auth.signInBtn') }}</span>
      </button>
    </form>
 
    <p class="text-center text-sm text-surface-500 mt-6">
      {{ t('auth.signUpPrompt') }}
      <NuxtLink to="/register" class="text-primary-600 font-semibold hover:text-primary-700">{{ t('auth.signUpLink') }}</NuxtLink>
    </p>
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, currentLocale } = useI18n()

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: computed(() => `${t('auth.signInBtn')} — EventHub Uzbekistan`) })
 
const authStore = useAuthStore()
 
const form = ref({ email: '', password: '' })
const errors = ref({})
const apiError = ref('')
const submitting = ref(false)
const showPass = ref(false)
 
const handleLogin = async () => {
  errors.value = {}
  apiError.value = ''
 
  if (!form.value.email) {
    errors.value.email = {
      uz: 'Email kiritilishi shart',
      ru: 'Email обязатеlen',
      en: 'Email is required'
    }[currentLocale.value] || 'Email is required'
    return
  }
  if (!form.value.password) {
    errors.value.password = {
      uz: 'Parol kiritilishi shart',
      ru: 'Пароль обязатеlen',
      en: 'Password is required'
    }[currentLocale.value] || 'Password is required'
    return
  }
 
  submitting.value = true
  try {
    const data = await authStore.login(form.value.email, form.value.password)
    if (data.success) {
      if (authStore.isAdmin) {
        navigateTo('/admin')
      } else {
        navigateTo('/')
      }
    }
  } catch (e) {
    const loginFailMsg = {
      uz: 'Tizimga kirishda xatolik. Ma\'lumotlaringizni tekshiring.',
      ru: 'Ошибка входа. Пожалуйста, проверьте свои учетные данные.',
      en: 'Login failed. Please check your credentials.'
    }[currentLocale.value] || 'Login failed.'
    apiError.value = e.data?.message || loginFailMsg
  } finally {
    submitting.value = false
  }
}
</script>
