<template>
  <div class="search-page">
    <div class="container">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input v-model="query" type="text" :placeholder="'Search products...'" @keyup.enter="doSearch" autofocus>
          <button @click="doSearch" class="btn-search">Search</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="search-filters">
        <div class="filter-tags">
          <button :class="{ active: sort === 'popular' }" @click="sort = 'popular'; doSearch()">Popular</button>
          <button :class="{ active: sort === 'newest' }" @click="sort = 'newest'; doSearch()">Newest</button>
          <button :class="{ active: sort === 'price' }" @click="sort = 'price'; doSearch()">Price ↑</button>
          <button :class="{ active: sort === 'sales' }" @click="sort = 'sales'; doSearch()">Best Selling</button>
        </div>
        <span class="result-count">{{ products.length }} results</span>
      </div>

      <!-- Results -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 12" :key="i" class="skeleton-card"></div>
      </div>

      <div v-else-if="products.length" class="product-grid">
        <div v-for="p in products" :key="p.id" class="product-card" @click="$router.push(`/product/${p.id}`)">
          <div class="card-img">
            <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" loading="lazy">
            <div v-else class="img-placeholder">{{ p.name?.[0] || '?' }}</div>
            <span v-if="p.discount" class="badge-discount">-{{ p.discount }}%</span>
          </div>
          <div class="card-body">
            <div class="card-title">{{ p.name }}</div>
            <div class="card-price">${{ p.price }} <span v-if="p.original_price" class="original">${{ p.original_price }}</span></div>
            <div class="card-meta">
              <span class="rating"><i class="fas fa-star"></i> {{ p.rating || '4.5' }}</span>
              <span class="sold">{{ p.sales_count || 0 }} sold</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-search"></i>
        <p>No products found for "{{ query }}"</p>
        <button @click="query = ''; doSearch()" class="btn-outline">Clear Search</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchProducts } from '@/services/supabase'

const route = useRoute()
const query = ref(route.query.q || '')
const sort = ref('popular')
const products = ref([])
const loading = ref(true)

const doSearch = async () => {
  loading.value = true
  try {
    const { data } = await searchProducts(query.value, { sort: sort.value, limit: 40 })
    products.value = data || []
  } catch { products.value = [] }
  loading.value = false
}

onMounted(() => { doSearch() })
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.search-header { margin-bottom: 20px; }
.search-bar { display: flex; border: 2px solid var(--primary, #ee4d2d); border-radius: 4px; overflow: hidden; background: #fff; }
.search-bar i { padding: 12px 16px; color: #999; font-size: 16px; }
.search-bar input { flex: 1; padding: 12px; border: none; font-size: 15px; outline: none; }
.btn-search { padding: 12px 24px; background: var(--primary, #ee4d2d); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-search:hover { background: var(--primary-dark, #d73211); }
.search-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.filter-tags { display: flex; gap: 8px; }
.filter-tags button { padding: 6px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.filter-tags button.active { background: var(--primary, #ee4d2d); color: #fff; border-color: var(--primary, #ee4d2d); }
.filter-tags button:hover:not(.active) { border-color: var(--primary, #ee4d2d); color: var(--primary, #ee4d2d); }
.result-count { font-size: 13px; color: #999; }
.loading-state { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.skeleton-card { background: #f0f0f0; border-radius: 4px; aspect-ratio: 0.8; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.product-card { background: #fff; border-radius: 2px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.product-card:hover { border-color: var(--primary, #ee4d2d); box-shadow: 0 2px 8px rgba(238,77,45,0.12); transform: translateY(-1px); }
.card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-card:hover .card-img img { transform: scale(1.05); }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #ddd; background: linear-gradient(135deg, #f8f8f8, #eee); }
.badge-discount { position: absolute; top: 0; left: 0; background: var(--primary, #ee4d2d); color: #fff; padding: 2px 4px; font-size: 11px; font-weight: 700; }
.card-body { padding: 8px 10px 10px; }
.card-title { font-size: 13px; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 36px; margin-bottom: 6px; }
.card-price { font-size: 16px; font-weight: 700; color: var(--primary, #ee4d2d); margin-bottom: 4px; }
.card-price .original { font-size: 12px; color: #999; text-decoration: line-through; font-weight: 400; margin-left: 4px; }
.card-meta { display: flex; justify-content: space-between; font-size: 11px; color: #999; }
.card-meta .rating { color: #ffc107; }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 12px; display: block; }
.empty-state p { margin-bottom: 20px; font-size: 16px; }
@media (max-width: 768px) { .product-grid, .loading-state { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 480px) { .product-grid, .loading-state { grid-template-columns: repeat(2, 1fr); } .filter-tags { overflow-x: auto; } }
</style>
