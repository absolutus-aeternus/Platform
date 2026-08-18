<template>
  <div class="admin-sellers">
    <div class="page-header">
      <h1>Sellers</h1>
      <div class="header-stats">
        <span class="stat">Total: {{ sellers.length }}</span>
        <span class="stat active">Active: {{ sellers.filter(s => s.status === 'active').length }}</span>
      </div>
    </div>

    <div class="filters">
      <input v-model="search" placeholder="Search sellers...">
      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="pending">Pending</option>
      </select>
      <select v-model="sortBy">
        <option value="newest">Newest</option>
        <option value="sales">Top Sales</option>
        <option value="products">Most Products</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Store</th>
            <th>Owner</th>
            <th>Products</th>
            <th>Sales</th>
            <th>Revenue</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="seller in filteredSellers" :key="seller.id">
            <td>
              <div class="store-cell">
                <div class="store-avatar" :style="{ background: seller.avatar_color || 'var(--brand-primary, #FF9900)' }">{{ (seller.name || '?')[0] }}</div>
                <div>
                  <strong>{{ seller.name }}</strong>
                  <p class="store-desc">{{ seller.description?.substring(0, 40) || 'No description' }}</p>
                </div>
              </div>
            </td>
            <td>{{ seller.users?.email || 'N/A' }}</td>
            <td>{{ seller.goods_count || 0 }}</td>
            <td>{{ seller.sales_count || 0 }}</td>
            <td>${{ (seller.revenue || 0).toFixed(2) }}</td>
            <td><span class="rating">⭐ {{ seller.rating || '5.0' }}</span></td>
            <td><span class="status" :class="seller.status">{{ seller.status }}</span></td>
            <td>{{ new Date(seller.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-sm" @click="viewSeller(seller)" title="View"><i class="fas fa-eye"></i></button>
              <button class="btn-sm" @click="toggleSellerStatus(seller)" :title="seller.status === 'active' ? 'Suspend' : 'Activate'">
                <i :class="seller.status === 'active' ? 'fas fa-ban' : 'fas fa-check'"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredSellers.length === 0" class="empty">No sellers found</div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailSeller" class="modal-overlay" @click.self="detailSeller = null">
      <div class="modal">
        <h2>{{ detailSeller.name }}</h2>
        <div class="detail-grid">
          <div class="detail-item"><label>Owner</label><span>{{ detailSeller.users?.email || 'N/A' }}</span></div>
          <div class="detail-item"><label>Products</label><span>{{ detailSeller.goods_count || 0 }}</span></div>
          <div class="detail-item"><label>Total Sales</label><span>{{ detailSeller.sales_count || 0 }}</span></div>
          <div class="detail-item"><label>Revenue</label><span>${{ (detailSeller.revenue || 0).toFixed(2) }}</span></div>
          <div class="detail-item"><label>Status</label><span class="status" :class="detailSeller.status">{{ detailSeller.status }}</span></div>
          <div class="detail-item"><label>Joined</label><span>{{ new Date(detailSeller.created_at).toLocaleDateString() }}</span></div>
        </div>
        <p class="detail-desc">{{ detailSeller.description || 'No description provided.' }}</p>
        <button class="btn-close" @click="detailSeller = null">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const sellers = ref([])
const search = ref('')
const statusFilter = ref('')
const sortBy = ref('newest')
const detailSeller = ref(null)

const filteredSellers = computed(() => {
  let result = sellers.value
  if (search.value) result = result.filter(s => s.name.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value) result = result.filter(s => s.status === statusFilter.value)
  if (sortBy.value === 'sales') result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
  if (sortBy.value === 'products') result.sort((a, b) => (b.goods_count || 0) - (a.goods_count || 0))
  return result
})

const loadSellers = async () => {
  loading.value = true
  try { const { data } = await supabase.from('sellers').select('*, users(email)').order('created_at', { ascending: false })
  sellers.value = data || []
  } catch(e) { console.warn('Sellers load error:', e) }
  finally { loading.value = false }
  loading.value = false
}

const viewSeller = (seller) => { detailSeller.value = seller }

const toggleSellerStatus = async (seller) => {
  const newStatus = seller.status === 'active' ? 'suspended' : 'active'
  if (!confirm(`${newStatus === 'suspended' ? 'Suspend' : 'Activate'} "${seller.name}"?`)) return
  try { await supabase.from('sellers').update({ status: newStatus }).eq('id', seller.id) } catch(_e) { console.error('Sellers.vue:', _e); window.__toast?.show('Operation failed', 'error') }
  await loadSellers()
}

onMounted(loadSellers)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.header-stats { display: flex; gap: 15px; }
.stat { background: #f0f0f0; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
.stat.active { background: #d4edda; color: #155724; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.store-cell { display: flex; align-items: center; gap: 10px; }
.store-avatar { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; }
.store-desc { font-size: 12px; color: #999; margin: 2px 0 0; }
.rating { font-size: 13px; }
.status { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
.status.active { background: #d4edda; color: #155724; }
.status.suspended { background: #f8d7da; color: #721c24; }
.status.pending { background: #fff3cd; color: #856404; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-sm:hover { background: #f5f5f5; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.detail-item label { display: block; font-size: 12px; color: #999; margin-bottom: 4px; }
.detail-item span { font-size: 14px; font-weight: 500; }
.detail-desc { color: #666; font-size: 14px; padding: 15px; background: #f8f8f8; border-radius: 8px; margin-bottom: 20px; }
.btn-close { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }

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
