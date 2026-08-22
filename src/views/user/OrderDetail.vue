<template>
  <div class="page-wrapper">
  <div class="order-detail">
    <h1>Order Detail</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!order" class="empty-state"><i class="fas fa-shopping-bag"></i><p>Order not found. It may have been removed or you don't have access.</p><router-link to="/user/orders" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px"><i class="fas fa-arrow-left"></i> Back to Orders</router-link></div>
    <div v-else>
      <div class="order-card">
        <div class="order-header">
          <span>Order #{{ order.order_no }}</span>
          <span class="status" :class="order.status">{{ order.status }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.order_items" :key="item.id" class="item">
            <span>{{ item.product_name }}</span>
            <span>Qty: {{ item.quantity }}</span>
            <span>${{ item.total_price }}</span>
          </div>
        </div>
        <div class="order-info">
          <p><strong>Total:</strong> ${{ order.total_amount }}</p>
          <p><strong>Payment:</strong> {{ order.payment_method }}</p>
          <p><strong>Date:</strong> {{ new Date(order.created_at).toLocaleString() }}</p>
        </div>
        <div class="order-actions">
          <button v-if="order.status === 'pending'" @click="cancelOrder">Cancel Order</button>
          <button v-if="order.status === 'shipped'" @click="confirmReceipt">Confirm Receipt</button>
          <button v-if="order.status === 'completed'" @click="$router.push(`/user/order-evaluation?order=${order.id}`)">Leave Review</button>
        </div>
      </div>
      </div>
        </div>
</div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', route.params.id).maybeSingle()
  order.value = data
  loading.value = false
})

const cancelOrder = async () => {
  if (!confirm('Cancel this order?')) return
  try { await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.value.id) } catch(_e) { console.error('OrderDetail.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  order.value.status = 'cancelled'
}

const confirmReceipt = async () => {
  try { await supabase.from('orders').update({ status: 'completed' }).eq('id', order.value.id) } catch(_e) { console.error('OrderDetail.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  order.value.status = 'completed'
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading, .not-found { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 16px; color: var(--text-muted, #999); } .empty-state i { font-size: 48px; color: var(--neutral-300, #ddd); margin-bottom: 16px; display: block; } .empty-state p { margin-bottom: 16px; font-size: 15px; }
.order-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.order-header { display: flex; justify-content: space-between; padding: 15px 20px; background: #f8f8f8; }
.status { padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.completed { background: #d4edda; color: #155724; }
.order-items { padding: 15px 20px; }
.item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.order-info { padding: 15px 20px; border-top: 1px solid #f0f0f0; }
.order-info p { margin-bottom: 5px; }
.order-actions { padding: 15px 20px; border-top: 1px solid #f0f0f0; }
.order-actions button { padding: 8px 20px; margin-right: 10px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
@media (max-width: 768px) {
  .order-header { flex-direction: column; gap: 8px; padding: 12px; }
  .order-items { padding: 12px; }
  .order-info { padding: 12px; }
  .order-actions { padding: 12px; }
  .order-actions button { width: 100%; margin-right: 0; margin-bottom: 8px; }
}
</style>
