import type { SelectHTMLAttributes } from 'react'
import { RiArrowDownSLine } from '@remixicon/react'
import { cn } from './cn'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 pr-9 text-sm text-text-strong-950 shadow-regular-xs transition focus:border-primary-base focus:ring-4 focus:ring-primary-alpha-10 focus:outline-none disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <RiArrowDownSLine
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-soft-400"
        aria-hidden="true"
      />
    </div>
  )
}
