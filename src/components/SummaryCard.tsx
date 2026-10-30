import {
  RiArrowDownSLine,
  RiSettings3Line,
  RiShareLine,
} from '@remixicon/react'
import type { CalcResult } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import type { Participant } from '../types/database'
import { Alert } from '../ui/Alert'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface SummaryCardProps {
  result: CalcResult
  participants: Participant[]
  me: string
  receiptTotal: number
  claimingUnclaimed?: boolean
  onOpenSettings: () => void
  onShare: () => void
  onClaimUnclaimed: (mode: 'all' | 'payer') => void
}

export function SummaryCard({
  result,
  participants,
  me,
  receiptTotal,
  claimingUnclaimed,
  onOpenSettings,
  onShare,
  onClaimUnclaimed,
}: SummaryCardProps) {
  const claimedGross = result.items
    .filter(item => item.claimed)
    .reduce((sum, item) => sum + item.gross, 0)
  const itemDiscount = claimedGross - result.claimedNet
  const unclaimedTotal = result.unclaimedItems.reduce(
    (sum, item) => sum + item.net,
    0,
  )
  const unclaimedNames = result.unclaimedItems
    .map(item => item.name)
    .slice(0, 3)
    .join(', ')
  const extraUnclaimed = Math.max(0, result.unclaimedItems.length - 3)
  const payer = participants.find(participant => participant.is_payer) ?? null
  const hasReceipt = receiptTotal > 0
  const receiptDiff = result.grandTotal - receiptTotal
  const receiptTone =
    receiptDiff === 0 ? 'success' : 'warning'
  const receiptMessage =
    receiptDiff === 0
      ? 'Cocok dengan total struk.'
      : receiptDiff > 0
        ? `Total aplikasi ${formatRupiah(receiptDiff)} lebih tinggi dari struk.`
        : `Total aplikasi ${formatRupiah(Math.abs(receiptDiff))} lebih rendah dari struk.`

  return (
    <Card className="p-4 sm:p-5" id="ringkasan">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-title-h6 text-text-strong-950">Ringkasan</h2>
          <p className="mt-0.5 text-paragraph-sm text-text-sub-600">
            Total yang harus dibayar tiap orang.
          </p>
        </div>
        <Button variant="neutral" mode="stroke" size="sm" onClick={onShare}>
          <RiShareLine className="size-4" />
          Bagikan
        </Button>
      </div>

      {result.unclaimedItems.length > 0 && (
        <Alert
          tone="warning"
          title={`${result.unclaimedItems.length} item belum diklaim`}
          className="mt-4"
        >
          <p>
            {unclaimedNames}
            {extraUnclaimed > 0 ? ` +${extraUnclaimed} lainnya` : ''} (
            {formatRupiah(unclaimedTotal)}) tidak dibebankan ke siapa pun.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              size="xs"
              variant="neutral"
              mode="stroke"
              disabled={claimingUnclaimed}
              onClick={() => onClaimUnclaimed('all')}
            >
              Bagi rata semua
            </Button>
            {payer && (
              <Button
                size="xs"
                variant="primary"
                mode="lighter"
                disabled={claimingUnclaimed}
                onClick={() => onClaimUnclaimed('payer')}
              >
                Bebankan ke {payer.name}
              </Button>
            )}
          </div>
        </Alert>
      )}

      <dl className="mt-4 space-y-2 text-paragraph-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-sub-600">Subtotal item</dt>
          <dd className="money text-text-strong-950">
            {formatRupiah(claimedGross)}
          </dd>
        </div>
        {itemDiscount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Diskon item</dt>
            <dd className="money text-success-base">
              −{formatRupiah(itemDiscount)}
            </dd>
          </div>
        )}
        {result.shippingAmount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Ongkir</dt>
            <dd className="money text-text-strong-950">
              +{formatRupiah(result.shippingAmount)}
            </dd>
          </div>
        )}
        {result.billDiscount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Diskon bill</dt>
            <dd className="money text-success-base">
              −{formatRupiah(result.billDiscount)}
            </dd>
          </div>
        )}
        {result.serviceAmount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Service</dt>
            <dd className="money text-text-strong-950">
              +{formatRupiah(result.serviceAmount)}
            </dd>
          </div>
        )}
        {result.taxAmount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Pajak / PB1</dt>
            <dd className="money text-text-strong-950">
              +{formatRupiah(result.taxAmount)}
            </dd>
          </div>
        )}
        {result.tipAmount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-text-sub-600">Tip</dt>
            <dd className="money text-text-strong-950">
              +{formatRupiah(result.tipAmount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-stroke-soft-200 pt-3">
          <dt className="text-label-md font-semibold text-text-strong-950">
            Total
          </dt>
          <dd className="money text-title-h6 text-text-strong-950">
            {formatRupiah(result.grandTotal)}
          </dd>
        </div>
      </dl>

      {hasReceipt && (
        <Alert
          tone={receiptTone}
          title="Cek total struk"
          className="mt-3"
        >
          <div className="flex justify-between gap-3">
            <span>Total struk</span>
            <span className="money">{formatRupiah(receiptTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Total aplikasi</span>
            <span className="money">{formatRupiah(result.grandTotal)}</span>
          </div>
          <p className="mt-1.5 font-medium">{receiptMessage}</p>
        </Alert>
      )}

      <Button
        variant="neutral"
        mode="stroke"
        className="mt-4 w-full"
        onClick={onOpenSettings}
      >
        <RiSettings3Line className="size-4" />
        Atur bill &amp; pembayaran
      </Button>

      <div className="mt-5 space-y-2">
        {result.people.map(person => {
          const participant = participants.find(
            entry => entry.id === person.participantId,
          )
          const isMe = person.participantId === me
          const isPayer = participant?.is_payer ?? false

          return (
            <details
              key={person.participantId}
              className="group rounded-10 border border-stroke-soft-200 bg-bg-weak-25/70"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-3 [&::-webkit-details-marker]:hidden">
                <Avatar name={person.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-label-md text-text-strong-950">
                      {person.name}
                    </p>
                    {isMe && <Badge tone="primary">Kamu</Badge>}
                    {isPayer && <Badge tone="success">Penerima</Badge>}
                  </div>
                  <p className="text-[11px] text-text-soft-400">
                    {person.items.length} item
                  </p>
                </div>
                <p className="money shrink-0 text-label-md font-semibold text-text-strong-950">
                  {formatRupiah(person.total)}
                </p>
                <RiArrowDownSLine className="size-4 shrink-0 text-text-soft-400 transition group-open:rotate-180" />
              </summary>

              <div className="space-y-1.5 border-t border-stroke-soft-200 px-3 py-3 text-[11px]">
                {person.items.map(item => (
                  <div
                    key={item.itemId}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="min-w-0 text-text-sub-600">
                      {item.itemName}
                      {item.weight > 1 && (
                        <span className="text-text-soft-400">
                          {' '}
                          · bobot {item.weight}
                        </span>
                      )}
                    </span>
                    <span className="money shrink-0 text-text-strong-950">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>
                ))}
                {person.shippingShare > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-text-sub-600">Ongkir</span>
                    <span className="money text-text-strong-950">
                      +{formatRupiah(person.shippingShare)}
                    </span>
                  </div>
                )}
                {person.billDiscountShare > 0 && (
                  <div className="flex justify-between gap-3 text-success-base">
                    <span>Diskon bill</span>
                    <span className="money">
                      −{formatRupiah(person.billDiscountShare)}
                    </span>
                  </div>
                )}
                {person.serviceShare > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-text-sub-600">Service</span>
                    <span className="money text-text-strong-950">
                      +{formatRupiah(person.serviceShare)}
                    </span>
                  </div>
                )}
                {person.taxShare > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-text-sub-600">Pajak / PB1</span>
                    <span className="money text-text-strong-950">
                      +{formatRupiah(person.taxShare)}
                    </span>
                  </div>
                )}
                {person.tipShare > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-text-sub-600">Tip</span>
                    <span className="money text-text-strong-950">
                      +{formatRupiah(person.tipShare)}
                    </span>
                  </div>
                )}
                {person.items.length === 0 && (
                  <p className="text-text-soft-400">
                    Tidak ikut item mana pun.
                  </p>
                )}
              </div>
            </details>
          )
        })}

        {result.people.length === 0 && (
          <p className="rounded-10 border border-dashed border-stroke-sub-300 p-3 text-paragraph-sm text-text-soft-400">
            Belum ada peserta.
          </p>
        )}
      </div>
    </Card>
  )
}
