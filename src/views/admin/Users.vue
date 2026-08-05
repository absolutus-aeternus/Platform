<template>
  <div class="admin-users">
    <h1>Users</h1>
    <div class="filters">
      <input v-model="search" placeholder="Search users...">
      <select v-model="roleFilter">
        <option value="">All Roles</option>
        <option value="MEMBER">Member</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
    <table>
      <thead>
        <tr><th>User</th><th>Email</th><th>Role</th><th>KYC</th><th>Joined</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td><div class="user-cell"><div class="avatar">{{ user.email[0].toUpperCase() }}</div>{{ user.username || user.email }}</div></td>
          <td>{{ user.email }}</td>
          <td><span class="role-badge" :class="user.role?.toLowerCase()">{{ user.role }}</span></td>
          <td>{{ user.kyc_status || 0 }}</td>
          <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
          <td><button class="btn-sm">View</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const users = ref([])
const search = ref('')
const roleFilter = ref('')
onMounted(async () => {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50)
  users.value = data || []
})
</script>

<style scoped>
h1 { margin-bottom: 20px; }
.filters { display: flex; gap: 10px; margin-bottom: 20px; }
.filters input, .filters select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.filters input { flex: 1; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
th { background: #f8f8f8; font-weight: 600; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 30px; height: 30px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.role-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.role-badge.member { background: #d1ecf1; color: #0c5460; }
.role-badge.seller { background: #fff3cd; color: #856404; }
.role-badge.admin { background: #d4edda; color: #155724; }
.btn-sm { padding: 4px 10px; border: 1px solid #ddd; background: #fff; border-radius: 3px; cursor: pointer; font-size: 12px; }
</style>
