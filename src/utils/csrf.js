/**
 * CSRF Token Helper
 * 
 * Reads CSRF token from cookie and provides it for API requests.
 * The worker sets a `csrf` cookie on /api/health response.
 */

import { WORKER_URL } from '@/utils/url'

/**
 * Get CSRF token from cookie
 * @returns {string|null}
 */
export function getCSRFToken() {
  const match = document.cookie.match(/csrf=([^;]+)/)
  return match ? match[1] : null
}

/**
 * Ensure CSRF cookie exists (fetch health endpoint to set it)
 * @returns {Promise<string|null>}
 */
export async function ensureCSRFToken() {
  let token = getCSRFToken()
  if (token) return token
  
  // Fetch health endpoint to get CSRF cookie set
  try {
    await fetch(`${WORKER_URL}/api/health`, { credentials: 'include' })
    token = getCSRFToken()
  } catch (e) {
    console.warn('Failed to fetch CSRF token:', e)
  }
  return token
}

/**
 * Make an authenticated API call with CSRF protection
 * @param {string} path - API path (e.g., '/api/checkout')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${WORKER_URL}${path}`
  const method = (options.method || 'GET').toUpperCase()
  
  const headers = { ...options.headers }
  
  // Add auth token if available
  const { supabase } = await import('@/services/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  // Add CSRF token for mutating requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await ensureCSRFToken()
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })
}
