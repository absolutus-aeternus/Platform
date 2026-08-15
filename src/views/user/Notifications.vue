<template>
  <div class="notifications">
    <h1>Notifications</h1>
    <div v-if="loading" class="loading">Loading notifications...</div>
    <div v-else-if="notifications.length === 0" class="empty-state">
      <i class="fas fa-bell"></i>
      <p>No notifications</p>
    </div>
    <div v-else class="notification-list">
      <div v-for="notif in notifications" :key="notif.id" class="notification-card" :class="{ unread: !notif.is_read }">
        <div class="notif-icon">
          <i :class="getIcon(notif.type)"></i>
        </div>
        <div class="notif-content">
          <h4>{{ notif.title }}</h4>
          <p>{{ notif.message }}</p>
          <span class="notif-time">{{ formatTime(notif.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { fetchNotifications } from '@/services/supabase'

const userStore = useUserStore()
const notifications = ref([])
const loading = ref(true)

const getIcon = (type) => {
  const icons = {
    order: 'fas fa-box',
    payment: 'fas fa-credit-card',
    promotion: 'fas fa-tag',
    system: 'fas fa-cog'
  }
  return icons[type] || 'fas fa-bell'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
  return date.toLocaleDateString()
}

onMounted(async () => {
  if (userStore.supabaseUser) {
    try {
      const { data } = await fetchNotifications(userStore.supabaseUser.id)
      notifications.value = data || []
    } catch (e) {
      console.error('Failed to load notifications:', e)
    }
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.notification-card { display: flex; gap: 15px; padding: 20px; background: #fff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.notification-card.unread { border-left: 3px solid #fe2c55; }
.notif-icon { width: 40px; height: 40px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fe2c55; }
.notif-content { flex: 1; }
.notif-content h4 { margin-bottom: 5px; }
.notif-content p { color: #666; font-size: 14px; margin-bottom: 5px; }
.notif-time { color: #999; font-size: 12px; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .card { padding: 1rem; }
  .form-group input { font-size: 16px; }
}

</style>
