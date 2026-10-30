import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from './cn'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm text-text-strong-950 shadow-regular-xs transition placeholder:text-text-soft-400 focus:border-primary-text focus:ring-4 focus:ring-primary-alpha-10 focus:outline-none disabled:cursor-not-allowed disabled:bg-bg-weak-50 disabled:text-text-disabled-300',
        className,
      )}
      {...props}
    />
  )
})
