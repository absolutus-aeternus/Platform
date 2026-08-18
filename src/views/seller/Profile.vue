<template>
  <div class="seller-profile">
    <h1>Store Profile</h1>
    <div class="profile-grid">
      <div class="profile-card">
        <div class="avatar">{{ store.name?.[0] || 'S' }}</div>
        <h2>{{ store.name || 'Your Store' }}</h2>
        <p>{{ store.description || 'No description' }}</p>
        <div class="stats">
          <div><strong>{{ store.goods_count || 0 }}</strong> Products</div>
          <div><strong>{{ store.sales_count || 0 }}</strong> Sales</div>
          <div><strong>100%</strong> Rating</div>
        </div>
      </div>
      <div class="profile-form">
        <div class="form-group">
          <label>Store Name</label>
          <input v-model="store.name" placeholder="Store name">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="store.description" placeholder="Store description"></textarea>
        </div>
        <div class="form-group">
          <label>Contact Phone</label>
          <input v-model="store.phone" placeholder="Phone number">
        </div>
        <div class="form-group">
          <label>Store Address</label>
          <input v-model="store.address" placeholder="Address">
        </div>
        <button class="btn-save" @click="saveProfile">Save Profile</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const store = ref({})

onMounted(async () => {
  if (userStore.supabaseUser) {
    const { data } = await supabase.from('sellers').select('*').eq('user_id', userStore.supabaseUser.id).single()
    store.value = data || {}
  }
})

const saveProfile = async () => {
  if (!userStore.supabaseUser) return
  try {
    await supabase.from('sellers').update({
      name: store.value.name,
      description: store.value.description,
      logo: store.value.logo
    }).eq('user_id', userStore.supabaseUser.id)
    window.__toast?.show('Profile saved!', 'success')
  loading.value = false
  } catch (e) {
    console.error('Save profile error:', e)
    window.__toast?.show('Failed to save profile', 'error')
  }
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 25px; }
.profile-card { background: #fff; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.avatar { width: 80px; height: 80px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 15px; }
.stats { display: flex; justify-content: center; gap: 30px; margin-top: 20px; }
.profile-form { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.form-group textarea { height: 100px; resize: vertical; }
.btn-save { padding: 12px 30px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; }

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
