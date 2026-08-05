<template>
  <div class="seller-categories">
    <h1>Categories</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="category-grid">
      <div v-for="cat in categories" :key="cat.id" class="category-card">
        <div class="cat-icon" :style="{ background: cat.color || '#fe2c55' }">{{ cat.name[0] }}</div>
        <h3>{{ cat.name }}</h3>
        <p>{{ cat.description || '' }}</p>
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
  const { data } = await fetchCategories()
  categories.value = data || []
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading { text-align: center; padding: 40px; color: #999; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.category-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.cat-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; margin: 0 auto 10px; }
</style>
