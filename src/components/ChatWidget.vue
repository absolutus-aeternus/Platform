<template>
  <div class="chat-widget" v-if="userStore.isLoggedIn">
    <!-- Floating Chat Button -->
    <button class="chat-fab" @click="isOpen = !isOpen" :class="{ open: isOpen }">
      <i class="fas fa-comments"></i>
      <span v-if="unreadCount" class="unread-badge">{{ unreadCount }}</span>
    </button>
    
    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window">
      <div class="chat-window-header">
        <h4>{{ sellerName || 'Chat with Seller' }}</h4>
        <button @click="isOpen = false" class="close-btn"><i class="fas fa-times"></i></button>
      </div>
      
      <div class="chat-window-messages" ref="messagesRef">
        <div v-if="messages.length === 0" class="empty-msg">
          <p>Start a conversation!</p>
        </div>
        <div v-for="msg in messages" :key="msg.id" class="msg" :class="{ own: msg.is_own }">
          <div class="msg-bubble">
            <p>{{ msg.message }}</p>
            <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
          </div>
        </div>
      </div>
      
      <div class="chat-window-input">
        <input v-model="newMessage" placeholder="Type a message..." @keyup.enter="sendMessage">
        <button @click="sendMessage" :disabled="!newMessage.trim()">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const props = defineProps({
  sellerId: { type: String, default: null },
  sellerName: { type: String, default: null }
})

const userStore = useUserStore()
const isOpen = ref(false)
const messages = ref([])
const newMessage = ref('')
const unreadCount = ref(0)
const messagesRef = ref(null)

let subscription = null
let pollInterval = null

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const loadMessages = async () => {
  if (!userStore.supabaseUser || !props.sellerId) return
  
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .or(`and(sender_id.eq.${userStore.supabaseUser.id},seller_id.eq.${props.sellerId}),and(receiver_id.eq.${userStore.supabaseUser.id},seller_id.eq.${props.sellerId})`)
    .order('created_at')
    .limit(50)
  
  messages.value = (data || []).map(msg => ({
    ...msg,
    is_own: msg.sender_id === userStore.supabaseUser.id
  }))
  
  // Count unread
  unreadCount.value = messages.value.filter(m => !m.is_own && !m.is_read).length
  
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !userStore.supabaseUser || !props.sellerId) return
  
  const text = newMessage.value.trim()
  newMessage.value = ''
  
  const { error } = await supabase.from('chat_messages').insert({
    sender_id: userStore.supabaseUser.id,
    receiver_id: props.sellerId,
    seller_id: props.sellerId,
    message: text,
    message_type: 'text',
    is_read: false
  })
  
  if (!error) {
    messages.value.push({
      id: Date.now(),
      message: text,
      is_own: true,
      created_at: new Date().toISOString()
    })
    scrollToBottom()
  }
}

// Real-time updates
const setupRealtime = () => {
  if (!userStore.supabaseUser) return
  
  subscription = supabase
    .channel('chat-widget')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `receiver_id=eq.${userStore.supabaseUser.id}`
    }, (payload) => {
      const newMsg = payload.new
      if (newMsg.seller_id === props.sellerId) {
        messages.value.push({
          ...newMsg,
          is_own: false
        })
        if (!isOpen.value) unreadCount.value++
        scrollToBottom()
        
        // Mark as read if open
        if (isOpen.value) {
          supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id)
        }
      }
    })
    .subscribe()
}

watch(isOpen, (val) => {
  if (val && unreadCount.value > 0) {
    // Mark all as read
    supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('seller_id', props.sellerId)
      .eq('receiver_id', userStore.supabaseUser.id)
      .eq('is_read', false)
    unreadCount.value = 0
  }
})

onMounted(() => {
  if (props.sellerId) {
    loadMessages()
    setupRealtime()
    pollInterval = setInterval(loadMessages, 10000)
  }
})

onUnmounted(() => {
  if (subscription) subscription.unsubscribe()
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 1000; }
.chat-fab { width: 56px; height: 56px; background: #fe2c55; color: #fff; border: none; border-radius: 50%; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(254,44,85,0.4); position: relative; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
.chat-fab:hover { transform: scale(1.1); }
.chat-fab.open { background: #333; }
.unread-badge { position: absolute; top: -5px; right: -5px; background: #fff; color: #fe2c55; font-size: 11px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.chat-window { position: absolute; bottom: 70px; right: 0; width: 350px; height: 450px; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; }
.chat-window-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background: #fe2c55; color: #fff; }
.chat-window-header h4 { margin: 0; font-size: 15px; }
.close-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; }
.chat-window-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
.empty-msg { text-align: center; color: #999; padding: 30px; }
.msg { display: flex; max-width: 80%; }
.msg.own { align-self: flex-end; }
.msg-bubble { padding: 8px 12px; border-radius: 12px; background: #f0f0f0; }
.msg.own .msg-bubble { background: #fe2c55; color: #fff; }
.msg-bubble p { margin: 0 0 3px; font-size: 13px; }
.msg-time { font-size: 10px; color: #999; }
.msg.own .msg-time { color: rgba(255,255,255,0.7); }
.chat-window-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; }
.chat-window-input input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; }
.chat-window-input input:focus { outline: none; border-color: #fe2c55; }
.chat-window-input button { width: 36px; height: 36px; background: #fe2c55; color: #fff; border: none; border-radius: 50%; cursor: pointer; }
.chat-window-input button:disabled { background: #ccc; }
</style>
