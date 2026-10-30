import { useTranslation } from '../i18n/useTranslation'
import type { ItemWithAssignments, Participant } from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { Alert } from '../ui/Alert'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Stepper } from '../ui/Stepper'

interface ClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ItemWithAssignments | null
  participants: Participant[]
  me: string
  pendingIds?: string[]
  onSetClaim: (
    participantId: string,
    quantity: number | null,
  ) => void
}

export function ClaimDialog({
  open,
  onOpenChange,
  item,
  participants,
  me,
  pendingIds,
  onSetClaim,
}: ClaimDialogProps) {
  const { t } = useTranslation()
  const pendingSet = new Set(pendingIds ?? [])
  const pricing = item
    ? calculateItemPricing(
        item.price,
        item.quantity,
        item.discount_type,
        item.discount_value,
      )
    : null
  const claimWeight =
    item?.item_assignments.reduce(
      (sum, assignment) => sum + assignment.quantity,
      0,
    ) ?? 0

  function claimQty(participantId: string): number | null {
    const assignment = item?.item_assignments.find(
      entry => entry.participant_id === participantId,
    )
    return assignment ? assignment.quantity : null
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('claim.title')}
      description={item?.name}
      footer={
        <Button
          variant="neutral"
          mode="stroke"
          onClick={() => onOpenChange(false)}
        >
          {t('claim.done')}
        </Button>
      }
    >
      {item && pricing && (
        <Alert tone="info">
          {t('claim.info')}
          <span className="mt-1 block font-medium text-text-strong-950">
            {t('claim.net', {
              amount: formatRupiah(pricing.net),
            })}{' '}
            {t('claim.weight', { count: claimWeight })}
          </span>
        </Alert>
      )}

      <ul className="mt-2 divide-y divide-stroke-soft-200">
        {participants.map(participant => {
          const quantity = claimQty(participant.id)
          return (
            <li
              key={participant.id}
              className="flex items-center gap-2.5 py-3"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-primary-text"
                  checked={quantity !== null}
                  disabled={pendingSet.has(participant.id)}
                  onChange={event =>
                    onSetClaim(
                      participant.id,
                      event.target.checked ? 1 : null,
                    )
                  }
                />
                <Avatar name={participant.name} />
                <span className="min-w-0 truncate text-label-md text-text-strong-950">
                  {participant.name}
                </span>
                {participant.id === me && (
                  <Badge tone="primary">{t('common.you')}</Badge>
                )}
              </label>

              {quantity !== null && (
                <Stepper
                  value={quantity}
                  disabled={pendingSet.has(participant.id)}
                  onChange={value => onSetClaim(participant.id, value)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
