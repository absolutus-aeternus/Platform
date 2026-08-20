<template><div class="page-wrapper">
  <div class="container" style="padding:40px 20px">
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
<script setup>
const openChat = () => {
  const el = document.querySelector('.chat-toggle')
  if (el) el.click()
}</template>

<script setup>
const openChat = () => {
  const el = document.querySelector('.chat-toggle')
  if (el) el.click()
}
</template>

</script>

<style scoped>
@media (max-width: 768px) {
  div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; gap: 16px !important; }
}
</style>
