<template>
  <div class="container" style="padding:40px 20px;max-width:800px">
    <h2 style="margin-bottom:24px"><i class="fas fa-headset" style="color:#FF9900"></i> Customer Service</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center">
        <i class="fas fa-comments" style="font-size:36px;color:#FF9900;margin-bottom:12px"></i>
        <h3>Live Chat</h3>
        <p style="color:#666;font-size:14px;margin-bottom:12px">Chat with our support team</p>
        <button class="btn-primary" style="padding:10px 20px;border-radius:8px;border:none;cursor:pointer" @click="openChat"><i class="fas fa-comments"></i> Start Chat</button>
      </div>
      <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center">
        <i class="fas fa-envelope" style="font-size:36px;color:#FF9900;margin-bottom:12px"></i>
        <h3>Email Support</h3>
        <p style="color:#666;font-size:14px;margin-bottom:12px">support@alliancehub.com</p>
        <a href="mailto:support@alliancehub.com" class="btn-primary" style="padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:6px"><i class="fas fa-envelope"></i> Send Email</a>
      </div>
    </div>
    <div style="margin-top:24px;text-align:center">
      <router-link to="/help" style="color:#FF9900;margin-right:20px">Help Center</router-link>
      <router-link to="/complaint" style="color:#fe2c50">File Complaint</router-link>
    </div>
  </div>
</template>
<script setup>
const openChat = () => { const el = document.querySelector('.chat-widget button, [class*="chat-toggle"]'); if (el) el.click() }
</script>
