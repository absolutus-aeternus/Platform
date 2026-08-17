<template>
  <div v-if="loading" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:#FF9900"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else class="sa-page">
    <div class="sa-header">
      <h1><i class="fas fa-users-cog"></i> User Management</h1>
      <button class="btn-primary" @click="showAdd = true"><i class="fas fa-plus"></i> Add User</button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input v-model="search" placeholder="Search email..." class="filter-input" @input="loadUsers">
      <select v-model="roleFilter" class="filter-select" @change="loadUsers">
        <option value="">All Roles</option>
        <option value="MEMBER">Member (Buyer)</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
        <option value="RATING_PLUS">Rating Plus</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="section-card">
      <div class="table-wrap">
        <table class="sa-table">
          <thead>
            <tr>
              <th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td><strong>{{ u.email }}</strong></td>
              <td>
                <select :value="u.role" @change="changeRole(u, $event.target.value)" class="role-select" :class="u.role?.toLowerCase()">
                  <option value="MEMBER">Member</option>
                  <option value="SELLER">Seller</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="RATING_PLUS">Rating Plus</option>
                </select>
              </td>
              <td>{{ formatDate(u.created_at) }}</td>
              <td><span class="status-badge active">Active</span></td>
              <td>
                <button class="btn-sm" @click="resetPassword(u)" title="Reset Password"><i class="fas fa-key"></i></button>
                <button class="btn-sm btn-danger" @click="deleteUser(u)" v-if="u.role !== 'SUPER_ADMIN'" title="Delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button @click="page > 1 && (page--, loadUsers())" :disabled="page <= 1">Prev</button>
        <span>Page {{ page }}</span>
        <button @click="page++, loadUsers()">Next</button>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
      <div class="modal">
        <h3>Add New User</h3>
        <form @submit.prevent="createUser">
          <div class="form-group"><label>Email</label><input v-model="newUser.email" type="email" required></div>
          <div class="form-group"><label>Password</label><input v-model="newUser.password" type="password" required minlength="6"></div>
          <div class="form-group"><label>Username</label><input v-model="newUser.username" type="text" placeholder="Display name"></div>
          <div class="form-group"><label>Role</label>
            <select v-model="newUser.role">
              <option value="MEMBER">Member (Buyer)</option>
              <option value="SELLER">Seller</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="RATING_PLUS">Rating Plus</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAdd = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Create User</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const users = ref([])
const search = ref('')
const roleFilter = ref('')
const page = ref(1)
const showAdd = ref(false)
const newUser = ref({ email: '', password: '', role: 'MEMBER', username: '' })

const loadUsers = async () => {
  try {
    let q = supabase.from('users').select('id,email,role,created_at').order('created_at', { ascending: false }).range((page.value - 1) * 20, page.value * 20 - 1)
    if (roleFilter.value) q = q.eq('role', roleFilter.value)
    if (search.value) q = q.ilike('email', '%' + search.value + '%')
    const { data } = await q
    users.value = data || []
  loading.value = false
  } catch (e) { console.error('Load users error:', e) }
}

const changeRole = async (u, newRole) => {
  if (!confirm('Change ' + u.email + ' to ' + newRole + '?')) { loadUsers(); return }
  await supabase.from('users').update({ role: newRole }).eq('id', u.id)
  u.role = newRole
}

const createUser = async () => {
  try {
    // Step1: Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.value.email,
      password: newUser.value.password,
      options: { data: { username: newUser.value.username || newUser.value.email.split('@')[0] } }
    })
    if (authError) { window.__toast?.show(authError.message, 'error'); return }

    // Step2: Update role & username
    const uid = authData.user?.id
    if (uid) {
      await supabase.from('users').update({
        role: newUser.value.role,
        username: newUser.value.username || newUser.value.email.split('@')[0]
      }).eq('id', uid)

      // Step3: Create wallet
      await supabase.from('wallets').insert({ user_id: uid, balance: 0, rebate: 0, frozen_money: 0 })
    }

    showAdd.value = false
    newUser.value = { email: '', password: '', role: 'MEMBER', username: '' }
    loadUsers()
    window.__toast?.show('User created successfully!', 'success')
  } catch (e) {
    console.error('Create user error:', e)
    window.__toast?.show('Failed to create user: ' + e.message, 'error')
  }
}

const deleteUser = async (u) => {
  if (!confirm('Permanently delete ' + u.email + '?')) return
  await supabase.from('users').delete().eq('id', u.id)
  loadUsers()
}

const resetPassword = async (u) => {
  const pw = prompt('New password for ' + u.email + ':')
  if (!pw || pw.length < 6) return
  await supabase.auth.admin.updateUserById(u.id, { password: pw })
  window.__toast?.show('Password updated!', 'success')
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-'
onMounted(loadUsers)
</script>

<style scoped>
.sa-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
.sa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.sa-header h1 { font-size: 24px; color: #1a1a2e; display: flex; align-items: center; gap: 10px; }
.filters { display: flex; gap: 12px; margin-bottom: 20px; }
.filter-input { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; width: 300px; }
.filter-select { padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; }
.section-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; }
.sa-table th { text-align: left; padding: 10px 12px; background: #f8f9fa; font-size: 12px; color: #666; text-transform: uppercase; }
.sa-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.role-select { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid #ddd; }
.role-select.member { background: #dfe6e9; color: #636e72; }
.role-select.seller { background: #dfe6e9; color: #0984e3; }
.role-select.rating_plus { background: #a29bfe; color: #6c5ce7; }
.role-select.admin { background: #ffeaa7; color: #d35400; }
.role-select.super_admin { background: #fdcb6e; color: #e17055; }
.status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.status-badge.active { background: #d4edda; color: #155724; }
.btn-primary { padding: 10px 20px; background: #6c5ce7; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #5a4bd1; }
.btn-secondary { padding: 10px 20px; background: #f0f0f0; color: #444; border: none; border-radius: 8px; cursor: pointer; }
.btn-sm { padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; background: #f0f0f0; color: #444; margin-right: 4px; }
.btn-sm:hover { background: #6c5ce7; color: #fff; }
.btn-danger { background: #ff7675; color: #fff; }
.btn-danger:hover { background: #d63031; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pagination button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 16px; padding: 32px; width: 440px; max-width: 90vw; }
.modal h3 { margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

@media (max-width: 768px) {
  .sa-page { padding: 16px; }
  .sa-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .sa-header h1 { font-size: 20px; }
  .filters { flex-direction: column; }
  .filter-input { width: 100%; }
  .filter-select { width: 100%; }
  .section-card { padding: 16px; }
  .sa-table { min-width: 600px; }
  .role-select { font-size: 11px; padding: 3px 6px; }
  .btn-sm { padding: 5px 8px; font-size: 11px; }
  .modal { padding: 24px; }
}
@media (max-width: 480px) {
  .sa-page { padding: 12px; }
  .sa-header h1 { font-size: 18px; }
  .pagination { flex-wrap: wrap; gap: 8px; }
  .pagination button { padding: 6px 12px; font-size: 12px; }
}
</style>