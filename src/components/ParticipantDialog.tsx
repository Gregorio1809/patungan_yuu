import { useEffect, useState } from 'react'
import { RiDeleteBinLine } from '@remixicon/react'
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
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(participant?.name ?? '')
    setError('')
  }, [open, participant])

  function submit() {
    const value = name.trim()
    if (!value) {
      setError('Nama peserta wajib diisi.')
      return
    }
    setError('')
    onSave(value)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit peserta"
      description="Ganti nama tanpa menghilangkan klaim item."
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
            Hapus peserta
          </Button>
          <div className="flex justify-end gap-2">
            <Button
              variant="neutral"
              mode="stroke"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="patungan-participant-form"
              disabled={pending}
            >
              {pending ? 'Menyimpan...' : 'Simpan nama'}
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
                Klaim item tetap tersimpan saat nama diubah.
              </p>
            </div>
          </div>
        )}

        <Label htmlFor="patungan-participant-name">Nama peserta</Label>
        <Input
          id="patungan-participant-name"
          value={name}
          onChange={event => setName(event.target.value)}
          maxLength={40}
          autoFocus
        />
        {error && (
          <p className="mt-1.5 text-label-sm text-error-base" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
