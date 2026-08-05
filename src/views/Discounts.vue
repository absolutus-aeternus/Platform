<template>
  <div class="discounts-page">
    <div class="container">
      <h1>🔥 Hot Deals</h1>
      <div v-if="loading" class="loading">Loading deals...</div>
      <div v-else-if="products.length === 0" class="empty">No deals available</div>
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div v-if="product.discount" class="discount-badge">-{{ product.discount }}%</div>
          <div class="product-image">
            <div class="img-placeholder">{{ product.name[0] }}</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="price-row">
              <span class="price">${{ product.price }}</span>
              <span v-if="product.original_price" class="original">${{ product.original_price }}</span>
            </div>
            <div class="product-sales">Sold {{ product.sales_count || 0 }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchProducts } from '@/services/supabase'

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await fetchProducts({ limit: 12, sort: 'sales' })
    products.value = (data || []).filter(p => p.discount > 0)
    if (products.value.length === 0) {
      products.value = data || []
    }
  } catch (e) {
    console.error('Failed to load deals:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); }
.discount-badge { position: absolute; top: 10px; left: 10px; background: #fe2c55; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; z-index: 1; }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price-row { margin-bottom: 5px; }
.price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.original { color: #999; text-decoration: line-through; font-size: 13px; margin-left: 8px; }
.product-sales { color: #999; font-size: 12px; }
</style>
