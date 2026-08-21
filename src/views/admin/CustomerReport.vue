<template>
  <div class="page-wrapper">
  <div class="admin-report">
    <div class="page-header"><h1>Customer Report</h1></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon" style="background:var(--brand-primary, #FF9900)"><i class="fas fa-users"></i></div><div><h3>{{ users.length }}</h3><p>Total Customers</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#4ecdc4"><i class="fas fa-user-check"></i></div><div><h3>{{ activeUsers }}</h3><p>Active (7 days)</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#45b7d1"><i class="fas fa-shopping-bag"></i></div><div><h3>{{ buyersWithOrders }}</h3><p>Buyers</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#96ceb4"><i class="fas fa-store"></i></div><div><h3>{{ sellerCount }}</h3><p>Sellers</p></div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h2>Top Customers by Spending</h2>
        <div style="overflow-x:auto;"><table><thead><tr><th>#</th><th>Customer</th><th>Orders</th><th>Total Spent</th></tr></thead>
        <tbody><tr v-for="(c,i) in topSpenders" :key="c.id"><td>{{ i+1 }}</td><td>{{ c.email }}</td><td>{{ c.orderCount }}</td><td>${{ c.totalSpent.toFixed(2) }}</td></tr></tbody></table></div>
      </div>
      <div class="card">
        <h2>Customer Registration Trend</h2>
        <div class="bar-chart">
          <div v-for="m in monthlyRegs" :key="m.month" class="bar-group">
            <div class="bar" :style="{ height: m.pct + '%' }"><span class="bar-val">{{ m.value }}</span></div>
            <span class="bar-label">{{ m.month }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2>All Customers</h2>
      <div class="filters"><input v-model="search" placeholder="Search by email..."><select v-model="roleFilter"><option value="">All Roles</option><option value="MEMBER">Member</option><option value="SELLER">Seller</option><option value="ADMIN">Admin</option></select></div>
      <div style="overflow-x:auto;"><table><thead><tr><th>Email</th><th>Role</th><th>KYC</th><th>Joined</th><th>Last Login</th></tr></thead>
      <tbody><tr v-for="u in filtered" :key="u.id"><td>{{ u.email }}</td><td><span class="role-badge" :class="u.role?.toLowerCase()">{{ u.role || 'MEMBER' }}</span></td><td>{{ u.kyc_status || 0 }}</td><td>{{ new Date(u.created_at).toLocaleDateString() }}</td><td>{{ u.lastlogintime ? new Date(u.lastlogintime).toLocaleDateString() : 'Never' }}</td></tr></tbody></table></div>
    </div>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const users = ref([])
const loading = ref(true)
const orders = ref([])
const sellers = ref([])
const search = ref('')
const roleFilter = ref('')

const activeUsers = computed(() => { const d = new Date(); d.setDate(d.getDate()-7); return users.value.filter(u => u.lastlogintime && new Date(u.lastlogintime) > d).length })
const buyersWithOrders = computed(() => new Set(orders.value.map(o => o.user_id)).size)
const sellerCount = computed(() => sellers.value.length)

const topSpenders = computed(() => {
  const map = {}
  orders.value.forEach(o => {
    if (!map[o.user_id]) { const u = users.value.find(x => x.id === o.user_id); map[o.user_id] = { email: u?.email || 'N/A', orderCount: 0, totalSpent: 0 } }
    map[o.user_id].orderCount++; map[o.user_id].totalSpent += parseFloat(o.total_amount || 0)
  })
  return Object.values(map).sort((a,b) => b.totalSpent - a.totalSpent).slice(0, 10)
})

const monthlyRegs = computed(() => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const data = months.map(m => ({ month: m, value: 0, pct: 0 }))
  users.value.forEach(u => { const m = new Date(u.created_at).getMonth(); data[m].value++ })
  const max = Math.max(...data.map(d => d.value), 1)
  data.forEach(d => { d.pct = (d.value / max) * 100 })
  return data
})

const filtered = computed(() => {
  let r = users.value
  if (search.value) r = r.filter(u => u.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (roleFilter.value) r = r.filter(u => (u.role || 'MEMBER') === roleFilter.value)
  return r
})

onMounted(async () => { try {
  const [u, o, s] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('user_id, total_amount'),
    supabase.from('sellers').select('id')
  ])
  users.value = u.data || []
  orders.value = o.data || []
  sellers.value = s.data || []
} catch (e) { console.error("CustomerReport.vue error:", e) }
})


</script>

<style scoped>
header { z-index: 2; }
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 25px; }
.stat-card { background: #fff; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.stat-card h3 { font-size: 22px; margin: 0 0 4px; }
.stat-card p { color: #999; font-size: 13px; margin: 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
.card h2 { margin: 0 0 20px; font-size: 18px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.role-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; }
.role-badge.member { background: #d1ecf1; color: #0c5460; }
.role-badge.seller { background: #f8d7da; color: #721c24; }
.role-badge.admin { background: #d4edda; color: #155724; }
.bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 180px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar { width: 100%; background: linear-gradient(to top, #4ecdc4, #45b7d1); border-radius: 4px 4px 0 0; position: relative; min-height: 4px; }
.bar-val { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; }
.bar-label { font-size: 10px; color: #999; margin-top: 6px; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }

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
