<template>
  <div class="page-wrapper">
  <div class="order-evaluation">
    <div class="page-header"><h1>Write Review</h1></div>
    <div class="eval-container">
      <div class="eval-form">
        <div class="section">
          <h2>Rate Your Experience</h2>
          <div class="rating-section">
            <div class="star-rating">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: rating >= i }" @click="rating = i">★</span>
            </div>
            <p class="rating-text">{{ ratingText }}</p>
          </div>
        </div>
        <div class="section">
          <h2>Your Review</h2>
          <div class="form-group"><label>Review Title</label><input v-model="title" placeholder="Summarize your experience"></div>
          <div class="form-group"><label>Detailed Review *</label><textarea v-model="comment" placeholder="Tell others about your experience with this product..." rows="6" required></textarea></div>
          <div class="form-group"><label>Photos (optional)</label>
            <div class="photo-grid">
              <div class="photo-upload"><i class="fas fa-plus"></i><p>Add Photo</p></div>
            </div>
          </div>
        </div>
        <div class="section">
          <h2>Ratings</h2>
          <div class="sub-ratings">
            <div class="sub-rating"><span>Product Quality</span><div class="mini-stars"><span v-for="i in 5" :key="'q'+i" class="mini-star" :class="{ active: quality >= i }" @click="quality = i">★</span></div></div>
            <div class="sub-rating"><span>Shipping Speed</span><div class="mini-stars"><span v-for="i in 5" :key="'s'+i" class="mini-star" :class="{ active: shipping >= i }" @click="shipping = i">★</span></div></div>
            <div class="sub-rating"><span>Packaging</span><div class="mini-stars"><span v-for="i in 5" :key="'p'+i" class="mini-star" :class="{ active: packaging >= i }" @click="packaging = i">★</span></div></div>
          </div>
        </div>
        <button class="btn-submit" @click="submitReview" :disabled="!rating || !comment">Submit Review</button>
      </div>
    </div>
  </div>
  </div>

</template>
</template>


<script setup>
import { ref, computed } from 'vue'
const loading = ref(true)
import { useRoute, useRouter } from 'vue-router'
import { supabase, createReview as createEvaluation } from '@/services/supabase'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orderId = route.query.order || ''
const productId = route.query.product || ''

const rating = ref(0)
const title = ref('')
const comment = ref('')
const quality = ref(0)
const shipping = ref(0)
const packaging = ref(0)

const ratingText = computed(() => ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating.value] || 'Click to rate')

const submitReview = async () => {
  try {
    if (!userStore.supabaseUser) return window.__toast?.show('Please login')
    await createEvaluation({
      order_id: orderId || null,
      user_id: userStore.supabaseUser.id,
      product_id: productId || null,
      rating: rating.value,
      comment: `${title.value ? title.value + ': ' : ''}${comment.value}`
    })
    window.__toast?.show('Review submitted! Thank you.')
    router.push('/user/orders')
  loading.value = false
  } catch (e) { console.error('Order evaluation error:', e); window.__toast?.show('Failed to submit review', 'error') }
}


</script>

<style scoped>
header { z-index: 2; }
.page-header { margin-bottom: 25px; }
.page-header h1 { margin: 0; }
.eval-container { max-width: 700px; }
.section { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 20px; }
.section h2 { margin: 0 0 18px; font-size: 16px; color: #333; }
.rating-section { text-align: center; padding: 20px 0; }
.star-rating { display: flex; justify-content: center; gap: 8px; margin-bottom: 10px; }
.star { font-size: 40px; color: #ddd; cursor: pointer; transition: all 0.2s; }
.star.active { color: var(--warning, #B45309); }
.star:hover { color: var(--warning, #B45309); transform: scale(1.1); }
.rating-text { font-size: 16px; color: #666; font-weight: 500; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #555; }
.form-group input, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; box-sizing: border-box; font-size: 14px; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.form-group textarea { resize: vertical; }
.photo-grid { display: flex; gap: 10px; }
.photo-upload { width: 80px; height: 80px; border: 2px dashed #ddd; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.photo-upload:hover { border-color: var(--brand-primary, #FF9900); background: #fff8f0; }
.photo-upload i { font-size: 18px; color: #ddd; }
.photo-upload p { font-size: 10px; color: #999; margin: 4px 0 0; }
.sub-ratings { display: flex; flex-direction: column; gap: 15px; }
.sub-rating { display: flex; justify-content: space-between; align-items: center; }
.sub-rating span { font-size: 14px; color: #555; }
.mini-stars { display: flex; gap: 4px; }
.mini-star { font-size: 20px; color: #ddd; cursor: pointer; }
.mini-star.active { color: var(--warning, #B45309); }
.btn-submit { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; }
.btn-submit:disabled { background: #ccc; }

@media (max-width: 768px) { .container { padding: 0 12px; } h1 { font-size: 1.25rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } .form-group input, .form-group select { font-size: 16px; } .modal { width: 95vw; } table { font-size: 12px; } th, td { padding: 8px 10px; } .filters { flex-direction: column; } }
@media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } h1 { font-size: 1.1rem; } .btn { width: 100%; } }
</style>
