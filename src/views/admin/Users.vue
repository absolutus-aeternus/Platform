<template>
  <div class="page-wrapper">
  <div class="admin-users">
    <div class="page-header"><h1>Users</h1><span class="badge">{{ filtered.length }} users</span></div>
    <div class="filters">
      <input v-model="search" placeholder="Search by email or username...">
      <select v-model="roleFilter"><option value="">All Roles</option><option value="MEMBER">Member</option><option value="SELLER">Seller</option><option value="ADMIN">Admin</option></select>
      <select v-model="kycFilter"><option value="">All KYC</option><option value="0">Unverified</option><option value="1">Level 1</option><option value="2">Level 2</option><option value="3">Level 3</option></select>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>KYC</th><th>Identity</th><th>Google</th><th>Last Login</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="user in filtered" :key="user.id">
            <td><div class="user-cell"><div class="avatar" :style="{ background: avatarColor(user) }">{{ (user.email || '?')[0].toUpperCase() }}</div><div><strong>{{ user.username || user.email?.split('@')[0] }}</strong><p class="user-id">{{ user.usercode || user.id?.substring(0,8) }}</p></div></div></td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" :class="(user.role || 'member').toLowerCase()">{{ user.role || 'MEMBER' }}</span></td>
            <td><span class="kyc-badge" :class="'kyc-' + (user.kyc_status || 0)">{{ user.kyc_status || 0 }}</span></td>
            <td>{{ user.identityverif ? '✅' : '❌' }}</td>
            <td>{{ user.googleverif ? '✅' : '❌' }}</td>
            <td>{{ user.lastlogintime ? timeAgo(user.lastlogintime) : 'Never' }}</td>
            <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <button class="btn-sm" @click="viewUser(user)" title="View"><i class="fas fa-eye"></i></button>
              <button class="btn-sm" @click="editRole(user)" title="Change Role"><i class="fas fa-user-cog"></i></button>
              <button class="btn-sm btn-danger" @click="deleteUser(user)" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="empty">No users found</div>
    </div>
    <!-- Detail Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
      <div class="modal">
        <h2>User Details</h2>
        <div class="detail-grid">
          <div class="detail-item"><label>Email</label><span>{{ selectedUser.email }}</span></div>
          <div class="detail-item"><label>Username</label><span>{{ selectedUser.username || '-' }}</span></div>
          <div class="detail-item"><label>Role</label><span class="role-badge" :class="(selectedUser.role||'member').toLowerCase()">{{ selectedUser.role }}</span></div>
          <div class="detail-item"><label>KYC Level</label><span>{{ selectedUser.kyc_status || 0 }}</span></div>
          <div class="detail-item"><label>Identity Verified</label><span>{{ selectedUser.identityverif ? 'Yes' : 'No' }}</span></div>
          <div class="detail-item"><label>Google Verified</label><span>{{ selectedUser.googleverif ? 'Yes' : 'No' }}</span></div>
          <div class="detail-item"><label>Last IP</label><span>{{ selectedUser.lastloginip || 'N/A' }}</span></div>
          <div class="detail-item"><label>Joined</label><span>{{ new Date(selectedUser.created_at).toLocaleString() }}</span></div>
        </div>
        <button class="btn-close" @click="selectedUser = null">Close</button>
      </div>
    </div>
  </div>
  </div>

</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { apiFetch } from '@/utils/csrf'

const loading = ref(true)
const users = ref([])
const search = ref('')
const roleFilter = ref('')
const kycFilter = ref('')
const selectedUser = ref(null)

const filtered = computed(() => {
  let r = users.value
  if (search.value) { const q = search.value.toLowerCase(); r = r.filter(u => u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q)) }
  if (roleFilter.value) r = r.filter(u => (u.role || 'MEMBER') === roleFilter.value)
  if (kycFilter.value !== '') r = r.filter(u => String(u.kyc_status || 0) === kycFilter.value)
  return r
})

const avatarColor = (u) => { const colors = ['var(--brand-primary, #FF9900)','#4ecdc4','#45b7d1','#96ceb4','#feca57','#ff6b81','#54a0ff','#5f27cd']; return colors[(u.email||'').charCodeAt(0) % colors.length] }
const timeAgo = (t) => { const d = new Date(t), now = new Date(), diff = now - d; if (diff < 3600000) return Math.floor(diff/60000) + 'm ago'; if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago'; return Math.floor(diff/86400000) + 'd ago' }

const load = async () => {
  loading.value = true
  try { const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  users.value = data || []
  } catch(e) { console.warn('Users load error:', e) }
  finally { loading.value = false }
}
const viewUser = (u) => { selectedUser.value = u }
const editRole = async (u) => {
  const role = prompt(`Change role for ${u.email}\nCurrent: ${u.role || 'MEMBER'}\nOptions: MEMBER, SELLER, ADMIN`, u.role || 'MEMBER')
  if (role && ['MEMBER','SELLER','ADMIN'].includes(role.toUpperCase())) {
    try {
      const resp = await apiFetch('/api/admin/change-role', {
        method: 'POST',
        body: JSON.stringify({ userId: u.id, newRole: role.toUpperCase(), reason: 'Admin UI role change' })
      })
      const result = await resp.json()
      if (result.success) { window.__toast?.show('Role updated', 'success'); await load() }
      else { window.__toast?.show(result.error || 'Failed to change role', 'error') }
    } catch (e) { window.__toast?.show('Error: ' + e.message, 'error') }
  }
}
const deleteUser = async (u) => {
  if (!confirm(`Delete user ${u.email}?`)) return
  try {
    // Use service role via Worker (admin-only endpoint)
    const resp = await apiFetch('/api/admin/change-role', {
      method: 'POST',
      body: JSON.stringify({ userId: u.id, newRole: 'MEMBER', reason: 'Deletion not supported - role reset instead' })
    })
    window.__toast?.show('User role reset. Full deletion requires server-side action.', 'info')
    await load()
  } catch (e) { window.__toast?.show('Error: ' + e.message, 'error') }
}
onMounted(load)


</script>

<style scoped>
body, html { overflow-x: hidden; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.badge { background: #f0f0f0; padding: 5px 12px; border-radius: 12px; font-size: 13px; color: #666; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.filters input { flex: 1; }
.table-wrapper { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 14px; }
.user-id { font-size: 11px; color: #999; margin: 2px 0 0; }
.role-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
.role-badge.member { background: #d1ecf1; color: #0c5460; }
.role-badge.seller { background: #fff3cd; color: #856404; }
.role-badge.admin { background: #d4edda; color: #155724; }
.kyc-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 11px; font-weight: 600; }
.kyc-0 { background: #f8d7da; color: #721c24; }
.kyc-1 { background: #fff3cd; color: #856404; }
.kyc-2 { background: #d1ecf1; color: #0c5460; }
.kyc-3 { background: #d4edda; color: #155724; }
.actions { display: flex; gap: 6px; }
.btn-sm { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-sm:hover { background: #f5f5f5; }
.btn-danger:hover { border-color: var(--error, #CC0C39); color: var(--error, #CC0C39); }
.empty, .loading { text-align: center; padding: 40px; color: #999; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; border-radius: 12px; padding: 30px; width: 500px; max-width: 90vw; }
.modal h2 { margin: 0 0 20px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.detail-item label { display: block; font-size: 12px; color: #999; margin-bottom: 4px; }
.detail-item span { font-size: 14px; font-weight: 500; }
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
