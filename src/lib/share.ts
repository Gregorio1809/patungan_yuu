import {
  translate,
  type Language,
  type Params,
  type TranslationKey,
} from '../i18n/translations'
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
  language: Language = 'id',
): string {
  const t = (key: TranslationKey, params?: Params) =>
    translate(language, key, params)
  const claimedGross = result.items
    .filter(item => item.claimed)
    .reduce((sum, item) => sum + item.gross, 0)
  const itemDiscount = claimedGross - result.claimedNet

  const lines: string[] = [`🧾 ${session.title}`]

  if (claimedGross > 0) {
    lines.push(`${t('share.subtotal')}: ${formatRupiah(claimedGross)}`)
  }
  if (itemDiscount > 0) {
    lines.push(
      `${t('share.itemDiscount')}: -${formatRupiah(itemDiscount)}`,
    )
  }
  if (result.shippingAmount > 0) {
    lines.push(
      `${t('share.shipping')}: +${formatRupiah(result.shippingAmount)}`,
    )
  }
  if (result.billDiscount > 0) {
    lines.push(
      `${t('share.billDiscount')}: -${formatRupiah(result.billDiscount)}`,
    )
  }
  if (result.serviceAmount > 0) {
    lines.push(
      `${t('share.service')}: +${formatRupiah(result.serviceAmount)}`,
    )
  }
  if (result.taxAmount > 0) {
    lines.push(`${t('share.tax')}: +${formatRupiah(result.taxAmount)}`)
  }
  if (result.tipAmount > 0) {
    lines.push(`${t('share.tip')}: +${formatRupiah(result.tipAmount)}`)
  }
  lines.push(`${t('share.total')}: ${formatRupiah(result.grandTotal)}`, '')

  const payer =
    participants.find(participant => participant.is_payer) ?? null

  for (const person of result.people) {
    const payerLabel =
      payer?.id === person.participantId
        ? t('share.payerSuffix')
        : ''
    lines.push(
      `${person.name}${payerLabel} — ${formatRupiah(person.total)}`,
    )
    for (const item of person.items) {
      lines.push(`  • ${item.itemName}: ${formatRupiah(item.amount)}`)
    }
  }

  if (payer) {
    const settlement = buildSettlement(result, participants, session.rounding)

    if (settlement.lines.length > 0) {
      lines.push('')
      lines.push(t('share.transferTo', { name: payer.name }))
      for (const line of settlement.lines) {
        const status = line.paid
          ? t('share.paid')
          : line.stale
            ? t('share.stale')
            : t('share.unpaid')
        lines.push(
          `  • ${line.name}: ${formatRupiah(line.amount)} (${status})`,
        )
      }
      if (settlement.roundingExtra > 0) {
        lines.push(
          t('share.rounding', {
            amount: formatRupiah(settlement.roundingExtra),
            name: payer.name,
          }),
        )
      }
    }
  }

  if (result.unclaimedItems.length > 0) {
    const total = result.unclaimedItems.reduce((sum, item) => sum + item.net, 0)
    lines.push('')
    lines.push(
      t('share.unclaimed', {
        count: result.unclaimedItems.length,
        amount: formatRupiah(total),
        names: result.unclaimedItems.map(item => item.name).join(', '),
      }),
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
