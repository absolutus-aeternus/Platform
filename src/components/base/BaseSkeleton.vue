<template>
  <div
    class="base-skeleton"
    :class="{ 'base-skeleton--animated': animated }"
    :style="skeletonStyle"
    role="presentation"
    aria-hidden="true"
  />

</template>
</div>



<script setup>
import { computed } from 'vue'

/**
 * BaseSkeleton — Placeholder loading element to prevent CLS.
 *
 * @prop {String}  width       — CSS width (default: '100%')
 * @prop {String}  height      — CSS height (default: '20px')
 * @prop {String}  borderRadius — CSS border-radius (default: '4px')
 * @prop {Boolean} animated    — Enable shimmer animation (default: true)
 */
const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  borderRadius: { type: String, default: '4px' },
  animated: { type: Boolean, default: true }
})

const skeletonStyle = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.borderRadius
}))


</script>

<style scoped>
.base-skeleton {
  background: var(--skeleton-base, #e0e0e0);
  position: relative;
  overflow: hidden;
}

/* Shimmer animation — uses design token colors */
.base-skeleton--animated {
  background: linear-gradient(
    90deg,
    var(--skeleton-base, #e0e0e0) 25%,
    var(--skeleton-shine, #f5f5f5) 50%,
    var(--skeleton-base, #e0e0e0) 75%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .base-skeleton--animated {
    animation: none;
    background: var(--skeleton-base, #e0e0e0);
  }
}
</style>
