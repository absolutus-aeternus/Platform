<template><div class="page-wrapper">
  <div class="commodity-page">
    <div class="container">
      <h1 class="page-title">All Products</h1>

      <div class="filters">
        <div class="filter-row">
          <div class="cat-filter">
            <button :class="{ active: !activeCat }" @click="activeCat = null">All</button>
            <button v-for="cat in categories" :key="cat.id" :class="{ active: activeCat === cat.id }" @click="activeCat = cat.id">{{ cat.name }}</button>
          </div>
          <div class="sort-filter">
            <select v-model="sort">
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="product-grid">
        <div v-for="i in 20" :key="i" class="skeleton-card"></div>
      </div>

      <div v-else-if="filteredProducts.length" class="product-grid">
        <ProductCard
          v-for="p in filteredProducts"
          :key="p.id"
          :product="p"
        />
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>No products found</p>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchProducts, fetchCategories } from '@/services/supabase'
import ProductCard from '@/components/product/ProductCard.vue'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const activeCat = ref(null)
const sort = ref('popular')

const filteredProducts = computed(() => {
  let result = [...products.value]
  if (activeCat.value) result = result.filter(p => String(p.category_id) === String(activeCat.value))
  if (sort.value === 'price') result.sort((a, b) => a.price - b.price)
  if (sort.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  if (sort.value === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  return result
})

onMounted(async () => {
  try {
    const [catRes, prodRes] = await Promise.all([fetchCategories(), fetchProducts({ limit: 100 })])
    categories.value = catRes.data || []
    products.value = prodRes.data || []
  } catch (e) { console.error('Failed:', e) }
  loading.value = false
})</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchProducts, fetchCategories } from '@/services/supabase'
import ProductCard from '@/components/product/ProductCard.vue'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const activeCat = ref(null)
const sort = ref('popular')

const filteredProducts = computed(() => {
  let result = [...products.value]
  if (activeCat.value) result = result.filter(p => String(p.category_id) === String(activeCat.value))
  if (sort.value === 'price') result.sort((a, b) => a.price - b.price)
  if (sort.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  if (sort.value === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  return result
})

onMounted(async () => {
  try {
    const [catRes, prodRes] = await Promise.all([fetchCategories(), fetchProducts({ limit: 100 })])
    categories.value = catRes.data || []
    products.value = prodRes.data || []
  } catch (e) { console.error('Failed:', e) }
  loading.value = false
})
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #222; }
.filters { background: #fff; padding: 12px 16px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); margin-bottom: 16px; }
.filter-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.cat-filter { display: flex; gap: 8px; flex-wrap: wrap; }
.cat-filter button { padding: 6px 14px; border: 1px solid #ddd; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.cat-filter button.active { background: var(--brand-primary, #FF9900); color: #fff; border-color: var(--brand-primary, #FF9900); }
.cat-filter button:hover:not(.active) { border-color: var(--brand-primary, #FF9900); color: var(--brand-primary, #FF9900); }
.sort-filter select { padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; cursor: pointer; }
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.skeleton-card { background: #f0f0f0; border-radius: 4px; aspect-ratio: 0.8; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.product-card { background: #fff; border-radius: 2px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.product-card:hover { border-color: var(--brand-primary, #FF9900); box-shadow: 0 2px 8px rgba(238,77,45,0.12); transform: translateY(-1px); }
.card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-card:hover .card-img img { transform: scale(1.05); }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #ddd; background: linear-gradient(135deg, #f8f8f8, #eee); }
.badge-discount { position: absolute; top: 0; left: 0; background: var(--brand-primary, #FF9900); color: #fff; padding: 2px 4px; font-size: 11px; font-weight: 700; }
.card-body { padding: 8px 10px 10px; }
.card-title { font-size: 13px; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 36px; margin-bottom: 6px; }
.card-price { font-size: 16px; font-weight: 700; color: var(--brand-primary, #FF9900); margin-bottom: 4px; }
.card-price .original { font-size: 12px; color: #999; text-decoration: line-through; font-weight: 400; margin-left: 4px; }
.card-meta { display: flex; justify-content: space-between; font-size: 11px; color: #999; }
.card-meta .rating { color: var(--warning, #B45309); }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 12px; display: block; }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(3, 1fr); } .filter-row { flex-direction: column; align-items: flex-start; } }
@media (max-width: 480px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
