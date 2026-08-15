// ==================== NOTIFICATION SERVICE ====================
import { supabase } from '@/services/supabase'

export async function getNotifications(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Get notifications error:', e)
    return []
  }
}

export async function markAsRead(notificationId) {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
  } catch (e) {
    console.error('Mark as read error:', e)
  }
}

export async function markAllAsRead(userId) {
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
  } catch (e) {
    console.error('Mark all as read error:', e)
  }
}

export async function getUnreadCount(userId) {
  try {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    return count || 0
  } catch (e) {
    console.error('Unread count error:', e)
    return 0
  }
}

export async function createNotification(userId, title, message, type = 'info', data = null) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      data,
      is_read: false
    })
  } catch (e) {
    console.error('Create notification error:', e)
  }
}

// Push notification subscription (Web Push API)
export async function subscribePush(userId) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
    })

    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription: JSON.stringify(subscription)
    }, { onConflict: 'user_id' })

    return true
  } catch (e) {
    console.error('Push subscription error:', e)
    return false
  }
}
