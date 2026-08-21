<template>
  <div class="page-wrapper">
  <div class="seller-settings">
    <div class="page-header"><h1>Store Settings</h1><button class="btn-save" @click="saveSettings" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button></div>
    <div class="settings-grid">
      <div class="card">
        <h2><i class="fas fa-store"></i> Store Information</h2>
        <div class="form-group"><label>Store Name *</label><input v-model="form.name" placeholder="Your store name" required></div>
        <div class="form-group"><label>Store Description</label><textarea v-model="form.description" placeholder="Describe your store..." rows="4"></textarea></div>
        <div class="form-group"><label>Store Logo URL</label><input v-model="form.logo" placeholder="https://..."></div>
        <div class="form-row">
          <div class="form-group"><label>Contact Email</label><input v-model="form.email" type="email" placeholder="contact@store.com"></div>
          <div class="form-group"><label>Contact Phone</label><input v-model="form.phone" placeholder="+62..."></div>
        </div>
      </div>
      <div class="card">
        <h2><i class="fas fa-bell"></i> Notifications</h2>
        <div class="form-group"><label class="toggle"><input type="checkbox" v-model="form.notifyOrders"><span>Email on new orders</span></label></div>
        <div class="form-group"><label class="toggle"><input type="checkbox" v-model="form.notifyMessages"><span>Email on new messages</span></label></div>
        <div class="form-group"><label class="toggle"><input type="checkbox" v-model="form.notifyReviews"><span>Email on new reviews</span></label></div>
        <div class="form-group"><label class="toggle"><input type="checkbox" v-model="form.notifyLowStock"><span>Alert on low stock</span></label></div>
        <div class="form-group"><label>Low Stock Threshold</label><input v-model.number="form.lowStockThreshold" type="number" min="1"></div>
      </div>
    </div>
    <div class="card">
      <h2><i class="fas fa-shield-alt"></i> Store Policies</h2>
      <div class="form-row">
        <div class="form-group"><label>Return Policy (days)</label><select v-model="form.returnDays"><option value="7">7 days</option><option value="14">14 days</option><option value="30">30 days</option><option value="0">No returns</option></select></div>
        <div class="form-group"><label>Warranty</label><select v-model="form.warranty"><option value="none">No warranty</option><option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option></select></div>
      </div>
      <div class="form-group"><label>Store Policies</label><textarea v-model="form.policies" placeholder="Enter your store policies..." rows="4"></textarea></div>
    </div>
    <div v-if="saved" class="toast"><i class="fas fa-check-circle"></i> Settings saved!</div>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const userStore = useUserStore()
const saving = ref(false)
const saved = ref(false)
const sellerId = ref(null)
const form = ref({
  name: '', description: '', logo: '', email: '', phone: '',
  notifyOrders: true, notifyMessages: true, notifyReviews: true, notifyLowStock: true, lowStockThreshold: 10,
  returnDays: '7', warranty: 'none', policies: ''
})

onMounted(async () => { try {
  if (!userStore.supabaseUser) return
  const { data: seller } = await supabase.from('sellers').select('*').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    sellerId.value = seller.id
    form.value.name = seller.name || ''
    form.value.description = seller.description || ''
    form.value.logo = seller.logo || ''
  }
  form.value.email = userStore.supabaseUser.email || ''
  loading.value = false
} catch (e) { console.error("Settings.vue error:", e) }
})

const saveSettings = async () => {
  saving.value = true
  if (sellerId.value) {
    await supabase.from('sellers').update({ name: form.value.name, description: form.value.description, logo: form.value.logo, updated_at: new Date().toISOString() }).eq('id', sellerId.value)
  }
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}


</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.btn-save { padding: 12px 24px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-save:disabled { background: #ccc; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.card h2 { margin: 0 0 20px; font-size: 16px; display: flex; align-items: center; gap: 10px; }
.card h2 i { color: var(--brand-primary, #FF9900); }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.form-group textarea { resize: vertical; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.toggle { display: flex !important; align-items: center; gap: 10px; cursor: pointer; }
.toggle input { width: 18px; height: 18px; accent-color: var(--brand-primary, #FF9900); }
.toggle span { font-weight: 500; }
.toast { position: fixed; bottom: 30px; right: 30px; background: var(--success, #067D62); color: #fff; padding: 14px 24px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; z-index: 800; }

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
