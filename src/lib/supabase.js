import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo mode flag - forced true until real auth is implemented
// When ready for real auth, change this to: supabaseUrl === 'https://your-project.supabase.co'
export const isDemoMode = true
