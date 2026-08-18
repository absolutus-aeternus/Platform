<template>
  <div class="seller-dashboard">
    <div class="seller-dashboard__header">
      <h1>Seller Dashboard</h1>
    </div>

    <div v-if="loading" class="seller-dashboard__loading">
      <div class="spinner"></div>
      <span>Loading dashboard...</span>
    </div>

    <template v-else>
      <!-- Stats Row -->
      <BentoGrid>
        <StatCard
          class="bento-stat"
          icon="fas fa-dollar-sign"
          label="Revenue"
          :value="'$' + stats.revenue"
          change="+12.5%"
          change-type="up"
          period="vs last week"
          color="#067D62"
        />
        <StatCard
          class="bento-stat"
          icon="fas fa-shopping-cart"
          label="Orders"
          :value="String(stats.orders)"
          change="+8"
          change-type="up"
          period="today"
          color="var(--brand-accent, #007185)"
        />
        <StatCard
          class="bento-stat"
          icon="fas fa-box"
          label="Products"
          :value="String(stats.products)"
          :alert="lowStockCount > 0 ? `${lowStockCount} low stock` : ''"
          color="#B45309"
        />
        <StatCard
          class="bento-stat"
          icon="fas fa-star"
          label="Rating"
          :value="stats.rating || '4.8'"
          :change="`${stats.reviewCount || 0} reviews`"
          change-type="up"
          period=""
          color="var(--brand-primary, #FF9900)"
        />

        <!-- Sales Chart -->
        <SalesChart
          class="bento-chart"
          title="Sales Overview"
          :data="chartData"
          :active-range="chartRange"
          @range-change="chartRange = $event"
        />

        <!-- Quick Actions -->
        <div class="bento-actions seller-actions">
          <h3 class="seller-actions__title">Quick Actions</h3>
          <div class="seller-actions__grid">
            <router-link to="/seller/product/add" class="seller-actions__card">
              <i class="fas fa-plus-circle"></i>
              <span>Add Product</span>
            </router-link>
            <router-link to="/seller/orders" class="seller-actions__card">
              <i class="fas fa-clipboard-list"></i>
              <span>Process Orders</span>
            </router-link>
            <router-link to="/seller/analytics" class="seller-actions__card">
              <i class="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </router-link>
            <router-link to="/seller/messages" class="seller-actions__card">
              <i class="fas fa-comment-dots"></i>
              <span>Messages</span>
            </router-link>
            <router-link to="/seller/promotions" class="seller-actions__card">
              <i class="fas fa-tags"></i>
              <span>Promotions</span>
            </router-link>
            <router-link to="/seller/settings" class="seller-actions__card">
              <i class="fas fa-cog"></i>
              <span>Settings</span>
            </router-link>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bento-table seller-table">
          <div class="seller-table__header">
            <h3>Recent Orders</h3>
            <router-link to="/seller/orders" class="seller-table__view-all">View All →</router-link>
          </div>
          <div class="seller-table__wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.customer_name || 'Customer' }}</td>
                  <td>{{ order.item_count || 1 }}</td>
                  <td>${{ order.total_amount }}</td>
                  <td>
                    <span :class="['badge', statusBadge(order.status)]">{{ order.status }}</span>
                  </td>
                  <td>
                    <router-link :to="`/seller/orders`" class="btn-link">View</router-link>
                  </td>
                </tr>
                <tr v-if="!recentOrders.length">
                  <td colspan="6" class="seller-table__empty">No orders yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="bento-alerts seller-alerts" v-if="lowStockProducts.length">
          <h3 class="seller-alerts__title">
            <i class="fas fa-exclamation-triangle" style="color: var(--warning)"></i>
            Low Stock Alerts
          </h3>
          <div class="seller-alerts__list">
            <div v-for="p in lowStockProducts" :key="p.id" class="seller-alerts__item">
              <div class="seller-alerts__item-img">
                <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" />
                <div v-else class="seller-alerts__item-placeholder">{{ (p.name || '?')[0] }}</div>
              </div>
              <div class="seller-alerts__item-info">
                <span class="seller-alerts__item-name">{{ p.name }}</span>
                <span class="seller-alerts__item-stock">Stock: {{ p.stock }}</span>
              </div>
              <router-link :to="`/seller/inventory`" class="btn-link">Restock →</router-link>
            </div>
          </div>
        </div>
      </BentoGrid>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'
import BentoGrid from '@/components/seller/BentoGrid.vue'
import StatCard from '@/components/seller/StatCard.vue'
import SalesChart from '@/components/seller/SalesChart.vue'

const userStore = useUserStore()
const stats = ref({ products: 0, orders: 0, revenue: '0.00', sales: 0, rating: '4.8', reviewCount: 0 })
const recentOrders = ref([])
const lowStockProducts = ref([])
const loading = ref(true)
const chartRange = ref('30D')

const lowStockCount = computed(() => lowStockProducts.value.length)

// Generate chart data (placeholder — replace with real data)
const chartData = computed(() => {
  const days = chartRange.value === '7D' ? 7 : chartRange.value === '90D' ? 12 : 10
  const labels = chartRange.value === '7D'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => `W${i + 1}`)
  return labels.map((label, i) => ({
    label,
    value: Math.floor(Math.random() * 5000) + 500 + (i * 200)
  }))
})

function statusBadge(status) {
  const map = {
    pending: 'badge-warning',
    paid: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error'
  }
  return map[(status || '').toLowerCase()] || 'badge-info'
}

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
        supabase.from('orders').select('id, total_amount, status, created_at').eq('seller_id', seller.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id, name, image, stock').eq('seller_id', seller.id)
      ])

      stats.value.orders = ordersRes.data?.length || 0
      stats.value.products = productsRes.data?.length || 0
      stats.value.revenue = (ordersRes.data || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toFixed(2)
      stats.value.sales = stats.value.orders
      recentOrders.value = ordersRes.data || []
      lowStockProducts.value = (productsRes.data || []).filter(p => p.stock !== null && p.stock < 5)
    }
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.seller-dashboard { max-width: 1200px; margin: 0 auto; }
.seller-dashboard__header { margin-bottom: 24px; }
.seller-dashboard__header h1 { margin: 0; }
.seller-dashboard__loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 0; color: var(--neutral-500, #888);
}
.spinner {
  width: 24px; height: 24px;
  border: 3px solid var(--neutral-200, #E7E7E7);
  border-top-color: var(--brand-primary, var(--brand-primary, #FF9900));
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Quick Actions */
.seller-actions {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.seller-actions__title { margin: 0 0 16px; font-size: var(--text-md, 16px); }
.seller-actions__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.seller-actions__card {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 16px;
  background: var(--neutral-50, #FAFAFA);
  border-radius: var(--radius-md, 8px);
  text-decoration: none; color: var(--neutral-700, #565959);
  transition: all var(--ease-normal, 0.2s ease);
  font-size: var(--text-sm, 13px); font-weight: 500;
}
.seller-actions__card:hover {
  background: var(--brand-primary-light, #FFF4E6);
  color: var(--brand-primary-hover, #E68A00);
}
.seller-actions__card i { font-size: 22px; }

/* Orders Table */
.seller-table {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.seller-table__header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.seller-table__header h3 { margin: 0; }
.seller-table__view-all {
  font-size: var(--text-sm, 13px); font-weight: 500;
  color: var(--brand-accent, var(--brand-accent, #007185)); text-decoration: none;
}
.seller-table__wrap { overflow-x: auto; }
.seller-table__empty {
  text-align: center; padding: 24px;
  color: var(--neutral-500, #888);
}
.badge {
  display: inline-block; padding: 2px 8px; border-radius: 9999px;
  font-size: 11px; font-weight: 600;
}
.badge-warning { background: var(--warning-bg, #FEF3C7); color: var(--warning, #B45309); }
.badge-info { background: var(--info-bg, #E0F2F5); color: var(--info, var(--brand-accent, #007185)); }
.badge-primary { background: var(--brand-primary-light, #FFF4E6); color: var(--brand-primary-hover, #E68A00); }
.badge-success { background: var(--success-bg, #E6F7F2); color: var(--success, #067D62); }
.badge-error { background: var(--error-bg, #FEE2E9); color: var(--error, #CC0C39); }
.btn-link {
  font-size: var(--text-sm, 13px); font-weight: 500;
  color: var(--brand-accent, var(--brand-accent, #007185)); text-decoration: none;
}
.btn-link:hover { text-decoration: underline; }

/* Low Stock Alerts */
.seller-alerts {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--warning-border, #FDE68A);
}
.seller-alerts__title {
  display: flex; align-items: center; gap: 8px;
  margin: 0 0 16px; font-size: var(--text-md, 16px);
}
.seller-alerts__list { display: flex; flex-direction: column; gap: 12px; }
.seller-alerts__item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; background: var(--neutral-50, #FAFAFA);
  border-radius: var(--radius-md, 8px);
}
.seller-alerts__item-img { width: 44px; height: 44px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: var(--neutral-200, #E7E7E7); }
.seller-alerts__item-img img { width: 100%; height: 100%; object-fit: cover; }
.seller-alerts__item-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--neutral-500, #888);
}
.seller-alerts__item-info { flex: 1; min-width: 0; }
.seller-alerts__item-name { display: block; font-weight: 500; font-size: var(--text-base, 14px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.seller-alerts__item-stock { font-size: var(--text-xs, 12px); color: var(--error, #CC0C39); font-weight: 600; }

/* Responsive */
@media (max-width: 639px) {
  .seller-actions__grid { grid-template-columns: repeat(2, 1fr); }
  .seller-alerts__item { padding: 8px; }
}
</style>
