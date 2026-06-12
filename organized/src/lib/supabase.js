import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name, value, maxAge) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'SameSite=Lax',
    location.protocol === 'https:' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

function removeCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
}

const cookieStorage = {
  getItem(key) {
    return getCookie(key)
  },
  setItem(key, value) {
    setCookie(key, value, 604800)
  },
  removeItem(key) {
    removeCookie(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: cookieStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
