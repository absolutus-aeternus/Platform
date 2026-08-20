<template>
  <div class="page-wrapper">
  <div class="manage-admins">
    <div class="page-header">
      <h1>Manage Admin Accounts</h1>
      <button class="btn-primary" @click="showAdd = true">
        <i class="fas fa-plus"></i> Add Admin
      </button>
    </div>

    <!-- Add Admin Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h3>Add New Admin</h3>
        <form @submit.prevent="createAdmin">
          <div class="form-group">
            <label>Email</label>
            <input v-model="newAdmin.email" type="email" placeholder="admin@example.com" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="newAdmin.password" type="password" placeholder="••••••••" required minlength="6">
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="newAdmin.role">
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="SELLER">Seller</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showAdd = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create Account' }}
            </button>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <div v-if="success" class="success-msg">{{ success }}</div>
        </form>
      </div>
    </div>

    <!-- Admin List -->
    <div v-if="loading" class="loading">Loading admins...</div>
    <table v-else>
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in admins" :key="user.id">
          <td>{{ user.email || user.username || 'N/A' }}</td>
          <td>
            <span class="role-badge" :class="user.role?.toLowerCase()">{{ user.role }}</span>
          </td>
          <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
          <td>
            <select v-if="userStore.isSuperAdmin" :value="user.role" @change="updateRole(user, $event.target.value)" class="role-select">
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="SELLER">Seller</option>
              <option value="MEMBER">Member</option>
            </select>
            <button v-if="userStore.isSuperAdmin && user.id !== userStore.supabaseUser?.id" 
              class="btn-sm btn-danger" @click="deleteUser(user)">Delete</button>
          </td>
        </tr>
        <tr v-if="admins.length === 0">
          <td colspan="4" style="text-align:center;padding:20px;color:#999">No admin accounts found</td>
        </tr>
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
const admins = ref([])
const loading = ref(true)
const showAdd = ref(false)
const creating = ref(false)
const error = ref('')
const success = ref('')
const newAdmin = ref({ email: '', password: '', role: 'ADMIN' })

const loadAdmins = async () => {
  loading.value = true
  try {
    const { data } = await supabase.from('users')
      .select('id, email, username, role, created_at')
      .in('role', ['SUPER_ADMIN', 'ADMIN'])
      .order('created_at', { ascending: false })
    admins.value = data || []
  } catch(e) { console.warn('Load admins error:', e) }
  finally { loading.value = false }
}

onMounted(loadAdmins)

const createAdmin = async () => {
  error.value = ''
  success.value = ''
  creating.value = true
  try {
    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newAdmin.value.email,
      password: newAdmin.value.password,
    })
    if (authError) throw authError

    // Set role in users table
    if (authData.user) {
      await supabase.from('users').upsert({
        id: authData.user.id,
        email: newAdmin.value.email,
        role: newAdmin.value.role,
        username: newAdmin.value.email.split('@')[0],
      })
    }

    success.value = `Account created: ${newAdmin.value.email}`
    newAdmin.value = { email: '', password: '', role: 'ADMIN' }
    await loadAdmins()
  } catch(e) {
    error.value = e.message || 'Failed to create account'
  } finally {
    creating.value = false
  }
}

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'

const updateRole = async (user, newRole) => {
  try {
    const session = await supabase.auth.getSession()
    const token = session?.data?.session?.access_token
    if (!token) { window.__toast?.show('Not authenticated', 'error'); return }
    
    const reason = prompt(`Reason for changing ${user.email}'s role to ${newRole}:`)
    if (reason === null) return // User cancelled
    
    const resp = await fetch(`${WORKER_URL}/api/admin/change-role`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, newRole, reason })
    })
    const data = await resp.json()
    
    if (data.success) {
      user.role = newRole
      window.__toast?.show(`Role updated to ${newRole}`, 'success')
    } else {
      window.__toast?.show(data.error || 'Failed to update role', 'error')
    }
  } catch(e) {
    console.error('Update role error:', e)
    window.__toast?.show('Failed to update role', 'error')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return
  try {
    await supabase.from('users').delete().eq('id', user.id)
    admins.value = admins.value.filter(a => a.id !== user.id)
    window.__toast?.show('User deleted', 'success')
  } catch(e) {
    console.error('Delete error:', e)
    window.__toast?.show('Failed to delete', 'error')
  }
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { margin: 0; }
.btn-primary { padding: 8px 16px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-secondary { padding: 8px 16px; background: #f0f0f0; color: #333; border: none; border-radius: 6px; cursor: pointer; }
.btn-danger { background: var(--error, #CC0C39); color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 4px; }
.loading { text-align: center; padding: 40px; color: #999; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.role-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.role-badge.super_admin { background: #ff4757; color: #fff; }
.role-badge.admin { background: var(--brand-primary, #FF9900); color: #fff; }
.role-badge.seller { background: #ffa502; color: #fff; }
.role-badge.member { background: #2ed573; color: #fff; }
.role-select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; margin-right: 4px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 800; }
.modal { background: #fff; padding: 24px; border-radius: 12px; width: 400px; max-width: 90vw; }
.modal h3 { margin: 0 0 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 4px; font-size: 13px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.error-msg { color: var(--error, #CC0C39); margin-top: 8px; font-size: 13px; }
.success-msg { color: var(--success, #067D62); margin-top: 8px; font-size: 13px; }

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
