<template>
  <div class="page-wrapper">
  <div class="inventory">
    <h1>Inventory</h1>
    <div class="summary">
      <div class="summary-card">
        <h3>Total Products</h3>
        <p>{{ products.length }}</p>
      </div>
      <div class="summary-card">
        <h3>In Stock</h3>
        <p>{{ inStock }}</p>
      </div>
      <div class="summary-card">
        <h3>Low Stock</h3>
        <p>{{ lowStock }}</p>
      </div>
      <div class="summary-card">
        <h3>Out of Stock</h3>
        <p>{{ outOfStock }}</p>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!products.length" class="empty-state"><i class="fas fa-box"></i><p>No products in your inventory yet. Add your first product to get started!</p><router-link to="/seller/product/add" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px"><i class="fas fa-plus"></i> Add Product</router-link></div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>{{ p.name.substring(0, 40) }}...</td>
            <td>{{ p.sku || p.id }}</td>
            <td>{{ p.stock || 0 }}</td>
            <td>
              <span class="stock-status" :class="getStockClass(p.stock)">
                {{ getStockLabel(p.stock) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const products = ref([])
const loading = ref(true)

const inStock = computed(() => products.value.filter(p => p.stock > 10).length)
const lowStock = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 10).length)
const outOfStock = computed(() => products.value.filter(p => !p.stock || p.stock === 0).length)

const getStockClass = (stock) => {
  if (!stock || stock === 0) return 'out'
  if (stock <= 10) return 'low'
  return 'ok'
}
const getStockLabel = (stock) => {
  if (!stock || stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

onMounted(async () => { try {
  if (!userStore.supabaseUser) { loading.value = false; return }
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    const { data } = await supabase.from('products').select('*').eq('seller_id', seller.id)
    products.value = data || []
  }
} catch (e) { console.error("Inventory.vue error:", e) }
  loading.value = false
})


</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
.summary-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.summary-card h3 { color: #666; font-size: 14px; margin-bottom: 8px; }
.summary-card p { font-size: 24px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.loading { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
.stock-status { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.stock-status.ok { background: #d4edda; color: #155724; }
.stock-status.low { background: #fff3cd; color: #856404; }
.stock-status.out { background: #f8d7da; color: #721c24; } .empty-state { text-align: center; padding: 60px 16px; color: var(--text-muted, #999); } .empty-state i { font-size: 48px; color: var(--neutral-300, #ddd); margin-bottom: 16px; display: block; } .empty-state p { margin-bottom: 16px; font-size: 15px; }

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
