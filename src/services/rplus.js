// Rating Plus Service - uses main Supabase
const RP_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfzmdvymqqnrzrytcrie.supabase.co'
const RP_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// SECURITY: Use Supabase client instead of raw REST with anon key
import { supabase } from '@/services/supabase'

const headers = () => ({
  'apikey': RP_KEY,
  'Authorization': `Bearer ${RP_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
})

export const fetchRplusUsers = async (filters = {}) => {
  try {
    let query = supabase
      .from('users')
      .select('id, email, username, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('fetchRplusUsers error:', e)
    return []
  }
}

export const updateRplusUser = async (userId, updates) => {
  try {
    // SECURITY: Only allow updating non-sensitive fields
    const allowedFields = ['username', 'avatar_url', 'phone']
    const safeUpdates = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key]
    }
    safeUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', userId)
      .select()

    if (error) throw error
    return data
  } catch (e) {
    console.error('updateRplusUser error:', e)
    return null
  }
}

export const deleteRplusUser = async (userId) => {
  // SECURITY: Do not allow client-side user deletion
  // This should go through the Worker API with admin auth
  console.warn('deleteRplusUser: User deletion must go through admin API')
  return false
}

export const fetchRplusMessages = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error
    return data || []
  } catch (e) {
    console.error('fetchRplusMessages error:', e)
    return []
  }
}

export const sendRplusMessage = async (receiverId, message) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        message_type: 'text'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (e) {
    console.error('sendRplusMessage error:', e)
    return null
  }
}

export const fetchRplusStats = async () => {
  try {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: rplusUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'RATING_PLUS')

    const { count: totalMessages } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    return {
      users: totalUsers || 0,
      approved: rplusUsers || 0,
      pending: 0, // Calculate based on your business logic
      messages: totalMessages || 0
    }
  } catch (e) {
    console.error('fetchRplusStats error:', e)
    return { users: 0, approved: 0, pending: 0, messages: 0 }
  }
}

// SECURITY: Do not export raw credentials
// export { RP_URL, RP_KEY }  // REMOVED — was exposing anon key
