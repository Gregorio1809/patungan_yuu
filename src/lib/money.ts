const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0
  return rupiahFormatter.format(safe)
}

export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  return numberFormatter.format(safe)
}

export function parseRupiah(input: string): number {
  const digits = input.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits)
}

export function toSafeInteger(value: number | string, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(0, Math.round(parsed))
}

export function roundUpTo(value: number, increment: number): number {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0
  const step = Number.isFinite(increment) ? Math.max(0, Math.round(increment)) : 0
  if (step <= 1) return Math.round(safeValue)
  return Math.ceil(safeValue / step) * step
}
