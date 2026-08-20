<template>
  <div class="page-wrapper">
  <div class="admin-recharges">
    <div class="page-header">
      <h1>Recharges</h1>
      <div class="header-stats">
        <div class="stat-card"><span class="stat-label">Pending</span><span class="stat-value">${{ pendingTotal }}</span></div>
        <div class="stat-card"><span class="stat-label">Confirmed</span><span class="stat-value">${{ confirmedTotal }}</span></div>
        <div class="stat-card"><span class="stat-label">Total</span><span class="stat-value">${{ totalAmount }}</span></div>
      </div>
    </div>
    <div class="filters">
      <input v-model="search" placeholder="Search by user...">
      <select v-model="statusFilter"><option value="">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option></select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>User</th><th>Amount</th><th>Coin</th><th>Network</th><th>TX Hash</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id">
            <td>{{ r.users?.email || 'N/A' }}</td>
            <td class="amount">${{ parseFloat(r.amount).toFixed(2) }}</td>
            <td>{{ r.coin || 'USDT' }}</td>
            <td>{{ r.blockchain_name || '-' }}</td>
            <td class="hash">{{ r.tx_hash?.substring(0, 16) || '-' }}...</td>
            <td><span class="status" :class="r.status">{{ r.status }}</span></td>
            <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <template v-if="r.status === 'pending'">
                <button class="btn-sm btn-approve" @click="confirm(r)"><i class="fas fa-check"></i></button>
                <button class="btn-sm btn-reject" @click="reject(r)"><i class="fas fa-times"></i></button>
                </div>
</template>
              <span v-else class="done">Done</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No recharges found</div>
    </div>
  </div>
  </div>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const recharges = ref([])
const search = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  let r = recharges.value
  if (search.value) r = r.filter(x => x.users?.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value) r = r.filter(x => x.status === statusFilter.value)
  return r
})
const pendingTotal = computed(() => recharges.value.filter(r => r.status === 'pending').reduce((s, r) => s + parseFloat(r.amount || 0), 0).toFixed(2))
const confirmedTotal = computed(() => recharges.value.filter(r => r.status === 'confirmed').reduce((s, r) => s + parseFloat(r.amount || 0), 0).toFixed(2))
const totalAmount = computed(() => recharges.value.reduce((s, r) => s + parseFloat(r.amount || 0), 0).toFixed(2))

const load = async () => {
  loading.value = true
  const { data } = await supabase.from('recharges').select('*, users(email)').order('created_at', { ascending: false })
  recharges.value = data || []
  loading.value = false
}
const confirm = async (r) => {
  if (!confirm(`Confirm recharge of $${r.amount}?`)) return
  try { await supabase.from('recharges').update({ status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', r.id) } catch(_e) { console.error('Recharges.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', r.user_id).single()
  if (wallet) await supabase.from('wallets').update({ balance: parseFloat(wallet.balance || 0) + parseFloat(r.amount), updated_at: new Date().toISOString() }).eq('user_id', r.user_id)
  else await supabase.from('wallets').insert({ user_id: r.user_id, balance: parseFloat(r.amount) })
  await load()
}
const reject = async (r) => {
  if (!confirm('Reject this recharge?')) return
  try { await supabase.from('recharges').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', r.id) } catch(_e) { console.error('Recharges.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  await load()
}
onMounted(load)
</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
.page-header h1 { margin: 0; }
.header-stats { display: flex; gap: 12px; }
.stat-card { background: #fff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
.stat-label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.stat-value { font-size: 18px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.amount { font-weight: 600; font-family: monospace; }
.hash { font-family: monospace; font-size: 12px; color: #666; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status.pending { background: #fff3cd; color: #856404; }
.status.confirmed { background: #d4edda; color: #155724; }
.status.rejected { background: #f8d7da; color: #721c24; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-approve { color: var(--success, #067D62); border-color: var(--success, #067D62); }
.btn-reject { color: var(--error, #CC0C39); border-color: var(--error, #CC0C39); }
.done { font-size: 12px; color: #999; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
