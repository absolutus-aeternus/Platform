<template>
  <div class="discounts-page">
    <div class="container">
      <h1>🔥 Hot Deals</h1>
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
          <div class="discount-badge">-{{ product.discount }}%</div>
          <div class="product-image">
            <div class="img-placeholder">{{ product.name[0] }}</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="price-row">
              <span class="price">${{ product.price }}</span>
              <span class="original">${{ product.original }}</span>
            </div>
            <div class="product-sales">Sold {{ product.sales }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'COOFANDY Mens Shawl Collar Long Cardigan', price: '34.60', original: '69.20', discount: 50, sales: '26,042' },
  { id: 2, name: 'ANBOTA Kids Lion Onesie Halloween Costume', price: '27.34', original: '54.68', discount: 50, sales: '25,806' },
  { id: 3, name: 'Thermajohn Mens Thermal Underwear Pants', price: '16.05', original: '32.10', discount: 50, sales: '11,751' },
  { id: 4, name: 'KwikSafety Safety Glasses Protective Eyewear', price: '35.87', original: '71.74', discount: 50, sales: '21,966' },
  { id: 5, name: 'ZZB Tablet 10 Inch Android 11 Tablet', price: '68.97', original: '137.94', discount: 50, sales: '25,276' },
  { id: 6, name: 'Portable Bluetooth Speaker Wireless Soundbar', price: '24.99', original: '49.98', discount: 50, sales: '18,432' },
])
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
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
