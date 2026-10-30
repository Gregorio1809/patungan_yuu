import type { DiscountType } from '../types/database'
import { formatRupiah } from './money'

const AVATAR_TONES = [
  'bg-brand-soft text-brand-strong',
  'bg-positive-soft text-positive',
  'bg-highlight-soft text-ink-soft',
  'bg-paper-deep text-ink-soft',
] as const

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function avatarTone(name: string): string {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length]
}

export function discountLabel(type: DiscountType, value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return type === 'percent' ? `${value}%` : formatRupiah(value)
}
