import type { ReactNode } from 'react'
import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react'
import { cn } from './cn'

type AlertTone = 'info' | 'success' | 'warning' | 'error'

const config: Record<
  AlertTone,
  { icon: typeof RiInformationLine; className: string }
> = {
  info: {
    icon: RiInformationLine,
    className: 'border-information-base/20 bg-information-lighter text-information-base',
  },
  success: {
    icon: RiCheckboxCircleLine,
    className: 'border-success-base/20 bg-success-lighter text-success-base',
  },
  warning: {
    icon: RiErrorWarningLine,
    className: 'border-warning-base/20 bg-warning-lighter text-warning-base',
  },
  error: {
    icon: RiAlertLine,
    className: 'border-error-base/20 bg-error-lighter text-error-base',
  },
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Alert({
  tone = 'info',
  title,
  action,
  children,
  className,
}: AlertProps) {
  const { icon: Icon, className: toneClass } = config[tone]

  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-10 border px-3.5 py-3 text-paragraph-sm',
        toneClass,
        className,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={cn('text-text-sub-600', title && 'mt-0.5')}>
          {children}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
