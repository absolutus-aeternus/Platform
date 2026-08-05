<template>
  <div class="inventory">
    <h1>Inventory</h1>
    <div class="summary">
      <div class="summary-card">
        <h3>Total Products</h3>
        <p>{{ products.length }}</p>
      </div>
      <div class="summary-card">
        <h3>In Stock</h3>
        <p>{{ inStock }}</p>
      </div>
      <div class="summary-card">
        <h3>Low Stock</h3>
        <p>{{ lowStock }}</p>
      </div>
      <div class="summary-card">
        <h3>Out of Stock</h3>
        <p>{{ outOfStock }}</p>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>{{ p.name.substring(0, 40) }}...</td>
            <td>{{ p.goods_id }}</td>
            <td>{{ p.stock || 0 }}</td>
            <td>
              <span class="stock-status" :class="getStockClass(p.stock)">
                {{ getStockLabel(p.stock) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const products = ref([])
const loading = ref(true)

const inStock = computed(() => products.value.filter(p => p.stock > 10).length)
const lowStock = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 10).length)
const outOfStock = computed(() => products.value.filter(p => !p.stock || p.stock === 0).length)

const getStockClass = (stock) => {
  if (!stock || stock === 0) return 'out'
  if (stock <= 10) return 'low'
  return 'ok'
}
const getStockLabel = (stock) => {
  if (!stock || stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    const { data } = await supabase.from('products').select('*').eq('seller_id', seller.id)
    products.value = data || []
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
.summary-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.summary-card h3 { color: #666; font-size: 14px; margin-bottom: 8px; }
.summary-card p { font-size: 24px; font-weight: 700; color: #fe2c55; }
.loading { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #f8f8f8; font-weight: 600; }
.stock-status { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.stock-status.ok { background: #d4edda; color: #155724; }
.stock-status.low { background: #fff3cd; color: #856404; }
.stock-status.out { background: #f8d7da; color: #721c24; }
</style>
