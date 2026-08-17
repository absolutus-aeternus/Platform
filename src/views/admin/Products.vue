<template>
  <div class="admin-products">
    <div class="page-header">
      <h1>Products</h1>
      <button class="btn-primary" @click="showAdd = true"><i class="fas fa-plus"></i> Add Product</button>
    </div>
    <div class="filters">
      <input v-model="search" placeholder="Search products..." @input="loadProducts">
      <select v-model="statusFilter" @change="loadProducts">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>
    <div v-if="loading" class="loading">Loading products...</div>
    <table v-else>
      <thead>
        <tr><th>Name</th><th>Seller</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.sellers?.store_name || product.sellers?.name || 'N/A' }}</td>
          <td>${{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.sales_count || 0 }}</td>
          <td><span class="status" :class="product.status">{{ product.status }}</span></td>
          <td>
            <button class="btn-sm" @click="editProduct(product)">Edit</button>
            <button class="btn-sm btn-danger" @click="deleteProduct(product.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="7" style="text-align:center;padding:20px;color:#999">No products found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/services/supabase'

const products = ref([])
const loading = ref(true)
let realtimeChannel = null
const search = ref('')
const statusFilter = ref('')
const showAdd = ref(false)

const loadProducts = async () => {
  loading.value = true
  try {
    let query = supabase.from('products').select('*, sellers(name, store_name)').limit(100)
    if (search.value) query = query.ilike('name', `%${search.value}%`)
    if (statusFilter.value) query = query.eq('status', statusFilter.value)
    const { data } = await query.order('created_at', { ascending: false })
    products.value = data || []
  } catch(e) { console.warn('Products load error:', e) }
  finally { loading.value = false }
}

onMounted(() => {
  loadProducts()
  realtimeChannel = supabase.channel('admin-products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => loadProducts())
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

const editProduct = (p) => { window.__toast?.show(`Edit: ${p.name}`, 'info') }

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  try {
    await supabase.from('products').delete().eq('id', id)
    products.value = products.value.filter(p => p.id !== id)
    window.__toast?.show('Product deleted', 'success')
  } catch(e) { console.error('Delete error:', e); window.__toast?.show('Delete failed', 'error') }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-primary { padding: 8px 16px; background: #FF9900; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
.loading { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; text-transform: capitalize; }
.status.published { background: #d4edda; color: #155724; }
.status.draft { background: #fff3cd; color: #856404; }
.status.archived { background: #e2e3e5; color: #383d41; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 4px; }
.btn-sm:hover { background: #f5f5f5; }
.btn-danger { color: #dc3545; border-color: #dc3545; }
.btn-danger:hover { background: #dc3545; color: #fff; }

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
  .modal { width: 95vw; margin: 1rem; }
  .form-group input, .form-group select { font-size: 16px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  th, td { padding: 6px 8px; font-size: 11px; }
  .btn-sm { padding: 3px 8px; font-size: 11px; }
}

</style>
