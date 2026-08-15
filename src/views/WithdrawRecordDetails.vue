<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-file-invoice-dollar"></i> Withdrawal Details</h2>
    <div v-if="record" style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <div style="text-align:center;margin-bottom:24px"><span class="status-badge" :class="record.status" style="font-size:16px;padding:8px 24px">{{ record.status.toUpperCase() }}</span></div>
      <div style="display:grid;gap:12px">
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">ID</span><span>{{ record.id }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">Amount</span><span style="font-weight:700;font-size:18px">${{ record.amount }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">Fee</span><span style="color:#dc2626">${{ record.fee }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">Coin</span><span>{{ record.coin }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">Chain</span><span>{{ record.blockchain_name }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9"><span style="color:#64748b">Address</span><span style="font-family:monospace;font-size:12px">{{ record.address }}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:#64748b">Date</span><span>{{ new Date(record.created_at).toLocaleString() }}</span></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const record = ref(null)
onMounted(async () => {
  const { data } = await supabase.from('withdrawals').select('*').eq('id', route.query.id).single()
  if (data) record.value = data
})
</script>
<style scoped>.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; } .status-badge.pending { background: #fef3c7; color: #92400e; } .status-badge.completed { background: #d1fae5; color: #065f46; }</style>
