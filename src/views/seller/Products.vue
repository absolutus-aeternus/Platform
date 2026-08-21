<template>
  <div class="page-wrapper">
  <div class="seller-products">
    <h1>My Products</h1>
    <button class="btn-add" @click="showAdd = true">+ Add Product</button>
    
    <div v-if="loading" class="loading">Loading products...</div>
    <div v-else-if="products.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>No products yet</p>
    </div>
    <div v-else class="product-list">
      <div v-for="product in products" :key="product.id" class="product-row">
        <div class="product-img">{{ (product.name || '?')[0] }}</div>
        <div class="product-info">
          <h4>{{ product.name }}</h4>
          <p>${{ product.price }} | Stock: {{ product.stock }}</p>
        </div>
        <div class="product-status" :class="product.status">{{ product.status }}</div>
        <div class="product-actions">
          <button @click="editProduct(product)">Edit</button>
          <button @click="deleteProduct(product.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
    
    <!-- Add Product Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Add Product</h2>
        <form @submit.prevent="addProduct">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newProduct.name" required>
          </div>
          <div class="form-group">
            <label>Price</label>
            <input v-model.number="newProduct.price" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input v-model.number="newProduct.stock" type="number" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProduct.description"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()
const products = ref([])
const loading = ref(true)
const showAdd = ref(false)
const newProduct = ref({ name: '', price: 0, stock: 0, description: '' })

const loadProducts = async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser.id)
      .single()
    
    if (seller) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller.id)
      products.value = data || []
    }
  } catch (e) {
    console.error('Failed to load products:', e)
  }
  loading.value = false
}

const addProduct = async () => {
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser.id)
      .single()
    
    if (!seller) {
      window.__toast?.show('You need to create a seller account first')
      return
    }
    
    const { error } = await supabase.from('products').insert({
      ...newProduct.value,
      seller_id: seller.id,
      
      status: 'active'
    })
    
    if (error) throw error
    showAdd.value = false
    newProduct.value = { name: '', price: 0, stock: 0, description: '' }
    await loadProducts()
  } catch (e) {
    window.__toast?.show('Failed to add product: ' + e.message)
  }
}

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  try {
    await supabase.from('products').delete().eq('id', id)
    products.value = products.value.filter(p => p.id !== id)
  } catch (e) {
    window.__toast?.show('Failed to delete product')
  }
}

const editProduct = (product) => {
  router.push({ name: 'SellerProductAdd', query: { edit: product.id } })
}

onMounted(loadProducts)


</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading { text-align: center; padding: 40px; color: #999; clear: both; }
.empty-state { text-align: center; padding: 60px 0; clear: both; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.product-list { clear: both; }
.product-row { display: flex; align-items: center; gap: 15px; padding: 15px; background: #fff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.product-img { width: 50px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #ccc; border-radius: 4px; }
.product-info { flex: 1; }
.product-info h4 { margin-bottom: 4px; }
.product-info p { color: #666; font-size: 14px; }
.product-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
.product-status.active { background: #d4edda; color: #155724; }
.product-status.inactive { background: #f8d7da; color: #721c24; }
.product-actions { display: flex; gap: 8px; }
.product-actions button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.btn-delete { color: #ff4757; border-color: #ff4757 !important; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 400px; max-width: 90%; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-group textarea { height: 80px; resize: vertical; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; border: none; }

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
