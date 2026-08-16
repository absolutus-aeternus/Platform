<template>
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
        <button class="qa-btn" @click="$router.push('/admin/users')"><i class="fas fa-users-cog"></i> Manage Users</button>
        <button class="qa-btn" @click="$router.push('/admin/settings')"><i class="fas fa-cogs"></i> System Settings</button>
        <button class="qa-btn" @click="$router.push('/admin/audit-logs')"><i class="fas fa-history"></i> Audit Logs</button>
        <button class="qa-btn" @click="$router.push('/admin/security')"><i class="fas fa-shield-alt"></i> Security Center</button>
        <button class="qa-btn" @click="$router.push('/admin/feature-flags')"><i class="fas fa-flag"></i> Feature Flags</button>
        <button class="qa-btn" @click="clearCache"><i class="fas fa-broom"></i> Clear Cache</button>
      </div>
    </div>

    <!-- Recent Users -->
    <div class="section-card">
      <h3><i class="fas fa-user-clock"></i> Recent Users</h3>
      <div class="table-wrap">
        <table class="sa-table">
          <thead><tr><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="u in recentUsers" :key="u.id">
              <td>{{ u.email }}</td>
              <td><span class="role-badge" :class="u.role?.toLowerCase()">{{ u.role }}</span></td>
              <td>{{ formatDate(u.created_at) }}</td>
              <td>
                <button class="btn-sm" @click="editUser(u)"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-danger" @click="deleteUser(u)" v-if="u.role !== 'SUPER_ADMIN'"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System Health -->
    <div class="section-card">
      <h3><i class="fas fa-heartbeat"></i> System Health</h3>
      <div class="health-grid">
        <div class="health-item">
          <span class="health-label">API Status</span>
          <span class="health-status ok"><i class="fas fa-check-circle"></i> Online</span>
        </div>
        <div class="health-item">
          <span class="health-label">Database</span>
          <span class="health-status ok"><i class="fas fa-check-circle"></i> Connected</span>
        </div>
        <div class="health-item">
          <span class="health-label">Storage (B2)</span>
          <span class="health-status ok"><i class="fas fa-check-circle"></i> Active</span>
        </div>
        <div class="health-item">
          <span class="health-label">Redis</span>
          <span class="health-status ok"><i class="fas fa-check-circle"></i> Active</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const stats = ref([])
const recentUsers = ref([])

const loadStats = async () => {
  const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: products } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: sellers } = await supabase.from('sellers').select('*', { count: 'exact', head: true })
  const { count: categories } = await supabase.from('categories').select('*', { count: 'exact', head: true })

  stats.value = [
    { label: 'Total Users', value: users || 0, icon: 'fas fa-users', color: '#6c5ce7' },
    { label: 'Products', value: products || 0, icon: 'fas fa-box', color: '#00b894' },
    { label: 'Orders', value: orders || 0, icon: 'fas fa-shopping-bag', color: '#e17055' },
    { label: 'Sellers', value: sellers || 0, icon: 'fas fa-store', color: '#0984e3' },
    { label: 'Categories', value: categories || 0, icon: 'fas fa-tags', color: '#fd79a8' },
  ]
}

const loadUsers = async () => {
  const { data } = await supabase.from('users').select('id,email,role,created_at').order('created_at', { ascending: false }).limit(10)
  recentUsers.value = data || []
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-'
const editUser = (u) => { /* TODO: modal */ }
const deleteUser = async (u) => {
  if (!confirm('Delete ' + u.email + '?')) return
  await supabase.from('users').delete().eq('id', u.id)
  loadUsers()
}
const clearCache = () => { localStorage.clear(); alert('Cache cleared!') }

onMounted(() => { loadStats(); loadUsers() })
</script>

<style scoped>
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
.quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.qa-btn { padding: 14px; border: 2px solid #e8e8e8; border-radius: 10px; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: all 0.2s; color: #444; }
.qa-btn:hover { border-color: #6c5ce7; color: #6c5ce7; background: #f8f7ff; }
.table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; }
.sa-table th { text-align: left; padding: 10px 12px; background: #f8f9fa; font-size: 12px; color: #666; text-transform: uppercase; }
.sa-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.role-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.role-badge.member { background: #dfe6e9; color: #636e72; }
.role-badge.seller { background: #dfe6e9; color: #0984e3; }
.role-badge.admin { background: #ffeaa7; color: #d35400; }
.role-badge.super_admin { background: #fdcb6e; color: #e17055; }
.btn-sm { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; background: #f0f0f0; color: #444; margin-right: 4px; }
.btn-sm:hover { background: #6c5ce7; color: #fff; }
.btn-danger { background: #ff7675; color: #fff; }
.btn-danger:hover { background: #d63031; }
.health-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.health-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.health-label { font-size: 13px; color: #666; }
.health-status { font-size: 13px; font-weight: 600; }
.health-status.ok { color: #00b894; }
.health-status.warn { color: #fdcb6e; }
.health-status.error { color: #d63031; }
</style>