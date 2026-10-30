import { useState, type FormEvent } from 'react'
import { RiAddLine } from '@remixicon/react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'

interface CreateSessionFormProps {
  pending?: boolean
  disabled?: boolean
  localMode?: boolean
  onCreate: (title: string) => void
}

export function CreateSessionForm({
  pending,
  disabled,
  localMode,
  onCreate,
}: CreateSessionFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = title.trim()
    if (!value) {
      setError('Nama sesi wajib diisi.')
      return
    }
    setError('')
    onCreate(value)
  }

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={submit}>
        <div>
          <Label htmlFor="patungan-new-session-title">Nama sesi</Label>
          <Input
            id="patungan-new-session-title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            maxLength={80}
            placeholder="Contoh: Makan malam kantor"
            autoComplete="off"
          />
          <p className="mt-2 text-[11px] text-text-soft-400">
            Diskon, service, pajak, dan tip bisa diatur setelah sesi dibuat.
          </p>
        </div>

        {error && (
          <p className="mt-2 text-label-sm text-error-base" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={pending || disabled}
        >
          {!pending && !disabled && <RiAddLine className="size-4" />}
          {disabled
            ? 'Supabase belum tersambung'
            : pending
              ? 'Membuat sesi...'
              : 'Buat sesi'}
        </Button>

        <p className="mt-3 text-center text-[11px] text-text-soft-400">
          {localMode
            ? 'Mode lokal: link hanya bisa dibuka di browser ini.'
            : 'Semua orang yang punya link bisa ikut mengisi.'}
        </p>
      </form>
    </Card>
  )
}
