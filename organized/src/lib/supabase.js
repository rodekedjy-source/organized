import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const _TOKEN_KEY = 'sb-bwfpioxvfqwnwzkvtebg-auth-token'

supabase.auth.onAuthStateChange((event, session) => {
  console.log('[AUTH EVENT]', event, 'session:', session ? 'EXISTS' : 'NULL',
    'token:', localStorage.getItem(_TOKEN_KEY) ? 'PRESENT' : 'MISSING')
})

window.addEventListener('beforeunload', () => {
  console.log('[BEFORE UNLOAD] token:', localStorage.getItem(_TOKEN_KEY) ? 'PRESENT' : 'MISSING')
})

window.addEventListener('storage', (e) => {
  console.log('[STORAGE EVENT] key:', e.key, 'oldValue:', e.oldValue ? 'HAD VALUE' : 'NULL',
    'newValue:', e.newValue ? 'HAS VALUE' : 'NULL')
})
