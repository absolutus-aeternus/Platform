<template>
  <span class="verified-badge" :class="`verified-badge--${size}`" :title="tooltip">
    <span class="verified-badge__icon">✓</span>
    <span v-if="showLabel" class="verified-badge__label">Verified</span>
  </span>

</template>


<script setup>
defineProps({
  size: { type: String, default: 'sm', validator: v => ['sm', 'md', 'lg'].includes(v) },
  showLabel: { type: Boolean, default: true },
  tooltip: { type: String, default: 'Verified seller' }
})


</script>

<style scoped>
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.verified-badge__icon {
  background: var(--brand-accent, #007185);
  color: var(--white, #fff);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
}
.verified-badge__label {
  color: var(--brand-accent, #007185); /* 4.7:1 on white ✅ WCAG AA */
}
/* Sizes */
.verified-badge--sm { font-size: 12px; }
.verified-badge--sm .verified-badge__icon { width: 14px; height: 14px; font-size: 9px; }
.verified-badge--md { font-size: 13px; }
.verified-badge--md .verified-badge__icon { width: 18px; height: 18px; font-size: 11px; }
.verified-badge--lg { font-size: 15px; }
.verified-badge--lg .verified-badge__icon { width: 22px; height: 22px; font-size: 13px; }
</style>
