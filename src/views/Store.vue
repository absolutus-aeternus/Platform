<template>
  <div class="store-page">
    <div class="container">
      <div class="store-header">
        <div class="store-avatar">{{ store.name[0] }}</div>
        <div class="store-info">
          <h1>{{ store.name }}</h1>
          <p>Products: {{ store.products }} | Sales: {{ store.sales }}</p>
        </div>
        <button class="btn-follow">Follow</button>
      </div>
      
      <div class="store-tabs">
        <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All Products</button>
        <button :class="{ active: tab === 'recommended' }" @click="tab = 'recommended'">Recommend</button>
      </div>
      
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div class="img-placeholder">{{ product.name[0] }}</div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="price">${{ product.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('all')
const store = ref({ name: 'Dw專賣', products: 195, sales: '98,034' })
const products = ref([
  { id: 1, name: 'Product 1', price: '34.60' },
  { id: 2, name: 'Product 2', price: '27.34' },
  { id: 3, name: 'Product 3', price: '16.05' },
  { id: 4, name: 'Product 4', price: '35.87' },
])
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.store-header { display: flex; align-items: center; gap: 20px; padding: 30px; background: #fff; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.store-avatar { width: 80px; height: 80px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; }
.store-info h1 { font-size: 24px; margin-bottom: 5px; }
.store-info p { color: #666; }
.btn-follow { margin-left: auto; padding: 10px 30px; border: 2px solid #fe2c55; color: #fe2c55; background: none; border-radius: 25px; font-size: 16px; cursor: pointer; }
.store-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.store-tabs button { padding: 10px 25px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.store-tabs button.active { background: #fe2c55; color: #fff; border-color: #fe2c55; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; }
.price { color: #fe2c55; font-size: 18px; font-weight: 700; }
</style>
