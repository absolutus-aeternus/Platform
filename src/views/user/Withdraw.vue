<template>
  <div class="withdraw">
    <div class="page-header"><h1>Withdraw Funds</h1></div>
    <div class="withdraw-container">
      <div class="withdraw-main">
        <div class="section">
          <h2>Withdrawal Method</h2>
          <div class="channels">
            <div v-for="ch in channels" :key="ch.id" class="channel-card" :class="{ active: selected === ch.id }" @click="selected = ch.id">
              <div class="ch-icon" :style="{ background: coinColor(ch.coin) }">{{ ch.coin[0] }}</div>
              <div class="ch-info"><strong>{{ ch.coin }}</strong><p>{{ ch.blockchain_name }}</p></div>
              <span class="ch-fee">Fee: {{ ch.fee }}%</span>
            </div>
          </div>
        </div>
        <div class="section" v-if="selectedChannel">
          <h2>Withdrawal Details</h2>
          <div class="form-group"><label>Amount (USD) *</label><input v-model.number="amount" type="number" :min="minWithdraw" :placeholder="'Min $' + minWithdraw"></div>
          <div class="form-group"><label>Wallet Address *</label><input v-model="address" placeholder="Your crypto wallet address"></div>
          <div class="withdraw-summary">
            <div class="summary-row"><span>Withdrawal Amount</span><span>${{ amount || '0.00' }}</span></div>
            <div class="summary-row"><span>Fee ({{ selectedChannel.fee }}%)</span><span>-${{ fee }}</span></div>
            <div class="summary-row total"><span>You'll Receive</span><span>${{ receiveAmount }}</span></div>
          </div>
        </div>
        <button class="btn-submit" @click="submitWithdraw" :disabled="!amount || !selected || !address || amount < minWithdraw || submitting">
          {{ submitting ? 'Processing...' : 'Submit Withdrawal' }}
        </button>
      </div>
      <div class="withdraw-sidebar">
        <div class="balance-card"><h3>Available Balance</h3><p class="balance">${{ balance }}</p></div>
        <div class="history-card">
          <h3>Recent Withdrawals</h3>
          <div v-if="history.length === 0" class="empty">No withdrawals yet</div>
          <div v-for="h in history" :key="h.id" class="history-item">
            <div class="hist-info"><strong>${{ parseFloat(h.amount).toFixed(2) }}</strong><p>{{ h.coin }} • {{ new Date(h.created_at).toLocaleDateString() }}</p></div>
            <span class="status" :class="h.status">{{ h.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase, fetchBlockchainChannels, fetchWallet, createWithdrawal, fetchWithdrawals } from '@/services/supabase'

const userStore = useUserStore()
const channels = ref([])
const selected = ref('')
const amount = ref(0)
const address = ref('')
const balance = ref('0.00')
const minWithdraw = ref(50)
const submitting = ref(false)
const history = ref([])

const selectedChannel = computed(() => channels.value.find(c => c.id === selected.value))
const fee = computed(() => ((amount.value || 0) * (selectedChannel.value?.fee || 0) / 100).toFixed(2))
const receiveAmount = computed(() => Math.max(0, (amount.value || 0) - parseFloat(fee.value)).toFixed(2))
const coinColor = (c) => ({ USDT: '#26a17b', USDC: '#2775ca', BTC: '#f7931a', ETH: '#627eea' }[c] || 'var(--brand-primary, #FF9900)')

onMounted(async () => { try {
  if (!userStore.supabaseUser) return
  const [ch, wallet, min, hist] = await Promise.all([
    fetchBlockchainChannels(),
    fetchWallet(userStore.supabaseUser.id),
    supabase.from('system_params').select('value').eq('code', 'min_withdraw').single(),
    fetchWithdrawals(userStore.supabaseUser.id)
  ])
  channels.value = ch.data || []
  if (wallet.data) balance.value = parseFloat(wallet.data.balance || 0).toFixed(2)
  if (min.data) minWithdraw.value = parseFloat(min.data.value) || 50
  history.value = (hist.data || []).slice(0, 5)
  loading.value = false
} catch (e) { console.error("Withdraw.vue error:", e) }
})

const submitWithdraw = async () => {
  if (!userStore.supabaseUser) return window.__toast?.show('Please login')
  if (amount.value < minWithdraw.value) return window.__toast?.show(`Minimum withdrawal is $${minWithdraw.value}`)
  if (amount.value > parseFloat(balance.value)) return window.__toast?.show('Insufficient balance')
  submitting.value = true
  await createWithdrawal({
    user_id: userStore.supabaseUser.id,
    amount: amount.value,
    coin: selectedChannel.value.coin,
    blockchain_name: selectedChannel.value.blockchain_name,
    address: address.value,
    fee: parseFloat(fee.value),
    status: 'pending'
  })
  await supabase.from('wallets').update({
    balance: parseFloat(balance.value) - amount.value,
    frozen_money: amount.value,
    updated_at: new Date().toISOString()
  }).eq('user_id', userStore.supabaseUser.id)
  submitting.value = false
  window.__toast?.show('Withdrawal request submitted!')
  amount.value = 0; address.value = ''
  balance.value = (parseFloat(balance.value) - amount.value).toFixed(2)
}
</script>

<style scoped>
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.withdraw-container { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.section h2 { margin: 0 0 18px; font-size: 16px; color: #333; }
.channels { display: flex; flex-direction: column; gap: 10px; }
.channel-card { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.channel-card.active { border-color: var(--brand-primary, #FF9900); background: #fff8f0; }
.channel-card:hover { border-color: var(--brand-primary, #FF9900); }
.ch-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.ch-info strong { font-size: 14px; }
.ch-info p { margin: 2px 0 0; font-size: 12px; color: #999; }
.ch-fee { margin-left: auto; font-size: 12px; color: #666; background: #f0f0f0; padding: 4px 10px; border-radius: 12px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input { width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
.form-group input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.withdraw-summary { background: #f8f9fa; padding: 18px; border-radius: 10px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
.summary-row.total { border-top: 1px solid #e0e0e0; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.btn-submit { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; }
.btn-submit:disabled { background: #ccc; }
.balance-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; text-align: center; }
.balance-card h3 { margin: 0 0 8px; font-size: 13px; color: #999; }
.balance { font-size: 32px; font-weight: 700; color: var(--brand-primary, #FF9900); margin: 0; }
.history-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.history-card h3 { margin: 0 0 15px; font-size: 14px; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.hist-info strong { font-size: 14px; }
.hist-info p { margin: 2px 0 0; font-size: 11px; color: #999; }
.status { padding: 3px 8px; border-radius: 10px; font-size: 11px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.approved { background: #d4edda; color: #155724; }
.status.rejected { background: #f8d7da; color: #721c24; }
.empty { text-align: center; padding: 20px; color: #999; font-size: 13px; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
