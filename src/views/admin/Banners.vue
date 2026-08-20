<template>
  <div class="page-wrapper">
  <div class="admin-banners">
    <div class="page-header"><h1>Banners</h1><button class="btn-add" @click="openModal()"><i class="fas fa-plus"></i> Add Banner</button></div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="banner-grid">
      <div v-for="b in banners" :key="b.id" class="banner-card" :class="{ inactive: !b.is_active }">
        <div class="banner-preview" :style="{ background: b.gradient || 'linear-gradient(135deg, var(--brand-primary, #FF9900), #ff6b81)' }">
          <h3>{{ b.title || 'Banner' }}</h3>
          <p>{{ b.link || '' }}</p>
        </div>
        <div class="banner-meta">
          <span class="type-badge">{{ b.type || 'pc' }}</span>
          <span class="sort">Order: {{ b.sort_order || 0 }}</span>
          <span class="status" :class="b.is_active ? 'active' : 'inactive'">{{ b.is_active ? 'Active' : 'Inactive' }}</span>
        </div>
        <div class="banner-actions">
          <button class="btn-sm" @click="openModal(b)"><i class="fas fa-edit"></i></button>
          <button class="btn-sm" @click="toggleActive(b)"><i :class="b.is_active ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
          <button class="btn-sm btn-danger" @click="deleteBanner(b)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div v-if="banners.length === 0" class="empty-card"><i class="fas fa-image"></i><p>No banners yet</p></div>
    </div>
    <BaseModal v-model="showModal" :title="editing ? 'Edit Banner' : 'Add Banner'" size="md">
      <form @submit.prevent="saveBanner">
        <div class="form-group"><label>Title</label><input v-model="form.title" placeholder="Banner title"></div>
        <div class="form-group"><label>Image URL</label><input v-model="form.image_url" placeholder="https://..."></div>
        <div class="form-group"><label>Link</label><input v-model="form.link" placeholder="https://..."></div>
        <div class="form-row">
          <div class="form-group"><label>Type</label><select v-model="form.type"><option value="pc">PC</option><option value="mobile">Mobile</option></select></div>
          <div class="form-group"><label>Sort Order</label><input v-model.number="form.sort_order" type="number" min="0"></div>
        </div>
        <div class="form-group"><label><input type="checkbox" v-model="form.is_active"> Active</label></div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="showModal = false">Cancel</button>
          <button type="submit" class="btn-save" :disabled="saving" aria-label="Save">{{ saving ? "Saving..." : "Save" }}</button>
        </div>
      </form>
    </BaseModal>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import BaseModal from '@/components/base/BaseModal.vue'

const loading = ref(true)
const saving = ref(false)
const banners = ref([])
const showModal = ref(false)
const editing = ref(null)
const form = ref({ title: '', image_url: '', link: '', type: 'pc', sort_order: 0, is_active: true })

const load = async () => {
  loading.value = true
  try { const { data } = await supabase.from('banners').select('*').order('sort_order')
  banners.value = data || []
  } catch(e) { console.warn('Banners load error:', e) }
  finally { loading.value = false }
}
const openModal = (b) => {
  editing.value = b || null
  form.value = b ? { ...b } : { title: '', image_url: '', link: '', type: 'pc', sort_order: 0, is_active: true }
  showModal.value = true
}
const saveBanner = async () => {
  saving.value = true
  if (editing.value) { await supabase.from('banners').update(form.value).eq('id', editing.value.id) }
  else { await supabase.from('banners').insert(form.value) }
  showModal.value = false
  await load()
  saving.value = false
}
const toggleActive = async (b) => { await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id); await load() }
const deleteBanner = async (b) => { if (!confirm('Delete banner?')) return; await supabase.from('banners').delete().eq('id', b.id); await load() }
onMounted(load)
</script>

<style scoped>
body, html { overflow-x: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-add { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.banner-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.banner-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s; }
.banner-card.inactive { opacity: 0.6; }
.banner-preview { padding: 30px 20px; color: #fff; min-height: 100px; }
.banner-preview h3 { margin: 0 0 8px; font-size: 18px; }
.banner-preview p { margin: 0; opacity: 0.8; font-size: 13px; }
.banner-meta { padding: 12px 16px; display: flex; gap: 10px; align-items: center; border-bottom: 1px solid #f0f0f0; }
.type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; background: #f0f0f0; }
.sort { font-size: 12px; color: #999; }
.status { padding: 3px 8px; border-radius: 10px; font-size: 11px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.banner-actions { padding: 12px 16px; display: flex; gap: 8px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-danger:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
.empty-card { grid-column: 1 / -1; text-align: center; padding: 60px; background: #fff; border-radius: 12px; color: #999; }
.empty-card i { font-size: 48px; color: #ddd; margin-bottom: 15px; display: block; }
.loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.form-group input[type="checkbox"] { width: auto; margin-right: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }

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
