<template>
  <div class="page-wrapper">
  <div class="wallet">
    <h1>My Wallet</h1>
    <div v-if="loading" class="loading">Loading wallet...</div>
    <div v-else>
      <div class="balance-card">
        <h2>Balance</h2>
        <div class="balance">${{ wallet.balance || '0.00' }}</div>
        <div class="actions">
          <button class="btn-recharge" @click="$router.push('/user/recharge')">Recharge</button>
          <button class="btn-withdraw" @click="$router.push('/user/withdraw')">Withdraw</button>
        </div>
      </div>
      <div class="wallet-info">
        <div class="info-item">
          <span>Pending</span>
          <span>${{ wallet.pending_balance || '0.00' }}</span>
        </div>
        <div class="info-item">
          <span>Frozen</span>
          <span>${{ wallet.frozen_balance || '0.00' }}</span>
        </div>
      </div>
      <div class="blockchain-section">
        <h2>Payment Channels</h2>
        <div v-if="!channels.length" class="empty-state"><i class="fas fa-link"></i><p>No payment channels available yet.</p></div>
        <div class="channels" v-else>
          <div v-for="ch in channels" :key="ch.id" class="channel-card">
            <h4>{{ ch.coin }} ({{ ch.blockchain_name }})</h4>
            <p>Fee: {{ ch.fee }}%</p>
          </div>
        </div>
      </div>
      </div>
        </div>
</div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { fetchWallet, fetchBlockchainChannels } from '@/services/supabase'

const userStore = useUserStore()
const wallet = ref({})
const channels = ref([])
const loading = ref(true)

onMounted(async () => {
  if (userStore.supabaseUser) {
    try {
      const [walletRes, channelRes] = await Promise.all([
        fetchWallet(userStore.supabaseUser.id),
        fetchBlockchainChannels()
      ])
      wallet.value = walletRes.data || {}
      channels.value = channelRes.data || []
    } catch (e) {
      console.error('Failed to load wallet:', e)
    }
  }
  loading.value = false
})
</script>

<style scoped>
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.balance-card { background: linear-gradient(135deg, var(--brand-primary, #FF9900) 0%, #ff6b81 100%); color: #fff; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
.balance-card h2 { opacity: 0.8; margin-bottom: 10px; }
.balance { font-size: 36px; font-weight: 700; margin-bottom: 20px; }
.actions { display: flex; gap: 10px; }
.btn-recharge, .btn-withdraw { padding: 10px 25px; border-radius: 25px; font-size: 14px; cursor: pointer; }
.btn-recharge { background: #fff; color: var(--brand-primary, #FF9900); border: none; }
.btn-withdraw { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.5); }
.wallet-info { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 20px; }
.info-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
.blockchain-section { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.blockchain-section h2 { margin-bottom: 15px; }
.channels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.channel-card { padding: 15px; background: #f8f8f8; border-radius: 8px; }
.channel-card h4 { margin-bottom: 5px; }
.channel-card p { color: #666; font-size: 14px; }
.empty-state { text-align: center; padding: 60px 16px; color: var(--text-muted, #999); } .empty-state i { font-size: 48px; color: var(--neutral-300, #ddd); margin-bottom: 16px; display: block; } .empty-state p { margin-bottom: 16px; font-size: 15px; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .card { padding: 1rem; }
  .form-group input { font-size: 16px; }
}

</style>
