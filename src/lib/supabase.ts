import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ''

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient<Database>(url, anonKey, {
      auth: { persistSession: false },
    })
  : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi.')
  }
  return supabase
}
