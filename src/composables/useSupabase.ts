// Re-export from services/supabase.js to avoid creating duplicate Supabase clients
// This prevents duplicate WebSocket connections to Supabase Realtime
export { supabase, getR2ImageUrl } from '@/services/supabase'
export { supabase as default } from '@/services/supabase'
