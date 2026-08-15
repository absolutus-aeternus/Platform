<template>
  <div class="returns">
    <h1>Returns</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="returns.length === 0" class="empty">No return requests</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ret in returns" :key="ret.id">
            <td>{{ ret.order_no }}</td>
            <td>{{ ret.customer }}</td>
            <td>{{ ret.reason }}</td>
            <td><span class="status" :class="ret.status">{{ ret.status }}</span></td>
            <td>{{ new Date(ret.created_at).toLocaleDateString() }}</td>
            <td>
              <button @click="approveReturn(ret)">Approve</button>
              <button @click="rejectReturn(ret)" class="btn-reject">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const returns = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    const { data } = await supabase.from('orders').select('*, users(email)').eq('seller_id', seller.id).eq('status', 'return_requested')
    returns.value = (data || []).map(o => ({
      ...o,
      order_no: o.order_no,
      customer: o.users?.email || 'N/A',
      reason: 'Customer request'
    }))
  }
  loading.value = false
})

const approveReturn = async (ret) => {
  try { await supabase.from('orders').update({ status: 'return_approved' }).eq('id', ret.id) } catch(_e) { console.error('Returns.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  returns.value = returns.value.filter(r => r.id !== ret.id)
}

const rejectReturn = async (ret) => {
  try { await supabase.from('orders').update({ status: 'return_rejected' }).eq('id', ret.id) } catch(_e) { console.error('Returns.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  returns.value = returns.value.filter(r => r.id !== ret.id)
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status.pending { background: #fff3cd; color: #856404; }
button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 5px; }
.btn-reject { color: #ff4757; border-color: #ff4757; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .card { padding: 1rem; }
  .btn-primary { padding: 0.5rem 1rem; font-size: 0.8125rem; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
