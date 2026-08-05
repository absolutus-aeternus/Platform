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
          <div v-for="cat in categories" :key="cat.id" class="category-card" @click="$router.push(`/search?category=${cat.id}`)">
            <div class="category-icon" :style="{ background: cat.color || '#fe2c55' }">{{ cat.name[0] }}</div>
            <span>{{ cat.name }}</span>
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
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else class="product-grid">
          <div v-for="product in products.slice(0, 4)" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="product-img-placeholder">{{ product.name[0] }}</div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="product-price">${{ product.price }}</div>
              <div class="product-sales">Sold {{ product.sales_count || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Become a Seller CTA -->
    <section class="seller-cta">
      <div class="container">
        <div class="cta-content">
          <p class="cta-subtitle">Become a Seller</p>
          <p class="cta-title">Total Commission</p>
          <h3 class="cta-amount">Max. $100,000</h3>
          <router-link to="/register" class="btn-cta">Join Now</router-link>
        </div>
      </div>
    </section>

    <!-- Popular Items -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Popular Items</h2>
        </div>
        <div class="product-grid">
          <div v-for="product in products.slice(0, 8)" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="product-img-placeholder">{{ product.name[0] }}</div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="product-price">${{ product.price }}</div>
              <div class="product-sales">Sold {{ product.sales_count || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Stores -->
    <section class="section bg-gray">
      <div class="container">
        <div class="section-header">
          <h2>Popular Stores</h2>
        </div>
        <div class="store-grid">
          <div v-for="store in sellers" :key="store.id" class="store-card" @click="$router.push(`/store/${store.id}`)">
            <div class="store-avatar">{{ store.name[0] }}</div>
            <h4>{{ store.name }}</h4>
            <p>Products: {{ store.goods_count || 0 }}</p>
            <p>Total Sales: {{ store.sales_count || 0 }}</p>
            <p>Rate of good reviews: 100%</p>
            <button class="btn-visit">Visit Store ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Hot Deals -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Hot Deals</h2>
        </div>
        <div class="product-grid">
          <div v-for="product in products.slice(0, 4)" :key="'hot-'+product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div v-if="product.discount" class="discount-badge">-{{ product.discount }}%</div>
            <div class="product-img-placeholder">{{ product.name[0] }}</div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="product-price">${{ product.price }}</div>
              <div class="product-sales">Sold {{ product.sales_count || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Safe and Worry-free -->
    <section class="trust-section">
      <div class="container">
        <div class="trust-grid">
          <div class="trust-item">
            <i class="fas fa-check-circle"></i>
            <h4>Safe and Worry-free</h4>
            <p>100% Original products</p>
          </div>
          <div class="trust-item">
            <i class="fas fa-undo"></i>
            <h4>7 days return</h4>
            <p>Easy return policy</p>
          </div>
          <div class="trust-item">
            <i class="fas fa-truck"></i>
            <h4>Free Shipping</h4>
            <p>On all orders</p>
          </div>
          <div class="trust-item">
            <i class="fas fa-shield-alt"></i>
            <h4>Secure Payment</h4>
            <p>Encrypted transactions</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partner - Online Lending Platform -->
    <section class="partner-section">
      <div class="container">
        <div class="partner-content">
          <h2>Partner - Online Lending Platform</h2>
          <p>Start-up Loans are to avoid the trouble of borrowing money</p>
          <p>Provide start-up loan and capital turnover services</p>
          <router-link to="/credit" class="btn-partner">Learn More</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchProducts, fetchCategories, fetchSellers } from '@/services/supabase'

const categories = ref([])
const products = ref([])
const sellers = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [catRes, prodRes, sellerRes] = await Promise.all([
      fetchCategories(),
      fetchProducts({ limit: 12 }),
      fetchSellers()
    ])
    categories.value = catRes.data || []
    products.value = prodRes.data || []
    sellers.value = sellerRes.data || []
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    loading.value = false
  }
})
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
.loading { text-align: center; padding: 40px; color: #999; }
.category-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
.category-card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.category-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
.category-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: #fff; margin: 0 auto 10px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: relative; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
.discount-badge { position: absolute; top: 10px; left: 10px; background: #fe2c55; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; z-index: 1; }
.product-img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.product-sales { color: #999; font-size: 12px; margin-top: 5px; }
.seller-cta { background: linear-gradient(135deg, #333 0%, #555 100%); color: #fff; padding: 60px 0; text-align: center; }
.cta-subtitle { font-size: 16px; opacity: 0.8; margin-bottom: 5px; }
.cta-title { font-size: 14px; opacity: 0.6; }
.cta-amount { font-size: 36px; margin: 15px 0 25px; }
.btn-cta { background: #fe2c55; color: #fff; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; display: inline-block; }
.store-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.store-card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.store-card:hover { transform: translateY(-3px); }
.store-avatar { width: 60px; height: 60px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 10px; }
.btn-visit { margin-top: 10px; padding: 8px 20px; border: 1px solid #fe2c55; color: #fe2c55; background: none; border-radius: 4px; cursor: pointer; }
.trust-section { background: #333; color: #fff; padding: 40px 0; }
.trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; text-align: center; }
.trust-item i { font-size: 32px; color: #fe2c55; margin-bottom: 15px; }
.trust-item h4 { margin-bottom: 8px; }
.trust-item p { color: #999; font-size: 14px; }
.partner-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 60px 0; text-align: center; }
.partner-content h2 { font-size: 28px; margin-bottom: 15px; }
.partner-content p { opacity: 0.9; margin-bottom: 10px; }
.btn-partner { background: #fff; color: #667eea; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 20px; }
</style>
