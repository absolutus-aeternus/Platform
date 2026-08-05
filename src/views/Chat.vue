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
          
          <div class="chat-messages">
            <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.own }">
              <div class="message-bubble">
                <p>{{ msg.text }}</p>
                <span class="message-time">{{ msg.time }}</span>
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <input v-model="newMessage" type="text" placeholder="Type a message..." @keyup.enter="sendMessage">
            <button @click="sendMessage">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeChat = ref(1)
const newMessage = ref('')

const chats = ref([
  { id: 1, name: 'Dw專賣', lastMessage: 'How can I help you?', time: '10:30' },
  { id: 2, name: 'Customer Service', lastMessage: 'Welcome to TikTok Shop!', time: '09:15' },
])

const messages = ref([
  { id: 1, text: 'Hello! How can I help you today?', time: '10:30', own: false },
  { id: 2, text: 'I have a question about my order', time: '10:31', own: true },
  { id: 3, text: 'Sure! Please provide your order number', time: '10:32', own: false },
])

const activeChatData = computed(() => chats.value.find(c => c.id === activeChat.value))

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    own: true
  })
  newMessage.value = ''
}
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
.message { display: flex; }
.message.own { justify-content: flex-end; }
.message-bubble { max-width: 70%; padding: 10px 15px; border-radius: 15px; background: #f0f0f0; }
.message.own .message-bubble { background: #fe2c55; color: #fff; }
.message-time { font-size: 11px; color: #999; margin-top: 5px; display: block; }
.message.own .message-time { color: rgba(255,255,255,0.7); }
.chat-input { display: flex; padding: 15px; border-top: 1px solid #eee; }
.chat-input input { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; }
.chat-input button { width: 40px; height: 40px; background: #fe2c55; color: #fff; border: none; border-radius: 50%; margin-left: 10px; cursor: pointer; }
</style>
