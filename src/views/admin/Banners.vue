<template>
  <div class="admin-banners">
    <h1>Banners</h1>
    <button class="btn-primary" @click="showAdd = true">+ Add Banner</button>
    <div class="banner-grid">
      <div v-for="banner in banners" :key="banner.id" class="banner-card">
        <div class="banner-img">{{ banner.title?.[0] || 'B' }}</div>
        <h3>{{ banner.title || 'Banner' }}</h3>
        <p>{{ banner.link || 'No link' }}</p>
        <div class="banner-actions">
          <button class="btn-sm">Edit</button>
          <button class="btn-sm btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const banners = ref([])
const showAdd = ref(false)
onMounted(async () => {
  const { data } = await supabase.from('banners').select('*').order('sort_order')
  banners.value = data || []
})
</script>

<style scoped>
h1 { margin-bottom: 20px; display: inline-block; }
.btn-primary { float: right; padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.banner-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; clear: both; }
.banner-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.banner-img { height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #ccc; border-radius: 4px; margin-bottom: 10px; }
.banner-actions { margin-top: 10px; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 5px; }
.btn-danger { color: #dc3545; border-color: #dc3545; }
</style>
