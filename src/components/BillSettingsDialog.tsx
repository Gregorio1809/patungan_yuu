import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import type {
  DiscountAllocation,
  DiscountScope,
  DiscountType,
  RoundingStep,
  Session,
  SessionSettingsPatch,
  TaxBase,
} from '../types/database'
import { formatRupiah } from '../lib/money'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Modal } from '../ui/Modal'
import { MoneyInput } from '../ui/MoneyInput'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Select } from '../ui/Select'

interface BillSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: Session
  claimedNet: number
  pending?: boolean
  onSave: (patch: SessionSettingsPatch) => void
}

type BillError =
  | 'bill.errorName'
  | 'bill.errorDiscountMax'
  | 'bill.errorPercentMax'
  | null

function safePercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function BillSettingsDialog({
  open,
  onOpenChange,
  session,
  claimedNet,
  pending,
  onSave,
}: BillSettingsDialogProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(session.title)
  const [discountType, setDiscountType] = useState<DiscountType>(
    session.bill_discount_type,
  )
  const [discountValue, setDiscountValue] = useState(
    session.bill_discount_value,
  )
  const [discountAllocation, setDiscountAllocation] =
    useState<DiscountAllocation>(session.discount_allocation)
  const [discountScope, setDiscountScope] = useState<DiscountScope>(
    session.discount_scope,
  )
  const [shippingAmount, setShippingAmount] = useState(
    session.shipping_amount,
  )
  const [servicePercent, setServicePercent] = useState(
    session.service_percent,
  )
  const [taxPercent, setTaxPercent] = useState(session.tax_percent)
  const [taxBase, setTaxBase] = useState<TaxBase>(session.tax_base)
  const [tipAmount, setTipAmount] = useState(session.tip_amount)
  const [rounding, setRounding] = useState<RoundingStep>(session.rounding)
  const [receiptTotal, setReceiptTotal] = useState(session.receipt_total)
  const [error, setError] = useState<BillError>(null)

  useEffect(() => {
    if (!open) return
    setTitle(session.title)
    setDiscountType(session.bill_discount_type)
    setDiscountValue(session.bill_discount_value)
    setDiscountAllocation(session.discount_allocation)
    setDiscountScope(session.discount_scope)
    setShippingAmount(session.shipping_amount)
    setServicePercent(session.service_percent)
    setTaxPercent(session.tax_percent)
    setTaxBase(session.tax_base)
    setTipAmount(session.tip_amount)
    setRounding(session.rounding)
    setReceiptTotal(session.receipt_total)
    setError(null)
  }, [open, session])

  const preview = useMemo(() => {
    const hasItems = claimedNet > 0
    const shipping = hasItems ? Math.max(0, Math.round(shippingAmount)) : 0
    const discountBase =
      discountScope === 'final' ? claimedNet + shipping : claimedNet
    const discountRaw =
      discountType === 'percent'
        ? Math.round((discountBase * Math.max(0, discountValue)) / 100)
        : Math.round(Math.max(0, discountValue))
    const discount = hasItems
      ? Math.min(Math.max(0, discountBase), Math.max(0, discountRaw))
      : 0
    const afterDiscount = Math.max(0, claimedNet + shipping - discount)
    const service = hasItems
      ? Math.max(
          0,
          Math.round((afterDiscount * safePercent(servicePercent)) / 100),
        )
      : 0
    const taxBaseAmount =
      (taxBase === 'before_discount'
        ? claimedNet + shipping
        : afterDiscount) + service
    const tax = hasItems
      ? Math.max(0, Math.round((taxBaseAmount * safePercent(taxPercent)) / 100))
      : 0
    const tip = hasItems ? Math.max(0, Math.round(tipAmount)) : 0
    const total = hasItems ? afterDiscount + service + tax + tip : 0

    return { shipping, discount, afterDiscount, service, tax, tip, total }
  }, [
    claimedNet,
    discountScope,
    discountType,
    discountValue,
    shippingAmount,
    servicePercent,
    taxBase,
    taxPercent,
    tipAmount,
  ])

  function submit() {
    const value = title.trim()
    if (!value) {
      setError('bill.errorName')
      return
    }
    if (discountType === 'percent' && discountValue > 100) {
      setError('bill.errorDiscountMax')
      return
    }
    if (servicePercent > 100 || taxPercent > 100) {
      setError('bill.errorPercentMax')
      return
    }
    setError(null)

    onSave({
      title: value,
      billDiscountType: discountType,
      billDiscountValue: Math.max(0, discountValue),
      discountAllocation,
      discountScope,
      shippingAmount: Math.max(0, shippingAmount),
      servicePercent: Math.max(0, servicePercent),
      taxPercent: Math.max(0, taxPercent),
      taxBase,
      tipAmount: Math.max(0, tipAmount),
      rounding,
      receiptTotal: Math.max(0, receiptTotal),
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('bill.title')}
      description={t('bill.description')}
      size="lg"
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
          <Button type="submit" form="patungan-bill-form" disabled={pending}>
            {pending ? t('bill.saving') : t('bill.save')}
          </Button>
        </>
      }
    >
      <form
        id="patungan-bill-form"
        className="space-y-6"
        onSubmit={event => {
          event.preventDefault()
          submit()
        }}
      >
        <section className="space-y-3">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            {t('bill.discountSection')}
          </h3>

          <SegmentedControl
            value={discountType}
            onChange={type => {
              setDiscountType(type)
              setDiscountValue(0)
            }}
            options={[
              { value: 'percent', label: t('bill.percent') },
              { value: 'amount', label: t('bill.amount') },
            ]}
            ariaLabel={t('bill.discountTypeAria')}
          />

          <div>
            <Label htmlFor="patungan-discount-value">
              {t('bill.discountValue')}
            </Label>
            {discountType === 'percent' ? (
              <Input
                id="patungan-discount-value"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={discountValue}
                onChange={event =>
                  setDiscountValue(Number(event.target.value) || 0)
                }
              />
            ) : (
              <MoneyInput
                value={discountValue}
                onChange={setDiscountValue}
                ariaLabel={t('bill.discountValueAria')}
              />
            )}
          </div>

          <div>
            <Label htmlFor="patungan-discount-scope">
              {t('bill.discountScope')}
            </Label>
            <Select
              id="patungan-discount-scope"
              value={discountScope}
              onChange={event =>
                setDiscountScope(event.target.value as DiscountScope)
              }
            >
              <option value="items">{t('bill.scopeItems')}</option>
              <option value="final">{t('bill.scopeFinal')}</option>
            </Select>
            <p className="mt-1 text-[11px] text-text-soft-400">
              {t('bill.scopeHelp')}
            </p>
          </div>

          <div>
            <Label htmlFor="patungan-discount-allocation">
              {t('bill.allocation')}
            </Label>
            <Select
              id="patungan-discount-allocation"
              value={discountAllocation}
              onChange={event =>
                setDiscountAllocation(
                  event.target.value as DiscountAllocation,
                )
              }
            >
              <option value="proportional">
                {t('bill.allocationProportional')}
              </option>
              <option value="equal">{t('bill.allocationEqual')}</option>
            </Select>
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            {t('bill.extraSection')}
          </h3>

          <div>
            <Label htmlFor="patungan-shipping">
              {t('bill.shipping')}
            </Label>
            <MoneyInput
              id="patungan-shipping"
              value={shippingAmount}
              onChange={setShippingAmount}
              ariaLabel={t('bill.shippingAria')}
            />
            <p className="mt-1 text-[11px] text-text-soft-400">
              {t('bill.shippingHelp')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="patungan-service">
                {t('bill.service')}
              </Label>
              <Input
                id="patungan-service"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={servicePercent}
                onChange={event =>
                  setServicePercent(Number(event.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label htmlFor="patungan-tax">{t('bill.tax')}</Label>
              <Input
                id="patungan-tax"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={taxPercent}
                onChange={event =>
                  setTaxPercent(Number(event.target.value) || 0)
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="patungan-tax-base">
              {t('bill.taxBase')}
            </Label>
            <Select
              id="patungan-tax-base"
              value={taxBase}
              onChange={event => setTaxBase(event.target.value as TaxBase)}
            >
              <option value="after_discount">{t('bill.taxAfter')}</option>
              <option value="before_discount">{t('bill.taxBefore')}</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="patungan-tip">{t('bill.tip')}</Label>
            <MoneyInput
              id="patungan-tip"
              value={tipAmount}
              onChange={setTipAmount}
              ariaLabel={t('bill.tip')}
            />
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            {t('bill.paymentSection')}
          </h3>

          <div>
            <Label htmlFor="patungan-rounding">
              {t('bill.rounding')}
            </Label>
            <Select
              id="patungan-rounding"
              value={String(rounding)}
              onChange={event =>
                setRounding(Number(event.target.value) as RoundingStep)
              }
            >
              <option value="0">{t('bill.roundingNone')}</option>
              <option value="500">{t('bill.rounding500')}</option>
              <option value="1000">{t('bill.rounding1000')}</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="patungan-receipt">
              {t('bill.receipt')}
            </Label>
            <MoneyInput
              id="patungan-receipt"
              value={receiptTotal}
              onChange={setReceiptTotal}
              ariaLabel={t('bill.receiptAria')}
            />
            <p className="mt-1 text-[11px] text-text-soft-400">
              {t('bill.receiptHelp')}
            </p>
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            {t('bill.sessionName')}
          </h3>
          <div>
            <Label htmlFor="patungan-session-title" className="sr-only">
              {t('bill.sessionName')}
            </Label>
            <Input
              id="patungan-session-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              maxLength={80}
            />
          </div>
        </section>

        {claimedNet > 0 ? (
          <div className="space-y-1.5 rounded-10 border border-stroke-soft-200 bg-bg-weak-25 px-3.5 py-3 text-paragraph-sm">
            <div className="flex justify-between gap-3">
              <span className="text-text-sub-600">{t('bill.subtotal')}</span>
              <span className="money text-text-strong-950">
                {formatRupiah(claimedNet)}
              </span>
            </div>
            {preview.shipping > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">
                  {t('bill.shipping')}
                </span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.shipping)}
                </span>
              </div>
            )}
            {preview.discount > 0 && (
              <div className="flex justify-between gap-3 text-success-base">
                <span>{t('bill.discountLine')}</span>
                <span className="money">
                  −{formatRupiah(preview.discount)}
                </span>
              </div>
            )}
            {preview.service > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">
                  {t('bill.serviceLine')}
                </span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.service)}
                </span>
              </div>
            )}
            {preview.tax > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">
                  {t('bill.taxLine')}
                </span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.tax)}
                </span>
              </div>
            )}
            {preview.tip > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">
                  {t('bill.tipLine')}
                </span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.tip)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-stroke-soft-200 pt-2 font-semibold">
              <span className="text-text-strong-950">
                {t('bill.totalAfter')}
              </span>
              <span className="money text-text-strong-950">
                {formatRupiah(preview.total)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-paragraph-sm text-text-soft-400">
            {t('bill.previewEmpty')}
          </p>
        )}

        {error && (
          <p className="text-label-sm text-error-base" role="alert">
            {t(error)}
          </p>
        )}
      </form>
    </Modal>
  )
}
