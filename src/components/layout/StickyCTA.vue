<template>
  <div class="sticky-cta" v-if="visible">
    <div class="sticky-cta__price" v-if="price">
      <span class="sticky-cta__price-value">${{ price }}</span>
      <span v-if="originalPrice" class="sticky-cta__price-original">${{ originalPrice }}</span>
    </div>
    <div class="sticky-cta__actions">
      <button class="sticky-cta__btn sticky-cta__btn--chat" @click="$emit('chat')" aria-label="Chat seller">
        <i class="fas fa-comment-dots"></i>
      </button>
      <button class="sticky-cta__btn sticky-cta__btn--cart" @click="$emit('add-to-cart')">
        <i class="fas fa-shopping-cart"></i> Cart
      </button>
      <button class="sticky-cta__btn sticky-cta__btn--buy" @click="$emit('buy-now')">
        Buy Now
      </button>
    </div>
  </div>

</template>


<script setup>
defineProps({
  visible: { type: Boolean, default: true },
  price: { type: [Number, String], default: '' },
  originalPrice: { type: [Number, String], default: '' }
})
defineEmits(['chat', 'add-to-cart', 'buy-now'])


</script>

<style scoped>
.sticky-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--cta-bar-height, 64px);
  background: var(--white, #fff);
  border-top: 1px solid var(--neutral-200, #E7E7E7);
  display: flex;
  align-items: center;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0));
  gap: 8px;
  z-index: var(--z-sticky-cta, 250);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}

.sticky-cta__price {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-width: 100px;
}
.sticky-cta__price-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
  line-height: 1.2;
}
.sticky-cta__price-original {
  font-size: 11px;
  color: var(--text-muted-safe, #767676); /* WCAG AA: 4.5:1 on white */
  text-decoration: line-through;
}

.sticky-cta__actions {
  flex: 1;
  display: flex;
  gap: 6px;
  align-items: center;
}

.sticky-cta__btn {
  border: none;
  border-radius: var(--radius-md, 8px);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--ease-fast, 0.15s ease);
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.sticky-cta__btn:active { transform: scale(0.97); }

.sticky-cta__btn--chat {
  flex: 0 0 44px;
  height: 44px;
  background: var(--neutral-100, #F5F5F5);
  color: var(--neutral-700, #565959);
  border: 1px solid var(--neutral-300, #D5D9D9);
  font-size: 16px;
}

.sticky-cta__btn--cart {
  flex: 1;
  height: 44px;
  background: var(--white, #fff);
  color: var(--brand-primary-hover, #E68A00);
  border: 2px solid var(--brand-primary-hover, #E68A00);
  font-size: 13px;
}

.sticky-cta__btn--buy {
  flex: 1;
  height: 44px;
  background: var(--brand-primary-hover, #E68A00);
  color: var(--white, #fff);
  font-size: 13px;
}
.sticky-cta__btn--buy:hover {
  background: var(--brand-primary-dark, #CC7A00);
}

/* Hide on tablet+ */
@media (min-width: 768px) {
  .sticky-cta { display: none; }
}
</style>
