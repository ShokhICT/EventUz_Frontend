<template>
  <div class="section">
    <div class="container-custom max-w-3xl">
      <h1 class="text-3xl font-bold text-surface-900 mb-8">{{ t('profile.title') }}</h1>

      <div class="bg-white rounded-2xl border border-surface-100 p-8 mb-6">
        <h2 class="text-xl font-bold text-surface-900 mb-6">{{ t('profile.personalInfo') }}</h2>
        <form @submit.prevent="updateProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="input-label">{{ t('profile.name') }}</label>
              <input v-model="form.name" type="text" class="input" required>
            </div>
            <div>
              <label class="input-label">{{ t('profile.email') }}</label>
              <input v-model="form.email" type="email" class="input" required>
            </div>
            <div>
              <label class="input-label">{{ t('profile.phone') }}</label>
              <input v-model="form.phone" type="tel" class="input" placeholder="+998 XX XXX XX XX">
            </div>
          </div>
          <div>
            <label class="input-label">{{ t('profile.bio') }}</label>
            <textarea v-model="form.bio" rows="3" class="input" :placeholder="t('profile.bio') + '...'"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="submit" :disabled="saving" class="btn-primary">
              <span v-if="saving" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>{{ t('profile.saveBtn') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password -->
      <div class="bg-white rounded-2xl border border-surface-100 p-8">
        <h2 class="text-xl font-bold text-surface-900 mb-6">{{ t('profile.changePass') }}</h2>
        <form @submit.prevent="changePassword" class="space-y-5">
          <div>
            <label class="input-label">{{ t('profile.oldPass') }}</label>
            <input v-model="passForm.currentPassword" type="password" class="input" required>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="input-label">{{ t('profile.newPass') }}</label>
              <input v-model="passForm.newPassword" type="password" class="input" required>
            </div>
            <div>
              <label class="input-label">{{ t('profile.confirmPass') }}</label>
              <input v-model="passForm.confirmPassword" type="password" class="input" required>
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" :disabled="changingPass" class="btn-secondary">
              <span v-if="changingPass" class="w-4 h-4 border-2 border-surface-300 border-t-surface-600 rounded-full animate-spin" />
              <span v-else>{{ t('profile.updatePassBtn') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t, currentLocale } = useI18n()

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: computed(() => `${t('profile.title')} — EventHub Uzbekistan`) })

const authStore = useAuthStore()
const { success, error: showError } = useToast()
const { put } = useApi()

const form = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  bio: authStore.user?.bio || '',
})

const passForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const changingPass = ref(false)

const updateProfile = async () => {
  saving.value = true
  try {
    const data = await put('/auth/profile', form.value)
    if (data.success) {
      authStore.user = data.data.user
      if (import.meta.client) {
        localStorage.setItem('eventhub_user', JSON.stringify(data.data.user))
      }
      success(t('profile.successUpdate'))
    }
  } catch (e) {
    const updateFailMsg = {
      uz: 'Profilni yangilashda xatolik',
      ru: 'Не удалось обновить профиль',
      en: 'Failed to update profile'
    }[currentLocale.value] || 'Failed to update profile'
    showError(e.data?.message || updateFailMsg)
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passForm.value.newPassword !== passForm.value.confirmPassword) {
    const matchFailMsg = {
      uz: 'Parollar mos kelmadi',
      ru: 'Пароли не совпадают',
      en: 'Passwords do not match'
    }[currentLocale.value] || 'Passwords do not match'
    showError(matchFailMsg)
    return
  }
  if (passForm.value.newPassword.length < 6) {
    const lenFailMsg = {
      uz: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
      ru: 'Пароль должен содержать не менее 6 символов',
      en: 'Password must be at least 6 characters'
    }[currentLocale.value] || 'Password must be at least 6 characters'
    showError(lenFailMsg)
    return
  }

  changingPass.value = true
  try {
    const data = await put('/auth/password', {
      currentPassword: passForm.value.currentPassword,
      newPassword: passForm.value.newPassword,
    })
    if (data.success) {
      passForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      success(t('profile.successPass'))
    }
  } catch (e) {
    const passFailMsg = {
      uz: 'Parolni o\'zgartirishda xatolik',
      ru: 'Не удалось изменить пароль',
      en: 'Failed to change password'
    }[currentLocale.value] || 'Failed to change password'
    showError(e.data?.message || passFailMsg)
  } finally {
    changingPass.value = false
  }
}
</script>
