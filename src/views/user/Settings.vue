<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="settings-form">
      <div class="form-group">
        <label>Email</label>
        <input type="email" :value="userStore.supabaseUser?.email" disabled>
      </div>
      <div class="form-group">
        <label>Display Name</label>
        <input v-model="displayName" type="text" placeholder="Your display name">
      </div>
      <div class="form-group">
        <label>Change Password</label>
        <input v-model="newPassword" type="password" placeholder="New password (min 6 chars)">
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input v-model="confirmPassword" type="password" placeholder="Confirm new password">
      </div>
      
      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="success" class="success-msg">{{ success }}</div>
      
      <button class="btn-save" @click="saveSettings" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
      
      <div class="danger-zone">
        <h3>Danger Zone</h3>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const router = useRouter()
const userStore = useUserStore()
const displayName = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const error = ref('')
const success = ref('')

const saveSettings = async () => {
  error.value = ''
  success.value = ''
  
  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (newPassword.value && newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  saving.value = true
  try {
    if (newPassword.value) {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword.value })
      if (pwError) throw pwError
    }
    success.value = 'Settings saved successfully!'
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = e.message || 'Failed to save settings'
  }
  saving.value = false
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.settings-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.form-group input { width: 100%; padding: 10px 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group input:disabled { background: #f5f5f5; color: #999; }
.error-msg { color: #ff4757; margin-bottom: 15px; font-size: 14px; }
.success-msg { color: #2ed573; margin-bottom: 15px; font-size: 14px; }
.btn-save { padding: 12px 30px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.btn-save:disabled { background: #ccc; cursor: not-allowed; }
.danger-zone { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
.danger-zone h3 { color: #ff4757; margin-bottom: 15px; }
.btn-logout { padding: 10px 25px; background: none; color: #ff4757; border: 1px solid #ff4757; border-radius: 4px; cursor: pointer; }

/* Responsive */
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 0.75rem; }
  .page-header h1 { font-size: 1.25rem; }
  table { font-size: 12px; }
  th, td { padding: 8px 10px; }
  .card { padding: 1rem; }
  .form-group input { font-size: 16px; }
}

</style>
