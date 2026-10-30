import { useState, type FormEvent } from 'react'
import { RiAddLine, RiPencilLine } from '@remixicon/react'
import type { Participant } from '../types/database'
import { formatRupiah } from '../lib/money'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

interface ParticipantCardProps {
  participants: Participant[]
  totals: Record<string, number>
  me: string
  adding?: boolean
  onAdd: (name: string) => void
  onEdit: (participant: Participant) => void
}

export function ParticipantCard({
  participants,
  totals,
  me,
  adding,
  onAdd,
  onEdit,
}: ParticipantCardProps) {
  const [name, setName] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = name.trim()
    if (!value) return
    onAdd(value)
    setName('')
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-title-h6 text-text-strong-950">Peserta</h2>
          <p className="mt-0.5 text-paragraph-sm text-text-sub-600">
            Setiap orang bisa klaim item dari perangkat masing-masing.
          </p>
        </div>
        <Badge>{participants.length} orang</Badge>
      </div>

      {participants.length === 0 ? (
        <p className="mt-4 rounded-10 border border-dashed border-stroke-sub-300 bg-bg-weak-25 p-3 text-paragraph-sm text-text-soft-400">
          Belum ada peserta. Tambahkan nama untuk mulai membagi bill.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-stroke-soft-200">
          {participants.map(participant => (
            <li
              key={participant.id}
              className="flex items-center gap-2.5 py-3"
            >
              <Avatar name={participant.name} />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <p
                    className="truncate text-label-md text-text-strong-950"
                    title={participant.name}
                  >
                    {participant.name}
                  </p>
                  {participant.id === me && (
                    <Badge tone="primary">Kamu</Badge>
                  )}
                  {participant.is_payer && (
                    <Badge tone="success">Penerima</Badge>
                  )}
                </div>
                <p className="text-[11px] text-text-soft-400">
                  {participant.is_payer ? 'Menalangi bill' : 'Peserta'}
                </p>
              </div>

              <p className="money shrink-0 text-label-md font-semibold text-text-strong-950">
                {formatRupiah(totals[participant.id] ?? 0)}
              </p>

              <Button
                variant="neutral"
                mode="ghost"
                size="icon"
                aria-label={`Edit ${participant.name}`}
                onClick={() => onEdit(participant)}
              >
                <RiPencilLine className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={submit}
      >
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Tambah nama peserta, misal: Budi"
          aria-label="Nama peserta baru"
          maxLength={40}
        />
        <Button
          type="submit"
          variant="neutral"
          mode="stroke"
          disabled={!name.trim() || adding}
        >
          <RiAddLine className="size-4" />
          {adding ? 'Menambah...' : 'Tambah'}
        </Button>
      </form>
    </Card>
  )
}
