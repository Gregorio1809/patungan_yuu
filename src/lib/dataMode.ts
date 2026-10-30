import { isSupabaseConfigured } from './supabase'

export type DataMode = 'local' | 'supabase'

const requested = (import.meta.env.VITE_DATA_MODE ?? '').trim().toLowerCase()

/**
 * Local mode dipakai otomatis saat development tanpa kredensial Supabase.
 * Production tetap memakai Supabase; `VITE_DATA_MODE` bisa memaksa salah satu
 * mode saat testing.
 */
export const dataMode: DataMode =
  requested === 'local'
    ? 'local'
    : requested === 'supabase'
      ? 'supabase'
      : import.meta.env.DEV && !isSupabaseConfigured
        ? 'local'
        : 'supabase'

export const isLocalMode = dataMode === 'local'
