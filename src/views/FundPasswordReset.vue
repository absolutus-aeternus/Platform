<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <h2 style="margin-bottom:24px"><i class="fas fa-key" style="color:#FF9900"></i> Reset Fund Password</h2>
      <form @submit.prevent="resetPassword">
        <div style="margin-bottom:18px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Email</label><input v-model="email" type="email" class="form-input" placeholder="Your registered email" required></div>
        <div style="margin-bottom:18px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">New Fund Password</label><input v-model="newPw" type="password" class="form-input" placeholder="6-12 characters" required minlength="6" maxlength="12"></div>
        <div style="margin-bottom:18px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Confirm Password</label><input v-model="confirm" type="password" class="form-input" placeholder="Confirm password" required></div>
        <button type="submit" class="btn-primary" style="width:100%;justify-content:center;padding:14px" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? 'Resetting...' : 'Reset Password' }}</button>
      </form>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const email = ref(''); const newPw = ref(''); const confirm = ref(''); const loading = ref(false); const msg = ref(''); const msgColor = ref('#059669')
const resetPassword = async () => {
  if (newPw.value !== confirm.value) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: newPw.value })
  if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Fund password reset successfully!'; msgColor.value = '#059669' }
  loading.value = false
}
</script>
