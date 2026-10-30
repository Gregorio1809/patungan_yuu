import type { CalcResult } from './calculate'
import { roundUpTo } from './money'
import type { Participant, RoundingStep } from '../types/database'

export interface SettlementLine {
  participantId: string
  name: string
  exactAmount: number
  amount: number
  paid: boolean
  stale: boolean
}

export interface SettlementSummary {
  payer: Participant | null
  payerTotal: number
  lines: SettlementLine[]
  paidCount: number
  totalCount: number
  unpaidTotal: number
  roundingExtra: number
  rounding: RoundingStep
}

export function buildSettlement(
  result: CalcResult,
  participants: Participant[],
  rounding: number,
): SettlementSummary {
  const payer =
    participants.find(participant => participant.is_payer) ?? null
  const step: RoundingStep =
    rounding === 500 ? 500 : rounding === 1000 ? 1000 : 0

  const lines: SettlementLine[] = []
  let payerTotal = 0

  for (const person of result.people) {
    const participant = participants.find(
      entry => entry.id === person.participantId,
    )
    if (!participant) continue

    if (payer && participant.id === payer.id) {
      payerTotal = person.total
      continue
    }

    if (person.total <= 0) continue

    const exactAmount = person.total
    const amount =
      payer && step > 0 ? roundUpTo(exactAmount, step) : exactAmount
    const paid =
      participant.paid_at !== null &&
      participant.paid_amount !== null &&
      Number(participant.paid_amount) === amount
    const stale = participant.paid_at !== null && !paid

    lines.push({
      participantId: participant.id,
      name: participant.name,
      exactAmount,
      amount,
      paid,
      stale,
    })
  }

  const paidCount = lines.filter(line => line.paid).length
  const unpaidTotal = lines
    .filter(line => !line.paid)
    .reduce((sum, line) => sum + line.amount, 0)
  const roundingExtra = lines.reduce(
    (sum, line) => sum + (line.amount - line.exactAmount),
    0,
  )

  return {
    payer,
    payerTotal,
    lines,
    paidCount,
    totalCount: lines.length,
    unpaidTotal,
    roundingExtra,
    rounding: step,
  }
}
