<template><div v-if="userStore.isSuperAdmin" style="padding:6px 16px;background:#1a1a2e;display:flex;gap:12px;justify-content:center;font-size:12px"><router-link to="/superadmin" style="color:#f39c12;text-decoration:none"><i class="fas fa-crown"></i> Super Admin</router-link><router-link to="/admin" style="color:#fff;text-decoration:none"><i class="fas fa-shield-alt"></i> Admin</router-link><router-link to="/seller" style="color:#fff;text-decoration:none"><i class="fas fa-store"></i> Seller</router-link><router-link to="/user" style="color:#fff;text-decoration:none"><i class="fas fa-shopping-cart"></i> Buyer</router-link><router-link to="/ratingplus" style="color:#fff;text-decoration:none"><i class="fas fa-star"></i> R+</router-link></div>
  <div class="app-layout" style="position: relative; z-index: 1;">
    <!-- ===== TOP BAR (Amazon-style thin bar) ===== -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <div class="top-bar-left">
                  </div>
        <div class="top-bar-right">
          <router-link to="/discounts" class="top-link">Today's Deals</router-link>
          <router-link to="/help" class="top-link">Customer Service</router-link>
          <router-link to="/merchant-settled" class="top-link">Sell</router-link>
          <button class="theme-toggle" @click="toggleDark" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" :title="isDark ? 'Light mode' : 'Dark mode'">
            <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
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
          <img loading="lazy" src="/images/logo-alliance.svg" alt="AllianceHub" class="logo-img" />
        </router-link>

        <!-- Search Bar -->
        <div class="search-wrapper">
          <div class="search-bar">
            <select class="search-cat" v-model="searchCat">
              <option value="">All</option>
              <option v-for="cat in navCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <input
              v-model="searchQuery"
              placeholder="Search AllianceHub"
              @keyup.enter="doSearch"
              @input="onSearchInput"
              @focus="showSuggestions = suggestions.length > 0"
              @blur="setTimeout(() => showSuggestions = false, 200)"
              autocomplete="off"
            />
            <button class="btn-search" @click="doSearch"><i class="fas fa-search"></i></button>
          </div>
          <!-- Autocomplete Dropdown -->
          <div v-if="showSuggestions && suggestions.length" class="search-suggestions">
            <div
              v-for="s in suggestions"
              :key="s.id"
              class="search-suggestion"
              @mousedown.prevent="goToProduct(s)"
            >
              <img loading="lazy" v-if="s.images?.[0]" :src="s.images[0]" class="search-suggestion__img" :alt="s.name" />
              <div v-else class="search-suggestion__placeholder">{{ (s.name || '?')[0] }}</div>
              <div class="search-suggestion__info">
                <div class="search-suggestion__name">{{ s.name }}</div>
                <div class="search-suggestion__price">${{ s.price }}</div>
              </div>
              <span v-if="s.discount" class="search-suggestion__badge">-{{ s.discount }}%</span>
            </div>
            <div class="search-suggestion search-suggestion--all" @mousedown.prevent="doSearch">
              <i class="fas fa-search"></i>
              <span>See all results for "{{ searchQuery }}"</span>
            </div>
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
          <router-link to="/commodity" class="sub-link"><i class="fas fa-fire"></i> <span>Today's Deals</span></router-link>
          <router-link to="/search-store" class="sub-link"><i class="fas fa-store"></i> <span>Stores</span></router-link>
          <router-link to="/discounts" class="sub-link"><i class="fas fa-bolt"></i> <span>Flash Sale</span></router-link>
          <router-link v-for="cat in navCategories.slice(0, 6)" :key="cat.id" :to="`/search?category=${cat.id}`" class="sub-link">
            <span>{{ cat.name }}</span>
          </router-link>
          <router-link to="/blog" class="sub-link"><i class="fas fa-blog"></i> <span>Blog</span></router-link>
          <router-link to="/how-to-buy" class="sub-link"><i class="fas fa-question-circle"></i> <span>How to Buy</span></router-link>
        </div>
        <div class="sub-right">
                  </div>
      </div>
    </nav>

    <!-- ===== MOBILE SIDEBAR ===== -->
    <div v-if="showMobile" class="mobile-overlay" @click="showMobile = false"></div>
    <aside class="mobile-sidebar" :class="{ open: showMobile }">
      <div class="mobile-header">
        <img loading="lazy" src="/images/logo-alliance.svg" alt="AllianceHub" class="mobile-logo" />
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
    <footer class="footer" role="contentinfo">
      <div class="back-to-top" @click="scrollToTop" role="button" tabindex="0" aria-label="Back to top" @keyup.enter="scrollToTop">
        <span>Back to top</span>
      </div>

      <div class="footer-main">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>Customer Service</h4>
              <ul>
                <li><router-link to="/help">Help Center</router-link></li>
                <li><router-link to="/how-to-buy">How to Buy</router-link></li>
                <li><router-link to="/returns">Returns & Refunds</router-link></li>
                <li><router-link to="/contact">Contact Us</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Get to Know Us</h4>
              <ul>
                <li><router-link to="/about">About AllianceHub</router-link></li>
                <li><router-link to="/blog">Blog & Guides</router-link></li>
                <li><router-link to="/comparison">Compare Products</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Partner Marketplace</h4>
              <ul>
                <li><a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">Amazon</a></li>
                <li><a href="https://www.aliexpress.com" target="_blank" rel="noopener noreferrer">AliExpress</a></li>
                <li><a href="https://www.shopify.com" target="_blank" rel="noopener noreferrer">Shopify</a></li>
                <li><a href="https://www.tiktokshop.com" target="_blank" rel="noopener noreferrer">TikTok Shop</a></li>
                <li><a href="https://shopee.com" target="_blank" rel="noopener noreferrer">Shopee International</a></li>
                <li><a href="https://www.ebay.com" target="_blank" rel="noopener noreferrer">eBay</a></li>
                <li><a href="https://www.walmart.com/marketplace" target="_blank" rel="noopener noreferrer">Walmart Marketplace</a></li>
                <li><a href="https://www.etsy.com" target="_blank" rel="noopener noreferrer">Etsy</a></li>
                <li><a href="https://global.rakuten.com" target="_blank" rel="noopener noreferrer">Rakuten</a></li>
                <li><a href="https://www.lazada.com" target="_blank" rel="noopener noreferrer">Lazada</a></li>
                <li><a href="https://www.mercadolibre.com" target="_blank" rel="noopener noreferrer">Mercado Libre</a></li>
                <li><a href="https://allegro.pl" target="_blank" rel="noopener noreferrer">Allegro</a></li>
                <li><a href="https://www.coupang.com" target="_blank" rel="noopener noreferrer">Coupang</a></li>
                <li><a href="https://www.jd.com" target="_blank" rel="noopener noreferrer">JD.com</a></li>
                <li><a href="https://www.tmall.com" target="_blank" rel="noopener noreferrer">Tmall (Taobao)</a></li>
                <li><a href="https://www.flipkart.com" target="_blank" rel="noopener noreferrer">Flipkart</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Make Money with Us</h4>
              <ul>
                <li><router-link to="/merchant-settled">Sell on AllianceHub</router-link></li>
                <li><router-link to="/seller/login">Seller Login</router-link></li>
                <li><router-link to="/register">Create Account</router-link></li>
                <li><router-link to="/credit">Affiliate Program</router-link></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Support Payment</h4>
              <div class="payment-grid">
                <span class="pay-icon"><i class="fab fa-cc-paypal"></i> PayPal</span>
                <span class="pay-icon"><i class="fab fa-bitcoin"></i> Binance</span>
                <span class="pay-icon"><i class="fas fa-exchange-alt"></i> OKX</span>
                <span class="pay-icon"><i class="fas fa-coins"></i> Coinbase</span>
                <span class="pay-icon"><i class="fas fa-chart-line"></i> KuCoin</span>
                <span class="pay-icon"><i class="fas fa-water"></i> Kraken</span>
                <span class="pay-icon"><i class="fas fa-bolt"></i> Bybit</span>
                <span class="pay-icon"><i class="fas fa-gem"></i> Gate.io</span>
                <span class="pay-icon"><i class="fas fa-shield-alt"></i> Bitget</span>
                <span class="pay-icon"><i class="fas fa-globe"></i> MEXC</span>
                <span class="pay-icon"><i class="fas fa-link"></i> Crypto.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <div class="footer-bottom-left">
            <p>© 2026 AllianceHub. All rights reserved.</p>
          </div>
          <div class="footer-bottom-links">
            <router-link to="/privacy">Privacy Policy</router-link>
            <router-link to="/terms">Terms of Service</router-link>
            <router-link to="/contact">Contact</router-link>
          </div>

        </div>
      </div>
    </footer>

    <ChatWidget />
    <MobileTabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { supabase, fetchCategories } from '@/services/supabase'
import ChatWidget from '@/components/ChatWidget.vue'

import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import { useDevice } from '@/composables/useDevice'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggle: toggleDark } = useDarkMode()

const device = useDevice()

const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()

const searchQuery = ref('')
const searchCat = ref('')
const showMobile = ref(false)
const showLang = ref(false)
const categories = ref([])
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestTimer = null

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

const currentLang = computed(() => languages.find(l => l.code === locale.value) || languages[0])
const navCategories = computed(() => categories.value.slice(0, 10))

const setLocale = (code) => { locale.value = code; localStorage.setItem('locale', code); showLang.value = false }
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'

const onSearchInput = () => {
  clearTimeout(suggestTimer)
  if (!searchQuery.value.trim() || searchQuery.value.trim().length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  suggestTimer = setTimeout(async () => {
    try {
      const resp = await fetch(`${WORKER_URL}/api/search?q=${encodeURIComponent(searchQuery.value.trim())}&limit=5`)
      const data = await resp.json()
      suggestions.value = data.hits || data.data || []
      showSuggestions.value = suggestions.value.length > 0
    } catch (e) { suggestions.value = [] }
  }, 300)
}

const goToProduct = (product) => {
  showSuggestions.value = false
  router.push(`/product/${product.objectID || product.id}`)
}

let searchTimer = null
const doSearch = () => {
  clearTimeout(searchTimer)
  showSuggestions.value = false
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
  try {
    const { data } = await fetchCategories()
    categories.value = data || []
  } catch (e) { console.warn('MainLayout: fetchCategories failed:', e.message) }

  // Header scroll shadow effect
  const header = document.querySelector('header')
  const handleScroll = () => {
    if (window.scrollY > 10) {
      header?.classList.add('scrolled')
    } else {
      header?.classList.remove('scrolled')
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Cleanup on unmount (though layout persists)
})
</script>

<style scoped>
/* ===== TOP BAR ===== */
.top-bar { background: var(--brand-nav, #232F3E); padding: 0.375rem 0; font-size: 0.75rem; }
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
.promo-top { color: var(--brand-primary, #FF9900) !important; font-weight: 600; }
.promo-top i { color: var(--brand-primary, #FF9900); }
.lang-switch { position: relative; cursor: pointer; color: #ccc; display: flex; align-items: center; gap: 0.25rem; }
.lang-switch:hover { color: #fff; }
.theme-toggle { background: none; border: none; color: #ccc; cursor: pointer; padding: 4px 8px; font-size: 14px; transition: color 0.15s; display: flex; align-items: center; }
.theme-toggle:hover { color: var(--brand-primary, #FF9900); }
.lang-dropdown { position: absolute; top: 100%; right: 0; background: #fff; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 200; min-width: 140px; overflow: hidden; }
.lang-dropdown div { padding: 0.5rem 0.75rem; font-size: 0.8125rem; color: #333; cursor: pointer; transition: background 0.15s; }
.lang-dropdown div:hover { background: #f5f5f5; }
.lang-dropdown div.active { background: var(--brand-primary, #FF9900); color: #fff; }

.header {
  background: var(--brand-dark, #131921);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 400;
  overflow: visible;
}
.header.scrolled {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

/* Mobile: ensure header stays on top with proper background */
@media (max-width: 767px) {
  header {
    background: var(--brand-dark, #131921);
  }
}
.header-inner { display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0; }
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
.search-bar { display: flex; height: 2.75rem; border-radius: 8px; overflow: hidden; background: #fff; border: 2px solid transparent; transition: border-color 0.2s; }
.search-bar:focus-within { border-color: #febd69; box-shadow: 0 0 0 2px rgba(254,189,105,0.3); }
.search-cat { border: none; background: #f3f3f3; padding: 0 0.625rem; font-size: 0.75rem; color: #555; border-right: 1px solid #cdcdcd; cursor: pointer; outline: none; min-width: 4.5rem; }
.search-bar input { flex: 1; padding: 0 0.875rem; border: none; font-size: 0.9375rem; outline: none; min-width: 0; background: transparent; }
.search-bar input::placeholder { color: #999; }
.btn-search { padding: 0 1.125rem; background: #febd69; border: none; cursor: pointer; font-size: 1rem; color: var(--brand-dark, #131921); transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-search:hover { background: #f3a847; }

/* Search Suggestions */
.search-wrapper { position: relative; }
.search-suggestions {
  position: absolute; top: 100%; left: 0; right: 0;
  background: var(--white, #fff);
  border: 1px solid var(--neutral-200, #E7E7E7);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 500;
  max-height: 400px;
  overflow-y: auto;
}
.search-suggestion {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.search-suggestion:hover { background: var(--neutral-50, #FAFAFA); }
.search-suggestion__img {
  width: 40px; height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.search-suggestion__placeholder {
  width: 40px; height: 40px;
  border-radius: 6px;
  background: var(--neutral-200, #E7E7E7);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--neutral-500, #888);
  flex-shrink: 0;
}
.search-suggestion__info { flex: 1; min-width: 0; }
.search-suggestion__name {
  font-size: 13px; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: var(--neutral-900, #0F1111);
}
.search-suggestion__price {
  font-size: 12px; color: var(--neutral-600, #666);
}
.search-suggestion__badge {
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  font-size: 10px; font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.search-suggestion--all {
  border-top: 1px solid var(--neutral-200, #E7E7E7);
  color: var(--brand-accent, #007185);
  font-size: 13px; font-weight: 500;
  gap: 8px;
}
.search-suggestion--all:hover { background: var(--brand-accent-light, #E0F2F5); }

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
.cart-badge { position: absolute; top: -0.5rem; right: -0.375rem; background: var(--brand-primary, #FF9900); color: var(--brand-dark, #131921); min-width: 1.125rem; height: 1.125rem; border-radius: 0.5625rem; font-size: 0.6875rem; display: flex; align-items: center; justify-content: center; font-weight: 700; padding: 0 0.125rem; }
.cart-action { flex-direction: row; align-items: center; gap: 0.375rem; }
.cart-action strong { font-size: 0.75rem; }

.sub-header {
  position: sticky;
  top: var(--header-height, 60px);
  z-index: 350;
  background: var(--brand-nav, #232F3E);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sub-header-inner { display: flex; justify-content: space-between; align-items: center; }
.sub-left { display: flex; align-items: center; gap: 0; overflow-x: auto; }
.sub-left::-webkit-scrollbar { height: 0; }
.all-menu { display: flex; align-items: center; gap: 0.375rem; color: #fff; font-weight: 700; font-size: 0.8125rem; padding: 0.5rem 0.75rem; cursor: pointer; border: 1px solid transparent; border-radius: 2px; transition: border-color 0.15s; white-space: nowrap; }
.all-menu:hover { border-color: #fff; }
.sub-link { color: #ddd; text-decoration: none; padding: 0.5rem 0.625rem; font-size: 0.8125rem; white-space: nowrap; transition: color 0.15s; border: 1px solid transparent; border-radius: 2px; }
.sub-link:hover { color: #fff; border-color: #fff; }
.sub-right { flex-shrink: 0; }
.promo-link { color: var(--brand-primary, #FF9900) !important; font-weight: 600; }
.promo-link i { color: var(--brand-primary, #FF9900); }

/* ===== MOBILE SIDEBAR ===== */
.mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }
.mobile-sidebar { position: fixed; top: 0; left: 0; width: min(85vw, 22rem); height: 100dvh; background: #fff; z-index: 250; overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s; box-shadow: 0 16px 48px rgba(0,0,0,0.16); }
.mobile-sidebar.open { transform: translateX(0); }
.mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: var(--brand-dark, #131921); }
.mobile-logo { height: 1.5rem; width: auto; object-fit: contain; }
.mobile-close { background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer; }
.mobile-user { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem; background: var(--brand-nav, #232F3E); color: #fff; }
.mobile-avatar { width: 2.5rem; height: 2.5rem; background: var(--brand-primary, #FF9900); color: var(--brand-dark, #131921); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
.mobile-nav { padding: 0.5rem 0; }
.mobile-nav-title { padding: 0.75rem 1.25rem 0.375rem; font-size: 0.75rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #eee; margin-top: 0.25rem; }
.mobile-nav a, .mobile-nav button { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; color: #333; text-decoration: none; font-size: 0.875rem; border: none; background: none; width: 100%; cursor: pointer; transition: background 0.15s; }
.mobile-nav a:hover, .mobile-nav button:hover { background: #f5f5f5; }
.mobile-nav i { width: 1.25rem; text-align: center; color: #555; font-size: 0.875rem; }
.mobile-logout { color: #CC0C39 !important; border-top: 1px solid #eee !important; margin-top: 0.5rem; }

/* ===== MAIN CONTENT ===== */
.main-content {
  min-height: 60vh;
  padding-top: 0;
}

/* Mobile: ensure content doesn't get hidden under fixed header and tab bar */
@media (max-width: 767px) {
  .main-content {
    padding-top: calc(var(--header-height, 60px) + 8px);
    padding-bottom: calc(var(--tab-bar-height, 56px) + 24px);
  }
}
.back-to-top { background: #37475a; text-align: center; padding: 0.75rem; cursor: pointer; transition: background 0.2s; }
.back-to-top:hover { background: #485769; }
.back-to-top span { color: #fff; font-size: 0.8125rem; }
.footer { background: var(--brand-nav, #232F3E); }
.footer-main { padding: 2.5rem 0; }
.footer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
.footer-col h4 { font-size: 0.9375rem; font-weight: 700; margin: 0 0 1rem; color: #fff; }
.footer-col ul { list-style: none; padding: 0; margin: 0; }
.footer-col li { margin-bottom: 0.5rem; }
.footer-col a { color: #ddd; text-decoration: none; font-size: 0.8125rem; transition: color 0.15s; }
.footer-col a:hover { color: var(--brand-primary, #FF9900); text-decoration: underline; }
.payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.pay-icon { background: rgba(255,255,255,0.08); padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.75rem; color: #ccc; display: flex; align-items: center; gap: 0.5rem; transition: background 0.15s; }
.pay-icon:hover { background: rgba(255,255,255,0.12); }
.pay-icon i { color: var(--brand-primary, #FF9900); width: 1rem; text-align: center; }
.footer-bottom { background: #0d1117; padding: 1rem 0; }
.footer-bottom-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.footer-bottom-left p { font-size: 0.75rem; color: #666; margin: 0; }
.footer-bottom-links { display: flex; gap: 1.5rem; }
.footer-bottom-links a { color: #888; font-size: 0.75rem; text-decoration: none; transition: color 0.15s; }
.footer-bottom-links a:hover { color: var(--brand-primary, #FF9900); }

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
  .search-bar { height: 2.5rem; border-radius: 8px; border: 2px solid rgba(255,255,255,0.3); }
  .search-bar:focus-within { border-color: #febd69; }
  .search-bar input { font-size: 1rem; padding: 0 0.75rem; }
  .search-bar input::placeholder { color: #aaa; }
  .btn-search { padding: 0 1rem; font-size: 1rem; }
  .header-actions { gap: 0; }
  .action-text { display: none; }
  .header-action { padding: 0.375rem; }
  .account-action, .orders-action { display: none; }
  .cart-action { flex-direction: column; }
  .cart-action strong { display: none; }
  .sub-left { gap: 0; }
  .sub-link { padding: 0.375rem 0.5rem; font-size: 0.75rem; }
  .sub-link i { font-size: 0.875rem; margin-right: 0.25rem; }
  .sub-link span { display: inline; }
  .sub-right { display: none; }
  .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .footer-bottom-inner { flex-direction: column; text-align: center; }
  .footer-bottom-links { justify-content: center; }
  .btn-subscribe { border-radius: 4px; }
  .payment-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .header-inner { gap: 0.375rem; }
  .header-action { padding: 0.25rem; }
  .header-action i { font-size: 1rem; }
}

/* ===== MOBILE MAIN CONTENT PADDING (for MobileTabBar) ===== */
@media (max-width: 767px) {
  .main-content { padding-bottom: calc(var(--tab-bar-height, 56px) + 16px); }
}

img { max-width: 100%; height: auto; }
</style>
