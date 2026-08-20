<template>
  <div class="page-wrapper">
  <div class="admin-wallets">
    <div class="page-header">
      <h1>Wallets</h1>
      <div class="header-stats">
        <div class="stat-card"><span class="stat-label">Total Balance</span><span class="stat-value">${{ totalBalance }}</span></div>
        <div class="stat-card"><span class="stat-label">Total Frozen</span><span class="stat-value">${{ totalFrozen }}</span></div>
        <div class="stat-card"><span class="stat-label">Total Rebate</span><span class="stat-value">${{ totalRebate }}</span></div>
      </div>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search by user email...">
      <select v-model="sortBy">
        <option value="balance">Highest Balance</option>
        <option value="frozen">Most Frozen</option>
        <option value="recent">Most Recent</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Balance</th>
            <th>Rebate</th>
            <th>Frozen</th>
            <th>Total</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="wallet in filteredWallets" :key="wallet.id">
            <td>{{ wallet.users?.email || 'N/A' }}</td>
            <td class="amount">${{ parseFloat(wallet.balance || 0).toFixed(2) }}</td>
            <td class="amount">${{ parseFloat(wallet.rebate || 0).toFixed(2) }}</td>
            <td class="amount frozen">${{ parseFloat(wallet.frozen_money || 0).toFixed(2) }}</td>
            <td class="amount total">${{ (parseFloat(wallet.balance || 0) + parseFloat(wallet.rebate || 0) + parseFloat(wallet.frozen_money || 0)).toFixed(2) }}</td>
            <td>{{ new Date(wallet.updated_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-sm" @click="adjustWallet(wallet)" title="Adjust"><i class="fas fa-edit"></i></button>
              <button class="btn-sm" @click="viewHistory(wallet)" title="History"><i class="fas fa-history"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredWallets.length === 0" class="empty">No wallets found</div>
    </div>

    <!-- Adjust Modal -->
    <div v-if="adjusting" class="modal-overlay" @click.self="adjusting = null">
      <div class="modal">
        <h2>Adjust Wallet</h2>
        <p>User: <strong>{{ adjusting.users?.email }}</strong></p>
        <p>Current Balance: <strong>${{ parseFloat(adjusting.balance || 0).toFixed(2) }}</strong></p>
        <div class="form-group">
          <label>Adjustment Type</label>
          <select v-model="adjustType">
            <option value="add">Add Funds</option>
            <option value="deduct">Deduct Funds</option>
            <option value="freeze">Freeze Amount</option>
            <option value="unfreeze">Unfreeze Amount</option>
          </select>
        </div>
        <div class="form-group">
          <label>Amount ($)</label>
          <input v-model.number="adjustAmount" type="number" min="0.01" step="0.01">
        </div>
        <div class="form-group">
          <label>Reason</label>
          <input v-model="adjustReason" placeholder="Admin adjustment reason">
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="adjusting = null">Cancel</button>
          <button class="btn-save" @click="confirmAdjust">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const wallets = ref([])
const search = ref('')
const sortBy = ref('balance')
const adjusting = ref(null)
const adjustType = ref('add')
const adjustAmount = ref(0)
const adjustReason = ref('')

const totalBalance = computed(() => wallets.value.reduce((s, w) => s + parseFloat(w.balance || 0), 0).toFixed(2))
const totalFrozen = computed(() => wallets.value.reduce((s, w) => s + parseFloat(w.frozen_money || 0), 0).toFixed(2))
const totalRebate = computed(() => wallets.value.reduce((s, w) => s + parseFloat(w.rebate || 0), 0).toFixed(2))

const filteredWallets = computed(() => {
  let result = wallets.value
  if (search.value) result = result.filter(w => w.users?.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (sortBy.value === 'balance') result.sort((a, b) => parseFloat(b.balance || 0) - parseFloat(a.balance || 0))
  if (sortBy.value === 'frozen') result.sort((a, b) => parseFloat(b.frozen_money || 0) - parseFloat(a.frozen_money || 0))
  return result
})

const loadWallets = async () => {
  loading.value = true
  const { data } = await supabase.from('wallets').select('*, users(email)').order('updated_at', { ascending: false })
  wallets.value = data || []
  loading.value = false
}

const adjustWallet = (wallet) => {
  adjusting.value = wallet
  adjustType.value = 'add'
  adjustAmount.value = 0
  adjustReason.value = ''
}

const confirmAdjust = async () => {
  if (adjustAmount.value <= 0) return window.__toast?.show('Enter a valid amount', 'error')
  const wallet = adjusting.value
  const currentBalance = parseFloat(wallet.balance || 0)
  const currentFrozen = parseFloat(wallet.frozen_money || 0)
  if ((adjustType.value === 'deduct' || adjustType.value === 'freeze') && adjustAmount.value > currentBalance) {
    return window.__toast?.show('Insufficient balance for this adjustment', 'error')
  }
  if (adjustType.value === 'unfreeze' && adjustAmount.value > currentFrozen) {
    return window.__toast?.show('Cannot unfreeze more than frozen amount', 'error')
  }
  const updates = {}
  if (adjustType.value === 'add') updates.balance = currentBalance + adjustAmount.value
  if (adjustType.value === 'deduct') updates.balance = Math.max(0, currentBalance - adjustAmount.value)
  if (adjustType.value === 'freeze') {
    updates.balance = Math.max(0, currentBalance - adjustAmount.value)
    updates.frozen_money = currentFrozen + adjustAmount.value
  }
  if (adjustType.value === 'unfreeze') {
    updates.frozen_money = Math.max(0, currentFrozen - adjustAmount.value)
    updates.balance = currentBalance + adjustAmount.value
  }
  updates.updated_at = new Date().toISOString()
  try { await supabase.from('wallets').update(updates).eq('id', wallet.id) } catch(_e) { console.error('Wallets.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  adjusting.value = null
  await loadWallets()
}

const viewHistory = (wallet) => window.__toast?.show(`Wallet history for ${wallet.users?.email} - Feature coming soon`)

onMounted(loadWallets)
</script>

<style scoped>
body, html { overflow-x: hidden; }
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
.amount.frozen { color: var(--warning, #B45309); }
.amount.total { color: var(--brand-primary, #FF9900); }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-sm:hover { background: #f5f5f5; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 450px; max-width: 90vw; }
.modal h2 { margin: 0 0 15px; }
.modal p { margin: 5px 0 15px; font-size: 14px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
