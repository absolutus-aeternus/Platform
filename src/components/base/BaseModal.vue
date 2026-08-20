<template>
  <Teleport to="body">
    <Transition :name="transitionName">
      <div v-if="modelValue" class="base-modal__backdrop" :class="[`base-modal__backdrop--${position}`]" @click.self="closeOnBackdrop && $emit('update:modelValue', false)">
        <div class="base-modal" :class="modalClasses" role="dialog" :aria-label="title" aria-modal="true">
          <!-- Drag handle for bottom-sheet -->
          <div v-if="position === 'bottom'" class="base-modal__drag-handle" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <span class="base-modal__drag-bar"></span>
          </div>
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

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg', 'fullscreen'].includes(v) },
  position: { type: String, default: 'center', validator: v => ['center', 'bottom', 'fullscreen'].includes(v) },
  closable: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue'])

const modalClasses = computed(() => [
  `base-modal--${props.size}`,
  `base-modal--pos-${props.position}`,
  { 'base-modal--fullscreen': props.position === 'fullscreen' || props.size === 'fullscreen' }
])

const transitionName = computed(() => {
  if (props.position === 'bottom') return 'modal-bottom'
  if (props.position === 'fullscreen') return 'modal-fullscreen'
  return 'modal'
})

// Touch-to-dismiss for bottom sheet
const touchStartY = ref(0)
const touchDeltaY = ref(0)

function onTouchStart(e) {
  touchStartY.value = e.touches[0].clientY
  touchDeltaY.value = 0
}
function onTouchMove(e) {
  touchDeltaY.value = e.touches[0].clientY - touchStartY.value
}
function onTouchEnd() {
  if (touchDeltaY.value > 80) {
    emit('update:modelValue', false)
  }
}
</template>

</script>

<style scoped>
.base-modal__backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 800;
  padding: 16px;
}
.base-modal__backdrop--bottom {
  align-items: flex-end;
  padding: 0;
}
.base-modal__backdrop--fullscreen {
  padding: 0;
}

.base-modal {
  background: var(--white, #fff);
  border-radius: var(--radius-xl, 16px);
  width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow-xl, 0 16px 48px rgba(0,0,0,0.16));
  overflow: hidden;
}
.base-modal--sm { max-width: 400px; }
.base-modal--md { max-width: 500px; }
.base-modal--lg { max-width: 700px; }
.base-modal--fullscreen {
  max-width: 100%;
  max-height: 100dvh;
  height: 100dvh;
  border-radius: 0;
}

/* Bottom-sheet position */
.base-modal--pos-bottom {
  border-radius: var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0;
  max-height: 85vh;
  width: 100%;
  max-width: 100%;
}

/* Drag handle */
.base-modal__drag-handle {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
}
.base-modal__drag-handle:active { cursor: grabbing; }
.base-modal__drag-bar {
  width: 36px; height: 4px;
  background: var(--neutral-300, #D5D9D9);
  border-radius: 2px;
}

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
  -webkit-overflow-scrolling: touch;
}
.base-modal__footer {
  padding: 0 24px 20px;
  display: flex; justify-content: flex-end; gap: 8px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
}

/* ── Transitions ── */

/* Center modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .base-modal { animation: modal-slide-up 0.3s ease; }
.modal-leave-active .base-modal { animation: modal-slide-down 0.2s ease; }
@keyframes modal-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes modal-slide-down { from { transform: translateY(0); opacity: 1; } to { transform: translateY(20px); opacity: 0; } }

/* Bottom-sheet slide-up */
.modal-bottom-enter-active, .modal-bottom-leave-active { transition: opacity 0.25s ease; }
.modal-bottom-enter-from, .modal-bottom-leave-to { opacity: 0; }
.modal-bottom-enter-active .base-modal { animation: sheet-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.modal-bottom-leave-active .base-modal { animation: sheet-slide-down 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
@keyframes sheet-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes sheet-slide-down { from { transform: translateY(0); } to { transform: translateY(100%); } }

/* Fullscreen */
.modal-fullscreen-enter-active, .modal-fullscreen-leave-active { transition: opacity 0.2s ease; }
.modal-fullscreen-enter-from, .modal-fullscreen-leave-to { opacity: 0; }
.modal-fullscreen-enter-active .base-modal { animation: modal-fade-in 0.25s ease; }
.modal-fullscreen-leave-active .base-modal { animation: modal-fade-out 0.2s ease; }
@keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes modal-fade-out { from { opacity: 1; } to { opacity: 0; } }

/* Mobile responsive */
@media (max-width: 639px) {
  .base-modal__backdrop { padding: 0; }
  .base-modal:not(.base-modal--pos-bottom):not(.base-modal--fullscreen) {
    border-radius: var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0;
    max-height: 90vh;
    width: 100%;
    max-width: 100%;
    align-self: flex-end;
  }
}
</style>
