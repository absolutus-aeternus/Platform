<template>
  <div class="container" style="padding:40px 20px;max-width:800px">
    <h1 style="margin-bottom:30px"><i class="fas fa-envelope" style="color:#FF9900"></i> Contact Us</h1>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
      <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center">
        <i class="fas fa-comments" style="font-size:36px;color:#FF9900;margin-bottom:12px"></i>
        <h3>Live Chat</h3>
        <p style="color:#666;font-size:14px;margin-bottom:12px">Available 24/7</p>
        <button class="btn-primary" style="padding:10px 20px;border-radius:8px;border:none;cursor:pointer" @click="openChat"><i class="fas fa-comments"></i> Start Chat</button>
      </div>
      <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center">
        <i class="fas fa-envelope" style="font-size:36px;color:#FF9900;margin-bottom:12px"></i>
        <h3>Email</h3>
        <p style="color:#666;font-size:14px;margin-bottom:12px">support@alliancehub.com</p>
        <a href="mailto:support@alliancehub.com" class="btn-primary" style="padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:6px"><i class="fas fa-envelope"></i> Send Email</a>
      </div>
    </div>
    <div style="background:#fff;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <h3 style="margin-bottom:16px">Send us a message</h3>
      <form @submit.prevent="sendMessage">
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Name</label><input v-model="form.name" class="form-input" required></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Email</label><input v-model="form.email" type="email" class="form-input" required></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Subject</label><input v-model="form.subject" class="form-input" required></div>
        <div style="margin-bottom:16px"><label style="display:block;margin-bottom:6px;font-weight:500;font-size:14px">Message</label><textarea v-model="form.message" rows="5" class="form-input" required></textarea></div>
        <button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> Send Message</button>
      </form>
      <p v-if="sent" style="color:#28a745;text-align:center;margin-top:16px"><i class="fas fa-check-circle"></i> Message sent successfully!</p>
    </div>
  </div>

<!-- Loading State -->
<div v-if="loading" class="empty-state"><div class="loading-spinner"></div><p>Loading...</p></div>
</template>
<script setup>
import { ref } from "vue"
const loading = ref(false)
const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const openChat = () => { const el = document.querySelector('.chat-widget button, [class*="chat-toggle"]'); if (el) el.click() }
const sendMessage = () => { sent.value = true; form.value = { name: '', email: '', subject: '', message: '' }; setTimeout(() => sent.value = false, 3000) }
</script>
