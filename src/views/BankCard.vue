<template>
  <div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px">
    <div class="auth-card">
      <h2><i class="fas fa-university"></i> Bank Cards</h2>
      <p style="color:#64748b;margin-bottom:24px">Manage your bank cards for withdrawals.</p>
      <div v-if="cards.length" style="margin-bottom:24px">
        <div v-for="card in cards" :key="card.id" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:20px;border-radius:12px;margin-bottom:12px">
          <p style="font-size:12px;opacity:0.7">{{ card.bank_name }}</p>
          <p style="font-size:20px;font-weight:700;letter-spacing:2px;margin:8px 0">**** **** **** {{ card.last_four }}</p>
          <p style="font-size:14px">{{ card.holder_name }}</p>
        </div>
      </div>
      <form @submit.prevent="addCard">
        <div class="form-group"><label>Bank Name</label><input v-model="form.bank" class="form-input" placeholder="e.g. Chase, BCA" required></div>
        <div class="form-group"><label>Card Number</label><input v-model="form.number" class="form-input" placeholder="1234 5678 9012 3456" required></div>
        <div class="form-group"><label>Holder Name</label><input v-model="form.holder" class="form-input" placeholder="Name on card" required></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i><i class="fas fa-plus" v-else></i> {{ loading ? "Adding..." : "Add Card" }}</button>
      </form>
    </div>
  </div>
  </div>
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
const cards = ref([])
const loading = ref(false)
const form = ref({ bank: '', number: '', holder: '' })
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
      if (!error && data) cards.value = data
    }
  } catch (e) { console.warn('bank_cards table not available:', e.message) }
})
const addCard = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('bank_cards').insert({ user_id: user.id, bank_name: form.value.bank, last_four: form.value.number.slice(-4), holder_name: form.value.holder })
    if (error) throw error
    form.value = { bank: '', number: '', holder: '' }
    const { data } = await supabase.from('bank_cards').select('*').eq('user_id', user.id)
    if (data) cards.value = data
    window.__toast?.show('Card added!', 'success')
  } catch (e) { window.__toast?.show('Failed: ' + e.message, 'error') }
  loading.value = false
}
</template>

</script>
<style scoped>.auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; }</style>
