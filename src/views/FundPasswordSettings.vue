<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div class="auth-card">
      <h2><i class="fas fa-key"></i> Fund Password Settings</h2>
      <p style="color:#64748b;margin-bottom:24px">Set or change your fund (transaction) password. This is required for withdrawals and payments.</p>
      <form @submit.prevent="savePassword">
        <div class="form-group"><label>Current Fund Password</label><input v-model="form.current" class="form-input" type="password" placeholder="Enter current password" :required="hasExisting"></div>
        <div class="form-group"><label>New Fund Password</label><input v-model="form.newPw" class="form-input" type="password" placeholder="6-12 characters" required minlength="6" maxlength="12"></div>
        <div class="form-group"><label>Confirm Password</label><input v-model="form.confirm" class="form-input" type="password" placeholder="Confirm new password" required></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? "Saving..." : "Save Password" }}</button>
      </form>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const hasExisting = ref(false)
const loading = ref(false)
const form = ref({ current: '', newPw: '', confirm: '' })
const msg = ref('')
const msgColor = ref('#059669')
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) { const { data } = await supabase.from('users').select('safeword').eq('id', user.id).single(); hasExisting.value = !!data?.safeword }
})
const savePassword = async () => {
  if (form.value.newPw !== form.value.confirm) { msg.value = 'Passwords do not match'; msgColor.value = '#dc2626'; return }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('users').update({ safeword: 1 }).eq('id', user.id)
  if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Fund password saved!'; msgColor.value = '#059669' }
}
</script>
<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #FF9900; outline: none; }</style>
