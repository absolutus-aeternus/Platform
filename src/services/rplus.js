// Rating Plus Supabase Service
// Shared connection for all admin panels

const RP_URL = import.meta.env.VITE_RPLUS_URL || 'https://pkfddwovxitqfiblzgwd.supabase.co'
const RP_KEY = import.meta.env.VITE_RPLUS_KEY || ''

const headers = () => ({
  'apikey': RP_KEY,
  'Authorization': `Bearer ${RP_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
})

// ─── Users ───
export const fetchRplusUsers = async (filters = {}) => {
  let url = `${RP_URL}/rest/v1/users?select=*&order=created_at.desc`
  if (filters.status) url += `&status=eq.${filters.status}`
  const res = await fetch(url, { headers: headers() })
  return res.json()
}

export const updateRplusUser = async (userId, updates) => {
  return fetch(`${RP_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
  })
}

export const deleteRplusUser = async (userId) => {
  return fetch(`${RP_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'DELETE',
    headers: headers()
  })
}

// ─── Messages ───
export const fetchRplusMessages = async (userId) => {
  const res = await fetch(
    `${RP_URL}/rest/v1/messages?or=(sender_id.eq.${userId},receiver_id.eq.${userId})&order=created_at.asc&limit=100`,
    { headers: headers() }
  )
  return res.json()
}

export const sendRplusMessage = async (receiverId, message) => {
  return fetch(`${RP_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ sender_id: 'admin', receiver_id: receiverId, message })
  })
}

// ─── Stats ───
export const fetchRplusStats = async () => {
  try {
    const [users, messages] = await Promise.all([
      fetchRplusUsers(),
      fetch(`${RP_URL}/rest/v1/messages?select=id`, { headers: headers() }).then(r => r.json()).catch(() => [])
    ])
    return {
      users: users.length || 0,
      approved: users.filter(u => u.status === 'approved').length || 0,
      pending: users.filter(u => u.status === 'pending').length || 0,
      rejected: users.filter(u => u.status === 'rejected').length || 0,
      messages: messages.length || 0
    }
  } catch (e) {
    return { users: 0, approved: 0, pending: 0, rejected: 0, messages: 0 }
  }
}

export { RP_URL, RP_KEY }
