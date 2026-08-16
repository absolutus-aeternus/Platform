<template>
  <div class="seller-analytics">
    <h1>Analytics</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">${{ stats.revenue }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Orders</h3>
        <div class="stat-value">{{ stats.orders }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Products</h3>
        <div class="stat-value">{{ stats.products }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Sales</h3>
        <div class="stat-value">{{ stats.sales }}</div>
      </div>
    </div>
    
    <div class="chart-section">
      <h2>Recent Orders</h2>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="recentOrders.length === 0" class="empty">No recent orders</div>
      <div v-else class="order-table">
        <div class="table-header">
          <span>Order #</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        <div v-for="order in recentOrders" :key="order.id" class="table-row">
          <span>{{ order.order_no }}</span>
          <span>{{ order.users?.email || 'N/A' }}</span>
          <span>${{ order.total_amount }}</span>
          <span class="status" :class="order.status">{{ order.status }}</span>
          <span>{{ new Date(order.created_at).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const stats = ref({ revenue: '0.00', orders: 0, products: 0, sales: 0 })
const recentOrders = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser.id)
      .single()
    
    if (seller) {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*, users(email)').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('id').eq('seller_id', seller.id)
      ])
      
      recentOrders.value = ordersRes.data || []
      stats.value.products = productsRes.data?.length || 0
      stats.value.orders = recentOrders.value.length
      stats.value.revenue = recentOrders.value.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)
      stats.value.sales = recentOrders.value.reduce((sum, o) => sum + (o.order_items?.length || 1), 0)
    }
  } catch (e) {
    console.error('Failed to load analytics:', e)
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
.stat-value { font-size: 28px; font-weight: 700; color: #FF9900; }
.chart-section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.chart-section h2 { margin-bottom: 20px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.table-header, .table-row { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 1fr; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.table-header { font-weight: 600; color: #666; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 12px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.completed { background: #d4edda; color: #155724; }

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
