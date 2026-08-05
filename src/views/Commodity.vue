<template>
  <div class="commodity-page">
    <div class="container">
      <div class="commodity-header">
        <h1>All Products</h1>
        <div class="filters">
          <select v-model="sortBy" @change="loadProducts">
            <option value="default">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="sales">Best Sellers</option>
            <option value="newest">Newest</option>
          </select>
          <select v-model="categoryFilter" @change="loadProducts">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div class="img-placeholder">{{ product.name[0] }}</div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="price">${{ product.price }}</div>
            <div class="sales">Sold {{ product.sales_count || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchProducts, fetchCategories } from '@/services/supabase'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const sortBy = ref('default')
const categoryFilter = ref('')

const loadProducts = async () => {
  loading.value = true
  const params = { limit: 40 }
  if (categoryFilter.value) params.category = categoryFilter.value
  if (sortBy.value === 'price_asc') params.sort = 'price'
  if (sortBy.value === 'sales') params.sort = 'sales'
  const { data } = await fetchProducts(params)
  products.value = data || []
  loading.value = false
}

onMounted(async () => {
  const { data: cats } = await fetchCategories()
  categories.value = cats || []
  await loadProducts()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.commodity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.filters { display: flex; gap: 10px; }
.filters select { padding: 8px 15px; border: 1px solid #ddd; border-radius: 4px; }
.loading { text-align: center; padding: 40px; color: #999; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.sales { color: #999; font-size: 12px; margin-top: 5px; }
</style>
