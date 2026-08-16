<template>
  <div class="comparison-page">
    <div class="container">
      <h1><i class="fas fa-balance-scale"></i> Product Comparison</h1>
      <div v-if="products.length === 0" class="empty-state">
        <i class="fas fa-balance-scale"></i>
        <p>No products to compare. Add products from the product page.</p>
        <router-link to="/commodity" class="btn-primary">Browse Products</router-link>
      </div>
      <div v-else class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th v-for="p in products" :key="p.id">
                <div class="comp-product">
                  <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" />
                  <div v-else class="img-placeholder">{{ p.name[0] }}</div>
                  <button class="remove-btn" @click="removeProduct(p.id)" title="Remove"><i class="fas fa-times"></i></button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Name</td><td v-for="p in products" :key="p.id"><strong>{{ p.name }}</strong></td></tr>
            <tr><td>Price</td><td v-for="p in products" :key="p.id" class="price">${{ p.price }}</td></tr>
            <tr><td>Original Price</td><td v-for="p in products" :key="p.id"><span v-if="p.original_price" class="original">${{ p.original_price }}</span><span v-else>-</span></td></tr>
            <tr><td>Discount</td><td v-for="p in products" :key="p.id"><span v-if="p.discount" class="discount">-{{ p.discount }}%</span><span v-else>-</span></td></tr>
            <tr><td>Rating</td><td v-for="p in products" :key="p.id"><span class="stars"><i v-for="i in 5" :key="i" :class="i <= Math.round(p.rating||0) ? 'fas fa-star' : 'far fa-star'"></i></span> {{ p.rating || 0 }}</td></tr>
            <tr><td>Reviews</td><td v-for="p in products" :key="p.id">{{ p.review_count || 0 }}</td></tr>
            <tr><td>Sales</td><td v-for="p in products" :key="p.id">{{ formatNumber(p.sales_count) }}</td></tr>
            <tr><td>Stock</td><td v-for="p in products" :key="p.id"><span :class="p.stock > 0 ? 'in-stock' : 'out-stock'">{{ p.stock > 0 ? p.stock + ' available' : 'Out of stock' }}</span></td></tr>
            <tr><td>Description</td><td v-for="p in products" :key="p.id" class="desc-cell">{{ truncate(p.description, 150) || '-' }}</td></tr>
            <tr><td>Action</td><td v-for="p in products" :key="p.id"><router-link :to="`/product/${p.id}`" class="btn-primary" style="font-size:0.75rem;padding:0.375rem 0.75rem">View Product</router-link></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])

const formatNumber = (n) => { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'w'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n) }
const truncate = (s, l) => { if (!s || s.length <= l) return s; return s.substring(0, l) + '...' }

const removeProduct = (id) => { products.value = products.value.filter(p => p.id !== id); saveToStorage() }

const saveToStorage = () => {
  try { localStorage.setItem('comparison', JSON.stringify(products.value.map(p => p.id))) } catch (e) { console.warn("[Comparison] Error:", e.message) }
}

onMounted(async () => {
  try {
    const ids = JSON.parse(localStorage.getItem('comparison') || '[]')
    if (ids.length > 0) {
      const { data } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true)
      products.value = data || []
    }
  } catch (e) { console.warn("[Comparison] Error:", e.message) }
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
h1 { font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
h1 i { color: var(--brand-primary); }
.comparison-table-wrapper { overflow-x: auto; }
.comparison-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); }
.comparison-table th, .comparison-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 0.8125rem; vertical-align: top; }
.comparison-table th { background: #f8f9fa; font-weight: 600; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; }
.comparison-table th:first-child { min-width: 120px; }
.comp-product { position: relative; }
.comp-product img { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.img-placeholder { width: 80px; height: 80px; background: #f0f0f0; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ccc; }
.remove-btn { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: var(--danger); color: #fff; border: none; border-radius: 50%; cursor: pointer; font-size: 0.625rem; display: flex; align-items: center; justify-content: center; }
.price { font-weight: 700; color: var(--brand-primary); font-size: 1rem; }
.original { text-decoration: line-through; color: var(--text-muted); }
.discount { background: var(--danger); color: #fff; padding: 1px 4px; border-radius: 2px; font-size: 0.6875rem; font-weight: 600; }
.stars { color: #FF9900; font-size: 0.625rem; margin-right: 4px; }
.in-stock { color: var(--success); }
.out-stock { color: var(--danger); }
.desc-cell { max-width: 200px; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; }
.empty-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); }
.empty-state i { font-size: 3rem; color: #ddd; margin-bottom: 1rem; display: block; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem; }
  .card { padding: 1rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .form-group input { font-size: 16px; }
  .btn-primary { padding: 0.5rem 1rem; font-size: 0.8125rem; }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .fc-img { height: 100px; }
}

</style>
