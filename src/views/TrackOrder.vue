<template>
  <div class="track-order-page">
    <div class="container">
      <h1><i class="fas fa-truck"></i> Track Your Order</h1>
      <div class="track-card">
        <div class="track-search">
          <input v-model="orderNo" placeholder="Enter order number (e.g., ORD-1234567890)" @keyup.enter="trackOrder" />
          <button @click="trackOrder" :disabled="loading || !orderNo.trim()">
            <i class="fas fa-search"></i> Track
          </button>
        </div>
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>

      <div v-if="order" class="order-result">
        <div class="order-header">
          <h2>Order #{{ order.order_no }}</h2>
          <span class="status-badge" :style="{ background: getStatusColor(order.status) }">{{ order.status }}</span>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div class="timeline-step" :class="{ active: isStepActive('pending') }">
            <div class="step-icon"><i class="fas fa-check-circle"></i></div>
            <div class="step-info">
              <strong>Order Placed</strong>
              <span>{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
          <div class="timeline-step" :class="{ active: isStepActive('paid') }">
            <div class="step-icon"><i class="fas fa-credit-card"></i></div>
            <div class="step-info">
              <strong>Payment Confirmed</strong>
              <span>{{ order.payment_status === 'paid' ? 'Paid' : 'Pending' }}</span>
            </div>
          </div>
          <div class="timeline-step" :class="{ active: isStepActive('processing') }">
            <div class="step-icon"><i class="fas fa-box"></i></div>
            <div class="step-info">
              <strong>Processing</strong>
              <span>Seller is preparing your order</span>
            </div>
          </div>
          <div class="timeline-step" :class="{ active: isStepActive('shipped') }">
            <div class="step-icon"><i class="fas fa-shipping-fast"></i></div>
            <div class="step-info">
              <strong>Shipped</strong>
              <span>{{ order.tracking_number ? 'Tracking: ' + order.tracking_number : 'Waiting for shipment' }}</span>
            </div>
          </div>
          <div class="timeline-step" :class="{ active: isStepActive('delivered') }">
            <div class="step-icon"><i class="fas fa-home"></i></div>
            <div class="step-info">
              <strong>Delivered</strong>
              <span>Package delivered</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items" v-if="order.order_items?.length">
          <h3>Order Items</h3>
          <div v-for="item in order.order_items" :key="item.id" class="order-item">
            <div class="item-img">
              <img v-if="item.product_image" :src="item.product_image" :alt="item.product_name" />
              <div v-else class="img-placeholder">{{ (item.product_name || 'P')[0] }}</div>
            </div>
            <div class="item-info">
              <h4>{{ item.product_name || 'Product' }}</h4>
              <p>Qty: {{ item.quantity }} × ${{ item.product_price }}</p>
            </div>
            <div class="item-total">${{ item.total_price }}</div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-row"><span>Total Amount</span><strong>${{ order.total_amount }}</strong></div>
          <div class="summary-row"><span>Payment Method</span><span>{{ order.payment_method || 'N/A' }}</span></div>
          <div class="summary-row"><span>Order Date</span><span>{{ formatDate(order.created_at) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const orderNo = ref('')
const order = ref(null)
const loading = ref(false)
const error = ref('')

const steps = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed']

const isStepActive = (step) => {
  if (!order.value) return false
  const currentIdx = steps.indexOf(order.value.status)
  const stepIdx = steps.indexOf(step)
  return stepIdx <= currentIdx
}

const getStatusColor = (status) => {
  const colors = { pending: '#ffc107', paid: '#17a2b8', processing: '#17a2b8', shipped: '#007185', delivered: '#28a745', completed: '#28a745', cancelled: '#dc3545' }
  return colors[status] || '#6c757d'
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const trackOrder = async () => {
  if (!orderNo.value.trim()) return
  loading.value = true
  error.value = ''
  order.value = null
  try {
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_no', orderNo.value.trim())
      .single()
    if (err || !data) { error.value = 'Order not found. Please check the order number.'; return }
    order.value = data
  } catch (e) { error.value = 'Failed to fetch order details.' }
  loading.value = false
}
</script>

<style scoped>
.container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.track-card { background: #fff; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 1.5rem; }
.track-search { display: flex; gap: 0.75rem; }
.track-search input { flex: 1; padding: 0.75rem 1rem; border: 2px solid var(--border); border-radius: var(--radius-sm); font-size: 0.875rem; }
.track-search input:focus { outline: none; border-color: var(--brand-primary); }
.track-search button { padding: 0.75rem 1.5rem; background: var(--brand-primary); color: var(--brand-dark); border: none; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.track-search button:disabled { background: #ccc; cursor: not-allowed; }
.loading { text-align: center; padding: 1rem; color: var(--text-muted); }
.error-msg { color: var(--danger); text-align: center; padding: 1rem; background: #f8d7da; border-radius: var(--radius-sm); margin-top: 0.75rem; }
.order-result { background: #fff; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
.order-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-light); }
.order-header h2 { font-size: 1.25rem; margin: 0; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); color: #fff; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.timeline { padding: 1.5rem; display: flex; flex-direction: column; gap: 0; }
.timeline-step { display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem 0; position: relative; }
.timeline-step:not(:last-child)::before { content: ''; position: absolute; left: 15px; top: 40px; bottom: -8px; width: 2px; background: var(--border-light); }
.timeline-step.active:not(:last-child)::before { background: var(--brand-primary); }
.step-icon { width: 32px; height: 32px; border-radius: 50%; background: var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #999; font-size: 0.875rem; }
.timeline-step.active .step-icon { background: var(--brand-primary); color: #fff; }
.step-info strong { display: block; font-size: 0.875rem; }
.step-info span { font-size: 0.75rem; color: var(--text-muted); }
.order-items { padding: 1.5rem; border-top: 1px solid var(--border-light); }
.order-items h3 { font-size: 1rem; margin-bottom: 1rem; }
.order-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); }
.order-item:last-child { border-bottom: none; }
.item-img { width: 60px; height: 60px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; background: #f5f5f5; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #ccc; }
.item-info { flex: 1; }
.item-info h4 { font-size: 0.875rem; margin: 0 0 0.25rem; }
.item-info p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.item-total { font-weight: 600; color: var(--brand-primary); }
.order-summary { padding: 1.5rem; background: #f9f9f9; border-top: 1px solid var(--border-light); }
.summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.875rem; }
.summary-row strong { color: var(--brand-primary); }
@media (max-width: 480px) { .track-search { flex-direction: column; } .timeline-step { gap: 0.75rem; } }
</style>
