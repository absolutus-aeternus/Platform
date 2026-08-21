<template>
  <div class="page-wrapper">
  <div class="admin-orders">
    <h1>Orders</h1>
    <div class="filters">
      <input v-model="search" placeholder="Search orders..." @input="filterOrders">
      <select v-model="statusFilter" @change="filterOrders">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <table v-else>
      <thead>
        <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id">
          <td>{{ order.order_no }}</td>
          <td>{{ order.users?.email || 'N/A' }}</td>
          <td>{{ order.order_items?.length || order.goods_count || 1 }}</td>
          <td>${{ order.total_amount }}</td>
          <td><span class="status" :class="order.status">{{ order.status }}</span></td>
          <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
          <td><button class="btn-sm" @click="viewOrder(order)">View</button></td>
        </tr>
        <tr v-if="filteredOrders.length === 0">
          <td colspan="7" style="text-align:center;padding:20px;color:#999">No orders found</td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/services/supabase'
const orders = ref([])
const search = ref('')
const statusFilter = ref('')
const loading = ref(true)
let realtimeChannel = null

const loadOrders = async () => {
  try {
    const { data } = await supabase.from('orders').select('*, users(email), order_items(*)').order('created_at', { ascending: false }).limit(100)
    orders.value = data || []
  } catch (e) {
    console.error('Orders load error:', e)
  }
}

onMounted(async () => {
  await loadOrders()
  loading.value = false
  // Realtime subscription for orders
  realtimeChannel = supabase.channel('admin-orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      loadOrders()
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchSearch = !search.value || 
      (o.order_no && o.order_no.toLowerCase().includes(search.value.toLowerCase())) ||
      (o.users?.email && o.users.email.toLowerCase().includes(search.value.toLowerCase()))
    const matchStatus = !statusFilter.value || o.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const viewOrder = (order) => {
  window.__toast?.show(`Order ${order.order_no}: ${order.status}`, 'info')
}


</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 20px; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
.loading { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.paid { background: #cce5ff; color: #004085; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.delivered { background: #d4edda; color: #155724; }
.status.completed { background: #d4edda; color: #155724; }
.status.cancelled { background: #f8d7da; color: #721c24; }
.status.refunded { background: #e2e3e5; color: #383d41; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; }
.btn-sm:hover { background: #f5f5f5; }

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
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
