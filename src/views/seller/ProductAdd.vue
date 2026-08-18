<template>
  <div class="product-add">
    <h1>Add Product</h1>
    <form @submit.prevent="addProduct" class="product-form">
      <div class="form-group">
        <label>Product Name</label>
        <input v-model="form.name" required placeholder="Enter product name">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Price (USD)</label>
          <input v-model.number="form.price" type="number" step="0.01" required>
        </div>
        <div class="form-group">
          <label>Original Price</label>
          <input v-model.number="form.original_price" type="number" step="0.01">
        </div>
        <div class="form-group">
          <label>Discount %</label>
          <input v-model.number="form.discount" type="number" min="0" max="100">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Stock</label>
          <input v-model.number="form.stock" type="number" required>
        </div>
        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category_id">
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="5" placeholder="Product description..."></textarea>
      </div>
      <div class="form-actions">
        <button type="button" @click="$router.back()">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Add Product' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase, fetchCategories } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const categories = ref([])
const saving = ref(false)
const form = ref({ name: '', price: 0, original_price: 0, discount: 0, stock: 0, category_id: '', description: '' })

onMounted(async () => {
  const { data } = await fetchCategories()
  categories.value = data || []
})

const addProduct = async () => {
  if (!userStore.supabaseUser) return
  saving.value = true
  try {
    const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
    if (!seller) { window.__toast?.show('Create a seller account first'); return }
    
    const { error } = await supabase.from('products').insert({
      ...form.value,
      seller_id: seller.id,
      goods_id: 'PROD-' + Date.now(),
      status: 'active'
    })
    if (error) throw error
    router.push('/seller/products')
  } catch (e) {
    window.__toast?.show('Failed: ' + e.message)
  }
  saving.value = false
  loading.value = false
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.product-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 700px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-group textarea { resize: vertical; }
.form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.form-actions button { padding: 10px 25px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; border: none; }
.btn-primary:disabled { background: #ccc; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .filters { flex-direction: column; gap: 0.5rem; }
  .filters input, .filters select { width: 100%; }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .form-row { grid-template-columns: 1fr; }
  .card { padding: 1rem; }
  .btn-primary { padding: 0.5rem 1rem; font-size: 0.8125rem; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
