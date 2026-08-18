<template>
  <div class="home">
    <!-- Error State -->
    <div v-if="error" class="error-banner">
      <div class="container">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
        <button @click="retryLoad"><i class="fas fa-redo"></i> Retry</button>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-layout">
          <aside class="sidebar-cats" aria-label="Categories">
            <div class="sidebar-title">Categories</div>
            <div v-for="cat in categories.slice(0, 12)" :key="cat.id"
                 class="sidebar-item" @click="$router.push(`/search?category=${cat.id}`)">
              <span class="si-icon" :style="{ background: cat.color || '#FF9900' }">{{ cat.icon || (cat.name || '?')[0] }}</span>
              <span class="si-name">{{ cat.name }}</span>
              <i class="fas fa-chevron-right si-arrow"></i>
            </div>
          </aside>
          <div class="hero-banner">
            <div class="banner-slide" :class="{ active: bannerIndex === i }" v-for="(banner, i) in banners" :key="i">
              <div class="banner-content" :style="{ background: banner.bg }">
                <div class="banner-text">
                  <span class="banner-tag">{{ banner.tag }}</span>
                  <h2>{{ banner.title }}</h2>
                  <p>{{ banner.desc }}</p>
                  <router-link :to="banner.link" class="btn-banner">{{ banner.btn }}</router-link>
                </div>
                <div class="banner-visual">{{ banner.emoji }}</div>
              </div>
            </div>
            <button class="banner-arrow banner-arrow-left" @click="prevBanner"><i class="fas fa-chevron-left"></i></button>
            <button class="banner-arrow banner-arrow-right" @click="nextBanner"><i class="fas fa-chevron-right"></i></button>
            <div class="banner-dots">
              <span v-for="(_, i) in banners" :key="i" :class="{ active: bannerIndex === i }" @click="bannerIndex = i"></span>
            </div>
          </div>
          <div class="hero-side-cards">
            <div class="side-card" v-for="(card, i) in sideCards" :key="i" :style="{ background: card.bg }">
              <i :class="card.icon"></i>
              <div><strong>{{ card.title }}</strong><small>{{ card.desc }}</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Flash Sale -->
    <section class="flash-section">
      <div class="container">
        <div class="flash-header">
          <div class="flash-left">
            <i class="fas fa-bolt flash-icon"></i>
            <h2 class="flash-title">Flash Sale</h2>
            <div class="flash-countdown">
              <span class="cd-num">{{ hours }}</span><span class="cd-sep">:</span>
              <span class="cd-num">{{ minutes }}</span><span class="cd-sep">:</span>
              <span class="cd-num">{{ seconds }}</span>
            </div>
          </div>
          <router-link to="/discounts" class="flash-see-all">See All &gt;</router-link>
        </div>
        <!-- Loading with timeout -->
        <div v-if="loading && !loadTimedOut" class="flash-products">
          <div v-for="i in 6" :key="i" class="flash-card skel-card">
            <div class="skel-img skeleton-shimmer"></div>
            <div class="skel-body"><div class="skel-line skeleton-shimmer" style="width:60%"></div></div>
          </div>
        </div>
        <!-- Timeout message -->
        <div v-else-if="loadTimedOut && flashProducts.length === 0" class="empty-state">
          <i class="fas fa-wifi"></i>
          <p>Unable to load data. Please check your connection.</p>
          <button class="btn-primary" @click="retryLoad">Retry</button>
        </div>
        <!-- Data -->
        <div v-else-if="flashProducts.length" class="flash-products">
          <div v-for="p in flashProducts" :key="p.id" class="flash-card" @click="$router.push(`/product/${p.id}`)">
            <div class="fc-image">
              <img loading="lazy" v-if="p.images?.[0] || p.image" :src="p.images?.[0] || p.image" :alt="p.name" />
              <div v-else class="fc-img-placeholder" :style="{ background: getGradient(p.name) }"><span>{{ (p.name || '?')[0] }}</span></div>
              <div class="fc-discount-tag">-{{ p.discount || 30 }}%</div>
            </div>
            <div class="fc-info">
              <div class="fc-price">${{ p.price }}</div>
              <div v-if="p.original_price" class="fc-original">${{ p.original_price }}</div>
              <div class="fc-sold-bar">
                <div class="fc-bar-fill" :style="{ width: Math.min(100, ((p.sales_count||0)/((p.sales_count||0)+50))*100)+'%' }"></div>
                <span class="fc-sold-text">Sold {{ formatSales(p.sales_count) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="cat-icons-section">
      <div class="container">
        <h2 class="section-title">Categories</h2>
        <div class="cat-icons-scroll">
          <div v-for="cat in categories" :key="cat.id" class="cat-icon-item" @click="$router.push(`/search?category=${cat.id}`)">
            <div class="ci-circle" :style="{ background: cat.color || '#FF9900' }"><span>{{ cat.icon || (cat.name || '?')[0] }}</span></div>
            <span class="ci-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Sellers -->
    <section class="mall-section">
      <div class="container">
        <div class="mall-header">
          <h2><i class="fas fa-store"></i> Top Sellers</h2>
          <router-link to="/search-store" class="view-all">View All &gt;</router-link>
        </div>
        <div v-if="sellers.length" class="mall-grid">
          <div v-for="s in sellers.slice(0, 8)" :key="s.id" class="mall-card" @click="$router.push(`/store/${s.id}`)">
            <div class="mc-banner" :style="{ background: getGradient(s.name || s.store_name) }">
              <img loading="lazy" v-if="s.logo || s.store_logo" :src="s.logo || s.store_logo" :alt="s.name" class="mc-avatar-img" />
              <div v-else class="mc-avatar">{{ (s.name || s.store_name)?.[0] }}</div>
            </div>
            <div class="mc-info">
              <h4>{{ s.name || s.store_name }}</h4>
              <div class="mc-stats">
                <span>{{ s.goods_count || 0 }} Products</span>
                <span class="mc-rating">{{ s.rating || '4.8' }} <i class="fas fa-star"></i></span>
              </div>
              <button class="btn-follow-store" @click.stop>Follow</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Grid -->
    <section class="discover-section">
      <div class="container">
        <div class="discover-header">
          <h2>Daily Discover</h2>
          <div class="discover-tabs">
            <button :class="{ active: sort === 'popular' }" @click="sort = 'popular'">Popular</button>
            <button :class="{ active: sort === 'newest' }" @click="sort = 'newest'">Newest</button>
            <button :class="{ active: sort === 'price' }" @click="sort = 'price'">Price</button>
          </div>
        </div>
        <div class="filter-tags">
          <span class="filter-tag" :class="{ active: !activeFilter }" @click="activeFilter = null">All</span>
          <span class="filter-tag" v-for="cat in categories.slice(0, 8)" :key="cat.id" :class="{ active: activeFilter === cat.id }" @click="activeFilter = cat.id">{{ cat.name }}</span>
        </div>
        <!-- Loading with timeout -->
        <div v-if="loading && !loadTimedOut" class="product-grid-amazon">
          <div v-for="i in 20" :key="i" class="pg-card skel-card"><div class="skel-img skeleton-shimmer"></div><div class="skel-body"><div class="skel-line skeleton-shimmer" style="width:90%"></div><div class="skel-line skeleton-shimmer" style="width:60%"></div></div></div>
        </div>
        <!-- Timeout -->
        <div v-else-if="loadTimedOut && products.length === 0" class="empty-state">
          <i class="fas fa-wifi"></i>
          <p>Unable to load products. Please check your connection and try again.</p>
          <button class="btn-primary" @click="retryLoad"><i class="fas fa-redo"></i> Retry</button>
        </div>
        <!-- Products -->
        <div v-else-if="sortedProducts.length" class="product-grid-amazon">
          <ProductCard
            v-for="p in sortedProducts"
            :key="p.id"
            :product="p"
            @add-to-cart="addToCart(p)"
          />
        </div>
        <div v-else class="empty-state"><i class="fas fa-box-open"></i><p>No products found.</p></div>
        <div v-if="sortedProducts.length >= limit" class="load-more-wrapper">
          <button @click="loadMore" class="btn-load-more">Load More</button>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section class="services-bar">
      <div class="container">
        <div class="services-row">
          <div class="svc-item"><i class="fas fa-shield-alt"></i><div><strong>Secure Payment</strong><p>All transactions encrypted</p></div></div>
          <div class="svc-item"><i class="fas fa-truck"></i><div><strong>Fast Delivery</strong><p>2-7 business days</p></div></div>
          <div class="svc-item"><i class="fas fa-undo"></i><div><strong>Free Returns</strong><p>7-day return policy</p></div></div>
          <div class="svc-item"><i class="fas fa-headset"></i><div><strong>24/7 Support</strong><p>Always here to help</p></div></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase, fetchProducts, fetchCategories, fetchSellers } from '@/services/supabase'
import ProductCard from '@/components/product/ProductCard.vue'

const categories = ref([])
const products = ref([])
const sellers = ref([])
const loading = ref(true)
const error = ref(null)
const loadTimedOut = ref(false)
const sort = ref('popular')
const limit = ref(20)
const bannerIndex = ref(0)
const activeFilter = ref(null)
let bannerTimer = null
let countdownTimer = null
let realtimeChannel = null
let loadTimeout = null

const banners = [
  { tag: '🔥 Hot Deals', title: 'Mega Sale Festival', desc: 'Up to 70% OFF on selected items', btn: 'Shop Now', link: '/discounts', bg: 'linear-gradient(135deg, #232f3e, #37475a)', emoji: '🛍️' },
  { tag: '⭐ New Users', title: 'Welcome Bonus $10', desc: 'Sign up and get instant coupon', btn: 'Register', link: '/register', bg: 'linear-gradient(135deg, #007185, #00a0c4)', emoji: '🎁' },
  { tag: '🚚 Free Shipping', title: 'Free Delivery Week', desc: 'No minimum order required', btn: 'Browse', link: '/commodity', bg: 'linear-gradient(135deg, #e68a00, #ff9900)', emoji: '📦' }
]

const sideCards = [
  { icon: 'fas fa-user-plus', title: 'New User?', desc: 'Get Coupon', bg: 'linear-gradient(135deg, #FF9900, #ffad33)' },
  { icon: 'fas fa-percentage', title: 'Daily Deals', desc: 'Up to 50% OFF', bg: 'linear-gradient(135deg, #067D62, #00a07a)' },
  { icon: 'fas fa-truck-fast', title: 'Free Shipping', desc: 'Min. $30 order', bg: 'linear-gradient(135deg, #007185, #00a0c4)' }
]

const hours = ref('02')
const minutes = ref('45')
const seconds = ref('30')

// Bug #3 fix: Use UTC-based countdown (server time reference)
const startCountdown = () => {
  const updateCountdown = () => {
    const now = new Date()
    // Target: end of current UTC day
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    const diff = Math.max(0, Math.floor((endOfDay - now) / 1000))
    hours.value = String(Math.floor(diff / 3600)).padStart(2, '0')
    minutes.value = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
    seconds.value = String(diff % 60).padStart(2, '0')
  }
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

const startBannerRotation = () => { bannerTimer = setInterval(() => { bannerIndex.value = (bannerIndex.value + 1) % banners.length }, 5000) }
const nextBanner = () => { bannerIndex.value = (bannerIndex.value + 1) % banners.length; resetBannerTimer() }
const prevBanner = () => { bannerIndex.value = (bannerIndex.value - 1 + banners.length) % banners.length; resetBannerTimer() }
const resetBannerTimer = () => { if (bannerTimer) clearInterval(bannerTimer); startBannerRotation() }

const flashProducts = computed(() => {
  const flash = products.value.filter(p => p.discount || (p.sales_count && p.sales_count > 5000))
  return flash.length ? flash.slice(0, 8) : products.value.slice(0, 8)
})

const sortedProducts = computed(() => {
  let result = [...products.value]
  if (activeFilter.value) result = result.filter(p => String(p.category_id) === String(activeFilter.value))
  result = result.slice(0, limit.value)
  if (sort.value === 'price') result.sort((a, b) => a.price - b.price)
  if (sort.value === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  return result
})

const formatSales = (n) => { if (!n) return '0'; if (n >= 10000) return (n/10000).toFixed(1)+'w'; if (n >= 1000) return (n/1000).toFixed(1)+'k'; return String(n) }
const getGradient = (name) => { const colors = ['#FF9900','#007185','#067D62','#131921','#e68a00','#232f3e']; const idx = (name?.charCodeAt(0)||0)%colors.length; return `linear-gradient(135deg, ${colors[idx]}aa, ${colors[(idx+3)%colors.length]}aa)` }
const addToCart = async (product) => {
  try {
    await userStore.addToCart(product.id, 1)
    if (window.__toast) window.__toast.show('Added to cart!', 'success')
  } catch (e) {
    if (window.__toast) window.__toast.show('Please sign in first', 'error')
  }
}

const loadMore = () => { limit.value += 20 }

const loadData = async () => {
  loading.value = true
  error.value = null
  loadTimedOut.value = false

  // Set a 8-second timeout for loading
  loadTimeout = setTimeout(() => { loadTimedOut.value = true }, 8000)

  try {
    const [catRes, prodRes, sellerRes] = await Promise.all([
      fetchCategories().catch(() => ({ data: [] })),
      fetchProducts({ limit: 100 }).catch(() => ({ data: [] })),
      fetchSellers({ recommended: true }).catch(() => ({ data: [] }))
    ])

    categories.value = catRes.data || []
    products.value = prodRes.data || []
    sellers.value = sellerRes.data || []

    if (products.value.length === 0 && categories.value.length === 0) {
      error.value = 'Unable to connect to the server. Please try again later.'
    }
  } catch (e) {
    console.error('Failed to load data:', e)
    error.value = 'An error occurred while loading data.'
  } finally {
    loading.value = false
    clearTimeout(loadTimeout)
  }
}

const retryLoad = () => {
  error.value = null
  loadData()
}

onMounted(() => {
  startCountdown()
  startBannerRotation()
  loadData()

  // Realtime subscription
  realtimeChannel = supabase.channel('products-home')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { loadData() })
    .subscribe()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (bannerTimer) clearInterval(bannerTimer)
  if (loadTimeout) clearTimeout(loadTimeout)
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(0.625rem, 2vw, 1rem); }

/* Error Banner */
.error-banner { background: #FFF3CD; border-bottom: 1px solid #FFEEBA; padding: 0.75rem 0; }
.error-banner .container { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #856404; }
.error-banner i.fa-exclamation-triangle { color: #856404; }
.error-banner button { margin-left: auto; padding: 0.25rem 0.75rem; background: #856404; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }

/* Hero */
.hero-section { background: var(--bg); padding: 0.75rem 0; }
.hero-layout { display: grid; grid-template-columns: 200px 1fr 220px; gap: 0.75rem; min-height: 14rem; }
.sidebar-cats { background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.sidebar-title { padding: 0.625rem 0.875rem; font-weight: 700; font-size: 0.875rem; background: #232f3e; color: #fff; }
.sidebar-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f5f5f5; }
.sidebar-item:hover { background: #f0f0f0; }
.si-icon { width: 1.5rem; height: 1.5rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; color: #fff; flex-shrink: 0; }
.si-name { font-size: 0.75rem; color: #333; flex: 1; }
.si-arrow { font-size: 0.5rem; color: #ccc; }
.hero-banner { position: relative; border-radius: 4px; overflow: hidden; min-height: 10rem; }
.banner-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.5s; pointer-events: none; }
.banner-slide.active { opacity: 1; pointer-events: auto; }
.banner-content { height: 100%; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; }
.banner-text { max-width: 55%; }
.banner-tag { display: inline-block; background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; color: #fff; margin-bottom: 0.5rem; }
.banner-text h2 { font-size: clamp(0.875rem, 2vw, 1.125rem); color: #fff; margin-bottom: 0.25rem; }
.banner-text p { font-size: 0.75rem; color: rgba(255,255,255,0.85); margin-bottom: 0.75rem; }
.btn-banner { padding: 0.375rem 1rem; background: #FF9900; color: #131921; border-radius: 3px; font-weight: 600; font-size: 0.75rem; text-decoration: none; }
.btn-banner:hover { background: #e68a00; }
.banner-visual { font-size: 2rem; }
.banner-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 2rem; height: 2.5rem; background: rgba(0,0,0,0.3); border: none; color: #fff; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; }
.banner-arrow:hover { background: rgba(0,0,0,0.6); }
.banner-arrow-left { left: 0; border-radius: 0 4px 4px 0; }
.banner-arrow-right { right: 0; border-radius: 4px 0 0 4px; }
.banner-dots { position: absolute; bottom: 0.75rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; z-index: 2; }
.banner-dots span { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }
.banner-dots span.active { background: #FF9900; width: 1.25rem; border-radius: 0.25rem; }
.hero-side-cards { display: flex; flex-direction: column; gap: 0.5rem; }
.side-card { padding: 1rem; border-radius: 4px; color: #fff; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
.side-card:hover { transform: translateY(-2px); }
.side-card i { font-size: 1.5rem; }
.side-card strong { font-size: 0.8125rem; display: block; }
.side-card small { font-size: 0.6875rem; opacity: 0.85; }

/* Flash Sale */
.flash-section { background: #fff; padding: 0.35rem 0; margin-top: 0.25rem; }
.flash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.flash-left { display: flex; align-items: center; gap: 0.75rem; }
.flash-icon { font-size: 1rem; color: #FF9900; }
.flash-title { font-size: 0.9375rem; font-weight: 700; margin: 0; }
.flash-countdown { display: flex; align-items: center; gap: 0.25rem; }
.cd-num { background: #131921; color: #fff; padding: 0.125rem 0.375rem; border-radius: 2px; font-weight: 700; font-size: 0.75rem; min-width: 1.25rem; text-align: center; }
.cd-sep { font-weight: 700; color: #131921; }
.flash-see-all { color: #007185; font-size: 0.8125rem; text-decoration: none; font-weight: 600; }
.flash-products { display: flex; gap: 0.625rem; overflow-x: auto; padding-bottom: 0.5rem; }
.flash-products::-webkit-scrollbar { height: 0; }
.flash-card { min-width: 7rem; border: 1px solid #eee; border-radius: 3px; overflow: hidden; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.flash-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); transform: translateY(-2px); }
.fc-image { position: relative; }
.fc-image img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.fc-img-placeholder { height: 0; padding-bottom: 100%; position: relative; }
.fc-img-placeholder span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2.5rem; color: rgba(255,255,255,0.5); }
.fc-discount-tag { position: absolute; top: 0; right: 0; background: #CC0C39; color: #fff; padding: 0.125rem 0.375rem; font-size: 0.625rem; font-weight: 700; }
.fc-info { padding: 0.25rem 0.375rem; }
.fc-price { font-size: 0.8125rem; font-weight: 700; color: #B12704; }
.fc-original { font-size: 0.625rem; color: #999; text-decoration: line-through; }
.fc-sold-bar { margin-top: 0.375rem; position: relative; }
.fc-bar-fill { height: 0.75rem; background: linear-gradient(90deg, #FF9900, #e68a00); border-radius: 0.375rem; min-width: 10%; }
.fc-sold-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.5625rem; color: #fff; font-weight: 600; white-space: nowrap; }

/* Categories */
.cat-icons-section { background: #fff; padding: 1rem 0; margin-top: 0.5rem; }
.section-title { font-size: 1rem; font-weight: 600; margin: 0 0 0.75rem; color: #0F1111; }
.cat-icons-scroll { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.25rem; }
.cat-icons-scroll::-webkit-scrollbar { height: 0; }
.cat-icon-item { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; min-width: 4.5rem; cursor: pointer; }
.cat-icon-item:hover .ci-circle { transform: scale(1.1); }
.ci-circle { width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #fff; transition: transform 0.2s; }
.ci-name { font-size: 0.6875rem; text-align: center; color: #007185; white-space: nowrap; }

/* Sellers */
.mall-section { background: #fff; padding: 1rem 0; margin-top: 0.5rem; }
.mall-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.mall-header h2 { font-size: 1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.mall-header h2 i { color: #FF9900; }
.view-all { color: #007185; font-size: 0.8125rem; text-decoration: none; font-weight: 600; }
.mall-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.mall-card { border: 1px solid #eee; border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.mall-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.mc-banner { height: 5rem; display: flex; align-items: center; justify-content: center; }
.mc-avatar { width: 2.75rem; height: 2.75rem; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.125rem; font-weight: 700; color: #FF9900; }
.mc-avatar-img { width: 2.75rem; height: 2.75rem; border-radius: 50%; object-fit: cover; }
.mc-info { padding: 0.625rem; text-align: center; }
.mc-info h4 { font-size: 0.8125rem; margin: 0 0 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-stats { display: flex; justify-content: center; gap: 0.625rem; font-size: 0.6875rem; color: #999; margin-bottom: 0.5rem; }
.mc-rating { color: #FF9900; }
.btn-follow-store { padding: 0.25rem 0.875rem; border: 1px solid #FF9900; color: #FF9900; background: none; border-radius: 3px; cursor: pointer; font-size: 0.75rem; }
.btn-follow-store:hover { background: #FF9900; color: #131921; }

/* Product Grid */
.discover-section { background: var(--bg); padding: 1rem 0; }
.discover-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.discover-header h2 { font-size: 1.125rem; font-weight: 700; margin: 0; color: #0F1111; }
.discover-tabs { display: flex; gap: 0.375rem; }
.discover-tabs button { padding: 0.375rem 1rem; border: 1px solid #D5D9D9; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.8125rem; }
.discover-tabs button.active { background: #0F1111; color: #fff; border-color: #0F1111; }
.filter-tags { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; overflow-x: auto; }
.filter-tags::-webkit-scrollbar { height: 0; }
.filter-tag { padding: 0.3125rem 0.875rem; background: #fff; border: 1px solid #D5D9D9; border-radius: 20px; font-size: 0.75rem; cursor: pointer; white-space: nowrap; }
.filter-tag.active, .filter-tag:hover { background: #0F1111; color: #fff; border-color: #0F1111; }
.product-grid-amazon { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
.pg-card { background: #fff; border-radius: 4px; overflow: hidden; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.pg-card:hover { border-color: #FF9900; box-shadow: 0 2px 8px rgba(255,153,0,0.15); transform: translateY(-2px); }
.pg-img { position: relative; overflow: hidden; }
.pg-img img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.pg-img-placeholder { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 48px; background: linear-gradient(135deg, #f8f8f8, #eee); }
.pg-img-placeholder span { font-size: 36px; font-weight: 700; color: #ddd; }
.pg-badge { position: absolute; top: 0; left: 0; background: #CC0C39; color: #fff; padding: 2px 6px; font-size: 11px; font-weight: 700; }
.pg-body { padding: 0.5rem 0.625rem 0.75rem; }
.pg-name { font-size: 0.8125rem; color: #007185; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 2.25rem; margin-bottom: 0.375rem; }
.pg-card:hover .pg-name { color: #c77a00; }
.pg-rating { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.25rem; }
.pg-stars { font-size: 0.625rem; color: #FF9900; }
.pg-reviews { font-size: 0.6875rem; color: #007185; }
.pg-price-row { display: flex; align-items: baseline; gap: 0.375rem; margin-bottom: 0.25rem; }
.pg-price { font-size: 1.125rem; font-weight: 400; color: #0F1111; }
.pg-original { font-size: 0.75rem; color: #999; text-decoration: line-through; }
.pg-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.pg-deal { background: #CC0C39; color: #fff; padding: 1px 4px; border-radius: 2px; font-size: 0.625rem; font-weight: 700; }
.pg-shipping { font-size: 0.6875rem; color: #565959; }
.pg-seller { font-size: 0.6875rem; color: #565959; }
.load-more-wrapper { text-align: center; padding: 1.5rem 0 0.5rem; }
.btn-load-more { padding: 0.625rem 3rem; background: #fff; border: 1px solid #D5D9D9; border-radius: 20px; cursor: pointer; font-size: 0.875rem; color: #0F1111; }
.btn-load-more:hover { background: #f7fafa; border-color: #007185; }
.empty-state { text-align: center; padding: 3rem 1rem; color: #999; }
.empty-state i { font-size: 3rem; color: #ddd; margin-bottom: 1rem; display: block; }
.empty-state .btn-primary { margin-top: 1rem; padding: 0.5rem 1.5rem; background: #FF9900; color: #131921; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; }

/* Skeleton */
.skel-card { animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.skel-img { width: 100%; aspect-ratio: 1; background: #f0f0f0; }
.skel-body { padding: 0.5rem; }
.skel-line { height: 0.75rem; background: #f0f0f0; border-radius: 4px; margin-bottom: 0.375rem; }

/* Services */
.services-bar { background: #fff; padding: 1rem 0; margin-top: 0.5rem; border-top: 1px solid #D5D9D9; }
.services-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.svc-item { display: flex; align-items: center; gap: 0.625rem; }
.svc-item i { font-size: 1.375rem; color: #FF9900; flex-shrink: 0; }
.svc-item strong { font-size: 0.8125rem; display: block; }
.svc-item p { font-size: 0.6875rem; color: #565959; margin: 0.125rem 0 0; }

/* Responsive */
@media (max-width: 1024px) { .hero-layout { grid-template-columns: 1fr; } .sidebar-cats { display: none; } .hero-side-cards { flex-direction: row; } .product-grid-amazon { grid-template-columns: repeat(4, 1fr); } .mall-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .hero-side-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; } .hero-banner { min-height: 10rem; } .product-grid-amazon { grid-template-columns: repeat(3, 1fr); } .mall-grid { grid-template-columns: repeat(2, 1fr); } .services-row { grid-template-columns: repeat(2, 1fr); } .banner-content { padding: 1rem; } .banner-text h2 { font-size: 1rem; } .banner-visual { font-size: 2rem; } }
@media (max-width: 480px) { .product-grid-amazon { grid-template-columns: repeat(2, 1fr); gap: 0.375rem; } .pg-body { padding: 0.375rem; } .pg-name { font-size: 0.75rem; min-height: 2rem; } .pg-price { font-size: 0.875rem; } .hero-side-cards { grid-template-columns: 1fr; } .side-card { padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; } .side-card small { display: none; } .banner-content { padding: 0.75rem; } .banner-text { max-width: 60%; } .banner-text h2 { font-size: 0.875rem; } .banner-text p { font-size: 0.6875rem; } .banner-visual { font-size: 1.5rem; } .flash-card { min-width: 7rem; } .fc-info { padding: 0.25rem; } .fc-price { font-size: 0.75rem; } .mall-grid { grid-template-columns: repeat(2, 1fr); gap: 0.375rem; } .cat-icon-item { min-width: 3.75rem; } }
</style>
