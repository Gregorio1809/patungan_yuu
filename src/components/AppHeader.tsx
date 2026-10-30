import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'

interface AppHeaderProps {
  localMode: boolean
}

export function AppHeader({ localMode }: AppHeaderProps) {
  return (
    <header className="border-b border-stroke-soft-200 bg-bg-white-0/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="Patungan Yuu, kembali ke beranda"
        >
          <span className="flex size-10 items-center justify-center rounded-12 bg-primary-base font-display text-lg font-semibold text-white shadow-regular-xs">
            P
          </span>
          <span>
            <span className="block font-display text-lg leading-none font-semibold text-text-strong-950">
              Patungan Yuu
            </span>
            <span className="mt-1 block text-[11px] leading-none text-text-soft-400">
              Bagi bill tanpa drama
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Badge tone={localMode ? 'success' : 'neutral'}>
            {localMode ? 'Mode lokal' : 'Supabase'}
          </Badge>
        </div>
      </div>
    </header>
  )
}
