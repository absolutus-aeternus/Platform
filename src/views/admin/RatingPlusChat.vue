<template>
  <div class="page-wrapper">
  <div class="rplus-chat">
    <div class="page-header">
      <h1>⭐ Rating Plus — Live Chat</h1>
      <p>Respond to Rating Plus member messages in real-time.</p>
    </div>

    <div class="chat-layout">
      <div class="chat-sidebar" :class="{ hidden: !showSidebar && selectedUser }">
        <div class="sidebar-header">
          <input v-model="userSearch" type="text" placeholder="Search users..." class="sidebar-search">
        </div>
        <div class="user-list">
          <div v-for="u in filteredChatters" :key="u.id" class="user-item" :class="{ active: selectedUser?.id === u.id }" @click="selectUser(u)">
            <div class="user-avatar" :style="{ background: getAvatarColor(u.full_name) }">{{ (u.full_name || u.email || '?')[0].toUpperCase() }}</div>
            <div class="user-info">
              <strong>{{ u.full_name || u.email }}</strong>
              <small>{{ u.status }}</small>
            </div>
          </div>
          <div v-if="filteredChatters.length === 0" class="empty-list">No conversations</div>
        </div>
      </div>

      <div class="chat-main">
        <div v-if="!selectedUser" class="no-chat-selected">
          <i class="fas fa-comments"></i>
          <p>Select a user to start chatting</p>
        </div>
        <template v-else>
          <div class="chat-header">
            <button class="header-back" @click="selectedUser = null; showSidebar = true" title="Back"><i class="fas fa-arrow-left"></i></button>
            <div class="chat-user-info">
              <div class="user-avatar" :style="{ background: getAvatarColor(selectedUser.full_name) }">{{ (selectedUser.full_name || '?')[0].toUpperCase() }}</div>
              <div><strong>{{ selectedUser.full_name || selectedUser.email }}</strong><small>{{ selectedUser.status }}</small></div>
            </div>
            <div class="chat-actions">
              <button class="btn-action" @click="approveUser" v-if="selectedUser.status === 'pending'" title="Approve"><i class="fas fa-check"></i></button>
            </div>
          </div>

          <div class="messages-area" ref="messagesRef">
            <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.sender_id === 'admin' }">
              <div class="msg-bubble">{{ msg.message }}</div>
              <div class="msg-time">{{ formatTime(msg.created_at) }}</div>
            </div>
            <div v-if="messages.length === 0" class="empty-messages">No messages yet.</div>
          </div>

          <div class="chat-input-area">
            <input v-model="newMessage" type="text" placeholder="Type a message..." @keyup.enter="sendMessage" class="chat-input">
            <button @click="sendMessage" class="btn-send" :disabled="!newMessage.trim()"><i class="fas fa-paper-plane"></i></button>
          </div>
          </div>
</template>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { fetchRplusUsers, fetchRplusMessages, sendRplusMessage, updateRplusUser } from '@/services/rplus'

const chatters = ref([])
const messages = ref([])
const selectedUser = ref(null)
const newMessage = ref('')
const userSearch = ref('')
const messagesRef = ref(null)
const showSidebar = ref(true)

const filteredChatters = computed(() => {
  if (!userSearch.value) return chatters.value
  const q = userSearch.value.toLowerCase()
  return chatters.value.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
})

const getAvatarColor = (name) => {
  const colors = ['var(--brand-primary, #FF9900)', '#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e', '#e84393', '#00cec9']
  return colors[(name?.charCodeAt(0) || 0) % colors.length]
}

const formatTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const loadChatters = async () => {
  try { chatters.value = await fetchRplusUsers() } catch (e) { console.error('R+ chatters error:', e) }
}

const selectUser = async (user) => {
  selectedUser.value = user
  showSidebar.value = false
  try { messages.value = await fetchRplusMessages(user.id) } catch (e) { messages.value = [] }
  await nextTick()
  if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value) return
  const text = newMessage.value.trim()
  newMessage.value = ''
  try {
    await sendRplusMessage(selectedUser.value.id, text)
    messages.value.push({ id: Date.now(), sender_id: 'admin', message: text, created_at: new Date().toISOString() })
    await nextTick()
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  } catch (e) { window.__toast?.show('Failed to send', 'error') }
}

const approveUser = async () => {
  if (!selectedUser.value) return
  try { await updateRplusUser(selectedUser.value.id, { status: 'approved' }); selectedUser.value.status = 'approved' } catch (e) { window.__toast?.show('Operation failed', 'error') }
}

onMounted(loadChatters)
</script>

<style scoped>
body, html { overflow-x: hidden; }
.rplus-chat { max-width: 1200px; height: calc(100vh - 120px); }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 22px; margin-bottom: 4px; }
.page-header p { color: #666; font-size: 14px; }
.chat-layout { display: grid; grid-template-columns: 320px 1fr; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); height: calc(100% - 80px); }
.chat-sidebar { border-right: 1px solid #f0f0f0; display: flex; flex-direction: column; }
.sidebar-header { padding: 12px; border-bottom: 1px solid #f0f0f0; }
.sidebar-search { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box; }
.sidebar-search:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.user-list { flex: 1; overflow-y: auto; }
.user-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f8f8f8; }
.user-item:hover { background: #f8f8f8; }
.user-item.active { background: #fff8f0; border-left: 3px solid var(--brand-primary, #FF9900); }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-info strong { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-info small { font-size: 11px; color: #999; }
.empty-list { padding: 40px; text-align: center; color: #999; font-size: 13px; }
.chat-main { display: flex; flex-direction: column; }
.no-chat-selected { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ddd; }
.no-chat-selected i { font-size: 48px; margin-bottom: 12px; }
.no-chat-selected p { font-size: 14px; color: #999; }
.chat-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
.chat-user-info { display: flex; align-items: center; gap: 10px; }
.chat-user-info strong { font-size: 14px; }
.chat-user-info small { font-size: 11px; color: #999; }
.btn-action { width: 32px; height: 32px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #666; }
.messages-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.message { display: flex; flex-direction: column; max-width: 70%; }
.message.own { align-self: flex-end; }
.msg-bubble { padding: 8px 12px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
.message:not(.own) .msg-bubble { background: #f0f0f0; color: #333; border-bottom-left-radius: 4px; }
.message.own .msg-bubble { background: var(--brand-primary, #FF9900); color: #fff; border-bottom-right-radius: 4px; }
.msg-time { font-size: 10px; color: #999; margin-top: 2px; }
.message.own .msg-time { text-align: right; }
.empty-messages { text-align: center; color: #999; padding: 40px; font-size: 13px; }
.chat-input-area { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.chat-input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; }
.chat-input:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.btn-send { width: 40px; height: 40px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.btn-send:disabled { background: #ccc; cursor: not-allowed; }
@media (max-width: 768px) {
  .chat-layout { grid-template-columns: 1fr; height: calc(100vh - 10rem); position: relative; }
  .chat-sidebar { position: absolute; inset: 0; z-index: 10; background: #fff; }
  .chat-sidebar.hidden { display: none; }
  .chat-header { padding: 10px 12px; }
  .header-back { display: flex; background: none; border: none; font-size: 18px; color: #333; cursor: pointer; padding: 4px; margin-right: 8px; }
  .messages-area { padding: 12px; }
  .message { max-width: 85%; }
  .chat-input-area { padding: 10px 12px; }
  .chat-input { font-size: 16px; }
}
@media (min-width: 769px) { .header-back { display: none; } }
</style>
