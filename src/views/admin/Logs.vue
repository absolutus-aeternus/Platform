<template>
  <div class="page-wrapper">
  <div class="admin-logs">
    <div class="page-header"><h1>Activity Logs</h1><button class="btn-refresh" @click="load"><i class="fas fa-sync-alt"></i> Refresh</button></div>
    <div class="filters">
      <input v-model="search" placeholder="Search logs...">
      <select v-model="typeFilter"><option value="">All Types</option><option value="order">Orders</option><option value="user">Users</option><option value="product">Products</option><option value="payment">Payments</option><option value="system">System</option></select>
      <select v-model="dateFilter"><option value="">All Time</option><option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option></select>
    </div>
    <div class="log-stats">
      <span class="stat"><i class="fas fa-list"></i> {{ filtered.length }} entries</span>
      <span class="stat"><i class="fas fa-clock"></i> Last: {{ logs.length ? formatTime(logs[0]?.created_at) : 'N/A' }}</span>
    </div>
    <div class="log-list">
      <div v-for="log in filtered" :key="log.id" class="log-item">
        <div class="log-icon" :class="log.type"><i :class="getIcon(log.type)"></i></div>
        <div class="log-content">
          <div class="log-header">
            <span class="log-type" :class="log.type">{{ log.type }}</span>
            <span class="log-action">{{ log.action }}</span>
          </div>
          <p>{{ log.message }}</p>
          <div class="log-footer">
            <span class="log-time"><i class="fas fa-clock"></i> {{ formatTime(log.created_at) }}</span>
            <span v-if="log.user" class="log-user"><i class="fas fa-user"></i> {{ log.user }}</span>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="empty"><i class="fas fa-clipboard-list"></i><p>No logs found</p></div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
const loading = ref(true)
import { supabase } from '@/services/supabase'

const logs = ref([])
const search = ref('')
const typeFilter = ref('')
const dateFilter = ref('')

const getIcon = (type) => ({ order: 'fas fa-shopping-cart', user: 'fas fa-user', product: 'fas fa-box', payment: 'fas fa-credit-card', system: 'fas fa-cog' }[type] || 'fas fa-info-circle')
const formatTime = (t) => t ? new Date(t).toLocaleString() : ''

const filtered = computed(() => {
  let r = logs.value
  if (search.value) { const q = search.value.toLowerCase(); r = r.filter(l => l.message?.toLowerCase().includes(q) || l.action?.toLowerCase().includes(q)) }
  if (typeFilter.value) r = r.filter(l => l.type === typeFilter.value)
  if (dateFilter.value) {
    const now = new Date()
    const d = { today: 1, week: 7, month: 30 }[dateFilter.value]
    const cutoff = new Date(now.getTime() - d * 86400000)
    r = r.filter(l => new Date(l.created_at) > cutoff)
  }
  return r
})

const load = async () => {
  try {
    const [orderLogs, rechargeLogs, withdrawalLogs] = await Promise.all([
      supabase.from('order_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('recharges').select('id, user_id, amount, status, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('withdrawals').select('id, user_id, amount, status, created_at').order('created_at', { ascending: false }).limit(50)
    ])
    const all = []
    ;(orderLogs.data || []).forEach(l => all.push({ ...l, type: 'order', message: `${l.action}: ${l.details || 'Order activity'}`, action: l.action }))
    ;(rechargeLogs.data || []).forEach(r => all.push({ id: r.id, type: 'payment', action: 'Recharge', message: `Recharge $${r.amount} - ${r.status}`, created_at: r.created_at }))
    ;(withdrawalLogs.data || []).forEach(w => all.push({ id: w.id, type: 'payment', action: 'Withdrawal', message: `Withdrawal $${w.amount} - ${w.status}`, created_at: w.created_at }))
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    logs.value = all
  loading.value = false
  } catch (e) { console.error('Logs error:', e) }
}
onMounted(load)


</script>

<style scoped>
body, html { overflow-x: hidden; }
footer { position: relative; }
header { z-index: 2; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-refresh { padding: 8px 16px; background: #fff; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-size: 13px; }
.btn-refresh:hover { background: #f5f5f5; }
.filters { display: flex; gap: 10px; margin-bottom: 15px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.log-stats { display: flex; gap: 20px; margin-bottom: 15px; }
.stat { font-size: 13px; color: #666; }
.stat i { margin-right: 5px; }
.log-list { background: #fff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; }
.log-item { display: flex; gap: 15px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
.log-item:hover { background: #f8f9fa; }
.log-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; flex-shrink: 0; }
.log-icon.order { background: var(--brand-primary, #FF9900); }
.log-icon.user { background: #45b7d1; }
.log-icon.product { background: #96ceb4; }
.log-icon.payment { background: #feca57; color: #333; }
.log-icon.system { background: #666; }
.log-content { flex: 1; min-width: 0; }
.log-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.log-type { padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
.log-type.order { background: #ffe0e6; color: var(--brand-primary, #FF9900); }
.log-type.user { background: #d1ecf1; color: #0c5460; }
.log-type.product { background: #d4edda; color: #155724; }
.log-type.payment { background: #fff3cd; color: #856404; }
.log-type.system { background: #e2e3e5; color: #383d41; }
.log-action { font-size: 12px; font-weight: 600; color: #333; }
.log-content p { font-size: 13px; color: #555; margin: 0 0 6px; }
.log-footer { display: flex; gap: 15px; }
.log-time, .log-user { font-size: 11px; color: #999; }
.log-time i, .log-user i { margin-right: 4px; }
.empty { text-align: center; padding: 60px; color: #999; }
.empty i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .card { padding: 1rem; }
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
