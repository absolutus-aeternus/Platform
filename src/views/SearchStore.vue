<template>
  <div class="search-store">
    <div class="container">
      <h1>Search Stores</h1>
      <div class="search-bar">
        <input v-model="query" placeholder="Search stores..." @keyup.enter="search">
        <button @click="search">Search</button>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="stores.length === 0" class="empty">No stores found</div>
      <div v-else class="store-grid">
        <div v-for="s in stores" :key="s.id" class="store-card" @click="$router.push(`/store/${s.id}`)">
          <div class="avatar">{{ s.name[0] }}</div>
          <h3>{{ s.name }}</h3>
          <p>Products: {{ s.goods_count || 0 }}</p>
          <p>Sales: {{ s.sales_count || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const query = ref('')
const stores = ref([])
const loading = ref(false)

const search = async () => {
  loading.value = true
  let q = supabase.from('sellers').select('*')
  if (query.value) q = q.ilike('name', `%${query.value}%`)
  const { data } = await q.limit(20)
  stores.value = data || []
  loading.value = false
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 25px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 25px; }
.search-bar input { flex: 1; padding: 12px 15px; border: 1px solid #ddd; border-radius: 4px; }
.search-bar button { padding: 12px 25px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.store-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.store-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.store-card:hover { transform: translateY(-3px); }
.avatar { width: 60px; height: 60px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 10px; }
</style>
