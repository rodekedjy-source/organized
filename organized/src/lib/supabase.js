import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const CHUNK_SIZE = 3180
const MAX_CHUNKS = 11 // ${key}.0 through ${key}.10
const COOKIE_OPTS = `Max-Age=604800; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
const COOKIE_REMOVE = `Max-Age=0; Path=/; SameSite=Lax`

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)')
  )
  return match ? decodeURIComponent(match[1]) : null
}

function setCookieRaw(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_OPTS}`
}

function removeCookieRaw(name) {
  document.cookie = `${name}=; ${COOKIE_REMOVE}`
}

const cookieStorage = {
  getItem(key) {
    // Try single unchunked cookie first
    const single = getCookie(key)
    if (single !== null) return single

    // Try chunked: ${key}.0, ${key}.1, ...
    const chunks = []
    for (let i = 0; i < MAX_CHUNKS; i++) {
      const chunk = getCookie(`${key}.${i}`)
      if (chunk === null) break
      chunks.push(chunk)
    }
    return chunks.length > 0 ? chunks.join('') : null
  },

  setItem(key, value) {
    if (value.length <= CHUNK_SIZE) {
      // Single cookie — remove any leftover chunks
      setCookieRaw(key, value)
      for (let i = 0; i < MAX_CHUNKS; i++) removeCookieRaw(`${key}.${i}`)
    } else {
      // Chunked — remove the single cookie, write chunks
      removeCookieRaw(key)
      const total = Math.ceil(value.length / CHUNK_SIZE)
      for (let i = 0; i < MAX_CHUNKS; i++) {
        if (i < total) {
          setCookieRaw(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))
        } else {
          removeCookieRaw(`${key}.${i}`)
        }
      }
    }
  },

  removeItem(key) {
    removeCookieRaw(key)
    for (let i = 0; i < MAX_CHUNKS; i++) removeCookieRaw(`${key}.${i}`)
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
