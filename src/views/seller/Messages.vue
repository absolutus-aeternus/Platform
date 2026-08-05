<template>
  <div class="messages">
    <h1>Messages</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="messages.length === 0" class="empty">No messages</div>
    <div v-else class="message-list">
      <div v-for="msg in messages" :key="msg.id" class="message-card" :class="{ unread: !msg.is_read }">
        <div class="msg-header">
          <span class="msg-from">{{ msg.sender_name || 'Customer' }}</span>
          <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
        </div>
        <p class="msg-content">{{ msg.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { supabase } from '@/services/supabase'

const userStore = useUserStore()
const messages = ref([])
const loading = ref(true)

const formatTime = (t) => t ? new Date(t).toLocaleString() : ''

onMounted(async () => {
  if (!userStore.supabaseUser) { loading.value = false; return }
  const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', userStore.supabaseUser.id).single()
  if (seller) {
    const { data } = await supabase.from('chat_messages').select('*').eq('seller_id', seller.id).order('created_at', { ascending: false })
    messages.value = data || []
  }
  loading.value = false
})
</script>

<style scoped>
h1 { margin-bottom: 25px; }
.loading, .empty { text-align: center; padding: 40px; color: #999; }
.message-card { background: #fff; padding: 15px 20px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.message-card.unread { border-left: 3px solid #fe2c55; }
.msg-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.msg-from { font-weight: 600; }
.msg-time { color: #999; font-size: 12px; }
.msg-content { color: #666; font-size: 14px; }
</style>
