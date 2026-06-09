import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
  }),

  actions: {
    async fetchNotifications() {
      const { get } = useApi()
      try {
        const data = await get('/notifications')
        if (data.success) {
          this.notifications = data.data.notifications
          this.unreadCount = data.data.unreadCount
        }
      } catch (e) {
        // silently fail
      }
    },

    async markAsRead(id) {
      const { put } = useApi()
      try {
        await put(`/notifications/${id}/read`)
        const notif = this.notifications.find(n => n._id === id)
        if (notif && !notif.read) {
          notif.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch (e) {
        // silently fail
      }
    },

    async markAllAsRead() {
      const { put } = useApi()
      try {
        await put('/notifications/read-all')
        this.notifications.forEach(n => n.read = true)
        this.unreadCount = 0
      } catch (e) {
        // silently fail
      }
    }
  }
})
