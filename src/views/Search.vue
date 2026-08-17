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
        <div v-for="p in products" :key="p.objectID || p.id" class="product-card" @click="$router.push(`/product/${p.objectID || p.id}`)">
          <div class="card-img">
            <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" loading="lazy">
            <div v-else class="img-placeholder">{{ p.name?.[0] || '?' }}</div>
            <span v-if="p.discount" class="badge-discount">-{{ p.discount }}%</span>
          </div>
          <div class="card-body">
            <div class="card-title" v-html="p._highlightResult?.name?.value || p.name"></div>
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

const route = useRoute()
const query = ref(route.query.q || '')
const sort = ref('popular')
const products = ref([])
const loading = ref(true)
const debounceTimer = ref(null)

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'

const doSearch = async () => {
  loading.value = true
  try {
    if (!query.value.trim()) {
      // Empty query → fetch popular products from Worker
      const resp = await fetch(`${WORKER_URL}/api/products?sort=sales&limit=40`)
      const result = await resp.json()
      products.value = result.data || []
    } else {
      // Use Algolia via Worker API
      const resp = await fetch(`${WORKER_URL}/api/search?q=${encodeURIComponent(query.value)}&limit=40`)
      const result = await resp.json()
      products.value = result.hits || []
    }
  } catch (e) {
    console.error('Search error:', e)
    products.value = []
  }
  loading.value = false
}

// Debounced search for auto-suggest
const debouncedSearch = () => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    doSearch()
  }, 300)
}

onMounted(() => {
  doSearch()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }

/* Search Header */
.search-header { margin-bottom: 20px; }
.search-bar { display: flex; border: 2px solid var(--primary, #FF9900); border-radius: 4px; overflow: hidden; background: #fff; }
.search-bar i { padding: 12px 16px; color: #999; font-size: 16px; flex-shrink: 0; }
.search-bar input { flex: 1; padding: 12px; border: none; font-size: 15px; outline: none; min-width: 0; }
.btn-search { padding: 12px 24px; background: var(--primary, #FF9900); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.btn-search:hover { background: var(--primary-dark, #e68a00); }

/* Filters */
.search-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.filter-tags { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.filter-tags::-webkit-scrollbar { display: none; }
.filter-tags button { padding: 6px 16px; border: 1px solid #ddd; background: #fff; border-radius: 20px; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.filter-tags button.active { background: var(--primary, #FF9900); color: #fff; border-color: var(--primary, #FF9900); }
.filter-tags button:hover:not(.active) { border-color: var(--primary, #FF9900); color: var(--primary, #FF9900); }
.result-count { font-size: 13px; color: #999; white-space: nowrap; flex-shrink: 0; margin-left: 12px; }

/* Loading State */
.loading-state { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.skeleton-card { background: #f0f0f0; border-radius: 4px; aspect-ratio: 0.8; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.product-card { background: #fff; border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.product-card:hover { border-color: var(--primary, #FF9900); box-shadow: 0 2px 8px rgba(238,77,45,0.12); transform: translateY(-1px); }

/* Card Image */
.card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.product-card:hover .card-img img { transform: scale(1.05); }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #ddd; background: linear-gradient(135deg, #f8f8f8, #eee); }
.badge-discount { position: absolute; top: 0; left: 0; background: var(--primary, #FF9900); color: #fff; padding: 2px 6px; font-size: 11px; font-weight: 700; z-index: 1; }

/* Card Body */
.card-body { padding: 8px 10px 10px; }
.card-title { font-size: 13px; color: #333; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 36px; margin-bottom: 6px; }
.product-card:hover .card-title { color: var(--primary, #FF9900); }
.card-price { font-size: 16px; font-weight: 700; color: var(--primary, #FF9900); margin-bottom: 4px; }
.card-price .original { font-size: 12px; color: #999; text-decoration: line-through; font-weight: 400; margin-left: 4px; }
.card-meta { display: flex; justify-content: space-between; font-size: 11px; color: #999; }
.card-meta .rating { color: #ffc107; }

/* Empty State */
.empty-state { text-align: center; padding: 60px 20px; color: #999; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 16px; display: block; }
.empty-state p { font-size: 16px; margin-bottom: 20px; }
.btn-outline { padding: 10px 24px; background: #fff; border: 1px solid var(--primary, #FF9900); color: var(--primary, #FF9900); border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: var(--primary, #FF9900); color: #fff; }

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .product-grid, .loading-state { grid-template-columns: repeat(4, 1fr); }
}

/* Responsive - Mobile Landscape */
@media (max-width: 768px) {
  .product-grid, .loading-state { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .search-filters { flex-direction: column; gap: 10px; align-items: stretch; }
  .filter-tags { padding-bottom: 4px; }
  .result-count { margin-left: 0; text-align: center; }
  .search-bar i { display: none; }
  .search-bar input { font-size: 16px; padding: 10px 12px; }
  .btn-search { padding: 10px 16px; font-size: 14px; }
  .card-body { padding: 6px 8px 8px; }
  .card-title { font-size: 12px; min-height: 32px; }
  .card-price { font-size: 14px; }
}

/* Responsive - Mobile Portrait */
@media (max-width: 480px) {
  .container { padding: 10px 8px; }
  .search-header { margin-bottom: 12px; }
  .search-bar { border-radius: 6px; }
  .search-bar input { font-size: 16px; padding: 10px; }
  .btn-search { padding: 10px 14px; font-size: 13px; }
  .search-filters { padding: 10px 12px; margin-bottom: 12px; }
  .filter-tags button { padding: 5px 12px; font-size: 12px; }
  .product-grid, .loading-state { grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .card-body { padding: 6px; }
  .card-title { font-size: 11px; min-height: 28px; margin-bottom: 4px; }
  .card-price { font-size: 13px; }
  .card-price .original { font-size: 11px; }
  .card-meta { font-size: 10px; }
  .img-placeholder { font-size: 28px; }
  .empty-state { padding: 40px 16px; }
  .empty-state i { font-size: 36px; }
  .empty-state p { font-size: 14px; }
  .btn-outline { padding: 8px 20px; font-size: 13px; }
}
</style>
