<template>
  <div class="product-card" @click="$router.push(`/product/${product.id}`)">
    <!-- Image -->
    <div class="product-card__img">
      <img
        v-if="product.images?.[0] || product.image"
        :src="product.images?.[0] || product.image"
        :alt="product.name"
        loading="lazy"
      />
      <div v-else class="product-card__img-placeholder" :style="{ background: gradient }">
        <span>{{ (product.name || '?')[0] }}</span>
      </div>
      <!-- Discount Badge -->
      <span v-if="product.discount" class="product-card__badge">-{{ product.discount }}%</span>
      <!-- Wishlist -->
      <button class="product-card__wishlist" @click.stop="$emit('wishlist', product)" aria-label="Add to wishlist">
        <i class="far fa-heart"></i>
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
      <!-- Price -->
      <div class="product-card__price-row">
        <span class="product-card__price">${{ product.price }}</span>
        <span v-if="product.original_price" class="product-card__original">${{ product.original_price }}</span>
      </div>
      <!-- Meta -->
      <div class="product-card__meta">
        <span v-if="product.discount" class="product-card__deal">Deal</span>
        <span class="product-card__shipping">FREE Shipping</span>
      </div>
      <!-- Seller -->
      <div class="product-card__seller" v-if="product.sellers?.name || product.seller_name">
        by {{ product.sellers?.name || product.seller_name }}
      </div>
      <!-- Cart button (desktop hover) -->
      <button class="product-card__cart-btn" @click.stop="$emit('add-to-cart', product)">
        <i class="fas fa-shopping-cart"></i> Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true }
})
defineEmits(['wishlist', 'add-to-cart'])

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

/* Image */
.product-card__img {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--neutral-100, #F5F5F5);
}
.product-card__img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.product-card:hover .product-card__img img { transform: scale(1.05); }
.product-card__img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700; color: rgba(255,255,255,0.8);
}

/* Discount Badge */
.product-card__badge {
  position: absolute; top: 8px; left: 8px;
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  padding: 2px 8px;
  border-radius: var(--radius-xs, 4px);
  font-size: var(--text-xs, 12px);
  font-weight: 600;
}

/* Wishlist */
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
}
.product-card:hover .product-card__wishlist { opacity: 1; }
.product-card__wishlist:hover { color: var(--error, #CC0C39); }

/* Body */
.product-card__body { padding: 12px; flex: 1; display: flex; flex-direction: column; }

/* Name */
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

/* Rating */
.product-card__rating {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 6px;
}
.product-card__stars { font-size: 12px; color: #FFA41C; }
.product-card__stars i { margin-right: 1px; }
.product-card__reviews { font-size: var(--text-xs, 12px); color: var(--neutral-500, #888); }

/* Price */
.product-card__price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.product-card__price {
  font-size: var(--text-lg, 18px);
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
}
.product-card__original {
  font-size: var(--text-xs, 12px);
  color: var(--neutral-500, #888);
  text-decoration: line-through;
}

/* Meta */
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
  color: var(--success, #067D62);
  font-weight: 500;
}

/* Seller */
.product-card__seller {
  font-size: var(--text-xs, 12px);
  color: var(--neutral-500, #888);
  margin-top: auto;
  padding-top: 4px;
}

/* Cart Button (desktop hover) */
.product-card__cart-btn {
  margin-top: 8px;
  padding: 8px;
  background: var(--brand-primary-light, #FFF4E6);
  color: var(--brand-primary-hover, #E68A00);
  border: 1px solid var(--brand-primary, #FF9900);
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
  background: var(--brand-primary, #FF9900);
  color: var(--white, #fff);
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
    min-height: 31px; /* 2 lines × 15.6px */
  }
  .product-card__price { font-size: 14px; }
  .product-card__rating { margin-bottom: 4px; }
  .product-card__stars { font-size: 10px; }
  .product-card__seller { display: none; }
  .product-card__cart-btn { display: none; }
  .product-card__wishlist { opacity: 1; width: 28px; height: 28px; font-size: 12px; }
  .product-card__badge { font-size: 10px; padding: 1px 5px; top: 6px; left: 6px; }
}
</style>
