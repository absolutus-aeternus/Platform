<template>
  <div v-if="loading" class="loading-state" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:#FF9900"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="container" style="padding:40px 20px">
    <h2 style="margin-bottom:24px"><i class="fas fa-truck"></i> Order Logistics</h2>
    <div v-if="order" style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <div class="order-header">
        <div><h3>Order #{{ order.order_no }}</h3><p style="color:#64748b;font-size:14px">Tracking: {{ order.tracking_no || 'Pending' }}</p></div>
        <span class="status-badge" :class="order.status">{{ order.status }}</span>
      </div>
      <div class="logistics-timeline">
        <div v-for="(step, i) in timeline" :key="i" class="timeline-item" :class="{ active: i === 0 }">
          <div class="timeline-dot"></div>
          <div class="timeline-content"><h4>{{ step.title }}</h4><p>{{ step.desc }}</p><span>{{ step.time }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const order = ref(null)
const timeline = ref([])
onMounted(async () => { try {
  const { data } = await supabase.from('orders').select('*').eq('id', route.query.order).single()
  if (data) {
    order.value = data
    timeline.value = [
      { title: 'Order Placed', desc: 'Your order has been placed successfully', time: new Date(data.created_at).toLocaleString() },
      { title: 'Payment Confirmed', desc: data.payment_status === 'paid' ? 'Payment received' : 'Awaiting payment', time: data.payment_status === 'paid' ? new Date(data.created_at).toLocaleString() : 'Pending' },
      { title: 'Processing', desc: 'Seller is preparing your order', time: data.status !== 'pending' ? new Date(data.updated_at).toLocaleString() : 'Pending' },
      { title: 'Shipped', desc: data.tracking_no ? `Tracking: ${data.tracking_no}` : 'Not yet shipped', time: data.tracking_no ? new Date(data.updated_at).toLocaleString() : 'Pending' },
      { title: 'Delivered', desc: 'Order delivered', time: data.status === 'delivered' ? new Date(data.updated_at).toLocaleString() : 'Pending' },
    ]
  }
  loading.value = false
} catch (e) { console.error('Logistics error:', e) }
})
</script>
<style scoped>
.logistics-timeline { position: relative; padding-left: 30px; }
.timeline-item { position: relative; padding-bottom: 24px; padding-left: 20px; border-left: 2px solid #e2e8f0; }
.timeline-item.active { border-left-color: #ff6b35; }
.timeline-dot { position: absolute; left: -8px; top: 0; width: 14px; height: 14px; background: #e2e8f0; border-radius: 50%; }
.timeline-item.active .timeline-dot { background: #ff6b35; }
.timeline-content h4 { font-size: 15px; margin-bottom: 4px; }
.timeline-content p { font-size: 14px; color: #64748b; }
.timeline-content span { font-size: 12px; color: #94a3b8; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.processing { background: #dbeafe; color: #1e40af; }
.status-badge.shipped { background: #d1fae5; color: #065f46; }
.status-badge.delivered { background: #d1fae5; color: #065f46; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
@media (max-width: 768px) {
  .order-header { flex-direction: column; gap: 12px; }
  .logistics-timeline { padding-left: 20px; }
  .timeline-item { padding-left: 15px; }
}
</style>
