<template>
  <div class="seller-categories">
    <div class="page-header"><h1>Product Categories</h1><p class="subtitle">Browse available categories for your products</p></div>
    <div class="filters"><input v-model="search" placeholder="Search categories..."></div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="category-grid">
      <div v-for="cat in filtered" :key="cat.id" class="category-card" @click="selectedCat = cat">
        <div class="cat-icon" :style="{ background: cat.color || '#FF9900' }">{{ cat.icon || cat.name[0] }}</div>
        <h3>{{ cat.name }}</h3>
        <p>{{ cat.description || 'Browse products' }}</p>
        <span class="product-count">{{ cat.product_count || 0 }} products</span>
      </div>
      <div v-if="filtered.length === 0" class="empty-card"><i class="fas fa-folder-open"></i><p>No categories found</p></div>
    </div>
    <div v-if="selectedCat" class="modal-overlay" @click.self="selectedCat = null">
      <div class="modal">
        <div class="modal-header" :style="{ background: selectedCat.color || '#FF9900' }">
          <div class="modal-icon">{{ selectedCat.icon || selectedCat.name[0] }}</div>
          <h2>{{ selectedCat.name }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ selectedCat.description || 'No description available.' }}</p>
          <div class="cat-stats">
            <div class="stat"><strong>{{ selectedCat.product_count || 0 }}</strong><span>Products</span></div>
            <div class="stat"><strong>{{ selectedCat.seller_count || 0 }}</strong><span>Sellers</span></div>
          </div>
          <button class="btn-browse" @click="$router.push(`/search?category=${selectedCat.id}`)">Browse Products</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchCategories } from '@/services/supabase'

const loading = ref(true)
const categories = ref([])
const search = ref('')
const selectedCat = ref(null)

const filtered = computed(() => {
  if (!search.value) return categories.value
  return categories.value.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
})

onMounted(async () => {
  const { data } = await fetchCategories()
  categories.value = data || []
  loading.value = false
})
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h1 { margin: 0 0 4px; }
.subtitle { color: #999; font-size: 14px; margin: 0; }
.filters { margin-bottom: 20px; }
.filters input { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.filters input:focus { outline: none; border-color: #FF9900; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.category-card { background: #fff; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); cursor: pointer; transition: all 0.3s; }
.category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.cat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; margin: 0 auto 12px; }
.category-card h3 { margin: 0 0 6px; font-size: 15px; }
.category-card p { font-size: 12px; color: #999; margin: 0 0 10px; }
.product-count { font-size: 11px; color: #FF9900; font-weight: 600; background: #ffe0e6; padding: 3px 10px; border-radius: 12px; }
.empty-card { grid-column: 1 / -1; text-align: center; padding: 60px; background: #fff; border-radius: 12px; color: #999; }
.empty-card i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; overflow: hidden; width: 400px; max-width: 90vw; }
.modal-header { padding: 30px; text-align: center; color: #fff; }
.modal-icon { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; }
.modal-header h2 { margin: 0; }
.modal-body { padding: 25px; }
.modal-body p { color: #666; font-size: 14px; margin-bottom: 20px; }
.cat-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
.stat { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
.stat strong { display: block; font-size: 22px; color: #FF9900; margin-bottom: 4px; }
.stat span { font-size: 12px; color: #999; }
.btn-browse { width: 100%; padding: 12px; background: #FF9900; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .card { padding: 1rem; }
  .btn-primary { padding: 0.5rem 1rem; font-size: 0.8125rem; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
