import type { CalcResult } from './calculate'
import { formatRupiah } from './money'
import { buildSettlement } from './settlement'
import type { Participant, Session } from '../types/database'

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

export function buildSummaryText(
  session: Pick<Session, 'title' | 'rounding'>,
  result: CalcResult,
  participants: Participant[],
  shareUrl?: string,
): string {
  const claimedGross = result.items
    .filter(item => item.claimed)
    .reduce((sum, item) => sum + item.gross, 0)
  const itemDiscount = claimedGross - result.claimedNet

  const lines: string[] = [`🧾 ${session.title}`]

  if (claimedGross > 0) lines.push(`Subtotal: ${formatRupiah(claimedGross)}`)
  if (itemDiscount > 0) lines.push(`Diskon item: -${formatRupiah(itemDiscount)}`)
  if (result.shippingAmount > 0) {
    lines.push(`Ongkir: +${formatRupiah(result.shippingAmount)}`)
  }
  if (result.billDiscount > 0) {
    lines.push(`Diskon bill: -${formatRupiah(result.billDiscount)}`)
  }
  if (result.serviceAmount > 0) {
    lines.push(`Service: +${formatRupiah(result.serviceAmount)}`)
  }
  if (result.taxAmount > 0) {
    lines.push(`Pajak/PB1: +${formatRupiah(result.taxAmount)}`)
  }
  if (result.tipAmount > 0) {
    lines.push(`Tip: +${formatRupiah(result.tipAmount)}`)
  }
  lines.push(`Total: ${formatRupiah(result.grandTotal)}`, '')

  const payer =
    participants.find(participant => participant.is_payer) ?? null

  for (const person of result.people) {
    const payerLabel = payer?.id === person.participantId ? ' (penerima)' : ''
    lines.push(`${person.name}${payerLabel} — ${formatRupiah(person.total)}`)
    for (const item of person.items) {
      lines.push(`  • ${item.itemName}: ${formatRupiah(item.amount)}`)
    }
  }

  if (payer) {
    const settlement = buildSettlement(result, participants, session.rounding)

    if (settlement.lines.length > 0) {
      lines.push('')
      lines.push(`💳 Transfer ke ${payer.name}:`)
      for (const line of settlement.lines) {
        const status = line.paid
          ? 'lunas'
          : line.stale
            ? 'perlu dicek'
            : 'belum lunas'
        lines.push(
          `  • ${line.name}: ${formatRupiah(line.amount)} (${status})`,
        )
      }
      if (settlement.roundingExtra > 0) {
        lines.push(
          `  Pembulatan: +${formatRupiah(settlement.roundingExtra)} untuk ${payer.name}`,
        )
      }
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
