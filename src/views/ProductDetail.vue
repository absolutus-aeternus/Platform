<template>
<div class="page-wrapper">
  <div class="product-detail">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> <i class="fas fa-chevron-right"></i>
        <router-link to="/commodity">Products</router-link> <i class="fas fa-chevron-right"></i>
        <span>{{ product?.name || 'Loading...' }}</span>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="pdp-skeleton">
          <div class="pdp-skel-gallery">
            <div class="pdp-skel-main skeleton-shimmer"></div>
            <div class="pdp-skel-thumbs">
              <div v-for="i in 4" :key="i" class="pdp-skel-thumb skeleton-shimmer"></div>
            </div>
          </div>
          <div class="pdp-skel-info">
            <div class="pdp-skel-line skeleton-shimmer" style="width:80%;height:24px"></div>
            <div class="pdp-skel-line skeleton-shimmer" style="width:40%;height:16px"></div>
            <div class="pdp-skel-line skeleton-shimmer" style="width:30%;height:32px;margin-top:16px"></div>
            <div class="pdp-skel-line skeleton-shimmer" style="width:100%;height:48px;margin-top:24px"></div>
            <div class="pdp-skel-line skeleton-shimmer" style="width:100%;height:48px;margin-top:12px"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!product" class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Product not found</p>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>

      <div v-else>
        <!-- Product Main -->
        <div class="product-main">
          <!-- Image Gallery -->
          <div class="product-gallery">
            <div class="main-image" @mousemove="onZoomMove" @mouseleave="zoomActive = false" @click="openLightbox">
              <img loading="lazy" v-if="product.images?.length" :src="product.images[selectedImage || 0]" :alt="product.name" :style="zoomStyle">
              <div v-else class="img-placeholder">{{ product.name?.[0] || 'P' }}</div>
              <span v-if="product.discount" class="discount-badge">-{{ product.discount }}%</span>
              <div class="zoom-hint" v-if="!zoomActive"><i class="fas fa-search-plus"></i> Hover to zoom</div>
            </div>
            <div class="thumb-row" v-if="product.images?.length > 1">
              <img loading="lazy" v-for="(img, i) in product.images.slice(0, 5)" :key="i" :src="img" class="thumb" :class="{ active: selectedImage === i }" @click="selectedImage = i" :alt="product.name + ' image ' + (i+1)">
            </div>
          </div>

          <!-- Lightbox (fullscreen with touch-swipe) -->
          <Teleport to="body">
            <Transition name="lightbox">
              <div v-if="showLightbox" class="lightbox" @click.self="closeLightbox">
                <button class="lightbox__close" @click="closeLightbox"><i class="fas fa-times"></i></button>
                <button class="lightbox__nav lightbox__nav--prev" @click="lightboxPrev"><i class="fas fa-chevron-left"></i></button>
                <div class="lightbox__img-wrap"
                  @touchstart="onLightboxTouchStart"
                  @touchmove="onLightboxTouchMove"
                  @touchend="onLightboxTouchEnd"
                >
                  <img :src="product.images[lightboxImage]" :alt="product.name" class="lightbox__img" :style="lightboxSwipeStyle" />
                </div>
                <button class="lightbox__nav lightbox__nav--next" @click="lightboxNext"><i class="fas fa-chevron-right"></i></button>
                <div class="lightbox__counter">{{ lightboxImage + 1 }} / {{ product.images.length }}</div>
                <div class="lightbox__dots">
                  <span v-for="(_, i) in product.images" :key="i" :class="{ active: lightboxImage === i }" @click="lightboxImage = i"></span>
                </div>
              </div>
            </Transition>
          </Teleport>

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
                <span class="value">
                  <span class="shipping-est">
                    <i class="fas fa-truck" style="color:var(--brand-primary, #FF9900);margin-right:6px"></i>
                    Free shipping · Est. delivery: <strong>{{ estimatedDelivery }}</strong>
                  </span>
                </span>
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

            <!-- Variant Selection (if variants exist) -->
            <div v-if="product.variants?.length" class="variant-section">
              <div class="variant-group" v-for="group in variantGroups" :key="group.name">
                <div class="variant-label-row">
                  <span class="label">{{ group.name }}:</span>
                  <span v-if="group.name.toLowerCase().includes('size')" class="size-chart-trigger" @click="showSizeChart = true">
                    <i class="fas fa-ruler"></i> Size Chart
                  </span>
                </div>
                <div class="variant-options">
                  <button
                    v-for="opt in group.options"
                    :key="opt"
                    class="variant-chip"
                    :class="{ active: selectedVariants[group.name] === opt, disabled: !isVariantAvailable(group.name, opt) }"
                    @click="selectVariant(group.name, opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
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
              <button class="btn-add-cart" @click="handleAddToCart" :disabled="adding || product.stock <= 0" aria-label="Add to cart">
                <i class="fas fa-shopping-cart"></i> {{ adding ? 'Adding...' : 'Add to Cart' }}
              </button>
              <button class="btn-buy-now" @click="handleBuyNow" :disabled="product.stock <= 0" aria-label="Buy now">
                Buy Now
              </button>
              <button class="btn-fav" @click="toggleFav" aria-label="Toggle favorite">
                <i :class="isFav ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
            </div>
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
                  <i class="fas fa-truck" style="color:var(--brand-primary, #FF9900);font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Free Shipping</div><div style="font-size:11px;color:#999">2-7 business days</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-shield-alt" style="color:var(--brand-primary, #FF9900);font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Buyer Protection</div><div style="font-size:11px;color:#999">Full refund if not as described</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-undo" style="color:var(--brand-primary, #FF9900);font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">Easy Returns</div><div style="font-size:11px;color:#999">30-day return policy</div></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8f9fa;border-radius:8px">
                  <i class="fas fa-headset" style="color:var(--brand-primary, #FF9900);font-size:18px"></i>
                  <div><div style="font-weight:600;font-size:13px">24/7 Support</div><div style="font-size:11px;color:#999">Online customer service</div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Tab with Filter -->
          <div v-if="tab === 'reviews'" class="reviews-content">
            <!-- Review Filter Tabs -->
            <div class="review-filter-tabs">
              <button :class="{ active: reviewFilter === 'all' }" @click="reviewFilter = 'all'">All ({{ reviews.length }})</button>
              <button :class="{ active: reviewFilter === 'photo' }" @click="reviewFilter = 'photo'">
                <i class="fas fa-image"></i> With Photos ({{ reviewsWithPhotos.length }})
              </button>
              <button v-for="star in [5,4,3,2,1]" :key="star" :class="{ active: reviewFilter === star }" @click="reviewFilter = star">
                {{ star }} <i class="fas fa-star" style="font-size:10px"></i> ({{ reviewsByStar(star).length }})
              </button>
            </div>

            <div v-if="filteredReviews.length === 0" class="empty-reviews">
              <i class="fas fa-comment-slash"></i>
              <p>No reviews match this filter.</p>
            </div>
            <div v-for="r in filteredReviews" :key="r.id" class="review-item">
              <div class="review-header">
                <div class="review-avatar">{{ (r.users?.username || r.users?.email || 'U')[0].toUpperCase() }}</div>
                <div class="review-meta">
                  <span class="review-user">{{ r.users?.username || r.users?.email || 'User' }}</span>
                  <span class="review-stars"><i v-for="i in 5" :key="i" :class="i <= r.rating ? 'fas fa-star' : 'far fa-star'"></i></span>
                </div>
                <span class="review-date">{{ new Date(r.created_at).toLocaleDateString() }}</span>
              </div>
              <!-- Variant badge in review -->
              <div v-if="r.variant" class="review-variant-badge">
                <i class="fas fa-tag"></i> {{ r.variant }}
              </div>
              <p class="review-text">{{ r.comment }}</p>
              <!-- Review images -->
              <div v-if="r.images?.length" class="review-images">
                <img v-for="(img, i) in r.images" :key="i" :src="img" class="review-img" loading="lazy" @click="openReviewImage(img)" />
              </div>
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
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase, fetchProductById, fetchReviews } from '@/services/supabase'
import StickyCTA from '@/components/layout/StickyCTA.vue'
import VerifiedBadge from '@/components/trust/VerifiedBadge.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tab = ref('detail')
const selectedImage = ref(0)
const zoomActive = ref(false)
const showLightbox = ref(false)
const lightboxImage = ref(0)
const zoomX = ref(50)
const zoomY = ref(50)
const showSizeChart = ref(false)
const showVariantSheet = ref(false)
const selectedVariants = ref({})
const reviewFilter = ref('all')

// Lightbox touch-swipe state
const lbTouchStartX = ref(0)
const lbTouchDeltaX = ref(0)
const lbSwiping = ref(false)

const lightboxSwipeStyle = computed(() => {
  if (!lbSwiping.value) return { transition: 'transform 0.2s ease' }
  return { transform: `translateX(${lbTouchDeltaX.value}px)`, transition: 'none' }
})

const zoomStyle = computed(() => {
  if (!zoomActive.value) return {}
  return {
    transform: 'scale(2)',
    transformOrigin: `${zoomX.value}% ${zoomY.value}%`,
    cursor: 'zoom-in'
  }
})

// Variant groups computed
const variantGroups = computed(() => {
  if (!product.value?.variants?.length) return []
  const groups = {}
  product.value.variants.forEach(v => {
    if (typeof v === 'string') {
      // Simple variant like "Red, Blue"
      if (!groups['Option']) groups['Option'] = { name: 'Option', options: [] }
      groups['Option'].options.push(v)
    } else if (v.name && v.options) {
      groups[v.name] = v
    }
  })
  return Object.values(groups)
})

// Review filtering
const reviewsWithPhotos = computed(() => reviews.value.filter(r => r.images?.length > 0))
const reviewsByStar = (star) => reviews.value.filter(r => Math.round(r.rating) === star)
const filteredReviews = computed(() => {
  if (reviewFilter.value === 'all') return reviews.value
  if (reviewFilter.value === 'photo') return reviewsWithPhotos.value
  return reviewsByStar(reviewFilter.value)
})

// Dynamic shipping estimate
const estimatedDelivery = computed(() => {
  const now = new Date()
  const min = new Date(now)
  min.setDate(min.getDate() + 2)
  const max = new Date(now)
  max.setDate(max.getDate() + 7)
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(min)} - ${fmt(max)}`
})

function onZoomMove(e) {
  zoomActive.value = true
  const rect = e.currentTarget.getBoundingClientRect()
  zoomX.value = ((e.clientX - rect.left) / rect.width) * 100
  zoomY.value = ((e.clientY - rect.top) / rect.height) * 100
}

// Lightbox functions
function openLightbox() {
  lightboxImage.value = selectedImage.value || 0
  showLightbox.value = true
}
function closeLightbox() {
  showLightbox.value = false
  lbSwiping.value = false
}
function lightboxPrev() {
  lightboxImage.value = Math.max(0, lightboxImage.value - 1)
}
function lightboxNext() {
  lightboxImage.value = Math.min(product.value.images.length - 1, lightboxImage.value + 1)
}

// Lightbox touch handlers
function onLightboxTouchStart(e) {
  lbTouchStartX.value = e.touches[0].clientX
  lbTouchDeltaX.value = 0
  lbSwiping.value = true
}
function onLightboxTouchMove(e) {
  if (!lbSwiping.value) return
  lbTouchDeltaX.value = e.touches[0].clientX - lbTouchStartX.value
}
function onLightboxTouchEnd() {
  if (Math.abs(lbTouchDeltaX.value) > 60) {
    if (lbTouchDeltaX.value > 0) lightboxPrev()
    else lightboxNext()
  }
  lbSwiping.value = false
  lbTouchDeltaX.value = 0
}

// Variant functions
function selectVariant(groupName, option) {
  selectedVariants.value = { ...selectedVariants.value, [groupName]: option }
}
function isVariantAvailable(groupName, option) {
  // Simplified: all options available
  return true
}
function confirmVariantSelection() {
  showVariantSheet.value = false
  window.__toast?.show('Variant selected!', 'success')
}

// Keyboard support for lightbox
function onLightboxKeydown(e) {
  if (!showLightbox.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') lightboxPrev()
  if (e.key === 'ArrowRight') lightboxNext()
}

function openReviewImage(img) {
  // Could open in lightbox, for now just open in new tab
  window.open(img, '_blank')
}

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
  document.addEventListener('keydown', onLightboxKeydown)
  try {
    const { data } = await fetchProductById(route.params.id)
    product.value = data || null
    if (data) {
      const { data: revData } = await fetchReviews(route.params.id)
      reviews.value = revData || []
      try {
        const { data: cData } = await supabase.from('product_comments').select('*').eq('product_id', route.params.id).order('created_at', { ascending: false }).limit(100)
        comments.value = cData || []
      } catch (e) { console.warn('Comments load error:', e.message) }
    }
  } catch (e) { console.error('Failed to load product:', e) }
  loading.value = false
})

onUnmounted(() => {
  document.removeEventListener('keydown', onLightboxKeydown)
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

const handleAddToCart = async () => {
  // Check if variants need selection
  if (variantGroups.value.length > 0 && Object.keys(selectedVariants.value).length < variantGroups.value.length) {
    showVariantSheet.value = true
    return
  }
  await addToCart()
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

const handleBuyNow = async () => {
  if (variantGroups.value.length > 0 && Object.keys(selectedVariants.value).length < variantGroups.value.length) {
    showVariantSheet.value = true
    return
  }
  await addToCart()
  router.push('/checkout')
}

const toggleFav = () => { isFav.value = !isFav.value }

const chatSeller = () => {
  if (!userStore.isLoggedIn) { window.location.hash = '#/login'; return }
  router.push(`/chat?seller=${product.value.seller_id}`)
}
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 16px 12px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #999; margin-bottom: 16px; }
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: var(--brand-primary, #FF9900); }
.breadcrumb i { font-size: 10px; }

/* Skeleton Loader */
.loading-state { padding: 20px 0; }
.pdp-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.pdp-skel-main { aspect-ratio: 1/1; background: #f0f0f0; border-radius: 8px; }
.pdp-skel-thumbs { display: flex; gap: 8px; margin-top: 12px; }
.pdp-skel-thumb { width: 64px; height: 64px; background: #f0f0f0; border-radius: 4px; }
.pdp-skel-info { display: flex; flex-direction: column; gap: 8px; padding-top: 20px; }
.pdp-skel-line { border-radius: 4px; }
.skeleton-shimmer { animation: shimmer 1.5s infinite; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%) !important; background-size: 200% 100% !important; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 60px 0; color: #999; }
.empty-state i { font-size: 48px; color: #ddd; margin-bottom: 12px; display: block; }
.product-main { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; background: var(--bg-card, #fff); border-radius: 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 16px; }
.product-gallery { position: sticky; top: 80px; }
.main-image { position: relative; border-radius: 8px; overflow: hidden; background: var(--neutral-100, #f8f8f8); cursor: zoom-in; aspect-ratio: 1/1; }
.main-image img { width: 100%; height: 100%; aspect-ratio: 1/1; object-fit: cover; transition: transform 0.1s ease; display: block; }
.zoom-hint { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: var(--white, #fff); padding: 4px 10px; border-radius: 4px; font-size: 11px; pointer-events: none; }

/* Lightbox */
.lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: var(--z-modal, 800); display: flex; align-items: center; justify-content: center; }
.lightbox__img-wrap { max-width: 90vw; max-height: 80vh; display: flex; align-items: center; justify-content: center; touch-action: pan-y; user-select: none; }
.lightbox__img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 4px; user-select: none; -webkit-user-drag: none; }
.lightbox__close { position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1); border: none; color: var(--white, #fff); font-size: 24px; cursor: pointer; z-index: calc(var(--z-modal, 800) + 1); padding: 8px 12px; border-radius: 8px; transition: background 0.2s; }
.lightbox__close:hover { background: rgba(255,255,255,0.2); }
.lightbox__nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: var(--white, #fff); font-size: 24px; cursor: pointer; padding: 16px 12px; border-radius: 4px; transition: background 0.2s; z-index: calc(var(--z-modal, 800) + 1); }
.lightbox__nav:hover { background: rgba(255,255,255,0.25); }
.lightbox__nav--prev { left: 16px; }
.lightbox__nav--next { right: 16px; }
.lightbox__counter { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: 14px; }
.lightbox__dots { position: absolute; bottom: 20px; display: flex; gap: 8px; }
.lightbox__dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
.lightbox__dots span.active { background: var(--white, #fff); transform: scale(1.2); }

/* Lightbox transition */
.lightbox-enter-active { animation: lightbox-in 0.25s ease; }
.lightbox-leave-active { animation: lightbox-out 0.2s ease; }
@keyframes lightbox-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes lightbox-out { from { opacity: 1; } to { opacity: 0; } }

.img-placeholder { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 80px; color: #ddd; background: linear-gradient(135deg, #f8f8f8, #eee); }
.discount-badge { position: absolute; top: 12px; left: 12px; background: var(--brand-primary, #FF9900); color: #fff; padding: 4px 10px; font-size: 14px; font-weight: 700; border-radius: 4px; }
.thumb-row { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; }
.thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 4px; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.thumb.active, .thumb:hover { border-color: var(--brand-primary, #FF9900); }
.product-title { font-size: 20px; font-weight: 600; color: #222; line-height: 1.4; margin-bottom: 12px; }
.product-stats { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; font-size: 13px; }
.stat-rating { display: flex; align-items: center; gap: 8px; }
.stars { color: var(--warning, #B45309); font-size: 12px; }
.rating-num { color: var(--brand-primary, #FF9900); font-weight: 600; }
.divider-v { width: 1px; height: 14px; background: #ddd; }
.review-count { color: #666; }
.stat-sales { color: #999; }
.price-box { background: linear-gradient(135deg, #fff8f0, #fff); padding: 16px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: baseline; gap: 12px; }
.current-price { font-size: 28px; font-weight: 700; color: var(--brand-primary, #FF9900); }
.original-price { font-size: 16px; color: #999; text-decoration: line-through; }
.discount-tag { background: var(--brand-primary, #FF9900); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.info-rows { margin-bottom: 20px; }
.info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.info-row .label { width: 80px; color: #999; flex-shrink: 0; }
.info-row .value { color: var(--text-primary, #333); flex: 1; }
.in-stock { color: var(--success, #067D62); }
.out-stock { color: #ff4757; }
.seller-link { color: var(--brand-accent, #007185); cursor: pointer; display: flex; align-items: center; gap: 6px; }
.seller-link:hover { color: #c77a00; text-decoration: underline; }
.seller-link i { font-size: 10px; }
.seller-mini-logo { width: 20px; height: 20px; border-radius: 3px; object-fit: cover; }
.shipping-est { font-size: 13px; color: var(--text-primary, #333); }
.shipping-est strong { color: var(--brand-primary, #FF9900); }

/* Variant Section */
.variant-section { margin-bottom: 20px; }
.variant-group { margin-bottom: 16px; }
.variant-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.variant-label-row .label { color: #999; font-size: 14px; }
.size-chart-trigger { font-size: 12px; color: var(--brand-accent, #007185); cursor: pointer; display: flex; align-items: center; gap: 4px; }
.size-chart-trigger:hover { text-decoration: underline; }
.variant-options { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-chip { padding: 8px 16px; border: 1px solid var(--border, #ddd); background: var(--bg-card, #fff); border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.15s; }
.variant-chip:hover { border-color: var(--brand-primary, #FF9900); }
.variant-chip.active { border-color: var(--brand-primary, #FF9900); background: #fff8f0; color: var(--brand-primary, #FF9900); font-weight: 600; }
.variant-chip.disabled { opacity: 0.4; cursor: not-allowed; }

.quantity-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.quantity-section .label { color: #999; font-size: 14px; }
.qty-control { display: flex; border: 1px solid var(--border, #ddd); border-radius: 4px; overflow: hidden; }
.qty-control button { width: 36px; height: 36px; border: none; background: var(--neutral-100, #f8f8f8); cursor: pointer; font-size: 16px; transition: all 0.2s; }
.qty-control button:hover:not(:disabled) { background: #eee; }
.qty-control button:disabled { color: #ccc; cursor: not-allowed; }
.qty-control input { width: 50px; text-align: center; border: none; border-left: 1px solid var(--border, #ddd); border-right: 1px solid var(--border, #ddd); font-size: 14px; }
.action-row { display: flex; gap: 12px; }
.btn-add-cart { flex: 1; padding: 14px; background: var(--bg-card, #fff); color: var(--brand-primary, #FF9900); border: 2px solid var(--brand-primary, #FF9900); border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.btn-add-cart:hover { background: #fff8f0; }
.btn-add-cart:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }
.btn-buy-now { flex: 1; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-buy-now:hover { background: var(--brand-primary-hover, #E68A00); }
.btn-buy-now:disabled { background: #ccc; cursor: not-allowed; }
.btn-fav { width: 48px; height: 48px; border: 1px solid var(--border, #ddd); background: var(--bg-card, #fff); border-radius: 4px; cursor: pointer; font-size: 18px; color: #999; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-fav:hover { border-color: var(--brand-primary, #FF9900); color: var(--brand-primary, #FF9900); }
.btn-chat-seller { width: 100%; padding: 10px; background: var(--bg-card, #fff); color: var(--brand-accent, #007185); border: 1px solid var(--brand-accent, #007185); border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; transition: all 0.2s; }
.btn-chat-seller:hover { background: #f0f8ff; border-color: #005f73; }
.product-tabs { display: flex; background: var(--bg-card, #fff); border-radius: 8px 8px 0 0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.product-tabs button { flex: 1; padding: 14px; background: none; border: none; font-size: 15px; font-weight: 500; color: #666; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
.product-tabs button.active { color: var(--brand-primary, #FF9900); border-bottom-color: var(--brand-primary, #FF9900); }
.tab-content { background: var(--bg-card, #fff); border-radius: 0 0 8px 8px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); min-height: 200px; }
.detail-content h3 { font-size: 16px; margin-bottom: 12px; }
.detail-content p { color: #555; font-size: 14px; line-height: 1.7; }

/* Review Filter Tabs */
.review-filter-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
.review-filter-tabs button { padding: 6px 14px; border: 1px solid var(--border, #ddd); background: var(--bg-card, #fff); border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.review-filter-tabs button.active { background: var(--brand-primary, #FF9900); color: #fff; border-color: var(--brand-primary, #FF9900); }
.review-filter-tabs button:hover:not(.active) { border-color: var(--brand-primary, #FF9900); color: var(--brand-primary, #FF9900); }

.empty-reviews { text-align: center; padding: 40px; color: #999; }
.empty-reviews i { font-size: 32px; color: #ddd; margin-bottom: 8px; }
.review-item { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.review-avatar { width: 36px; height: 36px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.review-meta { flex: 1; }
.review-user { font-weight: 600; font-size: 14px; display: block; }
.review-stars { color: var(--warning, #B45309); font-size: 11px; }
.review-date { font-size: 12px; color: #999; }
.review-variant-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; background: #f0f8ff; color: var(--brand-accent, #007185); border-radius: 12px; font-size: 11px; font-weight: 500; margin-bottom: 8px; }
.review-variant-badge i { font-size: 10px; }
.review-text { font-size: 14px; color: #555; line-height: 1.6; }
.review-images { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.review-img { width: 72px; height: 72px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid #eee; transition: border-color 0.2s; }
.review-img:hover { border-color: var(--brand-primary, #FF9900); }

/* Size Chart */
.size-chart-content { overflow-x: auto; }
.size-chart-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.size-chart-table th { background: var(--brand-nav, #232F3E); color: #fff; padding: 10px 16px; text-align: left; font-weight: 600; }
.size-chart-table td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; }
.size-chart-table tr:hover td { background: #fafafa; }
.size-chart-note { font-size: 12px; color: #999; margin-top: 12px; }

/* Variant Sheet */
.variant-sheet-content { padding: 8px 0; }
.variant-sheet-group { margin-bottom: 16px; }
.variant-sheet-group h4 { font-size: 14px; margin-bottom: 8px; color: #333; }
.btn-variant-confirm { width: 100%; padding: 14px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; }
.btn-variant-confirm:hover { background: var(--brand-primary-hover, #E68A00); }

/* Comments */
.comments-content { margin-top: 0; }
.comment-form { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
.comment-input-row { display: flex; gap: 12px; }
.comment-avatar { width: 40px; height: 40px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.comment-input-wrap { flex: 1; }
.comment-input-wrap textarea { width: 100%; padding: 12px; border: 2px solid #e8e8e8; border-radius: 8px; font-size: 14px; resize: vertical; min-height: 60px; font-family: inherit; box-sizing: border-box; }
.comment-input-wrap textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.comment-form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.char-count { font-size: 12px; color: #999; }
.btn-post-comment { padding: 8px 20px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-post-comment:hover { background: var(--brand-primary-hover, #E68A00); }
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
.reply-form input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.btn-reply { padding: 8px 16px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-reply:disabled { background: #ccc; cursor: not-allowed; }
.btn-cancel { padding: 8px 12px; background: none; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; cursor: pointer; color: #666; }

@media (max-width: 1024px) {
  .product-main { gap: 20px; }
  .current-price { font-size: 24px; }
  .pdp-skeleton { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .product-main { grid-template-columns: 1fr; gap: 16px; padding: 12px; }
  .product-gallery { position: static; }
  .main-image img { aspect-ratio: 1; }
  .zoom-hint { display: none; } /* Hide hover-to-zoom on touch devices */
  .thumb { width: 48px; height: 48px; }
  .product-title { font-size: 16px; }
  .current-price { font-size: 20px; }
  .original-price { font-size: 14px; }
  .action-row { flex-direction: column; gap: 8px; }
  .btn-fav { width: 100%; height: 44px; }
  .btn-add-cart, .btn-buy-now { padding: 12px; font-size: 14px; min-height: 44px; }
  .info-row { font-size: 13px; }
  .info-row .label { width: 70px; }
  .product-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .product-tabs button { font-size: 13px; padding: 10px; white-space: nowrap; min-height: 44px; }
  .tab-content { padding: 16px; overflow-x: auto; }
  .tab-content table { min-width: 480px; display: block; }
  .review-filter-tabs { gap: 4px; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
  .review-filter-tabs button { padding: 6px 12px; font-size: 11px; min-height: 32px; white-space: nowrap; flex-shrink: 0; }
  .lightbox__nav { padding: 12px 8px; font-size: 18px; }
  .lightbox__nav--prev { left: 8px; }
  .lightbox__nav--next { right: 8px; }
  .lightbox__close { top: 8px; right: 8px; padding: 10px 14px; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; }
  .comment-input-wrap textarea { font-size: 16px; } /* Prevent iOS zoom */
  .reply-form input { font-size: 16px; min-height: 40px; } /* Prevent iOS zoom */
}
@media (max-width: 480px) {
  .breadcrumb { font-size: 11px; }
  .product-title { font-size: 15px; }
  .price-box { padding: 12px; }
  .current-price { font-size: 18px; }
  .quantity-section { flex-direction: column; align-items: flex-start; gap: 8px; }
  .qty-control input { width: 40px; }
  .qty-control button { width: 32px; height: 32px; }
  .variant-chip { padding: 6px 12px; font-size: 12px; }
}

img { max-width: 100%; height: auto; }
</style>
