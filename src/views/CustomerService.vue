<template>
  <div class="container" style="padding:40px 20px">
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-shimmer skeleton-title"></div>
      <div class="skeleton-grid">
        <div class="skeleton-shimmer skeleton-card"></div>
        <div class="skeleton-shimmer skeleton-card"></div>
        <div class="skeleton-shimmer skeleton-card"></div>
        <div class="skeleton-shimmer skeleton-card"></div>
      </div>
    </div>
    <div v-else>
    <h2 style="margin-bottom:24px"><i class="fas fa-headset"></i> Customer Service</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0;text-align:center">
        <i class="fas fa-comments" style="font-size:48px;color:#ff6b35;margin-bottom:16px"></i>
        <h3>Live Chat</h3>
        <p style="color:#64748b;margin-bottom:16px">Chat with our support team 24/7</p>
        <button class="btn btn-primary" @click="openChat"><i class="fas fa-comments"></i> Start Chat</button>
      </div>
      <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0;text-align:center">
        <i class="fas fa-envelope" style="font-size:48px;color:#ff6b35;margin-bottom:16px"></i>
        <h3>Email Support</h3>
        <p style="color:#64748b;margin-bottom:16px">support@alliancehub.com</p>
        <a href="mailto:support@alliancehub.com" class="btn btn-secondary"><i class="fas fa-envelope"></i> Send Email</a>
      </div>
      <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0;text-align:center">
        <i class="fas fa-question-circle" style="font-size:48px;color:#ff6b35;margin-bottom:16px"></i>
        <h3>FAQ</h3>
        <p style="color:#64748b;margin-bottom:16px">Find answers to common questions</p>
        <router-link to="/help" class="btn btn-secondary"><i class="fas fa-book"></i> View FAQ</router-link>
      </div>
      <div style="background:white;padding:32px;border-radius:16px;border:1px solid #e2e8f0;text-align:center">
        <i class="fas fa-exclamation-triangle" style="font-size:48px;color:#ff6b35;margin-bottom:16px"></i>
        <h3>File Complaint</h3>
        <p style="color:#64748b;margin-bottom:16px">Report an issue</p>
        <router-link to="/complaint" class="btn btn-secondary"><i class="fas fa-edit"></i> File Complaint</router-link>
      </div>
    </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
const loading = ref(true)
onMounted(() => { loading.value = false })

const openChat = () => {
  const el = document.querySelector('.chat-toggle')
  if (el) el.click()
}
</script>
<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
}
.skeleton-wrapper { padding: 0; }
.skeleton-title { height: 28px; width: 200px; border-radius: 6px; margin-bottom: 24px; }
.skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.skeleton-card { height: 200px; border-radius: 16px; }
.skeleton-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
