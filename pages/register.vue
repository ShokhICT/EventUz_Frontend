<template>
  <div class="glass rounded-2xl p-8 animate-scale-in">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-surface-900 mb-2">{{ t('auth.registerTitle') }}</h1>
      <p class="text-surface-500">
        {{ currentLocale === 'uz' ? 'EventHub-ga a\'zo bo\'ling va qiziqarli tadbirlarni kashf eting' : currentLocale === 'ru' ? 'Присоединяйтесь к EventHub и открывайте интересные события' : 'Join EventHub and discover amazing events' }}
      </p>
    </div>
 
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="input-label">{{ t('auth.name') }}</label>
        <input v-model="form.name" type="text" class="input" :class="{ 'input-error': errors.name }" :placeholder="t('auth.name')" required>
        <p v-if="errors.name" class="input-error-text">{{ errors.name }}</p>
      </div>
 
      <div>
        <label class="input-label">{{ t('auth.email') }}</label>
        <input v-model="form.email" type="email" class="input" :class="{ 'input-error': errors.email }" placeholder="you@example.com" required>
        <p v-if="errors.email" class="input-error-text">{{ errors.email }}</p>
      </div>
 
      <div>
        <label class="input-label">{{ t('profile.phone') }} ({{ currentLocale === 'uz' ? 'ixtiyoriy' : currentLocale === 'ru' ? 'необязательно' : 'optional' }})</label>
        <input v-model="form.phone" type="tel" class="input" placeholder="+998 XX XXX XX XX">
      </div>
 
      <div>
        <label class="input-label">{{ t('auth.password') }}</label>
        <input v-model="form.password" type="password" class="input" :class="{ 'input-error': errors.password }" :placeholder="currentLocale === 'uz' ? 'Kamida 6 ta belgi' : currentLocale === 'ru' ? 'Не менее 6 символов' : 'At least 6 characters'" required>
        <p v-if="errors.password" class="input-error-text">{{ errors.password }}</p>
      </div>
 
      <div>
        <label class="input-label">{{ t('profile.confirmPass') }}</label>
        <input v-model="form.confirmPassword" type="password" class="input" :class="{ 'input-error': errors.confirmPassword }" :placeholder="currentLocale === 'uz' ? 'Parolni takrorlang' : currentLocale === 'ru' ? 'Повторите пароль' : 'Repeat your password'" required>
        <p v-if="errors.confirmPassword" class="input-error-text">{{ errors.confirmPassword }}</p>
      </div>
 
      <p v-if="apiError" class="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2">{{ apiError }}</p>
 
      <button type="submit" :disabled="submitting" class="btn-primary w-full">
        <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span v-else>{{ t('auth.signUpBtn') }}</span>
      </button>
    </form>
 
    <p class="text-center text-sm text-surface-500 mt-6">
      {{ t('auth.signInPrompt') }}
      <NuxtLink to="/login" class="text-primary-600 font-semibold hover:text-primary-700">{{ t('auth.signInLink') }}</NuxtLink>
    </p>
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, currentLocale } = useI18n()

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: computed(() => `${t('auth.signUpBtn')} — EventHub Uzbekistan`) })
 
const authStore = useAuthStore()
 
const form = ref({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
const errors = ref({})
const apiError = ref('')
const submitting = ref(false)
 
const handleRegister = async () => {
  errors.value = {}
  apiError.value = ''
 
  if (!form.value.name) {
    errors.value.name = {
      uz: 'Ism kiritilishi shart',
      ru: 'Имя обязательно',
      en: 'Name is required'
    }[currentLocale.value] || 'Name is required'
    return
  }
  if (!form.value.email) {
    errors.value.email = {
      uz: 'Email kiritilishi shart',
      ru: 'Email обязателен',
      en: 'Email is required'
    }[currentLocale.value] || 'Email is required'
    return
  }
  if (form.value.password.length < 6) {
    errors.value.password = {
      uz: 'Parol kamida 6 ta belgidan iborat bo\'shilishi kerak',
      ru: 'Пароль должен быть не менее 6 символов',
      en: 'Password must be at least 6 characters'
    }[currentLocale.value] || 'Password must be at least 6 characters'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = {
      uz: 'Parollar mos kelmadi',
      ru: 'Пароли не совпадают',
      en: 'Passwords do not match'
    }[currentLocale.value] || 'Passwords do not match'
    return
  }
 
  submitting.value = true
  try {
    const data = await authStore.register({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
    })
    if (data.success) {
      navigateTo('/')
    }
  } catch (e) {
    const regFailMsg = {
      uz: 'Ro\'yxatdan o\'tishda xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      ru: 'Регистрация не удалась. Пожалуйста, попробуйте еще раз.',
      en: 'Registration failed. Please try again.'
    }[currentLocale.value] || 'Registration failed.'
    apiError.value = e.data?.message || regFailMsg
  } finally {
    submitting.value = false
  }
}
</script>
