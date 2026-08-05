<template>
  <div class="home">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="hero-content">
        <h1>Your business starts with TikTok Shop</h1>
        <p>What are you waiting for?</p>
        <router-link to="/register" class="btn-primary">Start for Free</router-link>
      </div>
    </section>

    <!-- Categories -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <router-link to="/category">View All</router-link>
        </div>
        <div class="category-grid">
          <div v-for="cat in categories" :key="cat" class="category-card" @click="$router.push(`/search?category=${cat}`)">
            <div class="category-icon">{{ cat[0] }}</div>
            <span>{{ cat }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Daily Deals -->
    <section class="section bg-gray">
      <div class="container">
        <div class="section-header">
          <h2>Daily Deals</h2>
          <router-link to="/discounts">More</router-link>
        </div>
        <div class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="product-image">
              <div class="product-img-placeholder">{{ product.name[0] }}</div>
            </div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="product-price">${{ product.price }}</div>
              <div class="product-sales">Sold {{ product.sales }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Stores -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Popular Stores</h2>
        </div>
        <div class="store-grid">
          <div v-for="store in stores" :key="store.id" class="store-card" @click="$router.push(`/store/${store.id}`)">
            <div class="store-avatar">{{ store.name[0] }}</div>
            <h4>{{ store.name }}</h4>
            <p>Products: {{ store.products }}</p>
            <p>Sales: {{ store.sales }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <div class="feature-grid">
          <div class="feature-item">
            <i class="fas fa-check-circle"></i>
            <span>100% Original</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-undo"></i>
            <span>7 days return</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-truck"></i>
            <span>Free Shipping</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-shield-alt"></i>
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([
  'Food & Beverage', 'Men\'s Clothing', 'Women\'s Clothing', 'Electronics',
  'Home Appliances', 'Sports & Outdoors', 'Beauty & Health', 'Kids & Toys',
  'Jewelry & Watches', 'Bags & Luggage'
])

const products = ref([
  { id: 1, name: 'COOFANDY Mens Shawl Collar Long Cardigan', price: '34.60', sales: '26,042' },
  { id: 2, name: 'ANBOTA Kids Lion Onesie Halloween Costume', price: '27.34', sales: '25,806' },
  { id: 3, name: 'Thermajohn Mens Thermal Underwear Pants', price: '16.05', sales: '11,751' },
  { id: 4, name: 'KwikSafety Safety Glasses Protective Eyewear', price: '35.87', sales: '21,966' },
  { id: 5, name: 'ZZB Tablet 10 Inch Android 11 Tablet', price: '68.97', sales: '25,276' },
  { id: 6, name: 'Portable Bluetooth Speaker Wireless Soundbar', price: '24.99', sales: '18,432' },
])

const stores = ref([
  { id: 1, name: 'Dw專賣', products: 195, sales: '98,034' },
  { id: 2, name: '陳陳專賣', products: 120, sales: '45,023' },
  { id: 3, name: '電子秘境', products: 88, sales: '32,109' },
  { id: 4, name: 'Attraction•奢潮', products: 65, sales: '21,456' },
])
</script>

<style scoped>
.hero { background: linear-gradient(135deg, #fe2c55 0%, #ff6b81 100%); color: #fff; padding: 80px 0; text-align: center; }
.hero h1 { font-size: 42px; margin-bottom: 15px; }
.hero p { font-size: 18px; margin-bottom: 25px; }
.btn-primary { background: #fff; color: #fe2c55; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; display: inline-block; }
.section { padding: 50px 0; }
.bg-gray { background: #f8f8f8; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.section-header h2 { font-size: 24px; }
.section-header a { color: #fe2c55; text-decoration: none; }
.category-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
.category-card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.category-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
.category-icon { width: 50px; height: 50px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin: 0 auto 10px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
.product-img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.product-sales { color: #999; font-size: 12px; margin-top: 5px; }
.store-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.store-card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.store-avatar { width: 60px; height: 60px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 10px; }
.features { background: #333; color: #fff; padding: 30px 0; }
.feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
.feature-item i { font-size: 24px; margin-bottom: 10px; display: block; color: #fe2c55; }
</style>
