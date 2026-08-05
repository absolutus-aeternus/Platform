<template>
  <div class="admin-transactions">
    <h1>Transactions</h1>
    <div class="summary-cards">
      <div class="card"><h3>Total Volume</h3><p>${{ totalVolume }}</p></div>
      <div class="card"><h3>Today</h3><p>${{ todayVolume }}</p></div>
      <div class="card"><h3>Pending</h3><p>{{ pendingCount }}</p></div>
    </div>
    <table>
      <thead>
        <tr><th>ID</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        <tr v-for="tx in transactions" :key="tx.id">
          <td>{{ tx.id?.substring(0, 8) }}</td>
          <td>{{ tx.user_email || 'N/A' }}</td>
          <td>{{ tx.type }}</td>
          <td>${{ tx.amount }}</td>
          <td><span class="status" :class="tx.status">{{ tx.status }}</span></td>
          <td>{{ new Date(tx.created_at).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const transactions = ref([])
const totalVolume = ref('0.00')
const todayVolume = ref('0.00')
const pendingCount = ref(0)
onMounted(async () => {
  const { data } = await supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
  transactions.value = (data || []).map(o => ({ ...o, type: 'order', user_email: o.users?.email }))
  totalVolume.value = transactions.value.reduce((s, t) => s + parseFloat(t.total_amount || 0), 0).toFixed(2)
})
</script>

<style scoped>
h1 { margin-bottom: 20px; }
.summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
.card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card h3 { color: #666; font-size: 13px; margin-bottom: 8px; }
.card p { font-size: 22px; font-weight: 700; color: #fe2c55; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status.pending { background: #fff3cd; color: #856404; }
.status.completed { background: #d4edda; color: #155724; }
</style>
