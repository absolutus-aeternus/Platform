// Rating Plus Service - uses main Supabase
const RP_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfzmdvymqqnrzrytcrie.supabase.co'
const RP_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const headers = () => ({
  'apikey': RP_KEY,
  'Authorization': `Bearer ${RP_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
})

export const fetchRplusUsers = async (filters = {}) => {
  try {
    let url = `${RP_URL}/rest/v1/users?select=*&order=created_at.desc`
    if (filters.status) url += `&role=eq.${filters.status}`
    const res = await fetch(url, { headers: headers() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('fetchRplusUsers error:', e)
    return []
  }
}

export const updateRplusUser = async (userId, updates) => {
  try {
    const res = await fetch(`${RP_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('updateRplusUser error:', e)
    return null
  }
}

export const deleteRplusUser = async (userId) => {
  try {
    const res = await fetch(`${RP_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: headers()
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return true
  } catch (e) {
    console.error('deleteRplusUser error:', e)
    return false
  }
}

export const fetchRplusMessages = async (userId) => {
  try {
    const res = await fetch(
      `${RP_URL}/rest/v1/chat_messages?or=(sender_id.eq.${userId},receiver_id.eq.${userId})&order=created_at.asc&limit=100`,
      { headers: headers() }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('fetchRplusMessages error:', e)
    return []
  }
}

export const sendRplusMessage = async (receiverId, message) => {
  try {
    const res = await fetch(`${RP_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ sender_id: 'admin', receiver_id: receiverId, message })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('sendRplusMessage error:', e)
    return null
  }
}

export const fetchRplusStats = async () => {
  try {
    const [users, messages] = await Promise.all([
      fetchRplusUsers(),
      fetch(`${RP_URL}/rest/v1/chat_messages?select=id`, { headers: headers() }).then(r => r.json()).catch(() => [])
    ])
    return {
      users: users.length || 0,
      approved: users.filter(u => u.role === 'MEMBER').length || 0,
      pending: users.filter(u => !u.role || u.role === 'MEMBER').length || 0,
      messages: messages.length || 0
    }
  } catch (e) {
    return { users: 0, approved: 0, pending: 0, messages: 0 }
  }
}

export { RP_URL, RP_KEY }
