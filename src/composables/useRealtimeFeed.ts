import { ref, onUnmounted } from 'vue'
import { supabase } from './useSupabase'

export function useRealtimeFeed() {
  const events = ref<any[]>([])
  const connected = ref(false)
  let channel: any = null

  function subscribe(onEvent?: (event: any) => void) {
    channel = supabase
      .channel('feed-events-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events' }, (payload: any) => {
        events.value.unshift(payload.new)
        // Keep only last 50 events in memory
        if (events.value.length > 50) events.value = events.value.slice(0, 50)
        if (onEvent) onEvent(payload.new)
      })
      .subscribe((status: any) => {
        connected.value = status === 'SUBSCRIBED'
      })
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
      connected.value = false
    }
  }

  onUnmounted(() => unsubscribe())

  return { events, connected, subscribe, unsubscribe }
}
