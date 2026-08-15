<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="global-toast" :class="type">
        <i :class="icon"></i>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { ref, computed } from 'vue'
const visible = ref(false)
const message = ref('')
const type = ref('success')
const icon = computed(() => ({
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle'
}[type.value]))

let timer = null
const show = (msg, t = 'success', duration = 3000) => {
  message.value = msg
  type.value = t
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => visible.value = false, duration)
}

defineExpose({ show })
</script>
<style scoped>
.global-toast { position: fixed; top: 80px; right: 20px; z-index: 99999; padding: 14px 24px; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); max-width: 400px; }
.global-toast.success { background: linear-gradient(135deg, #28a745, #20c997); }
.global-toast.error { background: linear-gradient(135deg, #dc3545, #ff6b81); }
.global-toast.warning { background: linear-gradient(135deg, #ffc107, #fd7e14); }
.global-toast.info { background: linear-gradient(135deg, #17a2b8, #6f42c1); }
.toast-enter-active { animation: slideInRight 0.3s ease; }
.toast-leave-active { animation: slideOutRight 0.3s ease; }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
</style>
