<template>
  <div class="page-wrapper">
  <div class="category-page">
    <div class="container">
      <h1 class="page-title">All Categories</h1>
      <div v-if="loading" class="loading-grid">
        <div v-for="i in 12" :key="i" class="skeleton-cat"></div>
      </div>
      <div v-else class="cat-grid">
        <div v-for="cat in categories" :key="cat.id" class="cat-card" @click="$router.push(`/search?category=${cat.id}`)">
          <div class="cat-icon" :style="{ background: cat.color || 'var(--brand-primary, #FF9900)' }">{{ cat.icon || cat.name?.[0] || '?' }}</div>
          <h3>{{ cat.name }}</h3>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchCategories } from '@/services/supabase'

const categories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await fetchCategories()
    categories.value = data || []
  } catch (e) { console.error('Failed:', e) }
  loading.value = false
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #222; }
.loading-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.skeleton-cat { background: #f0f0f0; border-radius: 12px; height: 100px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.cat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.cat-card { background: #fff; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.cat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
.cat-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #fff; margin: 0 auto 12px; transition: transform 0.3s; }
.cat-card:hover .cat-icon { transform: scale(1.1); }
.cat-card h3 { font-size: 14px; color: #333; }
@media (max-width: 768px) { .cat-grid, .loading-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 480px) { .cat-grid, .loading-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } .cat-card { padding: 16px; } }
</style>
