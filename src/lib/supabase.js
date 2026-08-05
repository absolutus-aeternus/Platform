import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfzmdvymqqnrzyrtcmlnn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mem1kdnltcXFucnpyeXRjcm1sbm4iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NTk3MTE5MCwiZXhwIjoyMTAxNTI1MTkwfQ.W66Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
