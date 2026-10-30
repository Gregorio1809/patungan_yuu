import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { calculate } from '../lib/calculate'
import type { CalcInput } from '../lib/calculate'
import { dataMode } from '../lib/dataMode'
import { errorMessage } from '../lib/errors'
import { rememberSession } from '../lib/identity'
import { sessionRepository } from '../lib/repository'
import { isSupabaseConfigured } from '../lib/supabase'
import type {
  ItemAssignment,
  ItemWithAssignments,
  NewItemInput,
  NewSessionInput,
  Participant,
  Session,
  SessionSettingsPatch,
  SessionSnapshot,
} from '../types/database'

function sortByCreatedAt<T extends { created_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(null)
  const participants = ref<Participant[]>([])
  const items = ref<ItemWithAssignments[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const notFound = ref(false)
  const connected = ref(false)

  let unsubscribe: (() => void) | null = null
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
    discountAllocation: session.value?.discount_allocation ?? 'proportional',
    servicePercent: session.value?.service_percent ?? 0,
    taxPercent: session.value?.tax_percent ?? 0,
    taxBase: session.value?.tax_base ?? 'after_discount',
    tipAmount: session.value?.tip_amount ?? 0,
  }))

  const result = computed(() => calculate(calcInput.value))

  function applySnapshot(snapshot: SessionSnapshot) {
    const {
      participants: snapshotParticipants,
      items: snapshotItems,
      ...sessionData
    } = snapshot

    session.value = sessionData
    participants.value = sortByCreatedAt(snapshotParticipants)
    items.value = sortByCreatedAt(snapshotItems)
  }

  async function loadBySlug(slug: string): Promise<boolean> {
    stopRealtime()
    loading.value = true
    error.value = null
    notFound.value = false
    session.value = null
    participants.value = []
    items.value = []

    if (dataMode === 'supabase' && !isSupabaseConfigured) {
      error.value =
        'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
      loading.value = false
      return false
    }

    try {
      const snapshot = await sessionRepository.loadBySlug(slug)
      if (!snapshot) {
        notFound.value = true
        return false
      }

      applySnapshot(snapshot)
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
      const snapshot = await sessionRepository.loadById(session.value.id)
      if (!snapshot) {
        stopRealtime()
        session.value = null
        participants.value = []
        items.value = []
        notFound.value = true
        return
      }

      applySnapshot(snapshot)
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
    if (!session.value) return

    stopRealtime()
    unsubscribe = sessionRepository.subscribe(
      session.value,
      () => scheduleRefresh(),
      status => {
        connected.value = status
      },
    )
  }

  function stopRealtime() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    unsubscribe?.()
    unsubscribe = null
    connected.value = false
  }

  async function createSession(input: NewSessionInput): Promise<Session> {
    const created = await sessionRepository.createSession(input)
    rememberSession({ slug: created.slug, title: created.title })
    return created
  }

  async function addParticipant(name: string): Promise<Participant> {
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const participant = await sessionRepository.addParticipant(
      session.value.id,
      name,
    )
    participants.value = sortByCreatedAt([...participants.value, participant])
    return participant
  }

  async function renameParticipant(
    participantId: string,
    name: string,
  ): Promise<void> {
    const updated = await sessionRepository.renameParticipant(
      participantId,
      name,
    )
    participants.value = participants.value.map(participant =>
      participant.id === participantId ? updated : participant,
    )
  }

  async function removeParticipant(participantId: string): Promise<void> {
    await sessionRepository.removeParticipant(participantId)

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

  async function setPayer(participantId: string | null): Promise<void> {
    if (!session.value) throw new Error('Sesi belum dimuat.')

    try {
      await sessionRepository.setPayer(session.value.id, participantId)
      participants.value = participants.value.map(participant => ({
        ...participant,
        is_payer: participant.id === participantId,
      }))
    } catch (error) {
      await refresh()
      throw error
    }
  }

  async function setParticipantPaid(
    participantId: string,
    paid: boolean,
    amount: number,
  ): Promise<void> {
    const updated = await sessionRepository.setParticipantPaid(
      participantId,
      paid,
      amount,
    )
    participants.value = participants.value.map(participant =>
      participant.id === participantId ? updated : participant,
    )
  }

  async function updateSession(patch: SessionSettingsPatch): Promise<void> {
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const updated = await sessionRepository.updateSession(
      session.value.id,
      patch,
    )
    session.value = updated
    rememberSession({ slug: updated.slug, title: updated.title })
  }

  async function addItem(input: NewItemInput): Promise<ItemWithAssignments> {
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const item = await sessionRepository.addItem(session.value.id, input)
    items.value = [...items.value, item]
    return item
  }

  async function duplicateItem(item: ItemWithAssignments): Promise<void> {
    await addItem({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discountType: item.discount_type,
      discountValue: item.discount_value,
    })
  }

  async function updateItem(
    itemId: string,
    input: NewItemInput,
  ): Promise<void> {
    const updated = await sessionRepository.updateItem(itemId, input)

    items.value = items.value.map(item =>
      item.id === itemId
        ? { ...updated, item_assignments: item.item_assignments }
        : item,
    )
  }

  async function deleteItem(itemId: string): Promise<void> {
    await sessionRepository.deleteItem(itemId)
    items.value = items.value.filter(item => item.id !== itemId)
  }

  async function setClaim(
    itemId: string,
    participantId: string,
    quantity: number | null,
  ): Promise<void> {
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

    const optimistic =
      quantity === null || quantity <= 0
        ? null
        : {
            item_id: itemId,
            participant_id: participantId,
            session_id: session.value.id,
            quantity: Math.max(1, Math.round(quantity)),
          }

    applyAssignment(optimistic)

    try {
      const assignment = await sessionRepository.setClaim(
        session.value.id,
        itemId,
        participantId,
        quantity,
      )
      applyAssignment(assignment)
    } catch (error) {
      applyAssignment(previous)
      throw error
    }
  }

  async function claimUnclaimed(mode: 'all' | 'payer'): Promise<number> {
    if (!session.value) throw new Error('Sesi belum dimuat.')

    const itemIds = result.value.unclaimedItems.map(item => item.itemId)
    if (itemIds.length === 0) return 0

    const participantIds =
      mode === 'all'
        ? participants.value.map(participant => participant.id)
        : participants.value
            .filter(participant => participant.is_payer)
            .map(participant => participant.id)

    if (participantIds.length === 0) {
      throw new Error(
        mode === 'payer'
          ? 'Pilih penerima transfer dulu.'
          : 'Belum ada peserta untuk membagi item.',
      )
    }

    await sessionRepository.setClaimsForItems(
      session.value.id,
      itemIds,
      participantIds,
    )
    await refresh()
    return itemIds.length
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
    stopRealtime,
    createSession,
    addParticipant,
    renameParticipant,
    removeParticipant,
    setPayer,
    setParticipantPaid,
    updateSession,
    addItem,
    duplicateItem,
    updateItem,
    deleteItem,
    setClaim,
    claimUnclaimed,
  }
})
