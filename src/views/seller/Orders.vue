<template>
  <div class="seller-orders">
    <h1>Orders</h1>
    <div class="order-tabs">
      <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
      <button :class="{ active: tab === 'pending' }" @click="tab = 'pending'">Pending</button>
      <button :class="{ active: tab === 'shipped' }" @click="tab = 'shipped'">Shipped</button>
      <button :class="{ active: tab === 'completed' }" @click="tab = 'completed'">Completed</button>
    </div>
    
    <div v-if="loading" class="loading">Loading orders...</div>
    <div v-else-if="orders.length === 0" class="empty-state">
      <i class="fas fa-clipboard-list"></i>
      <p>No orders yet</p>
    </div>
    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">#{{ order.order_no }}</span>
          <span class="order-status" :class="order.status">{{ order.status }}</span>
        </div>
        <div class="order-body">
          <p><strong>Customer:</strong> {{ order.users?.email || 'N/A' }}</p>
          <p><strong>Total:</strong> ${{ order.total_amount }}</p>
          <p><strong>Date:</strong> {{ new Date(order.created_at).toLocaleDateString() }}</p>
        </div>
        <div class="order-actions">
          <button v-if="order.status === 'pending'" @click="updateStatus(order.id, 'shipped')">Mark Shipped</button>
          <button v-if="order.status === 'shipped'" @click="updateStatus(order.id, 'completed')">Mark Completed</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const tab = ref('all')
const orders = ref([])
const loading = ref(true)

const filteredOrders = computed(() => {
  if (tab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === tab.value)
})

const loadOrders = async () => {
  if (!userStore.supabaseUser) return
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser.id)
      .single()
    
    if (seller) {
      const { data } = await supabase
        .from('orders')
        .select('*, users(email)')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
      orders.value = data || []
    }
  } catch (e) {
    console.error('Failed to load orders:', e)
  }
  loading.value = false
}

const updateStatus = async (orderId, status) => {
  try {
    try { await supabase.from('orders').update({ status }).eq('id', orderId) } catch(_e) { console.error('Orders:', _e); window.__toast?.show('Update failed', 'error') }
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = status
  } catch (e) {
    window.__toast?.show('Failed to update order status')
  }
}

onMounted(loadOrders)
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.order-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.order-tabs button { padding: 10px 25px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.order-tabs button.active { background: #FF9900; color: #fff; border-color: #FF9900; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.order-card { background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.order-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.order-no { font-weight: 600; }
.order-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
.order-status.pending { background: #fff3cd; color: #856404; }
.order-status.shipped { background: #d1ecf1; color: #0c5460; }
.order-status.completed { background: #d4edda; color: #155724; }
.order-body { padding: 15px 20px; }
.order-body p { margin-bottom: 5px; }
.order-actions { padding: 15px 20px; border-top: 1px solid #f0f0f0; }
.order-actions button { padding: 8px 16px; background: #FF9900; color: #fff; border: none; border-radius: 4px; cursor: pointer; }

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
