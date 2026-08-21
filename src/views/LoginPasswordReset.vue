<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div class="auth-card">
      <h2><i class="fas fa-lock"></i> Login Password Reset</h2>
      <form @submit.prevent="resetPassword">
        <div class="form-group"><label>Current Password</label><input v-model="form.current" class="form-input" type="password" required></div>
        <div class="form-group"><label>New Password</label><input v-model="form.newPw" class="form-input" type="password" required minlength="6"></div>
        <div class="form-group"><label>Confirm Password</label><input v-model="form.confirm" class="form-input" type="password" required></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? "Resetting..." : "Reset Password" }}</button>
      </form>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ current: '', newPw: '', confirm: '' })
const msg = ref('')
const msgColor = ref('#059669')
const resetPassword = async () => {
  try {
    if (form.value.newPw !== form.value.confirm) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.auth.updateUser({ password: form.value.newPw })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Password updated!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Login password reset error:', e); msg.value = 'Failed to reset password'; msgColor.value = '#dc2626' }
}
</script>
<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
