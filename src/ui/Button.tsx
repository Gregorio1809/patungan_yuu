import type { ButtonHTMLAttributes } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'neutral' | 'error'
export type ButtonMode = 'filled' | 'stroke' | 'lighter' | 'ghost'
export type ButtonSize = 'md' | 'sm' | 'xs' | 'icon'

const variantClasses: Record<
  ButtonVariant,
  Record<ButtonMode, string>
> = {
  primary: {
    filled:
      'bg-primary-base text-white hover:bg-primary-darker focus-visible:ring-primary-alpha-16',
    stroke:
      'bg-bg-white-0 text-primary-base ring-1 ring-inset ring-primary-base hover:bg-primary-alpha-10 focus-visible:ring-primary-alpha-16',
    lighter:
      'bg-primary-alpha-10 text-primary-base hover:bg-bg-white-0 hover:ring-1 hover:ring-inset hover:ring-primary-base focus-visible:ring-primary-alpha-16',
    ghost:
      'text-primary-base hover:bg-primary-alpha-10 focus-visible:ring-primary-alpha-16',
  },
  neutral: {
    filled:
      'bg-bg-strong-950 text-white hover:bg-bg-surface-800 focus-visible:ring-gray-300',
    stroke:
      'bg-bg-white-0 text-text-sub-600 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 hover:bg-bg-weak-50 hover:text-text-strong-950 hover:shadow-none hover:ring-stroke-sub-300 focus-visible:ring-gray-300',
    lighter:
      'bg-bg-weak-50 text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-regular-xs hover:ring-1 hover:ring-inset hover:ring-stroke-soft-200 focus-visible:ring-gray-300',
    ghost:
      'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 focus-visible:ring-gray-300',
  },
  error: {
    filled:
      'bg-error-base text-white hover:opacity-90 focus-visible:ring-error-lighter',
    stroke:
      'bg-bg-white-0 text-error-base ring-1 ring-inset ring-error-base hover:bg-error-lighter focus-visible:ring-error-lighter',
    lighter:
      'bg-error-lighter text-error-base hover:bg-bg-white-0 hover:ring-1 hover:ring-inset hover:ring-error-base focus-visible:ring-error-lighter',
    ghost:
      'text-error-base hover:bg-error-lighter focus-visible:ring-error-lighter',
  },
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-10 gap-2 px-3.5 text-label-sm',
  sm: 'h-9 gap-2 px-3 text-label-sm',
  xs: 'h-8 gap-1.5 px-2.5 text-label-sm',
  icon: 'size-10 p-0',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  mode?: ButtonMode
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  mode = 'filled',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-10 font-medium transition duration-150 focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
        variantClasses[variant][mode],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
