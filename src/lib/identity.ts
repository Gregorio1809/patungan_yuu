const IDENTITY_PREFIX = 'patungan:identity:'
const RECENT_KEY = 'patungan:recent'
const MAX_RECENT = 10
const PROBE_KEY = '__patungan_storage_probe__'

export interface RecentSession {
  slug: string
  title: string
  visitedAt: number
}

function safeStorage(): Storage | null {
  try {
    const storage = window.localStorage
    storage.setItem(PROBE_KEY, '1')
    storage.removeItem(PROBE_KEY)
    return storage
  } catch {
    return null
  }
}

export function getIdentity(slug: string): string | null {
  return safeStorage()?.getItem(IDENTITY_PREFIX + slug) ?? null
}

export function setIdentity(slug: string, participantId: string): void {
  safeStorage()?.setItem(IDENTITY_PREFIX + slug, participantId)
}

export function clearIdentity(slug: string): void {
  safeStorage()?.removeItem(IDENTITY_PREFIX + slug)
}

export function getRecentSessions(): RecentSession[] {
  const raw = safeStorage()?.getItem(RECENT_KEY)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(
        (entry): entry is RecentSession =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as RecentSession).slug === 'string' &&
          typeof (entry as RecentSession).title === 'string',
      )
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export function rememberSession(entry: { slug: string; title: string }): void {
  const storage = safeStorage()
  if (!storage) return

  const next: RecentSession[] = [
    { ...entry, visitedAt: Date.now() },
    ...getRecentSessions().filter(item => item.slug !== entry.slug),
  ].slice(0, MAX_RECENT)

  storage.setItem(RECENT_KEY, JSON.stringify(next))
}

export function forgetSession(slug: string): void {
  const storage = safeStorage()
  if (!storage) return

  storage.setItem(
    RECENT_KEY,
    JSON.stringify(getRecentSessions().filter(item => item.slug !== slug)),
  )
}
