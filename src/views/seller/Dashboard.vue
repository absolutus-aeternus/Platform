<template>
  <div class="seller-dashboard">
    <h1>Seller Dashboard</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-box"></i>
          <div>
            <h3>{{ stats.products }}</h3>
            <p>Products</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-shopping-cart"></i>
          <div>
            <h3>{{ stats.orders }}</h3>
            <p>Orders</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-dollar-sign"></i>
          <div>
            <h3>${{ stats.revenue }}</h3>
            <p>Revenue</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-chart-line"></i>
          <div>
            <h3>{{ stats.sales }}</h3>
            <p>Total Sales</p>
          </div>
        </div>
      </div>
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <router-link to="/seller/products" class="action-card">
            <i class="fas fa-plus-circle"></i>
            <span>Add Product</span>
          </router-link>
          <router-link to="/seller/orders" class="action-card">
            <i class="fas fa-clipboard-list"></i>
            <span>View Orders</span>
          </router-link>
          <router-link to="/seller/analytics" class="action-card">
            <i class="fas fa-chart-bar"></i>
            <span>Analytics</span>
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const stats = ref({ products: 0, orders: 0, revenue: '0.00', sales: 0 })
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
        supabase.from('orders').select('total_amount').eq('seller_id', seller.id),
        supabase.from('products').select('id').eq('seller_id', seller.id)
      ])
      
      stats.value.orders = ordersRes.data?.length || 0
      stats.value.products = productsRes.data?.length || 0
      stats.value.revenue = (ordersRes.data || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)
      stats.value.sales = stats.value.orders
    }
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: #fff; padding: 25px; border-radius: 12px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card i { font-size: 32px; color: #FF9900; }
.stat-card h3 { font-size: 24px; margin-bottom: 5px; }
.stat-card p { color: #666; }
.quick-actions { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.quick-actions h2 { margin-bottom: 15px; }
.actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.action-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; background: #f8f8f8; border-radius: 8px; text-decoration: none; color: #333; transition: all 0.3s; }
.action-card:hover { background: #FF9900; color: #fff; }
.action-card i { font-size: 24px; }

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
