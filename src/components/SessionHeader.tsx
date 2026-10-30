import { Link } from 'react-router-dom'
import {
  RiLinksLine,
  RiQrCodeLine,
  RiSettings3Line,
} from '@remixicon/react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface SessionHeaderProps {
  title: string
  isLocalMode: boolean
  connected: boolean
  onCopyLink: () => void
  onOpenQr: () => void
  onOpenSettings: () => void
}

export function SessionHeader({
  title,
  isLocalMode,
  connected,
  onCopyLink,
  onOpenQr,
  onOpenSettings,
}: SessionHeaderProps) {
  const status = isLocalMode
    ? 'Mode lokal'
    : connected
      ? 'Tersinkron'
      : 'Menyambung'
  const statusTone = isLocalMode || connected ? 'success' : 'warning'

  return (
    <header className="sticky top-0 z-30 border-b border-stroke-soft-200 bg-bg-white-0/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link
          to="/"
          className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-primary-base text-label-md font-semibold text-white transition hover:bg-primary-darker"
          aria-label="Kembali ke beranda"
        >
          P
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1
              className="truncate text-title-h6 text-text-strong-950"
              title={title}
            >
              {title}
            </h1>
          </div>
          <p className="text-[11px] text-text-soft-400">Patungan Yuu</p>
        </div>

        <Badge
          tone={statusTone}
          className="hidden shrink-0 sm:inline-flex"
        >
          <span
            className={
              isLocalMode || connected
                ? 'size-1.5 rounded-full bg-success-base'
                : 'size-1.5 rounded-full bg-warning-base'
            }
          />
          {status}
        </Badge>

        <Button
          variant="neutral"
          mode="stroke"
          size="sm"
          onClick={onCopyLink}
          aria-label="Salin link"
        >
          <RiLinksLine className="size-4" />
          <span className="hidden sm:inline">Salin link</span>
        </Button>

        <Button
          variant="neutral"
          mode="ghost"
          size="icon"
          onClick={onOpenQr}
          aria-label="Tampilkan QR"
        >
          <RiQrCodeLine className="size-5" />
        </Button>

        <Button
          variant="neutral"
          mode="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Atur bill dan pembayaran"
        >
          <RiSettings3Line className="size-5" />
        </Button>
      </div>
    </header>
  )
}
