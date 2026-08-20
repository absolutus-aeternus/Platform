<template>
  <div class="product-card" @click="$router.push(`/product/${product.id}`)">
    <!-- Image -->
    <div class="product-card__img">
      <!-- Skeleton loader (prevents CLS) -->
      <BaseSkeleton
        v-if="!imageLoaded"
        width="100%"
        height="100%"
        borderRadius="0"
        class="product-card__skeleton"
      />
      <img
        v-if="product.images?.[0] || product.image"
        :src="product.images?.[0] || product.image"
        :alt="product.name"
        loading="lazy"
        :class="{ 'product-card__img--loaded': imageLoaded }"
        @load="imageLoaded = true"
        @error="imageLoaded = true"
      />
      <div v-else class="product-card__img-placeholder" :style="{ background: gradient }">
        <span>{{ (product.name || '?')[0] }}</span>
      </div>
      <!-- Gradient scrim on bottom of image -->
      <div class="product-card__scrim"></div>
      <!-- Wishlist -->
      <button class="product-card__wishlist" @click.stop="$emit('wishlist', product)" aria-label="Add to wishlist">
        <i class="far fa-heart"></i>
      </button>
      <!-- Quick Add to Cart (appears on hover / always on mobile) -->
      <button class="product-card__quick-add" @click.stop="$emit('add-to-cart', product)" aria-label="Quick add to cart">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="product-card__body">
      <div class="product-card__name">{{ product.name }}</div>
      <!-- Rating -->
      <div class="product-card__rating" v-if="product.rating || product.review_count">
        <span class="product-card__stars">
          <i v-for="i in 5" :key="i" :class="i <= Math.round(product.rating || 4) ? 'fas fa-star' : 'far fa-star'"></i>
        </span>
        <span class="product-card__reviews">({{ formatCount(product.review_count || product.sales_count) }})</span>
      </div>
      <!-- Price + Discount Badge (moved from overlay to info area) -->
      <div class="product-card__price-row">
        <span class="product-card__price">${{ product.price }}</span>
        <span v-if="product.original_price" class="product-card__original">${{ product.original_price }}</span>
        <DiscountTag v-if="product.discount" :percentage="product.discount" size="sm" />
      </div>
      <!-- Meta -->
      <div class="product-card__meta">
        <span v-if="product.discount" class="product-card__deal">Deal</span>
        <span class="product-card__shipping">FREE Shipping</span>
      </div>
      <!-- Seller (always visible, WCAG-safe color) -->
      <div class="product-card__seller" v-if="product.sellers?.name || product.seller_name">
        <i class="fas fa-store"></i>
        <span>{{ product.sellers?.name || product.seller_name }}</span>
      </div>
      <!-- Cart button (desktop hover) -->
      <button class="product-card__cart-btn" @click.stop="$emit('add-to-cart', product)">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  </div>

<script setup>
import { ref, computed } from 'vue'
import DiscountTag from '@/components/trust/DiscountTag.vue'
import BaseSkeleton from '@/components/base/BaseSkeleton.vue'

const props = defineProps({
  product: { type: Object, required: true }
})
defineEmits(['wishlist', 'add-to-cart'])

const imageLoaded = ref(false)

const gradient = computed(() => {
  const name = props.product.name || 'P'
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = hash % 360
  return `linear-gradient(135deg, hsl(${hue}, 60%, 65%), hsl(${(hue + 40) % 360}, 50%, 55%))`
})

function formatCount(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
</template>

</script>

<style scoped>
.product-card {
  background: var(--white, #fff);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--ease-normal, 0.2s ease), transform var(--ease-normal, 0.2s ease);
  border: 1px solid var(--neutral-200, #E7E7E7);
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  box-shadow: var(--shadow-card-hover, 0 4px 16px rgba(0,0,0,0.12));
  transform: translateY(-2px);
}

/* ── Image Container ── */
.product-card__img {
  position: relative;
  aspect-ratio: 1 / 1;       /* Locked 1:1 ratio */
  overflow: hidden;
  background: var(--neutral-100, #F5F5F5);
}
.product-card__img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}
.product-card__img img.product-card__img--loaded {
  opacity: 1;
}
.product-card:hover .product-card__img img { transform: scale(1.05); }
.product-card__img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700; color: rgba(255,255,255,0.8);
}

/* Skeleton placeholder inside image area */
.product-card__skeleton {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* ── Gradient Scrim (bottom overlay for readability) ── */
.product-card__scrim {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: var(--scrim-gradient, linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%));
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--ease-normal, 0.2s ease);
}
.product-card:hover .product-card__scrim {
  opacity: 1;
}

/* ── Wishlist ── */
.product-card__wishlist {
  position: absolute; top: 8px; right: 8px;
  background: rgba(255,255,255,0.9);
  border: none; border-radius: 50%;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--ease-fast, 0.15s ease);
  font-size: 14px; color: var(--neutral-600, #666);
  z-index: 2;
}
.product-card:hover .product-card__wishlist { opacity: 1; }
.product-card__wishlist:hover { color: var(--error, #CC0C39); }

/* ── Quick Add to Cart (floating button on image) ── */
.product-card__quick-add {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  background: var(--quick-add-bg, rgba(255,153,0,0.95));
  color: var(--white, #fff);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--ease-normal, 0.2s ease);
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.product-card:hover .product-card__quick-add {
  opacity: 1;
  transform: scale(1);
}
.product-card__quick-add:hover {
  background: var(--brand-primary-hover, #E68A00);
  transform: scale(1.1) !important;
}

/* ── Body ── */
.product-card__body { padding: 12px; flex: 1; display: flex; flex-direction: column; }

/* ── Name ── */
.product-card__name {
  font-size: var(--text-base, 14px);
  font-weight: 500;
  color: var(--neutral-900, #0F1111);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
  margin-bottom: 4px;
}

/* ── Rating ── */
.product-card__rating {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 6px;
}
.product-card__stars { font-size: 12px; color: #FFA41C; }
.product-card__stars i { margin-right: 1px; }
.product-card__reviews {
  font-size: var(--text-xs, 12px);
  color: var(--text-muted-safe, #767676);  /* WCAG AA: #767676 on white = 4.5:1 */
}

/* ── Price + Discount ── */
.product-card__price-row {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;
  flex-wrap: wrap;
}
.product-card__price {
  font-size: var(--text-lg, 18px);
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
}
.product-card__original {
  font-size: var(--text-xs, 12px);
  color: var(--text-muted-safe, #767676);  /* WCAG AA safe */
  text-decoration: line-through;
}

/* ── Meta ── */
.product-card__meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.product-card__deal {
  background: var(--error-bg, #FEE2E9);
  color: var(--error, #CC0C39);
  font-size: 11px; font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-xs, 4px);
}
.product-card__shipping {
  font-size: var(--text-xs, 12px);
  color: var(--success, #067D62);  /* 4.9:1 on white ✅ */
  font-weight: 500;
}

/* ── Seller (always visible, WCAG-safe) ── */
.product-card__seller {
  font-size: var(--text-xs, 12px);
  color: var(--text-muted-safe, #767676);  /* WCAG AA: 4.5:1 on white */
  margin-top: auto;
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.product-card__seller i {
  font-size: 10px;
  color: var(--brand-accent, #007185);
}

/* ── Cart Button (desktop hover) ── */
.product-card__cart-btn {
  margin-top: 8px;
  padding: 8px;
  background: var(--quick-add-bg, rgba(255,153,0,0.95));
  color: var(--white, #fff);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--text-sm, 13px);
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transform: translateY(4px);
  transition: all var(--ease-normal, 0.2s ease);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.product-card:hover .product-card__cart-btn {
  opacity: 1; transform: translateY(0);
}
.product-card__cart-btn:hover {
  background: var(--brand-primary-hover, #E68A00);
}

/* ── Responsive ── */

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  .product-card__body { padding: 10px; }
  .product-card__name { font-size: 13px; }
  .product-card__price { font-size: 16px; }
}

/* Mobile */
@media (max-width: 639px) {
  .product-card__body { padding: 8px; }
  .product-card__name {
    font-size: 12px;
    min-height: 31px;
  }
  .product-card__price { font-size: 14px; }
  .product-card__rating { margin-bottom: 4px; }
  .product-card__stars { font-size: 10px; }
  .product-card__seller { font-size: 10px; }
  .product-card__cart-btn { display: none; }
  .product-card__wishlist { opacity: 1; width: 28px; height: 28px; font-size: 12px; }
  .product-card__quick-add {
    opacity: 1;
    transform: scale(1);
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
}

img { max-width: 100%; height: auto; }
</style>
