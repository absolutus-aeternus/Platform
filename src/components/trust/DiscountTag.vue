<template>
  <span class="discount-tag" :class="`discount-tag--${size}`">
    -{{ percentage }}%
  </span>

</template>


<script setup>
defineProps({
  percentage: { type: [Number, String], required: true },
  size: { type: String, default: 'sm', validator: v => ['sm', 'md', 'lg'].includes(v) }
})


</script>

<style scoped>
.discount-tag {
  display: inline-flex;
  align-items: center;
  background: var(--error, #CC0C39);
  color: var(--white, #fff);
  font-weight: 600;
  border-radius: var(--radius-xs, 4px);
  white-space: nowrap;
}
.discount-tag--sm { font-size: 10px; padding: 1px 5px; }
.discount-tag--md { font-size: 12px; padding: 2px 8px; }
.discount-tag--lg { font-size: 14px; padding: 4px 10px; }
</style>
