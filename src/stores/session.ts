import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase'
import { calculate } from '../lib/calculate'
import type { CalcInput } from '../lib/calculate'
import { rememberSession } from '../lib/identity'
import type {
  DiscountType,
  ItemAssignment,
  ItemWithAssignments,
  NewItemInput,
  NewSessionInput,
  Participant,
  Session,
  SessionSettingsPatch,
  SessionSnapshot,
} from '../types/database'

interface RawSessionRow {
  id: string
  slug: string
  title: string
  bill_discount_type: string
  bill_discount_value: number | string
  tax_percent: number | string
  created_at: string
}

interface RawParticipantRow {
  id: string
  session_id: string
  name: string
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

const REALTIME_TABLES = ['sessions', 'participants', 'items', 'item_assignments'] as const

function toDiscountType(value: string): DiscountType {
  return value === 'amount' ? 'amount' : 'percent'
}

function normalizeSession(row: RawSessionRow): Session {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bill_discount_type: toDiscountType(row.bill_discount_type),
    bill_discount_value: Number(row.bill_discount_value) || 0,
    tax_percent: Number(row.tax_percent) || 0,
    created_at: row.created_at,
  }
}

function normalizeParticipant(row: RawParticipantRow): Participant {
  return { ...row, name: row.name.trim() }
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

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return 'Terjadi kesalahan.'
}

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(null)
  const participants = ref<Participant[]>([])
  const items = ref<ItemWithAssignments[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)
  const connected = ref(false)

  let channel: RealtimeChannel | null = null
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  const calcInput = computed<CalcInput>(() => ({
    participants: participants.value.map(participant => ({
      id: participant.id,
      name: participant.name,
    })),
    items: items.value.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discountType: item.discount_type,
      discountValue: item.discount_value,
      claims: item.item_assignments.map(assignment => ({
        participantId: assignment.participant_id,
        quantity: assignment.quantity,
      })),
    })),
    billDiscountType: session.value?.bill_discount_type ?? 'percent',
    billDiscountValue: session.value?.bill_discount_value ?? 0,
    taxPercent: session.value?.tax_percent ?? 0,
  }))

  const result = computed(() => calculate(calcInput.value))

  function applySnapshot(row: RawSnapshotRow) {
    session.value = normalizeSession(row)
    participants.value = (row.participants ?? [])
      .map(normalizeParticipant)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
    items.value = (row.items ?? [])
      .map(normalizeItem)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  async function fetchBy(column: 'slug' | 'id', value: string): Promise<SessionSnapshot | null> {
    const client = requireSupabase()
    const { data, error: queryError } = await client
      .from('sessions')
      .select('*, participants(*), items(*, item_assignments(*))')
      .eq(column, value)
      .maybeSingle()

    if (queryError) throw new Error(errorMessage(queryError))
    if (!data) return null

    const raw = data as unknown as RawSnapshotRow
    applySnapshot(raw)
    return {
      ...normalizeSession(raw),
      participants: participants.value,
      items: items.value,
    }
  }

  async function loadBySlug(slug: string): Promise<boolean> {
    stopRealtime()
    loading.value = true
    error.value = null
    notFound.value = false
    session.value = null
    participants.value = []
    items.value = []

    if (!isSupabaseConfigured) {
      error.value = 'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      loading.value = false
      return false
    }

    try {
      const snapshot = await fetchBy('slug', slug)
      if (!snapshot) {
        notFound.value = true
        return false
      }

      rememberSession({ slug: snapshot.slug, title: snapshot.title })
      startRealtime()
      return true
    } catch (loadError) {
      error.value = errorMessage(loadError)
      return false
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    if (!session.value) return

    try {
      const snapshot = await fetchBy('id', session.value.id)
      if (!snapshot) {
        stopRealtime()
        session.value = null
        participants.value = []
        items.value = []
        notFound.value = true
      }
    } catch {
      connected.value = false
    }
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(() => {
      refreshTimer = null
      void refresh()
    }, 200)
  }

  function startRealtime() {
    if (!supabase || !session.value) return

    stopRealtime()

    const currentChannel = supabase.channel(`patungan-room-${session.value.id}`)
    for (const table of REALTIME_TABLES) {
      currentChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => scheduleRefresh(),
      )
    }

    currentChannel.subscribe(status => {
      connected.value = status === 'SUBSCRIBED'
    })

    channel = currentChannel
  }

  function stopRealtime() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    if (channel && supabase) {
      void supabase.removeChannel(channel)
    }

    channel = null
    connected.value = false
  }

  async function createSession(input: NewSessionInput): Promise<Session> {
    const client = requireSupabase()
    const { data, error: insertError } = await client
      .from('sessions')
      .insert({
        title: input.title.trim(),
        bill_discount_type: input.billDiscountType,
        bill_discount_value: input.billDiscountValue,
        tax_percent: input.taxPercent,
      })
      .select('*')
      .single()

    if (insertError) throw new Error(errorMessage(insertError))

    const created = normalizeSession(data as unknown as RawSessionRow)
    rememberSession({ slug: created.slug, title: created.title })
    return created
  }

  async function addParticipant(name: string): Promise<Participant> {
    const client = requireSupabase()
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const { data, error: insertError } = await client
      .from('participants')
      .insert({ session_id: session.value.id, name: name.trim() })
      .select('*')
      .single()

    if (insertError) throw new Error(errorMessage(insertError))

    const participant = normalizeParticipant(data as unknown as RawParticipantRow)
    participants.value = [...participants.value, participant]
    return participant
  }

  async function removeParticipant(participantId: string): Promise<void> {
    const client = requireSupabase()
    const { error: deleteError } = await client
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (deleteError) throw new Error(errorMessage(deleteError))

    participants.value = participants.value.filter(
      participant => participant.id !== participantId,
    )
    items.value = items.value.map(item => ({
      ...item,
      item_assignments: item.item_assignments.filter(
        assignment => assignment.participant_id !== participantId,
      ),
    }))
  }

  async function updateSession(patch: SessionSettingsPatch): Promise<void> {
    const client = requireSupabase()
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const { data, error: updateError } = await client
      .from('sessions')
      .update({
        title: patch.title.trim(),
        bill_discount_type: patch.billDiscountType,
        bill_discount_value: patch.billDiscountValue,
        tax_percent: patch.taxPercent,
      })
      .eq('id', session.value.id)
      .select('*')
      .single()

    if (updateError) throw new Error(errorMessage(updateError))

    session.value = normalizeSession(data as unknown as RawSessionRow)
    rememberSession({ slug: session.value.slug, title: session.value.title })
  }

  async function addItem(input: NewItemInput): Promise<ItemWithAssignments> {
    const client = requireSupabase()
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const { data, error: insertError } = await client
      .from('items')
      .insert({
        session_id: session.value.id,
        name: input.name.trim(),
        price: input.price,
        quantity: input.quantity,
        discount_type: input.discountType,
        discount_value: input.discountValue,
      })
      .select('*')
      .single()

    if (insertError) throw new Error(errorMessage(insertError))

    const item = normalizeItem(data as unknown as RawItemRow)
    items.value = [...items.value, item]
    return item
  }

  async function updateItem(itemId: string, input: NewItemInput): Promise<void> {
    const client = requireSupabase()
    const { data, error: updateError } = await client
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

    if (updateError) throw new Error(errorMessage(updateError))

    const updated = normalizeItem(data as unknown as RawItemRow)
    items.value = items.value.map(item =>
      item.id === itemId
        ? { ...updated, item_assignments: item.item_assignments }
        : item,
    )
  }

  async function deleteItem(itemId: string): Promise<void> {
    const client = requireSupabase()
    const { error: deleteError } = await client.from('items').delete().eq('id', itemId)

    if (deleteError) throw new Error(errorMessage(deleteError))

    items.value = items.value.filter(item => item.id !== itemId)
  }

  async function setClaim(
    itemId: string,
    participantId: string,
    quantity: number | null,
  ): Promise<void> {
    const client = requireSupabase()
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const currentItem = items.value.find(item => item.id === itemId)
    if (!currentItem) return

    const previous =
      currentItem.item_assignments.find(
        assignment => assignment.participant_id === participantId,
      ) ?? null

    function applyAssignment(next: ItemAssignment | null) {
      items.value = items.value.map(item => {
        if (item.id !== itemId) return item
        const others = item.item_assignments.filter(
          assignment => assignment.participant_id !== participantId,
        )
        return {
          ...item,
          item_assignments: next ? [...others, next] : others,
        }
      })
    }

    if (quantity === null || quantity <= 0) {
      applyAssignment(null)

      const { error: deleteError } = await client
        .from('item_assignments')
        .delete()
        .eq('item_id', itemId)
        .eq('participant_id', participantId)

      if (deleteError) {
        applyAssignment(previous)
        throw new Error(errorMessage(deleteError))
      }
      return
    }

    const weight = Math.max(1, Math.round(quantity))
    applyAssignment({
      item_id: itemId,
      participant_id: participantId,
      session_id: session.value.id,
      quantity: weight,
    })

    const { data, error: upsertError } = await client
      .from('item_assignments')
      .upsert(
        {
          item_id: itemId,
          participant_id: participantId,
          session_id: session.value.id,
          quantity: weight,
        },
        { onConflict: 'item_id,participant_id' },
      )
      .select('*')
      .single()

    if (upsertError) {
      applyAssignment(previous)
      throw new Error(errorMessage(upsertError))
    }

    const assignment = data as unknown as RawAssignmentRow
    applyAssignment({
      item_id: assignment.item_id,
      participant_id: assignment.participant_id,
      session_id: assignment.session_id,
      quantity: Number(assignment.quantity),
    })
  }

  return {
    session,
    participants,
    items,
    loading,
    error,
    notFound,
    connected,
    result,
    loadBySlug,
    refresh,
    startRealtime,
    stopRealtime,
    createSession,
    addParticipant,
    removeParticipant,
    updateSession,
    addItem,
    updateItem,
    deleteItem,
    setClaim,
  }
})
