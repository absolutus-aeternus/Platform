<template>
  <div class="promotions">
    <h1>Promotions</h1>
    <button class="btn-add" @click="showAdd = true">+ Create Promotion</button>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="promotions.length === 0" class="empty">No promotions yet. Create one to boost your sales!</div>
    <div v-else class="promo-grid">
      <div v-for="promo in promotions" :key="promo.id" class="promo-card">
        <div class="promo-header">
          <span class="promo-status" :class="promo.is_active ? 'active' : 'inactive'">
            {{ promo.is_active ? 'Active' : 'Inactive' }}
          </span>
          <button class="btn-delete" @click="deletePromo(promo.id)"><i class="fas fa-trash"></i></button>
        </div>
        <h3>{{ promo.title || promo.name }}</h3>
        <p>{{ promo.description }}</p>
        <div class="promo-value">{{ promo.discount_percentage }}% OFF</div>
        <p class="promo-dates">
          {{ promo.start_time ? new Date(promo.start_time).toLocaleDateString() : 'N/A' }} - 
          {{ promo.end_time ? new Date(promo.end_time).toLocaleDateString() : 'N/A' }}
        </p>
      </div>
    </div>
    
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Create Flash Sale Promotion</h2>
        <form @submit.prevent="createPromo">
          <div class="form-group">
            <label>Select Product</label>
            <select v-model="newPromo.product_id" required>
              <option value="">Choose a product...</option>
              <option v-for="p in myProducts" :key="p.id" :value="p.id">{{ p.name }} (${{ p.price }})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Discount Percentage</label>
            <input v-model.number="newPromo.discount_percentage" type="number" required min="1" max="90" placeholder="e.g. 30">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="newPromo.start_time" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="newPromo.end_time" type="datetime-local" required>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Promotion' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const promotions = ref([])
const myProducts = ref([])
const loading = ref(true)
const showAdd = ref(false)
const creating = ref(false)
const sellerId = ref(null)
const newPromo = ref({
  product_id: '',
  discount_percentage: 0,
  start_time: '',
  end_time: ''
})

const loadData = async () => {
  loading.value = true
  try {
    // Get seller ID
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser?.id)
      .maybeSingle()
    
    if (seller) {
      sellerId.value = seller.id
      
      // Load seller's products
      const { data: prods } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('seller_id', seller.id)
        .eq('is_active', true)
      myProducts.value = prods || []
      
      // Load flash sales for seller's products
      const productIds = (prods || []).map(p => p.id)
      if (productIds.length > 0) {
        const { data: sales, error: salesErr } = await supabase
          .from('flash_sales')
          .select('*, products(name, price)')
          .in('product_id', productIds)
          .order('created_at', { ascending: false })
        if (salesErr) { console.warn('flash_sales not available:', salesErr.message); promotions.value = [] }
        else promotions.value = sales || []
      }
    }
  } catch (e) { console.error('Failed to load:', e) }
  loading.value = false
}

const createPromo = async () => {
  creating.value = true
  try {
    const { error } = await supabase.from('flash_sales').insert({
      product_id: newPromo.value.product_id,
      discount_percentage: newPromo.value.discount_percentage,
      start_time: new Date(newPromo.value.start_time).toISOString(),
      end_time: new Date(newPromo.value.end_time).toISOString(),
      is_active: true
    })

    if (error) throw error
    
    window.__toast?.show('Promotion created!', 'success')
    showAdd.value = false
    newPromo.value = { product_id: '', discount_percentage: 0, start_time: '', end_time: '' }
    await loadData()
  } catch (e) {
    window.__toast?.show('Failed: ' + e.message, 'error')
  }
  creating.value = false
}

const deletePromo = async (id) => {
  if (!confirm('Delete this promotion?')) return
  try {
    await supabase.from('flash_sales').delete().eq('id', id)
    promotions.value = promotions.value.filter(p => p.id !== id)
    window.__toast?.show('Promotion deleted', 'success')
  } catch (e) {
    window.__toast?.show('Failed: ' + e.message, 'error')
  }
}

onMounted(loadData)
</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: #999; clear: both; }
.promo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; clear: both; }
.promo-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: relative; }
.promo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.promo-status { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.promo-status.active { background: #e8f5e9; color: #2e7d32; }
.promo-status.inactive { background: #fce4ec; color: #c62828; }
.btn-delete { background: none; border: none; color: #999; cursor: pointer; padding: 4px; }
.btn-delete:hover { color: #ff4757; }
.promo-card h3 { font-size: 16px; margin-bottom: 8px; }
.promo-card p { font-size: 13px; color: #666; margin-bottom: 8px; }
.promo-value { font-size: 28px; font-weight: 700; color: #fe2c55; margin: 12px 0; }
.promo-dates { color: #999; font-size: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 500px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #fe2c55; color: #fff; border: none; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }
@media (max-width: 768px) { .promo-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
</style>
