import { create } from 'zustand'
import type { Language } from '../i18n/translations'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'patungan:preferences'

interface StoredPreferences {
  language?: unknown
  theme?: unknown
}

function readStoredPreferences(): StoredPreferences {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as StoredPreferences
  } catch {
    return {}
  }
}

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function initialPreferences(): {
  language: Language
  theme: Theme
} {
  const stored = readStoredPreferences()
  return {
    language: stored.language === 'en' ? 'en' : 'id',
    theme:
      stored.theme === 'dark' || stored.theme === 'light'
        ? stored.theme
        : systemTheme(),
  }
}

function persistPreferences(language: Language, theme: Theme) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, theme }),
    )
  } catch {
    // Preferences still work for this tab if storage is unavailable.
  }
}

export function applyPreferences(language: Language, theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.lang = language === 'en' ? 'en' : 'id'
  root.style.colorScheme = theme

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute(
      'content',
      theme === 'dark' ? '#0f0f0f' : '#f7f7f7',
    )
  }

  const descriptionMeta = document.querySelector(
    'meta[name="description"]',
  )
  if (descriptionMeta) {
    descriptionMeta.setAttribute(
      'content',
      language === 'en'
        ? 'Patungan Yuu: split bills without drama. Claim items, set shipping, discounts, service, tax, and see everyone’s total.'
        : 'Patungan Yuu: bagi bill bareng tanpa drama. Klaim item, atur ongkir, diskon, service, pajak, dan lihat total tiap orang.',
    )
  }

  document.title =
    language === 'en'
      ? 'Patungan Yuu — Split bills without drama'
      : 'Patungan Yuu — Bagi bill tanpa drama'
}

interface PreferencesStore {
  language: Language
  theme: Theme
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  toggleLanguage: () => void
  toggleTheme: () => void
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  ...initialPreferences(),

  setLanguage(language) {
    set({ language })
    persistPreferences(language, get().theme)
    applyPreferences(language, get().theme)
  },

  setTheme(theme) {
    set({ theme })
    persistPreferences(get().language, theme)
    applyPreferences(get().language, theme)
  },

  toggleLanguage() {
    get().setLanguage(get().language === 'id' ? 'en' : 'id')
  },

  toggleTheme() {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },
}))
