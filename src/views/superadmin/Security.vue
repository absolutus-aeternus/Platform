<template>
  <div class="page-wrapper">
  <div class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-shield-alt"></i> Security Center</h1>
    </div>

    <div class="stats-grid">
      <div class="stat-card red"><i class="fas fa-exclamation-triangle"></i><div><div class="stat-val">{{ threats }}</div><div class="stat-lbl">Threats Blocked</div></div></div>
      <div class="stat-card blue"><i class="fas fa-sign-in-alt"></i><div><div class="stat-val">{{ loginAttempts }}</div><div class="stat-lbl">Login Attempts (24h)</div></div></div>
      <div class="stat-card green"><i class="fas fa-check-circle"></i><div><div class="stat-val">{{ successLogins }}</div><div class="stat-lbl">Successful Logins</div></div></div>
      <div class="stat-card orange"><i class="fas fa-ban"></i><div><div class="stat-val">{{ failedLogins }}</div><div class="stat-lbl">Failed Logins</div></div></div>
    </div>

    <div class="section-card">
      <h3><i class="fas fa-list"></i> Recent Security Events</h3>
      <table class="sa-table">
        <thead><tr><th>Time</th><th>Event</th><th>IP</th><th>User</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="e in events" :key="e.id">
            <td>{{ formatDate(e.created_at) }}</td>
            <td>{{ e.event }}</td>
            <td><code>{{ e.ip }}</code></td>
            <td>{{ e.email || '-' }}</td>
            <td><span class="badge" :class="e.status">{{ e.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section-card">
      <h3><i class="fas fa-lock"></i> Security Policies</h3>
      <div class="policy-grid">
        <div class="policy-item">
          <span>Min Password Length</span>
          <strong>8 characters</strong>
        </div>
        <div class="policy-item">
          <span>Require Special Characters</span>
          <strong>Yes</strong>
        </div>
        <div class="policy-item">
          <span>Session Timeout</span>
          <strong>24 hours</strong>
        </div>
        <div class="policy-item">
          <span>Max Login Attempts</span>
          <strong>5 per 15 min</strong>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const threats = ref(0), loginAttempts = ref(0), successLogins = ref(0), failedLogins = ref(0)
const events = ref([])
const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'

const loadSecurityData = async () => {
  try {
    // Load IP logs from system_params
    const { data: logData } = await supabase.from('system_params')
      .select('id, code, value, created_at')
      .like('code', 'ip_log_%')
      .order('created_at', { ascending: false })
      .limit(200)

    const parsed = (logData || []).map(d => {
      try { return { id: d.id, ...JSON.parse(d.value), created_at: d.created_at } }
      catch { return { id: d.id, created_at: d.created_at } }
    })

    const now = new Date()
    const h24 = new Date(now - 86400000)

    const recent24h = parsed.filter(l => l.logged_at && new Date(l.logged_at) > h24)
    loginAttempts.value = recent24h.length
    successLogins.value = recent24h.filter(l => l.login_status === 'success').length
    failedLogins.value = recent24h.filter(l => l.login_status === 'failed').length
    threats.value = recent24h.filter(l => l.login_status === 'failed').length

    events.value = parsed.slice(0, 20).map(l => ({
      id: l.id,
      created_at: l.logged_at || l.created_at,
      event: l.login_type === 'login' ? 'Login Attempt' : (l.action || 'Activity'),
      ip: l.ip_address || '-',
      email: l.email || '-',
      status: l.login_status || 'success'
    }))
  } catch (e) {
    console.error('[Security] Load error:', e.message)
  }
}

onMounted(loadSecurityData)
</script>

<style scoped>
header { z-index: 2; }
.sa-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { margin-bottom: 24px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-card i { font-size: 28px; }
.stat-card.red i { color: #d63031; }
.stat-card.blue i { color: #0984e3; }
.stat-card.green i { color: #00b894; }
.stat-card.orange i { color: #e17055; }
.stat-val { font-size: 24px; font-weight: 700; }
.stat-lbl { font-size: 13px; color: #888; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.section-card h3 { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.sa-table { width: 100%; border-collapse: collapse; }
.sa-table th { text-align: left; padding: 10px; background: #f8f9fa; font-size: 12px; color: #666; }
.sa-table td { padding: 10px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.badge.success { background: #d4edda; color: #155724; }
.badge.failed { background: #f8d7da; color: #721c24; }
.badge.blocked { background: #fff3cd; color: #856404; }
.policy-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.policy-item { display: flex; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.policy-item span { color: #666; font-size: 14px; }
.policy-item strong { color: #1a1a2e; }
@media (max-width: 768px) {
  .sa-page { padding: 16px; }
  .sa-header h1 { font-size: 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-card i { font-size: 22px; }
  .stat-val { font-size: 18px; }
  .section-card { padding: 16px; overflow-x: auto; }
  .sa-table { min-width: 500px; }
  .policy-grid { grid-template-columns: 1fr; }
  .policy-item { flex-direction: column; gap: 4px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .stat-card { flex-direction: column; text-align: center; gap: 8px; }
}
</style>