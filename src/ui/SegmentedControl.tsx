import { cn } from './cn'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  className?: string
  ariaLabel?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex w-full rounded-10 bg-bg-weak-50 p-1',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-lg px-2.5 py-1.5 text-label-sm transition',
              active
                ? 'bg-bg-white-0 text-text-strong-950 shadow-regular-xs'
                : 'text-text-sub-600 hover:text-text-strong-950',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
