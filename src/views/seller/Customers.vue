<template>
  <div class="page-wrapper">
  <div class="customers">
    <h1>Customers</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="customers.length === 0" class="empty">No customers yet</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Orders</th>
            <th>Total Spent</th>
            <th>Last Order</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.email }}</td>
            <td>{{ customer.order_count }}</td>
            <td>${{ customer.total_spent }}</td>
            <td>{{ new Date(customer.last_order).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const customers = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  try {
    const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
    if (seller) {
      const { data: orders } = await supabase.from('orders').select('user_id, total_amount, created_at, users(email)').eq('seller_id', seller.id)
      const customerMap = {}
      ;(orders || []).forEach(o => {
        if (!customerMap[o.user_id]) {
          customerMap[o.user_id] = { id: o.user_id, email: o.users?.email || 'N/A', order_count: 0, total_spent: 0, last_order: o.created_at }
        }
        customerMap[o.user_id].order_count++
        customerMap[o.user_id].total_spent += parseFloat(o.total_amount || 0)
        if (o.created_at > customerMap[o.user_id].last_order) customerMap[o.user_id].last_order = o.created_at
      })
      customers.value = Object.values(customerMap)
    }
  } catch (e) {
    console.error('Failed:', e)
  }
  loading.value = false
})


</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }

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
