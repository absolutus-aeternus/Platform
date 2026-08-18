<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="base-modal__backdrop" @click.self="closeOnBackdrop && $emit('update:modelValue', false)">
        <div class="base-modal" :class="[`base-modal--${size}`, { 'base-modal--fullscreen': fullscreen }]" role="dialog" :aria-label="title" aria-modal="true">
          <div class="base-modal__header" v-if="title || $slots.header || closable">
            <slot name="header">
              <h3 class="base-modal__title">{{ title }}</h3>
            </slot>
            <button v-if="closable" class="base-modal__close" @click="$emit('update:modelValue', false)" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="base-modal__body">
            <slot />
          </div>
          <div class="base-modal__footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg', 'xl'].includes(v) },
  closable: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  fullscreen: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.base-modal__backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 800;
  padding: 16px;
}
.base-modal {
  background: var(--white, #fff);
  border-radius: var(--radius-xl, 16px);
  width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl, 0 16px 48px rgba(0,0,0,0.16));
}
.base-modal--sm { max-width: 400px; }
.base-modal--md { max-width: 500px; }
.base-modal--lg { max-width: 700px; }
.base-modal--xl { max-width: 900px; }

.base-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0;
}
.base-modal__title {
  margin: 0; font-size: var(--text-lg, 18px); font-weight: 600;
}
.base-modal__close {
  background: none; border: none;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; cursor: pointer;
  color: var(--neutral-500, #888);
  transition: all var(--ease-fast, 0.15s ease);
}
.base-modal__close:hover { background: var(--neutral-100, #F5F5F5); color: var(--neutral-900, #0F1111); }

.base-modal__body {
  padding: 20px 24px;
  overflow-y: auto; flex: 1;
}
.base-modal__footer {
  padding: 0 24px 20px;
  display: flex; justify-content: flex-end; gap: 8px;
}

/* Mobile fullscreen */
@media (max-width: 639px) {
  .base-modal__backdrop { padding: 0; align-items: flex-end; }
  .base-modal {
    border-radius: var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0;
    max-height: 90vh;
    width: 100%;
    max-width: 100%;
  }
  .base-modal--fullscreen {
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
}

/* Transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .base-modal { animation: modal-slide-up 0.3s ease; }
.modal-leave-active .base-modal { animation: modal-slide-down 0.2s ease; }
@keyframes modal-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes modal-slide-down { from { transform: translateY(0); opacity: 1; } to { transform: translateY(20px); opacity: 0; } }
</style>
