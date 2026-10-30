import { describe, expect, it } from 'vitest'
import { calculate } from './calculate'
import type { CalcInput, CalcItem } from './calculate'
import { formatRupiah } from './money'
import { buildSummaryText } from './share'
import type { Participant } from '../types/database'

const sessionId = 'session-1'

function participant(
  id: string,
  name: string,
  overrides: Partial<Participant> = {},
): Participant {
  return {
    id,
    session_id: sessionId,
    name,
    is_payer: false,
    paid_at: null,
    paid_amount: null,
    created_at: '2026-10-30T00:00:00.000Z',
    ...overrides,
  }
}

function item(
  id: string,
  name: string,
  price: number,
  participantIds: string[],
): CalcItem {
  return {
    id,
    name,
    price,
    quantity: 1,
    discountType: 'percent',
    discountValue: 0,
    claims: participantIds.map(participantId => ({
      participantId,
      quantity: 1,
    })),
  }
}

function makeResult(
  options: {
    shippingAmount?: number
    discountScope?: 'items' | 'final'
  } = {},
): ReturnType<typeof calculate> {
  const input: CalcInput = {
    participants: [
      { id: 'ani', name: 'Ani' },
      { id: 'budi', name: 'Budi' },
      { id: 'citra', name: 'Citra' },
    ],
    items: [
      item('i1', 'Pizza', 100_000, ['ani', 'budi']),
      item('i2', 'Pasta', 60_000, ['budi', 'citra']),
    ],
    billDiscountType: 'amount',
    billDiscountValue: 30_000,
    discountAllocation: 'proportional',
    discountScope: options.discountScope ?? 'items',
    shippingAmount: options.shippingAmount ?? 0,
    servicePercent: 5,
    taxPercent: 10,
    taxBase: 'after_discount',
    tipAmount: 10_000,
  }

  return calculate(input)
}

describe('buildSummaryText', () => {
  it('menampilkan breakdown biaya, penerima, dan status transfer', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani', {
        paid_at: '2026-10-30T01:00:00.000Z',
        paid_amount: 50_500,
      }),
      participant('budi', 'Budi', { is_payer: true }),
      participant('citra', 'Citra', {
        paid_at: '2026-10-30T01:00:00.000Z',
        paid_amount: 30_000,
      }),
    ]

    const text = buildSummaryText(
      { title: 'Uji fitur baru', rounding: 500 },
      result,
      participants,
      'https://example.test/s/abc',
    )

    expect(text).toContain('Subtotal:')
    expect(text).toContain(`Service: +${formatRupiah(result.serviceAmount)}`)
    expect(text).toContain(`Pajak/PB1: +${formatRupiah(result.taxAmount)}`)
    expect(text).toContain(`Tip: +${formatRupiah(result.tipAmount)}`)
    expect(text).toContain('Budi (penerima)')
    expect(text).toContain('Transfer ke Budi:')
    expect(text).toContain(`Ani: ${formatRupiah(50_500)} (lunas)`)
    expect(text).toContain(`Citra: ${formatRupiah(30_500)} (perlu dicek)`)
    expect(text).toContain('https://example.test/s/abc')
  })

  it('tidak menampilkan transfer jika penerima belum ditentukan', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani'),
      participant('budi', 'Budi'),
      participant('citra', 'Citra'),
    ]

    const text = buildSummaryText(
      { title: 'Uji fitur baru', rounding: 500 },
      result,
      participants,
    )

    expect(text).not.toContain('Transfer ke')
    expect(text).not.toContain('(penerima)')
  })

  it('menampilkan ongkir dan diskon total akhir', () => {
    const result = makeResult({
      shippingAmount: 15_000,
      discountScope: 'final',
    })
    const participants = [
      participant('ani', 'Ani'),
      participant('budi', 'Budi'),
      participant('citra', 'Citra'),
    ]

    const text = buildSummaryText(
      { title: 'Uji ongkir', rounding: 0 },
      result,
      participants,
    )

    expect(text).toContain(`Ongkir: +${formatRupiah(15_000)}`)
    expect(text).toContain(`Total: ${formatRupiah(result.grandTotal)}`)
    expect(result.shippingAmount).toBe(15_000)
  })

  it('menghasilkan ringkasan bahasa Inggris', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani'),
      participant('budi', 'Budi', { is_payer: true }),
      participant('citra', 'Citra'),
    ]

    const text = buildSummaryText(
      { title: 'English test', rounding: 0 },
      result,
      participants,
      undefined,
      'en',
    )

    expect(text).toContain('Subtotal:')
    expect(text).toContain('Transfer to Budi:')
    expect(text).toContain('Budi (payer)')
    expect(text).toContain('Ani:')
    expect(text).not.toContain('Transfer ke')
  })
})
