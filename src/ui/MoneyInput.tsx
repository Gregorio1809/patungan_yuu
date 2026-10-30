import { useEffect, useState } from 'react'
import { formatNumber, parseRupiah } from '../lib/money'
import { cn } from './cn'

interface MoneyInputProps {
  id?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  disabled,
  className,
  ariaLabel,
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false)
  const [display, setDisplay] = useState(formatNumber(value))

  useEffect(() => {
    if (!focused) setDisplay(formatNumber(value))
  }, [value, focused])

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-sm text-text-soft-400">
        Rp
      </span>
      <input
        id={id}
        value={display}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={cn(
          'money h-10 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 pr-3 pl-9 text-sm text-text-strong-950 shadow-regular-xs transition placeholder:text-text-soft-400 focus:border-primary-base focus:ring-4 focus:ring-primary-alpha-10 focus:outline-none disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
          className,
        )}
        onFocus={() => {
          setFocused(true)
          setDisplay(value > 0 ? String(Math.round(value)) : '')
        }}
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, '')
          setDisplay(digits)
          onChange(digits ? Number(digits) : 0)
        }}
        onBlur={() => {
          setFocused(false)
          const parsed = parseRupiah(display)
          setDisplay(formatNumber(parsed))
          onChange(parsed)
        }}
      />
    </div>
  )
}
