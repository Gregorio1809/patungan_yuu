import { describe, expect, it } from 'vitest'
import { allocate, allocateEqualCapped, calculate } from './calculate'
import type { CalcInput, CalcItem } from './calculate'
import { roundUpTo } from './money'

const ani = { id: 'ani', name: 'Ani' }
const budi = { id: 'budi', name: 'Budi' }
const citra = { id: 'citra', name: 'Citra' }

function makeItem(overrides: Partial<CalcItem> & Pick<CalcItem, 'id' | 'name' | 'price'>): CalcItem {
  return {
    quantity: 1,
    discountType: 'percent',
    discountValue: 0,
    claims: [],
    ...overrides,
  }
}

function makeInput(overrides: Partial<CalcInput>): CalcInput {
  return {
    participants: [ani, budi, citra],
    items: [],
    billDiscountType: 'percent',
    billDiscountValue: 0,
    discountAllocation: 'proportional',
    servicePercent: 0,
    taxPercent: 0,
    taxBase: 'after_discount',
    tipAmount: 0,
    ...overrides,
  }
}

function totalOf(result: ReturnType<typeof calculate>, participantId: string): number {
  const person = result.people.find(person => person.participantId === participantId)
  if (!person) throw new Error(`Participant ${participantId} missing`)
  return person.total
}

describe('allocate', () => {
  it('membagi rata dengan sisa yang tetap pas', () => {
    const shares = allocate(100_000, [1, 1, 1])
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100_000)
    expect(shares.sort((a, b) => a - b)).toEqual([33_333, 33_333, 33_334])
  })

  it('menghormati bobot', () => {
    expect(allocate(90_000, [1, 2])).toEqual([30_000, 60_000])
  })

  it('mengembalikan nol saat bobot kosong', () => {
    expect(allocate(50_000, [0, 0])).toEqual([0, 0])
  })
})

describe('allocateEqualCapped', () => {
  it('membagi rata tanpa melewati subtotal', () => {
    expect(allocateEqualCapped(50_000, [10_000, 90_000])).toEqual([
      10_000, 40_000,
    ])
  })

  it('membagi rata biasa', () => {
    expect(allocateEqualCapped(30_000, [30_000, 60_000])).toEqual([
      15_000, 15_000,
    ])
  })

  it('menjaga jumlah tetap sama dengan total', () => {
    const shares = allocateEqualCapped(77_777, [20_000, 30_000, 80_000])
    expect(shares.reduce((sum, value) => sum + value, 0)).toBe(77_777)
    expect(shares.every((value, index) => value <= [20_000, 30_000, 80_000][index])).toBe(true)
  })
})

describe('roundUpTo', () => {
  it('membulatkan transfer ke atas', () => {
    expect(roundUpTo(157_842, 500)).toBe(158_000)
    expect(roundUpTo(158_000, 500)).toBe(158_000)
    expect(roundUpTo(1, 1_000)).toBe(1_000)
    expect(roundUpTo(0, 1_000)).toBe(0)
  })
})

describe('calculate', () => {
  it('menghitung item terpisah untuk dua orang', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'Nasi goreng', price: 25_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'Mie ayam', price: 40_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
      }),
    )

    expect(totalOf(result, 'ani')).toBe(25_000)
    expect(totalOf(result, 'budi')).toBe(40_000)
    expect(result.grandTotal).toBe(65_000)
    expect(result.unclaimedItems).toHaveLength(0)
  })

  it('membagi satu item ke tiga orang tanpa selisih', () => {
    const result = calculate(
      makeInput({
        items: [
          makeItem({
            id: 'i1',
            name: 'Pizza',
            price: 100_000,
            claims: [
              { participantId: 'ani', quantity: 1 },
              { participantId: 'budi', quantity: 1 },
              { participantId: 'citra', quantity: 1 },
            ],
          }),
        ],
      }),
    )

    const totals = result.people.map(person => person.total).sort((a, b) => a - b)
    expect(totals).toEqual([33_333, 33_333, 33_334])
    expect(result.grandTotal).toBe(100_000)
  })

  it('membagi item qty 2 sesuai bobot satu per orang', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({
            id: 'i1',
            name: 'Ayam geprek',
            price: 25_000,
            quantity: 2,
            claims: [
              { participantId: 'ani', quantity: 1 },
              { participantId: 'budi', quantity: 1 },
            ],
          }),
        ],
      }),
    )

    expect(totalOf(result, 'ani')).toBe(25_000)
    expect(totalOf(result, 'budi')).toBe(25_000)
    expect(result.grandTotal).toBe(50_000)
  })

  it('menerapkan diskon item persen dan nominal', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({
            id: 'i1',
            name: 'Sushi',
            price: 100_000,
            discountType: 'percent',
            discountValue: 10,
            claims: [{ participantId: 'ani', quantity: 1 }],
          }),
          makeItem({
            id: 'i2',
            name: 'Ramen',
            price: 100_000,
            discountType: 'amount',
            discountValue: 15_000,
            claims: [{ participantId: 'budi', quantity: 1 }],
          }),
        ],
      }),
    )

    expect(totalOf(result, 'ani')).toBe(90_000)
    expect(totalOf(result, 'budi')).toBe(85_000)
    expect(result.totalItemDiscount).toBe(25_000)
  })

  it('membatasi diskon nominal agar tidak melebihi harga', () => {
    const result = calculate(
      makeInput({
        participants: [ani],
        items: [
          makeItem({
            id: 'i1',
            name: 'Es teh',
            price: 10_000,
            discountType: 'amount',
            discountValue: 50_000,
            claims: [{ participantId: 'ani', quantity: 1 }],
          }),
        ],
      }),
    )

    expect(result.items[0].discount).toBe(10_000)
    expect(result.items[0].net).toBe(0)
    expect(totalOf(result, 'ani')).toBe(0)
  })

  it('membagi diskon bill proporsional', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'Paket A', price: 30_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'Paket B', price: 60_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
        billDiscountType: 'amount',
        billDiscountValue: 30_000,
      }),
    )

    expect(result.billDiscount).toBe(30_000)
    expect(totalOf(result, 'ani')).toBe(20_000)
    expect(totalOf(result, 'budi')).toBe(40_000)
    expect(result.grandTotal).toBe(60_000)
  })

  it('menghitung diskon bill persen dan pajak setelah diskon', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'Paket A', price: 30_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'Paket B', price: 60_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
        billDiscountType: 'percent',
        billDiscountValue: 10,
        taxPercent: 10,
      }),
    )

    expect(result.billDiscount).toBe(9_000)
    expect(result.taxAmount).toBe(8_100)
    expect(totalOf(result, 'ani')).toBe(29_700)
    expect(totalOf(result, 'budi')).toBe(59_400)
    expect(result.grandTotal).toBe(89_100)
  })

  it('mengecualikan item tanpa klaim dari tagihan', () => {
    const result = calculate(
      makeInput({
        participants: [ani],
        items: [
          makeItem({ id: 'i1', name: 'Diklaim', price: 50_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'Tidak diklaim', price: 30_000 }),
        ],
      }),
    )

    expect(totalOf(result, 'ani')).toBe(50_000)
    expect(result.claimedNet).toBe(50_000)
    expect(result.totalNet).toBe(80_000)
    expect(result.unclaimedItems).toEqual([{ itemId: 'i2', name: 'Tidak diklaim', net: 30_000 }])
    expect(result.grandTotal).toBe(50_000)
  })

  it('memberi total nol untuk peserta tanpa item', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'Kopi', price: 20_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
        ],
      }),
    )

    expect(totalOf(result, 'budi')).toBe(0)
    expect(result.grandTotal).toBe(20_000)
  })

  it('aman untuk semua nilai nol', () => {
    const result = calculate(makeInput({ participants: [], items: [] }))

    expect(result.grandTotal).toBe(0)
    expect(result.billDiscount).toBe(0)
    expect(result.taxAmount).toBe(0)
    expect(result.people).toHaveLength(0)
    expect(Number.isNaN(result.grandTotal)).toBe(false)
  })

  it('menghitung service charge', () => {
    const result = calculate(
      makeInput({
        participants: [ani],
        items: [
          makeItem({
            id: 'i1',
            name: 'Makan malam',
            price: 100_000,
            claims: [{ participantId: 'ani', quantity: 1 }],
          }),
        ],
        servicePercent: 5,
      }),
    )

    expect(result.serviceAmount).toBe(5_000)
    expect(result.grandTotal).toBe(105_000)
    expect(result.people[0].serviceShare).toBe(5_000)
  })

  it('menerapkan pajak sebelum atau sesudah diskon', () => {
    const base = {
      participants: [ani],
      items: [
        makeItem({
          id: 'i1',
          name: 'Makan malam',
          price: 100_000,
          claims: [{ participantId: 'ani', quantity: 1 }],
        }),
      ],
      billDiscountType: 'amount' as const,
      billDiscountValue: 10_000,
      taxPercent: 10,
    }

    const afterDiscount = calculate(
      makeInput({ ...base, taxBase: 'after_discount' }),
    )
    expect(afterDiscount.taxAmount).toBe(9_000)
    expect(afterDiscount.grandTotal).toBe(99_000)

    const beforeDiscount = calculate(
      makeInput({ ...base, taxBase: 'before_discount' }),
    )
    expect(beforeDiscount.taxAmount).toBe(10_000)
    expect(beforeDiscount.grandTotal).toBe(100_000)
  })

  it('menghitung service, pajak setelah diskon, dan tip berurutan', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({
            id: 'i1',
            name: 'Paket A',
            price: 100_000,
            claims: [{ participantId: 'ani', quantity: 1 }],
          }),
          makeItem({
            id: 'i2',
            name: 'Paket B',
            price: 100_000,
            claims: [{ participantId: 'budi', quantity: 1 }],
          }),
        ],
        billDiscountType: 'amount',
        billDiscountValue: 20_000,
        servicePercent: 5,
        taxPercent: 10,
        taxBase: 'after_discount',
        tipAmount: 10_000,
      }),
    )

    expect(result.billDiscount).toBe(20_000)
    expect(result.serviceAmount).toBe(9_000)
    expect(result.taxAmount).toBe(18_900)
    expect(result.tipAmount).toBe(10_000)
    expect(result.grandTotal).toBe(217_900)
    expect(
      result.people.reduce((sum, person) => sum + person.total, 0),
    ).toBe(result.grandTotal)
  })

  it('membagi diskon bill rata dan membatasi per subtotal', () => {
    const normal = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'A', price: 30_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'B', price: 60_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
        billDiscountType: 'amount',
        billDiscountValue: 30_000,
        discountAllocation: 'equal',
      }),
    )

    expect(totalOf(normal, 'ani')).toBe(15_000)
    expect(totalOf(normal, 'budi')).toBe(45_000)
    expect(normal.grandTotal).toBe(60_000)

    const capped = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'A', price: 10_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'B', price: 90_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
        billDiscountType: 'amount',
        billDiscountValue: 50_000,
        discountAllocation: 'equal',
      }),
    )

    expect(totalOf(capped, 'ani')).toBe(0)
    expect(totalOf(capped, 'budi')).toBe(50_000)
    expect(capped.grandTotal).toBe(50_000)
  })

  it('membagi tip proporsional sesuai subtotal', () => {
    const result = calculate(
      makeInput({
        participants: [ani, budi],
        items: [
          makeItem({ id: 'i1', name: 'A', price: 30_000, claims: [{ participantId: 'ani', quantity: 1 }] }),
          makeItem({ id: 'i2', name: 'B', price: 60_000, claims: [{ participantId: 'budi', quantity: 1 }] }),
        ],
        tipAmount: 9_000,
      }),
    )

    expect(result.people[0].tipShare).toBe(3_000)
    expect(result.people[1].tipShare).toBe(6_000)
    expect(result.grandTotal).toBe(99_000)
  })

  it('menjaga jumlah total orang sama dengan grand total pada kasus campuran', () => {
    const result = calculate(
      makeInput({
        items: [
          makeItem({
            id: 'i1',
            name: 'Pizza',
            price: 89_000,
            quantity: 2,
            discountType: 'percent',
            discountValue: 15,
            claims: [
              { participantId: 'ani', quantity: 2 },
              { participantId: 'budi', quantity: 1 },
            ],
          }),
          makeItem({
            id: 'i2',
            name: 'Pasta',
            price: 45_000,
            discountType: 'amount',
            discountValue: 5_000,
            claims: [
              { participantId: 'budi', quantity: 1 },
              { participantId: 'citra', quantity: 1 },
            ],
          }),
          makeItem({ id: 'i3', name: 'Belum diklaim', price: 12_000 }),
        ],
        billDiscountType: 'percent',
        billDiscountValue: 12.5,
        taxPercent: 11,
        servicePercent: 5,
        taxBase: 'before_discount',
        tipAmount: 20_000,
      }),
    )

    const sumPeople = result.people.reduce((sum, person) => sum + person.total, 0)
    expect(sumPeople).toBe(result.grandTotal)
    expect(result.grandTotal).toBe(
      result.claimedNet -
        result.billDiscount +
        result.serviceAmount +
        result.taxAmount +
        result.tipAmount,
    )
    expect(result.unclaimedItems).toHaveLength(1)
  })
})
