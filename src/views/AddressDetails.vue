<template><div class="page-wrapper">
  <div class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-map-marker-alt"></i> {{ isEdit ? 'Edit' : 'Add' }} Address</h2>
    <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <form @submit.prevent="saveAddress">
        <div class="form-group"><label>Contact Name</label><input v-model="form.contacts" class="form-input" required></div>
        <div class="form-group"><label>Phone</label><input v-model="form.phone" class="form-input" required></div>
        <div class="form-group"><label>Email</label><input v-model="form.email" class="form-input" type="email"></div>
        <div class="form-group"><label>Country</label><input v-model="form.country" class="form-input" required></div>
        <div class="form-group"><label>Province/State</label><input v-model="form.province" class="form-input" required></div>
        <div class="form-group"><label>City</label><input v-model="form.city" class="form-input" required></div>
        <div class="form-group"><label>Address</label><textarea v-model="form.address" class="form-input" rows="3" required></textarea></div>
        <div class="form-group"><label>Postcode</label><input v-model="form.postcode" class="form-input" required></div>
        <div class="form-group"><label><input type="checkbox" v-model="form.is_default"> Set as default address</label></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i> {{ loading ? "Saving..." : "Save Address" }}</button>
      </form>
    </div>
  </div>
  </div>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const loading = ref(false)
const form = ref({ contacts: '', phone: '', email: '', country: '', province: '', city: '', address: '', postcode: '', is_default: false })
onMounted(async () => {
  try {
    if (route.query.id) {
      isEdit.value = true
      const { data } = await supabase.from('addresses').select('*').eq('id', route.query.id).single()
      if (data) form.value = data
    }
  } catch (e) { console.error('Load address error:', e) }
})
const saveAddress = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    if (isEdit.value) {
      await supabase.from('addresses').update(form.value).eq('id', route.query.id)
    } else {
      await supabase.from('addresses').insert({ ...form.value, user_id: user.id })
    }
    router.push('/user/addresses')
  } catch (e) { console.error('Save address error:', e); window.__toast?.show('Failed to save address', 'error') }
}</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const loading = ref(false)
const form = ref({ contacts: '', phone: '', email: '', country: '', province: '', city: '', address: '', postcode: '', is_default: false })
onMounted(async () => {
  try {
    if (route.query.id) {
      isEdit.value = true
      const { data } = await supabase.from('addresses').select('*').eq('id', route.query.id).single()
      if (data) form.value = data
    }
  } catch (e) { console.error('Load address error:', e) }
})
const saveAddress = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    if (isEdit.value) {
      await supabase.from('addresses').update(form.value).eq('id', route.query.id)
    } else {
      await supabase.from('addresses').insert({ ...form.value, user_id: user.id })
    }
    router.push('/user/addresses')
  } catch (e) { console.error('Save address error:', e); window.__toast?.show('Failed to save address', 'error') }
}
</template>

</script>

<style scoped>.form-group { margin-bottom: 16px; } .form-group label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: var(--brand-primary, #FF9900); outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }
input, select, textarea { background: #ffffff; color: #1a1a1a; border: 1px solid #ddd; }
</style>
