import { useTranslation } from '../i18n/useTranslation'
import { formatRupiah } from '../lib/money'
import { Button } from '../ui/Button'

interface StickyTotalBarProps {
  total: number
  hasIdentity: boolean
  unclaimedCount: number
  onOpenSummary: () => void
  onJoin: () => void
}

export function StickyTotalBar({
  total,
  hasIdentity,
  unclaimedCount,
  onOpenSummary,
  onJoin,
}: StickyTotalBarProps) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stroke-soft-200 bg-bg-white-0/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-regular-md backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-text-soft-400 uppercase">
            {hasIdentity ? t('sticky.total') : t('sticky.notJoined')}
          </p>
          <p className="money truncate text-title-h6 text-text-strong-950">
            {hasIdentity
              ? formatRupiah(total)
              : t('sticky.joinPrompt')}
          </p>
          {hasIdentity && unclaimedCount > 0 && (
            <p className="text-[11px] text-text-soft-400">
              {t('sticky.unclaimed', { count: unclaimedCount })}
            </p>
          )}
        </div>

        {hasIdentity ? (
          <Button
            variant="neutral"
            mode="stroke"
            size="sm"
            onClick={onOpenSummary}
          >
            {t('sticky.details')}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onJoin}>
            {t('sticky.join')}
          </Button>
        )}
      </div>
    </div>
  )
}
