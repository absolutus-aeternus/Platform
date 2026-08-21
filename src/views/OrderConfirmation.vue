<template>
  <div v-if="loading" class="loading-state" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="container" style="padding:40px 20px">
    <h2 style="margin-bottom:24px"><i class="fas fa-truck"></i> Order Confirmation</h2>
    <div v-if="order" style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div>
          <h4 style="margin-bottom:12px;color:#64748b">Shipping Address</h4>
          <div style="background:#f8fafc;padding:16px;border-radius:8px">
            <p style="font-weight:700">{{ order.shipping_address?.name }}</p>
            <p>{{ order.shipping_address?.street }}</p>
            <p>{{ order.shipping_address?.city }}, {{ order.shipping_address?.zip }}</p>
            <p>{{ order.shipping_address?.country }}</p>
            <p>{{ order.shipping_address?.phone }}</p>
          </div>
        </div>
        <div>
          <h4 style="margin-bottom:12px;color:#64748b">Order Summary</h4>
          <div style="background:#f8fafc;padding:16px;border-radius:8px">
            <div v-for="item in order.order_items" :key="item.id" style="display:flex;justify-content:space-between;padding:8px 0"><span>{{ item.product_name }} x{{ item.quantity }}</span><span>${{ item.total_price }}</span></div>
            <hr style="margin:12px 0;border:none;border-top:1px solid #e2e8f0">
            <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px"><span>Total</span><span style="color:#ff6b35">${{ order.total_amount }}</span></div>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:24px">
        <router-link :to="`/pending-payment?order=${order.id}`" class="btn btn-primary"><i class="fas fa-credit-card"></i> Proceed to Payment</router-link>
        <router-link to="/user/orders" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Back to Orders</router-link>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const order = ref(null)
onMounted(async () => { try {
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', route.query.order).single()
  loading.value = false
  if (data) order.value = data } catch (e) { console.error("Order load error:", e) }
})
</script>
<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>
