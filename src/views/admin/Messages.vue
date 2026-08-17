<template>
  <div class="admin-messages">
    <div class="page-header"><h1>Messages</h1><span class="badge">System-wide message monitoring</span></div>
    <div class="filters">
      <input v-model="search" placeholder="Search messages...">
      <select v-model="typeFilter"><option value="">All Types</option><option value="text">Text</option><option value="image">Image</option><option value="system">System</option></select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>Sender</th><th>Receiver</th><th>Message</th><th>Type</th><th>Read</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="m in filtered" :key="m.id">
            <td>{{ m.sender?.email || 'System' }}</td>
            <td>{{ m.receiver?.email || 'N/A' }}</td>
            <td class="msg">{{ m.message?.substring(0, 60) || '-' }}</td>
            <td><span class="type-badge">{{ m.message_type || 'text' }}</span></td>
            <td>{{ m.is_read ? '✅' : '❌' }}</td>
            <td>{{ new Date(m.created_at).toLocaleString() }}</td>
            <td><button class="btn-sm btn-danger" @click="deleteMsg(m)"><i class="fas fa-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No messages found</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const messages = ref([])
const search = ref('')
const typeFilter = ref('')

const filtered = computed(() => {
  let r = messages.value
  if (search.value) r = r.filter(m => m.message?.toLowerCase().includes(search.value.toLowerCase()))
  if (typeFilter.value) r = r.filter(m => m.message_type === typeFilter.value)
  return r
})

const load = async () => {
  try {
    loading.value = true
    const { data } = await supabase.from('chat_messages').select('*, sender:users!sender_id(email), receiver:users!receiver_id(email)').order('created_at', { ascending: false }).limit(200)
    messages.value = data || []
  } catch (e) { console.error('Messages load error:', e) }
  loading.value = false
}
const deleteMsg = async (m) => { if (!confirm('Delete message?')) return; await supabase.from('chat_messages').delete().eq('id', m.id); await load() }
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.badge { background: #f0f0f0; padding: 5px 12px; border-radius: 12px; font-size: 12px; color: #666; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.msg { font-size: 13px; color: #666; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; background: #f0f0f0; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-danger:hover { border-color: #dc3545; color: #dc3545; }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 10px; align-items: flex-start; }
  .page-header h1 { font-size: 1.25rem; }
  .filters { flex-direction: column; }
  .filters input, .filters select { width: 100%; }
}
</style>
