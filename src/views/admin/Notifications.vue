<template>
  <div class="admin-notifications">
    <div class="page-header">
      <h1>Notifications</h1>
      <button class="btn-add" @click="showModal = true"><i class="fas fa-bell"></i> Send Notification</button>
    </div>
    <div class="filters">
      <input v-model="search" placeholder="Search notifications...">
      <select v-model="typeFilter"><option value="">All Types</option><option value="info">Info</option><option value="warning">Warning</option><option value="promotion">Promotion</option><option value="order">Order</option></select>
      <select v-model="targetFilter"><option value="">All Targets</option><option value="all">All Users</option><option value="buyers">Buyers</option><option value="sellers">Sellers</option></select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>Title</th><th>Message</th><th>Type</th><th>Target</th><th>Read</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="n in filtered" :key="n.id">
            <td><strong>{{ n.title }}</strong></td>
            <td class="msg">{{ n.message?.substring(0, 50) || '-' }}...</td>
            <td><span class="type-badge" :class="n.type">{{ n.type }}</span></td>
            <td>{{ n.target || 'All' }}</td>
            <td>{{ n.is_read ? '✅' : '❌' }}</td>
            <td>{{ new Date(n.created_at).toLocaleDateString() }}</td>
            <td><button class="btn-sm btn-danger" @click="deleteNotification(n)"><i class="fas fa-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No notifications found</div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>Send Notification</h2>
        <form @submit.prevent="sendNotification">
          <div class="form-group"><label>Title *</label><input v-model="form.title" required placeholder="Notification title"></div>
          <div class="form-group"><label>Message *</label><textarea v-model="form.message" required placeholder="Notification message" rows="4"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label>Type</label><select v-model="form.type"><option value="info">Info</option><option value="warning">Warning</option><option value="promotion">Promotion</option><option value="order">Order</option></select></div>
            <div class="form-group"><label>Target</label><select v-model="form.target"><option value="all">All Users</option><option value="buyers">Buyers</option><option value="sellers">Sellers</option></select></div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn-save">Send</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const notifications = ref([])
const search = ref('')
const typeFilter = ref('')
const targetFilter = ref('')
const showModal = ref(false)
const form = ref({ title: '', message: '', type: 'info', target: 'all' })

const filtered = computed(() => {
  let r = notifications.value
  if (search.value) r = r.filter(n => n.title?.toLowerCase().includes(search.value.toLowerCase()))
  if (typeFilter.value) r = r.filter(n => n.type === typeFilter.value)
  return r
})

const load = async () => {
  loading.value = true
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100)
  notifications.value = data || []
  loading.value = false
}
const sendNotification = async () => {
  if (form.value.target === 'all') {
    const { data: users } = await supabase.from('users').select('id').limit(1000)
    for (const u of users || []) {
      try { await supabase.from('notifications').insert({ ...form.value, user_id: u.id }) } catch(_e) { console.error('Notifications.vue:', _e); window.__toast?.show('Operation failed', 'error') }
    }
  } else {
    await supabase.from('notifications').insert({ ...form.value, user_id: null })
  }
  showModal.value = false
  form.value = { title: '', message: '', type: 'info', target: 'all' }
  await load()
  window.__toast?.show('Notification sent!')
}
const deleteNotification = async (n) => { if (!confirm('Delete?')) return; await supabase.from('notifications').delete().eq('id', n.id); await load() }
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-add { padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.msg { font-size: 13px; color: #666; }
.type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
.type-badge.info { background: #d1ecf1; color: #0c5460; }
.type-badge.warning { background: #fff3cd; color: #856404; }
.type-badge.promotion { background: #d4edda; color: #155724; }
.type-badge.order { background: #e2d5f1; color: #5f27cd; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-danger:hover { border-color: #dc3545; color: #dc3545; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: #fe2c55; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
