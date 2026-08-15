// Global Realtime Sync — Automatically keeps all pages in sync
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const syncState = {
  lastUpdate: ref(null),
  connected: ref(false),
  channels: [],
}

const listeners = new Map()

export function useGlobalSync() {
  function initSync(userId) {
    // Only create subscriptions if not already connected
    if (syncState.connected.value) return

    // Only create user-specific subscriptions if userId provided
    if (!userId) return

    // User-specific subscriptions only
    const channels = []

    // Orders changes for this user
    channels.push(
      supabase
        .channel(`sync-orders-${userId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` }, (payload) => {
          syncState.lastUpdate.value = new Date().toISOString()
          emit('orders:change', payload)
          if (payload.eventType === 'UPDATE' && payload.new?.status !== payload.old?.status) {
            window.__toast?.show(`Order ${payload.new.order_no}: ${payload.new.status}`, 'info')
          }
        })
        .subscribe()
    )

    // Notifications for this user
    channels.push(
      supabase
        .channel(`sync-notif-${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
          syncState.lastUpdate.value = new Date().toISOString()
          emit('notifications:change', payload)
          window.__toast?.show(payload.new?.title || 'New notification', 'info')
        })
        .subscribe()
    )

    // Cart changes for this user
    channels.push(
      supabase
        .channel(`sync-cart-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${userId}` }, (payload) => {
          syncState.lastUpdate.value = new Date().toISOString()
          emit('cart:change', payload)
        })
        .subscribe()
    )

    // Chat messages for this user
    channels.push(
      supabase
        .channel(`sync-chat-${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${userId}` }, (payload) => {
          syncState.lastUpdate.value = new Date().toISOString()
          emit('chat:message', payload)
        })
        .subscribe()
    )

    syncState.channels = channels
    syncState.connected.value = true
  }

  function on(event, callback) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(callback)
    return () => listeners.get(event)?.delete(callback)
  }

  function emit(event, data) {
    listeners.get(event)?.forEach(cb => {
      try { cb(data) } catch (e) { console.error(`Sync event error [${event}]:`, e) }
    })
    listeners.get('*')?.forEach(cb => {
      try { cb(event, data) } catch (e) { console.error(`Sync wildcard error:`, e) }
    })
  }

  function disconnect() {
    syncState.channels.forEach(ch => {
      try { supabase.removeChannel(ch) } catch {}
    })
    syncState.channels = []
    syncState.connected.value = false
  }

  return {
    ...syncState,
    initSync,
    disconnect,
    on,
    emit,
  }
}
