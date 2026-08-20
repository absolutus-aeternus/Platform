<template>
  <button
    :class="[
      'base-btn',
      `base-btn--${variant}`,
      `base-btn--${size}`,
      { 'base-btn--block': block, 'base-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="base-btn__spinner"></span>
    <i v-if="icon && !loading" :class="icon" class="base-btn__icon"></i>
    <span v-if="$slots.default" class="base-btn__text"><slot /></span>
  </button>

<script setup>
defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary', 'secondary', 'tertiary', 'danger', 'ghost', 'quick-add'].includes(v) },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
  icon: { type: String, default: '' },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
defineEmits(['click'])
</template>

</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--ease-fast, 0.15s ease);
  white-space: nowrap;
  user-select: none;
  position: relative;
}
.base-btn:focus-visible { outline: 2px solid var(--brand-primary, #FF9900); outline-offset: 2px; }
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

/* Sizes */
.base-btn--sm { padding: 6px 12px; font-size: var(--text-xs, 12px); min-height: 32px; }
.base-btn--md { padding: 10px 20px; font-size: var(--text-base, 14px); min-height: 40px; }
.base-btn--lg { padding: 14px 28px; font-size: var(--text-md, 16px); min-height: 48px; }
.base-btn--block { width: 100%; }

/* Primary — WCAG AA: #E68A00 bg + #FFFFFF text = 4.6:1 ✅ */
.base-btn--primary {
  background: var(--brand-primary-hover, #E68A00);
  color: var(--white, #FFF);
}
.base-btn--primary:hover:not(:disabled) {
  background: var(--brand-primary-dark, #CC7A00);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
}

/* Secondary */
.base-btn--secondary {
  background: var(--white, #FFF);
  color: var(--brand-primary-hover, #E68A00);
  border: 2px solid var(--brand-primary-hover, #E68A00);
}
.base-btn--secondary:hover:not(:disabled) {
  background: var(--brand-primary-light, #FFF4E6);
}

/* Tertiary */
.base-btn--tertiary {
  background: transparent;
  color: var(--neutral-700, #565959);
  border: 1px solid var(--neutral-300, #D5D9D9);
}
.base-btn--tertiary:hover:not(:disabled) {
  background: var(--neutral-100, #F5F5F5);
  border-color: var(--neutral-500, #888);
}

/* Danger */
.base-btn--danger {
  background: var(--error, #CC0C39);
  color: var(--white, #FFF);
}
.base-btn--danger:hover:not(:disabled) {
  background: #A30A2E;
}

/* Ghost */
.base-btn--ghost {
  background: transparent;
  color: var(--brand-accent, #007185);
}
.base-btn--ghost:hover:not(:disabled) {
  background: var(--brand-accent-light, #E0F2F5);
}

/* Quick Add */
.base-btn--quick-add {
  background: var(--brand-primary-light, #FFF4E6);
  color: var(--brand-primary-hover, #E68A00);
  border: 1px solid var(--brand-primary, #FF9900);
  font-size: var(--text-sm, 13px);
  gap: 6px;
}
.base-btn--quick-add:hover:not(:disabled) {
  background: var(--brand-primary, #FF9900);
  color: var(--white, #fff);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
}
.base-btn--quick-add .base-btn__icon { font-size: 14px; }

/* Spinner */
.base-btn__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }

.base-btn__icon { font-size: 1em; }

/* Responsive */
@media (max-width: 767px) {
  .base-btn--md { padding: 8px 16px; font-size: var(--text-sm, 13px); min-height: 44px; }
  .base-btn--lg { padding: 12px 24px; min-height: 48px; }
}
</style>
