import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Prevent multiple instances from HMR — reuse existing client
if (!window.__supabase) {
  window.__supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = window.__supabase
