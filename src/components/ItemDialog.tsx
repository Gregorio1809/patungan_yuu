import { useEffect, useState } from 'react'
import { RiAddLine, RiCloseLine } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import type {
  DiscountType,
  ItemWithAssignments,
  NewItemInput,
  Participant,
} from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Modal } from '../ui/Modal'
import { MoneyInput } from '../ui/MoneyInput'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Stepper } from '../ui/Stepper'

interface ItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ItemWithAssignments | null
  participants: Participant[]
  me: string
  pending?: boolean
  onSave: (
    input: NewItemInput,
    claims: Record<string, number>,
    newNames: string[],
  ) => void
}

type ItemError = 'name' | 'percent' | null

export function ItemDialog({
  open,
  onOpenChange,
  item,
  participants,
  me,
  pending,
  onSave,
}: ItemDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [claims, setClaims] = useState<Record<string, number>>({})
  const [newNames, setNewNames] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<ItemError>(null)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setPrice(item?.price ?? 0)
    setQuantity(item?.quantity ?? 1)
    setDiscountType(item?.discount_type ?? 'percent')
    setDiscountValue(item?.discount_value ?? 0)
    setClaims(
      Object.fromEntries(
        (item?.item_assignments ?? []).map(assignment => [
          assignment.participant_id,
          assignment.quantity,
        ]),
      ),
    )
    setNewNames([])
    setNewName('')
    setError(null)
  }, [open, item])

  const pricing = calculateItemPricing(
    price,
    quantity,
    discountType,
    discountValue,
  )
  const claimedCount = Object.keys(claims).length + newNames.length

  function toggleClaim(participantId: string, checked: boolean) {
    setClaims(previous => {
      const next = { ...previous }
      if (checked) {
        next[participantId] = previous[participantId] ?? 1
      } else {
        delete next[participantId]
      }
      return next
    })
  }

  function setClaimWeight(participantId: string, value: number) {
    setClaims(previous => ({
      ...previous,
      [participantId]: Math.max(1, Math.round(value)),
    }))
  }

  function addNewName() {
    const value = newName.trim()
    if (!value) return

    const existing = participants.find(
      participant =>
        participant.name.trim().toLowerCase() === value.toLowerCase(),
    )

    if (existing) {
      setClaims(previous => ({
        ...previous,
        [existing.id]: previous[existing.id] ?? 1,
      }))
    } else if (
      !newNames.some(entry => entry.toLowerCase() === value.toLowerCase())
    ) {
      setNewNames(previous => [...previous, value])
    }

    setNewName('')
  }

  function removeNewName(value: string) {
    setNewNames(previous => previous.filter(entry => entry !== value))
  }

  function submit() {
    const value = name.trim()
    if (!value) {
      setError('name')
      return
    }
    if (discountType === 'percent' && discountValue > 100) {
      setError('percent')
      return
    }
    setError(null)
    onSave(
      {
        name: value,
        price: Math.max(0, Math.round(price)),
        quantity: Math.max(1, Math.round(quantity)),
        discountType,
        discountValue: Math.max(0, discountValue),
      },
      claims,
      newNames,
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        item ? t('itemDialog.editTitle') : t('itemDialog.addTitle')
      }
      description={t('itemDialog.description')}
      footer={
        <>
          <Button
            variant="neutral"
            mode="stroke"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="patungan-item-form" disabled={pending}>
            {pending ? t('itemDialog.saving') : t('itemDialog.save')}
          </Button>
        </>
      }
    >
      <form
        id="patungan-item-form"
        className="space-y-4"
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
      >
        <div>
          <Label htmlFor="patungan-item-name">{t('itemDialog.name')}</Label>
          <Input
            id="patungan-item-name"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder={t('itemDialog.namePlaceholder')}
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="patungan-item-price">
              {t('itemDialog.price')}
            </Label>
            <MoneyInput
              id="patungan-item-price"
              value={price}
              onChange={setPrice}
              ariaLabel={t('itemDialog.price')}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-label-sm text-text-sub-600">
              {t('itemDialog.quantity')}
            </span>
            <div className="flex h-10 items-center">
              <Stepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                label={t('common.quantity')}
              />
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-label-sm text-text-sub-600">
            {t('itemDialog.discount')}
          </span>
          <SegmentedControl
            value={discountType}
            onChange={type => {
              setDiscountType(type)
              setDiscountValue(0)
            }}
            options={[
              { value: 'percent', label: t('common.percent') },
              { value: 'amount', label: t('common.amount') },
            ]}
            ariaLabel={t('itemDialog.discountTypeAria')}
          />
          <div className="mt-2">
            {discountType === 'percent' ? (
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={discountValue}
                onChange={event =>
                  setDiscountValue(Number(event.target.value) || 0)
                }
                aria-label={t('itemDialog.percentAria')}
              />
            ) : (
              <MoneyInput
                value={discountValue}
                onChange={setDiscountValue}
                ariaLabel={t('itemDialog.amountAria')}
              />
            )}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-label-sm text-text-sub-600">
              {t('itemDialog.participants')}
            </span>
            {claimedCount > 0 && (
              <span className="text-[11px] text-text-soft-400">
                {t('common.personCount', { count: claimedCount })}
              </span>
            )}
          </div>

          <ul className="divide-y divide-stroke-soft-200 overflow-hidden rounded-10 border border-stroke-soft-200">
            {participants.map(participant => {
              const weight = claims[participant.id]
              return (
                <li
                  key={participant.id}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="size-4 shrink-0 accent-primary-text"
                      checked={weight !== undefined}
                      onChange={event =>
                        toggleClaim(participant.id, event.target.checked)
                      }
                    />
                    <Avatar name={participant.name} size="sm" />
                    <span className="min-w-0 truncate text-label-md text-text-strong-950">
                      {participant.name}
                    </span>
                    {participant.id === me && (
                      <Badge tone="primary">{t('common.you')}</Badge>
                    )}
                  </label>

                  {weight !== undefined && (
                    <Stepper
                      value={weight}
                      onChange={value => setClaimWeight(participant.id, value)}
                      label={t('common.weight')}
                    />
                  )}
                </li>
              )
            })}

            {newNames.map(value => (
              <li key={value} className="flex items-center gap-2 px-3 py-2">
                <span className="flex min-w-0 flex-1 items-center gap-2.5 pl-6">
                  <Avatar name={value} size="sm" />
                  <span className="min-w-0 truncate text-label-md text-text-strong-950">
                    {value}
                  </span>
                  <Badge tone="primary">{t('itemDialog.newBadge')}</Badge>
                </span>
                <Button
                  variant="neutral"
                  mode="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t('itemDialog.removeNewAria', { name: value })}
                  onClick={() => removeNewName(value)}
                >
                  <RiCloseLine className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex gap-2">
            <Input
              value={newName}
              onChange={event => setNewName(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addNewName()
                }
              }}
              placeholder={t('itemDialog.newParticipantPlaceholder')}
              aria-label={t('itemDialog.newParticipantAria')}
              maxLength={40}
            />
            <Button
              variant="neutral"
              mode="stroke"
              onClick={addNewName}
              disabled={!newName.trim()}
            >
              <RiAddLine className="size-4" />
              {t('common.add')}
            </Button>
          </div>
        </div>

        <div className="rounded-10 border border-stroke-soft-200 bg-bg-weak-25 px-3.5 py-3 text-paragraph-sm">
          <div className="flex justify-between gap-3">
            <span className="text-text-sub-600">
              {t('itemDialog.gross')}
            </span>
            <span className="money text-text-strong-950">
              {formatRupiah(pricing.gross)}
            </span>
          </div>
          {pricing.discount > 0 && (
            <div className="mt-1 flex justify-between gap-3 text-success-base">
              <span>{t('itemDialog.discountLine')}</span>
              <span className="money">−{formatRupiah(pricing.discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-3 border-t border-stroke-soft-200 pt-2 font-semibold">
            <span className="text-text-strong-950">
              {t('itemDialog.net')}
            </span>
            <span className="money text-text-strong-950">
              {formatRupiah(pricing.net)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-label-sm text-error-base" role="alert">
            {t(
              error === 'name'
                ? 'itemDialog.nameRequired'
                : 'itemDialog.percentMax',
            )}
          </p>
        )}
      </form>
    </Modal>
  )
}
