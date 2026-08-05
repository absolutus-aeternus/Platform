<template>
  <div class="order-evaluation">
    <h1>Leave a Review</h1>
    <div class="eval-form">
      <div class="form-group">
        <label>Rating</label>
        <div class="stars">
          <span v-for="i in 5" :key="i" @click="rating = i" :class="{ active: i <= rating }">★</span>
        </div>
      </div>
      <div class="form-group">
        <label>Comment</label>
        <textarea v-model="comment" placeholder="Share your experience..."></textarea>
      </div>
      <button class="btn-submit" @click="submitReview" :disabled="!rating">Submit Review</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const rating = ref(0)
const comment = ref('')

const submitReview = async () => {
  if (!userStore.supabaseUser) return
  await supabase.from('evaluations').insert({
    order_id: route.query.order,
    user_id: userStore.supabaseUser.id,
    rating: rating.value,
    comment: comment.value
  })
  alert('Review submitted!')
  router.push('/user/orders')
}
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.eval-form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 500px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
.stars { font-size: 32px; cursor: pointer; }
.stars span { color: #ddd; }
.stars span.active { color: #ffc107; }
.form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; height: 100px; resize: vertical; box-sizing: border-box; }
.btn-submit { padding: 12px 30px; background: #fe2c55; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.btn-submit:disabled { background: #ccc; }
</style>
