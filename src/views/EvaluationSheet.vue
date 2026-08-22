<template>
  <div v-if="loading" style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--brand-primary, #FF9900)"></i><p style="margin-top:12px;color:#999">Loading...</p></div>
<div v-else-if="!route.query.order" class="empty-state" style="padding:40px 20px"><i class="fas fa-edit"></i><p>No order selected for review. Please select an order first.</p><router-link to="/user/orders" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px"><i class="fas fa-arrow-left"></i> Go to Orders</router-link></div>
<div v-else class="container" style="padding:40px 20px;max-width:600px">
    <h2 style="margin-bottom:24px"><i class="fas fa-edit"></i> Write Review</h2>
    <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0">
      <div class="form-group"><label>Rating</label><div style="display:flex;gap:8px"><i v-for="n in 5" :key="n" class="fas fa-star" :style="{ color: n <= rating ? '#f59e0b' : '#e2e8f0', cursor: 'pointer', fontSize: '24px' }" @click="rating = n"></i></div></div>
      <div class="form-group"><label>Comment</label><textarea v-model="comment" class="form-input" rows="4" placeholder="Share your experience..."></textarea></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center" @click="submitReview"><i class="fas fa-paper-plane"></i> Submit Review</button>
      <p v-if="msg" :style="{ color: msgColor, textAlign: 'center', marginTop: '16px' }">{{ msg }}</p>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
const loading = ref(true)
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
const route = useRoute()
const router = useRouter()
const rating = ref(5)
const comment = ref('')
const msg = ref('')
const msgColor = ref('#059669')
const submitReview = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('evaluations').insert({ user_id: user.id, product_id: route.query.product, order_id: route.query.order, rating: rating.value, comment: comment.value })
    if (error) { msg.value = error.message; msgColor.value = '#dc2626' } else { msg.value = 'Review submitted!'; msgColor.value = '#059669' }
  loading.value = false
  } catch (e) { console.error('Evaluation error:', e); msg.value = 'Failed to submit review'; msgColor.value = '#dc2626' }
}
</script>
<style scoped>.empty-state { text-align: center; padding: 60px 16px; color: var(--text-muted, #999); } .empty-state i { font-size: 48px; color: var(--neutral-300, #ddd); margin-bottom: 16px; display: block; } .empty-state p { margin-bottom: 16px; font-size: 15px; } .form-group { margin-bottom: 20px; } .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 14px; } .form-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 15px; } .form-input:focus { border-color: #ff6b35; outline: none; } textarea.form-input { resize: vertical; font-family: inherit; }</style>
