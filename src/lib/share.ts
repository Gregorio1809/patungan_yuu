import type { CalcResult } from './calculate'
import { formatRupiah } from './money'
import type { Session } from '../types/database'

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

export function buildSummaryText(
  session: Pick<Session, 'title'>,
  result: CalcResult,
  shareUrl?: string,
): string {
  const lines: string[] = [`🧾 ${session.title}`, `Total: ${formatRupiah(result.grandTotal)}`, '']

  for (const person of result.people) {
    lines.push(`${person.name} — ${formatRupiah(person.total)}`)
    for (const item of person.items) {
      lines.push(`  • ${item.itemName}: ${formatRupiah(item.amount)}`)
    }
  }

  if (result.unclaimedItems.length > 0) {
    const total = result.unclaimedItems.reduce((sum, item) => sum + item.net, 0)
    lines.push('')
    lines.push(
      `Catatan: ${result.unclaimedItems.length} item belum diklaim (${formatRupiah(total)}): ${result.unclaimedItems
        .map(item => item.name)
        .join(', ')}`,
    )
  }

  if (shareUrl) {
    lines.push('')
    lines.push(shareUrl)
  }

  return lines.join('\n')
}

function copyWithFallback(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyWithFallback(text)
  }
}

export async function shareText(text: string): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return copyWithFallback(text) ? 'copied' : 'failed'
  }
}
