<template>
  <div class="store-page">
    <div class="container">
      <div v-if="loading" class="loading">Loading store...</div>
      <div v-else-if="!store" class="not-found">Store not found</div>
      <template v-else>
        <div class="store-header">
          <div class="store-avatar">{{ store.name[0] }}</div>
          <div class="store-info">
            <h1>{{ store.name }}</h1>
            <p>Products: {{ store.goods_count || 0 }} | Sales: {{ store.sales_count || 0 }}</p>
            <p v-if="store.description" class="store-desc">{{ store.description }}</p>
          </div>
          <button class="btn-follow" @click="toggleFollow">
            {{ isFollowing ? 'Unfollow' : 'Follow' }}
          </button>
        </div>
        
        <div class="store-tabs">
          <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All Products</button>
          <button :class="{ active: tab === 'recommended' }" @click="tab = 'recommended'">Recommend</button>
        </div>
        
        <div v-if="products.length === 0" class="empty">No products yet</div>
        <div v-else class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/product/${product.id}`)">
            <div class="img-placeholder">{{ product.name[0] }}</div>
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <div class="price">${{ product.price }}</div>
              <div class="sales">Sold {{ product.sales_count || 0 }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const route = useRoute()
const userStore = useUserStore()
const store = ref(null)
const products = ref([])
const loading = ref(true)
const tab = ref('all')
const isFollowing = ref(false)

onMounted(async () => {
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    store.value = seller
    
    if (seller) {
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller.id)
        .eq('status', 'active')
      products.value = prods || []
      
      if (userStore.supabaseUser) {
        const { data: follow } = await supabase
          .from('followed_sellers')
          .select('id')
          .eq('user_id', userStore.supabaseUser.id)
          .eq('seller_id', seller.id)
          .single()
        isFollowing.value = !!follow
      }
    }
  } catch (e) {
    console.error('Failed to load store:', e)
  }
  loading.value = false
})

const toggleFollow = async () => {
  if (!userStore.supabaseUser) return alert('Please login first')
  try {
    if (isFollowing.value) {
      await supabase.from('followed_sellers').delete()
        .eq('user_id', userStore.supabaseUser.id)
        .eq('seller_id', store.value.id)
    } else {
      await supabase.from('followed_sellers').insert({
        user_id: userStore.supabaseUser.id,
        seller_id: store.value.id
      })
    }
    isFollowing.value = !isFollowing.value
  } catch (e) {
    console.error('Failed to toggle follow:', e)
  }
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.loading, .not-found, .empty { text-align: center; padding: 60px 0; color: #999; }
.store-header { display: flex; align-items: center; gap: 20px; padding: 30px; background: #fff; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.store-avatar { width: 80px; height: 80px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; }
.store-info h1 { font-size: 24px; margin-bottom: 5px; }
.store-info p { color: #666; }
.store-desc { margin-top: 8px; font-size: 14px; }
.btn-follow { margin-left: auto; padding: 10px 30px; border: 2px solid #fe2c55; color: #fe2c55; background: none; border-radius: 25px; font-size: 16px; cursor: pointer; }
.store-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.store-tabs button { padding: 10px 25px; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; }
.store-tabs button.active { background: #fe2c55; color: #fff; border-color: #fe2c55; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-card:hover { transform: translateY(-3px); }
.img-placeholder { height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price { color: #fe2c55; font-size: 18px; font-weight: 700; }
.sales { color: #999; font-size: 12px; margin-top: 5px; }
</style>
