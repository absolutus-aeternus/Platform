<template>
  <div class="page-wrapper">
  <div v-if="loading" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-network-wired"></i> IP Activity Logs</h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportCSV"><i class="fas fa-download"></i> Export CSV</button>
        <button class="btn-primary" @click="loadLogs"><i class="fas fa-sync"></i> Refresh</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-box"><div class="stat-num">{{ logs.length }}</div><div class="stat-lbl">Total Events</div></div>
      <div class="stat-box"><div class="stat-num">{{ uniqueIPs }}</div><div class="stat-lbl">Unique IPs</div></div>
      <div class="stat-box"><div class="stat-num">{{ todayLogins }}</div><div class="stat-lbl">Today</div></div>
      <div class="stat-box"><div class="stat-num">{{ failedLogins }}</div><div class="stat-lbl">Failed</div></div>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search email, IP, device..." class="filter-input" @input="filterLogs">
      <select v-model="statusFilter" class="filter-select" @change="filterLogs">
        <option value="">All Status</option>
        <option value="success">Success</option>
        <option value="failed">Failed</option>
      </select>
    </div>

    <div class="section-card">
      <div class="table-wrap">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Time</th><th>Email</th><th>Role</th><th>IP Address</th><th>Location</th>
              <th>Device</th><th>Browser</th><th>OS</th><th>Status</th><th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" :class="{ 'row-failed': log.login_status === 'failed' }">
              <td class="time-cell">{{ formatTime(log.logged_at) }}</td>
              <td><strong>{{ log.email || '-' }}</strong></td>
              <td><span class="role-tag">{{ log.role || '-' }}</span></td>
              <td class="ip-cell"><code>{{ log.ip_address || '-' }}</code></td>
              <td>{{ log.ip_city || '-' }}, {{ log.ip_country || '-' }}</td>
              <td>{{ log.device_vendor || '' }} {{ log.device_model || '' }} ({{ log.device_type || '-' }})</td>
              <td>{{ log.browser_name || '-' }} {{ log.browser_version || '' }}</td>
              <td>{{ log.os_name || '-' }}</td>
              <td><span class="status-badge" :class="log.login_status">{{ log.login_status || '-' }}</span></td>
              <td><button class="btn-sm" @click="selectedLog = log"><i class="fas fa-eye"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filteredLogs.length" class="empty">No logs found. Login events will appear here.</div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedLog" class="modal-overlay" @click.self="selectedLog = null">
      <div class="modal">
        <div class="modal-header">
          <h3>Login Log Details</h3>
          <button class="close-btn" @click="selectedLog = null">&times;</button>
        </div>
        <div class="detail-grid">
          <div class="detail-section">
            <h4>Network</h4>
            <div class="detail-row"><span>IP Address</span><strong>{{ selectedLog.ip_address || '-' }}</strong></div>
            <div class="detail-row"><span>Country</span><strong>{{ selectedLog.ip_country || '-' }}</strong></div>
            <div class="detail-row"><span>City</span><strong>{{ selectedLog.ip_city || '-' }}</strong></div>
            <div class="detail-row"><span>ISP</span><strong>{{ selectedLog.ip_isp || '-' }}</strong></div>
            <div class="detail-row"><span>ASN</span><strong>{{ selectedLog.ip_as || '-' }}</strong></div>
          </div>
          <div class="detail-section">
            <h4>Device</h4>
            <div class="detail-row"><span>Type</span><strong>{{ selectedLog.device_type || '-' }}</strong></div>
            <div class="detail-row"><span>Vendor</span><strong>{{ selectedLog.device_vendor || '-' }}</strong></div>
            <div class="detail-row"><span>Model</span><strong>{{ selectedLog.device_model || '-' }}</strong></div>
            <div class="detail-row"><span>Screen</span><strong>{{ selectedLog.screen_resolution || '-' }}</strong></div>
            <div class="detail-row"><span>Platform</span><strong>{{ selectedLog.platform || '-' }}</strong></div>
          </div>
          <div class="detail-section">
            <h4>Browser</h4>
            <div class="detail-row"><span>Name</span><strong>{{ selectedLog.browser_name || '-' }}</strong></div>
            <div class="detail-row"><span>Version</span><strong>{{ selectedLog.browser_version || '-' }}</strong></div>
            <div class="detail-row"><span>Engine</span><strong>{{ selectedLog.browser_engine || '-' }}</strong></div>
            <div class="detail-row"><span>Language</span><strong>{{ selectedLog.language || '-' }}</strong></div>
            <div class="detail-row"><span>Timezone</span><strong>{{ selectedLog.timezone || '-' }}</strong></div>
          </div>
          <div class="detail-section">
            <h4>Session</h4>
            <div class="detail-row"><span>Type</span><strong>{{ selectedLog.login_type || '-' }}</strong></div>
            <div class="detail-row"><span>Status</span><strong>{{ selectedLog.login_status || '-' }}</strong></div>
            <div class="detail-row"><span>Page URL</span><code>{{ selectedLog.page_url || '-' }}</code></div>
            <div class="detail-row"><span>User Agent</span><code class="ua-text">{{ selectedLog.user_agent || '-' }}</code></div>
          </div>
          <div v-if="selectedLog.gps_lat" class="detail-section full-width">
            <h4>GPS Location</h4>
            <a :href="'https://www.google.com/maps?q=' + selectedLog.gps_lat + ',' + selectedLog.gps_lon" target="_blank" class="map-link">
              <i class="fas fa-map-marker-alt"></i> {{ selectedLog.gps_lat }}, {{ selectedLog.gps_lon }} (Accuracy: {{ selectedLog.gps_accuracy }}m)
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
const loading = ref(true)
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const logs = ref([])
const filteredLogs = ref([])
const search = ref('')
const statusFilter = ref('')
const selectedLog = ref(null)

const uniqueIPs = computed(() => new Set(logs.value.map(l => l.ip_address)).size)
const todayLogins = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return logs.value.filter(l => l.logged_at && l.logged_at.startsWith(today)).length
})
const failedLogins = computed(() => logs.value.filter(l => l.login_status === 'failed').length)

const loadLogs = async () => {
  try {
    const { data } = await supabase.from('system_params')
      .select('id, code, value, created_at')
      .like('code', 'ip_log_%')
      .order('created_at', { ascending: false })
      .limit(500)

    logs.value = (data || []).map(item => {
      try {
        const parsed = JSON.parse(item.value)
        return { id: item.id, ...parsed, created_at: item.created_at }
      } catch {
        return { id: item.id, value: item.value, created_at: item.created_at }
      }
    })
    filterLogs()
    loading.value = false
  } catch (e) {
    console.error('Failed to load logs:', e)
  }
}

const filterLogs = () => {
  let result = logs.value
  if (statusFilter.value) result = result.filter(l => l.login_status === statusFilter.value)
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(l =>
      (l.email || '').toLowerCase().includes(s) ||
      (l.ip_address || '').includes(s) ||
      (l.browser_name || '').toLowerCase().includes(s) ||
      (l.os_name || '').toLowerCase().includes(s) ||
      (l.ip_city || '').toLowerCase().includes(s) ||
      (l.ip_country || '').toLowerCase().includes(s)
    )
  }
  filteredLogs.value = result
}

const formatTime = (d) => d ? new Date(d).toLocaleString() : '-'

const exportCSV = () => {
  const headers = 'Time,Email,Role,IP,Country,City,ISP,Device,Browser,OS,Status,Type\n'
  const rows = filteredLogs.value.map(l =>
    [l.logged_at, l.email, l.role, l.ip_address, l.ip_country, l.ip_city, l.ip_isp, (l.device_vendor || '') + ' ' + (l.device_model || ''), l.browser_name, l.os_name, l.login_status, l.login_type].join(',')
  ).join('\n')
  const blob = new Blob([headers + rows], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'ip-logs.csv'; a.click()
}

onMounted(loadLogs)
</script>

<style scoped>
.sa-page { padding: 24px; max-width: 1600px; margin: 0 auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.header-actions { display: flex; gap: 8px; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-box { background: #fff; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-num { font-size: 28px; font-weight: 700; color: #1a1a2e; }
.stat-lbl { font-size: 12px; color: #888; margin-top: 4px; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-input { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; min-width: 200px; }
.filter-select { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; }
.section-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sa-table th { text-align: left; padding: 10px 8px; background: #f8f9fa; font-size: 11px; color: #666; text-transform: uppercase; white-space: nowrap; }
.sa-table td { padding: 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
.row-failed { background: #fff8f0; }
.time-cell { white-space: nowrap; font-size: 12px; color: #666; }
.ip-cell code { font-size: 12px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
.role-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: #e8e8e8; color: #666; text-transform: uppercase; }
.status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.status-badge.success { background: #d4edda; color: #155724; }
.status-badge.failed { background: #f8d7da; color: #721c24; }
.btn-primary { padding: 10px 16px; background: #6c5ce7; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-secondary { padding: 10px 16px; background: #f0f0f0; color: #444; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-sm { padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; background: #f0f0f0; font-size: 11px; }
.btn-sm:hover { background: #6c5ce7; color: #fff; }
.empty { text-align: center; color: #888; padding: 40px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-start; justify-content: center; z-index: 800; padding: 40px; overflow-y: auto; }
.modal { background: #fff; border-radius: 16px; width: 900px; max-width: 95vw; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; background: #fff; }
.modal-header h3 { font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #888; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
.detail-section { background: #f8f9fa; border-radius: 10px; padding: 16px; }
.detail-section.full-width { grid-column: 1 / -1; }
.detail-section h4 { font-size: 13px; color: #6c5ce7; text-transform: uppercase; margin-bottom: 12px; }
.detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 13px; }
.detail-row span { color: #888; }
.detail-row strong { color: #1a1a2e; }
.detail-row code { font-size: 11px; background: #e8e8e8; padding: 1px 4px; border-radius: 3px; }
.ua-text { font-size: 10px !important; word-break: break-all; white-space: normal !important; }
.map-link { color: #6c5ce7; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.map-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .sa-page { padding: 16px; }
  .sa-header { flex-direction: column; align-items: flex-start; }
  .sa-header h1 { font-size: 20px; }
  .header-actions { width: 100%; }
  .header-actions button { flex: 1; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .filters { flex-direction: column; }
  .filter-input { width: 100%; min-width: 0; }
  .filter-select { width: 100%; }
  .section-card { padding: 12px; }
  .sa-table { min-width: 900px; }
  .detail-grid { grid-template-columns: 1fr; padding: 16px; }
  .modal { margin: 10px; }
}
@media (max-width: 480px) {
  .sa-page { padding: 12px; }
  .sa-header h1 { font-size: 18px; }
  .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-box { padding: 12px; }
  .stat-num { font-size: 22px; }
}
</style>