<template>
  <div class="page-wrapper">
  <div class="admin-coupons">
    <div class="page-header">
      <h1>Coupons</h1>
      <button class="btn-add" @click="showModal = true"><i class="fas fa-plus"></i> Create Coupon</button>
    </div>
    <div class="filters">
      <input v-model="search" placeholder="Search coupons...">
      <select v-model="typeFilter"><option value="">All Types</option><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_shipping">Free Shipping</option></select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Usage</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td><code class="coupon-code">{{ c.code }}</code></td>
            <td>{{ c.type }}</td>
            <td>{{ c.type === 'percentage' ? c.value + '%' : '$' + c.value }}</td>
            <td>${{ c.min_order || 0 }}</td>
            <td>{{ c.used_count || 0 }} / {{ c.max_usage || '∞' }}</td>
            <td>{{ c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never' }}</td>
            <td><span class="status" :class="c.is_active ? 'active' : 'inactive'">{{ c.is_active ? 'Active' : 'Inactive' }}</span></td>
            <td class="actions">
              <button class="btn-sm" @click="toggleActive(c)"><i :class="c.is_active ? 'fas fa-pause' : 'fas fa-play'"></i></button>
              <button class="btn-sm btn-danger" @click="deleteCoupon(c)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No coupons found</div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>Create Coupon</h2>
        <form @submit.prevent="createCoupon">
          <div class="form-row">
            <div class="form-group"><label>Code *</label><input v-model="form.code" required placeholder="SUMMER2026"></div>
            <div class="form-group"><label>Type *</label><select v-model="form.type"><option value="percentage">Percentage</option><option value="fixed">Fixed</option><option value="free_shipping">Free Shipping</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Value *</label><input v-model.number="form.value" type="number" required min="0"></div>
            <div class="form-group"><label>Min Order ($)</label><input v-model.number="form.min_order" type="number" min="0"></div>
            <div class="form-group"><label>Max Usage</label><input v-model.number="form.max_usage" type="number" min="1"></div>
          </div>
          <div class="form-group"><label>Expires At</label><input v-model="form.expires_at" type="date"></div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving" aria-label="Create">{{ saving ? "Creating..." : "Create" }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const saving = ref(false)
const coupons = ref([])
const search = ref('')
const typeFilter = ref('')
const showModal = ref(false)
const form = ref({ code: '', type: 'percentage', value: 0, min_order: 0, max_usage: 100, expires_at: '' })

const filtered = computed(() => {
  let r = coupons.value
  if (search.value) r = r.filter(c => c.code.toLowerCase().includes(search.value.toLowerCase()))
  if (typeFilter.value) r = r.filter(c => c.type === typeFilter.value)
  return r
})

const load = async () => {
  loading.value = true
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  coupons.value = data || []
  loading.value = false
}
const createCoupon = async () => {
  saving.value = true
  try { await supabase.from('coupons').insert({ ...form.value, is_active: true, used_count: 0 }) } catch(_e) { console.error('Coupons.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  showModal.value = false
  form.value = { code: '', type: 'percentage', value: 0, min_order: 0, max_usage: 100, expires_at: '' }
  await load()
  saving.value = false
}
const toggleActive = async (c) => { await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id); await load() }
const deleteCoupon = async (c) => { if (!confirm(`Delete "${c.code}"?`)) return; await supabase.from('coupons').delete().eq('id', c.id); await load() }
onMounted(load)
</template>

</script>

<style scoped>
body, html { overflow-x: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-add { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.coupon-code { background: #f0f0f0; padding: 4px 10px; border-radius: 4px; font-weight: 600; letter-spacing: 1px; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; }
.status.active { background: #d4edda; color: #155724; }
.status.inactive { background: #f8d7da; color: #721c24; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-danger:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
