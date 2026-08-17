<template>
  <div class="product-list">
    <div class="page-header">
      <h1>Products</h1>
      <router-link to="/seller/product/add" class="btn-add">+ Add Product</router-link>
    </div>
    
    <div class="filters">
      <input v-model="search" placeholder="Search products..." @input="loadProducts">
      <select v-model="status" @change="loadProducts">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="products.length === 0" class="empty">No products found</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sales</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <div class="product-cell">
                <div class="product-img">{{ (product.name || '?')[0] }}</div>
                <span>{{ product.name.substring(0, 40) }}...</span>
              </div>
            </td>
            <td>${{ product.price }}</td>
            <td>{{ product.stock || 0 }}</td>
            <td>{{ product.sales_count || 0 }}</td>
            <td><span class="status" :class="product.status">{{ product.status }}</span></td>
            <td>
              <button @click="editProduct(product)">Edit</button>
              <button @click="deleteProduct(product.id)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const products = ref([])
const loading = ref(true)
const search = ref('')
const status = ref('')

const loadProducts = async () => {
  if (!userStore.supabaseUser) return
  try {
    const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
    if (!seller) return
    
    let query = supabase.from('products').select('*').eq('seller_id', seller.id)
    if (search.value) query = query.ilike('name', `%${search.value}%`)
    if (status.value) query = query.eq('status', status.value)
    
    const { data } = await query.order('created_at', { ascending: false })
    products.value = data || []
  } catch (e) {
    console.error('Failed to load products:', e)
  }
  loading.value = false
}

const editProduct = (product) => {
  window.__toast?.show('Edit functionality coming soon')
}

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  try { await supabase.from('products').delete().eq('id', id) } catch(_e) { console.error('ProductList.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  products.value = products.value.filter(p => p.id !== id)
}

onMounted(loadProducts)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.btn-add { padding: 10px 20px; background: #FF9900; color: #fff; border: none; border-radius: 4px; text-decoration: none; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
.product-cell { display: flex; align-items: center; gap: 10px; }
.product-img { width: 40px; height: 40px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #ccc; border-radius: 4px; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 12px; text-transform: capitalize; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 5px; }
.btn-delete { color: #ff4757; border-color: #ff4757; }

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
