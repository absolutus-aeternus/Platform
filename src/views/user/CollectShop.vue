<template>
  <div class="collect-shop">
    <h1>Followed Shops</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="shops.length === 0" class="empty-state">
      <i class="fas fa-store"></i>
      <p>No followed shops yet</p>
    </div>
    <div v-else class="shop-grid">
      <div v-for="shop in shops" :key="shop.id" class="shop-card" @click="$router.push(`/store/${shop.seller_id}`)">
        <div class="avatar">{{ shop.sellers?.name?.[0] || 'S' }}</div>
        <h3>{{ shop.sellers?.name || 'Store' }}</h3>
        <button class="btn-unfollow" @click.stop="unfollow(shop.id)">Unfollow</button>
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
    const { data } = await supabase.from('followed_sellers').select('*, sellers(name)').eq('user_id', userStore.supabaseUser.id)
    shops.value = data || []
  }
  loading.value = false
})

const unfollow = async (id) => {
  await supabase.from('followed_sellers').delete().eq('id', id)
  shops.value = shops.value.filter(s => s.id !== id)
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.empty-state { text-align: center; padding: 60px 0; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.shop-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.shop-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); cursor: pointer; }
.avatar { width: 60px; height: 60px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 10px; }
.btn-unfollow { margin-top: 10px; padding: 6px 15px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
</style>
