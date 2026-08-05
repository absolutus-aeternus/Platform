<template>
  <div class="admin-dashboard">
    <h1>Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
        <div class="stat-change" :class="stat.trend">
          <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ stat.change }}
        </div>
      </div>
    </div>
    
    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-card">
        <h3>Revenue Overview</h3>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div v-for="(bar, i) in revenueData" :key="i" class="chart-bar" :style="{ height: bar.height + '%', background: bar.color }">
              <span class="bar-label">${{ bar.value }}</span>
              <span class="bar-month">{{ bar.month }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <h3>Order Status</h3>
        <div class="chart-placeholder">
          <div class="donut-chart">
            <div class="donut-segment" v-for="seg in orderStatus" :key="seg.label" :style="{ '--percentage': seg.percentage, '--color': seg.color }">
              <span>{{ seg.label }}: {{ seg.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tables Row -->
    <div class="tables-row">
      <div class="table-card">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>{{ order.order_no }}</td>
              <td>{{ order.customer }}</td>
              <td>${{ order.amount }}</td>
              <td><span class="status" :class="order.status">{{ order.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-card">
        <h3>Top Products</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Sales</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in topProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.sales }}</td>
              <td>${{ product.revenue }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const stats = ref([
  { label: 'Total Revenue', value: '$0', icon: 'fas fa-dollar-sign', color: '#fe2c55', change: '12%', trend: 'up' },
  { label: 'Total Orders', value: '0', icon: 'fas fa-shopping-cart', color: '#4ecdc4', change: '8%', trend: 'up' },
  { label: 'Total Users', value: '0', icon: 'fas fa-users', color: '#45b7d1', change: '15%', trend: 'up' },
  { label: 'Total Products', value: '0', icon: 'fas fa-box', color: '#96ceb4', change: '5%', trend: 'down' },
])

const revenueData = ref([
  { month: 'Jan', value: 1200, height: 40, color: '#fe2c55' },
  { month: 'Feb', value: 1800, height: 60, color: '#fe2c55' },
  { month: 'Mar', value: 2400, height: 80, color: '#fe2c55' },
  { month: 'Apr', value: 3000, height: 100, color: '#fe2c55' },
  { month: 'May', value: 2100, height: 70, color: '#fe2c55' },
  { month: 'Jun', value: 2700, height: 90, color: '#fe2c55' },
])

const orderStatus = ref([
  { label: 'Pending', percentage: 30, color: '#ffc107' },
  { label: 'Shipped', percentage: 45, color: '#17a2b8' },
  { label: 'Completed', percentage: 20, color: '#28a745' },
  { label: 'Cancelled', percentage: 5, color: '#dc3545' },
])

const recentOrders = ref([])
const topProducts = ref([])

onMounted(async () => {
  const [orders, products, users] = await Promise.all([
    supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('*').order('sales_count', { ascending: false }).limit(5),
    supabase.from('users').select('id')
  ])
  
  recentOrders.value = (orders.data || []).map(o => ({
    id: o.id,
    order_no: o.order_no,
    customer: o.users?.email || 'N/A',
    amount: o.total_amount,
    status: o.status
  }))
  
  topProducts.value = (products.data || []).map(p => ({
    id: p.id,
    name: p.name?.substring(0, 30),
    sales: p.sales_count || 0,
    revenue: ((p.sales_count || 0) * (p.price || 0)).toFixed(2)
  }))
  
  stats.value[1].value = String(orders.data?.length || 0)
  stats.value[2].value = String(users.data?.length || 0)
  stats.value[3].value = String(products.data?.length || 0)
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; }
.stat-card { background: #fff; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; }
.stat-info h3 { font-size: 24px; margin-bottom: 4px; }
.stat-info p { color: #666; font-size: 13px; }
.stat-change { margin-left: auto; font-size: 12px; font-weight: 600; }
.stat-change.up { color: #28a745; }
.stat-change.down { color: #dc3545; }
.charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px; }
.chart-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.chart-card h3 { margin-bottom: 15px; font-size: 16px; }
.chart-bars { display: flex; align-items: flex-end; gap: 15px; height: 200px; padding: 0 10px; }
.chart-bar { flex: 1; border-radius: 4px 4px 0 0; position: relative; min-width: 40px; transition: height 0.5s; }
.bar-label { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; white-space: nowrap; }
.bar-month { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #999; }
.donut-chart { width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#ffc107 0% 30%, #17a2b8 30% 75%, #28a745 75% 95%, #dc3545 95% 100%); margin: 0 auto; }
.tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.table-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.table-card h3 { margin-bottom: 15px; font-size: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; text-transform: capitalize; }
.status.pending { background: #fff3cd; color: #856404; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.completed { background: #d4edda; color: #155724; }
.status.cancelled { background: #f8d7da; color: #721c24; }
</style>
