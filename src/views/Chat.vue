<template>
  <div class="chat-page">
    <div class="container">
      <div class="chat-container">
        <div class="chat-sidebar">
          <h3>Conversations</h3>
          <div class="chat-list">
            <div v-for="chat in chats" :key="chat.id" class="chat-item" :class="{ active: activeChat === chat.id }" @click="activeChat = chat.id">
              <div class="chat-avatar">{{ chat.name[0] }}</div>
              <div class="chat-info">
                <h4>{{ chat.name }}</h4>
                <p>{{ chat.lastMessage }}</p>
              </div>
              <span class="chat-time">{{ chat.time }}</span>
            </div>
          </div>
        </div>
        
        <div class="chat-main">
          <div class="chat-header">
            <h3>{{ activeChatData?.name || 'Select a conversation' }}</h3>
          </div>
          
          <div class="chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="empty-chat">
              <p>No messages yet. Start a conversation!</p>
            </div>
            <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.is_own }">
              <div class="message-bubble">
                <p>{{ msg.message }}</p>
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <input v-model="newMessage" type="text" placeholder="Type a message..." @keyup.enter="sendMessage">
            <button @click="sendMessage" :disabled="!newMessage.trim()">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const activeChat = ref(null)
const newMessage = ref('')
const messages = ref([])
const chats = ref([])
const messagesContainer = ref(null)

const activeChatData = computed(() => chats.value.find(c => c.id === activeChat.value))

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadMessages = async () => {
  if (!userStore.supabaseUser || !activeChat.value) return
  
  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userStore.supabaseUser.id},seller_id.eq.${activeChat.value}),and(receiver_id.eq.${userStore.supabaseUser.id},seller_id.eq.${activeChat.value})`)
      .order('created_at')
    
    messages.value = (data || []).map(msg => ({
      ...msg,
      is_own: msg.sender_id === userStore.supabaseUser.id
    }))
    scrollToBottom()
  } catch (e) {
    console.error('Failed to load messages:', e)
  }
}

const loadChats = async () => {
  try {
    const { data: sellers } = await supabase.from('sellers').select('id, name').limit(5)
    chats.value = (sellers || []).map(s => ({
      id: s.id,
      name: s.name,
      lastMessage: 'Click to start chatting',
      time: ''
    }))
    if (chats.value.length > 0) {
      activeChat.value = chats.value[0].id
    }
  } catch (e) {
    console.error('Failed to load chats:', e)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !userStore.supabaseUser || !activeChat.value) return
  
  try {
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: userStore.supabaseUser.id,
      seller_id: activeChat.value,
      message: newMessage.value,
      message_type: 'text'
    })
    
    if (error) throw error
    
    messages.value.push({
      id: Date.now(),
      message: newMessage.value,
      is_own: true,
      created_at: new Date().toISOString()
    })
    newMessage.value = ''
    scrollToBottom()
  } catch (e) {
    console.error('Failed to send message:', e)
    alert('Failed to send message')
  }
}

onMounted(async () => {
  await loadChats()
  if (activeChat.value) {
    await loadMessages()
  }
})

// Watch for active chat changes
import { watch } from 'vue'
watch(activeChat, () => {
  if (activeChat.value) loadMessages()
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.chat-container { display: grid; grid-template-columns: 300px 1fr; height: 600px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.chat-sidebar { border-right: 1px solid #eee; }
.chat-sidebar h3 { padding: 20px; border-bottom: 1px solid #eee; }
.chat-item { display: flex; align-items: center; gap: 12px; padding: 15px 20px; cursor: pointer; border-bottom: 1px solid #f5f5f5; }
.chat-item:hover, .chat-item.active { background: #f8f8f8; }
.chat-avatar { width: 40px; height: 40px; background: #fe2c55; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.chat-info { flex: 1; }
.chat-info h4 { font-size: 14px; margin-bottom: 3px; }
.chat-info p { font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-time { font-size: 11px; color: #999; }
.chat-header { padding: 15px 20px; border-bottom: 1px solid #eee; }
.chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.empty-chat { text-align: center; color: #999; padding: 40px; }
.message { display: flex; }
.message.own { justify-content: flex-end; }
.message-bubble { max-width: 70%; padding: 10px 15px; border-radius: 15px; background: #f0f0f0; }
.message.own .message-bubble { background: #fe2c55; color: #fff; }
.message-time { font-size: 11px; color: #999; margin-top: 5px; display: block; }
.message.own .message-time { color: rgba(255,255,255,0.7); }
.chat-input { display: flex; padding: 15px; border-top: 1px solid #eee; }
.chat-input input { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; }
.chat-input button { width: 40px; height: 40px; background: #fe2c55; color: #fff; border: none; border-radius: 50%; margin-left: 10px; cursor: pointer; }
.chat-input button:disabled { background: #ccc; cursor: not-allowed; }
</style>
