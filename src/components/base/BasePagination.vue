<template>
  <nav class="base-pagination" v-if="totalPages > 1" aria-label="Pagination">
    <button
      class="base-pagination__btn"
      :disabled="modelValue <= 1"
      @click="$emit('update:modelValue', modelValue - 1)"
      aria-label="Previous page"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="base-pagination__dots">...</span>
      <button
        v-else
        class="base-pagination__btn"
        :class="{ 'base-pagination__btn--active': page === modelValue }"
        @click="$emit('update:modelValue', page)"
        :aria-current="page === modelValue ? 'page' : undefined"
      >
        {{ page }}
      </button>
        </template>
</nav>
</div>
    

    <button
      class="base-pagination__btn"
      :disabled="modelValue >= totalPages"
      @click="$emit('update:modelValue', modelValue + 1)"
      aria-label="Next page"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </nav>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  total: { type: Number, required: true },
  perPage: { type: Number, default: 20 },
  siblingCount: { type: Number, default: 1 }
})
defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

const visiblePages = computed(() => {
  const current = props.modelValue
  const total = totalPages.value
  const sibling = props.siblingCount
  const pages = []

  // Always show first page
  pages.push(1)

  const start = Math.max(2, current - sibling)
  const end = Math.min(total - 1, current + sibling)

  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')

  // Always show last page
  if (total > 1) pages.push(total)

  return pages
})
</script>

<style scoped>
.base-pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  padding: 16px 0;
}
.base-pagination__btn {
  min-width: 36px; height: 36px;
  padding: 0 8px;
  border: 1px solid var(--neutral-300, #D5D9D9);
  border-radius: var(--radius-md, 8px);
  background: var(--white, #fff);
  color: var(--neutral-700, #565959);
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--ease-fast, 0.15s ease);
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.base-pagination__btn:hover:not(:disabled):not(.base-pagination__btn--active) {
  border-color: var(--brand-accent, #007185);
  color: var(--brand-accent, #007185);
}
.base-pagination__btn--active {
  background: var(--brand-accent, #007185);
  color: var(--white, #fff);
  border-color: var(--brand-accent, #007185);
}
.base-pagination__btn:disabled {
  opacity: 0.4; cursor: not-allowed;
}
.base-pagination__dots {
  padding: 0 4px;
  color: var(--neutral-500, #888);
  font-size: var(--text-sm, 13px);
}

@media (max-width: 639px) {
  .base-pagination__btn { min-width: 32px; height: 32px; font-size: 12px; }
  .base-pagination { gap: 2px; }
}
</style>
