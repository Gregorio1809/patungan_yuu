import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  RiErrorWarningLine,
  RiFileList3Line,
} from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import { isLocalMode } from '../lib/dataMode'
import { clearIdentity, getIdentity, setIdentity } from '../lib/identity'
import { buildSummaryText, copyText } from '../lib/share'
import { useSessionResult } from '../hooks/useSessionResult'
import { useSessionStore } from '../store/session'
import { useToastStore } from '../store/toast'
import type {
  ItemWithAssignments,
  NewItemInput,
  Participant,
  SessionSettingsPatch,
} from '../types/database'
import { AppHeader } from '../components/AppHeader'
import { BillSettingsDialog } from '../components/BillSettingsDialog'
import { ClaimDialog } from '../components/ClaimDialog'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ItemCard } from '../components/ItemCard'
import { ItemDialog } from '../components/ItemDialog'
import { JoinDialog } from '../components/JoinDialog'
import { ParticipantCard } from '../components/ParticipantCard'
import { ParticipantDialog } from '../components/ParticipantDialog'
import { QrDialog } from '../components/QrDialog'
import { SessionHeader } from '../components/SessionHeader'
import { SettlementCard } from '../components/SettlementCard'
import { StickyTotalBar } from '../components/StickyTotalBar'
import { SummaryCard } from '../components/SummaryCard'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type ItemDialogState = {
  open: boolean
  item: ItemWithAssignments | null
}

type ParticipantDialogState = {
  open: boolean
  participant: Participant | null
}

type ConfirmState = {
  title: string
  description: string
  confirmLabel: string
  action: () => void | Promise<void>
} | null

export function SessionView() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const store = useSessionStore()
  const result = useSessionResult()
  const toast = useToastStore()

  const [myParticipantId, setMyParticipantId] = useState<string | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joining, setJoining] = useState(false)

  const [participantAdding, setParticipantAdding] = useState(false)
  const [participantDialog, setParticipantDialog] =
    useState<ParticipantDialogState>({
      open: false,
      participant: null,
    })
  const [participantSaving, setParticipantSaving] = useState(false)

  const [itemDialog, setItemDialog] = useState<ItemDialogState>({
    open: false,
    item: null,
  })
  const [itemSaving, setItemSaving] = useState(false)

  const [claimItemId, setClaimItemId] = useState<string | null>(null)
  const [claimPendingIds, setClaimPendingIds] = useState<string[]>([])

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const [qrOpen, setQrOpen] = useState(false)
  const [claimingUnclaimed, setClaimingUnclaimed] = useState(false)
  const [settlementPending, setSettlementPending] = useState(false)

  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [deletePending, setDeletePending] = useState(false)

  const session = store.session
  const participants = store.participants
  const items = store.items

  const myParticipant =
    participants.find(participant => participant.id === myParticipantId) ??
    null
  const myPerson =
    result.people.find(person => person.participantId === myParticipantId) ??
    null
  const myTotal = myPerson?.total ?? 0
  const claimItem = items.find(item => item.id === claimItemId) ?? null
  const shareUrl = `${window.location.origin}/s/${session?.slug ?? slug ?? ''}`
  const totals = Object.fromEntries(
    result.people.map(person => [person.participantId, person.total]),
  )

  function syncIdentity(slugValue: string) {
    const stored = getIdentity(slugValue)
    const list = useSessionStore.getState().participants
    const valid = stored
      ? list.some(participant => participant.id === stored)
      : false

    if (stored && !valid) clearIdentity(slugValue)

    if (!valid) {
      setMyParticipantId(null)
      setJoinOpen(true)
    } else {
      setMyParticipantId(stored)
    }
  }

  useEffect(() => {
    if (!slug) return

    let active = true
    setMyParticipantId(getIdentity(slug))
    setJoinOpen(false)
    setClaimItemId(null)
    setItemDialog({ open: false, item: null })
    setSettingsOpen(false)
    setParticipantDialog({ open: false, participant: null })
    setQrOpen(false)
    setConfirm(null)

    const init = async () => {
      const loaded = await store.loadBySlug(slug)
      if (!active || !loaded) return
      syncIdentity(slug)
    }

    void init()

    return () => {
      active = false
      store.stopRealtime()
    }
  }, [slug])

  useEffect(() => {
    if (!myParticipantId || store.loading || !session) return

    if (
      !participants.some(
        participant => participant.id === myParticipantId,
      )
    ) {
      if (slug) clearIdentity(slug)
      setMyParticipantId(null)
      setJoinOpen(true)
      useToastStore.getState().info(t('session.removed'))
    }
  }, [participants, myParticipantId, store.loading, session, slug, t])

  useEffect(() => {
    const onFocus = () => {
      void store.refresh()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void store.refresh()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      store.stopRealtime()
    }
  }, [])

  function requireIdentity(): boolean {
    if (
      myParticipantId &&
      participants.some(
        participant => participant.id === myParticipantId,
      )
    ) {
      return true
    }

    setJoinOpen(true)
    toast.info(t('session.joinFirst'))
    return false
  }

  async function handleJoin(name: string) {
    if (!slug) return

    setJoining(true)
    try {
      const existing = participants.find(
        participant =>
          participant.name.trim().toLowerCase() ===
          name.trim().toLowerCase(),
      )
      const participant =
        existing ?? (await store.addParticipant(name))

      setIdentity(slug, participant.id)
      setMyParticipantId(participant.id)
      setJoinOpen(false)
      toast.success(
        existing
          ? t('toast.joinedExisting', { name: participant.name })
          : t('toast.joinedNew', { name: participant.name }),
      )
    } catch {
      toast.error(t('toast.joinError'))
    } finally {
      setJoining(false)
    }
  }

  async function handleAddParticipant(name: string) {
    if (!requireIdentity()) return

    setParticipantAdding(true)
    try {
      await store.addParticipant(name)
      toast.success(t('toast.participantAdded', { name }))
    } catch {
      toast.error(t('toast.participantAddError'))
    } finally {
      setParticipantAdding(false)
    }
  }

  function openParticipantDialog(participant: Participant) {
    if (!requireIdentity()) return
    setParticipantDialog({ open: true, participant })
  }

  async function saveParticipantName(name: string) {
    const target = participantDialog.participant
    if (!target) return

    setParticipantSaving(true)
    try {
      await store.renameParticipant(target.id, name)
      setParticipantDialog({ open: false, participant: null })
      toast.success(t('toast.participantRenamed'))
    } catch {
      toast.error(t('toast.participantRenameError'))
    } finally {
      setParticipantSaving(false)
    }
  }

  function requestRemoveParticipant() {
    const target = participantDialog.participant
    if (!target) return

    const removingSelf = target.id === myParticipantId
    setParticipantDialog({ open: false, participant: null })
    setConfirm({
      title: t('confirm.removeParticipantTitle'),
      description: t('confirm.removeParticipantBody', {
        name: target.name,
      }),
      confirmLabel: t('confirm.removeParticipantAction'),
      action: async () => {
        setDeletePending(true)
        try {
          await store.removeParticipant(target.id)
          setConfirm(null)
          if (!removingSelf) {
            toast.success(
              t('toast.participantRemoved', { name: target.name }),
            )
          }
        } catch {
          toast.error(t('toast.removeError'))
        } finally {
          setDeletePending(false)
        }
      },
    })
  }

  function openAddItem() {
    if (!requireIdentity()) return
    setItemDialog({ open: true, item: null })
  }

  function openEditItem(item: ItemWithAssignments) {
    if (!requireIdentity()) return
    setItemDialog({ open: true, item })
  }

  async function saveItem(
    input: NewItemInput,
    claims: Record<string, number>,
    newNames: string[],
  ) {
    if (!requireIdentity()) return

    const editing = itemDialog.item
    setItemSaving(true)
    try {
      const created = await Promise.all(
        newNames.map(name => store.addParticipant(name)),
      )

      let itemId: string
      if (editing) {
        await store.updateItem(editing.id, input)
        itemId = editing.id
      } else {
        itemId = (await store.addItem(input)).id
      }

      const weights: Record<string, number> = { ...claims }
      for (const participant of created) {
        weights[participant.id] = 1
      }

      const removed = (editing?.item_assignments ?? [])
        .filter(
          assignment => weights[assignment.participant_id] === undefined,
        )
        .map(assignment =>
          store.setClaim(itemId, assignment.participant_id, null),
        )
      const applied = Object.entries(weights).map(([participantId, weight]) =>
        store.setClaim(itemId, participantId, weight),
      )

      await Promise.all([...removed, ...applied])

      setItemDialog({ open: false, item: null })
      toast.success(
        editing ? t('toast.itemUpdated') : t('toast.itemAdded'),
      )
    } catch {
      toast.error(t('toast.itemSaveError'))
    } finally {
      setItemSaving(false)
    }
  }

  async function duplicateItem(item: ItemWithAssignments) {
    if (!requireIdentity()) return

    try {
      await store.duplicateItem(item)
      toast.success(t('toast.itemDuplicated'))
    } catch {
      toast.error(t('toast.itemDuplicateError'))
    }
  }

  function requestDeleteItem(item: ItemWithAssignments) {
    if (!requireIdentity()) return

    setConfirm({
      title: t('confirm.removeItemTitle'),
      description: t('confirm.removeItemBody', { name: item.name }),
      confirmLabel: t('confirm.removeItemAction'),
      action: async () => {
        setDeletePending(true)
        try {
          await store.deleteItem(item.id)
          setConfirm(null)
          toast.success(t('toast.itemDeleted'))
        } catch {
          toast.error(t('toast.removeError'))
        } finally {
          setDeletePending(false)
        }
      },
    })
  }

  function openClaim(item: ItemWithAssignments) {
    if (!requireIdentity()) return
    setClaimItemId(item.id)
  }

  async function handleSetClaim(
    participantId: string,
    quantity: number | null,
  ) {
    if (!claimItemId) return

    const itemId = claimItemId
    setClaimPendingIds(previous => [...previous, participantId])
    try {
      await store.setClaim(itemId, participantId, quantity)
    } catch {
      toast.error(t('toast.claimError'))
    } finally {
      setClaimPendingIds(previous =>
        previous.filter(id => id !== participantId),
      )
    }
  }

  function openSettings() {
    if (!requireIdentity()) return
    setSettingsOpen(true)
  }

  async function saveSettings(patch: SessionSettingsPatch) {
    setSettingsSaving(true)
    try {
      await store.updateSession(patch)
      setSettingsOpen(false)
      toast.success(t('toast.settingsSaved'))
    } catch {
      toast.error(t('toast.settingsError'))
    } finally {
      setSettingsSaving(false)
    }
  }

  async function handleSetPayer(participantId: string | null) {
    if (!requireIdentity()) return

    setSettlementPending(true)
    try {
      await store.setPayer(participantId)
      toast.success(
        participantId
          ? t('toast.payerSaved')
          : t('toast.payerCleared'),
      )
    } catch {
      toast.error(t('toast.payerError'))
    } finally {
      setSettlementPending(false)
    }
  }

  async function handleTogglePaid(
    participantId: string,
    paid: boolean,
    amount: number,
  ) {
    if (!requireIdentity()) return

    setSettlementPending(true)
    try {
      await store.setParticipantPaid(participantId, paid, amount)
      toast.success(paid ? t('toast.paid') : t('toast.unpaid'))
    } catch {
      toast.error(t('toast.paidError'))
    } finally {
      setSettlementPending(false)
    }
  }

  async function handleClaimUnclaimed(mode: 'all' | 'payer') {
    if (!requireIdentity()) return

    if (mode === 'payer' && !participants.some(p => p.is_payer)) {
      toast.error(t('toast.pickPayer'))
      return
    }

    setClaimingUnclaimed(true)
    try {
      const count = await store.claimUnclaimed(mode)
      toast.success(t('toast.unclaimedAssigned', { count }))
    } catch {
      toast.error(t('toast.unclaimedError'))
    } finally {
      setClaimingUnclaimed(false)
    }
  }

  async function copyLink() {
    const copied = await copyText(shareUrl)
    if (copied) {
      toast.success(t('toast.copyLink'))
    } else {
      toast.error(t('toast.copyLinkError'))
    }
  }

  async function shareSummary() {
    if (!session) return

    const text = buildSummaryText(
      session,
      result,
      participants,
      shareUrl,
      language,
    )
    const copied = await copyText(text)
    if (copied) {
      toast.success(t('toast.summaryCopied'))
    } else {
      toast.error(t('toast.summaryError'))
    }
  }

  function openSummary() {
    document
      .getElementById('ringkasan')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function retry() {
    if (!slug) return
    const loaded = await store.loadBySlug(slug)
    if (loaded) syncIdentity(slug)
  }

  if (store.loading) {
    return (
      <div className="min-h-dvh">
        <AppHeader localMode={isLocalMode} />
        <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              <Card className="p-4">
                <div className="h-4 w-24 animate-pulse rounded-full bg-bg-soft-200" />
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-28 animate-pulse rounded-full bg-bg-soft-200" />
                  <div className="h-8 w-24 animate-pulse rounded-full bg-bg-soft-200" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="h-4 w-16 animate-pulse rounded-full bg-bg-soft-200" />
                <div className="mt-4 space-y-3">
                  <div className="h-10 animate-pulse rounded-10 bg-bg-soft-200" />
                  <div className="h-10 animate-pulse rounded-10 bg-bg-soft-200" />
                </div>
              </Card>
            </div>
            <Card className="p-4">
              <div className="h-4 w-24 animate-pulse rounded-full bg-bg-soft-200" />
              <div className="mt-4 space-y-3">
                <div className="h-10 animate-pulse rounded-10 bg-bg-soft-200" />
                <div className="h-10 animate-pulse rounded-10 bg-bg-soft-200" />
                <div className="h-10 animate-pulse rounded-10 bg-bg-soft-200" />
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (store.error) {
    return (
      <div className="min-h-dvh">
        <AppHeader localMode={isLocalMode} />
        <main className="mx-auto w-full max-w-lg px-4 py-12">
          <Card className="p-6 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-12 bg-error-lighter text-error-base">
              <RiErrorWarningLine className="size-6" />
            </span>
            <h1 className="mt-3 text-title-h5 text-text-strong-950">
              {t('session.loadErrorTitle')}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t('session.loadErrorBody')}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button onClick={() => void retry()}>
                {t('common.retry')}
              </Button>
              <Button
                variant="neutral"
                mode="stroke"
                onClick={() => navigate('/')}
              >
                {t('common.backHome')}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  if (store.notFound || !session) {
    return (
      <div className="min-h-dvh">
        <AppHeader localMode={isLocalMode} />
        <main className="mx-auto w-full max-w-lg px-4 py-12">
          <Card className="p-6 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-12 bg-bg-weak-50 text-text-soft-400">
              <RiFileList3Line className="size-6" />
            </span>
            <h1 className="mt-3 text-title-h5 text-text-strong-950">
              {t('session.notFoundTitle')}
            </h1>
            <p className="mt-1 text-paragraph-sm text-text-sub-600">
              {t('session.notFoundBody')}
            </p>
            <Button className="mt-5" onClick={() => navigate('/')}>
              {t('session.newSession')}
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-28 lg:pb-10">
      <SessionHeader
        title={session.title}
        isLocalMode={isLocalMode}
        connected={store.connected}
        onCopyLink={() => void copyLink()}
        onOpenQr={() => setQrOpen(true)}
        onOpenSettings={openSettings}
      />

      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6">
        <Alert tone="info" className="mb-5">
          {isLocalMode
            ? t('session.localBanner')
            : t('session.remoteBanner')}
        </Alert>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-5">
            <ParticipantCard
              participants={participants}
              totals={totals}
              me={myParticipantId ?? ''}
              adding={participantAdding}
              onAdd={handleAddParticipant}
              onEdit={openParticipantDialog}
            />

            <ItemCard
              items={items}
              participants={participants}
              onAdd={openAddItem}
              onClaim={openClaim}
              onEdit={openEditItem}
              onDuplicate={duplicateItem}
              onDelete={requestDeleteItem}
            />
          </div>

          <div className="space-y-5 lg:sticky lg:top-24">
            <SummaryCard
              result={result}
              participants={participants}
              me={myParticipantId ?? ''}
              receiptTotal={session.receipt_total}
              claimingUnclaimed={claimingUnclaimed}
              onOpenSettings={openSettings}
              onShare={() => void shareSummary()}
              onClaimUnclaimed={handleClaimUnclaimed}
            />

            <SettlementCard
              participants={participants}
              result={result}
              rounding={session.rounding}
              pending={settlementPending}
              onSetPayer={handleSetPayer}
              onTogglePaid={handleTogglePaid}
            />
          </div>
        </div>
      </main>

      <StickyTotalBar
        total={myTotal}
        hasIdentity={Boolean(myParticipant)}
        unclaimedCount={result.unclaimedItems.length}
        onOpenSummary={openSummary}
        onJoin={() => setJoinOpen(true)}
      />

      <JoinDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        participants={participants}
        pending={joining}
        onSubmit={handleJoin}
        onViewOnly={() => setJoinOpen(false)}
      />

      <ClaimDialog
        open={claimItemId !== null}
        onOpenChange={open => {
          if (!open) setClaimItemId(null)
        }}
        item={claimItem}
        participants={participants}
        me={myParticipantId ?? ''}
        pendingIds={claimPendingIds}
        onSetClaim={handleSetClaim}
      />

      <BillSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        session={session}
        claimedNet={result.claimedNet}
        pending={settingsSaving}
        onSave={saveSettings}
      />

      <ItemDialog
        open={itemDialog.open}
        onOpenChange={open => {
          if (!open) setItemDialog({ open: false, item: null })
        }}
        item={itemDialog.item}
        participants={participants}
        me={myParticipantId ?? ''}
        pending={itemSaving}
        onSave={saveItem}
      />

      <ParticipantDialog
        open={participantDialog.open}
        onOpenChange={open => {
          if (!open) {
            setParticipantDialog({ open: false, participant: null })
          }
        }}
        participant={participantDialog.participant}
        canRemove
        pending={participantSaving}
        onSave={saveParticipantName}
        onRemove={requestRemoveParticipant}
      />

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={open => {
          if (!open) setConfirm(null)
        }}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.confirmLabel}
        pending={deletePending}
        onConfirm={() => {
          void confirm?.action?.()
        }}
      />

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={shareUrl}
      />
    </div>
  )
}
