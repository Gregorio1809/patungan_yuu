import { useEffect, useMemo, useState } from 'react'
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
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setError('')
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
      setError('Nama wajib diisi.')
      return
    }
    setError('')
    onSubmit(value)
  }

  return (
    <Modal
      open={open}
      onOpenChange={value => {
        onOpenChange(value)
        if (!value) onViewOnly()
      }}
      title="Gabung ke patungan"
      description="Isi namamu supaya bisa klaim item dan lihat totalmu."
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
            Lihat dulu
          </Button>
          <Button
            type="submit"
            form="patungan-join-form"
            disabled={pending}
          >
            {pending
              ? 'Menggabungkan...'
              : matched
                ? `Gabung sebagai ${matched.name}`
                : 'Gabung'}
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
          <Label htmlFor="patungan-join-name">Nama kamu</Label>
          <Input
            id="patungan-join-name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={40}
            autoComplete="name"
            placeholder="Contoh: Budi"
            autoFocus
          />
          {error && (
            <p className="mt-1.5 text-label-sm text-error-base" role="alert">
              {error}
            </p>
          )}
        </div>

        {matched && (
          <Alert tone="info">
            Nama <span className="font-medium">{matched.name}</span> sudah
            terdaftar. Tombol gabung akan memakai nama itu, misalnya saat
            membuka link di perangkat kedua.
          </Alert>
        )}

        <p className="text-[11px] text-text-soft-400">
          Tanpa akun. Identitasmu disimpan di perangkat ini.
        </p>
      </form>
    </Modal>
  )
}
