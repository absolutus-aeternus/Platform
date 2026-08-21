<template>
<div class="page-wrapper">
  <div class="store-page">
    <div class="container">
      <div v-if="loading" class="loading">Loading store...</div>
      <div v-else-if="!store" class="not-found">Store not found</div>
      <div v-else>
        <!-- Store Header -->
        <div class="store-header">
          <div class="store-banner" :style="{ background: getGradient(store.name || store.store_name) }"></div>
          <div class="store-profile">
            <div class="store-avatar">
              <img loading="lazy" v-if="store.logo || store.store_logo" :src="store.logo || store.store_logo" :alt="store.name" class="store-logo-img" />
              <span v-else>{{ (store.name || store.store_name || '?')[0] }}</span>
            </div>
            <div class="store-info">
              <h1>{{ store.name || store.store_name }} <VerifiedBadge size="md" /></h1>
              <p class="store-stats">
                <span><i class="fas fa-box"></i> {{ store.goods_count || 0 }} Products</span>
                <span><i class="fas fa-star" style="color:var(--brand-primary, #FF9900)"></i> {{ store.rating || '4.8' }} Rating</span>
                <span><i class="fas fa-users"></i> {{ store.followers || 0 }} Followers</span>
              </p>
              <p v-if="store.description" class="store-desc">{{ store.description }}</p>
            </div>
            <button class="btn-follow" :class="{ following: isFollowing }" @click="toggleFollow">
              <i :class="isFollowing ? 'fas fa-check' : 'fas fa-plus'"></i>
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="store-tabs">
          <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All Products ({{ products.length }})</button>
          <button :class="{ active: tab === 'recommended' }" @click="tab = 'recommended'">Recommended</button>
        </div>

        <!-- Products Grid -->
        <div v-if="filteredProducts.length === 0" class="empty">No products yet</div>
        <div v-else class="product-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="product-img">
              <img loading="lazy" v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name" />
              <div v-else class="img-placeholder"><span>{{ (product.name || '?')[0] }}</span></div>
              <span v-if="product.discount" class="discount-badge">-{{ product.discount }}%</span>
            </div>
            <div class="product-body">
              <div class="product-name">{{ product.name }}</div>
              <div class="rating-row">
                <span class="stars"><i v-for="i in 5" :key="i" :class="i <= Math.round(product.rating || 4) ? 'fas fa-star' : 'far fa-star'"></i></span>
                <span class="review-count">{{ product.review_count || 0 }}</span>
              </div>
              <div class="price-row">
                <span class="price">${{ product.price }}</span>
                <span v-if="product.original_price" class="original-price">${{ product.original_price }}</span>
              </div>
              <div class="meta-row">
                <span v-if="product.discount" class="deal-badge">Deal</span>
                <span class="shipping">FREE Shipping</span>
              </div>
            </div>
          </div>
        </div>
        </div>
</template>
</div>
</div>
</div>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'
import VerifiedBadge from '@/components/trust/VerifiedBadge.vue'

const route = useRoute()
const userStore = useUserStore()
const store = ref(null)
const products = ref([])
const loading = ref(true)
const tab = ref('all')
const isFollowing = ref(false)

const filteredProducts = computed(() => {
  if (tab.value === 'recommended') return products.value.filter(p => p.is_recommended)
  return products.value
})

const getGradient = (name) => {
  const colors = ['var(--brand-nav, #232F3E))','#37475a','var(--brand-dark, #131921)','var(--brand-accent, #007185)','#4a4e69','#3a5a40']
  const idx = (name?.charCodeAt(0)||0) % colors.length
  return `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx+2)%colors.length]})`
}

onMounted(async () => {
  try {
    const { data: seller } = await supabase.from('sellers').select('*').eq('id', route.params.id).single()
    store.value = seller || null

    if (store.value) {
      const { data: prods } = await supabase.from('products').select('*').eq('seller_id', store.value.id).eq('is_active', true).order('sales_count', { ascending: false })
      products.value = prods || []

      if (userStore.supabaseUser) {
        const { data: follow } = await supabase.from('followed_sellers').select('id').eq('user_id', userStore.supabaseUser.id).eq('seller_id', seller.id).maybeSingle()
        isFollowing.value = !!follow
      }
    }
  } catch (e) { console.error('Store load error:', e) }
  loading.value = false
})

const toggleFollow = async () => {
  if (!userStore.supabaseUser) { window.location.hash = '#/login'; return }
  if (isFollowing.value) {
    await supabase.from('followed_sellers').delete().eq('user_id', userStore.supabaseUser.id).eq('seller_id', store.value.id)
    isFollowing.value = false
    store.value.followers = Math.max(0, (store.value.followers || 0) - 1)
  } else {
    await supabase.from('followed_sellers').insert({ user_id: userStore.supabaseUser.id, seller_id: store.value.id })
    isFollowing.value = true
    store.value.followers = (store.value.followers || 0) + 1
  }
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 15px; }
.loading, .not-found, .empty { text-align: center; padding: 60px 0; color: #999; }

/* Store Header */
.store-header { background: #fff; border-radius: 8px; overflow: hidden; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.store-banner { height: 120px; }
.store-profile { display: flex; align-items: center; gap: 16px; padding: 0 24px 20px; margin-top: -40px; }
.store-avatar { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: #f5f5f5; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.store-logo-img { width: 100%; height: 100%; object-fit: cover; }
.store-avatar span { font-size: 32px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.store-info { flex: 1; }
.store-info h1 { font-size: 1.25rem; margin: 0 0 4px; }
.store-stats { display: flex; gap: 16px; font-size: 0.8125rem; color: #565959; margin: 0 0 6px; }
.store-stats i { margin-right: 4px; }
.store-desc { font-size: 0.8125rem; color: #999; margin: 0; }
.btn-follow { padding: 8px 20px; border: 1px solid #D5D9D9; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-follow:hover { border-color: var(--brand-accent, #007185); color: var(--brand-accent, #007185); }
.btn-follow.following { background: var(--brand-accent, #007185); color: #fff; border-color: var(--brand-accent, #007185); }

/* Tabs */
.store-tabs { display: flex; gap: 0; background: #fff; border-radius: 8px 8px 0 0; overflow: hidden; border-bottom: 2px solid #EAEDED; }
.store-tabs button { padding: 12px 24px; background: none; border: none; font-size: 0.875rem; cursor: pointer; color: #565959; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.store-tabs button.active { color: var(--brand-accent, #007185); border-bottom-color: var(--brand-primary, #FF9900); font-weight: 600; }
.store-tabs button:hover { background: #f7fafa; }

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; background: #fff; padding: 16px; border-radius: 0 0 8px 8px; }
.product-card { cursor: pointer; transition: all 0.2s; border: 1px solid transparent; border-radius: 4px; overflow: hidden; }
.product-card:hover { border-color: var(--brand-primary, #FF9900); box-shadow: 0 2px 8px rgba(255,153,0,0.15); transform: translateY(-2px); }
.product-img { position: relative; overflow: hidden; }
.product-img img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.img-placeholder { width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #f8f8f8, #eee); display: flex; align-items: center; justify-content: center; }
.img-placeholder span { font-size: 36px; font-weight: 700; color: #ddd; }
.discount-badge { position: absolute; top: 0; left: 0; background: #CC0C39; color: #fff; padding: 2px 6px; font-size: 11px; font-weight: 700; }
.product-body { padding: 8px 10px 12px; }
.product-name { font-size: 0.8125rem; color: var(--brand-accent, #007185); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; min-height: 2.25rem; margin-bottom: 4px; }
.product-card:hover .product-name { color: #c77a00; }
.rating-row { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.stars { font-size: 0.625rem; color: var(--brand-primary, #FF9900); }
.review-count { font-size: 0.6875rem; color: var(--brand-accent, #007185); }
.price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
.price { font-size: 1.125rem; color: #0F1111; }
.original-price { font-size: 0.75rem; color: #999; text-decoration: line-through; }
.meta-row { display: flex; align-items: center; gap: 8px; }
.deal-badge { background: #CC0C39; color: #fff; padding: 1px 4px; border-radius: 2px; font-size: 0.625rem; font-weight: 700; }
.shipping { font-size: 0.6875rem; color: #565959; }

@media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px) { .product-grid { grid-template-columns: repeat(3, 1fr); } .store-profile { flex-direction: column; text-align: center; margin-top: -30px; } }
@media (max-width: 480px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }

img { max-width: 100%; height: auto; }
</style>
