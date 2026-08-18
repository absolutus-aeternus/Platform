<template>
  <div class="product-detail">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> <i class="fas fa-chevron-right"></i>
        <router-link to="/commodity">Products</router-link> <i class="fas fa-chevron-right"></i>
        <span>{{ product?.name || 'Loading...' }}</span>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
      </div>

      <div v-else-if="!product" class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Product not found</p>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>

      <template v-else>
        <!-- Product Main -->
        <div class="product-main">
          <!-- Image Gallery -->
          <div class="product-gallery">
            <div class="main-image">
              <img loading="lazy" v-if="product.images?.length" :src="product.images[selectedImage || 0]" :alt="product.name">
              <div v-else class="img-placeholder">{{ product.name?.[0] || 'P' }}</div>
              <span v-if="product.discount" class="discount-badge">-{{ product.discount }}%</span>
            </div>
            <div class="thumb-row" v-if="product.images?.length > 1">
              <img loading="lazy" v-for="(img, i) in product.images.slice(0, 5)" :key="i" :src="img" class="thumb" :class="{ active: selectedImage === i }" @click="selectedImage = i" :alt="product.name + ' image ' + (i+1)">
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>

            <div class="product-stats">
              <div class="stat-rating">
                <span class="stars"><i v-for="i in 5" :key="i" :class="i <= Math.round(product.rating || 0) ? 'fas fa-star' : 'far fa-star'"></i></span>
                <span class="rating-num">{{ product.rating || '0' }}</span>
                <span class="divider-v"></span>
                <span class="review-count">{{ product.review_count || 0 }} Reviews</span>
              </div>
              <div class="stat-sales">{{ product.sales_count || 0 }} Sold</div>
            </div>

            <div class="price-box">
              <div class="current-price">${{ product.price }}</div>
              <div v-if="product.original_price" class="original-price">${{ product.original_price }}</div>
              <span v-if="product.discount" class="discount-tag">-{{ product.discount }}%</span>
            </div>

            <div class="info-rows">
              <div class="info-row">
                <span class="label">Shipping</span>
                <span class="value">Free shipping · 2-7 business days</span>
              </div>
              <div class="info-row">
                <span class="label">Stock</span>
                <span class="value" :class="product.stock > 0 ? 'in-stock' : 'out-stock'">
                  {{ product.stock > 0 ? product.stock + ' available' : 'Out of stock' }}
                </span>
              </div>
              <div class="info-row" v-if="product.sellers">
                <span class="label">Seller</span>
                <span class="value seller-link" @click="$router.push(`/store/${product.seller_id}`)">
                  <img loading="lazy" v-if="product.sellers?.logo" :src="product.sellers.logo" class="seller-mini-logo" alt="AllianceHub" />
                  {{ product.sellers?.name || product.sellers?.store_name || 'View Store' }} <VerifiedBadge size="sm" :show-label="false" /> <i class="fas fa-chevron-right"></i>
                </span>
              </div>
            </div>

            <!-- Quantity -->
            <div class="quantity-section">
              <span class="label">Quantity</span>
              <div class="qty-control">
                <button @click="quantity > 1 && quantity--" :disabled="quantity <= 1">−</button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock || 99">
                <button @click="quantity++" :disabled="quantity >= (product.stock || 99)">+</button>
              </div>
            </div>

            <!-- Actions -->
            <div class="action-row">
              <button class="btn-add-cart" @click="addToCart" :disabled="adding || product.stock <= 0" aria-label="Add to cart">
                <i class="fas fa-shopping-cart"></i> {{ adding ? 'Adding...' : 'Add to Cart' }}
              </button>
              <button class="btn-buy-now" @click="buyNow" :disabled="product.stock <= 0" aria-label="Buy now">
                Buy Now
              </button>
              <button class="btn-fav" @click="toggleFav" aria-label="Toggle favorite">
                <i :class="isFav ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
            </div>
            <!-- Bug #2: Chat Seller button -->
            <button class="btn-chat-seller" @click="chatSeller" v-if="product.seller_id">
              <i class="fas fa-comments"></i> Chat with Seller
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="product-tabs">
          <button :class="{ active: tab === 'detail' }" @click="tab = 'detail'">Product Details</button>
          <button :class="{ active: tab === 'reviews' }" @click="tab = 'reviews'">Reviews ({{ reviews.length }})</button>
          <button :class="{ active: tab === 'comments' }" @click="tab = 'comments'">Comments ({{ comments.length }})</button>
        </div>

        <div class="tab-content">
          <div v-if="tab === 'detail'" class="detail-content">
            <h3>Description</h3>
            <p style="line-height:1.8;color:#555">{{ product.description || 'No description available.' }}</p>
            
            <!-- Specifications -->
            <div v-if="product.specs && Object.keys(product.specs).length > 0" style="margin-top:24px">
              <h3 style="margin-bottom:16px;font-size:18px">Specifications</h3>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr v-for="(val, key) in product.specs" :key="key" style="border-bottom:1px solid #f0f0f0">
                  <td style="padding:12px 16px;color:#999;width:40%;background:#fafafa;font-weight:500">{{ key }}</td>
                  <td style="padding:12px 16px;color:#333">{{ val }}</td>
                </tr>
              </table>
            </div>
            
            <!-- Key Features -->
            <div style="margin-top:24px">
              <h3 style="margin-bottom:16px;font-size:18px">Key Features</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-truck" style="color:#FF9900;font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Free Shipping</div><div style="font-size:11px;color:#999">2-7 business days</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-shield-alt" style="color:#FF9900;font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Buyer Protection</div><div style="font-size:11px;color:#999">Full refund if not as described</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-undo" style="color:#FF9900;font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Easy Returns</div><div style="font-size:11px;color:#999">30-day return policy</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-headset" style="color:#FF9900;font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">24/7 Support</div><div style="font-size:11px;color:#999">Online customer service</div></div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="tab === 'reviews'" class="reviews-content">
            <div v-if="reviews.length === 0" class="empty-reviews">
              <i class="fas fa-comment-slash"></i>
              <p>No reviews yet. Be the first to review!</p>
            </div>
            <div v-for="r in reviews" :key="r.id" class="review-item">
              <div class="review-header">
                <div class="review-avatar">{{ (r.users?.username || r.users?.email || 'U')[0].toUpperCase() }}</div>
                <div class="review-meta">
                  <span class="review-user">{{ r.users?.username || r.users?.email || 'User' }}</span>
                  <span class="review-stars"><i v-for="i in 5" :key="i" :class="i <= r.rating ? 'fas fa-star' : 'far fa-star'"></i></span>
                </div>
                <span class="review-date">{{ new Date(r.created_at).toLocaleDateString() }}</span>
              </div>
              <p class="review-text">{{ r.comment }}</p>
            </div>
          </div>

          <!-- Comments Tab -->
          <div v-if="tab === 'comments'" class="comments-content">
            <!-- Comment Input -->
            <div class="comment-form">
              <div class="comment-input-row">
                <div class="comment-avatar">{{ userStore.username?.[0]?.toUpperCase() || 'G' }}</div>
                <div class="comment-input-wrap">
                  <textarea v-model="newComment" placeholder="Write a comment..." rows="2" maxlength="500"></textarea>
                  <div class="comment-form-actions">
                    <span class="char-count">{{ newComment.length }}/500</span>
                    <button class="btn-post-comment" @click="postComment" :disabled="!newComment.trim() || postingComment">
                      <i class="fas fa-paper-plane"></i> {{ postingComment ? 'Posting...' : 'Post' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comments List -->
            <div v-if="comments.length === 0" class="empty-comments">
              <i class="fas fa-comments"></i>
              <p>No comments yet. Start the conversation!</p>
            </div>
            <div v-for="c in comments" :key="c.id" class="comment-item">
              <div class="comment-avatar">{{ (c.username || 'U')[0].toUpperCase() }}</div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-user">{{ c.username || 'Anonymous' }}</span>
                  <span class="comment-date">{{ formatCommentDate(c.created_at) }}</span>
                </div>
                <p class="comment-text">{{ c.text }}</p>
                <div class="comment-actions">
                  <button class="comment-like" @click="likeComment(c)" :class="{ liked: c.liked }">
                    <i :class="c.liked ? 'fas fa-heart' : 'far fa-heart'"></i> {{ c.likes || 0 }}
                  </button>
                  <button class="comment-reply" @click="replyTo = c.id">
                    <i class="fas fa-reply"></i> Reply
                  </button>
                </div>
                <!-- Replies -->
                <div v-if="c.replies?.length" class="comment-replies">
                  <div v-for="r in c.replies" :key="r.id" class="reply-item">
                    <div class="reply-avatar">{{ (r.username || 'U')[0].toUpperCase() }}</div>
                    <div class="reply-body">
                      <span class="reply-user">{{ r.username || 'Anonymous' }}</span>
                      <span class="reply-text">{{ r.text }}</span>
                      <span class="reply-date">{{ formatCommentDate(r.created_at) }}</span>
                    </div>
                  </div>
                </div>
                <!-- Reply Input -->
                <div v-if="replyTo === c.id" class="reply-form">
                  <input v-model="replyText" placeholder="Write a reply..." maxlength="300" @keyup.enter="postReply(c)" />
                  <button class="btn-reply" @click="postReply(c)" :disabled="!replyText.trim()">Reply</button>
                  <button class="btn-cancel" @click="replyTo = null">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Mobile Sticky CTA Bar -->
    <StickyCTA
      :visible="!!product && product.stock > 0"
      :price="product?.price"
      :original-price="product?.original_price"
      @add-to-cart="addToCart"
      @buy-now="buyNow"
      @chat="chatSeller"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase, fetchProductById, fetchReviews } from '@/services/supabase'
import StickyCTA from '@/components/layout/StickyCTA.vue'
import VerifiedBadge from '@/components/trust/VerifiedBadge.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tab = ref('detail')
const selectedImage = ref(0)
const quantity = ref(1)
const product = ref(null)
const reviews = ref([])
const comments = ref([])
const loading = ref(true)
const adding = ref(false)
const isFav = ref(false)
const newComment = ref('')
const postingComment = ref(false)
const replyTo = ref(null)
const replyText = ref('')

onMounted(async () => {
  try {
    const { data } = await fetchProductById(route.params.id)
    product.value = data || null
    if (data) {
      const { data: revData } = await fetchReviews(route.params.id)
      reviews.value = revData || []
      // Load comments
      try {
        const { data: cData } = await supabase.from('product_comments').select('*').eq('product_id', route.params.id).order('created_at', { ascending: false }).limit(100)
        comments.value = cData || []
      } catch (e) { console.warn('Comments load error:', e.message) }
    }
  } catch (e) { console.error('Failed to load product:', e) }
  loading.value = false
})

const formatCommentDate = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  const days = Math.floor(hrs / 24)
  if (days < 7) return days + 'd ago'
  return new Date(d).toLocaleDateString()
}

const postComment = async () => {
  if (!newComment.value.trim()) return
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  postingComment.value = true
  try {
    const { data, error } = await supabase.from('product_comments').insert({
      product_id: route.params.id,
      user_id: userStore.supabaseUser.id,
      username: userStore.username || 'User',
      text: newComment.value.trim(),
      likes: 0
    }).select().single()
    if (!error && data) {
      comments.value.unshift(data)
      newComment.value = ''
      window.__toast?.show('Comment posted!', 'success')
    }
  } catch (e) { console.warn('Post comment error:', e.message); window.__toast?.show('Failed to post comment', 'error') }
  postingComment.value = false
}

const likeComment = async (c) => {
  c.liked = !c.liked
  c.likes = (c.likes || 0) + (c.liked ? 1 : -1)
  try {
    await supabase.from('product_comments').update({ likes: c.likes }).eq('id', c.id)
  } catch (e) { console.warn('Like comment error:', e.message) }
}

const postReply = async (c) => {
  if (!replyText.value.trim()) return
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  try {
    const { data, error } = await supabase.from('product_comments').insert({
      product_id: route.params.id,
      user_id: userStore.supabaseUser.id,
      username: userStore.username || 'User',
      text: replyText.value.trim(),
      parent_id: c.id,
      likes: 0
    }).select().single()
    if (!error && data) {
      if (!c.replies) c.replies = []
      c.replies.push(data)
      replyText.value = ''
      replyTo.value = null
    }
  } catch (e) { console.warn('Post reply error:', e.message) }
}

const addToCart = async () => {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  adding.value = true
  try {
    await userStore.addToCart({ id: product.value.id, quantity: quantity.value })
    window.__toast?.show('Added to cart!', 'success')
  } catch { window.__toast?.show('Failed to add', 'error') }
  adding.value = false
}

const buyNow = async () => {
  await addToCart()
  router.push('/checkout')
}

const toggleFav = () => { isFav.value = !isFav.value }

// Bug #2: Chat with seller
const chatSeller = () => {
  if (!userStore.isLoggedIn) { window.location.hash = '#/login'; return }
  router.push(`/chat?seller=${product.value.seller_id}`)
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #999; margin-bottom: 16px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: var(--primary, #FF9900); }
.breadcrumb i { font-size: 10px; }
.loading-state { padding: 40px; text-align: center; }
.skeleton-img { width: 100%; max-width: 400px; height: 400px; background: #f0f0f0; border-radius: 8px; margin: 0 auto 20px; animation: pulse 1.5s infinite; }
.skeleton-text { width: 200px; height: 20px; background: #f0f0f0; border-radius: 4px; margin: 0 auto; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.empty-state { text-align: center; padding: 60px 0; color: #999; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 12px; display: block; }
.product-main { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; background: #fff; border-radius: 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 16px; }
.product-gallery { position: sticky; top: 80px; }
.main-image { position: relative; border-radius: 8px; overflow: hidden; background: #f8f8f8; }
.main-image img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.img-placeholder { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 80px; color: #ddd; background: linear-gradient(135deg, #f8f8f8, #eee); }
.discount-badge { position: absolute; top: 12px; left: 12px; background: var(--primary, #FF9900); color: #fff; padding: 4px 10px; font-size: 14px; font-weight: 700; border-radius: 4px; }
.thumb-row { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; }
.thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 4px; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.thumb.active, .thumb:hover { border-color: var(--primary, #FF9900); }
.product-title { font-size: 20px; font-weight: 600; color: #222; line-height: 1.4; margin-bottom: 12px; }
.product-stats { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; font-size: 13px; }
.stat-rating { display: flex; align-items: center; gap: 8px; }
.stars { color: #ffc107; font-size: 12px; }
.rating-num { color: var(--primary, #FF9900); font-weight: 600; }
.divider-v { width: 1px; height: 14px; background: #ddd; }
.review-count { color: #666; }
.stat-sales { color: #999; }
.price-box { background: linear-gradient(135deg, #fff8f0, #fff); padding: 16px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: baseline; gap: 12px; }
.current-price { font-size: 28px; font-weight: 700; color: var(--primary, #FF9900); }
.original-price { font-size: 16px; color: #999; text-decoration: line-through; }
.discount-tag { background: var(--primary, #FF9900); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.info-rows { margin-bottom: 20px; }
.info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.info-row .label { width: 80px; color: #999; flex-shrink: 0; }
.info-row .value { color: #333; }
.in-stock { color: #28a745; }
.out-stock { color: #ff4757; }
.seller-link { color: #007185; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.seller-link:hover { color: #c77a00; text-decoration: underline; }
.seller-link i { font-size: 10px; }
.seller-mini-logo { width: 20px; height: 20px; border-radius: 3px; object-fit: cover; }
.quantity-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.quantity-section .label { color: #999; font-size: 14px; }
.qty-control { display: flex; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
.qty-control button { width: 36px; height: 36px; border: none; background: #f8f8f8; cursor: pointer; font-size: 16px; transition: all 0.2s; }
.qty-control button:hover:not(:disabled) { background: #eee; }
.qty-control button:disabled { color: #ccc; cursor: not-allowed; }
.qty-control input { width: 50px; text-align: center; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px; }
.action-row { display: flex; gap: 12px; }
.btn-add-cart { flex: 1; padding: 14px; background: #fff; color: var(--primary, #FF9900); border: 2px solid var(--primary, #FF9900); border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.btn-add-cart:hover { background: #fff8f0; }
.btn-add-cart:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }
.btn-buy-now { flex: 1; padding: 14px; background: var(--primary, #FF9900); color: #fff; border: none; border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-buy-now:hover { background: var(--primary-dark, #e68a00); }
.btn-buy-now:disabled { background: #ccc; cursor: not-allowed; }
.btn-fav { width: 48px; height: 48px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer; font-size: 18px; color: #999; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-fav:hover { border-color: var(--primary, #FF9900); color: var(--primary, #FF9900); }
.btn-chat-seller { width: 100%; padding: 10px; background: #fff; color: #007185; border: 1px solid #007185; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; transition: all 0.2s; }
.btn-chat-seller:hover { background: #f0f8ff; border-color: #005f73; }
.product-tabs { display: flex; background: #fff; border-radius: 8px 8px 0 0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.product-tabs button { flex: 1; padding: 14px; background: none; border: none; font-size: 15px; font-weight: 500; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.product-tabs button.active { color: var(--primary, #FF9900); border-bottom-color: var(--primary, #FF9900); }
.tab-content { background: #fff; border-radius: 0 0 8px 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); min-height: 200px; }
.detail-content h3 { font-size: 16px; margin-bottom: 12px; }
.detail-content p { color: #555; font-size: 14px; line-height: 1.7; }
.empty-reviews { text-align: center; padding: 40px; color: #999; }
.empty-reviews i { font-size: 32px; color: #ddd; margin-bottom: 8px; }
.review-item { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.review-avatar { width: 36px; height: 36px; background: var(--primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.review-meta { flex: 1; }
.review-user { font-weight: 600; font-size: 14px; display: block; }
.review-stars { color: #ffc107; font-size: 11px; }
.review-date { font-size: 12px; color: #999; }
.review-text { font-size: 14px; color: #555; line-height: 1.6; }

/* Comments */
.comments-content { margin-top: 0; }
.comment-form { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.comment-input-row { display: flex; gap: 12px; }
.comment-avatar { width: 40px; height: 40px; background: var(--primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.comment-input-wrap { flex: 1; }
.comment-input-wrap textarea { width: 100%; padding: 12px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 60px; font-family: inherit; box-sizing: border-box; }
.comment-input-wrap textarea:focus { outline: none; border-color: var(--primary, #FF9900); }
.comment-form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.char-count { font-size: 12px; color: #999; }
.btn-post-comment { padding: 8px 20px; background: var(--primary, #FF9900); color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-post-comment:hover { background: var(--primary-dark, #e68a00); }
.btn-post-comment:disabled { background: #ccc; cursor: not-allowed; }
.empty-comments { text-align: center; padding: 32px; color: #999; }
.empty-comments i { font-size: 32px; color: #ddd; margin-bottom: 8px; }
.comment-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #f5f5f5; }
.comment-item:last-child { border-bottom: none; }
.comment-body { flex: 1; }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.comment-user { font-weight: 600; font-size: 14px; color: #333; }
.comment-date { font-size: 12px; color: #999; }
.comment-text { font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 8px; }
.comment-actions { display: flex; gap: 16px; }
.comment-like, .comment-reply { background: none; border: none; font-size: 12px; color: #999; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; }
.comment-like:hover, .comment-reply:hover { background: #f5f5f5; color: #555; }
.comment-like.liked { color: #e74c3c; }
.comment-like.liked i { color: #e74c3c; }
.comment-replies { margin-top: 12px; padding-left: 16px; border-left: 2px solid #f0f0f0; }
.reply-item { display: flex; gap: 8px; padding: 8px 0; }
.reply-avatar { width: 28px; height: 28px; background: #6c5ce7; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }
.reply-body { flex: 1; font-size: 13px; }
.reply-user { font-weight: 600; color: #333; margin-right: 6px; }
.reply-text { color: #555; }
.reply-date { font-size: 11px; color: #999; margin-left: 8px; }
.reply-form { display: flex; gap: 8px; margin-top: 12px; align-items: center; }
.reply-form input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
.reply-form input:focus { outline: none; border-color: var(--primary, #FF9900); }
.btn-reply { padding: 8px 16px; background: var(--primary, #FF9900); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-reply:disabled { background: #ccc; cursor: not-allowed; }
.btn-cancel { padding: 8px 12px; background: none; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; cursor: pointer; color: #666; }
@media (max-width: 1024px) {
  .product-main { gap: 20px; }
  .current-price { font-size: 24px; }
}
@media (max-width: 768px) {
  .product-main { grid-template-columns: 1fr; gap: 16px; padding: 12px; }
  .product-gallery { position: static; }
  .main-image img { aspect-ratio: 1; }
  .thumb { width: 48px; height: 48px; }
  .product-title { font-size: 16px; }
  .current-price { font-size: 20px; }
  .original-price { font-size: 14px; }
  .action-row { flex-direction: column; gap: 8px; }
  .btn-fav { width: 100%; height: 44px; }
  .btn-add-cart, .btn-buy-now { padding: 12px; font-size: 14px; }
  .info-row { font-size: 13px; }
  .info-row .label { width: 70px; }
  .product-tabs button { font-size: 13px; padding: 10px; }
  .tab-content { padding: 16px; }
}
@media (max-width: 480px) {
  .breadcrumb { font-size: 11px; }
  .product-title { font-size: 15px; }
  .price-box { padding: 12px; }
  .current-price { font-size: 18px; }
  .quantity-section { flex-direction: column; align-items: flex-start; gap: 8px; }
  .qty-control input { width: 40px; }
  .qty-control button { width: 32px; height: 32px; }
}
</style>
