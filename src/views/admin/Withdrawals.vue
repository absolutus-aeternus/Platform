<template>
  <div class="admin-withdrawals">
    <div class="page-header">
      <h1>Withdrawals</h1>
      <div class="header-stats">
        <div class="stat-card"><span class="stat-label">Pending</span><span class="stat-value pending">${{ pendingTotal }}</span></div>
        <div class="stat-card"><span class="stat-label">Approved</span><span class="stat-value approved">${{ approvedTotal }}</span></div>
        <div class="stat-card"><span class="stat-label">Rejected</span><span class="stat-value rejected">${{ rejectedTotal }}</span></div>
      </div>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search by user...">
      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr><th>User</th><th>Amount</th><th>Coin</th><th>Network</th><th>Address</th><th>Fee</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="w in filteredWithdrawals" :key="w.id">
            <td>{{ w.users?.email || 'N/A' }}</td>
            <td class="amount">${{ parseFloat(w.amount).toFixed(2) }}</td>
            <td>{{ w.coin || 'USDT' }}</td>
            <td>{{ w.blockchain_name || '-' }}</td>
            <td class="address">{{ w.address?.substring(0, 16) || '-' }}...</td>
            <td>${{ parseFloat(w.fee || 0).toFixed(2) }}</td>
            <td><span class="status" :class="w.status">{{ w.status }}</span></td>
            <td>{{ new Date(w.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <template v-if="w.status === 'pending'">
                <button class="btn-sm btn-approve" @click="updateStatus(w, 'approved')"><i class="fas fa-check"></i></button>
                <button class="btn-sm btn-reject" @click="updateStatus(w, 'rejected')"><i class="fas fa-times"></i></button>
              </template>
              <span v-else class="processed">Processed</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredWithdrawals.length === 0" class="empty">No withdrawals found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const withdrawals = ref([])
const search = ref('')
const statusFilter = ref('')

const filteredWithdrawals = computed(() => {
  let result = withdrawals.value
  if (search.value) result = result.filter(w => w.users?.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value) result = result.filter(w => w.status === statusFilter.value)
  return result
})

const pendingTotal = computed(() => withdrawals.value.filter(w => w.status === 'pending').reduce((s, w) => s + parseFloat(w.amount || 0), 0).toFixed(2))
const approvedTotal = computed(() => withdrawals.value.filter(w => w.status === 'approved').reduce((s, w) => s + parseFloat(w.amount || 0), 0).toFixed(2))
const rejectedTotal = computed(() => withdrawals.value.filter(w => w.status === 'rejected').reduce((s, w) => s + parseFloat(w.amount || 0), 0).toFixed(2))

const loadWithdrawals = async () => {
  loading.value = true
  const { data } = await supabase.from('withdrawals').select('*, users(email)').order('created_at', { ascending: false })
  withdrawals.value = data || []
  loading.value = false
}

const updateStatus = async (w, status) => {
  if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} this withdrawal of $${w.amount}?`)) return
  try { await supabase.from('withdrawals').update({ status, updated_at: new Date().toISOString() }).eq('id', w.id) } catch(_e) { console.error('Withdrawals.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  if (status === 'approved') {
    const { data: wallet } = await supabase.from('wallets').select('frozen_money').eq('user_id', w.user_id).single()
    if (wallet) {
      try { await supabase.from('wallets').update({ frozen_money: Math.max(0, parseFloat(wallet.frozen_money || 0) - parseFloat(w.amount)) }).eq('user_id', w.user_id) } catch(_e) { console.error('Withdrawals.vue:', _e); window.__toast?.show('Operation failed', 'error') }
    }
  }
  await loadWithdrawals()
}

onMounted(loadWithdrawals)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
.page-header h1 { margin: 0; }
.header-stats { display: flex; gap: 12px; }
.stat-card { background: #fff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
.stat-label { display: block; font-size: 11px; color: #999; margin-bottom: 4px; }
.stat-value { font-size: 18px; font-weight: 700; }
.stat-value.pending { color: #ffc107; }
.stat-value.approved { color: #28a745; }
.stat-value.rejected { color: #dc3545; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.amount { font-weight: 600; font-family: monospace; }
.address { font-family: monospace; font-size: 12px; color: #666; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.status.rejected { background: #f8d7da; color: #721c24; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-approve { color: #28a745; border-color: #28a745; }
.btn-reject { color: #dc3545; border-color: #dc3545; }
.processed { font-size: 12px; color: #999; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
