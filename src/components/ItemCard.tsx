import {
  RiAddLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiPencilLine,
  RiUserLine,
} from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import type { ItemWithAssignments, Participant } from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ItemCardProps {
  items: ItemWithAssignments[]
  participants: Participant[]
  onAdd: () => void
  onClaim: (item: ItemWithAssignments) => void
  onEdit: (item: ItemWithAssignments) => void
  onDuplicate: (item: ItemWithAssignments) => void
  onDelete: (item: ItemWithAssignments) => void
}

export function ItemCard({
  items,
  participants,
  onAdd,
  onClaim,
  onEdit,
  onDuplicate,
  onDelete,
}: ItemCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-stroke-soft-200 px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="text-title-h6 text-text-strong-950">
            {t('items.title')}
          </h2>
          <p className="mt-0.5 text-paragraph-sm text-text-sub-600">
            {t('common.itemCount', { count: items.length })}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onAdd}>
          <RiAddLine className="size-4" />
          {t('items.add')}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-12 bg-bg-weak-50 text-text-soft-400">
            <RiUserLine className="size-5" />
          </span>
          <h3 className="mt-3 text-label-md text-text-strong-950">
            {t('items.emptyTitle')}
          </h3>
          <p className="mt-1 max-w-sm text-paragraph-sm text-text-sub-600">
            {t('items.emptyBody')}
          </p>
          <Button
            variant="neutral"
            mode="stroke"
            className="mt-4"
            onClick={onAdd}
          >
            <RiAddLine className="size-4" />
            {t('items.emptyCta')}
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-stroke-soft-200">
          {items.map(item => {
            const pricing = calculateItemPricing(
              item.price,
              item.quantity,
              item.discount_type,
              item.discount_value,
            )
            const claims = item.item_assignments
              .map(assignment => ({
                assignment,
                participant: participants.find(
                  participant => participant.id === assignment.participant_id,
                ),
              }))
              .filter(
                (
                  row,
                ): row is {
                  assignment: (typeof item.item_assignments)[number]
                  participant: Participant
                } => Boolean(row.participant),
              )
            const discount =
              item.discount_value > 0
                ? item.discount_type === 'percent'
                  ? `${item.discount_value}%`
                  : formatRupiah(item.discount_value)
                : null

            return (
              <li key={item.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3
                        className="truncate text-label-md text-text-strong-950"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                      {item.quantity > 1 && (
                        <Badge tone="neutral">×{item.quantity}</Badge>
                      )}
                      {discount && (
                        <Badge tone="primary">
                          {t('items.discountBadge', { value: discount })}
                        </Badge>
                      )}
                      {claims.length === 0 && (
                        <Badge tone="warning">{t('items.unclaimed')}</Badge>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {claims.map(row => (
                        <span
                          key={row.participant.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-weak-25 py-1 pr-2 pl-1 text-[11px] text-text-sub-600"
                        >
                          <Avatar name={row.participant.name} size="sm" />
                          <span className="max-w-24 truncate">
                            {row.participant.name}
                          </span>
                          {row.assignment.quantity > 1 && (
                            <span className="text-text-soft-400">
                              ×{row.assignment.quantity}
                            </span>
                          )}
                        </span>
                      ))}
                      {claims.length === 0 && (
                        <span className="text-[11px] text-text-soft-400">
                          {t('items.noClaims')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 border-t border-stroke-soft-200 pt-3 sm:border-0 sm:pt-0">
                    <span className="money text-label-md font-semibold text-text-strong-950">
                      {formatRupiah(pricing.net)}
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        variant="neutral"
                        mode="stroke"
                        size="sm"
                        onClick={() => onClaim(item)}
                      >
                        <RiUserLine className="size-4" />
                        {t('items.claim')}
                      </Button>
                      <Button
                        variant="neutral"
                        mode="ghost"
                        size="icon"
                        aria-label={t('items.duplicateAria')}
                        onClick={() => onDuplicate(item)}
                      >
                        <RiFileCopyLine className="size-4" />
                      </Button>
                      <Button
                        variant="neutral"
                        mode="ghost"
                        size="icon"
                        aria-label={t('items.editAria')}
                        onClick={() => onEdit(item)}
                      >
                        <RiPencilLine className="size-4" />
                      </Button>
                      <Button
                        variant="error"
                        mode="ghost"
                        size="icon"
                        aria-label={t('items.deleteAria')}
                        onClick={() => onDelete(item)}
                      >
                        <RiDeleteBinLine className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
