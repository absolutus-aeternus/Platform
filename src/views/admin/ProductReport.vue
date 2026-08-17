<template>
  <div class="admin-report">
    <div class="page-header"><h1>Product Report</h1></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon" style="background:#FF9900"><i class="fas fa-box"></i></div><div><h3>{{ products.length }}</h3><p>Total Products</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#4ecdc4"><i class="fas fa-check-circle"></i></div><div><h3>{{ products.filter(p=>p.status==='active').length }}</h3><p>Active</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#ffc107"><i class="fas fa-star"></i></div><div><h3>{{ topRated.length }}</h3><p>Top Rated (4.5+)</p></div></div>
      <div class="stat-card"><div class="stat-icon" style="background:#96ceb4"><i class="fas fa-fire"></i></div><div><h3>{{ bestSellers.length }}</h3><p>Best Sellers (1000+)</p></div></div>
    </div>
    <div class="grid-2">
      <div class="card"><h2>Top Selling Products</h2><table><thead><tr><th>Product</th><th>Price</th><th>Sales</th><th>Revenue</th></tr></thead><tbody><tr v-for="p in bestSellers" :key="p.id"><td>{{ p.name?.substring(0,30) }}</td><td>${{ p.price }}</td><td>{{ p.sales_count }}</td><td>${{ (p.price * p.sales_count).toFixed(2) }}</td></tr></tbody></table></div>
      <div class="card"><h2>Products by Category</h2><div class="category-bars"><div v-for="c in categoryStats" :key="c.name" class="cat-bar"><div class="cat-info"><span>{{ c.name }}</span><span>{{ c.count }}</span></div><div class="cat-fill"><div class="cat-progress" :style="{ width: c.pct + '%', background: c.color || '#FF9900' }"></div></div></div></div></div>
    </div>
    <div class="card"><h2>All Products</h2>
      <div class="filters"><input v-model="search" placeholder="Search products..."><select v-model="statusFilter"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
      <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sales</th><th>Rating</th><th>Status</th></tr></thead><tbody><tr v-for="p in filtered" :key="p.id"><td>{{ p.name?.substring(0,35) }}</td><td>{{ p.categories?.name || '-' }}</td><td>${{ p.price }}</td><td>{{ p.stock || 0 }}</td><td>{{ p.sales_count || 0 }}</td><td>⭐ {{ p.rating || 0 }}</td><td><span class="status" :class="p.status">{{ p.status }}</span></td></tr></tbody></table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])
const loading = ref(true)
const categories = ref([])
const search = ref('')
const statusFilter = ref('')

const bestSellers = computed(() => [...products.value].sort((a,b) => (b.sales_count||0)-(a.sales_count||0)).slice(0,10))
const topRated = computed(() => products.value.filter(p => (p.rating||0) >= 4.5))
const categoryStats = computed(() => {
  const map = {}
  products.value.forEach(p => { const c = p.categories?.name || 'Uncategorized'; map[c] = (map[c]||0)+1 })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).map(([name, count]) => ({ name, count, pct: (count/max)*100, color: '#FF9900' })).sort((a,b) => b.count-a.count)
} catch (e) { console.error("ProductReport.vue error:", e) }
})
const filtered = computed(() => {
  let r = products.value
  if (search.value) r = r.filter(p => p.name?.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value) r = r.filter(p => p.status === statusFilter.value)
  return r
} catch (e) { console.error("ProductReport.vue error:", e) }
})

onMounted(async () => { try {
  const { data } = await supabase.from('products').select('*, categories(name)').order('sales_count', { ascending: false })
  products.value = data || []
} catch (e) { console.error("ProductReport.vue error:", e) }
})
</script>

<style scoped>
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 25px; }
.stat-card { background: #fff; padding: 20px; border-radius: 10px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.stat-card h3 { font-size: 22px; margin: 0 0 4px; }
.stat-card p { color: #999; font-size: 13px; margin: 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: #fff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px; }
.card h2 { margin: 0 0 20px; font-size: 18px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.status { padding: 3px 8px; border-radius: 10px; font-size: 12px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.category-bars { display: flex; flex-direction: column; gap: 12px; }
.cat-bar { }
.cat-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.cat-fill { height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.cat-progress { height: 100%; border-radius: 4px; transition: width 0.5s; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }

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
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
