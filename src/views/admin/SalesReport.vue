<template>
  <div class="admin-report">
    <div class="page-header"><h1>Sales Report</h1><div class="date-filter"><input v-model="dateFrom" type="date"><span>to</span><input v-model="dateTo" type="date"><button class="btn-filter" @click="loadData">Filter</button></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon" style="background:#fe2c55"><i class="fas fa-dollar-sign"></i></div><div><h3>${{ totalRevenue }}</h3><p>Total Revenue</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#4ecdc4"><i class="fas fa-shopping-cart"></i></div><div><h3>{{ totalOrders }}</h3><p>Total Orders</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#45b7d1"><i class="fas fa-chart-line"></i></div><div><h3>${{ avgOrder }}</h3><p>Avg Order Value</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#96ceb4"><i class="fas fa-box"></i></div><div><h3>{{ totalItems }}</h3><p>Items Sold</p></div></div>
    </div>
    <div class="chart-section">
      <h2>Revenue by Month</h2>
      <div class="bar-chart">
        <div v-for="m in monthlyData" :key="m.month" class="bar-group">
          <div class="bar" :style="{ height: m.pct + '%' }"><span class="bar-val">${{ m.value }}</span></div>
          <span class="bar-label">{{ m.month }}</span>
        </div>
      </div>
    </div>
    <div class="table-section">
      <h2>Recent Transactions</h2>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id"><td>{{ o.order_no }}</td><td>{{ o.users?.email || 'N/A' }}</td><td>${{ parseFloat(o.total_amount).toFixed(2) }}</td><td><span class="status" :class="o.status">{{ o.status }}</span></td><td>{{ new Date(o.created_at).toLocaleDateString() }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const orders = ref([])
const loading = ref(true)
const dateFrom = ref('')
const dateTo = ref('')

const totalRevenue = computed(() => orders.value.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toFixed(2))
const totalOrders = computed(() => orders.value.length)
const avgOrder = computed(() => orders.value.length ? (parseFloat(totalRevenue.value) / orders.value.length).toFixed(2) : '0.00')
const totalItems = computed(() => orders.value.reduce((s, o) => s + (o.goods_count || 1), 0))

const monthlyData = computed(() => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const data = months.map(m => ({ month: m, value: 0, pct: 0 }))
  orders.value.forEach(o => { const m = new Date(o.created_at).getMonth(); data[m].value += parseFloat(o.total_amount || 0) })
  const max = Math.max(...data.map(d => d.value), 1)
  data.forEach(d => { d.pct = (d.value / max) * 100; d.value = Math.round(d.value) })
  return data
})

const loadData = async () => {
  let query = supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(200)
  if (dateFrom.value) query = query.gte('created_at', dateFrom.value)
  if (dateTo.value) query = query.lte('created_at', dateTo.value + 'T23:59:59')
  const { data } = await query
  orders.value = data || []
}
onMounted(loadData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
.page-header h1 { margin: 0; }
.date-filter { display: flex; gap: 8px; align-items: center; }
.date-filter input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; }
.btn-filter { padding: 8px 16px; background: #fe2c55; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 25px; }
.stat-card { background: #fff; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.stat-card h3 { font-size: 22px; margin: 0 0 4px; }
.stat-card p { color: #999; font-size: 13px; margin: 0; }
.chart-section, .table-section { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
.chart-section h2, .table-section h2 { margin: 0 0 20px; font-size: 18px; }
.bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding: 0 10px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar { width: 100%; background: linear-gradient(to top, #fe2c55, #ff6b81); border-radius: 4px 4px 0 0; position: relative; min-height: 4px; transition: height 0.5s; }
.bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; white-space: nowrap; }
.bar-label { font-size: 11px; color: #999; margin-top: 8px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.status { padding: 3px 8px; border-radius: 10px; font-size: 12px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.completed { background: #d4edda; color: #155724; }
.status.cancelled { background: #f8d7da; color: #721c24; }

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
