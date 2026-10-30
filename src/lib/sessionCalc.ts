import { calculate } from './calculate'
import type { CalcInput, CalcResult } from './calculate'
import type {
  ItemWithAssignments,
  Participant,
  Session,
} from '../types/database'

export function toCalcInput(
  session: Session,
  participants: Participant[],
  items: ItemWithAssignments[],
): CalcInput {
  return {
    participants: participants.map(participant => ({
      id: participant.id,
      name: participant.name,
    })),
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discountType: item.discount_type,
      discountValue: item.discount_value,
      claims: item.item_assignments.map(assignment => ({
        participantId: assignment.participant_id,
        quantity: assignment.quantity,
      })),
    })),
    billDiscountType: session.bill_discount_type,
    billDiscountValue: session.bill_discount_value,
    discountAllocation: session.discount_allocation,
    discountScope: session.discount_scope,
    shippingAmount: session.shipping_amount,
    servicePercent: session.service_percent,
    taxPercent: session.tax_percent,
    taxBase: session.tax_base,
    tipAmount: session.tip_amount,
  }
}

export function calcSession(
  session: Session,
  participants: Participant[],
  items: ItemWithAssignments[],
): CalcResult {
  return calculate(toCalcInput(session, participants, items))
}

export function emptyCalcResult(): CalcResult {
  return calculate({
    participants: [],
    items: [],
    billDiscountType: 'percent',
    billDiscountValue: 0,
    discountAllocation: 'proportional',
    discountScope: 'items',
    shippingAmount: 0,
    servicePercent: 0,
    taxPercent: 0,
    taxBase: 'after_discount',
    tipAmount: 0,
  })
}
