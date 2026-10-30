import { useEffect, useState } from 'react'
import { RiDeleteBinLine } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import type { Participant } from '../types/database'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Modal } from '../ui/Modal'

interface ParticipantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participant: Participant | null
  canRemove: boolean
  pending?: boolean
  onSave: (name: string) => void
  onRemove: () => void
}

export function ParticipantDialog({
  open,
  onOpenChange,
  participant,
  canRemove,
  pending,
  onSave,
  onRemove,
}: ParticipantDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(participant?.name ?? '')
    setInvalid(false)
  }, [open, participant])

  function submit() {
    const value = name.trim()
    if (!value) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onSave(value)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('participantDialog.title')}
      description={t('participantDialog.description')}
      size="sm"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="error"
            mode="ghost"
            disabled={!canRemove || pending}
            onClick={onRemove}
          >
            <RiDeleteBinLine className="size-4" />
            {t('participantDialog.remove')}
          </Button>
          <div className="flex justify-end gap-2">
            <Button
              variant="neutral"
              mode="stroke"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              form="patungan-participant-form"
              disabled={pending}
            >
              {pending
                ? t('participantDialog.saving')
                : t('participantDialog.save')}
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="patungan-participant-form"
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
      >
        {participant && (
          <div className="mb-4 flex items-center gap-2.5 rounded-10 border border-stroke-soft-200 bg-bg-weak-25 p-3">
            <Avatar name={participant.name} size="lg" />
            <div>
              <p className="text-label-md text-text-strong-950">
                {participant.name}
              </p>
              <p className="text-[11px] text-text-soft-400">
                {t('participantDialog.claimsKept')}
              </p>
            </div>
          </div>
        )}

        <Label htmlFor="patungan-participant-name">
          {t('participantDialog.name')}
        </Label>
        <Input
          id="patungan-participant-name"
          value={name}
          onChange={event => setName(event.target.value)}
          maxLength={40}
          autoFocus
        />
        {invalid && (
          <p className="mt-1.5 text-label-sm text-error-base" role="alert">
            {t('participantDialog.required')}
          </p>
        )}
      </form>
    </Modal>
  )
}
