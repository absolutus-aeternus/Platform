<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px">
    <h2 style="margin-bottom:24px"><i class="fas fa-credit-card"></i> Pending Payment</h2>
    <div v-if="order" class="payment-card">
      <div class="payment-header">
        <div><h3>Order #{{ order.order_no }}</h3><p style="color:#64748b;font-size:14px">{{ new Date(order.created_at).toLocaleString() }}</p></div>
        <span class="status-badge pending">Pending Payment</span>
      </div>
      <div class="order-items">
        <div v-for="item in order.order_items" :key="item.id" class="order-item">
          <div style="flex:1"><p style="font-weight:600">{{ item.product_name }}</p><p style="color:#64748b;font-size:14px">Qty: {{ item.quantity }}</p></div>
          <p style="font-weight:700">${{ item.total_price }}</p>
        </div>
      </div>
      <div class="total-row"><span style="font-size:14px;color:#64748b">Total: </span><span class="total-amount">${{ order.total_amount }}</span></div>
      <h4 style="margin-bottom:12px">Select Payment Method</h4>
      <div class="payment-methods">
        <label v-for="m in methods" :key="m" class="method-label" :style="{ borderColor: payment === m ? '#ff6b35' : '' }"><input type="radio" v-model="payment" :value="m"> {{ m }}</label>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center" @click="payNow"><i class="fas fa-lock"></i> Pay ${{ order.total_amount }}</button>
    </div>
    <div v-else style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:#64748b"></i><p style="margin-top:12px;color:#64748b">Loading order...</p></div>
  </div>
  </div>
</template>
<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const payment = ref('Credit Card')
const methods = ['Credit Card', 'PayPal', 'Crypto (BTC/USDT)', 'Bank Transfer']

onMounted(async () => {
  const orderId = route.query.order
  if (!orderId) { router.push('/user/orders'); return }
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single()
  if (data) order.value = data
})

const payNow = async () => {
  if (!order.value) return
  loading.value = false
  try { await supabase.from('orders').update({ payment_method: payment.value, payment_status: 'paid', status: 'processing' }).eq('id', order.value.id) } catch(_e) { console.error('PendingPayment:', _e); window.__toast?.show('Payment failed', 'error') }
  router.push(`/pay-success?order=${order.value.order_no}`)
}
</script>
<style scoped>
header { z-index: 2; }
.payment-card { background: white; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; }
.payment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
.order-items { margin-bottom: 24px; }
.order-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.total-row { text-align: right; margin-bottom: 24px; }
.total-amount { font-size: 28px; font-weight: 900; color: #ff6b35; }
.payment-methods { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.method-label { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
@media (max-width: 768px) {
  .payment-card { padding: 20px; }
  .payment-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .order-item { gap: 10px; }
  .total-amount { font-size: 22px; }
  .payment-methods { flex-direction: column; }
  .method-label { padding: 10px 16px; }
}
</style>
