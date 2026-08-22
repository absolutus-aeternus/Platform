<template>
  <div class="page-wrapper">
  <div class="favorites">
    <h1>My Favorites</h1>
    <div v-if="loading" class="loading">Loading favorites...</div>
    <div v-else-if="favorites.length === 0" class="empty-state">
      <i class="fas fa-heart"></i>
      <p>No favorites yet</p>
      <router-link to="/" class="btn-primary">Browse Products</router-link>
    </div>
    <div v-else class="product-grid">
      <div v-for="fav in favorites" :key="fav.id" class="product-card" @click="$router.push(`/product/${fav.product_id}`)">
        <div class="img-placeholder">{{ fav.products?.name?.[0] || 'P' }}</div>
        <div class="product-info">
          <h3>{{ fav.products?.name || 'Product' }}</h3>
          <div class="price">${{ fav.products?.price || '0.00' }}</div>
        </div>
        <button class="btn-remove" @click.stop="removeFavorite(fav.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const favorites = ref([])
const loading = ref(true)

const loadFavorites = async () => {
  if (!userStore.supabaseUser) return
  try {
    const { data } = await supabase
      .from('favorites')
      .select('*, products(name, price)')
      .eq('user_id', userStore.supabaseUser.id)
    favorites.value = data || []
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
  loading.value = false
}

const removeFavorite = async (id) => {
  try {
    await supabase.from('favorites').delete().eq('id', id)
    favorites.value = favorites.value.filter(f => f.id !== id)
    window.__toast?.show('Removed from favorites', 'info')
  } catch (e) {
    console.error('Failed to remove favorite:', e)
    window.__toast?.show('Failed to remove', 'error')
  }
}

onMounted(loadFavorites)


</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; padding: 10px 25px; border-radius: 25px; text-decoration: none; display: inline-block; margin-top: 15px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.product-card { background: #fff; border-radius: 8px; overflow: hidden; cursor: pointer; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.img-placeholder { height: 180px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #ccc; }
.product-info { padding: 15px; }
.product-info h3 { font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.price { color: var(--brand-primary, #FF9900); font-size: 18px; font-weight: 700; }
.btn-remove { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: #fff; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .card { padding: 1rem; }
  .form-group input { font-size: 16px; }
}

</style>
