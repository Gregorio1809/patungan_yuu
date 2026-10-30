import { create } from 'zustand'
import { dataMode } from '../lib/dataMode'
import { errorMessage } from '../lib/errors'
import { rememberSession } from '../lib/identity'
import { sessionRepository } from '../lib/repository'
import { isSupabaseConfigured } from '../lib/supabase'
import { calcSession } from '../lib/sessionCalc'
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

let unsubscribe: (() => void) | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

interface SessionStoreState {
  session: Session | null
  participants: Participant[]
  items: ItemWithAssignments[]
  loading: boolean
  error: string | null
  notFound: boolean
  connected: boolean
  loadBySlug: (slug: string) => Promise<boolean>
  refresh: () => Promise<void>
  stopRealtime: () => void
  createSession: (input: NewSessionInput) => Promise<Session>
  addParticipant: (name: string) => Promise<Participant>
  renameParticipant: (participantId: string, name: string) => Promise<void>
  removeParticipant: (participantId: string) => Promise<void>
  setPayer: (participantId: string | null) => Promise<void>
  setParticipantPaid: (
    participantId: string,
    paid: boolean,
    amount: number,
  ) => Promise<void>
  updateSession: (patch: SessionSettingsPatch) => Promise<void>
  addItem: (input: NewItemInput) => Promise<ItemWithAssignments>
  duplicateItem: (item: ItemWithAssignments) => Promise<void>
  updateItem: (itemId: string, input: NewItemInput) => Promise<void>
  deleteItem: (itemId: string) => Promise<void>
  setClaim: (
    itemId: string,
    participantId: string,
    quantity: number | null,
  ) => Promise<void>
  claimUnclaimed: (mode: 'all' | 'payer') => Promise<number>
}

export const useSessionStore = create<SessionStoreState>((set, get) => {
  function clearRefreshTimer() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  function applySnapshot(snapshot: SessionSnapshot) {
    const {
      participants: snapshotParticipants,
      items: snapshotItems,
      ...sessionData
    } = snapshot

    set({
      session: sessionData,
      participants: sortByCreatedAt(snapshotParticipants),
      items: sortByCreatedAt(snapshotItems),
    })
  }

  function refresh() {
    const current = get().session
    if (!current) return Promise.resolve()

    return sessionRepository
      .loadById(current.id)
      .then(snapshot => {
        if (!snapshot) {
          get().stopRealtime()
          set({
            session: null,
            participants: [],
            items: [],
            notFound: true,
          })
          return
        }
        applySnapshot(snapshot)
      })
      .catch(() => {
        set({ connected: false })
      })
  }

  function scheduleRefresh() {
    clearRefreshTimer()
    refreshTimer = setTimeout(() => {
      refreshTimer = null
      void get().refresh()
    }, 200)
  }

  function startRealtime(current: Session) {
    stopRealtimeInternal()
    unsubscribe = sessionRepository.subscribe(
      current,
      scheduleRefresh,
      status => set({ connected: status }),
    )
  }

  function stopRealtimeInternal() {
    clearRefreshTimer()
    unsubscribe?.()
    unsubscribe = null
    set({ connected: false })
  }

  return {
    session: null,
    participants: [],
    items: [],
    loading: false,
    error: null,
    notFound: false,
    connected: false,

    async loadBySlug(slug) {
      stopRealtimeInternal()
      set({
        loading: true,
        error: null,
        notFound: false,
        session: null,
        participants: [],
        items: [],
      })

      if (dataMode === 'supabase' && !isSupabaseConfigured) {
        set({
          error:
            'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
          loading: false,
        })
        return false
      }

      try {
        const snapshot = await sessionRepository.loadBySlug(slug)
        if (!snapshot) {
          set({ notFound: true })
          return false
        }

        applySnapshot(snapshot)
        rememberSession({ slug: snapshot.slug, title: snapshot.title })
        const current = get().session
        if (current) startRealtime(current)
        return true
      } catch (error) {
        set({ error: errorMessage(error) })
        return false
      } finally {
        set({ loading: false })
      }
    },

    refresh,

    stopRealtime: stopRealtimeInternal,

    async createSession(input) {
      const created = await sessionRepository.createSession(input)
      rememberSession({ slug: created.slug, title: created.title })
      return created
    },

    async addParticipant(name) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      const participant = await sessionRepository.addParticipant(
        current.id,
        name,
      )
      set(state => ({
        participants: sortByCreatedAt([...state.participants, participant]),
      }))
      return participant
    },

    async renameParticipant(participantId, name) {
      const updated = await sessionRepository.renameParticipant(
        participantId,
        name,
      )
      set(state => ({
        participants: state.participants.map(participant =>
          participant.id === participantId ? updated : participant,
        ),
      }))
    },

    async removeParticipant(participantId) {
      await sessionRepository.removeParticipant(participantId)
      set(state => ({
        participants: state.participants.filter(
          participant => participant.id !== participantId,
        ),
        items: state.items.map(item => ({
          ...item,
          item_assignments: item.item_assignments.filter(
            assignment => assignment.participant_id !== participantId,
          ),
        })),
      }))
    },

    async setPayer(participantId) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      try {
        await sessionRepository.setPayer(current.id, participantId)
        set(state => ({
          participants: state.participants.map(participant => ({
            ...participant,
            is_payer: participant.id === participantId,
          })),
        }))
      } catch (error) {
        await get().refresh()
        throw error
      }
    },

    async setParticipantPaid(participantId, paid, amount) {
      const updated = await sessionRepository.setParticipantPaid(
        participantId,
        paid,
        amount,
      )
      set(state => ({
        participants: state.participants.map(participant =>
          participant.id === participantId ? updated : participant,
        ),
      }))
    },

    async updateSession(patch) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      const updated = await sessionRepository.updateSession(
        current.id,
        patch,
      )
      set({ session: updated })
      rememberSession({ slug: updated.slug, title: updated.title })
    },

    async addItem(input) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      const item = await sessionRepository.addItem(current.id, input)
      set(state => ({ items: [...state.items, item] }))
      return item
    },

    async duplicateItem(item) {
      await get().addItem({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discountType: item.discount_type,
        discountValue: item.discount_value,
      })
    },

    async updateItem(itemId, input) {
      const updated = await sessionRepository.updateItem(itemId, input)
      set(state => ({
        items: state.items.map(item =>
          item.id === itemId
            ? { ...updated, item_assignments: item.item_assignments }
            : item,
        ),
      }))
    },

    async deleteItem(itemId) {
      await sessionRepository.deleteItem(itemId)
      set(state => ({
        items: state.items.filter(item => item.id !== itemId),
      }))
    },

    async setClaim(itemId, participantId, quantity) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      const currentItem = get().items.find(item => item.id === itemId)
      if (!currentItem) return

      const previous =
        currentItem.item_assignments.find(
          assignment => assignment.participant_id === participantId,
        ) ?? null

      const applyAssignment = (next: ItemAssignment | null) => {
        set(state => ({
          items: state.items.map(item => {
            if (item.id !== itemId) return item
            const others = item.item_assignments.filter(
              assignment => assignment.participant_id !== participantId,
            )
            return {
              ...item,
              item_assignments: next ? [...others, next] : others,
            }
          }),
        }))
      }

      const optimistic =
        quantity === null || quantity <= 0
          ? null
          : {
              item_id: itemId,
              participant_id: participantId,
              session_id: current.id,
              quantity: Math.max(1, Math.round(quantity)),
            }

      applyAssignment(optimistic)

      try {
        const assignment = await sessionRepository.setClaim(
          current.id,
          itemId,
          participantId,
          quantity,
        )
        applyAssignment(assignment)
      } catch (error) {
        applyAssignment(previous)
        throw error
      }
    },

    async claimUnclaimed(mode) {
      const current = get().session
      if (!current) throw new Error('Sesi belum dimuat.')

      const result = calcSession(current, get().participants, get().items)
      const itemIds = result.unclaimedItems.map(item => item.itemId)
      if (itemIds.length === 0) return 0

      const participantIds =
        mode === 'all'
          ? get().participants.map(participant => participant.id)
          : get()
              .participants.filter(participant => participant.is_payer)
              .map(participant => participant.id)

      if (participantIds.length === 0) {
        throw new Error(
          mode === 'payer'
            ? 'Pilih penerima transfer dulu.'
            : 'Belum ada peserta untuk membagi item.',
        )
      }

      await sessionRepository.setClaimsForItems(
        current.id,
        itemIds,
        participantIds,
      )
      await get().refresh()
      return itemIds.length
    },
  }
})
