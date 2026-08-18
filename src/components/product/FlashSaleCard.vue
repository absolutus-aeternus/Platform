<template>
  <div class="flash-card" @click="$router.push(`/product/${product.id}`)">
    <div class="flash-card__img">
      <img
        v-if="product.images?.[0] || product.image"
        :src="product.images?.[0] || product.image"
        :alt="product.name"
        loading="lazy"
      />
      <div v-else class="flash-card__placeholder" :style="{ background: gradient }">
        <span>{{ (product.name || '?')[0] }}</span>
      </div>
      <span class="flash-card__discount">-{{ product.discount || 30 }}%</span>
    </div>
    <div class="flash-card__info">
      <div class="flash-card__price">${{ product.price }}</div>
      <div v-if="product.original_price" class="flash-card__original">${{ product.original_price }}</div>
      <div class="flash-card__sold-bar">
        <div class="flash-card__bar-fill" :style="{ width: soldPercent + '%' }"></div>
        <span class="flash-card__sold-text">Sold {{ formatSales(product.sales_count) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true }
})

const gradient = computed(() => {
  const name = props.product.name || 'P'
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = hash % 360
  return `linear-gradient(135deg, hsl(${hue}, 60%, 65%), hsl(${(hue + 40) % 360}, 50%, 55%))`
})

const soldPercent = computed(() => {
  const sold = props.product.sales_count || 0
  return Math.min(100, (sold / (sold + 50)) * 100)
})

function formatSales(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
</script>

<style scoped>
.flash-card {
  min-width: 140px;
  max-width: 200px;
  background: var(--white, #fff);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--ease-normal, 0.2s ease);
  flex-shrink: 0;
  border: 1px solid var(--neutral-200, #E7E7E7);
}
.flash-card:hover {
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
  transform: translateY(-2px);
}

.flash-card__img {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--neutral-100, #F5F5F5);
}
.flash-card__img img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.flash-card__placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 700; color: rgba(255,255,255,0.8);
}
.flash-card__discount {
  position: absolute; top: 6px; left: 6px;
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  padding: 2px 6px;
  border-radius: var(--radius-xs, 4px);
  font-size: 11px;
  font-weight: 700;
}

.flash-card__info { padding: 8px; }
.flash-card__price {
  font-size: var(--text-md, 16px);
  font-weight: 700;
  color: var(--neutral-900, #0F1111);
}
.flash-card__original {
  font-size: var(--text-xs, 12px);
  color: var(--neutral-500, #888);
  text-decoration: line-through;
  margin-top: 2px;
}
.flash-card__sold-bar {
  margin-top: 6px;
  height: 14px;
  background: var(--error-bg, #FEE2E9);
  border-radius: 7px;
  overflow: hidden;
  position: relative;
}
.flash-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--error, #CC0C39), #FF6B8A);
  border-radius: 7px;
  transition: width 0.5s ease;
}
.flash-card__sold-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--white, #fff);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  white-space: nowrap;
}

@media (max-width: 639px) {
  .flash-card { min-width: 120px; max-width: 160px; }
  .flash-card__info { padding: 6px; }
  .flash-card__price { font-size: 14px; }
}
</style>
