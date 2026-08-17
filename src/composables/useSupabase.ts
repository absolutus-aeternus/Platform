// Re-export from services/supabase.js to avoid creating duplicate Supabase clients
// This prevents duplicate WebSocket connections to Supabase Realtime
export { supabase, getR2ImageUrl } from '@/services/supabase'
export { supabase as default } from '@/services/supabase'

// Worker API fetch helper (used by useR2Upload and other composables)
export async function workerFetch(path: string, options: RequestInit = {}) {
  const workerUrl = import.meta.env.VITE_WORKER_URL || ''
  const url = `${workerUrl}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  // Add auth token if available
  try {
    const { supabase } = await import('@/services/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch { /* ignore auth errors */ }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error ${res.status}`)
  }
  return res.json()
}
