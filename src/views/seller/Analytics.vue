<template>
  <div class="seller-analytics">
    <h1>Analytics</h1>

    <BentoGrid>
      <StatCard class="bento-stat" icon="fas fa-dollar-sign" label="Total Revenue" :value="'$' + stats.revenue" color="#067D62" />
      <StatCard class="bento-stat" icon="fas fa-shopping-cart" label="Total Orders" :value="String(stats.orders)" color="var(--brand-accent, #007185)" />
      <StatCard class="bento-stat" icon="fas fa-box" label="Total Products" :value="String(stats.products)" color="#B45309" />
      <StatCard class="bento-stat" icon="fas fa-chart-line" label="Total Sales" :value="String(stats.sales)" color="var(--brand-primary, #FF9900)" />

      <SalesChart class="bento-chart" title="Revenue Trend" :data="chartData" :active-range="chartRange" @range-change="chartRange = $event" />

      <div class="bento-table orders-section">
        <h2>Recent Orders</h2>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="recentOrders.length === 0" class="empty">No recent orders</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>#{{ order.order_no || order.id }}</td>
                <td>{{ order.users?.email || 'N/A' }}</td>
                <td>${{ order.total_amount }}</td>
                <td><span :class="['status', order.status]">{{ order.status }}</span></td>
                <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BentoGrid>
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
const stats = ref({ revenue: '0.00', orders: 0, products: 0, sales: 0 })
const recentOrders = ref([])
const loading = ref(true)
const chartRange = ref('30D')

const chartData = computed(() => {
  const days = chartRange.value === '7D' ? 7 : chartRange.value === '90D' ? 12 : 10
  const labels = chartRange.value === '7D'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({ length: days }, (_, i) => `W${i + 1}`)
  return labels.map((label, i) => ({
    label,
    value: Math.floor(Math.random() * 3000) + 300 + (i * 150)
  }))
})

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
.seller-analytics { max-width: 1200px; }
h1 { margin-bottom: 20px; }
.loading, .empty { text-align: center; padding: 40px; color: var(--neutral-500, #888); }

.orders-section {
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.orders-section h2 { margin: 0 0 16px; font-size: var(--text-md, 16px); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th {
  background: var(--neutral-50, #FAFAFA);
  font-weight: 600; font-size: var(--text-xs, 12px);
  text-transform: uppercase; color: var(--neutral-600, #666);
  padding: 10px 12px; text-align: left;
  border-bottom: 1px solid var(--neutral-200, #E7E7E7);
}
td { padding: 10px 12px; font-size: var(--text-sm, 13px); border-bottom: 1px solid var(--neutral-100, #F5F5F5); }
.status {
  display: inline-block; padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
  font-size: 11px; font-weight: 600;
}
.status.pending { background: var(--warning-bg, #FEF3C7); color: var(--warning, #B45309); }
.status.shipped { background: var(--info-bg, #E0F2F5); color: var(--info, var(--brand-accent, #007185)); }
.status.completed { background: var(--success-bg, #E6F7F2); color: var(--success, #067D62); }
</style>
