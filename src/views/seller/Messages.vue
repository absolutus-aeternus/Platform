<template>
  <div class="page-wrapper">
  <div class="seller-messages">
    <h1>Customer Messages</h1>
    
    <div class="messages-layout">
      <!-- Conversation List -->
      <div class="conv-list" :class="{ hidden: !showSidebar && activeConv }">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="conversations.length === 0" class="empty">No messages</div>
        <div v-else>
          <div v-for="conv in conversations" :key="conv.id" 
               class="conv-item" :class="{ active: activeConv?.id === conv.id }"
               @click="selectConversation(conv)">
            <div class="conv-avatar">{{ conv.customer_email?.[0]?.toUpperCase() || 'C' }}</div>
            <div class="conv-info">
              <span class="conv-name">{{ conv.customer_email || 'Customer' }}</span>
              <p class="conv-preview">{{ conv.lastMessage?.substring(0, 30) || 'No messages' }}</p>
            </div>
            <span v-if="conv.unread" class="unread-dot"></span>
          </div>
        </div>
      </div>
      
      <!-- Chat Area -->
      <div class="chat-area">
        <div v-if="!activeConv" class="no-chat">
          <i class="fas fa-inbox"></i>
          <p>Select a conversation</p>
        </div>
        <template v-else>
          <div class="chat-header">
            <button class="header-back" @click="activeConv = null; showSidebar = true" title="Back"><i class="fas fa-arrow-left"></i></button>
            <h4>{{ activeConv.customer_email || 'Customer' }}</h4>
          </div>
          <div class="messages" ref="messagesRef">
            <div v-for="msg in messages" :key="msg.id" class="msg" :class="{ own: msg.is_own }">
              <div class="msg-bubble">
                <p>{{ msg.message }}</p>
                <div class="msg-footer">
                  <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
                  <span v-if="msg.is_own" class="msg-check" :class="{ read: msg.is_read }">
                    <template v-if="msg.is_read">✓✓  </div>

                    <template v-else>✓  </div>

                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <input v-model="newMessage" placeholder="Type a reply..." @keyup.enter="sendMessage">
            <button @click="sendMessage" :disabled="!newMessage.trim()">Send</button>
          </div>
          </div>
</template>
      </div>
    </div>
  </div>
  </div>
        </template>
        </template>
      </div>
      </div>
      </div>
      </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const loading = ref(true)
const conversations = ref([])
const messages = ref([])
const activeConv = ref(null)
const newMessage = ref('')
const messagesRef = ref(null)
const showSidebar = ref(true)

const formatTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

onMounted(async () => { try {
  if (!userStore.supabaseUser) { loading.value = false; return }
  
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (!seller) { loading.value = false; return }
  
  // Get all messages for this seller
  const { data: msgs } = await supabase
    .from('chat_messages')
    .select('*, users(email)')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false })
  
  // Group by sender
  const convMap = new Map()
  ;(msgs || []).forEach(msg => {
    const senderId = msg.sender_id
    if (!convMap.has(senderId)) {
      convMap.set(senderId, {
        id: senderId,
        customer_email: msg.users?.email || 'Customer',
        lastMessage: msg.message,
        unread: !msg.is_read && msg.sender_id !== userStore.supabaseUser.id
      })
    }
  })
  
  conversations.value = Array.from(convMap.values())
  loading.value = false
} catch (e) { console.error("Messages.vue error:", e) }
})

const selectConversation = async (conv) => {
  activeConv.value = conv
  showSidebar.value = false
  
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (!seller) return
  
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('sender_id', conv.id)
    .order('created_at')
  
  messages.value = (data || []).map(msg => ({
    ...msg,
    is_own: false
  }))
  
  // Also get seller's replies
  const { data: replies } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('receiver_id', conv.id)
    .order('created_at')
  
  messages.value = [...messages.value, ...(replies || []).map(msg => ({
    ...msg,
    is_own: true
  }))].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeConv.value) return
  
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (!seller) return
  
  const text = newMessage.value.trim()
  newMessage.value = ''
  
  await supabase.from('chat_messages').insert({
    sender_id: userStore.supabaseUser.id,
    receiver_id: activeConv.value.id,
    seller_id: seller.id,
    message: text,
    message_type: 'text',
    is_read: false
  })
  
  messages.value.push({
    id: Date.now(),
    message: text,
    is_own: true,
    created_at: new Date().toISOString()
  })
  
  scrollToBottom()
}
</script>

<style scoped>
body, html { overflow-x: hidden; }
h1 { margin-bottom: 25px; }
.messages-layout { display: grid; grid-template-columns: 280px 1fr; height: 60vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.conv-list { border-right: 1px solid #eee; overflow-y: auto; }
.loading, .empty { text-align: center; padding: 30px; color: #999; }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f5f5f5; position: relative; }
.conv-item:hover { background: #f8f8f8; }
.conv-item.active { background: #fff8f0; border-left: 3px solid var(--brand-primary, #FF9900); }
.conv-avatar { width: 35px; height: 35px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.conv-info { flex: 1; min-width: 0; }
.conv-name { font-size: 13px; font-weight: 600; display: block; }
.conv-preview { font-size: 12px; color: #999; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.unread-dot { width: 8px; height: 8px; background: var(--brand-primary, #FF9900); border-radius: 50%; position: absolute; right: 10px; }
.chat-area { display: flex; flex-direction: column; }
.no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.no-chat i { font-size: 40px; margin-bottom: 10px; color: #ddd; }
.chat-header { padding: 15px 20px; border-bottom: 1px solid #eee; }
.chat-header h4 { margin: 0; font-size: 14px; }
.messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
.msg { display: flex; max-width: 75%; }
.msg.own { align-self: flex-end; }
.msg-bubble { padding: 8px 12px; border-radius: 12px; background: #f0f0f0; }
.msg.own .msg-bubble { background: var(--brand-primary, #FF9900); color: #fff; }
.msg-bubble p { margin: 0 0 3px; font-size: 13px; }
.msg-time { font-size: 10px; color: #999; }
.msg.own .msg-time { color: rgba(255,255,255,0.7); }
.msg-footer { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.msg-check { font-size: 11px; color: #999; letter-spacing: -2px; }
.msg-check.read { color: #4fc3f7; }
.msg.own .msg-check { color: rgba(255,255,255,0.6); }
.msg.own .msg-check.read { color: #4fc3f7; }
.chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; }
.chat-input input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
.chat-input button { padding: 8px 15px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.chat-input button:disabled { background: #ccc; }

@media (max-width: 768px) {
  h1 { font-size: 1.25rem; margin-bottom: 16px; }
  .messages-layout { grid-template-columns: 1fr; height: calc(100dvh - 10rem); position: relative; }
  .conv-list { position: absolute; inset: 0; z-index: 10; background: #fff; }
  .conv-list.hidden { display: none; }
  .chat-header { padding: 12px 15px; }
  .header-back { display: flex; background: none; border: none; font-size: 18px; color: #333; cursor: pointer; padding: 4px; margin-right: 8px; }
  .messages { padding: 12px; }
  .msg { max-width: 85%; }
  .chat-input { padding: 10px 12px; }
  .chat-input input { font-size: 16px; }
}
@media (min-width: 769px) { .header-back { display: none; } }
@media (max-width: 480px) {
  .conv-item { padding: 10px 12px; }
  .conv-avatar { width: 30px; height: 30px; font-size: 12px; }
  .conv-name { font-size: 12px; }
  .conv-preview { font-size: 11px; }
}
</style>
