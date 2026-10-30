import type { LabelHTMLAttributes } from 'react'
import { cn } from './cn'

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-label-sm text-text-sub-600', className)}
      {...props}
    >
      {children}
    </label>
  )
}
