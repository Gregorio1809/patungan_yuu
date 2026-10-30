import type { RealtimeChannel } from '@supabase/supabase-js'
import { errorMessage } from '../errors'
import { isSupabaseConfigured, requireSupabase, supabase } from '../supabase'
import type {
  DiscountType,
  ItemWithAssignments,
  Participant,
  Session,
  SessionSnapshot,
} from '../../types/database'
import type { SessionRepository } from './types'

const REALTIME_TABLES = [
  'sessions',
  'participants',
  'items',
  'item_assignments',
] as const

interface RawSessionRow {
  id: string
  slug: string
  title: string
  bill_discount_type: string
  bill_discount_value: number | string
  discount_allocation?: string | null
  discount_scope?: string | null
  shipping_amount?: number | string | null
  service_percent?: number | string | null
  tax_percent: number | string
  tax_base?: string | null
  tip_amount?: number | string | null
  rounding?: number | string | null
  receipt_total?: number | string | null
  created_at: string
}

interface RawParticipantRow {
  id: string
  session_id: string
  name: string
  is_payer?: boolean | null
  paid_at?: string | null
  paid_amount?: number | string | null
  created_at: string
}

interface RawAssignmentRow {
  item_id: string
  participant_id: string
  session_id: string
  quantity: number
}

interface RawItemRow {
  id: string
  session_id: string
  name: string
  price: number | string
  quantity: number
  discount_type: string
  discount_value: number | string
  created_at: string
  item_assignments?: RawAssignmentRow[] | null
}

interface RawSnapshotRow extends RawSessionRow {
  participants?: RawParticipantRow[] | null
  items?: RawItemRow[] | null
}

function toDiscountType(value: string): DiscountType {
  return value === 'amount' ? 'amount' : 'percent'
}

function normalizeSession(row: RawSessionRow): Session {
  const rounding = Number(row.rounding)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bill_discount_type: toDiscountType(row.bill_discount_type),
    bill_discount_value: Number(row.bill_discount_value) || 0,
    discount_allocation:
      row.discount_allocation === 'equal' ? 'equal' : 'proportional',
    discount_scope: row.discount_scope === 'final' ? 'final' : 'items',
    shipping_amount: Number(row.shipping_amount) || 0,
    service_percent: Number(row.service_percent) || 0,
    tax_percent: Number(row.tax_percent) || 0,
    tax_base:
      row.tax_base === 'before_discount' ? 'before_discount' : 'after_discount',
    tip_amount: Number(row.tip_amount) || 0,
    rounding: rounding === 500 ? 500 : rounding === 1000 ? 1000 : 0,
    receipt_total: Number(row.receipt_total) || 0,
    created_at: row.created_at,
  }
}

function normalizeParticipant(row: RawParticipantRow): Participant {
  return {
    id: row.id,
    session_id: row.session_id,
    name: row.name.trim(),
    is_payer: Boolean(row.is_payer),
    paid_at: row.paid_at ?? null,
    paid_amount:
      row.paid_amount === null || row.paid_amount === undefined
        ? null
        : Number(row.paid_amount),
    created_at: row.created_at,
  }
}

function normalizeItem(row: RawItemRow): ItemWithAssignments {
  return {
    id: row.id,
    session_id: row.session_id,
    name: row.name,
    price: Number(row.price) || 0,
    quantity: Number(row.quantity) || 1,
    discount_type: toDiscountType(row.discount_type),
    discount_value: Number(row.discount_value) || 0,
    created_at: row.created_at,
    item_assignments: (row.item_assignments ?? []).map(assignment => ({
      ...assignment,
      quantity: Number(assignment.quantity) || 1,
    })),
  }
}

function sortByCreatedAt<T extends { created_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

async function fetchSnapshot(
  column: 'slug' | 'id',
  value: string,
): Promise<SessionSnapshot | null> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('sessions')
    .select('*, participants(*), items(*, item_assignments(*))')
    .eq(column, value)
    .maybeSingle()

  if (error) throw new Error(errorMessage(error))
  if (!data) return null

  const raw = data as unknown as RawSnapshotRow

  return {
    ...normalizeSession(raw),
    participants: sortByCreatedAt(
      (raw.participants ?? []).map(normalizeParticipant),
    ),
    items: sortByCreatedAt((raw.items ?? []).map(normalizeItem)),
  }
}

export const supabaseRepository: SessionRepository = {
  async fetchRecentTitles(slugs) {
    if (!isSupabaseConfigured || slugs.length === 0) return {}

    const client = requireSupabase()
    const { data, error } = await client
      .from('sessions')
      .select('slug, title')
      .in('slug', slugs)

    if (error || !data) return {}

    return Object.fromEntries(data.map(row => [row.slug, row.title]))
  },

  loadBySlug(slug) {
    return fetchSnapshot('slug', slug)
  },

  loadById(id) {
    return fetchSnapshot('id', id)
  },

  async createSession(input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('sessions')
      .insert({ title: input.title.trim() })
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeSession(data as unknown as RawSessionRow)
  },

  async addParticipant(sessionId, name) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('participants')
      .insert({ session_id: sessionId, name: name.trim() })
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeParticipant(data as unknown as RawParticipantRow)
  },

  async renameParticipant(participantId, name) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('participants')
      .update({ name: name.trim() })
      .eq('id', participantId)
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeParticipant(data as unknown as RawParticipantRow)
  },

  async removeParticipant(participantId) {
    const client = requireSupabase()
    const { error } = await client
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (error) throw new Error(errorMessage(error))
  },

  async setPayer(sessionId, participantId) {
    const client = requireSupabase()
    const { error: clearError } = await client
      .from('participants')
      .update({ is_payer: false })
      .eq('session_id', sessionId)

    if (clearError) throw new Error(errorMessage(clearError))
    if (!participantId) return

    const { error: setError } = await client
      .from('participants')
      .update({ is_payer: true })
      .eq('id', participantId)
      .eq('session_id', sessionId)

    if (setError) throw new Error(errorMessage(setError))
  },

  async setParticipantPaid(participantId, paid, amount) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('participants')
      .update({
        paid_at: paid ? new Date().toISOString() : null,
        paid_amount: paid ? Math.max(0, Math.round(amount)) : null,
      })
      .eq('id', participantId)
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeParticipant(data as unknown as RawParticipantRow)
  },

  async updateSession(sessionId, patch) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('sessions')
      .update({
        title: patch.title.trim(),
        bill_discount_type: patch.billDiscountType,
        bill_discount_value: patch.billDiscountValue,
        discount_allocation: patch.discountAllocation,
        discount_scope: patch.discountScope,
        shipping_amount: patch.shippingAmount,
        service_percent: patch.servicePercent,
        tax_percent: patch.taxPercent,
        tax_base: patch.taxBase,
        tip_amount: patch.tipAmount,
        rounding: patch.rounding,
        receipt_total: patch.receiptTotal,
      })
      .eq('id', sessionId)
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeSession(data as unknown as RawSessionRow)
  },

  async addItem(sessionId, input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('items')
      .insert({
        session_id: sessionId,
        name: input.name.trim(),
        price: input.price,
        quantity: input.quantity,
        discount_type: input.discountType,
        discount_value: input.discountValue,
      })
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeItem(data as unknown as RawItemRow)
  },

  async updateItem(itemId, input) {
    const client = requireSupabase()
    const { data, error } = await client
      .from('items')
      .update({
        name: input.name.trim(),
        price: input.price,
        quantity: input.quantity,
        discount_type: input.discountType,
        discount_value: input.discountValue,
      })
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))
    return normalizeItem(data as unknown as RawItemRow)
  },

  async deleteItem(itemId) {
    const client = requireSupabase()
    const { error } = await client.from('items').delete().eq('id', itemId)

    if (error) throw new Error(errorMessage(error))
  },

  async setClaim(sessionId, itemId, participantId, quantity) {
    const client = requireSupabase()

    if (quantity === null || quantity <= 0) {
      const { error } = await client
        .from('item_assignments')
        .delete()
        .eq('item_id', itemId)
        .eq('participant_id', participantId)

      if (error) throw new Error(errorMessage(error))
      return null
    }

    const weight = Math.max(1, Math.round(quantity))
    const { data, error } = await client
      .from('item_assignments')
      .upsert(
        {
          item_id: itemId,
          participant_id: participantId,
          session_id: sessionId,
          quantity: weight,
        },
        { onConflict: 'item_id,participant_id' },
      )
      .select('*')
      .single()

    if (error) throw new Error(errorMessage(error))

    const assignment = data as unknown as RawAssignmentRow
    return {
      item_id: assignment.item_id,
      participant_id: assignment.participant_id,
      session_id: assignment.session_id,
      quantity: Number(assignment.quantity),
    }
  },

  async setClaimsForItems(sessionId, itemIds, participantIds) {
    const rows = itemIds.flatMap(itemId =>
      participantIds.map(participantId => ({
        item_id: itemId,
        participant_id: participantId,
        session_id: sessionId,
        quantity: 1,
      })),
    )

    if (rows.length === 0) return []

    const client = requireSupabase()
    const { data, error } = await client
      .from('item_assignments')
      .upsert(rows, { onConflict: 'item_id,participant_id' })
      .select('*')

    if (error) throw new Error(errorMessage(error))

    return (data ?? []).map(row => {
      const assignment = row as unknown as RawAssignmentRow
      return {
        item_id: assignment.item_id,
        participant_id: assignment.participant_id,
        session_id: assignment.session_id,
        quantity: Number(assignment.quantity),
      }
    })
  },

  subscribe(session, onChange, onStatus) {
    if (!supabase) {
      onStatus(false)
      return () => {}
    }

    const client = supabase
    const channel: RealtimeChannel = client.channel(
      `patungan-room-${session.id}`,
    )

    for (const table of REALTIME_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => onChange(),
      )
    }

    channel.subscribe(status => {
      onStatus(status === 'SUBSCRIBED')
    })

    return () => {
      onStatus(false)
      void client.removeChannel(channel)
    }
  },
}
