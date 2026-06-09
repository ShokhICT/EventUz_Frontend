import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshTokenValue: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.name || '',
  },

  actions: {
    async login(email, password) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password }
      })

      if (data.success) {
        this.setAuth(data.data)
      }
      return data
    },

    async register(userData) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/auth/register`, {
        method: 'POST',
        body: userData
      })

      if (data.success) {
        this.setAuth(data.data)
      }
      return data
    },

    async fetchProfile() {
      const { get } = useApi()
      try {
        const data = await get('/auth/me')
        if (data.success) {
          this.user = data.data.user
        }
        return data
      } catch (e) {
        this.logout()
        return null
      }
    },

    async refreshToken() {
      if (!this.refreshTokenValue) return false
      const config = useRuntimeConfig()
      try {
        const data = await $fetch(`${config.public.apiBase}/auth/refresh`, {
          method: 'POST',
          body: { refreshToken: this.refreshTokenValue }
        })

        if (data.success) {
          this.setAuth(data.data)
          return true
        }
        return false
      } catch {
        this.logout()
        return false
      }
    },

    setAuth(data) {
      this.user = data.user
      this.token = data.accessToken
      this.refreshTokenValue = data.refreshToken

      if (import.meta.client) {
        localStorage.setItem('eventhub_token', data.accessToken)
        localStorage.setItem('eventhub_refresh', data.refreshToken)
        localStorage.setItem('eventhub_user', JSON.stringify(data.user))
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshTokenValue = null

      if (import.meta.client) {
        localStorage.removeItem('eventhub_token')
        localStorage.removeItem('eventhub_refresh')
        localStorage.removeItem('eventhub_user')
      }

      navigateTo('/login')
    },

    initAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('eventhub_token')
        const refresh = localStorage.getItem('eventhub_refresh')
        const user = localStorage.getItem('eventhub_user')

        if (token && user) {
          this.token = token
          this.refreshTokenValue = refresh
          try {
            this.user = JSON.parse(user)
          } catch {
            this.logout()
          }
        }
      }
    }
  }
})
