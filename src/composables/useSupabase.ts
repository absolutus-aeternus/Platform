import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// R2 image URL helper
export function getR2ImageUrl(key: string, width?: number): string {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL
  if (!publicUrl) return key
  let url = `${publicUrl}/${key}`
  if (width) url += `?width=${width}&format=webp`
  return url
}

export default supabase
