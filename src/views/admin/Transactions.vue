<template>
  <div class="page-wrapper">
  <div class="admin-transactions">
    <div class="page-header"><h1>Transactions</h1></div>
    <div class="summary-cards">
      <div class="card"><div class="stat-icon" style="background:var(--brand-primary, #FF9900)"><i class="fas fa-dollar-sign"></i></div><div><h3>${{ totalVolume }}</h3><p>Total Volume</p></div></div>
      <div class="card"><div class="stat-icon" style="background:#4ecdc4"><i class="fas fa-calendar-day"></i></div><div><h3>${{ todayVolume }}</h3><p>Today</p></div></div>
      <div class="card"><div class="stat-icon" style="background:var(--warning, #B45309)"><i class="fas fa-clock"></i></div><div><h3>{{ pendingCount }}</h3><p>Pending</p></div></div>
      <div class="card"><div class="stat-icon" style="background:var(--success, #067D62)"><i class="fas fa-check-circle"></i></div><div><h3>{{ completedCount }}</h3><p>Completed</p></div></div>
    </div>
    <div class="filters">
      <input v-model="search" placeholder="Search transactions...">
      <select v-model="typeFilter"><option value="">All Types</option><option value="order">Orders</option><option value="recharge">Recharges</option><option value="withdrawal">Withdrawals</option></select>
      <select v-model="statusFilter"><option value="">All Status</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="confirmed">Confirmed</option></select>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="tx in filtered" :key="tx.id">
            <td class="tx-id">{{ tx.id?.substring(0, 8) }}</td>
            <td>{{ tx.user_email || 'N/A' }}</td>
            <td><span class="type-badge" :class="tx.type">{{ tx.type }}</span></td>
            <td class="amount">${{ parseFloat(tx.amount || tx.total_amount || 0).toFixed(2) }}</td>
            <td>{{ tx.payment_method || tx.coin || '-' }}</td>
            <td><span class="status" :class="tx.status">{{ tx.status }}</span></td>
            <td>{{ new Date(tx.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No transactions found</div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const transactions = ref([])
const search = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  let r = transactions.value
  if (search.value) { const q = search.value.toLowerCase(); r = r.filter(t => t.user_email?.toLowerCase().includes(q) || t.id?.includes(q)) }
  if (typeFilter.value) r = r.filter(t => t.type === typeFilter.value)
  if (statusFilter.value) r = r.filter(t => t.status === statusFilter.value)
  return r
})
const totalVolume = computed(() => transactions.value.reduce((s, t) => s + parseFloat(t.amount || t.total_amount || 0), 0).toFixed(2))
const todayVolume = computed(() => { const today = new Date().toDateString(); return transactions.value.filter(t => new Date(t.created_at).toDateString() === today).reduce((s, t) => s + parseFloat(t.amount || t.total_amount || 0), 0).toFixed(2) })
const pendingCount = computed(() => transactions.value.filter(t => t.status === 'pending').length)
const completedCount = computed(() => transactions.value.filter(t => t.status === 'completed' || t.status === 'confirmed').length)

onMounted(async () => { try {
  const [orders, recharges, withdrawals] = await Promise.all([
    supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(100),
    supabase.from('recharges').select('*, users(email)').order('created_at', { ascending: false }).limit(100),
    supabase.from('withdrawals').select('*, users(email)').order('created_at', { ascending: false }).limit(100)
  ])
  const all = []
  ;(orders.data || []).forEach(o => all.push({ ...o, type: 'order', user_email: o.users?.email, amount: o.total_amount }))
  ;(recharges.data || []).forEach(r => all.push({ ...r, type: 'recharge', user_email: r.users?.email }))
  ;(withdrawals.data || []).forEach(w => all.push({ ...w, type: 'withdrawal', user_email: w.users?.email }))
  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  transactions.value = all
  loading.value = false
} catch (e) { console.error("Transactions.vue error:", e) }
})


</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 25px; }
.card { background: #fff; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.card h3 { font-size: 22px; margin: 0 0 4px; color: #333; }
.card p { color: #999; font-size: 13px; margin: 0; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.tx-id { font-family: monospace; font-size: 12px; color: #666; }
.amount { font-weight: 600; font-family: monospace; }
.type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
.type-badge.order { background: #d1ecf1; color: #0c5460; }
.type-badge.recharge { background: #d4edda; color: #155724; }
.type-badge.withdrawal { background: #fff3cd; color: #856404; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.completed, .status.confirmed { background: #d4edda; color: #155724; }
.status.cancelled, .status.rejected { background: #f8d7da; color: #721c24; }
.empty { text-align: center; padding: 40px; color: #999; }

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
