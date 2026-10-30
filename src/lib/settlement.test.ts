import { describe, expect, it } from 'vitest'
import { calculate } from './calculate'
import type { CalcInput, CalcItem } from './calculate'
import { buildSettlement } from './settlement'
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
  participantId: string,
): CalcItem {
  return {
    id,
    name,
    price,
    quantity: 1,
    discountType: 'percent',
    discountValue: 0,
    claims: [{ participantId, quantity: 1 }],
  }
}

function makeResult(): ReturnType<typeof calculate> {
  const input: CalcInput = {
    participants: [
      { id: 'ani', name: 'Ani' },
      { id: 'budi', name: 'Budi' },
      { id: 'citra', name: 'Citra' },
      { id: 'dewi', name: 'Dewi' },
    ],
    items: [
      item('i1', 'Item Ani', 157_842, 'ani'),
      item('i2', 'Item Budi', 141_858, 'budi'),
      item('i3', 'Item Citra', 29_970, 'citra'),
    ],
    billDiscountType: 'percent',
    billDiscountValue: 0,
    discountAllocation: 'proportional',
    servicePercent: 0,
    taxPercent: 0,
    taxBase: 'after_discount',
    tipAmount: 0,
  }

  return calculate(input)
}

describe('buildSettlement', () => {
  it('menghitung transfer ke payer dengan pembulatan dan status lunas', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani', {
        paid_at: '2026-10-30T01:00:00.000Z',
        paid_amount: 158_000,
      }),
      participant('budi', 'Budi', { is_payer: true }),
      participant('citra', 'Citra', {
        paid_at: '2026-10-30T01:00:00.000Z',
        paid_amount: 29_000,
      }),
      participant('dewi', 'Dewi'),
    ]

    const settlement = buildSettlement(result, participants, 1_000)

    expect(settlement.payer?.id).toBe('budi')
    expect(settlement.payerTotal).toBe(141_858)
    expect(settlement.totalCount).toBe(2)
    expect(settlement.lines.map(line => line.participantId)).toEqual([
      'ani',
      'citra',
    ])
    expect(settlement.lines[0]).toMatchObject({
      participantId: 'ani',
      exactAmount: 157_842,
      amount: 158_000,
      paid: true,
      stale: false,
    })
    expect(settlement.lines[1]).toMatchObject({
      participantId: 'citra',
      exactAmount: 29_970,
      amount: 30_000,
      paid: false,
      stale: true,
    })
    expect(settlement.paidCount).toBe(1)
    expect(settlement.unpaidTotal).toBe(30_000)
    expect(settlement.roundingExtra).toBe(188)
  })

  it('menampilkan semua tagihan saat payer belum ditentukan', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani', {
        paid_at: '2026-10-30T01:00:00.000Z',
        paid_amount: 157_842,
      }),
      participant('budi', 'Budi'),
      participant('citra', 'Citra'),
      participant('dewi', 'Dewi'),
    ]

    const settlement = buildSettlement(result, participants, 1_000)

    expect(settlement.payer).toBeNull()
    expect(settlement.payerTotal).toBe(0)
    expect(settlement.totalCount).toBe(3)
    expect(settlement.lines.map(line => line.amount)).toEqual([
      157_842,
      141_858,
      29_970,
    ])
    expect(settlement.lines[0].paid).toBe(true)
    expect(settlement.paidCount).toBe(1)
    expect(settlement.unpaidTotal).toBe(171_828)
    expect(settlement.roundingExtra).toBe(0)
  })

  it('mengabaikan peserta tanpa tagihan', () => {
    const result = makeResult()
    const participants = [
      participant('ani', 'Ani'),
      participant('budi', 'Budi', { is_payer: true }),
      participant('citra', 'Citra'),
      participant('dewi', 'Dewi'),
    ]

    const settlement = buildSettlement(result, participants, 500)

    expect(settlement.lines.map(line => line.participantId)).toEqual([
      'ani',
      'citra',
    ])
    expect(settlement.lines[0].amount).toBe(158_000)
    expect(settlement.lines[1].amount).toBe(30_000)
  })
})
