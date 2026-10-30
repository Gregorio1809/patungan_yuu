import { RiCheckLine } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import type { CalcResult } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { buildSettlement, type SettlementLine } from '../lib/settlement'
import type { Participant } from '../types/database'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'
import { cn } from '../ui/cn'

interface SettlementCardProps {
  participants: Participant[]
  result: CalcResult
  rounding: number
  pending?: boolean
  onSetPayer: (participantId: string | null) => void
  onTogglePaid: (participantId: string, paid: boolean, amount: number) => void
}

function statusClass(line: SettlementLine): string {
  if (line.paid) {
    return 'border-success-base/20 bg-success-lighter text-success-base hover:bg-success-lighter'
  }
  if (line.stale) {
    return 'border-warning-base/20 bg-warning-lighter text-warning-base hover:bg-warning-lighter'
  }
  return ''
}

export function SettlementCard({
  participants,
  result,
  rounding,
  pending,
  onSetPayer,
  onTogglePaid,
}: SettlementCardProps) {
  const { t } = useTranslation()
  const settlement = buildSettlement(result, participants, rounding)

  return (
    <Card className="p-4 sm:p-5" id="pembayaran">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-title-h6 text-text-strong-950">
            {t('settlement.title')}
          </h2>
          <p className="mt-0.5 text-paragraph-sm text-text-sub-600">
            {t('settlement.subtitle')}
          </p>
        </div>
        {settlement.totalCount > 0 && (
          <Badge tone="neutral">
            {t('settlement.paidCount', {
              paid: settlement.paidCount,
              total: settlement.totalCount,
            })}
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="patungan-payer"
          className="mb-1.5 block text-label-sm text-text-sub-600"
        >
          {t('settlement.payerLabel')}
        </label>
        <Select
          id="patungan-payer"
          value={settlement.payer?.id ?? ''}
          disabled={pending}
          onChange={event => onSetPayer(event.target.value || null)}
        >
          <option value="">{t('settlement.payerNone')}</option>
          {participants.map(participant => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </Select>
        {!settlement.payer && (
          <p className="mt-1.5 text-[11px] text-text-soft-400">
            {t('settlement.payerHelp')}
          </p>
        )}
      </div>

      {settlement.payer && (
        <div className="mt-4 rounded-10 border border-stroke-soft-200 bg-bg-weak-25 px-3.5 py-3 text-paragraph-sm">
          <div className="flex justify-between gap-3">
            <span className="text-text-sub-600">{t('common.payer')}</span>
            <span className="font-semibold text-text-strong-950">
              {settlement.payer.name}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-text-sub-600">
              {t('settlement.ownShare')}
            </span>
            <span className="money text-text-strong-950">
              {formatRupiah(settlement.payerTotal)}
            </span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span className="text-text-sub-600">
              {t('settlement.unpaid')}
            </span>
            <span className="money font-semibold text-text-strong-950">
              {formatRupiah(settlement.unpaidTotal)}
            </span>
          </div>
          {settlement.roundingExtra > 0 && (
            <p className="mt-2 text-[11px] text-text-soft-400">
              {t('settlement.rounding', {
                amount: formatRupiah(settlement.rounding),
                extra: formatRupiah(settlement.roundingExtra),
              })}
            </p>
          )}
        </div>
      )}

      {settlement.lines.length > 0 ? (
        <ul className="mt-3 divide-y divide-stroke-soft-200">
          {settlement.lines.map(line => (
            <li
              key={line.participantId}
              className="flex items-center gap-2.5 py-3"
            >
              <Avatar name={line.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-md text-text-strong-950">
                  {line.name}
                </p>
                <p className="text-[11px] text-text-soft-400">
                  {settlement.payer
                    ? t('settlement.transferTo', {
                        name: settlement.payer.name,
                      })
                    : t('settlement.totalBill')}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="money text-label-md font-semibold text-text-strong-950">
                  {formatRupiah(line.amount)}
                </p>
                {line.amount !== line.exactAmount && (
                  <p className="money text-[10px] text-text-soft-400">
                    {t('settlement.from', {
                      amount: formatRupiah(line.exactAmount),
                    })}
                  </p>
                )}
              </div>
              <Button
                variant="neutral"
                mode="stroke"
                size="sm"
                disabled={pending}
                className={cn('shrink-0', statusClass(line))}
                aria-label={
                  line.paid
                    ? t('settlement.markUnpaidAria', {
                        name: line.name,
                      })
                    : t('settlement.markPaidAria', {
                        name: line.name,
                      })
                }
                onClick={() =>
                  onTogglePaid(
                    line.participantId,
                    !line.paid,
                    line.amount,
                  )
                }
              >
                {line.paid && <RiCheckLine className="size-4" />}
                {line.paid
                  ? t('settlement.paid')
                  : line.stale
                    ? t('settlement.update')
                    : t('settlement.mark')}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-paragraph-sm text-text-soft-400">
          {t('settlement.empty')}
        </p>
      )}
    </Card>
  )
}
