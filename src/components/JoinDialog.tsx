import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import type { Participant } from '../types/database'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Modal } from '../ui/Modal'

interface JoinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: Participant[]
  pending?: boolean
  onSubmit: (name: string) => void
  onViewOnly: () => void
}

export function JoinDialog({
  open,
  onOpenChange,
  participants,
  pending,
  onSubmit,
  onViewOnly,
}: JoinDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setInvalid(false)
  }, [open])

  const matched = useMemo(() => {
    const query = name.trim().toLowerCase()
    if (!query) return null
    return (
      participants.find(
        participant =>
          participant.name.trim().toLowerCase() === query,
      ) ?? null
    )
  }, [name, participants])

  function submit() {
    const value = name.trim()
    if (!value) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onSubmit(value)
  }

  return (
    <Modal
      open={open}
      onOpenChange={value => {
        onOpenChange(value)
        if (!value) onViewOnly()
      }}
      title={t('join.title')}
      description={t('join.description')}
      size="sm"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="neutral"
            mode="ghost"
            onClick={() => {
              onViewOnly()
              onOpenChange(false)
            }}
          >
            {t('join.viewOnly')}
          </Button>
          <Button
            type="submit"
            form="patungan-join-form"
            disabled={pending}
          >
            {pending
              ? t('join.pending')
              : matched
                ? t('join.as', { name: matched.name })
                : t('join.submit')}
          </Button>
        </div>
      }
    >
      <form
        id="patungan-join-form"
        className="space-y-4"
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
      >
        <div>
          <Label htmlFor="patungan-join-name">{t('join.name')}</Label>
          <Input
            id="patungan-join-name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={40}
            autoComplete="name"
            placeholder={t('join.placeholder')}
            autoFocus
          />
          {invalid && (
            <p className="mt-1.5 text-label-sm text-error-base" role="alert">
              {t('join.required')}
            </p>
          )}
        </div>

        {matched && (
          <Alert tone="info">
            {t('join.matched', { name: matched.name })}
          </Alert>
        )}

        <p className="text-[11px] text-text-soft-400">
          {t('join.noAccount')}
        </p>
      </form>
    </Modal>
  )
}
