import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'
import { Badge } from '../ui/Badge'
import { PreferencesControls } from './PreferencesControls'

interface AppHeaderProps {
  localMode: boolean
}

export function AppHeader({ localMode }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="border-b border-stroke-soft-200 bg-bg-white-0/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label={t('app.homeAria')}
        >
          <span className="flex size-10 items-center justify-center rounded-12 bg-primary-base font-display text-lg font-semibold text-white shadow-regular-xs">
            P
          </span>
          <span>
            <span className="block font-display text-base leading-none font-semibold whitespace-nowrap text-text-strong-950 sm:text-lg">
              Patungan Yuu
            </span>
            <span className="mt-1 hidden text-[11px] leading-none text-text-soft-400 min-[380px]:block">
              {t('app.tagline')}
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Badge
            tone={localMode ? 'success' : 'neutral'}
            className="hidden sm:inline-flex"
          >
            {localMode ? t('mode.local') : t('mode.supabase')}
          </Badge>
          <PreferencesControls />
        </div>
      </div>
    </header>
  )
}
