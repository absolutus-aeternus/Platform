import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    lastSync: null,
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false
  }),

  getters: {
    hasNotifications: (state) => state.notifications.length > 0,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    recentNotifications: (state) => state.notifications.slice(0, 10),
    orderNotifications: (state) => state.notifications.filter(n => n.type === 'order'),
    promoNotifications: (state) => state.notifications.filter(n => n.type === 'promo'),
    systemNotifications: (state) => state.notifications.filter(n => n.type === 'system')
  },

  actions: {
    async fetchNotifications(userId, options = { limit: 50 }) {
      this.isLoading = true
      this.error = null

      try {
        const { supabase } = await import('@/services/supabase')
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(options.limit)

        if (error) throw error

        this.notifications = data || []
        this.unreadCount = data.filter(n => !n.is_read).length
        this.lastSync = new Date().toISOString()

      } catch (e) {
        this.error = e.message
        console.error('fetchNotifications error:', e)
      } finally {
        this.isLoading = false
      }
    },

    async markAsRead(notificationId) {
      try {
        const { supabase } = await import('@/services/supabase')
        
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId)

        if (error) throw error

        // Update local state
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          this.notifications[index].is_read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }

      } catch (e) {
        console.error('markAsRead error:', e)
      }
    },

    async markAllAsRead(userId) {
      try {
        const { supabase } = await import('@/services/supabase')
        
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('is_read', false)

        if (error) throw error

        // Update local state
        this.notifications.forEach(n => n.is_read = true)
        this.unreadCount = 0

      } catch (e) {
        console.error('markAllAsRead error:', e)
      }
    },

    addNotification(notification) {
      this.notifications.unshift({
        ...notification,
        id: Date.now(), // Temporary ID for local notifications
        created_at: new Date().toISOString(),
        is_read: false
      })
      this.unreadCount++
      
      // Keep only last 100 notifications in memory
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100)
      }
    },

    removeNotification(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId)
      const wasUnread = notification && !notification.is_read
      this.notifications = this.notifications.filter(n => n.id !== notificationId)
      if (wasUnread) {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    clearNotifications() {
      this.notifications = []
      this.unreadCount = 0
    },

    async enablePushNotifications() {
      if (!('Notification' in window)) {
        console.warn('Push notifications not supported')
        return false
      }

      try {
        const permission = await Notification.requestPermission()
        
        if (permission === 'granted') {
          this.pushEnabled = true
          
          // Register service worker and subscribe to push
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready
            
            // TODO: Subscribe to OneSignal or custom push service
            // const subscription = await registration.pushManager.subscribe({...})
            // Send subscription to backend
            
            console.log('Push notifications enabled')
            return true
          }
        }
        
        return false
      } catch (e) {
        console.error('enablePushNotifications error:', e)
        return false
      }
    },

    disablePushNotifications() {
      this.pushEnabled = false
      // TODO: Unsubscribe from push service
    },

    sendOrderNotification(order, type) {
      const messages = {
        created: `Order #${order.id} berhasil dibuat`,
        paid: `Pembayaran order #${order.id} diterima`,
        shipped: `Order #${order.id} sedang dikirim`,
        delivered: `Order #${order.id} telah diterima`,
        cancelled: `Order #${order.id} dibatalkan`
      }

      this.addNotification({
        user_id: order.user_id,
        type: 'order',
        title: 'Update Order',
        message: messages[type] || 'Ada update untuk order Anda',
        data: { order_id: order.id, type },
        icon: '/icons/order-icon.png'
      })
    },

    sendPromoNotification(title, message, data = {}) {
      this.addNotification({
        user_id: null, // Broadcast to all users
        type: 'promo',
        title,
        message,
        data,
        icon: '/icons/promo-icon.png'
      })
    },

    sendSystemNotification(title, message, userId = null) {
      this.addNotification({
        user_id: userId,
        type: 'system',
        title,
        message,
        data: {},
        icon: '/icons/system-icon.png'
      })
    }
  }
})
