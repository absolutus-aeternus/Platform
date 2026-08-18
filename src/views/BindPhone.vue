<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div class="auth-card">
      <h2><i class="fas fa-phone"></i> Bind Phone Number</h2>
      <p style="color:#64748b;margin-bottom:24px">Add a phone number to your account for security and notifications.</p>
      <form @submit.prevent="bindPhone">
        <div class="form-group"><label>Phone Number</label><input v-model="phone" class="form-input" type="tel" placeholder="+1 234 567 8900" required></div>
        <div class="form-group"><label>Verification Code</label><div style="display:flex;gap:12px"><input v-model="code" class="form-input" placeholder="Enter code" required><button type="button" class="btn btn-secondary" @click="sendCode" :disabled="countdown > 0">{{ countdown > 0 ? countdown + 's' : 'Send Code' }}</button></div></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? "Binding..." : "Bind Phone" }}</button>
      </form>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter()
const phone = ref('')
const code = ref('')
const countdown = ref(0)
const msg = ref('')
const msgColor = ref('#059669')
try { const sendCode = () => { countdown.value = 60; const t = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(t) }, 1000) }
const bindPhone = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('users').update({ phone: phone.value }).eq('id', user.id)
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Phone bound successfully!'; msgColor.value = '#059669' }
  } catch (e) { console.error('Bind phone error:', e); msg.value = 'Failed to bind phone'; msgColor.value = '#dc2626' }
}
</script>
<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
