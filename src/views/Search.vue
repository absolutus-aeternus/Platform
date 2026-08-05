<template>
  <div class="search-page">
    <div class="container">
      <div class="search-header">
        <h1 v-if="query">Search results for "{{ query }}"</h1>
        <h1 v-else-if="category">Category Products</h1>
        <h1 v-else>All Products</h1>
        <p>{{ products.length }} products found</p>
      </div>
      
      <div class="filters">
        <button :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'; loadProducts()">Default</button>
        <button :class="{ active: sortBy === 'price' }" @click="sortBy = 'price'; loadProducts()">Price</button>
        <button :class="{ active: sortBy === 'sales' }" @click="sortBy = 'sales'; loadProducts()">Sales</button>
      </div>
      
      <div v-if="loading" class="loading">Loading products...</div>
      <div v-else-if="products.length === 0" class="empty">No products found</div>
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div class="product-image">
            <div class="img-placeholder">{{ product.name[0] }}</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="product-price">${{ product.price }}</div>
            <div class="product-sales">Sold {{ product.sales_count || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchProducts } from '@/services/supabase'

const route = useRoute()
const query = computed(() => route.query.q || '')
const category = computed(() => route.query.category || '')
const sortBy = ref('default')
const products = ref([])
const loading = ref(true)

const loadProducts = async () => {
  loading.value = true
  try {
    const params = { limit: 20 }
    if (query.value) params.search = query.value
    if (category.value) params.category = category.value
    if (sortBy.value === 'price') params.sort = 'price'
    if (sortBy.value === 'sales') params.sort = 'sales'
    
    const { data } = await fetchProducts(params)
    products.value = data || []
  } catch (e) {
    console.error('Failed to load products:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)
watch([query, category], loadProducts)
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.search-header { margin-bottom: 25px; }
.search-header h1 { font-size: 24px; }
.search-header p { color: #999; margin-top: 5px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.filters { display: flex; gap: 10px; margin-bottom: 25px; }
.filters button { padding: 8px 20px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.filters button.active { background: #fe2c55; color: #fff; border-color: #fe2c55; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.product-sales { color: #999; font-size: 12px; margin-top: 5px; }
</style>
