<template>
  <div class="page-wrapper">
  <div class="admin-chat">
    <h1>Customer Service Chat</h1>
    
    <div class="chat-layout">
      <!-- Sidebar: All Conversations -->
      <div class="chat-sidebar" :class="{ hidden: !showSidebar && activeConv }">
        <div class="sidebar-tabs">
          <button :class="{ active: tab === 'buyers' }" @click="tab = 'buyers'">Buyers</button>
          <button :class="{ active: tab === 'sellers' }" @click="tab = 'sellers'">Sellers</button>
          <button :class="{ active: tab === 'rplus' }" @click="tab = 'rplus'">⭐ R+</button>
          <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
        </div>
        
        <div class="search-box">
          <input v-model="searchQuery" placeholder="Search conversations...">
        </div>
        
        <div class="conversation-list">
          <div v-if="loading" class="loading">Loading...</div>
          <div v-else-if="filteredConversations.length === 0" class="empty">No conversations</div>
          <div v-else>
            <div v-for="conv in filteredConversations" :key="conv.id" 
                 class="conv-item" :class="{ active: activeConv?.id === conv.id, unread: conv.unread }"
                 @click="selectConversation(conv)">
              <div class="conv-avatar" :class="conv.role">{{ (conv.name || '?')[0]?.toUpperCase() }}</div>
              <div class="conv-info">
                <div class="conv-header">
                  <span class="conv-name">{{ conv.name }}</span>
                  <span class="conv-role" :class="conv.role">{{ conv.role }}</span>
                </div>
                <p class="conv-preview">{{ conv.lastMessage?.substring(0, 35) || 'No messages' }}...</p>
              </div>
              <span v-if="conv.unread" class="unread-dot"></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Chat Area -->
      <div class="chat-main">
        <div v-if="!activeConv" class="no-chat">
          <i class="fas fa-headset"></i>
          <p>Select a conversation to start</p>
          <span>Monitor and respond to buyer & seller messages</span>
        </div>
        
        <div v-else>
          <!-- Chat Header -->
          <div class="chat-header">
            <button class="header-back" @click="activeConv = null; showSidebar = true" title="Back"><i class="fas fa-arrow-left"></i></button>
            <div class="header-avatar" :class="activeConv.role">{{ (activeConv.name || '?')[0]?.toUpperCase() }}</div>
            <div class="header-info">
              <h4>{{ activeConv.name }}</h4>
              <span class="header-role" :class="activeConv.role">{{ activeConv.role }}</span>
            </div>
            <div class="header-actions">
              <button @click="refreshMessages" title="Refresh"><i class="fas fa-sync-alt"></i></button>
              <button @click="viewProfile" title="View Profile"><i class="fas fa-user"></i></button>
            </div>
          </div>
          
          <!-- Messages -->
          <div class="messages-container" ref="messagesRef">
            <div v-if="messagesLoading" class="loading">Loading messages...</div>
            <div v-else-if="messages.length === 0" class="empty-msg">
              <p>No messages in this conversation</p>
            </div>
            <div v-else>
              <div v-for="msg in messages" :key="msg.id" class="message" :class="{ own: msg.is_admin, other: !msg.is_admin }" @contextmenu.prevent="msg.is_admin ? deleteMessage(msg) : null">
                <div class="msg-avatar" v-if="!msg.is_admin">{{ msg.sender_name?.[0] || 'U' }}</div>
                <div class="msg-bubble">
                  <span class="msg-sender" v-if="!msg.is_admin">{{ msg.sender_name }}</span>
                  <p>{{ msg.message }}</p>
                  <div class="msg-footer">
                    <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
                    <span v-if="msg.is_admin" class="msg-check" :class="{ read: msg.is_read }">
                      <template v-if="msg.is_read">✓✓</template>
                      <template v-else>✓</template>
                    </span>
                  </div>
                  <button v-if="msg.is_admin" class="msg-delete" @click="deleteMessage(msg)" title="Delete message"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input -->
          <div class="chat-input">
            <textarea v-model="newMessage" placeholder="Type a message as Customer Service..." @keydown.enter.exact.prevent="sendMessage" rows="1"></textarea>
            <button @click="sendMessage" :disabled="!newMessage.trim()">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          </div>
</div>
</div>
      
      <!-- Info Panel -->
      <div class="info-panel" v-if="activeConv">
        <div class="info-header">
          <div class="info-avatar" :class="activeConv.role">{{ (activeConv.name || '?')[0]?.toUpperCase() }}</div>
          <h4>{{ activeConv.name }}</h4>
          <span class="info-role" :class="activeConv.role">{{ activeConv.role }}</span>
        </div>
        
        <div class="info-section">
          <h5>Contact Info</h5>
          <p><strong>Email:</strong> {{ activeConv.email || 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ activeConv.phone || 'N/A' }}</p>
          <p><strong>Joined:</strong> {{ activeConv.joined || 'N/A' }}</p>
        </div>
        
        <div class="info-section" v-if="activeConv.role === 'buyer'">
          <h5>Buyer Stats</h5>
          <p><strong>Orders:</strong> {{ activeConv.orders || 0 }}</p>
          <p><strong>Total Spent:</strong> ${{ activeConv.totalSpent || '0.00' }}</p>
          <p><strong>Wallet:</strong> ${{ activeConv.wallet || '0.00' }}</p>
        </div>
        
        <div class="info-section" v-if="activeConv.role === 'seller'">
          <h5>Seller Stats</h5>
          <p><strong>Products:</strong> {{ activeConv.products || 0 }}</p>
          <p><strong>Sales:</strong> {{ activeConv.sales || 0 }}</p>
          <p><strong>Revenue:</strong> ${{ activeConv.revenue || '0.00' }}</p>
        </div>
        
        <div class="info-section" v-if="activeConv.role === 'rplus'">
          <h5>Rating Plus Info</h5>
          <p><strong>Email:</strong> {{ activeConv.email || 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ activeConv.phone || 'N/A' }}</p>
          <p><strong>Status:</strong> <span class="conv-role" :class="activeConv.rplusStatus">{{ activeConv.rplusStatus }}</span></p>
          <p><strong>Joined:</strong> {{ activeConv.joined || 'N/A' }}</p>
        </div>
        
        <div class="info-actions">
          <button v-if="activeConv.role === 'rplus' && activeConv.rplusStatus === 'pending'" @click="approveRplusUser" class="btn-approve-rplus">Approve R+ User</button>
          <button v-if="activeConv.role === 'rplus' && activeConv.rplusStatus === 'approved'" @click="freezeRplusUser" class="btn-danger">Freeze R+ User</button>
          <button @click="banUser" class="btn-danger">Ban User</button>
          <button @click="warnUser">Send Warning</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(true)
const messagesLoading = ref(false)
const tab = ref('all')
const showSidebar = ref(true)
const searchQuery = ref('')
const conversations = ref([])
const messages = ref([])
const activeConv = ref(null)
const newMessage = ref('')
const messagesRef = ref(null)

let pollInterval = null

const filteredConversations = computed(() => {
  let filtered = conversations.value
  if (tab.value !== 'all') {
    filtered = filtered.filter(c => c.role === tab.value)
  }
  if (searchQuery.value) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  return filtered
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
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

// Load all conversations
import { fetchRplusUsers, fetchRplusMessages, sendRplusMessage, updateRplusUser } from '@/services/rplus'

const loadConversations = async () => {
  try {
    // Load Rating Plus users
    try {
      const rpUsers = await fetchRplusUsers()
      if (Array.isArray(rpUsers)) {
        rpUsers.forEach(u => {
          conversations.value.push({
            id: `rplus_${u.id}`,
            name: u.full_name || u.email,
            role: 'rplus',
            email: u.email,
            phone: u.phone,
            lastMessage: u.status,
            lastMessageTime: u.created_at,
            unread: u.status === 'pending',
            rplusUserId: u.id,
            rplusStatus: u.status,
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
          })
        })
      }
    } catch (e) { console.warn('[Admin] R+ users fetch failed:', e.message) }

    // Get all AllianceHub chat messages
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*, sender:users!sender_id(email), receiver:users!receiver_id(email), sellers(name)')
      .order('created_at', { ascending: false })
      .limit(500)
    
    // Group by conversation
    const convMap = new Map()
    ;(msgs || []).forEach(msg => {
      const senderId = msg.sender_id
      const receiverId = msg.receiver_id
      const sellerId = msg.seller_id
      
      // Determine conversation partner
      let partnerId, partnerName, partnerRole
      if (msg.sellers) {
        // Buyer-Seller conversation
        partnerId = sellerId
        partnerName = msg.sellers.name
        partnerRole = 'seller'
      } else if (msg.sender?.email) {
        partnerId = senderId
        partnerName = msg.sender.email
        partnerRole = 'buyer'
      } else if (msg.receiver?.email) {
        partnerId = receiverId
        partnerName = msg.receiver.email
        partnerRole = 'buyer'
      } else {
        return
      }
      
      const convKey = partnerId
      if (!convMap.has(convKey)) {
        convMap.set(convKey, {
          id: convKey,
          name: partnerName,
          role: partnerRole,
          email: partnerName,
          lastMessage: msg.message,
          lastMessageTime: msg.created_at,
          unread: !msg.is_read,
          orders: 0,
          totalSpent: '0.00',
          wallet: '0.00',
          products: 0,
          sales: 0,
          revenue: '0.00'
        })
      }
    })
    
    conversations.value = Array.from(convMap.values())
    
    // Enrich with user/seller data
    for (const conv of conversations.value) {
      if (conv.role === 'buyer') {
        const { data: user } = await supabase.from('users').select('id, email, created_at').eq('id', conv.id).maybeSingle()
        if (user) {
          conv.email = user.email
          conv.joined = new Date(user.created_at).toLocaleDateString()
          
          const { data: orders } = await supabase.from('orders').select('total_amount').eq('user_id', conv.id)
          conv.orders = orders?.length || 0
          conv.totalSpent = (orders || []).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toFixed(2)
          
          const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', conv.id).maybeSingle()
          conv.wallet = wallet?.balance || '0.00'
        }
      } else if (conv.role === 'seller') {
        const { data: seller } = await supabase.from('sellers').select('id, name, goods_count, sales_count, created_at').eq('id', conv.id).maybeSingle()
        if (seller) {
          conv.products = seller.goods_count || 0
          conv.sales = seller.sales_count || 0
          conv.joined = new Date(seller.created_at).toLocaleDateString()
          
          const { data: orders } = await supabase.from('orders').select('total_amount').eq('seller_id', conv.id)
          conv.revenue = (orders || []).reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toFixed(2)
        }
      }
    }
  } catch (e) {
    console.error('Failed to load conversations:', e)
  }
  loading.value = false
}

// Load messages for a conversation
const loadMessages = async (convId) => {
  messagesLoading.value = true
  try {
    // R+ conversation
    if (convId.startsWith('rplus_')) {
      const rplusId = activeConv.value?.rplusUserId
      if (rplusId) {
        try {
          const rpMsgs = await fetchRplusMessages(rplusId)
          messages.value = (rpMsgs || []).map(msg => ({
            ...msg,
            is_admin: msg.sender_id === 'admin',
            sender_name: msg.sender_id === 'admin' ? 'Customer Service' : (activeConv.value?.name || 'User')
          }))
          scrollToBottom()
        } catch (e) { console.warn('[Admin] R+ messages fetch failed:', e.message) }
      }
      messagesLoading.value = false
      return
    }

    // AllianceHub conversation
    const { data } = await supabase
      .from('chat_messages')
      .select('*, sender:users!sender_id(email), sellers(name)')
      .or(`sender_id.eq.${convId},receiver_id.eq.${convId},seller_id.eq.${convId}`)
      .order('created_at')
      .limit(100)
    
    messages.value = (data || []).map(msg => ({
      ...msg,
      is_admin: false,
      sender_name: msg.sender?.email || msg.sellers?.name || 'User'
    }))
    
    scrollToBottom()
  } catch (e) {
    console.error('Failed to load messages:', e)
  }
  messagesLoading.value = false
}

// Select conversation
const selectConversation = async (conv) => {
  activeConv.value = conv
  showSidebar.value = false
  conv.unread = false
  await loadMessages(conv.id)
}

// Send message as admin
const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeConv.value) return
  
  const text = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    // R+ conversation
    if (activeConv.value.role === 'rplus' && activeConv.value.rplusUserId) {
      await sendRplusMessage(activeConv.value.rplusUserId, text)
      messages.value.push({ id: Date.now(), message: text, is_admin: true, sender_name: 'Customer Service', created_at: new Date().toISOString() })
      scrollToBottom()
      return
    }

    // AllianceHub conversation
    // receiver_id must be auth user_id
    const receiverId = activeConv.value.userId || activeConv.value.id
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: 'admin',
      receiver_id: receiverId,
      seller_id: activeConv.value.role === 'seller' ? activeConv.value.id : null,
      message: text,
      message_type: 'text',
      is_read: false
    })
    
    if (error) throw error
    
    messages.value.push({
      id: Date.now(),
      message: text,
      is_admin: true,
      sender_name: 'Customer Service',
      created_at: new Date().toISOString()
    })
    
    scrollToBottom()
  } catch (e) {
    window.__toast?.show('Failed to send message: ' + e.message)
  }
}

// Refresh messages
const refreshMessages = async () => {
  if (activeConv.value) await loadMessages(activeConv.value.id)
}

// Delete message (Customer Service only)
const deleteMessage = async (msg) => {
  if (!confirm('Delete this message?')) return
  try {
    await supabase.from('chat_messages').delete().eq('id', msg.id)
    messages.value = messages.value.filter(m => m.id !== msg.id)
  } catch (e) {
    window.__toast?.show('Failed to delete: ' + e.message)
  }
}

// View profile
const viewProfile = () => {
  if (!activeConv.value) return
  if (activeConv.value.role === 'buyer') {
    window.__toast?.show(`Buyer: ${activeConv.value.name}\nOrders: ${activeConv.value.orders}\nTotal: $${activeConv.value.totalSpent}`)
  } else {
    window.__toast?.show(`Seller: ${activeConv.value.name}\nProducts: ${activeConv.value.products}\nSales: ${activeConv.value.sales}`)
  }
}

// Ban user
const banUser = async () => {
  if (!activeConv.value || !confirm(`Ban ${activeConv.value.name}?`)) return
  window.__toast?.show('User banned (feature pending)')
}

// R+ user actions
const approveRplusUser = async () => {
  if (!activeConv.value?.rplusUserId) return
  try {
    await updateRplusUser(activeConv.value.rplusUserId, { status: 'approved' })
    activeConv.value.rplusStatus = 'approved'
    activeConv.value.lastMessage = 'approved'
    window.__toast?.show('R+ user approved')
  } catch (e) { window.__toast?.show('Failed to approve') }
}

const freezeRplusUser = async () => {
  if (!activeConv.value?.rplusUserId || !confirm('Freeze this R+ user?')) return
  try {
    await updateRplusUser(activeConv.value.rplusUserId, { status: 'frozen' })
    activeConv.value.rplusStatus = 'frozen'
    activeConv.value.lastMessage = 'frozen'
    window.__toast?.show('R+ user frozen')
  } catch (e) { window.__toast?.show('Failed to freeze') }
}

// Warn user
const warnUser = async () => {
  if (!activeConv.value) return
  const warning = prompt('Enter warning message:')
  if (warning) {
    await supabase.from('notifications').insert({
      user_id: activeConv.value.id,
      title: 'Warning from Customer Service',
      message: warning,
      type: 'warning'
    })
    window.__toast?.show('Warning sent')
  }
}

onMounted(async () => {
  await loadConversations()
  pollInterval = setInterval(loadConversations, 15000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
body, html { overflow-x: hidden; }
h1 { margin-bottom: 25px; }
.chat-layout { display: grid; grid-template-columns: 280px 1fr 250px; height: 70vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

/* Sidebar */
.chat-sidebar { border-right: 1px solid #eee; display: flex; flex-direction: column; }
.sidebar-tabs { display: flex; border-bottom: 1px solid #eee; }
.sidebar-tabs button { flex: 1; padding: 12px 8px; background: none; border: none; font-size: 12px; cursor: pointer; color: #666; border-bottom: 2px solid transparent; }
.sidebar-tabs button.active { color: var(--brand-primary, #FF9900); border-bottom-color: var(--brand-primary, #FF9900); }
.search-box { padding: 10px; border-bottom: 1px solid #eee; }
.search-box input { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.conversation-list { flex: 1; overflow-y: auto; }
.loading, .empty { text-align: center; padding: 25px; color: #999; font-size: 13px; }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 12px; cursor: pointer; border-bottom: 1px solid #f5f5f5; position: relative; }
.conv-item:hover { background: #f8f8f8; }
.conv-item.active { background: #fff8f0; border-left: 3px solid var(--brand-primary, #FF9900); }
.conv-item.unread { background: #fff8f8; }
.conv-avatar { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
.conv-avatar.buyer { background: #45b7d1; color: #fff; }
.conv-avatar.seller { background: var(--brand-primary, #FF9900); color: #fff; }
.conv-avatar.rplus { background: var(--brand-primary-hover, #E68A00); color: #fff; }
.conv-info { flex: 1; min-width: 0; }
.conv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
.conv-name { font-size: 12px; font-weight: 600; }
.conv-role { font-size: 10px; padding: 1px 6px; border-radius: 8px; }
.conv-role.buyer { background: #d1ecf1; color: #0c5460; }
.conv-role.seller { background: #f8d7da; color: #721c24; }
.conv-role.rplus { background: #fff3cd; color: #856404; }
.conv-preview { font-size: 11px; color: #999; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.unread-dot { width: 8px; height: 8px; background: var(--brand-primary, #FF9900); border-radius: 50%; position: absolute; right: 10px; }

/* Main Chat */
.chat-main { display: flex; flex-direction: column; }
.no-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; }
.no-chat i { font-size: 48px; margin-bottom: 15px; color: #ddd; }
.no-chat p { font-size: 16px; margin-bottom: 5px; }
.no-chat span { font-size: 13px; }
.chat-header { display: flex; align-items: center; gap: 10px; padding: 12px 15px; border-bottom: 1px solid #eee; }
.header-avatar { width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.header-avatar.buyer { background: #45b7d1; color: #fff; }
.header-avatar.seller { background: var(--brand-primary, #FF9900); color: #fff; }
.header-avatar.rplus { background: var(--brand-primary-hover, #E68A00); color: #fff; }
.header-info h4 { margin: 0; font-size: 14px; }
.header-role { font-size: 11px; padding: 1px 8px; border-radius: 8px; }
.header-role.buyer { background: #d1ecf1; color: #0c5460; }
.header-role.seller { background: #f8d7da; color: #721c24; }
.header-role.rplus { background: #fff3cd; color: #856404; }
.header-actions { margin-left: auto; display: flex; gap: 8px; }
.header-actions button { background: none; border: none; color: #666; cursor: pointer; font-size: 14px; padding: 5px; }

/* Messages */
.messages-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
.empty-msg { text-align: center; padding: 30px; color: #999; }
.message { display: flex; gap: 8px; max-width: 80%; }
.message.own { align-self: flex-end; flex-direction: row-reverse; }
.msg-avatar { width: 28px; height: 28px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.msg-bubble { padding: 8px 12px; border-radius: 12px; background: #f0f0f0; }
.message.own .msg-bubble { background: var(--brand-primary, #FF9900); color: #fff; }
.msg-sender { font-size: 11px; font-weight: 600; color: var(--brand-primary, #FF9900); display: block; margin-bottom: 3px; }
.message.own .msg-sender { color: rgba(255,255,255,0.8); }
.msg-bubble p { margin: 0 0 3px; font-size: 13px; }
.msg-time { font-size: 10px; color: #999; }
.message.own .msg-time { color: rgba(255,255,255,0.7); }
.msg-footer { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.msg-check { font-size: 11px; color: #999; letter-spacing: -2px; }
.msg-check.read { color: #4fc3f7; }
.message.own .msg-check { color: rgba(255,255,255,0.6); }
.message.own .msg-check.read { color: #4fc3f7; }
.msg-delete { display: none; position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; background: #ff4757; color: #fff; border: none; border-radius: 50%; cursor: pointer; font-size: 10px; align-items: center; justify-content: center; }
.message.own:hover .msg-delete { display: flex; }
.msg-bubble { position: relative; }

/* Input */
.chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee; }
.chat-input textarea { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 13px; resize: none; max-height: 80px; }
.chat-input textarea:focus { outline: none; border-color: var(--brand-primary, #FF9900); }
.chat-input button { width: 36px; height: 36px; background: var(--brand-primary, #FF9900); color: #fff; border: none; border-radius: 50%; cursor: pointer; }
.chat-input button:disabled { background: #ccc; }

/* Info Panel */
.info-panel { border-left: 1px solid #eee; padding: 15px; overflow-y: auto; }
.info-header { text-align: center; padding-bottom: 15px; border-bottom: 1px solid #eee; margin-bottom: 15px; }
.info-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin: 0 auto 10px; }
.info-avatar.buyer { background: #45b7d1; color: #fff; }
.info-avatar.seller { background: var(--brand-primary, #FF9900); color: #fff; }
.info-avatar.rplus { background: var(--brand-primary-hover, #E68A00); color: #fff; }
.info-header h4 { margin: 0 0 5px; font-size: 14px; }
.info-role { font-size: 11px; padding: 2px 10px; border-radius: 10px; }
.info-role.buyer { background: #d1ecf1; color: #0c5460; }
.info-role.seller { background: #f8d7da; color: #721c24; }
.info-role.rplus { background: #fff3cd; color: #856404; }
.info-section { margin-bottom: 15px; }
.info-section h5 { font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; }
.info-section p { font-size: 12px; margin-bottom: 5px; }
.info-actions { display: flex; flex-direction: column; gap: 8px; }
.info-actions button { padding: 8px; border-radius: 4px; font-size: 12px; cursor: pointer; }
.info-actions button { border: 1px solid #ddd; background: #fff; }
.btn-danger { color: var(--error, #CC0C39) !important; border-color: var(--error, #CC0C39) !important; }
.btn-approve-rplus { background: #d4edda !important; color: #155724 !important; border-color: var(--success, #067D62) !important; }
.btn-approve-rplus:hover { background: #c3e6cb !important; }

/* Responsive */
@media (max-width: 768px) {
  .chat-layout { grid-template-columns: 1fr; height: calc(100dvh - 10rem); position: relative; }
  .chat-sidebar { position: absolute; inset: 0; z-index: 10; background: #fff; }
  .chat-sidebar.hidden { display: none; }
  .chat-info-panel { display: none; }
  .chat-header { padding: 12px 15px; }
  .header-back { display: flex; background: none; border: none; font-size: 18px; color: #333; cursor: pointer; padding: 4px; margin-right: 8px; }
  .messages-container { padding: 15px; }
  .message { max-width: 85%; }
  .chat-input { padding: 10px 15px; }
  .chat-input textarea { font-size: 16px; }
  .sidebar-tabs { flex-wrap: wrap; }
  .sidebar-tabs button { flex: 1; min-width: 0; padding: 8px 4px; font-size: 12px; }
}
@media (min-width: 769px) { .header-back { display: none; } }
@media (max-width: 480px) {
  .sidebar-tabs button { font-size: 11px; padding: 6px 4px; }
  .conv-item { padding: 10px 12px; }
  .conv-avatar { width: 36px; height: 36px; }
}
</style>
