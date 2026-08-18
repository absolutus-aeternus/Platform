<template>
  <div class="chat-page">
    <div class="container">
      <div class="chat-container">
        <!-- Sidebar -->
        <div class="chat-sidebar" :class="{ hidden: !showSidebar && activeConv }">
          <div class="sidebar-header">
            <h3>Messages</h3>
            <span class="unread-badge" v-if="unreadCount">{{ unreadCount }}</span>
          </div>
          <div class="search-box">
            <input v-model="searchQuery" placeholder="Search conversations...">
          </div>
          <div class="conversation-list">
            <div v-if="loading" class="loading">Loading...</div>
            <div v-else-if="conversations.length === 0" class="empty">No conversations yet</div>
            <div v-else>
              <div v-for="conv in filteredConversations" :key="conv.id"
                   class="conversation-item"
                   :class="{ active: activeConv?.id === conv.id, unread: conv.unread }"
                   @click="selectConversation(conv)">
                <div class="conv-avatar">{{ (conv.name || '?')[0]?.toUpperCase() || '?' }}</div>
                <div class="conv-info">
                  <div class="conv-header">
                    <span class="conv-name">{{ conv.name }}</span>
                    <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
                  </div>
                  <p class="conv-preview">{{ conv.lastMessage?.substring(0, 40) || 'No messages' }}...</p>
                </div>
                <span v-if="conv.unread" class="unread-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Chat -->
        <div class="chat-main">
          <div v-if="!activeConv" class="no-chat">
            <i class="fas fa-comments"></i>
            <p>Select a conversation to start chatting</p>
          </div>

          <template v-else>
            <!-- Chat Header -->
            <div class="chat-header">
              <button class="header-back" @click="activeConv = null; showSidebar = true" title="Back"><i class="fas fa-arrow-left"></i></button>
              <div class="header-avatar">{{ (activeConv.name || '?')[0]?.toUpperCase() || '?' }}</div>
              <div class="header-info">
                <h4>{{ activeConv.name }}</h4>
                <span class="online-status" :class="connectionStatus">{{ connectionLabel }}</span>
              </div>
              <div class="header-actions">
                <button @click="refreshMessages" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              </div>
            </div>

            <!-- Bug #4: Connection status banner -->
            <div v-if="connectionStatus === 'disconnected'" class="connection-banner disconnected">
              <i class="fas fa-exclamation-triangle"></i>
              Connection lost. Messages will be sent when reconnected.
            </div>
            <div v-else-if="connectionStatus === 'reconnecting'" class="connection-banner reconnecting">
              <i class="fas fa-spinner fa-spin"></i>
              Reconnecting...
            </div>

            <!-- Messages -->
            <div class="messages-container" ref="messagesContainer">
              <div v-if="messagesLoading" class="loading">Loading messages...</div>
              <div v-else-if="messages.length === 0" class="empty-chat">
                <p>No messages yet. Start the conversation!</p>
              </div>
              <div v-else>
                <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.is_own }">
                  <div class="message-avatar" v-if="!msg.is_own">{{ (activeConv.name || '?')[0] }}</div>
                  <div class="message-bubble">
                    <p>{{ msg.message }}</p>
                    <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                    <span v-if="msg.is_own && msg.failed" class="msg-failed"><i class="fas fa-exclamation-circle"></i> Failed</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input -->
            <div class="chat-input">
              <textarea v-model="newMessage" placeholder="Type a message..." @keydown.enter.exact.prevent="sendMessage" rows="1"></textarea>
              <button @click="sendMessage" :disabled="!newMessage.trim() || connectionStatus === 'disconnected'">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(true)
const messagesLoading = ref(false)
const conversations = ref([])
const messages = ref([])
const activeConv = ref(null)
const newMessage = ref('')
const searchQuery = ref('')
const unreadCount = ref(0)
const messagesContainer = ref(null)
const connectionStatus = ref('connected') // Bug #4: 'connected' | 'disconnected' | 'reconnecting'
const pendingMessages = ref([]) // Bug #4: Queue for failed messages
let pollInterval = null
let realtimeChannel = null

const showSidebar = ref(true)

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const connectionLabel = computed(() => {
  if (connectionStatus.value === 'connected') return 'Online'
  if (connectionStatus.value === 'disconnected') return 'Offline'
  return 'Reconnecting...'
})

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff/60000)}m`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h`
  return d.toLocaleDateString()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Bug #6: Watch messages array for auto-scroll
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Load conversations
const loadConversations = async () => {
  if (!userStore.supabaseUser) return
  try {
    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('*, sellers(name, user_id)')
      .or(`sender_id.eq.${userStore.supabaseUser.id},receiver_id.eq.${userStore.supabaseUser.id}`)
      .order('created_at', { ascending: false })

    const convMap = new Map()
    ;(chatMessages || []).forEach(msg => {
      const sellerId = msg.seller_id
      if (!sellerId) return
      if (!convMap.has(sellerId)) {
        convMap.set(sellerId, {
          id: sellerId,
          userId: msg.sellers?.user_id || sellerId,
          name: msg.sellers?.name || 'Seller',
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unread: !msg.is_read && msg.sender_id !== userStore.supabaseUser.id
        })
      }
    })

    conversations.value = Array.from(convMap.values())
    unreadCount.value = conversations.value.filter(c => c.unread).length

    const { data: allSellers } = await supabase.from('sellers').select('id, name, user_id').limit(20)
    ;(allSellers || []).forEach(seller => {
      if (!convMap.has(seller.id)) {
        conversations.value.push({
          id: seller.id, userId: seller.user_id, name: seller.name,
          lastMessage: null, lastMessageTime: null, unread: false
        })
      }
    })
  } catch (e) { console.error('Failed to load conversations:', e) }
  loading.value = false
}

// Load messages
const loadMessages = async (sellerId) => {
  if (!userStore.supabaseUser || !sellerId) return
  messagesLoading.value = true
  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userStore.supabaseUser.id},seller_id.eq.${sellerId}),and(receiver_id.eq.${userStore.supabaseUser.id},seller_id.eq.${sellerId})`)
      .order('created_at')

    messages.value = (data || []).map(msg => ({
      ...msg,
      is_own: msg.sender_id === userStore.supabaseUser.id
    }))

    await supabase.from('chat_messages').update({ is_read: true })
      .eq('seller_id', sellerId)
      .eq('receiver_id', userStore.supabaseUser.id)
      .eq('is_read', false)

    scrollToBottom()
  } catch (e) { console.error('Failed to load messages:', e) }
  messagesLoading.value = false
}

// Select conversation
const selectConversation = async (conv) => {
  activeConv.value = conv
  showSidebar.value = false
  conv.unread = false
  unreadCount.value = conversations.value.filter(c => c.unread).length
  await loadMessages(conv.id)
}

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !userStore.supabaseUser || !activeConv.value) return
  const messageText = newMessage.value.trim()
  newMessage.value = ''

  const localMsg = {
    id: Date.now(),
    message: messageText,
    is_own: true,
    created_at: new Date().toISOString(),
    failed: false
  }
  messages.value.push(localMsg)

  try {
    const receiverId = activeConv.value.userId || activeConv.value.id
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: userStore.supabaseUser.id,
      receiver_id: receiverId,
      seller_id: activeConv.value.id,
      message: messageText,
      message_type: 'text',
      is_read: false
    })

    if (error) throw error

    activeConv.value.lastMessage = messageText
    activeConv.value.lastMessageTime = new Date().toISOString()
  } catch (e) {
    console.error('Failed to send message:', e)
    // Bug #4: Mark message as failed
    localMsg.failed = true
    pendingMessages.value.push({ ...localMsg, sellerId: activeConv.value.id })
    window.__toast?.show('Message failed to send', 'error')
  }
}

// Refresh messages
const refreshMessages = async () => {
  if (activeConv.value) await loadMessages(activeConv.value.id)
}

// Bug #4: Retry pending messages
const retryPendingMessages = async () => {
  if (pendingMessages.value.length === 0) return
  const pending = [...pendingMessages.value]
  pendingMessages.value = []
  for (const msg of pending) {
    try {
      await supabase.from('chat_messages').insert({
        sender_id: userStore.supabaseUser.id,
        receiver_id: msg.sellerId,
        seller_id: msg.sellerId,
        message: msg.message,
        message_type: 'text',
        is_read: false
      })
      // Mark as sent
      const localMsg = messages.value.find(m => m.id === msg.id)
      if (localMsg) localMsg.failed = false
    } catch (e) {
      pendingMessages.value.push(msg)
    }
  }
}

// Bug #3: Realtime subscription with connection status
const setupRealtime = () => {
  if (!userStore.supabaseUser) return

  realtimeChannel = supabase
    .channel('chat-messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `receiver_id=eq.${userStore.supabaseUser.id}`
    }, (payload) => {
      const newMsg = payload.new
      if (activeConv.value && newMsg.seller_id === activeConv.value.id) {
        messages.value.push({ ...newMsg, is_own: false })
        supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id)
      } else {
        unreadCount.value++
        const conv = conversations.value.find(c => c.id === newMsg.seller_id)
        if (conv) {
          conv.unread = true
          conv.lastMessage = newMsg.message
          conv.lastMessageTime = newMsg.created_at
        }
      }
    })
    .subscribe((status) => {
      // Bug #4: Track connection status
      if (status === 'SUBSCRIBED') {
        connectionStatus.value = 'connected'
        retryPendingMessages() // Retry failed messages on reconnect
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        connectionStatus.value = 'disconnected'
      } else if (status === 'CONNECTING') {
        connectionStatus.value = 'reconnecting'
      }
    })
}

onMounted(async () => {
  await loadConversations()
  setupRealtime()

  // Auto-select seller from URL query
  const sellerQuery = route.query.seller
  if (sellerQuery) {
    const conv = conversations.value.find(c => c.id === sellerQuery)
    if (conv) await selectConversation(conv)
  }

  pollInterval = setInterval(async () => {
    if (activeConv.value) await loadMessages(activeConv.value.id)
    await loadConversations()
  }, 10000)
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.container { max-width: 1200px; margin: 0 auto; padding: 20px 15px; }
.chat-container { display: grid; grid-template-columns: 320px 1fr; height: 70vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.chat-sidebar { border-right: 1px solid #eee; display: flex; flex-direction: column; }
.sidebar-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
.sidebar-header h3 { margin: 0; }
.unread-badge { background: var(--brand-primary, #FF9900); color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.search-box { padding: 10px 15px; border-bottom: 1px solid #eee; }
.search-box input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; box-sizing: border-box; }
.conversation-list { flex: 1; overflow-y: auto; }
.loading, .empty { text-align: center; padding: 30px; color: #999; }
.conversation-item { display: flex; align-items: center; gap: 12px; padding: 15px 20px; cursor: pointer; border-bottom: 1px solid #f5f5f5; transition: background 0.2s; position: relative; }
.conversation-item:hover { background: #f8f8f8; }
.conversation-item.active { background: #fff8f0; border-left: 3px solid var(--brand-primary, #FF9900); }
.conversation-item.unread { background: #fff8f8; }
.conv-avatar { width: 45px; height: 45px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.conv-name { font-weight: 600; font-size: 14px; }
.conv-time { font-size: 11px; color: #999; }
.conv-preview { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.unread-dot { width: 10px; height: 10px; background: var(--brand-primary, #FF9900); border-radius: 50%; position: absolute; right: 15px; top: 50%; transform: translateY(-50%); }
.chat-main { display: flex; flex-direction: column; }
.no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.no-chat i { font-size: 48px; margin-bottom: 15px; color: #ddd; }
.chat-header { display: flex; align-items: center; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #eee; }
.header-avatar { width: 40px; height: 40px; background: var(--brand-primary, #FF9900); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.header-info h4 { margin: 0; font-size: 15px; }
.online-status { font-size: 12px; color: #2ed573; }
.online-status.disconnected { color: #ff4757; }
.online-status.reconnecting { color: #ffa502; }
.header-actions { margin-left: auto; }
.header-actions button { background: none; border: none; color: #666; cursor: pointer; font-size: 16px; padding: 5px; }

/* Bug #4: Connection banner */
.connection-banner { padding: 8px 16px; font-size: 12px; display: flex; align-items: center; gap: 8px; }
.connection-banner.disconnected { background: #fff3cd; color: #856404; }
.connection-banner.reconnecting { background: #d1ecf1; color: #0c5460; }

.messages-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.empty-chat { text-align: center; padding: 40px; color: #999; }
.message { display: flex; gap: 10px; max-width: 75%; }
.message.own { align-self: flex-end; flex-direction: row-reverse; }
.message-avatar { width: 32px; height: 32px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.message-bubble { padding: 10px 15px; border-radius: 15px; background: #f0f0f0; max-width: 100%; }
.message.own .message-bubble { background: var(--brand-primary, #FF9900); color: #fff; }
.message-bubble p { margin: 0 0 4px; font-size: 14px; word-wrap: break-word; }
.message-time { font-size: 11px; color: #999; display: block; }
.message.own .message-time { color: rgba(255,255,255,0.7); }
.msg-failed { font-size: 11px; color: #ff4757; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

.chat-input { display: flex; gap: 10px; padding: 15px 20px; border-top: 1px solid #eee; }
.chat-input textarea { flex: 1; padding: 10px 15px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; resize: none; max-height: 100px; }
.chat-input textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.chat-input button { width: 40px; height: 40px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.chat-input button:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 768px) {
  .chat-container { grid-template-columns: 1fr; height: calc(100vh - 10rem); }
  .chat-sidebar { position: absolute; inset: 0; z-index: 10; background: #fff; display: flex; }
  .chat-sidebar.hidden { display: none; }
  .chat-main { width: 100%; }
  .chat-header { padding: 12px 15px; }
  .header-back { display: flex; background: none; border: none; font-size: 18px; color: #333; cursor: pointer; padding: 4px; margin-right: 8px; }
  .messages-container { padding: 15px; }
  .message { max-width: 85%; }
  .chat-input { padding: 10px 15px; }
  .chat-input textarea { font-size: 16px; }
}
@media (min-width: 769px) { .header-back { display: none; } }
</style>
