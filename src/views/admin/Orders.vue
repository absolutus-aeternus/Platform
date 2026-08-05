<template>
  <div class="admin-orders">
    <h1>Orders</h1>
    <div class="filters">
      <input v-model="search" placeholder="Search orders...">
      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="shipped">Shipped</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    <table>
      <thead>
        <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.order_no }}</td>
          <td>{{ order.users?.email || 'N/A' }}</td>
          <td>{{ order.goods_count || 1 }}</td>
          <td>${{ order.total_amount }}</td>
          <td><span class="status" :class="order.status">{{ order.status }}</span></td>
          <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
          <td><button class="btn-sm">View</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const orders = ref([])
const search = ref('')
const statusFilter = ref('')
onMounted(async () => {
  const { data } = await supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(50)
  orders.value = data || []
})
</script>

<style scoped>
h1 { margin-bottom: 20px; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.completed { background: #d4edda; color: #155724; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; }
</style>
