<template>
  <div class="page-wrapper">
  <div class="admin-dashboard">
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-shimmer skeleton-title"></div>
      <div class="skeleton-stats-grid">
        <div class="skeleton-shimmer skeleton-stat"></div>
        <div class="skeleton-shimmer skeleton-stat"></div>
        <div class="skeleton-shimmer skeleton-stat"></div>
        <div class="skeleton-shimmer skeleton-stat"></div>
      </div>
      <div class="skeleton-shimmer skeleton-section"></div>
      <div class="skeleton-charts-row">
        <div class="skeleton-shimmer skeleton-chart"></div>
        <div class="skeleton-shimmer skeleton-chart-sm"></div>
      </div>
    </div>
    <div v-else>
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
    
    <!-- Rating Plus Stats -->
    <div class="rplus-stats-section">
      <h3 style="margin-bottom:12px;font-size:16px">⭐ Rating Plus Stats</h3>
      <div class="rplus-stats-grid">
        <div class="rplus-stat-card">
          <div class="rplus-stat-icon" style="background:rgba(255,77,0,.1);color:var(--brand-primary-hover, #E68A00)"><i class="fas fa-users"></i></div>
          <div><strong>{{ rplusStats.users }}</strong><small>R+ Users</small></div>
        </div>
        <div class="rplus-stat-card">
          <div class="rplus-stat-icon" style="background:rgba(0,230,138,.1);color:#00e68a"><i class="fas fa-check-circle"></i></div>
          <div><strong>{{ rplusStats.approved }}</strong><small>Approved</small></div>
        </div>
        <div class="rplus-stat-card">
          <div class="rplus-stat-icon" style="background:rgba(255,193,7,.1);color:var(--warning, #B45309)">⏳</div>
          <div><strong>{{ rplusStats.pending }}</strong><small>Pending</small></div>
        </div>
        <div class="rplus-stat-card">
          <div class="rplus-stat-icon" style="background:rgba(124,92,255,.1);color:#7c5cff"><i class="fas fa-comments"></i></div>
          <div><strong>{{ rplusStats.messages }}</strong><small>Messages</small></div>
        </div>
      </div>
      <div class="rplus-quick-links">
        <router-link to="/999/customer-service/999/rating-plus/users" class="rplus-link"><i class="fas fa-users-cog"></i> R+ User Management</router-link>
        <router-link to="/999/customer-service/999/rating-plus/chat" class="rplus-link"><i class="fas fa-headset"></i> R+ Live Chat</router-link>
        <a href="/ratingplus" target="_blank" class="rplus-link"><i class="fas fa-external-link-alt"></i> R+ Landing Page</a>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="quick-nav">
      <h3 style="margin-bottom:12px;font-size:16px">Quick Access</h3>
      <div class="quick-nav-grid">
        <router-link to="/999/customer-service/999/products" class="quick-nav-item"><i class="fas fa-box"></i><span>Products</span></router-link>
        <router-link to="/999/customer-service/999/orders" class="quick-nav-item"><i class="fas fa-shopping-cart"></i><span>Orders</span></router-link>
        <router-link to="/999/customer-service/999/categories" class="quick-nav-item"><i class="fas fa-tags"></i><span>Categories</span></router-link>
        <router-link to="/999/customer-service/999/sellers" class="quick-nav-item"><i class="fas fa-store"></i><span>Sellers</span></router-link>
        <router-link to="/999/customer-service/999/customers" class="quick-nav-item"><i class="fas fa-users"></i><span>Customers</span></router-link>
        <router-link to="/999/customer-service/999/transactions" class="quick-nav-item"><i class="fas fa-exchange-alt"></i><span>Transactions</span></router-link>
        <router-link to="/999/customer-service/999/wallets" class="quick-nav-item"><i class="fas fa-wallet"></i><span>Wallets</span></router-link>
        <router-link to="/999/customer-service/999/withdrawals" class="quick-nav-item"><i class="fas fa-money-bill-wave"></i><span>Withdrawals</span></router-link>
        <router-link to="/999/customer-service/999/recharges" class="quick-nav-item"><i class="fas fa-credit-card"></i><span>Recharges</span></router-link>
        <router-link to="/999/customer-service/999/banners" class="quick-nav-item"><i class="fas fa-image"></i><span>Banners</span></router-link>
        <router-link to="/999/customer-service/999/coupons" class="quick-nav-item"><i class="fas fa-ticket-alt"></i><span>Coupons</span></router-link>
        <router-link to="/999/customer-service/999/notifications" class="quick-nav-item"><i class="fas fa-bell"></i><span>Notifications</span></router-link>
        <router-link to="/999/customer-service/999/chat" class="quick-nav-item"><i class="fas fa-comments"></i><span>Live Chat</span></router-link>
        <router-link to="/999/customer-service/999/messages" class="quick-nav-item"><i class="fas fa-envelope"></i><span>Messages</span></router-link>
        <router-link to="/999/customer-service/999/reports/sales" class="quick-nav-item"><i class="fas fa-chart-line"></i><span>Sales Report</span></router-link>
        <router-link to="/999/customer-service/999/reports/products" class="quick-nav-item"><i class="fas fa-chart-bar"></i><span>Product Report</span></router-link>
        <router-link to="/999/customer-service/999/reports/customers" class="quick-nav-item"><i class="fas fa-chart-pie"></i><span>Customer Report</span></router-link>
        <router-link to="/999/customer-service/999/settings" class="quick-nav-item"><i class="fas fa-cog"></i><span>Settings</span></router-link>
        <router-link to="/999/customer-service/999/blockchain" class="quick-nav-item"><i class="fas fa-link"></i><span>Blockchain</span></router-link>
        <router-link to="/999/customer-service/999/scraper" class="quick-nav-item"><i class="fas fa-spider"></i><span>Scraper</span></router-link>
        <router-link to="/999/customer-service/999/logs" class="quick-nav-item"><i class="fas fa-file-alt"></i><span>Logs</span></router-link>
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
        <div style="overflow-x:auto;"><table>
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
        </table></div>
      </div>
      <div class="table-card">
        <h3>Top Products</h3>
        <div style="overflow-x:auto;"><table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Sales</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in topProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.store }}</td>
              <td>{{ product.sales }}</td>
              <td>${{ product.revenue }}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>

    <!-- Top Sellers & Latest Reviews -->
    <div class="tables-row">
      <div class="table-card">
        <h3>Top Sellers</h3>
        <div style="overflow-x:auto;"><table>
          <thead>
            <tr><th>Seller</th><th>Products</th><th>Sales</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in topSellers" :key="s.id">
              <td><strong>{{ s.name }}</strong></td>
              <td>{{ s.products }}</td>
              <td>{{ s.sales }}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
      <div class="table-card">
        <h3>Latest Reviews</h3>
        <div style="overflow-x:auto;"><table>
          <thead>
            <tr><th>User</th><th>Product</th><th>Rating</th><th>Comment</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in latestReviews" :key="r.id">
              <td>{{ r.user }}</td>
              <td>{{ r.product }}</td>
              <td>{{ '⭐'.repeat(r.rating) }}</td>
              <td>{{ r.comment }}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { fetchRplusStats } from '@/services/rplus'

const loading = ref(true)
const stats = ref([
  { label: 'Total Revenue', value: '$0', icon: 'fas fa-dollar-sign', color: 'var(--brand-primary, #FF9900)', change: '', trend: 'up' },
  { label: 'Total Orders', value: '0', icon: 'fas fa-shopping-cart', color: '#4ecdc4', change: '', trend: 'up' },
  { label: 'Total Users', value: '0', icon: 'fas fa-users', color: '#45b7d1', change: '', trend: 'up' },
  { label: 'Total Products', value: '0', icon: 'fas fa-box', color: '#96ceb4', change: '', trend: 'up' },
  { label: 'Total Sellers', value: '0', icon: 'fas fa-store', color: '#feca57', change: '', trend: 'up' },
  { label: 'Total Categories', value: '0', icon: 'fas fa-th-large', color: '#ff9ff3', change: '', trend: 'up' },
  { label: 'Total Reviews', value: '0', icon: 'fas fa-star', color: '#ffa502', change: '', trend: 'up' },
  { label: 'Wallet Balance', value: '$0', icon: 'fas fa-wallet', color: '#2ed573', change: '', trend: 'up' },
])

const rplusStats = ref({ users: 0, approved: 0, pending: 0, messages: 0 })

const revenueData = ref([])
const orderStatus = ref([])
const recentOrders = ref([])
const topProducts = ref([])
const latestReviews = ref([])
const topSellers = ref([])

onMounted(async () => {
  // Fetch all real data from Supabase
  const [ordersRes, productsRes, usersRes, sellersRes, catsRes, evalsRes, walletsRes] = await Promise.all([
    supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false }).limit(500),
    supabase.from('products').select('*, sellers(name)').order('sales_count', { ascending: false }).limit(10),
    supabase.from('users').select('id, role, created_at'),
    supabase.from('sellers').select('*').order('sales_count', { ascending: false }),
    supabase.from('categories').select('*'),
    supabase.from('evaluations').select('*, users(email), products(name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('wallets').select('balance, frozen_balance, pending_balance'),
  ])

  const orders = ordersRes.data || []
  const products = productsRes.data || []
  const users = usersRes.data || []
  const sellers = sellersRes.data || []
  const categories = catsRes.data || []
  const evaluations = evalsRes.data || []
  const wallets = walletsRes.data || []

  // Calculate real stats
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  const totalWallet = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0)
  const totalOrders = orders.length

  stats.value[0].value = '$' + totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })
  stats.value[1].value = String(totalOrders)
  stats.value[2].value = String(users.length)
  stats.value[3].value = String(products.length)
  stats.value[4].value = String(sellers.length)
  stats.value[5].value = String(categories.length)
  stats.value[6].value = String(evaluations.length)
  stats.value[7].value = '$' + totalWallet.toLocaleString('en-US', { minimumFractionDigits: 2 })

  // Recent orders
  recentOrders.value = orders.map(o => ({
    id: o.id,
    order_no: o.order_no,
    customer: o.users?.email || 'N/A',
    amount: o.total_amount,
    status: o.status
  }))

  // Top products
  topProducts.value = products.map(p => ({
    id: p.id,
    name: p.name?.substring(0, 30),
    sales: p.sales_count || 0,
    revenue: ((p.sales_count || 0) * (p.price || 0)).toFixed(2),
    store: p.sellers?.name || 'N/A'
  }))

  // Top sellers
  topSellers.value = sellers.slice(0, 5).map(s => ({
    id: s.id,
    name: s.name,
    products: s.goods_count || 0,
    sales: s.sales_count || 0,
    revenue: ((s.sales_count || 0) * 10).toFixed(2)
  }))

  // Latest reviews
  latestReviews.value = evaluations.map(e => ({
    id: e.id,
    user: e.users?.email || 'Anonymous',
    product: e.products?.name?.substring(0, 25) || 'N/A',
    rating: e.rating || 5,
    comment: e.comment?.substring(0, 60) || ''
  }))

  // Revenue chart (from orders by month)
  const monthData = Array(12).fill(0)
  orders.forEach(o => {
    const m = new Date(o.created_at).getMonth()
    monthData[m] += parseFloat(o.total_amount || 0)
  })
  const maxRev = Math.max(...monthData, 1)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  revenueData.value = months.map((m, i) => ({
    month: m,
    value: Math.round(monthData[i]),
    height: Math.round((monthData[i] / maxRev) * 100),
    color: 'var(--brand-primary, #FF9900)'
  }))

  // Order status breakdown
  const statusMap = {}
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
  const statusColors = { pending: 'var(--warning, #B45309)', shipped: '#17a2b8', completed: 'var(--success, #067D62)', cancelled: 'var(--error, #CC0C39)', paid: '#6c5ce7' }
  orderStatus.value = Object.entries(statusMap).map(([label, count]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    percentage: Math.round((count / Math.max(totalOrders, 1)) * 100),
    color: statusColors[label] || '#999'
  }))
  if (orderStatus.value.length === 0) {
    orderStatus.value = [{ label: 'No Orders', percentage: 100, color: '#ddd' }]
  }

  // Fetch Rating Plus stats
  try {
    const rpStats = await fetchRplusStats()
    rplusStats.value = rpStats
  } catch (e) { console.warn('[Admin] R+ stats fetch failed:', e.message) }

  loading.value = false
})


</script>

<style scoped>
.skeleton-wrapper { padding: 0; }
.skeleton-title { height: 28px; width: 160px; border-radius: 6px; margin-bottom: 24px; }
.skeleton-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.skeleton-stat { height: 90px; border-radius: 8px; }
.skeleton-section { height: 120px; border-radius: 12px; margin-bottom: 24px; }
.skeleton-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
.skeleton-chart { height: 250px; border-radius: 8px; }
.skeleton-chart-sm { height: 250px; border-radius: 8px; }
.skeleton-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

header { z-index: 2; }
h1 { margin-bottom: 25px; }

/* Rating Plus Stats */
.rplus-stats-section { background: linear-gradient(135deg, #0f0f1a, #1a1a2e); padding: 20px; border-radius: 12px; margin-bottom: 25px; color: #fff; }
.rplus-stats-section h3 { color: #fff; }
.rplus-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.rplus-stat-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 14px; display: flex; align-items: center; gap: 12px; }
.rplus-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.rplus-stat-card strong { display: block; font-size: 1.25rem; font-weight: 800; }
.rplus-stat-card small { font-size: .7rem; color: rgba(255,255,255,.5); }
.rplus-quick-links { display: flex; gap: 10px; flex-wrap: wrap; }
.rplus-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(255,77,0,.15); border: 1px solid rgba(255,77,0,.25); border-radius: 8px; color: #ff6b3d; text-decoration: none; font-size: .8rem; font-weight: 600; transition: all .2s; }
.rplus-link:hover { background: rgba(255,77,0,.25); transform: translateY(-1px); }
.quick-nav { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px; }
.quick-nav-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 10px; }
.quick-nav-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border-radius: 8px; text-decoration: none; color: #333; transition: all 0.2s; border: 1px solid #f0f0f0; }
.quick-nav-item:hover { background: var(--brand-primary, #FF9900); color: #fff; border-color: var(--brand-primary, #FF9900); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(254,44,85,0.3); }
.quick-nav-item i { font-size: 20px; }
.quick-nav-item span { font-size: 11px; text-align: center; white-space: nowrap; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 25px; }
.stat-card { background: #fff; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; }
.stat-info h3 { font-size: 24px; margin-bottom: 4px; }
.stat-info p { color: #666; font-size: 13px; }
.stat-change { margin-left: auto; font-size: 12px; font-weight: 600; }
.stat-change.up { color: var(--success, #067D62); }
.stat-change.down { color: var(--error, #CC0C39); }
.charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 25px; }
.chart-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.chart-card h3 { margin-bottom: 15px; font-size: 16px; }
.chart-bars { display: flex; align-items: flex-end; gap: 15px; height: 200px; padding: 0 10px; }
.chart-bar { flex: 1; border-radius: 4px 4px 0 0; position: relative; min-width: 40px; transition: height 0.5s; }
.bar-label { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666; white-space: nowrap; }
.bar-month { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: #999; }
.donut-chart { width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(var(--warning, #B45309) 0% 30%, #17a2b8 30% 75%, var(--success, #067D62) 75% 95%, var(--error, #CC0C39) 95% 100%); margin: 0 auto; }
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

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .rplus-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-nav-grid { grid-template-columns: repeat(5, 1fr); }
  .card { padding: 1rem; }
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  .rplus-stats-grid { grid-template-columns: 1fr; }
  .quick-nav-grid { grid-template-columns: repeat(3, 1fr); }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
