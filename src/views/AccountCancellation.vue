<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <h2 style="margin-bottom:16px"><i class="fas fa-user-times" style="color:var(--error, #CC0C39)"></i> Account Cancellation</h2>
      <p style="color:#64748b;margin-bottom:24px">Warning: This action is irreversible. All your data, orders, and wallet balance will be permanently deleted.</p>
      <div style="background:#f8d7da;padding:16px;border-radius:8px;margin-bottom:24px">
        <p style="color:#721c24;font-size:14px"><i class="fas fa-exclamation-triangle"></i> Please ensure you have withdrawn all funds and completed all pending orders before proceeding.</p>
      </div>
      <form @submit.prevent="cancelAccount">
        <div style="margin-bottom:18px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" v-model="confirm" required> <span>I understand this action cannot be undone</span></label></div>
        <button type="submit" class="btn-primary" style="width:100%;justify-content:center;padding:14px;background:linear-gradient(135deg,var(--error, #CC0C39),#ff6b81)" :disabled="!confirm || loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? 'Processing...' : 'Delete My Account' }}</button>
      </form>
      <p v-if="msg" style="color:var(--error, #CC0C39);text-align:center;margin-top:16px">{{ msg }}</p>
    </div>
  </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const router = useRouter(); const confirm = ref(false); const loading = ref(false); const msg = ref('')
const cancelAccount = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { await supabase.from('users').update({ role: 'CANCELLED' }).eq('id', user.id); await supabase.auth.signOut() }
    msg.value = 'Account has been scheduled for deletion.'
    setTimeout(() => router.push('/'), 3000)
  } catch (e) { console.error('Cancel account error:', e); msg.value = 'Failed to cancel account' }
  loading.value = false
}
</script>


<style scoped>
.page-wrapper { position: relative; z-index: 1; }
.page-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
</style>


@media (max-width: 768px) {
  .page-wrapper, .about-container, .help-container, .terms-container, .policy-container {
    padding: 1rem !important;
    max-width: 100% !important;
  }
}