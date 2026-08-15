<template>
  <div class="finance">
    <h1>Finance</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <p class="stat-value">${{ stats.revenue }}</p>
      </div>
      <div class="stat-card">
        <h3>Available Balance</h3>
        <p class="stat-value">${{ stats.balance }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Orders</h3>
        <p class="stat-value">{{ stats.pending }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Withdrawn</h3>
        <p class="stat-value">${{ stats.withdrawn }}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>Recent Transactions</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="transactions.length === 0" class="empty">No transactions</div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ new Date(tx.created_at).toLocaleDateString() }}</td>
              <td>{{ tx.type }}</td>
              <td :class="{ positive: tx.amount > 0 }">${{ tx.amount }}</td>
              <td><span class="status" :class="tx.status">{{ tx.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const stats = ref({ revenue: '0.00', balance: '0.00', pending: 0, withdrawn: '0.00' })
const transactions = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  try {
    const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
    if (seller) {
      const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at').eq('seller_id', seller.id)
      stats.value.revenue = (orders || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)
      stats.value.pending = (orders || []).filter(o => o.status === 'pending').length
    }
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', userStore.supabaseUser.id).single()
    stats.value.balance = wallet?.balance || '0.00'
  } catch (e) {
    console.error('Failed:', e)
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
.stat-value { font-size: 28px; font-weight: 700; color: #fe2c55; }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.section h2 { margin-bottom: 20px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
.positive { color: #2ed573; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.completed { background: #d4edda; color: #155724; }
</style>
