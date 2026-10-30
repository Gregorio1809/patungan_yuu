<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type {
  ItemWithAssignments,
  NewItemInput,
  Participant,
  SessionSettingsPatch,
} from '../types/database'
import { clearIdentity, getIdentity, setIdentity } from '../lib/identity'
import { buildSummaryText, copyText, shareText } from '../lib/share'
import { useSessionStore } from '../stores/session'
import { useToastStore } from '../stores/toast'
import AppIcon from '../components/AppIcon.vue'
import BillSettings from '../components/BillSettings.vue'
import ClaimSheet from '../components/ClaimSheet.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ItemBoard from '../components/ItemBoard.vue'
import ItemFormModal from '../components/ItemFormModal.vue'
import JoinDialog from '../components/JoinDialog.vue'
import ParticipantBar from '../components/ParticipantBar.vue'
import SkeletonRows from '../components/SkeletonRows.vue'
import StickyTotalBar from '../components/StickyTotalBar.vue'
import SummaryPanel from '../components/SummaryPanel.vue'

const route = useRoute()
const store = useSessionStore()
const toast = useToastStore()

const myParticipantId = ref<string | null>(null)
const joinOpen = ref(false)
const joining = ref(false)

const participantAdding = ref(false)
const itemModalOpen = ref(false)
const editingItem = ref<ItemWithAssignments | null>(null)
const itemSaving = ref(false)

const claimItemId = ref<string | null>(null)
const claimPendingIds = ref<string[]>([])

const settingsOpen = ref(false)
const settingsSaving = ref(false)

const confirmDelete = ref<{
  type: 'item' | 'participant'
  id: string
  name: string
} | null>(null)
const deletePending = ref(false)

const slug = computed(() =>
  typeof route.params.slug === 'string' ? route.params.slug : '',
)

const myParticipant = computed(
  () =>
    store.participants.find(
      participant => participant.id === myParticipantId.value,
    ) ?? null,
)

const myResult = computed(
  () =>
    store.result.people.find(
      person => person.participantId === myParticipantId.value,
    ) ?? null,
)

const myTotal = computed(() => myResult.value?.total ?? 0)

const participantTotals = computed<Record<string, number>>(() =>
  Object.fromEntries(
    store.result.people.map(person => [person.participantId, person.total]),
  ),
)

const claimItem = computed(
  () => store.items.find(item => item.id === claimItemId.value) ?? null,
)

const claimOpen = computed({
  get: () => claimItemId.value !== null,
  set: value => {
    if (!value) claimItemId.value = null
  },
})

const shareUrl = computed(
  () => `${window.location.origin}/s/${store.session?.slug ?? ''}`,
)

const deleteTitle = computed(() =>
  confirmDelete.value?.type === 'participant' ? 'Hapus peserta?' : 'Hapus item?',
)

const deleteDescription = computed(() => {
  const target = confirmDelete.value
  if (!target) return ''
  if (target.type === 'participant') {
    return `“${target.name}” akan dihapus beserta semua klaim itemnya.`
  }
  return `“${target.name}” akan dihapus dari daftar item.`
})

async function init(slugValue: string) {
  myParticipantId.value = getIdentity(slugValue)
  joinOpen.value = false
  itemModalOpen.value = false
  editingItem.value = null
  claimItemId.value = null
  settingsOpen.value = false
  confirmDelete.value = null

  await store.loadBySlug(slugValue)
  if (!store.session) return

  if (
    myParticipantId.value &&
    !store.participants.some(
      participant => participant.id === myParticipantId.value,
    )
  ) {
    clearIdentity(slugValue)
    myParticipantId.value = null
  }

  if (!myParticipantId.value) {
    joinOpen.value = true
  }
}

watch(
  slug,
  value => {
    if (value) void init(value)
  },
  { immediate: true },
)

watch(
  () => store.participants,
  participants => {
    if (!myParticipantId.value || store.loading || !store.session) return
    if (
      !participants.some(
        participant => participant.id === myParticipantId.value,
      )
    ) {
      clearIdentity(slug.value)
      myParticipantId.value = null
      joinOpen.value = true
      toast.info('Kamu sudah keluar dari sesi ini. Gabung lagi untuk mengedit.')
    }
  },
  { deep: true },
)

function refreshOnFocus() {
  void store.refresh()
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    void store.refresh()
  }
}

onMounted(() => {
  window.addEventListener('focus', refreshOnFocus)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('focus', refreshOnFocus)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  store.stopRealtime()
})

function requireIdentity(): boolean {
  if (
    myParticipantId.value &&
    store.participants.some(
      participant => participant.id === myParticipantId.value,
    )
  ) {
    return true
  }
  joinOpen.value = true
  toast.info('Gabung dulu untuk mengubah patungan ini.')
  return false
}

async function handleJoin(name: string) {
  if (!store.session) return

  joining.value = true
  try {
    const existing = store.participants.find(
      participant =>
        participant.name.trim().toLowerCase() === name.trim().toLowerCase(),
    )
    const participant = existing ?? (await store.addParticipant(name))

    myParticipantId.value = participant.id
    setIdentity(slug.value, participant.id)
    joinOpen.value = false
    toast.success(
      existing
        ? `Kamu bergabung sebagai ${participant.name}.`
        : `Halo, ${participant.name}. Kamu sudah bergabung.`,
    )
  } catch {
    toast.error('Gagal bergabung. Coba lagi.')
  } finally {
    joining.value = false
  }
}

async function handleAddParticipant(name: string) {
  if (!requireIdentity()) return

  participantAdding.value = true
  try {
    await store.addParticipant(name)
    toast.success(`${name} ditambahkan.`)
  } catch {
    toast.error('Gagal menambah peserta. Coba lagi.')
  } finally {
    participantAdding.value = false
  }
}

function requestRemoveParticipant(participant: Participant) {
  if (!requireIdentity()) return
  confirmDelete.value = {
    type: 'participant',
    id: participant.id,
    name: participant.name,
  }
}

function openAddItem() {
  if (!requireIdentity()) return
  editingItem.value = null
  itemModalOpen.value = true
}

function openEditItem(item: ItemWithAssignments) {
  if (!requireIdentity()) return
  editingItem.value = item
  itemModalOpen.value = true
}

function requestRemoveItem(item: ItemWithAssignments) {
  if (!requireIdentity()) return
  confirmDelete.value = { type: 'item', id: item.id, name: item.name }
}

async function confirmRemove() {
  const target = confirmDelete.value
  if (!target) return

  const removingSelf =
    target.type === 'participant' && target.id === myParticipantId.value
  deletePending.value = true
  try {
    if (target.type === 'item') {
      await store.deleteItem(target.id)
      toast.success('Item dihapus.')
    } else {
      await store.removeParticipant(target.id)
      if (!removingSelf) {
        toast.success(`${target.name} dihapus dari sesi.`)
      }
    }
    confirmDelete.value = null
  } catch {
    toast.error('Gagal menghapus. Coba lagi.')
  } finally {
    deletePending.value = false
  }
}

async function saveItem(input: NewItemInput) {
  if (!requireIdentity()) return

  const isEdit = Boolean(editingItem.value)
  itemSaving.value = true
  try {
    if (editingItem.value) {
      await store.updateItem(editingItem.value.id, input)
    } else {
      await store.addItem(input)
    }
    itemModalOpen.value = false
    editingItem.value = null
    toast.success(isEdit ? 'Item diperbarui.' : 'Item ditambahkan.')
  } catch {
    toast.error('Gagal menyimpan item. Coba lagi.')
  } finally {
    itemSaving.value = false
  }
}

function openClaim(item: ItemWithAssignments) {
  if (!requireIdentity()) return
  claimItemId.value = item.id
}

async function handleSetClaim(participantId: string, quantity: number | null) {
  if (!claimItemId.value) return

  const itemId = claimItemId.value
  claimPendingIds.value = [...claimPendingIds.value, participantId]
  try {
    await store.setClaim(itemId, participantId, quantity)
  } catch {
    toast.error('Gagal menyimpan klaim. Coba lagi.')
  } finally {
    claimPendingIds.value = claimPendingIds.value.filter(
      id => id !== participantId,
    )
  }
}

function openSettings() {
  if (!requireIdentity()) return
  settingsOpen.value = true
}

async function saveSettings(patch: SessionSettingsPatch) {
  settingsSaving.value = true
  try {
    await store.updateSession(patch)
    settingsOpen.value = false
    toast.success('Pengaturan sesi disimpan.')
  } catch {
    toast.error('Gagal menyimpan pengaturan. Coba lagi.')
  } finally {
    settingsSaving.value = false
  }
}

async function handleCopyLink() {
  const copied = await copyText(shareUrl.value)
  if (copied) {
    toast.success('Link disalin. Bagikan ke peserta lain.')
  } else {
    toast.error('Gagal menyalin link. Salin dari address bar saja.')
  }
}

async function handleShare() {
  if (!store.session) return

  const text = buildSummaryText(store.session, store.result, shareUrl.value)
  const outcome = await shareText(text)
  if (outcome === 'copied') {
    toast.success('Ringkasan disalin ke clipboard.')
  } else if (outcome === 'failed') {
    toast.error('Gagal membagikan ringkasan. Coba lagi.')
  }
}

function retry() {
  if (slug.value) void init(slug.value)
}
</script>

<template>
  <div class="min-h-dvh pb-28 lg:pb-12">
    <header
      class="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur"
    >
      <div
        class="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3"
      >
        <RouterLink
          to="/"
          class="btn btn-ghost btn-icon shrink-0"
          aria-label="Kembali ke beranda"
        >
          <AppIcon name="arrowLeft" :size="20" />
        </RouterLink>

        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
            Patungan
          </p>
          <h1
            class="truncate font-display text-lg leading-tight font-bold"
            :title="store.session?.title"
          >
            {{ store.session?.title ?? 'Memuat sesi...' }}
          </h1>
        </div>

        <div
          v-if="store.session"
          class="hidden items-center gap-1.5 text-xs text-muted sm:flex"
          :title="store.connected ? 'Tersinkron realtime' : 'Menyambung ulang...'"
        >
          <span
            class="size-2 rounded-full"
            :class="store.connected ? 'bg-positive' : 'bg-highlight'"
          />
          {{ store.connected ? 'Tersinkron' : 'Menyambung' }}
        </div>

        <button
          v-if="store.session"
          type="button"
          class="btn btn-secondary btn-sm"
          aria-label="Salin link"
          @click="handleCopyLink"
        >
          <AppIcon name="link" :size="15" />
          <span class="hidden sm:inline">Salin link</span>
        </button>

        <button
          v-if="store.session"
          type="button"
          class="btn btn-ghost btn-icon"
          aria-label="Pengaturan sesi"
          @click="openSettings"
        >
          <AppIcon name="settings" :size="19" />
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div
        v-if="store.loading"
        class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div class="space-y-6">
          <div class="card animate-pulse p-4 sm:p-5">
            <div class="h-4 w-24 rounded-full bg-paper-deep" />
            <div class="mt-4 flex gap-2">
              <div class="h-8 w-28 rounded-full bg-paper-deep" />
              <div class="h-8 w-24 rounded-full bg-paper-deep" />
            </div>
          </div>
          <div class="card overflow-hidden">
            <div class="border-b border-line px-4 py-4">
              <div class="h-4 w-16 rounded-full bg-paper-deep" />
            </div>
            <SkeletonRows :rows="3" />
          </div>
        </div>
        <div class="card overflow-hidden">
          <div class="border-b border-line px-4 py-4">
            <div class="h-4 w-24 rounded-full bg-paper-deep" />
          </div>
          <SkeletonRows :rows="3" />
        </div>
      </div>

      <div v-else-if="store.error" class="mx-auto max-w-lg py-10">
        <div class="card p-6 text-center">
          <div
            class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger"
          >
            <AppIcon name="warning" :size="24" />
          </div>
          <h2 class="mt-3 text-xl font-semibold">Gagal memuat sesi</h2>
          <p class="mt-1 text-sm text-muted">{{ store.error }}</p>
          <div class="mt-5 flex justify-center gap-2">
            <button type="button" class="btn btn-primary" @click="retry">
              Coba lagi
            </button>
            <RouterLink to="/" class="btn btn-secondary">Ke beranda</RouterLink>
          </div>
        </div>
      </div>

      <div
        v-else-if="store.notFound || !store.session"
        class="mx-auto max-w-lg py-10"
      >
        <div class="card p-6 text-center">
          <div
            class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-paper-deep text-muted"
          >
            <AppIcon name="receipt" :size="24" />
          </div>
          <h2 class="mt-3 text-xl font-semibold">Sesi tidak ditemukan</h2>
          <p class="mt-1 text-sm text-muted">
            Link mungkin salah atau sesinya sudah dihapus. Periksa lagi link dari
            pembuat sesi.
          </p>
          <RouterLink to="/" class="btn btn-primary mt-5">
            Buat sesi baru
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <div
          class="mb-5 rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm text-ink-soft"
        >
          Semua orang yang punya link bisa mengubah data. Salin link lewat tombol
          di kanan atas, lalu bagikan ke peserta.
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div class="space-y-6">
            <ParticipantBar
              :participants="store.participants"
              :totals="participantTotals"
              :my-participant-id="myParticipantId"
              :adding="participantAdding"
              @add="handleAddParticipant"
              @remove="requestRemoveParticipant"
            />

            <ItemBoard
              :items="store.items"
              :participants="store.participants"
              :result="store.result"
              :my-participant-id="myParticipantId"
              @add="openAddItem"
              @claim="openClaim"
              @edit="openEditItem"
              @remove="requestRemoveItem"
            />
          </div>

          <div class="lg:sticky lg:top-24">
            <SummaryPanel
              :result="store.result"
              :my-participant-id="myParticipantId"
              @share="handleShare"
            />
          </div>
        </div>
      </template>
    </main>

    <StickyTotalBar
      v-if="!store.loading && !store.error && !store.notFound && store.session"
      :total="myTotal"
      :has-identity="Boolean(myParticipant)"
      :unclaimed-count="store.result.unclaimedItems.length"
      @join="joinOpen = true"
    />

    <JoinDialog
      v-model:open="joinOpen"
      :participants="store.participants"
      :pending="joining"
      @submit="handleJoin"
      @view-only="joinOpen = false"
    />

    <ItemFormModal
      v-model:open="itemModalOpen"
      :item="editingItem"
      :pending="itemSaving"
      @save="saveItem"
    />

    <ClaimSheet
      v-model:open="claimOpen"
      :item="claimItem"
      :participants="store.participants"
      :my-participant-id="myParticipantId"
      :pending-ids="claimPendingIds"
      @set-claim="handleSetClaim"
    />

    <BillSettings
      v-model:open="settingsOpen"
      :session="store.session"
      :claimed-net="store.result.claimedNet"
      :pending="settingsSaving"
      @save="saveSettings"
    />

    <ConfirmDialog
      :open="Boolean(confirmDelete)"
      :title="deleteTitle"
      :description="deleteDescription"
      :confirm-label="confirmDelete?.type === 'item' ? 'Hapus item' : 'Hapus peserta'"
      :pending="deletePending"
      @update:open="value => { if (!value) confirmDelete = null }"
      @confirm="confirmRemove"
    />
  </div>
</template>
