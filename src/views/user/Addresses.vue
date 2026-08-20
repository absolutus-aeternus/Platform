<template>
  <div class="page-wrapper">
  <div class="addresses">
    <h1>My Addresses</h1>
    <button class="btn-add" @click="showAdd = true">+ Add Address</button>
    
    <div v-if="loading" class="loading">Loading addresses...</div>
    <div v-else-if="addresses.length === 0" class="empty-state">
      <i class="fas fa-map-marker-alt"></i>
      <p>No addresses yet</p>
    </div>
    <div v-else class="address-list">
      <div v-for="addr in addresses" :key="addr.id" class="address-card">
        <div class="address-info">
          <p><strong>{{ addr.contacts }}</strong></p>
          <p>{{ addr.phone }}</p>
          <p>{{ addr.address }}, {{ addr.city }}, {{ addr.province }}, {{ addr.country }} {{ addr.postcode }}</p>
          <span v-if="addr.is_default" class="default-badge">Default</span>
        </div>
        <div class="address-actions">
          <button @click="editAddress(addr)">Edit</button>
          <button @click="deleteAddress(addr.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Modal -->
    <div v-if="showAdd || editing" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editing ? 'Edit Address' : 'Add Address' }}</h2>
        <form @submit.prevent="saveAddress">
          <div class="form-group">
            <label>Contacts</label>
            <input v-model="form.contacts" required>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="form.phone" required>
          </div>
          <div class="form-group">
            <label>Address</label>
            <input v-model="form.address" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City</label>
              <input v-model="form.city" required>
            </div>
            <div class="form-group">
              <label>Province</label>
              <input v-model="form.province" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Country</label>
              <input v-model="form.country" required>
            </div>
            <div class="form-group">
              <label>Postcode</label>
              <input v-model="form.postcode" required>
            </div>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.is_default"> Set as default
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="saving"><i class="fas fa-spinner fa-spin" v-if="saving"></i> {{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const addresses = ref([])
const loading = ref(true)
const saving = ref(false)
const showAdd = ref(false)
const editing = ref(null)
const form = ref({ contacts: '', phone: '', address: '', city: '', province: '', country: 'Indonesia', postcode: '', is_default: false })

const loadAddresses = async () => {
  if (!userStore.supabaseUser) return
  try {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', userStore.supabaseUser.id)
    addresses.value = data || []
  } catch (e) {
    console.error('Failed to load addresses:', e)
  }
  loading.value = false
}

const editAddress = (addr) => {
  editing.value = addr.id
  form.value = { ...addr }
}

const closeModal = () => {
  showAdd.value = false
  editing.value = null
  form.value = { contacts: '', phone: '', address: '', city: '', province: '', country: 'Indonesia', postcode: '', is_default: false }
}

const saveAddress = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await supabase.from('addresses').update(form.value).eq('id', editing.value)
    } else {
      await supabase.from('addresses').insert({ ...form.value, user_id: userStore.supabaseUser.id })
    }
    closeModal()
    await loadAddresses()
  } catch (e) {
    window.__toast?.show('Failed to save address: ' + e.message)
  }
  saving.value = false
}

const deleteAddress = async (id) => {
  if (!confirm('Delete this address?')) return
  try {
    await supabase.from('addresses').delete().eq('id', id)
    addresses.value = addresses.value.filter(a => a.id !== id)
  } catch (e) {
    window.__toast?.show('Failed to delete address')
  }
}

onMounted(loadAddresses)
</template>

</script>

<style scoped>
h1 { margin-bottom: 25px; display: inline-block; }
.btn-add { float: right; padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.loading { text-align: center; padding: 40px; color: #999; clear: both; }
.empty-state { text-align: center; padding: 60px 0; clear: both; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.address-list { clear: both; }
.address-card { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.address-info p { margin-bottom: 4px; }
.default-badge { background: var(--brand-primary, #FF9900); color: #fff; padding: 2px 10px; border-radius: 10px; font-size: 12px; }
.address-actions { display: flex; gap: 8px; }
.address-actions button { padding: 6px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; }
.btn-delete { color: #ff4757; border-color: #ff4757 !important; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; padding: 30px; border-radius: 12px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.modal-actions button { padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.btn-primary { background: var(--brand-primary, #FF9900); color: #fff; border: none; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .card { padding: 1rem; }
  .form-group input { font-size: 16px; }
}

</style>
