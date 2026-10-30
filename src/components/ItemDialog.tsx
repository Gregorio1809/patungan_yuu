import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import type {
  DiscountType,
  ItemWithAssignments,
  NewItemInput,
} from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
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
  pending?: boolean
  onSave: (input: NewItemInput) => void
}

type ItemError = 'name' | 'percent' | null

export function ItemDialog({
  open,
  onOpenChange,
  item,
  pending,
  onSave,
}: ItemDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [error, setError] = useState<ItemError>(null)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setPrice(item?.price ?? 0)
    setQuantity(item?.quantity ?? 1)
    setDiscountType(item?.discount_type ?? 'percent')
    setDiscountValue(item?.discount_value ?? 0)
    setError(null)
  }, [open, item])

  const pricing = calculateItemPricing(
    price,
    quantity,
    discountType,
    discountValue,
  )

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
    onSave({
      name: value,
      price: Math.max(0, Math.round(price)),
      quantity: Math.max(1, Math.round(quantity)),
      discountType,
      discountValue: Math.max(0, discountValue),
    })
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
