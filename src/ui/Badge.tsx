import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    'bg-bg-weak-50 text-text-sub-600 ring-1 ring-inset ring-stroke-soft-200',
  primary: 'bg-primary-alpha-10 text-primary-base',
  success: 'bg-success-lighter text-success-base',
  warning: 'bg-warning-lighter text-warning-base',
  error: 'bg-error-lighter text-error-base',
  info: 'bg-information-lighter text-information-base',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
