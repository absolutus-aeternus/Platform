<template>
  <div class="admin-products">
    <div class="page-header">
      <h1>Products</h1>
      <button class="btn-primary" @click="showAdd = true">+ Add Product</button>
    </div>
    
    <div class="filters">
      <input v-model="search" placeholder="Search products..." @input="loadProducts">
      <select v-model="statusFilter" @change="loadProducts">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="categoryFilter" @change="loadProducts">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox"></th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sales</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td><input type="checkbox"></td>
            <td>
              <div class="product-cell">
                <div class="product-img">{{ product.name[0] }}</div>
                <span>{{ product.name.substring(0, 40) }}</span>
              </div>
            </td>
            <td>{{ product.category_name || 'N/A' }}</td>
            <td>${{ product.price }}</td>
            <td>{{ product.stock || 0 }}</td>
            <td>{{ product.sales_count || 0 }}</td>
            <td><span class="status" :class="product.status">{{ product.status }}</span></td>
            <td>
              <button class="btn-sm" @click="editProduct(product)">Edit</button>
              <button class="btn-sm btn-danger" @click="deleteProduct(product.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <span>Showing {{ products.length }} of {{ total }} products</span>
      <div class="page-buttons">
        <button @click="page > 1 && (page--, loadProducts())" :disabled="page <= 1">Previous</button>
        <span>Page {{ page }}</span>
        <button @click="page++; loadProducts()">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase, fetchCategories } from '@/services/supabase'

const products = ref([])
const categories = ref([])
const search = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const page = ref(1)
const total = ref(0)
const showAdd = ref(false)

const loadProducts = async () => {
  let query = supabase.from('products').select('*, sellers(name), categories(name)', { count: 'exact' })
  if (search.value) query = query.ilike('name', `%${search.value}%`)
  if (statusFilter.value) query = query.eq('status', statusFilter.value)
  if (categoryFilter.value) query = query.eq('category_id', categoryFilter.value)
  
  const { data, count } = await query.range((page.value - 1) * 20, page.value * 20 - 1).order('created_at', { ascending: false })
  products.value = data || []
  total.value = count || 0
}

const editProduct = (product) => alert('Edit: ' + product.name)

const deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return
  await supabase.from('products').delete().eq('id', id)
  await loadProducts()
}

onMounted(async () => {
  const { data } = await fetchCategories()
  categories.value = data || []
  await loadProducts()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-primary { padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.product-cell { display: flex; align-items: center; gap: 10px; }
.product-img { width: 35px; height: 35px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #ccc; border-radius: 4px; }
.status { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 5px; }
.btn-danger { color: #dc3545; border-color: #dc3545; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 13px; }
.page-buttons { display: flex; gap: 10px; align-items: center; }
.page-buttons button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.page-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
