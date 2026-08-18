<template>
  <div class="orders">
    <h1>My Orders</h1>
    <div class="order-tabs">
      <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
      <button :class="{ active: tab === 'pending' }" @click="tab = 'pending'">Pending</button>
      <button :class="{ active: tab === 'shipped' }" @click="tab = 'shipped'">Shipped</button>
      <button :class="{ active: tab === 'completed' }" @click="tab = 'completed'">Completed</button>
    </div>
    
    <div v-if="loading" class="loading">Loading orders...</div>
    <div v-else-if="orders.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No orders found</p>
      <router-link to="/" class="btn-primary">Start Shopping</router-link>
    </div>
    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">Order #{{ order.order_no }}</span>
          <span class="order-status" :class="order.status">{{ order.status }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.order_items" :key="item.id" class="order-item">
            <span>{{ item.product_name }}</span>
            <span>Qty: {{ item.quantity }}</span>
            <span>${{ item.total_price }}</span>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-date">{{ new Date(order.created_at).toLocaleDateString() }}</span>
          <span class="order-total">Total: ${{ order.total_amount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'
import { fetchOrders } from '@/services/supabase'
import { useGlobalSync } from '@/composables/useGlobalSync'

const userStore = useUserStore()
const { on: onSync } = useGlobalSync()
let unsubscribe = null
const tab = ref('all')
const orders = ref([])
const loading = ref(true)

const filteredOrders = computed(() => {
  if (tab.value === 'all') return orders.value
  return orders.value.filter(o => o.status === tab.value)
})

onMounted(async () => {
  if (userStore.supabaseUser) {
    try {
      const { data } = await fetchOrders(userStore.supabaseUser.id)
      orders.value = data || []
    } catch (e) {
      console.error('Failed to load orders:', e)
    }
    // Listen for realtime order updates
    unsubscribe = onSync('orders:change', async () => {
      const { data } = await fetchOrders(userStore.supabaseUser.id)
      orders.value = data || []
    })
  }
  loading.value = false
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.order-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.order-tabs button { padding: 10px 25px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.order-tabs button.active { background: var(--brand-primary, #FF9900); color: #fff; border-color: var(--brand-primary, #FF9900); }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; padding: 10px 25px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.order-card { background: #fff; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.order-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.order-no { font-weight: 600; }
.order-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
.order-status.pending { background: #fff3cd; color: #856404; }
.order-status.shipped { background: #d1ecf1; color: #0c5460; }
.order-status.completed { background: #d4edda; color: #155724; }
.order-items { padding: 15px 20px; }
.order-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.order-footer { display: flex; justify-content: space-between; padding: 15px 20px; border-top: 1px solid #f0f0f0; }
.order-total { font-weight: 700; color: var(--brand-primary, #FF9900); }

/* Responsive */
@media (max-width: 768px) {
  h1 { font-size: 1.25rem; margin-bottom: 16px; }
  .order-tabs { flex-wrap: wrap; gap: 6px; }
  .order-tabs button { padding: 8px 16px; font-size: 13px; }
  .order-header { padding: 12px 14px; flex-wrap: wrap; gap: 8px; }
  .order-no { font-size: 13px; }
  .order-items { padding: 12px 14px; }
  .order-item { font-size: 13px; flex-wrap: wrap; gap: 4px; }
  .order-footer { padding: 12px 14px; font-size: 13px; }
}
@media (max-width: 480px) {
  .order-tabs { overflow-x: auto; flex-wrap: nowrap; }
  .order-tabs button { white-space: nowrap; padding: 6px 12px; font-size: 12px; }
  .order-header { flex-direction: column; }
  .order-item { flex-direction: column; gap: 2px; }
}
</style>
