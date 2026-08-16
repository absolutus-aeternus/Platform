<template>
  <div class="coupons">
    <h1>Coupons</h1>
    <button class="btn-add" @click="showAdd = true">+ Create Coupon</button>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="coupons.length === 0" class="empty">No coupons yet</div>
    <div v-else class="coupon-grid">
      <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card">
        <div class="coupon-value">{{ coupon.discount_value }}{{ coupon.discount_type === 'percent' ? '%' : '$' }} OFF</div>
        <p class="coupon-code">{{ coupon.code }}</p>
        <p class="coupon-min" v-if="coupon.min_order > 0">Min order: ${{ coupon.min_order }}</p>
        <p class="coupon-expiry">
          {{ coupon.start_time ? new Date(coupon.start_time).toLocaleDateString() : 'No start' }} - 
          {{ coupon.end_time ? new Date(coupon.end_time).toLocaleDateString() : 'No end' }}
        </p>
        <p class="coupon-uses">Used: {{ coupon.used_count }}{{ coupon.max_uses ? '/' + coupon.max_uses : '' }}</p>
        <div class="coupon-actions">
          <button class="btn-delete" @click="deleteCoupon(coupon.id)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
    
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h2>Create Coupon</h2>
        <form @submit.prevent="createCoupon">
          <div class="form-group">
            <label>Code</label>
            <input v-model="newCoupon.code" required placeholder="e.g. SAVE20">
          </div>
          <div class="form-group">
            <label>Discount Value</label>
            <input v-model.number="newCoupon.discount_value" type="number" required min="1">
          </div>
          <div class="form-group">
            <label>Type</label>
            <select v-model="newCoupon.discount_type">
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div class="form-group">
            <label>Min Order Amount</label>
            <input v-model.number="newCoupon.min_order" type="number" min="0" placeholder="0">
          </div>
          <div class="form-group">
            <label>Max Uses</label>
            <input v-model.number="newCoupon.max_uses" type="number" min="0" placeholder="Unlimited">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="newCoupon.start_time" type="datetime-local" required>
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="newCoupon.end_time" type="datetime-local" required>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create' }}
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
const coupons = ref([])
const loading = ref(true)
const showAdd = ref(false)
const creating = ref(false)
const newCoupon = ref({
  code: '',
  discount_value: 0,
  discount_type: 'percent',
  min_order: 0,
  max_uses: null,
  start_time: '',
  end_time: ''
})

const loadCoupons = async () => {
  loading.value = true
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser?.id)
      .maybeSingle()
    
    if (seller) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false })
      if (error) { console.warn('coupons table not available:', error.message); coupons.value = [] }
      else coupons.value = data || []
    }
  } catch (e) { console.warn('Failed to load coupons:', e.message); coupons.value = [] }
  loading.value = false
}

const createCoupon = async () => {
  creating.value = true
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', userStore.supabaseUser?.id)
      .maybeSingle()
    
    if (!seller) {
      window.__toast?.show('Seller profile not found', 'error')
      creating.value = false
      return
    }

    const { error } = await supabase.from('coupons').insert({
      seller_id: seller.id,
      code: newCoupon.value.code,
      discount_type: newCoupon.value.discount_type,
      discount_value: newCoupon.value.discount_value,
      min_order: newCoupon.value.min_order || 0,
      max_uses: newCoupon.value.max_uses || null,
      start_time: newCoupon.value.start_time ? new Date(newCoupon.value.start_time).toISOString() : null,
      end_time: newCoupon.value.end_time ? new Date(newCoupon.value.end_time).toISOString() : null
    })

    if (error) throw error
    
    window.__toast?.show('Coupon created!', 'success')
    showAdd.value = false
    newCoupon.value = { code: '', discount_value: 0, discount_type: 'percent', min_order: 0, max_uses: null, start_time: '', end_time: '' }
    await loadCoupons()
  } catch (e) {
    window.__toast?.show('Failed: ' + e.message, 'error')
  }
  creating.value = false
}

const deleteCoupon = async (id) => {
  if (!confirm('Delete this coupon?')) return
  try {
    await supabase.from('coupons').delete().eq('id', id)
    coupons.value = coupons.value.filter(c => c.id !== id)
    window.__toast?.show('Coupon deleted', 'success')
  } catch (e) {
    window.__toast?.show('Failed: ' + e.message, 'error')
  }
}

onMounted(loadCoupons)
</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: #FF9900; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading, .empty { text-align: center; padding: 40px; color: #999; clear: both; }
.coupon-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; clear: both; }
.coupon-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); border-left: 4px solid #FF9900; position: relative; }
.coupon-value { font-size: 24px; font-weight: 700; color: #FF9900; margin-bottom: 10px; }
.coupon-code { font-size: 16px; font-weight: 600; color: #333; background: #f5f5f5; padding: 4px 12px; border-radius: 4px; display: inline-block; }
.coupon-min { font-size: 12px; color: #666; margin-top: 8px; }
.coupon-expiry { color: #999; font-size: 12px; margin-top: 10px; }
.coupon-uses { color: #666; font-size: 12px; margin-top: 4px; }
.coupon-actions { margin-top: 12px; }
.btn-delete { background: none; border: none; color: #999; cursor: pointer; padding: 4px 8px; }
.btn-delete:hover { color: #ff4757; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 450px; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: #FF9900; color: #fff; border: none; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }
@media (max-width: 768px) { .coupon-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
</style>
