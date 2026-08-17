<template>
  <div class="recharge">
    <div class="page-header"><h1>Recharge Wallet</h1></div>
    <div class="recharge-container">
      <div class="recharge-main">
        <div class="section">
          <h2>Select Payment Channel</h2>
          <div class="channels">
            <div v-for="ch in channels" :key="ch.id" class="channel-card" :class="{ active: selected === ch.id }" @click="selected = ch.id">
              <div class="ch-icon" :style="{ background: coinColor(ch.coin) }">{{ ch.coin[0] }}</div>
              <div class="ch-info"><strong>{{ ch.coin }}</strong><p>{{ ch.blockchain_name }}</p></div>
              <span class="ch-fee">Fee: {{ ch.fee }}%</span>
            </div>
          </div>
        </div>
        <div class="section" v-if="selectedChannel">
          <h2>Recharge Details</h2>
          <div class="form-group"><label>Amount (USD) *</label><input v-model.number="amount" type="number" :min="minRecharge" :placeholder="'Min $' + minRecharge"></div>
          <div class="amount-presets">
            <button v-for="p in presets" :key="p" class="preset" :class="{ active: amount === p }" @click="amount = p">${{ p }}</button>
          </div>
          <div class="wallet-info">
            <h3>Send Payment To</h3>
            <div class="wallet-address"><code>{{ selectedChannel.address || 'Contact customer service' }}</code></div>
            <p class="warning"><i class="fas fa-exclamation-triangle"></i> Only send {{ selectedChannel.coin }} ({{ selectedChannel.blockchain_name }}) to this address</p>
          </div>
        </div>
        <button class="btn-submit" @click="submitRecharge" :disabled="!amount || !selected || amount < minRecharge">
          {{ submitting ? 'Processing...' : 'Submit Recharge Request' }}
        </button>
      </div>
      <div class="recharge-sidebar">
        <div class="balance-card">
          <h3>Current Balance</h3>
          <p class="balance">${{ balance }}</p>
        </div>
        <div class="info-card">
          <h3><i class="fas fa-info-circle"></i> How it works</h3>
          <ol>
            <li>Select a payment channel</li>
            <li>Enter the amount to recharge</li>
            <li>Send payment to the wallet address</li>
            <li>Balance will be added after confirmation</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase, fetchBlockchainChannels, fetchWallet, createRecharge } from '@/services/supabase'

const userStore = useUserStore()
const channels = ref([])
const selected = ref('')
const amount = ref(0)
const balance = ref('0.00')
const minRecharge = ref(10)
const submitting = ref(false)
const presets = [50, 100, 200, 500, 1000, 2000]

const selectedChannel = computed(() => channels.value.find(c => c.id === selected.value))
const coinColor = (c) => ({ USDT: '#26a17b', USDC: '#2775ca', BTC: '#f7931a', ETH: '#627eea' }[c] || '#FF9900')

onMounted(async () => { try {
  const [ch, wallet, min] = await Promise.all([
    fetchBlockchainChannels(),
    userStore.supabaseUser ? fetchWallet(userStore.supabaseUser.id) : { data: null },
    supabase.from('system_params').select('value').eq('code', 'min_recharge').single()
  ])
  channels.value = ch.data || []
  if (wallet.data) balance.value = parseFloat(wallet.data.balance || 0).toFixed(2)
  if (min.data) minRecharge.value = parseFloat(min.data.value) || 10
} catch (e) { console.error("Recharge.vue error:", e) }
})

const submitRecharge = async () => {
  if (!userStore.supabaseUser) return window.__toast?.show('Please login')
  if (amount.value < minRecharge.value) return window__toast?.show(`Minimum recharge is $${minRecharge.value}`)
  submitting.value = true
  await createRecharge({
    user_id: userStore.supabaseUser.id,
    amount: amount.value,
    coin: selectedChannel.value.coin,
    blockchain_name: selectedChannel.value.blockchain_name,
    status: 'pending'
  })
  submitting.value = false
  window.__toast?.show('Recharge request submitted! Please send the payment to the wallet address.')
  amount.value = 0
}
</script>

<style scoped>
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.recharge-container { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.section h2 { margin: 0 0 18px; font-size: 16px; color: #333; }
.channels { display: flex; flex-direction: column; gap: 10px; }
.channel-card { display: flex; align-items: center; gap: 12px; padding: 16px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
.channel-card.active { border-color: #FF9900; background: #fff8f0; }
.channel-card:hover { border-color: #FF9900; }
.ch-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; }
.ch-info strong { font-size: 14px; }
.ch-info p { margin: 2px 0 0; font-size: 12px; color: #999; }
.ch-fee { margin-left: auto; font-size: 12px; color: #666; background: #f0f0f0; padding: 4px 10px; border-radius: 12px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input { width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 16px; font-weight: 600; }
.form-group input:focus { outline: none; border-color: #FF9900; }
.amount-presets { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 20px; }
.preset { padding: 10px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.preset.active, .preset:hover { border-color: #FF9900; background: #fff8f0; color: #FF9900; }
.wallet-info { background: #f8f9fa; padding: 20px; border-radius: 10px; }
.wallet-info h3 { margin: 0 0 10px; font-size: 14px; }
.wallet-address { background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; margin-bottom: 10px; }
.wallet-address code { font-size: 13px; word-break: break-all; color: #333; }
.warning { font-size: 12px; color: #856404; background: #fff3cd; padding: 8px 12px; border-radius: 6px; margin: 0; }
.warning i { margin-right: 5px; }
.btn-submit { width: 100%; padding: 14px; background: #FF9900; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; }
.btn-submit:disabled { background: #ccc; }
.balance-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 16px; text-align: center; }
.balance-card h3 { margin: 0 0 8px; font-size: 13px; color: #999; }
.balance { font-size: 32px; font-weight: 700; color: #FF9900; margin: 0; }
.info-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.info-card h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 15px; font-size: 14px; }
.info-card h3 i { color: #FF9900; }
.info-card ol { padding-left: 20px; margin: 0; }
.info-card li { font-size: 13px; color: #666; margin-bottom: 8px; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
