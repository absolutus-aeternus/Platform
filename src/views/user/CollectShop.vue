<template>
  <div class="page-wrapper">
  <div class="collect-shop">
    <div class="page-header"><h1>Followed Shops</h1><span class="badge">{{ shops.length }} shops</span></div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="shops.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-store"></i></div>
      <h2>No Followed Shops</h2>
      <p>Follow your favorite shops to stay updated on new products and deals.</p>
      <router-link to="/" class="btn-primary">Discover Shops</router-link>
    </div>
    <div v-else class="shop-grid">
      <div v-for="shop in shops" :key="shop.id" class="shop-card">
        <div class="shop-header">
          <div class="avatar" :style="{ background: shop.avatar_color || 'var(--brand-primary, #FF9900)' }">{{ shop.sellers?.name?.[0] || 'S' }}</div>
          <div class="shop-info">
            <h3>{{ shop.sellers?.name || 'Store' }}</h3>
            <p>{{ shop.sellers?.goods_count || 0 }} products • {{ shop.sellers?.sales_count || 0 }} sales</p>
          </div>
        </div>
        <div class="shop-actions">
          <button class="btn-visit" @click="$router.push(`/store/${shop.seller_id}`)"><i class="fas fa-external-link-alt"></i> Visit</button>
          <button class="btn-unfollow" @click="unfollow(shop)"><i class="fas fa-user-minus"></i> Unfollow</button>
        </div>
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
const shops = ref([])
const loading = ref(true)

onMounted(async () => {
  if (userStore.supabaseUser) {
    const { data } = await supabase.from('followed_sellers').select('*, sellers(name, goods_count, sales_count)').eq('user_id', userStore.supabaseUser.id)
    shops.value = data || []
  }
  loading.value = false
})

const unfollow = async (shop) => {
  if (!confirm(`Unfollow "${shop.sellers?.name}"?`)) return
  try { await supabase.from('followed_sellers').delete().eq('id', shop.id) } catch(_e) { console.error('CollectShop.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  shops.value = shops.value.filter(s => s.id !== shop.id)
}
</script>

<style scoped>
header { z-index: 2; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.badge { background: #f0f0f0; padding: 5px 12px; border-radius: 12px; font-size: 13px; color: #666; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { width: 100px; height: 100px; background: #f8f9fa; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.empty-icon i { font-size: 40px; color: #ddd; }
.empty-state h2 { margin: 0 0 10px; font-size: 20px; color: #333; }
.empty-state p { color: #999; margin-bottom: 25px; }
.btn-primary { padding: 12px 30px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 25px; text-decoration: none; display: inline-block; font-weight: 600; }
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.shop-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s; }
.shop-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
.shop-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.avatar { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 600; }
.shop-info h3 { margin: 0 0 4px; font-size: 15px; }
.shop-info p { margin: 0; font-size: 12px; color: #999; }
.shop-actions { display: flex; gap: 8px; }
.btn-visit, .btn-unfollow { flex: 1; padding: 8px; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-visit { background: var(--brand-primary, #FF9900); color: #fff; border: none; }
.btn-unfollow { background: #fff; color: #666; border: 1px solid #ddd; }
.btn-unfollow:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
</style>
