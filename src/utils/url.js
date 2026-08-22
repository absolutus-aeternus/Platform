/**
 * URL Helper Utility
 * Centralized URL construction to prevent double-slash and missing-slash issues.
 */

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://alliancehub-api.absolutus-aeternus.workers.dev'
const APP_URL = import.meta.env.VITE_APP_URL || 'https://alliancehub.dpdns.org'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfzmdvymqqnrzrytcrie.supabase.co'

/**
 * Safely join base URL with path, avoiding double slashes.
 * @param {string} base - Base URL (e.g., 'https://api.example.com')
 * @param {string} path - Path to append (e.g., '/api/v1/users')
 * @returns {string} Properly joined URL
 */
export function joinUrl(base, path) {
  if (!base) return path
  if (!path) return base
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Build a Worker API URL
 * @param {string} path - API path (e.g., '/api/health')
 * @returns {string}
 */
export function workerUrl(path) {
  return joinUrl(WORKER_URL, path)
}

/**
 * Build an app URL (for redirects, canonical, etc.)
 * @param {string} path - Path (e.g., '/login-password-reset')
 * @returns {string}
 */
export function appUrl(path) {
  return joinUrl(APP_URL, path)
}

/**
 * Build a Supabase REST API URL
 * @param {string} path - REST path (e.g., '/rest/v1/products')
 * @returns {string}
 */
export function supabaseUrl(path) {
  return joinUrl(SUPABASE_URL, path)
}

export { WORKER_URL, APP_URL, SUPABASE_URL }
