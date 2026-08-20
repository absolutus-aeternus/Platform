<template>
  <div class="page-wrapper">
  <div class="rplus-users">
    <div class="page-header">
      <h1>⭐ Rating Plus — User Management</h1>
      <p>Manage Rating Plus members, approvals, and status.</p>
    </div>

    <div class="rplus-stats-row">
      <div class="rplus-stat"><strong>{{ stats.total }}</strong><small>Total Users</small></div>
      <div class="rplus-stat approved"><strong>{{ stats.approved }}</strong><small>Approved</small></div>
      <div class="rplus-stat pending"><strong>{{ stats.pending }}</strong><small>Pending</small></div>
      <div class="rplus-stat rejected"><strong>{{ stats.rejected }}</strong><small>Rejected</small></div>
    </div>

    <div class="filters-bar">
      <input v-model="search" type="text" placeholder="Search by name or email..." class="filter-input">
      <select v-model="statusFilter" class="filter-select">
        <option value="">All Status</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
        <option value="frozen">Frozen</option>
      </select>
      <button class="btn-refresh" @click="loadUsers"><i class="fas fa-sync-alt"></i> Refresh</button>
    </div>

    <div class="table-card">
      <div v-if="loading" class="loading-state">Loading users...</div>
      <div v-else-if="filteredUsers.length === 0" class="empty-state">No users found</div>
      <table v-else>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td><strong>{{ user.full_name || '-' }}</strong></td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td><span class="status-badge" :class="user.status">{{ user.status }}</span></td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions-cell">
              <button v-if="user.status === 'pending'" class="btn-approve" @click="updateStatus(user, 'approved')"><i class="fas fa-check"></i></button>
              <button v-if="user.status === 'pending'" class="btn-reject" @click="updateStatus(user, 'rejected')"><i class="fas fa-times"></i></button>
              <button v-if="user.status === 'approved'" class="btn-freeze" @click="updateStatus(user, 'frozen')"><i class="fas fa-snowflake"></i></button>
              <button v-if="user.status === 'frozen'" class="btn-approve" @click="updateStatus(user, 'approved')"><i class="fas fa-unlock"></i></button>
              <button class="btn-delete" @click="removeUser(user)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchRplusUsers, updateRplusUser, deleteRplusUser } from '@/services/rplus'

const users = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')

const stats = computed(() => ({
  total: users.value.length,
  approved: users.value.filter(u => u.status === 'approved').length,
  pending: users.value.filter(u => u.status === 'pending').length,
  rejected: users.value.filter(u => u.status === 'rejected').length,
}))

const filteredUsers = computed(() => {
  let result = users.value
  if (statusFilter.value) result = result.filter(u => u.status === statusFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
  }
  return result
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'

const loadUsers = async () => {
  loading.value = true
  try { users.value = await fetchRplusUsers() } catch (e) { console.error('R+ load error:', e) }
  finally { loading.value = false }
}

const updateStatus = async (user, newStatus) => {
  try { await updateRplusUser(user.id, { status: newStatus }); user.status = newStatus } catch (e) { window.__toast?.show('Operation failed', 'error') }
}

const removeUser = async (user) => {
  if (!confirm(`Delete ${user.email}?`)) return
  try { await deleteRplusUser(user.id); users.value = users.value.filter(u => u.id !== user.id) } catch (e) { window.__toast?.show('Operation failed', 'error') }
}

onMounted(loadUsers)
</script>

<style scoped>
body, html { overflow-x: hidden; }
header { z-index: 2; }
.rplus-users { max-width: 1200px; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 22px; margin-bottom: 4px; }
.page-header p { color: #666; font-size: 14px; }
.rplus-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.rplus-stat { background: #fff; padding: 16px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #ddd; }
.rplus-stat.approved { border-left-color: #00e68a; }
.rplus-stat.pending { border-left-color: var(--warning, #B45309); }
.rplus-stat.rejected { border-left-color: #ff3b5c; }
.rplus-stat strong { display: block; font-size: 24px; font-weight: 800; }
.rplus-stat small { font-size: 12px; color: #999; }
.filters-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.filter-input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.filter-select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff; }
.btn-refresh { padding: 10px 16px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
.table-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.loading-state, .empty-state { padding: 40px; text-align: center; color: #999; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f9fa; font-weight: 600; color: #555; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
.status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.status-badge.approved { background: #d4edda; color: #155724; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.status-badge.frozen { background: #d1ecf1; color: #0c5460; }
.actions-cell { display: flex; gap: 6px; }
.actions-cell button { width: 30px; height: 30px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s; }
.btn-approve { background: #d4edda; color: #155724; }
.btn-reject { background: #f8d7da; color: #721c24; }
.btn-freeze { background: #d1ecf1; color: #0c5460; }
.btn-delete { background: #fff; color: var(--error, #CC0C39); border: 1px solid var(--error, #CC0C39) !important; }
@media (max-width: 768px) { .rplus-stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>
