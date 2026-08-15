<template>
  <div class="app-layout">
    <!-- ===== TOP BAR (Amazon-style thin bar) ===== -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <div class="top-bar-left">
          <router-link to="/ratingplus" class="top-link promo-top">
            <i class="fas fa-star"></i> Rating Plus — Shop & Earn
          </router-link>
        </div>
        <div class="top-bar-right">
          <router-link to="/discounts" class="top-link">Today's Deals</router-link>
          <router-link to="/help" class="top-link">Customer Service</router-link>
          <router-link to="/merchant-settled" class="top-link">Sell</router-link>
          <div class="lang-switch" @click="showLang = !showLang">
            <span>{{ currentLang.flag }} {{ currentLang.name }}</span>
            <i class="fas fa-chevron-down"></i>
            <div v-if="showLang" class="lang-dropdown">
              <div v-for="l in languages" :key="l.code" :class="{ active: locale === l.code }" @click="setLocale(l.code)">{{ l.flag }} {{ l.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MAIN HEADER ===== -->
    <header class="header">
      <div class="container header-inner">
        <!-- Mobile hamburger -->
        <button class="hamburger-btn" @click="showMobile = !showMobile" aria-label="Open navigation menu" role="button" tabindex="0">
          <span class="hamburger-line" :class="{ open: showMobile }"></span>
          <span class="hamburger-line" :class="{ open: showMobile }"></span>
          <span class="hamburger-line" :class="{ open: showMobile }"></span>
        </button>

        <!-- Logo -->
        <router-link to="/" class="logo">
          <img src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img" />
        </router-link>

        <!-- Search Bar -->
        <div class="search-wrapper">
          <div class="search-bar">
            <select class="search-cat" v-model="searchCat">
              <option value="">All</option>
              <option v-for="cat in navCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <input v-model="searchQuery" placeholder="Search AllianceHub" @keyup.enter="doSearch" />
            <button class="btn-search" @click="doSearch"><i class="fas fa-search"></i></button>
          </div>
        </div>

        <!-- Account & Lists -->
        <div class="header-actions">
          <router-link :to="userStore.isLoggedIn ? '/user' : '/login'" class="header-action account-action">
            <div class="action-text">
              <small>Hello, {{ userStore.isLoggedIn ? userStore.username : 'sign in' }}</small>
              <strong>Account &amp; Lists <i class="fas fa-caret-down"></i></strong>
            </div>
          </router-link>

          <!-- Orders -->
          <router-link to="/user/orders" class="header-action orders-action">
            <div class="action-text">
              <small>&nbsp;</small>
              <strong>Returns</strong>
            </div>
            <div class="action-text">
              <small>&nbsp;</small>
              <strong>&amp; Orders</strong>
            </div>
          </router-link>

          <!-- Cart -->
          <router-link to="/cart" class="header-action cart-action" aria-label="Shopping Cart">
            <div class="cart-icon-wrap">
              <span v-if="userStore.cartCount" class="cart-badge">{{ userStore.cartCount }}</span>
              <i class="fas fa-shopping-cart"></i>
            </div>
            <strong>Cart</strong>
          </router-link>
        </div>
      </div>
    </header>

    <!-- ===== SUB HEADER (Category Nav) ===== -->
    <nav class="sub-header">
      <div class="container sub-header-inner">
        <div class="sub-left">
          <div class="all-menu" @click="showMobile = !showMobile">
            <i class="fas fa-bars"></i>
            <span>All</span>
          </div>
          <router-link to="/commodity" class="sub-link">Today's Deals</router-link>
          <router-link to="/search-store" class="sub-link">Stores</router-link>
          <router-link to="/discounts" class="sub-link">Flash Sale</router-link>
          <router-link v-for="cat in navCategories.slice(0, 6)" :key="cat.id" :to="`/search?category=${cat.id}`" class="sub-link">
            {{ cat.name }}
          </router-link>
          <router-link to="/blog" class="sub-link">Blog</router-link>
          <router-link to="/how-to-buy" class="sub-link">How to Buy</router-link>
        </div>
        <div class="sub-right">
          <router-link to="/ratingplus" class="sub-link promo-link">
            <i class="fas fa-star"></i> Rating Plus — Shop & Earn
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ===== MOBILE SIDEBAR ===== -->
    <div v-if="showMobile" class="mobile-overlay" @click="showMobile = false"></div>
    <aside class="mobile-sidebar" :class="{ open: showMobile }">
      <div class="mobile-header">
        <img src="/images/logo-alliance.svg" alt="AllianceHub" class="mobile-logo" />
        <button @click="showMobile = false" class="mobile-close" aria-label="Close menu"><i class="fas fa-times"></i></button>
      </div>
      <div class="mobile-user" v-if="userStore.isLoggedIn">
        <div class="mobile-avatar">{{ userStore.username[0]?.toUpperCase() }}</div>
        <div><strong>Hello, {{ userStore.username }}</strong></div>
      </div>
      <div class="mobile-user" v-else>
        <router-link to="/login" class="btn-primary" style="width:100%" @click="showMobile = false">Sign In</router-link>
      </div>
      <nav class="mobile-nav">
        <div class="mobile-nav-title">Trending</div>
        <router-link to="/" @click="showMobile = false"><i class="fas fa-home"></i> Home</router-link>
        <router-link to="/discounts" @click="showMobile = false"><i class="fas fa-bolt"></i> Today's Deals</router-link>
        <router-link to="/commodity" @click="showMobile = false"><i class="fas fa-th"></i> All Products</router-link>
        <router-link to="/search-store" @click="showMobile = false"><i class="fas fa-store"></i> Stores</router-link>

        <div class="mobile-nav-title">Shop by Category</div>
        <router-link v-for="cat in navCategories" :key="cat.id" :to="`/search?category=${cat.id}`" @click="showMobile = false">
          {{ cat.icon }} {{ cat.name }}
        </router-link>

        <div class="mobile-nav-title">Your Account</div>
        <router-link to="/user" @click="showMobile = false"><i class="fas fa-user"></i> Your Account</router-link>
        <router-link to="/user/orders" @click="showMobile = false"><i class="fas fa-box"></i> Your Orders</router-link>
        <router-link to="/user/favorites" @click="showMobile = false"><i class="fas fa-heart"></i> Your Wishlist</router-link>
        <router-link to="/cart" @click="showMobile = false"><i class="fas fa-shopping-cart"></i> Your Cart</router-link>
        <router-link to="/chat" @click="showMobile = false"><i class="fas fa-comment-dots"></i> Messages</router-link>
        <router-link to="/track-order" @click="showMobile = false"><i class="fas fa-truck"></i> Track Order</router-link>
        <router-link to="/user/wallet" @click="showMobile = false"><i class="fas fa-wallet"></i> Wallet</router-link>
        <router-link to="/help" @click="showMobile = false"><i class="fas fa-question-circle"></i> Help</router-link>
        <button v-if="userStore.isLoggedIn" @click="handleLogout" class="mobile-logout"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
      </nav>
    </aside>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
      <div class="back-to-top" @click="scrollToTop">
        <span>Back to top</span>
      </div>
      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>Get to Know Us</h4>
              <ul>
                <li><router-link to="/about">About AllianceHub</router-link></li>
                <li><router-link to="/blog">Blog & Guides</router-link></li>
                <li><router-link to="/how-to-buy">How to Buy</router-link></li>
                <li><router-link to="/comparison">Compare Products</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Customer Service</h4>
              <ul>
                <li><router-link to="/track-order">Track Order</router-link></li>
                <li><router-link to="/returns">Returns & Refunds</router-link></li>
                <li><router-link to="/shipping-info">Shipping Info</router-link></li>
                <li><router-link to="/payment-methods">Payment Methods</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Make Money with Us</h4>
              <ul>
                <li><router-link to="/merchant-settled">Sell on AllianceHub</router-link></li>
                <li><router-link to="/seller/login">Seller Login</router-link></li>
                <li><router-link to="/ratingplus">Rating Plus Program</router-link></li>
                <li><router-link to="/register">Create Account</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Payment Partners</h4>
              <div class="payment-grid">
                <span class="pay-icon"><i class="fab fa-bitcoin"></i> Binance</span>
                <span class="pay-icon"><i class="fas fa-exchange-alt"></i> OKX</span>
                <span class="pay-icon"><i class="fas fa-coins"></i> Coinbase</span>
                <span class="pay-icon"><i class="fab fa-ethereum"></i> MetaMask</span>
                <span class="pay-icon"><i class="fas fa-chart-line"></i> KuCoin</span>
                <span class="pay-icon"><i class="fas fa-water"></i> Kraken</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>© 2022 AllianceHub. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { supabase, fetchCategories } from '@/services/supabase'
import ChatWidget from '@/components/ChatWidget.vue'

const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()

const searchQuery = ref('')
const searchCat = ref('')
const showMobile = ref(false)
const showLang = ref(false)
const categories = ref([])

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

const currentLang = computed(() => languages.find(l => l.code === locale.value) || languages[0])
const navCategories = computed(() => categories.value.slice(0, 10))

const setLocale = (code) => { locale.value = code; localStorage.setItem('locale', code); showLang.value = false }
let searchTimer = null
const doSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (searchQuery.value.trim()) {
      let url = `/search?q=${encodeURIComponent(searchQuery.value.trim())}`
      if (searchCat.value) url += `&category=${searchCat.value}`
      router.push(url)
    }
  }, 300)
}
const handleLogout = async () => { await userStore.logout(); showMobile.value = false; router.push('/') }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(async () => {
  const { data } = await fetchCategories()
  categories.value = data || []
})
</script>

<style scoped>
/* ===== TOP BAR ===== */
.top-bar { background: #232f3e; padding: 0.375rem 0; font-size: 0.75rem; }
.top-bar-inner { display: flex; justify-content: space-between; align-items: center; }
.top-bar-left { display: flex; align-items: center; }
.top-deliver { display: flex; align-items: center; gap: 0.375rem; color: #fff; text-decoration: none; padding: 0.25rem 0.5rem; border: 1px solid transparent; border-radius: 2px; transition: border-color 0.15s; }
.top-deliver:hover { border-color: #fff; }
.top-deliver i { color: #fff; font-size: 1rem; }
.top-deliver small { display: block; font-size: 0.625rem; color: #ccc; line-height: 1; }
.top-deliver strong { font-size: 0.75rem; line-height: 1.2; }
.top-bar-right { display: flex; align-items: center; gap: 1rem; }
.top-link { color: #ccc; font-size: 0.75rem; text-decoration: none; transition: color 0.15s; }
.top-link:hover { color: #fff; }
.promo-top { color: #FF9900 !important; font-weight: 600; }
.promo-top i { color: #FF9900; }
.lang-switch { position: relative; cursor: pointer; color: #ccc; display: flex; align-items: center; gap: 0.25rem; }
.lang-switch:hover { color: #fff; }
.lang-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 200; min-width: 140px; overflow: hidden; }
.lang-dropdown div { padding: 0.5rem 0.75rem; font-size: 0.8125rem; color: #333; cursor: pointer; transition: background 0.15s; }
.lang-dropdown div:hover { background: #f5f5f5; }
.lang-dropdown div.active { background: #FF9900; color: #fff; }

/* ===== MAIN HEADER ===== */
.header { background: #131921; padding: 0.5rem 0; position: sticky; top: 0; z-index: 100; }
.header-inner { display: flex; align-items: center; gap: 0.75rem; }
.hamburger-btn { display: none; flex-direction: column; justify-content: center; align-items: center; gap: 0.25rem; width: 2.25rem; height: 2.25rem; background: none; border: none; cursor: pointer; padding: 0.375rem; border-radius: 2px; }
.hamburger-btn:hover { background: rgba(255,255,255,0.1); }
.hamburger-line { width: 1.125rem; height: 2px; background: #fff; border-radius: 1px; transition: all 0.3s; }
.hamburger-line.open:nth-child(1) { transform: translateY(4px) rotate(45deg); }
.hamburger-line.open:nth-child(2) { opacity: 0; }
.hamburger-line.open:nth-child(3) { transform: translateY(-4px) rotate(-45deg); }

/* Logo */
.logo { display: flex; align-items: center; flex-shrink: 0; text-decoration: none; padding: 0.25rem 0.5rem; border: 1px solid transparent; border-radius: 2px; transition: border-color 0.15s; }
.logo:hover { border-color: #fff; }
.logo-img { height: 1.75rem; width: auto; object-fit: contain; }

/* Search */
.search-wrapper { flex: 1; max-width: 46rem; }
.search-bar { display: flex; height: 2.5rem; border-radius: 4px; overflow: hidden; }
.search-cat { border: none; background: #f3f3f3; padding: 0 0.625rem; font-size: 0.75rem; color: #555; border-right: 1px solid #cdcdcd; cursor: pointer; outline: none; min-width: 4.5rem; }
.search-bar input { flex: 1; padding: 0 0.75rem; border: none; font-size: 0.875rem; outline: none; min-width: 0; }
.btn-search { padding: 0 1rem; background: #febd69; border: none; cursor: pointer; font-size: 0.875rem; color: #131921; transition: background 0.2s; }
.btn-search:hover { background: #f3a847; }

/* Header Actions */
.header-actions { display: flex; align-items: stretch; gap: 0; }
.header-action { display: flex; flex-direction: column; justify-content: center; color: #fff; text-decoration: none; padding: 0.375rem 0.625rem; border: 1px solid transparent; border-radius: 2px; transition: border-color 0.15s; white-space: nowrap; }
.header-action:hover { border-color: #fff; color: #fff; }
.action-text { display: flex; flex-direction: column; line-height: 1.2; }
.action-text small { font-size: 0.625rem; color: #ccc; }
.action-text strong { font-size: 0.75rem; display: flex; align-items: center; gap: 0.125rem; }
.action-text strong i { font-size: 0.5rem; }

/* Cart */
.cart-icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.cart-icon-wrap i { font-size: 1.5rem; }
.cart-badge { position: absolute; top: -0.5rem; right: -0.375rem; background: #FF9900; color: #131921; min-width: 1.125rem; height: 1.125rem; border-radius: 0.5625rem; font-size: 0.6875rem; display: flex; align-items: center; justify-content: center; font-weight: 700; padding: 0 0.125rem; }
.cart-action { flex-direction: row; align-items: center; gap: 0.375rem; }
.cart-action strong { font-size: 0.75rem; }

/* ===== SUB HEADER ===== */
.sub-header { background: #232f3e; border-bottom: 1px solid rgba(255,255,255,0.1); }
.sub-header-inner { display: flex; justify-content: space-between; align-items: center; }
.sub-left { display: flex; align-items: center; gap: 0; overflow-x: auto; }
.sub-left::-webkit-scrollbar { height: 0; }
.all-menu { display: flex; align-items: center; gap: 0.375rem; color: #fff; font-weight: 700; font-size: 0.8125rem; padding: 0.5rem 0.75rem; cursor: pointer; border: 1px solid transparent; border-radius: 2px; transition: border-color 0.15s; white-space: nowrap; }
.all-menu:hover { border-color: #fff; }
.sub-link { color: #ddd; text-decoration: none; padding: 0.5rem 0.625rem; font-size: 0.8125rem; white-space: nowrap; transition: color 0.15s; border: 1px solid transparent; border-radius: 2px; }
.sub-link:hover { color: #fff; border-color: #fff; }
.sub-right { flex-shrink: 0; }
.promo-link { color: #FF9900 !important; font-weight: 600; }
.promo-link i { color: #FF9900; }

/* ===== MOBILE SIDEBAR ===== */
.mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }
.mobile-sidebar { position: fixed; top: 0; left: 0; width: min(85vw, 22rem); height: 100dvh; background: #fff; z-index: 250; overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s; box-shadow: 0 16px 48px rgba(0,0,0,0.16); }
.mobile-sidebar.open { transform: translateX(0); }
.mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: #131921; }
.mobile-logo { height: 1.5rem; width: auto; object-fit: contain; }
.mobile-close { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }
.mobile-user { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem; background: #232f3e; color: #fff; }
.mobile-avatar { width: 2.5rem; height: 2.5rem; background: #FF9900; color: #131921; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
.mobile-nav { padding: 0.5rem 0; }
.mobile-nav-title { padding: 0.75rem 1.25rem 0.375rem; font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #eee; margin-top: 0.25rem; }
.mobile-nav a, .mobile-nav button { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; color: #333; text-decoration: none; font-size: 0.875rem; border: none; background: none; width: 100%; cursor: pointer; transition: background 0.15s; }
.mobile-nav a:hover, .mobile-nav button:hover { background: #f5f5f5; }
.mobile-nav i { width: 1.25rem; text-align: center; color: #555; font-size: 0.875rem; }
.mobile-logout { color: #CC0C39 !important; border-top: 1px solid #eee !important; margin-top: 0.5rem; }

/* ===== MAIN CONTENT ===== */
.main-content { min-height: 60vh; }

/* ===== FOOTER ===== */
.back-to-top { background: #37475a; text-align: center; padding: 0.75rem; cursor: pointer; transition: background 0.2s; }
.back-to-top:hover { background: #485769; }
.back-to-top span { color: #fff; font-size: 0.8125rem; }
.footer { background: #232f3e; }
.footer-main { padding: 2.5rem 0; }
.footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
.footer-col h4 { font-size: 0.9375rem; font-weight: 700; margin: 0 0 1rem; color: #fff; }
.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 0.5rem; }
.footer-col a { color: #ddd; text-decoration: none; font-size: 0.8125rem; transition: color 0.15s; }
.footer-col a:hover { color: #FF9900; text-decoration: underline; }
.payment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.pay-icon { background: rgba(255,255,255,0.08); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.75rem; color: #ccc; display: flex; align-items: center; gap: 0.5rem; }
.pay-icon i { color: #FF9900; width: 1rem; text-align: center; }
.footer-bottom { background: #0d1117; padding: 1rem 0; }
.footer-bottom-inner { text-align: center; }
.footer-bottom p { font-size: 0.75rem; color: #666; margin: 0; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: repeat(2, 1fr); }
  .orders-action { display: none; }
}
@media (max-width: 768px) {
  .top-bar { display: none; }
  .hamburger-btn { display: flex; }
  .logo-img { height: 1.25rem; }
  .search-wrapper { max-width: none; }
  .search-cat { display: none; }
  .header-actions { gap: 0; }
  .action-text { display: none; }
  .header-action { padding: 0.375rem; }
  .account-action, .orders-action { display: none; }
  .cart-action { flex-direction: column; }
  .cart-action strong { display: none; }
  .sub-left { gap: 0; }
  .sub-link { padding: 0.375rem 0.5rem; font-size: 0.75rem; }
  .sub-right { display: none; }
  .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}
@media (max-width: 480px) {
  .header-inner { gap: 0.375rem; }
  .header-action { padding: 0.25rem; }
  .header-action i { font-size: 1rem; }
}
</style>
