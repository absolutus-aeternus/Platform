<template>
  <div class="main-layout">
    <!-- Header -->
    <header class="header">
      <div class="header-top">
        <div class="container">
          <div class="header-top-left">
            <div class="lang-selector" @click="showLang = !showLang">
              <i class="fas fa-globe"></i> {{ currentLang }}
              <div v-if="showLang" class="lang-dropdown">
                <div v-for="lang in languages" :key="lang" @click="currentLang = lang; showLang = false">{{ lang }}</div>
              </div>
            </div>
          </div>
          <div class="header-top-right">
            <template v-if="userStore.isLoggedIn">
              <router-link to="/user" class="header-link">
                <i class="fas fa-user"></i> {{ userStore.username }}
              </router-link>
              <a @click="userStore.logout()" class="header-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </template>
            <template v-else>
              <router-link to="/login" class="header-link">Log in</router-link>
              <router-link to="/register" class="header-link">Register</router-link>
            </template>
          </div>
        </div>
      </div>
      
      <div class="header-main">
        <div class="container">
          <router-link to="/" class="logo">
            <span class="logo-text">TikTok Shop</span>
          </router-link>
          
          <div class="search-bar">
            <input v-model="searchQuery" type="text" placeholder="Search for brands/products/suppliers" @keyup.enter="handleSearch">
            <button @click="handleSearch" class="search-btn"><i class="fas fa-search"></i> Search</button>
          </div>
          
          <div class="header-actions">
            <router-link to="/cart" class="action-btn">
              <i class="fas fa-shopping-cart"></i>
              <span v-if="userStore.cartCount" class="badge">{{ userStore.cartCount }}</span>
              <span>Cart</span>
            </router-link>
            <router-link to="/chat" class="action-btn">
              <i class="fas fa-comments"></i>
              <span>Chat</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <nav class="header-nav">
        <div class="container">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/category" class="nav-link">Category</router-link>
          <router-link to="/commodity" class="nav-link">Product</router-link>
          <router-link to="/discounts" class="nav-link">Discounts</router-link>
          <router-link to="/seller" class="nav-link">Partnership</router-link>
          <router-link to="/credit" class="nav-link">Credit Loan Service</router-link>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>Customer service</h4>
              <ul>
                <li><a href="#">Online Customer Service</a></li>
                <li><a href="#">Contact us</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Returns and Exchange</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">Delivery & collection</a></li>
                <li><a href="#">Seller's Policy</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>User Center</h4>
              <ul>
                <li><a href="#">User Registration</a></li>
                <li><a href="#">Order Inquiry</a></li>
                <li><a href="#">Favorite Products</a></li>
                <li><a href="#">My Wallet</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Payment Methods</h4>
              <div class="payment-icons">
                <span class="payment-icon">Binance</span>
                <span class="payment-icon">Huobi</span>
                <span class="payment-icon">OKX</span>
                <span class="payment-icon">KraKen</span>
                <span class="payment-icon">Coinbase</span>
                <span class="payment-icon">MetaMask</span>
                <span class="payment-icon">KuCoin</span>
                <span class="payment-icon">Bitfinex</span>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-info">
            <p><strong>TikTok Shop</strong></p>
            <p>TikTok Shop global site users come from 112 countries around the world</p>
          </div>
          <div class="footer-copyright">
            <p>&copy; 2026 TikTok Shop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')
const showLang = ref(false)
const currentLang = ref('English')

const languages = ['English', 'Deutsch', 'français', 'Русский', 'Español', 'Português', 'Italiano', 'Melayu', 'Afrikaans', 'Ελληνικά', '中文繁體', '中文简体', 'Türkçe', '日本語', '한국어', 'ภาษาไทย', 'Filipino', 'العربية', 'Tiếng Việt', 'हिन्दी', 'Bahasa Indonesia']

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}
</script>

<style scoped>
.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.header-top { background: #f5f5f5; padding: 8px 0; font-size: 12px; }
.header-top .container { display: flex; justify-content: space-between; }
.lang-selector { position: relative; cursor: pointer; }
.lang-dropdown { position: absolute; top: 100%; left: 0; background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-height: 300px; overflow-y: auto; }
.lang-dropdown div { padding: 8px 15px; cursor: pointer; white-space: nowrap; }
.lang-dropdown div:hover { background: #f5f5f5; }
.header-link { margin-left: 15px; color: #666; text-decoration: none; cursor: pointer; }
.header-link:hover { color: #fe2c55; }
.header-main { padding: 15px 0; }
.header-main .container { display: flex; align-items: center; gap: 20px; }
.logo-text { font-size: 24px; font-weight: 800; color: #fe2c55; }
.search-bar { flex: 1; display: flex; }
.search-bar input { flex: 1; padding: 10px 15px; border: 2px solid #fe2c55; border-radius: 4px 0 0 4px; font-size: 14px; }
.search-btn { padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 0 4px 4px 0; cursor: pointer; }
.header-actions { display: flex; gap: 20px; }
.action-btn { display: flex; flex-direction: column; align-items: center; color: #333; text-decoration: none; position: relative; }
.action-btn i { font-size: 20px; margin-bottom: 4px; }
.badge { position: absolute; top: -5px; right: -10px; background: #fe2c55; color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.header-nav { background: #333; }
.header-nav .container { display: flex; gap: 0; }
.nav-link { color: #fff; text-decoration: none; padding: 12px 20px; font-size: 14px; }
.nav-link:hover { background: #fe2c55; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.main-content { min-height: 60vh; }
.footer { background: #222; color: #ccc; padding: 40px 0 20px; }
.footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-bottom: 30px; }
.footer-col h4 { color: #fff; margin-bottom: 15px; font-size: 16px; }
.footer-col ul { list-style: none; padding: 0; }
.footer-col li { margin-bottom: 10px; }
.footer-col a { color: #999; text-decoration: none; font-size: 14px; }
.footer-col a:hover { color: #fff; }
.payment-icons { display: flex; flex-wrap: wrap; gap: 8px; }
.payment-icon { background: #444; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
.footer-bottom { border-top: 1px solid #444; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
.footer-info p { margin-bottom: 5px; font-size: 13px; }
.footer-copyright p { font-size: 12px; color: #666; }
</style>
