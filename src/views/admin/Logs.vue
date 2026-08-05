<template>
  <div class="admin-logs">
    <h1>Activity Logs</h1>
    <div class="filters">
      <select v-model="logType">
        <option value="">All Types</option>
        <option value="order">Orders</option>
        <option value="user">Users</option>
        <option value="product">Products</option>
        <option value="system">System</option>
      </select>
    </div>
    <div class="log-list">
      <div v-for="log in logs" :key="log.id" class="log-item">
        <div class="log-icon" :class="log.type"><i :class="getIcon(log.type)"></i></div>
        <div class="log-content">
          <p>{{ log.message }}</p>
          <span class="log-time">{{ formatTime(log.created_at) }}</span>
        </div>
      </div>
      <div v-if="logs.length === 0" class="empty">No logs found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const logs = ref([])
const logType = ref('')
const getIcon = (type) => ({ order: 'fas fa-shopping-cart', user: 'fas fa-user', product: 'fas fa-box', system: 'fas fa-cog' }[type] || 'fas fa-info-circle')
const formatTime = (t) => t ? new Date(t).toLocaleString() : ''
onMounted(async () => {
  const { data } = await supabase.from('order_logs').select('*').order('created_at', { ascending: false }).limit(50)
  logs.value = (data || []).map(l => ({ ...l, type: 'order', message: `${l.action}: ${l.details || ''}` }))
})
</script>

<style scoped>
h1 { margin-bottom: 20px; }
.filters { margin-bottom: 20px; }
.filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.log-list { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.log-item { display: flex; align-items: center; gap: 15px; padding: 15px 20px; border-bottom: 1px solid #f0f0f0; }
.log-icon { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; }
.log-icon.order { background: #fe2c55; }
.log-icon.user { background: #45b7d1; }
.log-icon.product { background: #96ceb4; }
.log-icon.system { background: #666; }
.log-content p { font-size: 13px; margin-bottom: 3px; }
.log-time { font-size: 11px; color: #999; }
.empty { text-align: center; padding: 40px; color: #999; }
</style>
