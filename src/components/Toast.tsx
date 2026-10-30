import {
  RiCheckboxCircleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import type { ToastTone } from '../store/toast'
import { cn } from '../ui/cn'

interface ToastProps {
  message: string
  tone: ToastTone
  onClose: () => void
}

const config = {
  success: {
    icon: RiCheckboxCircleLine,
    className: 'border-success-base/20 bg-success-lighter text-success-base',
  },
  error: {
    icon: RiErrorWarningLine,
    className: 'border-error-base/20 bg-error-lighter text-error-base',
  },
  info: {
    icon: RiInformationLine,
    className:
      'border-information-base/20 bg-information-lighter text-information-base',
  },
} satisfies Record<
  ToastTone,
  { icon: typeof RiInformationLine; className: string }
>

export function Toast({ message, tone, onClose }: ToastProps) {
  const { t } = useTranslation()
  const { icon: Icon, className } = config[tone]

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-12 border px-4 py-3 text-sm shadow-regular-md',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-text-strong-950">{message}</span>
      <button
        type="button"
        aria-label={t('toast.close')}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-text-soft-400 transition hover:bg-bg-white-0 hover:text-text-strong-950"
        onClick={onClose}
      >
        <RiCloseLine className="size-4" />
      </button>
    </div>
  )
}
