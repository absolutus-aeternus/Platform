<template>
  <div class="category-page">
    <div class="container">
      <h1>Shop by Category</h1>
      <div v-if="loading" class="loading">Loading categories...</div>
      <div v-else class="category-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card" @click="$router.push(`/search?category=${cat.id}`)">
          <div class="cat-icon" :style="{ background: cat.color || '#fe2c55' }">{{ cat.name[0] }}</div>
          <h3>{{ cat.name }}</h3>
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
  } catch (e) {
    console.error('Failed to load categories:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.loading { text-align: center; padding: 40px; color: #999; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.category-card { background: #fff; border-radius: 12px; padding: 25px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.category-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.cat-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #fff; margin: 0 auto 15px; }
.category-card h3 { font-size: 16px; }
</style>
