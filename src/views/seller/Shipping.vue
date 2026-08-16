<template>
  <div class="seller-shipping">
    <div class="page-header"><h1>Shipping</h1></div>
    <div class="grid-2">
      <div class="card">
        <h2><i class="fas fa-cog"></i> Shipping Settings</h2>
        <div class="form-group"><label>Default Shipping Method</label>
          <select v-model="settings.method"><option value="standard">Standard Shipping (5-7 days)</option><option value="express">Express Shipping (2-3 days)</option><option value="free">Free Shipping</option></select>
        </div>
        <div class="form-group"><label>Processing Time</label>
          <select v-model="settings.processingTime"><option value="1">1 business day</option><option value="2">2 business days</option><option value="3">3 business days</option><option value="5">5 business days</option></select>
        </div>
        <div class="form-group"><label>Default Shipping Fee ($)</label><input v-model.number="settings.defaultFee" type="number" step="0.01" min="0"></div>
        <div class="form-group"><label>Free Shipping Threshold ($)</label><input v-model.number="settings.freeThreshold" type="number" step="0.01" min="0"><p class="hint">Orders above this amount get free shipping</p></div>
        <button class="btn-save" @click="saveSettings">Save Settings</button>
      </div>
      <div class="card">
        <h2><i class="fas fa-map-marker-alt"></i> Shipping Zones</h2>
        <div class="zone-list">
          <div v-for="zone in zones" :key="zone.name" class="zone-item">
            <div class="zone-info"><strong>{{ zone.name }}</strong><p>{{ zone.countries }}</p></div>
            <div class="zone-rate">${{ zone.rate }}</div>
            <div class="zone-days">{{ zone.days }} days</div>
          </div>
        </div>
        <button class="btn-add-zone" @click="addZone">+ Add Zone</button>
      </div>
    </div>
    <div class="card">
      <h2><i class="fas fa-truck"></i> Recent Shipments</h2>
      <div v-if="shipments.length === 0" class="empty">No recent shipments</div>
      <table v-else>
        <thead><tr><th>Order #</th><th>Customer</th><th>Method</th><th>Tracking #</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <tr v-for="s in shipments" :key="s.id"><td>{{ s.order_no }}</td><td>{{ s.customer }}</td><td>{{ s.method }}</td><td class="tracking">{{ s.tracking || '-' }}</td><td><span class="status" :class="s.status">{{ s.status }}</span></td><td>{{ s.date }}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const settings = ref({ method: 'standard', processingTime: '2', defaultFee: 5.00, freeThreshold: 50 })
const zones = ref([
  { name: 'Domestic', countries: 'Indonesia', rate: 5.00, days: 3 },
  { name: 'Asia Pacific', countries: 'Singapore, Malaysia, Thailand, Vietnam', rate: 15.00, days: 7 },
  { name: 'International', countries: 'USA, Europe, Rest of World', rate: 25.00, days: 14 }
])
const shipments = ref([])

const saveSettings = () => window.__toast?.show('Shipping settings saved!')
const addZone = () => window.__toast?.show('Add zone feature coming soon')

onMounted(async () => {
  if (!userStore.supabaseUser) return
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (!seller) return
  const { data } = await supabase.from('orders').select('order_no, users(email), tracking_no, status, created_at').eq('seller_id', seller.id).eq('status', 'shipped').order('created_at', { ascending: false }).limit(10)
  shipments.value = (data || []).map(o => ({ id: o.order_no, order_no: o.order_no, customer: o.users?.email || 'N/A', method: 'Standard', tracking: o.tracking_no, status: o.status, date: new Date(o.created_at).toLocaleDateString() }))
})
</script>

<style scoped>
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.card h2 { margin: 0 0 20px; font-size: 16px; display: flex; align-items: center; gap: 10px; }
.card h2 i { color: #FF9900; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #FF9900; }
.hint { font-size: 12px; color: #999; margin-top: 4px; }
.btn-save { padding: 12px 24px; background: #FF9900; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.zone-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
.zone-item { display: flex; align-items: center; gap: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
.zone-info { flex: 1; }
.zone-info p { font-size: 12px; color: #999; margin: 2px 0 0; }
.zone-rate { font-weight: 600; color: #FF9900; }
.zone-days { font-size: 13px; color: #666; }
.btn-add-zone { padding: 10px; width: 100%; border: 2px dashed #ddd; background: none; border-radius: 8px; cursor: pointer; color: #666; }
.btn-add-zone:hover { border-color: #FF9900; color: #FF9900; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.tracking { font-family: monospace; font-size: 12px; }
.status { padding: 3px 8px; border-radius: 10px; font-size: 12px; text-transform: capitalize; }
.status.shipped { background: #d1ecf1; color: #0c5460; }
.status.delivered { background: #d4edda; color: #155724; }
.empty { text-align: center; padding: 40px; color: #999; }

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
