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
.search-header { margin-bottom: 20px; }
.search-bar { display: flex; border: 2px solid var(--primary, #FF9900); border-radius: 4px; overflow: hidden; background: #fff; }
.search-bar i { padding: 12px 16px; color: #999; font-size: 16px; }
.search-bar input { flex: 1; padding: 12px; border: none; font-size: 15px; outline: none; }
.btn-search { padding: 12px 24px; background: var(--primary, #FF9900); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-search:hover { background: var(--primary-dark, #e68a00); }
.search-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.filter-tags { display: flex; gap: 8px; }
.filter-tags button { padding: 6px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.filter-tags button.active { background: var(--primary, #FF9900); color: #fff; border-color: var(--primary, #FF9900); }
.filter-tags button:hover:not(.active) { border-color: var(--primary, #FF9900); color: var(--primary, #FF9900); }
.result-count { font-size: 13px; color: #999; }
.loading-state { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.skeleton-card { background: #f0f0f0; border-radius: 4px; aspect-ratio: 0.8; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.product-card { background: #fff; border-radius: 2px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.product-card:hover { border-color: var(--primary, #FF9900); box-shadow: 0 2px 8px rgba(238,77,45,0.12); transform: translateY(-1px); }
.card-img { position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
