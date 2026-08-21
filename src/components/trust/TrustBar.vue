<template>
  <div class="trust-bar" :class="{ 'trust-bar--vertical': vertical }">
    <div class="trust-bar__item">
      <i class="fas fa-shield-alt"></i>
      <span>Secure Payment</span>
    </div>
    <div class="trust-bar__item">
      <i class="fas fa-undo"></i>
      <span>{{ returnDays }}-Day Returns</span>
    </div>
    <div class="trust-bar__item" v-if="verified">
      <i class="fas fa-check-circle"></i>
      <span>Verified Sellers</span>
    </div>
    <div class="trust-bar__item" v-if="shipping">
      <i class="fas fa-truck"></i>
      <span>{{ shipping }}</span>
    </div>
  </div>

</template>


<script setup>
defineProps({
  returnDays: { type: Number, default: 7 },
  verified: { type: Boolean, default: true },
  shipping: { type: String, default: '' },
  vertical: { type: Boolean, default: false }
})


</script>

<style scoped>
.trust-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: var(--success-bg, #E6F7F2);
  border: 1px solid var(--success-border, #B2E8D5);
  border-radius: var(--radius-md, 8px);
  font-size: var(--text-sm, 13px);
  color: var(--success, #067D62); /* 4.9:1 on white ✅ WCAG AA */
  flex-wrap: wrap;
}
.trust-bar--vertical { flex-direction: column; align-items: flex-start; gap: 8px; }
.trust-bar__item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.trust-bar__item i { font-size: 14px; }

@media (max-width: 639px) {
  .trust-bar { gap: 8px; padding: 8px 12px; font-size: 11px; flex-direction: column; align-items: flex-start; }
  .trust-bar__item i { font-size: 12px; }
}
</style>
