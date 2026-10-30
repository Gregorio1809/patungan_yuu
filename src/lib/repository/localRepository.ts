import type {
  ItemAssignment,
  ItemWithAssignments,
  Participant,
  Session,
  SessionSnapshot,
} from '../../types/database'
import type { SessionRepository } from './types'

const STORAGE_KEY = 'patungan:local:sessions:v1'
const CHANNEL_NAME = 'patungan-local'

interface LocalSessionRecord {
  session: Session
  participants: Participant[]
  items: ItemWithAssignments[]
}

type LocalStore = Record<string, LocalSessionRecord>

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function makeSlug(store: LocalStore): string {
  let slug = ''
  do {
    slug = makeId().replace(/-/g, '').slice(0, 10)
  } while (!slug || store[slug])
  return slug
}

function normalizeRecord(record: LocalSessionRecord): LocalSessionRecord {
  const rounding = Number(record.session.rounding)

  return {
    session: {
      ...record.session,
      discount_allocation:
        record.session.discount_allocation === 'equal'
          ? 'equal'
          : 'proportional',
      service_percent: Number(record.session.service_percent) || 0,
      tax_base:
        record.session.tax_base === 'before_discount'
          ? 'before_discount'
          : 'after_discount',
      tip_amount: Number(record.session.tip_amount) || 0,
      rounding: rounding === 500 ? 500 : rounding === 1000 ? 1000 : 0,
      receipt_total: Number(record.session.receipt_total) || 0,
    },
    participants: record.participants.map(participant => ({
      ...participant,
      is_payer: Boolean(participant.is_payer),
      paid_at: participant.paid_at ?? null,
      paid_amount:
        participant.paid_amount === null ||
        participant.paid_amount === undefined
          ? null
          : Number(participant.paid_amount),
    })),
    items: record.items.map(cloneItem),
  }
}

function readStore(): LocalStore {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const store = parsed as LocalStore
    const normalized: LocalStore = {}

    for (const [slug, record] of Object.entries(store)) {
      if (!record || !record.session) continue
      normalized[slug] = normalizeRecord(record)
    }

    return normalized
  } catch {
    return {}
  }
}

function writeStore(store: LocalStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function cloneItem(item: ItemWithAssignments): ItemWithAssignments {
  return {
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    discount_value: Number(item.discount_value) || 0,
    item_assignments: item.item_assignments.map(assignment => ({
      ...assignment,
      quantity: Number(assignment.quantity) || 1,
    })),
  }
}

function toSnapshot(record: LocalSessionRecord): SessionSnapshot {
  return {
    ...record.session,
    participants: record.participants.map(participant => ({ ...participant })),
    items: record.items.map(cloneItem),
  }
}

function findRecordBySessionId(
  store: LocalStore,
  sessionId: string,
): LocalSessionRecord | null {
  return (
    Object.values(store).find(record => record.session.id === sessionId) ?? null
  )
}

function findItemRecord(
  store: LocalStore,
  itemId: string,
): { record: LocalSessionRecord; item: ItemWithAssignments } | null {
  for (const record of Object.values(store)) {
    const item = record.items.find(entry => entry.id === itemId)
    if (item) return { record, item }
  }
  return null
}

let broadcastChannel: BroadcastChannel | null = null

function notify(slug: string): void {
  if (typeof BroadcastChannel === 'undefined') return

  try {
    broadcastChannel ??= new BroadcastChannel(CHANNEL_NAME)
    broadcastChannel.postMessage({ slug })
  } catch {
    // Cross-tab sync is optional; localStorage remains the source of truth.
  }
}

function saveRecord(record: LocalSessionRecord): void {
  const store = readStore()
  store[record.session.slug] = record
  writeStore(store)
  notify(record.session.slug)
}

export const localRepository: SessionRepository = {
  async fetchRecentTitles(slugs) {
    const store = readStore()
    const titles: Record<string, string> = {}

    for (const slug of slugs) {
      const record = store[slug]
      if (record) titles[slug] = record.session.title
    }

    return titles
  },

  async loadBySlug(slug) {
    const record = readStore()[slug]
    return record ? toSnapshot(record) : null
  },

  async loadById(id) {
    const record = findRecordBySessionId(readStore(), id)
    return record ? toSnapshot(record) : null
  },

  async createSession(input) {
    const store = readStore()
    const session: Session = {
      id: makeId(),
      slug: makeSlug(store),
      title: input.title.trim(),
      bill_discount_type: 'percent',
      bill_discount_value: 0,
      discount_allocation: 'proportional',
      service_percent: 0,
      tax_percent: 0,
      tax_base: 'after_discount',
      tip_amount: 0,
      rounding: 0,
      receipt_total: 0,
      created_at: new Date().toISOString(),
    }

    store[session.slug] = {
      session,
      participants: [],
      items: [],
    }
    writeStore(store)
    notify(session.slug)

    return session
  },

  async addParticipant(sessionId, name) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')

    const participant: Participant = {
      id: makeId(),
      session_id: sessionId,
      name: name.trim(),
      is_payer: false,
      paid_at: null,
      paid_amount: null,
      created_at: new Date().toISOString(),
    }

    record.participants.push(participant)
    saveRecord(record)
    return participant
  },

  async renameParticipant(participantId, name) {
    const store = readStore()

    for (const record of Object.values(store)) {
      const participant = record.participants.find(
        entry => entry.id === participantId,
      )
      if (!participant) continue

      participant.name = name.trim()
      saveRecord(record)
      return { ...participant }
    }

    throw new Error('Peserta tidak ditemukan.')
  },

  async setPayer(sessionId, participantId) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')
    if (
      participantId &&
      !record.participants.some(participant => participant.id === participantId)
    ) {
      throw new Error('Peserta tidak ditemukan.')
    }

    record.participants = record.participants.map(participant => ({
      ...participant,
      is_payer: participant.id === participantId,
    }))
    saveRecord(record)
  },

  async setParticipantPaid(participantId, paid, amount) {
    const store = readStore()

    for (const record of Object.values(store)) {
      const participant = record.participants.find(
        entry => entry.id === participantId,
      )
      if (!participant) continue

      participant.paid_at = paid ? new Date().toISOString() : null
      participant.paid_amount = paid ? Math.max(0, Math.round(amount)) : null
      saveRecord(record)
      return { ...participant }
    }

    throw new Error('Peserta tidak ditemukan.')
  },

  async removeParticipant(participantId) {
    const store = readStore()

    for (const record of Object.values(store)) {
      if (!record.participants.some(entry => entry.id === participantId)) {
        continue
      }

      record.participants = record.participants.filter(
        entry => entry.id !== participantId,
      )
      record.items = record.items.map(item => ({
        ...item,
        item_assignments: item.item_assignments.filter(
          assignment => assignment.participant_id !== participantId,
        ),
      }))
      saveRecord(record)
      return
    }
  },

  async updateSession(sessionId, patch) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')

    record.session = {
      ...record.session,
      title: patch.title.trim(),
      bill_discount_type: patch.billDiscountType,
      bill_discount_value: patch.billDiscountValue,
      discount_allocation: patch.discountAllocation,
      service_percent: patch.servicePercent,
      tax_percent: patch.taxPercent,
      tax_base: patch.taxBase,
      tip_amount: patch.tipAmount,
      rounding: patch.rounding,
      receipt_total: patch.receiptTotal,
    }

    saveRecord(record)
    return { ...record.session }
  },

  async addItem(sessionId, input) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')

    const item: ItemWithAssignments = {
      id: makeId(),
      session_id: sessionId,
      name: input.name.trim(),
      price: input.price,
      quantity: input.quantity,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      created_at: new Date().toISOString(),
      item_assignments: [],
    }

    record.items.push(item)
    saveRecord(record)
    return cloneItem(item)
  },

  async updateItem(itemId, input) {
    const store = readStore()
    const found = findItemRecord(store, itemId)
    if (!found) throw new Error('Item tidak ditemukan.')

    Object.assign(found.item, {
      name: input.name.trim(),
      price: input.price,
      quantity: input.quantity,
      discount_type: input.discountType,
      discount_value: input.discountValue,
    })

    saveRecord(found.record)
    return cloneItem(found.item)
  },

  async deleteItem(itemId) {
    const store = readStore()

    for (const record of Object.values(store)) {
      const nextItems = record.items.filter(item => item.id !== itemId)
      if (nextItems.length === record.items.length) continue

      record.items = nextItems
      saveRecord(record)
      return
    }
  },

  async setClaim(sessionId, itemId, participantId, quantity) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')

    const item = record.items.find(entry => entry.id === itemId)
    if (!item) throw new Error('Item tidak ditemukan.')

    const participant = record.participants.find(
      entry => entry.id === participantId,
    )
    if (!participant) throw new Error('Peserta tidak ditemukan.')

    if (quantity === null || quantity <= 0) {
      item.item_assignments = item.item_assignments.filter(
        assignment => assignment.participant_id !== participantId,
      )
      saveRecord(record)
      return null
    }

    const weight = Math.max(1, Math.round(quantity))
    const assignment: ItemAssignment = {
      item_id: itemId,
      participant_id: participantId,
      session_id: sessionId,
      quantity: weight,
    }

    const existing = item.item_assignments.find(
      entry => entry.participant_id === participantId,
    )

    if (existing) {
      Object.assign(existing, assignment)
    } else {
      item.item_assignments.push(assignment)
    }

    saveRecord(record)
    return { ...assignment }
  },

  async setClaimsForItems(sessionId, itemIds, participantIds) {
    const store = readStore()
    const record = findRecordBySessionId(store, sessionId)
    if (!record) throw new Error('Sesi tidak ditemukan.')

    const validParticipantIds = participantIds.filter(participantId =>
      record.participants.some(participant => participant.id === participantId),
    )
    if (validParticipantIds.length === 0) return []

    const created: ItemAssignment[] = []

    for (const itemId of itemIds) {
      const item = record.items.find(entry => entry.id === itemId)
      if (!item) continue

      for (const participantId of validParticipantIds) {
        const assignment: ItemAssignment = {
          item_id: itemId,
          participant_id: participantId,
          session_id: sessionId,
          quantity: 1,
        }
        const existing = item.item_assignments.find(
          entry => entry.participant_id === participantId,
        )

        if (existing) {
          Object.assign(existing, assignment)
        } else {
          item.item_assignments.push(assignment)
        }
        created.push({ ...assignment })
      }
    }

    saveRecord(record)
    return created
  },

  subscribe(session, onChange, onStatus) {
    onStatus(true)

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) onChange()
    }

    window.addEventListener('storage', onStorage)

    let channel: BroadcastChannel | null = null
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = event => {
        if (
          event.data &&
          typeof event.data === 'object' &&
          event.data.slug === session.slug
        ) {
          onChange()
        }
      }
    }

    return () => {
      window.removeEventListener('storage', onStorage)
      channel?.close()
      onStatus(false)
    }
  },
}
