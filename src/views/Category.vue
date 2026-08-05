<template>
  <div class="category-page">
    <div class="container">
      <h1>Shop by Category</h1>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.name" class="category-card" @click="$router.push(`/search?category=${cat.name}`)">
          <div class="cat-icon" :style="{ background: cat.color }">{{ cat.name[0] }}</div>
          <h3>{{ cat.name }}</h3>
          <p>{{ cat.count }} Products</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = ref([
  { name: 'Food & Beverage', count: 2450, color: '#fe2c55' },
  { name: 'Men\'s Clothing', count: 3200, color: '#4ecdc4' },
  { name: 'Women\'s Clothing', count: 4100, color: '#ff6b81' },
  { name: 'Electronics', count: 1800, color: '#45b7d1' },
  { name: 'Home Appliances', count: 1200, color: '#96ceb4' },
  { name: 'Sports & Outdoors', count: 980, color: '#feca57' },
  { name: 'Beauty & Health', count: 2100, color: '#ff9ff3' },
  { name: 'Kids & Toys', count: 1500, color: '#54a0ff' },
  { name: 'Jewelry & Watches', count: 800, color: '#5f27cd' },
  { name: 'Bags & Luggage', count: 650, color: '#01a3a4' },
  { name: 'Virtual Card', count: 120, color: '#2ed573' },
  { name: 'Luxury', count: 350, color: '#ffa502' },
])
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
h1 { margin-bottom: 30px; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.category-card { background: #fff; border-radius: 12px; padding: 25px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.category-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.cat-icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #fff; margin: 0 auto 15px; }
.category-card h3 { font-size: 16px; margin-bottom: 5px; }
.category-card p { color: #999; font-size: 13px; }
</style>
