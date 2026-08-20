<template>
  <div class="page-wrapper">
  <div v-if="loading" class="loading-state" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="container" style="padding:40px 20px">
    <h2 style="margin-bottom:24px"><i class="fas fa-money-bill-wave"></i> Withdrawal History</h2>
    <div v-if="records.length" style="background:white;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Amount</th><th>Coin</th><th>Address</th><th>Fee</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="r in records" :key="r.id">
            <td>{{ r.id.slice(0,8) }}</td>
            <td>${{ r.amount }}</td>
            <td>{{ r.coin }}</td>
            <td>{{ r.address?.slice(0,12) }}...</td>
            <td>${{ r.fee }}</td>
            <td><span class="status-badge" :class="r.status">{{ r.status }}</span></td>
            <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else style="text-align:center;padding:60px"><i class="fas fa-money-bill-wave" style="font-size:48px;color:#94a3b8"></i><p style="color:#64748b;margin-top:16px">No withdrawal records yet</p></div>
  </div>
  </div>
</template>
<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const records = ref([])
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { const { data } = await supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (data) records.value = data }
  loading.value = false
  } catch (e) { console.error('Withdraw record error:', e) }
})
</script>
<style scoped>
body, html { overflow-x: hidden; }.data-table { width: 100%; border-collapse: collapse; } .data-table th { background: #1a1a2e; color: white; padding: 14px 16px; text-align: left; font-size: 13px; } .data-table td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; } .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>
