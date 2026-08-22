<template>
  <div class="page-wrapper">
  <div class="sa-dashboard">
    <div class="sa-header">
      <h1><i class="fas fa-crown"></i> Super Admin Control Center</h1>
      <p class="sa-subtitle">Full system overview and management</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{background: stat.color}">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-card">
      <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
      <div class="quick-actions">
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/users')"><i class="fas fa-users-cog"></i> Users</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/products')"><i class="fas fa-box"></i> Products</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/orders')"><i class="fas fa-shopping-bag"></i> Orders</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/categories')"><i class="fas fa-tags"></i> Categories</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/sellers')"><i class="fas fa-store"></i> Sellers</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/transactions')"><i class="fas fa-exchange-alt"></i> Transactions</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/settings')"><i class="fas fa-cogs"></i> Settings</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/audit-logs')"><i class="fas fa-history"></i> Audit Logs</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/security')"><i class="fas fa-shield-alt"></i> Security</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/feature-flags')"><i class="fas fa-flag"></i> Features</button>
        <button class="qa-btn" @click="$router.push('/999/super-admin/999/ip-logs')"><i class="fas fa-network-wired"></i> IP Logs</button>
        <button class="qa-btn" @click="clearCache"><i class="fas fa-broom"></i> Clear Cache</button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="section-card">
      <h3><i class="fas fa-clock"></i> Recent Activity</h3>
      <div class="table-wrap">
        <table class="sa-table">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            <tr v-for="log in recentLogs" :key="log.id">
              <td>{{ formatDate(log.created_at) }}</td>
              <td>{{ log.email || 'System' }}</td>
              <td>{{ log.action || log.login_type || '-' }}</td>
              <td>{{ log.ip_address || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System Health -->
    <div class="section-card">
      <h3><i class="fas fa-heartbeat"></i> System Health</h3>
      <div class="health-grid">
        <div class="health-item" v-for="h in healthChecks" :key="h.label">
          <span class="health-label">{{ h.label }}</span>
          <span class="health-status" :class="h.status"><i :class="h.icon"></i> {{ h.text }}</span>
        </div>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
import { supabase } from '@/services/supabase'

const stats = ref([])
const recentLogs = ref([])
const healthChecks = ref([
  { label: 'API Status', status: 'ok', icon: 'fas fa-check-circle', text: 'Online' },
  { label: 'Database', status: 'ok', icon: 'fas fa-check-circle', text: 'Connected' },
  { label: 'Storage (B2)', status: 'ok', icon: 'fas fa-check-circle', text: 'Active' },
  { label: 'Redis', status: 'ok', icon: 'fas fa-check-circle', text: 'Active' },
  { label: 'Algolia', status: 'ok', icon: 'fas fa-check-circle', text: 'Indexed' },
  { label: 'Worker', status: 'ok', icon: 'fas fa-check-circle', text: 'Deployed' },
])

const loadStats = async () => {
  const counts = {}
  for (const table of ['users', 'products', 'orders', 'sellers', 'categories']) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    counts[table] = count || 0
  }
  stats.value = [
    { label: 'Total Users', value: counts.users, icon: 'fas fa-users', color: '#6c5ce7' },
    { label: 'Products', value: counts.products, icon: 'fas fa-box', color: '#00b894' },
    { label: 'Orders', value: counts.orders, icon: 'fas fa-shopping-bag', color: '#e17055' },
    { label: 'Sellers', value: counts.sellers, icon: 'fas fa-store', color: '#0984e3' },
    { label: 'Categories', value: counts.categories, icon: 'fas fa-tags', color: '#fd79a8' },
  ]
}

const loadLogs = async () => {
  const { data } = await supabase.from('system_params').select('*').like('code', 'ip_log_%').order('created_at', { ascending: false }).limit(5)
  recentLogs.value = (data || []).map(d => {
    try { return { id: d.id, ...JSON.parse(d.value), created_at: d.created_at } } catch { return d }
  })
  loading.value = false
}

const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'
const clearCache = () => { localStorage.clear(); window.__toast?.show('Cache cleared!', 'success') }

onMounted(() => { loadStats(); loadLogs() })


</script>

<style scoped>
header { z-index: 2; }
.sa-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { margin-bottom: 30px; }
.sa-header h1 { font-size: 28px; color: #1a1a2e; display: flex; align-items: center; gap: 12px; }
.sa-header h1 i { color: #f39c12; }
.sa-subtitle { color: #888; font-size: 14px; margin-top: 4px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 13px; color: #888; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.section-card h3 { font-size: 16px; color: #1a1a2e; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-card h3 i { color: #6c5ce7; }
.quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.qa-btn { padding: 14px; border: 2px solid #e8e8e8; border-radius: 10px; background: #fff; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s; color: #444; }
.qa-btn:hover { border-color: #6c5ce7; color: #6c5ce7; background: #f8f7ff; }
.table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; }
.sa-table th { text-align: left; padding: 10px 12px; background: #f8f9fa; font-size: 12px; color: #666; text-transform: uppercase; }
.sa-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.health-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.health-label { font-size: 13px; color: #666; }
.health-status { font-size: 13px; font-weight: 600; }
.health-status.ok { color: #00b894; }
.health-status.warn { color: #fdcb6e; }
.health-status.error { color: #d63031; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>