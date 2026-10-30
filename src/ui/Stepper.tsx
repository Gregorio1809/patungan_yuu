import { RiAddLine, RiSubtractLine } from '@remixicon/react'
import { cn } from './cn'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  label?: string
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className,
  label = 'bobot',
}: StepperProps) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label={`Kurangi ${label}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition hover:bg-bg-weak-50 disabled:opacity-40"
      >
        <RiSubtractLine className="size-3.5" />
      </button>
      <span className="money w-6 text-center text-label-sm text-text-strong-950">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 transition hover:bg-bg-weak-50 disabled:opacity-40"
      >
        <RiAddLine className="size-3.5" />
      </button>
    </div>
  )
}
