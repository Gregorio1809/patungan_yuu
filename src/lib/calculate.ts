import type {
  DiscountAllocation,
  DiscountType,
  TaxBase,
} from '../types/database'

export interface CalcClaim {
  participantId: string
  quantity: number
}

export interface CalcItem {
  id: string
  name: string
  price: number
  quantity: number
  discountType: DiscountType
  discountValue: number
  claims: CalcClaim[]
}

export interface CalcParticipant {
  id: string
  name: string
}

export interface CalcInput {
  participants: CalcParticipant[]
  items: CalcItem[]
  billDiscountType: DiscountType
  billDiscountValue: number
  discountAllocation: DiscountAllocation
  servicePercent: number
  taxPercent: number
  taxBase: TaxBase
  tipAmount: number
}

export interface PersonItemShare {
  itemId: string
  itemName: string
  amount: number
  weight: number
}

export interface PersonResult {
  participantId: string
  name: string
  subtotal: number
  billDiscountShare: number
  serviceShare: number
  taxShare: number
  tipShare: number
  total: number
  items: PersonItemShare[]
}

export interface ItemResult {
  itemId: string
  name: string
  gross: number
  discount: number
  net: number
  claimWeight: number
  claimed: boolean
}

export interface UnclaimedItem {
  itemId: string
  name: string
  net: number
}

export interface CalcResult {
  people: PersonResult[]
  items: ItemResult[]
  totalGross: number
  totalItemDiscount: number
  totalNet: number
  claimedNet: number
  billDiscount: number
  serviceAmount: number
  taxAmount: number
  tipAmount: number
  grandTotal: number
  unclaimedItems: UnclaimedItem[]
}

/**
 * Bagi `total` (integer) menjadi bagian integer sesuai bobot memakai
 * metode largest remainder supaya jumlah hasil selalu tepat sama dengan total.
 */
export function allocate(total: number, weights: number[]): number[] {
  const safeTotal = Math.max(0, Math.round(total))
  const safeWeights = weights.map(weight =>
    Number.isFinite(weight) && weight > 0 ? weight : 0,
  )
  const weightSum = safeWeights.reduce((sum, weight) => sum + weight, 0)

  if (weightSum <= 0 || safeTotal === 0) {
    return weights.map(() => 0)
  }

  const raw = safeWeights.map(weight => (safeTotal * weight) / weightSum)
  const shares = raw.map(value => Math.floor(value))
  const rest = safeTotal - shares.reduce((sum, value) => sum + value, 0)

  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)

  for (let step = 0; step < rest; step += 1) {
    shares[order[step % order.length].index] += 1
  }

  return shares
}

/**
 * Bagi rata dengan batas maksimum per penerima. Dipakai untuk diskon bill
 * yang dibagi rata agar tidak ada peserta yang diskonnya melebihi subtotal.
 */
export function allocateEqualCapped(total: number, caps: number[]): number[] {
  const safeTotal = Math.max(0, Math.round(total))
  const safeCaps = caps.map(cap =>
    Number.isFinite(cap) ? Math.max(0, Math.round(cap)) : 0,
  )
  const shares = safeCaps.map(() => 0)
  let remaining = safeTotal

  while (remaining > 0) {
    const eligible = safeCaps
      .map((cap, index) => ({ cap, index }))
      .filter(entry => shares[entry.index] < entry.cap)

    if (eligible.length === 0) break

    const per = Math.max(1, Math.floor(remaining / eligible.length))
    let distributed = 0

    for (const entry of eligible) {
      if (remaining <= 0) break
      const take = Math.min(
        per,
        entry.cap - shares[entry.index],
        remaining,
      )
      shares[entry.index] += take
      remaining -= take
      distributed += take
    }

    if (distributed === 0) break
  }

  return shares
}

function applyDiscount(base: number, type: DiscountType, value: number): number {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0
  const raw =
    type === 'percent'
      ? Math.round((base * safeValue) / 100)
      : Math.round(safeValue)
  return Math.min(base, Math.max(0, raw))
}

function applyPercent(base: number, percent: number): number {
  const safePercent = Number.isFinite(percent) ? Math.max(0, percent) : 0
  return Math.max(0, Math.round((base * safePercent) / 100))
}

export interface ItemPricing {
  gross: number
  discount: number
  net: number
}

export function calculateItemPricing(
  price: number,
  quantity: number,
  type: DiscountType,
  value: number,
): ItemPricing {
  const gross = Math.max(0, Math.round(price * quantity))
  const discount = applyDiscount(gross, type, value)
  return { gross, discount, net: gross - discount }
}

export function calculate(input: CalcInput): CalcResult {
  const personMap = new Map<string, PersonResult>()

  for (const participant of input.participants) {
    personMap.set(participant.id, {
      participantId: participant.id,
      name: participant.name,
      subtotal: 0,
      billDiscountShare: 0,
      serviceShare: 0,
      taxShare: 0,
      tipShare: 0,
      total: 0,
      items: [],
    })
  }

  const itemResults: ItemResult[] = []
  const unclaimedItems: UnclaimedItem[] = []
  let totalGross = 0
  let totalItemDiscount = 0
  let claimedNet = 0

  for (const item of input.items) {
    const { gross, discount, net } = calculateItemPricing(
      item.price,
      item.quantity,
      item.discountType,
      item.discountValue,
    )

    const claims = item.claims
      .map(claim => ({
        participantId: claim.participantId,
        quantity: Math.max(0, Math.round(claim.quantity)),
      }))
      .filter(claim => claim.quantity > 0 && personMap.has(claim.participantId))

    const claimWeight = claims.reduce((sum, claim) => sum + claim.quantity, 0)

    totalGross += gross
    totalItemDiscount += discount

    itemResults.push({
      itemId: item.id,
      name: item.name,
      gross,
      discount,
      net,
      claimWeight,
      claimed: claimWeight > 0,
    })

    if (claimWeight <= 0) {
      if (net > 0) {
        unclaimedItems.push({ itemId: item.id, name: item.name, net })
      }
      continue
    }

    claimedNet += net

    const shares = allocate(net, claims.map(claim => claim.quantity))
    claims.forEach((claim, index) => {
      const person = personMap.get(claim.participantId)
      if (!person) return

      const amount = shares[index]
      person.subtotal += amount
      person.items.push({
        itemId: item.id,
        itemName: item.name,
        amount,
        weight: claim.quantity,
      })
    })
  }

  const people = input.participants
    .map(participant => personMap.get(participant.id))
    .filter((person): person is PersonResult => Boolean(person))

  const subtotals = people.map(person => person.subtotal)
  const hasBill = claimedNet > 0

  const billDiscount = applyDiscount(
    claimedNet,
    input.billDiscountType,
    input.billDiscountValue,
  )

  const billShares =
    input.discountAllocation === 'equal'
      ? allocateEqualCapped(billDiscount, subtotals)
      : allocate(billDiscount, subtotals)

  const afterDiscount = subtotals.map(
    (subtotal, index) => subtotal - billShares[index],
  )
  const afterDiscountTotal = afterDiscount.reduce(
    (sum, value) => sum + value,
    0,
  )

  const serviceAmount = hasBill
    ? applyPercent(afterDiscountTotal, input.servicePercent)
    : 0
  const serviceShares = allocate(serviceAmount, afterDiscount)

  const taxBaseTotal =
    (input.taxBase === 'before_discount' ? claimedNet : afterDiscountTotal) +
    serviceAmount
  const taxAmount = hasBill ? applyPercent(taxBaseTotal, input.taxPercent) : 0

  const taxWeights = afterDiscount.map((amount, index) => {
    const baseWeight =
      input.taxBase === 'before_discount' ? subtotals[index] : amount
    return Math.max(0, baseWeight) + serviceShares[index]
  })
  const taxShares = allocate(taxAmount, taxWeights)

  const tipAmount = hasBill
    ? Math.max(0, Math.round(Number(input.tipAmount) || 0))
    : 0
  const tipShares = allocate(tipAmount, subtotals)

  people.forEach((person, index) => {
    person.billDiscountShare = billShares[index]
    person.serviceShare = serviceShares[index]
    person.taxShare = taxShares[index]
    person.tipShare = tipShares[index]
    person.total =
      afterDiscount[index] +
      person.serviceShare +
      person.taxShare +
      person.tipShare
  })

  const grandTotal = people.reduce((sum, person) => sum + person.total, 0)

  return {
    people,
    items: itemResults,
    totalGross,
    totalItemDiscount,
    totalNet: totalGross - totalItemDiscount,
    claimedNet,
    billDiscount,
    serviceAmount,
    taxAmount,
    tipAmount,
    grandTotal,
    unclaimedItems,
  }
}
