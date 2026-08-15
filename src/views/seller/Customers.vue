<template>
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
h1 { margin-bottom: 25px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
</style>
