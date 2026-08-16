<template>
  <div class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-history"></i> Audit Logs</h1>
      <button class="btn-secondary" @click="exportLogs"><i class="fas fa-download"></i> Export CSV</button>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search logs..." class="filter-input">
      <select v-model="typeFilter" class="filter-select">
        <option value="">All Types</option>
        <option value="auth">Authentication</option>
        <option value="order">Orders</option>
        <option value="product">Products</option>
        <option value="user">Users</option>
        <option value="system">System</option>
      </select>
    </div>

    <div class="section-card">
      <div class="log-list">
        <div class="log-item" v-for="log in filteredLogs" :key="log.id">
          <div class="log-icon" :class="log.type">
            <i :class="getIcon(log.type)"></i>
          </div>
          <div class="log-content">
            <div class="log-action">{{ log.action }}</div>
            <div class="log-meta">{{ log.user_email || 'System' }} &bull; {{ formatDate(log.created_at) }}</div>
          </div>
          <div class="log-details" v-if="log.details">{{ log.details }}</div>
        </div>
        <div v-if="!filteredLogs.length" class="empty">No logs found</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const logs = ref([])
const search = ref('')
const typeFilter = ref('')

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (typeFilter.value && l.type !== typeFilter.value) return false
    if (search.value && !l.action?.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
})

const loadLogs = async () => {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
  logs.value = data || []
}

const getIcon = (t) => ({ auth: 'fas fa-sign-in-alt', order: 'fas fa-shopping-bag', product: 'fas fa-box', user: 'fas fa-user', system: 'fas fa-cog' }[t] || 'fas fa-info-circle')
const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'
const exportLogs = () => {
  const csv = 'Time,Type,Action,User,Details\n' + logs.value.map(l => `${l.created_at},${l.type},${l.action},${l.user_email || ''},${l.details || ''}`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit-logs.csv'; a.click()
}

onMounted(loadLogs)
</script>

<style scoped>
.sa-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.filters { display: flex; gap: 12px; margin-bottom: 20px; }
.filter-input { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; width: 300px; }
.filter-select { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.log-list { display: flex; flex-direction: column; gap: 8px; }
.log-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 8px; background: #f8f9fa; }
.log-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; }
.log-icon.auth { background: #0984e3; }
.log-icon.order { background: #e17055; }
.log-icon.product { background: #00b894; }
.log-icon.user { background: #6c5ce7; }
.log-icon.system { background: #636e72; }
.log-action { font-size: 14px; font-weight: 600; color: #1a1a2e; }
.log-meta { font-size: 12px; color: #888; margin-top: 2px; }
.log-details { font-size: 12px; color: #666; margin-left: auto; max-width: 300px; text-align: right; }
.empty { text-align: center; color: #888; padding: 40px; }
.btn-secondary { padding: 10px 20px; background: #f0f0f0; color: #444; border: none; border-radius: 8px; cursor: pointer; }
</style>