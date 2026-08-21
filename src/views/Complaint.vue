<template>
  <div class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-exclamation-triangle"></i> Submit Complaint</h2>
    <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <form @submit.prevent="submitComplaint">
        <div class="form-group"><label>Order ID (Optional)</label><input v-model="form.orderId" class="form-input" placeholder="Related order ID"></div>
        <div class="form-group"><label>Subject</label><input v-model="form.subject" class="form-input" placeholder="Complaint subject" required></div>
        <div class="form-group"><label>Category</label><select v-model="form.category" class="form-input" required><option value="">Select category</option><option>Product Quality</option><option>Shipping Issue</option><option>Seller Behavior</option><option>Payment Issue</option><option>Other</option></select></div>
        <div class="form-group"><label>Description</label><textarea v-model="form.description" class="form-input" rows="5" placeholder="Describe your complaint in detail..." required></textarea></div>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" :disabled="loading"><i class="fas fa-spinner fa-spin" v-if="loading"></i><i class="fas fa-paper-plane" v-else></i> {{ loading ? "Submitting..." : "Submit Complaint" }}</button>
      </form>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
const loading = ref(false)
const form = ref({ orderId: '', subject: '', category: '', description: '' })
const msg = ref('')
const msgColor = ref('#059669')
const submitComplaint = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { msg.value = 'Please login first'; msgColor.value = '#dc2626'; return }
    const { error } = await supabase.from('complaints').insert({ user_id: user.id, order_id: form.value.orderId || null, subject: form.value.subject, category: form.value.category, description: form.value.description })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Complaint submitted! We will review it shortly.'; msgColor.value = '#059669'; form.value = { orderId: '', subject: '', category: '', description: '' } }
  } catch (e) { console.error('Complaint error:', e); msg.value = 'Failed to submit complaint'; msgColor.value = '#dc2626' }
}
</script>
<style scoped>.form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }</style>
