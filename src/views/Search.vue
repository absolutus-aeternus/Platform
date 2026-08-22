<template>
  <div class="search-page">
    <div class="container">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input v-model="query" type="text" placeholder="Search products..." @keyup.enter="doSearch" autofocus />
          <button @click="doSearch" class="btn-search">Search</button>
        </div>
      </div>

      <!-- Sort + Result Count -->
      <div class="search-filters">
        <div class="filter-tags">
          <button :class="{ active: sort === 'popular' }" @click="sort = 'popular'; doSearch()">Popular</button>
          <button :class="{ active: sort === 'newest' }" @click="sort = 'newest'; doSearch()">Newest</button>
          <button :class="{ active: sort === 'price' }" @click="sort = 'price'; doSearch()">Price ↑</button>
          <button :class="{ active: sort === 'sales' }" @click="sort = 'sales'; doSearch()">Best Selling</button>
        </div>
        <div class="filter-right">
          <span class="result-count">{{ products.length }} results</span>
          <button class="filter-mobile-btn" @click="showFilterSheet = true">
            <i class="fas fa-sliders-h"></i> Filter
          </button>
        </div>
      </div>

      <!-- Main Layout: Sidebar + Grid -->
      <div class="search-layout">
        <!-- Desktop Filter Sidebar -->
        <FilterSidebar
          :sections="filterSections"
          v-model="activeFilters"
        />

        <!-- Results -->
        <div class="search-results">
          <div v-if="loading" class="loading-state">
            <div v-for="i in 12" :key="i" class="skeleton-card"></div>
          </div>

          <div v-else-if="filteredProducts.length" class="product-grid">
            <ProductCard
              v-for="p in filteredProducts"
              :key="p.id"
              :product="p"
            />
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-search"></i>
            <p>No products found for "{{ query }}"</p>
            <button @click="query = ''; doSearch()" class="btn-outline">Clear Search</button>
          </div>

          <BasePagination
            v-if="totalPages > 1"
            v-model="page"
            :total="filteredProducts.length"
            :per-page="perPage"
          />
        </div>
      </div>

      <!-- Mobile Filter Sheet -->
      <FilterSheet
        v-model="showFilterSheet"
        :sections="filterSections"
        v-model:filters="activeFilters"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/product/ProductCard.vue'
import FilterSidebar from '@/components/layout/FilterSidebar.vue'
import FilterSheet from '@/components/layout/FilterSheet.vue'
import BasePagination from '@/components/base/BasePagination.vue'

const route = useRoute()
const query = ref(route.query.q || '')
const sort = ref('popular')
const products = ref([])
const loading = ref(true)
const page = ref(1)
const perPage = 20
const showFilterSheet = ref(false)
const activeFilters = ref({ brand: [], price: {}, rating: null, shipping: [] })

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'

const filterSections = [
  {
    key: 'brand',
    label: 'Brand',
    type: 'checkbox',
    options: [
      { label: 'Samsung', value: 'samsung' },
      { label: 'Apple', value: 'apple' },
      { label: 'Xiaomi', value: 'xiaomi' },
      { label: 'Sony', value: 'sony' },
      { label: 'Oppo', value: 'oppo' },
      { label: 'Huawei', value: 'huawei' },
    ]
  },
  {
    key: 'price',
    label: 'Price Range',
    type: 'range'
  },
  {
    key: 'rating',
    label: 'Rating',
    type: 'rating'
  },
  {
    key: 'shipping',
    label: 'Shipping',
    type: 'toggle',
    options: [
      { label: 'Free Shipping', value: 'free' },
      { label: 'Verified Seller', value: 'verified' },
    ]
  }
]

const filteredProducts = computed(() => {
  let result = [...products.value]

  // Brand filter
  const brands = activeFilters.value.brand || []
  if (brands.length > 0) {
    result = result.filter(p => {
      const name = (p.name || '').toLowerCase()
      return brands.some(b => name.includes(b))
    })
  }

  // Price filter
  const price = activeFilters.value.price || {}
  if (price.min !== undefined) result = result.filter(p => parseFloat(p.price) >= price.min)
  if (price.max !== undefined) result = result.filter(p => parseFloat(p.price) <= price.max)

  // Rating filter
  if (activeFilters.value.rating) {
    result = result.filter(p => (p.rating || 4) >= activeFilters.value.rating)
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))

const doSearch = async () => {
  loading.value = true
  page.value = 1
  try {
    if (!query.value.trim()) {
      const resp = await fetch(`${WORKER_URL}/api/products?sort=sales&limit=40`)
      const result = await resp.json()
      products.value = result.data || []
    } else {
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

// Update search when route query changes
watch(() => route.query.q, (newQ) => {
  if (newQ !== undefined) {
    query.value = newQ
    doSearch()
  }
})

onMounted(() => { doSearch() })
</script>

<style scoped>
.search-page { min-height: 60vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }

/* Search Header */
.search-header { margin-bottom: 16px; }
.search-bar {
  display: flex;
  border: 2px solid var(--brand-primary, #FF9900);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background: var(--white, #fff);
}
.search-bar i { padding: 12px 16px; color: var(--neutral-500, #888); font-size: 16px; flex-shrink: 0; }
.search-bar input {
  flex: 1; padding: 12px;
  border: none; font-size: 15px; outline: none; min-width: 0;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.btn-search {
  padding: 12px 24px;
  background: var(--brand-primary-hover, #E68A00);
  color: var(--white, #fff);
  border: none; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-search:hover { background: var(--brand-primary-dark, #CC7A00); }

/* Sort + Filter bar */
.search-filters {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; padding: 10px 16px;
  background: var(--white, #fff);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.filter-tags { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.filter-tags::-webkit-scrollbar { display: none; }
.filter-tags button {
  padding: 6px 16px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  background: var(--white, #fff);
  border-radius: var(--radius-full, 9999px);
  font-size: var(--text-sm, 13px);
  cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.filter-tags button.active {
  background: var(--brand-accent, #007185);
  color: var(--white, #fff);
  border-color: var(--brand-accent, #007185);
}
.filter-tags button:hover:not(.active) {
  border-color: var(--brand-accent, #007185);
  color: var(--brand-accent, #007185);
}
.filter-right { display: flex; align-items: center; gap: 12px; }
.result-count { font-size: var(--text-sm, 13px); color: var(--neutral-500, #888); white-space: nowrap; }
.filter-mobile-btn {
  display: none;
  padding: 6px 14px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-full, 9999px);
  background: var(--white, #fff);
  font-size: var(--text-sm, 13px);
  cursor: pointer;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* Layout: sidebar + grid */
.search-layout {
  display: flex;
  gap: 24px;
}
.search-results { flex: 1; min-width: 0; }

/* Loading */
.loading-state { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.skeleton-card {
  background: var(--neutral-100, #F5F5F5);
  border-radius: var(--radius-md, 8px);
  aspect-ratio: 0.8;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; color: var(--neutral-500, #888); }
.empty-state i { font-size: 48px; color: var(--neutral-300, #D5D9D9); margin-bottom: 16px; display: block; }
.empty-state p { font-size: 16px; margin-bottom: 20px; }
.btn-outline {
  padding: 10px 24px;
  background: var(--white, #fff);
  border: 1px solid var(--brand-accent, #007185);
  color: var(--brand-accent, #007185);
  border-radius: var(--radius-md, 8px);
  font-size: 14px; cursor: pointer; transition: all 0.2s;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.btn-outline:hover { background: var(--brand-accent, #007185); color: var(--white, #fff); }

/* Responsive */
@media (max-width: 1023px) {
  .search-layout { flex-direction: column; }
  .product-grid, .loading-state { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 767px) {
  .search-bar i { display: none; }
  .search-bar input { font-size: 16px; padding: 10px; }
  .btn-search { padding: 10px 16px; font-size: 14px; }
  .search-filters { flex-direction: column; gap: 10px; align-items: stretch; }
  .filter-right { justify-content: space-between; }
  .filter-mobile-btn { display: flex; align-items: center; gap: 6px; }
  .product-grid, .loading-state { grid-template-columns: repeat(2, 1fr); gap: 6px; }
}
@media (max-width: 480px) {
  .container { padding: 10px 8px; }
  .product-grid, .loading-state { grid-template-columns: repeat(2, 1fr); }
}
</style>
