<template>
  <div class="page-wrapper">
  <div class="admin-categories">
    <div class="page-header">
      <h1>Categories</h1>
      <button class="btn-add" @click="showModal = true"><i class="fas fa-plus"></i> Add Category</button>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search categories..." @input="filterCategories">
      <select v-model="statusFilter" @change="filterCategories">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Description</th>
            <th>Products</th>
            <th>Sort Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in filteredCategories" :key="cat.id">
            <td><div class="cat-icon" :style="{ background: cat.color || 'var(--brand-primary, #FF9900)' }">{{ cat.icon || (cat.name || '?')[0] }}</div></td>
            <td><strong>{{ cat.name }}</strong></td>
            <td>{{ cat.description || '-' }}</td>
            <td>{{ cat.product_count || 0 }}</td>
            <td>{{ cat.sort_order }}</td>
            <td><span class="status" :class="cat.is_active ? 'active' : 'inactive'">{{ cat.is_active ? 'Active' : 'Inactive' }}</span></td>
            <td class="actions">
              <button class="btn-sm" @click="editCategory(cat)"><i class="fas fa-edit"></i></button>
              <button class="btn-sm btn-danger" @click="toggleStatus(cat)"><i :class="cat.is_active ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
              <button class="btn-sm btn-danger" @click="deleteCategory(cat)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredCategories.length === 0" class="empty">No categories found</div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editing ? 'Edit Category' : 'Add Category' }}</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="form.name" required placeholder="Category name">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Category description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Icon (emoji)</label>
              <input v-model="form.icon" placeholder="🍎" maxlength="4">
            </div>
            <div class="form-group">
              <label>Color</label>
              <input v-model="form.color" type="color">
            </div>
            <div class="form-group">
              <label>Sort Order</label>
              <input v-model.number="form.sort_order" type="number" min="0">
            </div>
          </div>
          <div class="form-group">
            <label><input type="checkbox" v-model="form.is_active"> Active</label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const saving = ref(false)
const categories = ref([])
const search = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editing = ref(null)

const form = ref({ name: '', description: '', icon: '', color: 'var(--brand-primary, #FF9900)', sort_order: 0, is_active: true })

const filteredCategories = computed(() => {
  let result = categories.value
  if (search.value) result = result.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value === 'active') result = result.filter(c => c.is_active)
  if (statusFilter.value === 'inactive') result = result.filter(c => !c.is_active)
  return result
})

const loadCategories = async () => {
  loading.value = true
  try { const { data } = await supabase.from('categories').select('*').order('sort_order')
  categories.value = data || []
  } catch(e) { console.warn('Categories load error:', e) }
  finally { loading.value = false }
}

const editCategory = (cat) => {
  editing.value = cat
  form.value = { ...cat }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editing.value = null
  form.value = { name: '', description: '', icon: '', color: 'var(--brand-primary, #FF9900)', sort_order: 0, is_active: true }
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await supabase.from('categories').update({ ...form.value, updated_at: new Date().toISOString() }).eq('id', editing.value.id)
    } else {
      await supabase.from('categories').insert(form.value)
    }
    await loadCategories()
    closeModal()
  } catch (e) { window.__toast?.show('Error: ' + e.message) }
  saving.value = false
}

const toggleStatus = async (cat) => {
  try { await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id) } catch(_e) { console.error('Categories.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  await loadCategories()
}

const deleteCategory = async (cat) => {
  if (!confirm(`Delete "${cat.name}"?`)) return
  try { await supabase.from('categories').delete().eq('id', cat.id) } catch(_e) { console.error('Categories.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  await loadCategories()
}

onMounted(loadCategories)
</script>

<style scoped>
body, html { overflow-x: hidden; }
.admin-categories { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-add { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-add:hover { background: #e6254d; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.cat-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-sm:hover { background: #f5f5f5; }
.btn-danger:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
.empty { text-align: center; padding: 40px; color: #999; }
.loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; max-height: 90vh; overflow-y: auto; }
.modal h2 { margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.form-group input[type="color"] { padding: 4px; height: 40px; }
.form-group input[type="checkbox"] { width: auto; margin-right: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-save:disabled { background: #ccc; }

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
