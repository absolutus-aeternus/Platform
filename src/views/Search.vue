<template>
  <div class="search-page">
    <div class="container">
      <div class="search-header">
        <h1 v-if="query">Search results for "{{ query }}"</h1>
        <h1 v-else>All Products</h1>
        <p>{{ products.length }} products found</p>
      </div>
      
      <div class="filters">
        <button :class="{ active: sortBy === 'default' }" @click="sortBy = 'default'">Default</button>
        <button :class="{ active: sortBy === 'price' }" @click="sortBy = 'price'">Price</button>
        <button :class="{ active: sortBy === 'sales' }" @click="sortBy = 'sales'">Sales</button>
      </div>
      
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div class="product-image">
            <div class="img-placeholder">{{ product.name[0] }}</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="product-price">${{ product.price }}</div>
            <div class="product-sales">Sold {{ product.sales }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const query = computed(() => route.query.q || '')
const sortBy = ref('default')

const products = ref([
  { id: 1, name: 'COOFANDY Mens Shawl Collar Long Cardigan', price: '34.60', sales: '26,042' },
  { id: 2, name: 'ANBOTA Kids Lion Onesie Halloween Costume', price: '27.34', sales: '25,806' },
  { id: 3, name: 'Thermajohn Mens Thermal Underwear Pants', price: '16.05', sales: '11,751' },
  { id: 4, name: 'KwikSafety Safety Glasses Protective Eyewear', price: '35.87', sales: '21,966' },
  { id: 5, name: 'ZZB Tablet 10 Inch Android 11 Tablet', price: '68.97', sales: '25,276' },
  { id: 6, name: 'Portable Bluetooth Speaker Wireless Soundbar', price: '24.99', sales: '18,432' },
  { id: 7, name: 'Men\'s Casual Slim Fit T-Shirt', price: '12.99', sales: '45,231' },
  { id: 8, name: 'Women\'s Summer Floral Dress', price: '29.99', sales: '32,109' },
])
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.search-header { margin-bottom: 25px; }
.search-header h1 { font-size: 24px; }
.search-header p { color: #999; margin-top: 5px; }
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
