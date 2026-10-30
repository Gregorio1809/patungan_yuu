import { cn } from './cn'

const tones = [
  'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
  'bg-bg-soft-200 text-text-sub-600',
  'bg-success-lighter text-success-base',
  'bg-information-lighter text-information-base',
  'bg-warning-lighter text-warning-base',
] as const

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function toneFor(name: string): string {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0
  }
  return tones[hash % tones.length]
}

const sizeClasses = {
  sm: 'size-7 text-[10px]',
  md: 'size-8 text-[11px]',
  lg: 'size-9 text-xs',
} as const

interface AvatarProps {
  name: string
  size?: keyof typeof sizeClasses
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      title={name}
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5 dark:ring-white/10',
        sizeClasses[size],
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
