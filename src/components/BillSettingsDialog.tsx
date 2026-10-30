import { useEffect, useMemo, useState } from 'react'
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
  const [error, setError] = useState('')

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
    setError('')
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
      setError('Nama sesi wajib diisi.')
      return
    }
    if (discountType === 'percent' && discountValue > 100) {
      setError('Diskon bill maksimal 100%.')
      return
    }
    if (servicePercent > 100 || taxPercent > 100) {
      setError('Service dan pajak maksimal 100%.')
      return
    }
    setError('')

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
      title="Pengaturan bill"
      description="Diskon, ongkir, service, pajak, tip, dan pembulatan."
      size="lg"
      footer={
        <>
          <Button
            variant="neutral"
            mode="stroke"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="submit" form="patungan-bill-form" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan pengaturan'}
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
            Diskon bill
          </h3>

          <SegmentedControl
            value={discountType}
            onChange={type => {
              setDiscountType(type)
              setDiscountValue(0)
            }}
            options={[
              { value: 'percent', label: 'Persen' },
              { value: 'amount', label: 'Nominal' },
            ]}
            ariaLabel="Tipe diskon bill"
          />

          <div>
            <Label htmlFor="patungan-discount-value">Nilai diskon</Label>
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
                ariaLabel="Diskon bill nominal"
              />
            )}
          </div>

          <div>
            <Label htmlFor="patungan-discount-scope">Dasar diskon</Label>
            <Select
              id="patungan-discount-scope"
              value={discountScope}
              onChange={event =>
                setDiscountScope(event.target.value as DiscountScope)
              }
            >
              <option value="items">Per item (ongkir tidak ikut diskon)</option>
              <option value="final">Total akhir (ongkir ikut diskon)</option>
            </Select>
            <p className="mt-1 text-[11px] text-text-soft-400">
              Total akhir = subtotal item + ongkir. Service dan pajak dihitung
              setelah diskon.
            </p>
          </div>

          <div>
            <Label htmlFor="patungan-discount-allocation">Cara bagi diskon</Label>
            <Select
              id="patungan-discount-allocation"
              value={discountAllocation}
              onChange={event =>
                setDiscountAllocation(
                  event.target.value as DiscountAllocation,
                )
              }
            >
              <option value="proportional">Proporsional sesuai subtotal</option>
              <option value="equal">Dibagi rata</option>
            </Select>
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            Biaya tambahan
          </h3>

          <div>
            <Label htmlFor="patungan-shipping">Ongkir</Label>
            <MoneyInput
              id="patungan-shipping"
              value={shippingAmount}
              onChange={setShippingAmount}
              ariaLabel="Ongkir"
            />
            <p className="mt-1 text-[11px] text-text-soft-400">
              Dibagi rata ke peserta yang punya item.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="patungan-service">Service charge</Label>
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
              <Label htmlFor="patungan-tax">Pajak / PB1</Label>
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
            <Label htmlFor="patungan-tax-base">Dasar pajak</Label>
            <Select
              id="patungan-tax-base"
              value={taxBase}
              onChange={event => setTaxBase(event.target.value as TaxBase)}
            >
              <option value="after_discount">Setelah diskon (umum)</option>
              <option value="before_discount">Sebelum diskon</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="patungan-tip">Tip</Label>
            <MoneyInput
              id="patungan-tip"
              value={tipAmount}
              onChange={setTipAmount}
              ariaLabel="Tip"
            />
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            Pembayaran
          </h3>

          <div>
            <Label htmlFor="patungan-rounding">Pembulatan transfer</Label>
            <Select
              id="patungan-rounding"
              value={String(rounding)}
              onChange={event =>
                setRounding(Number(event.target.value) as RoundingStep)
              }
            >
              <option value="0">Tanpa pembulatan</option>
              <option value="500">Bulatkan ke Rp500</option>
              <option value="1000">Bulatkan ke Rp1.000</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="patungan-receipt">Total struk</Label>
            <MoneyInput
              id="patungan-receipt"
              value={receiptTotal}
              onChange={setReceiptTotal}
              ariaLabel="Total struk"
            />
            <p className="mt-1 text-[11px] text-text-soft-400">
              Dipakai untuk mengecek selisih di ringkasan.
            </p>
          </div>
        </section>

        <section className="space-y-3 border-t border-stroke-soft-200 pt-5">
          <h3 className="text-label-md font-semibold text-text-strong-950">
            Nama sesi
          </h3>
          <div>
            <Label htmlFor="patungan-session-title" className="sr-only">
              Nama sesi
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
              <span className="text-text-sub-600">Subtotal</span>
              <span className="money text-text-strong-950">
                {formatRupiah(claimedNet)}
              </span>
            </div>
            {preview.shipping > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">Ongkir</span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.shipping)}
                </span>
              </div>
            )}
            {preview.discount > 0 && (
              <div className="flex justify-between gap-3 text-success-base">
                <span>Diskon bill</span>
                <span className="money">
                  −{formatRupiah(preview.discount)}
                </span>
              </div>
            )}
            {preview.service > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">Service</span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.service)}
                </span>
              </div>
            )}
            {preview.tax > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">Pajak / PB1</span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.tax)}
                </span>
              </div>
            )}
            {preview.tip > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-text-sub-600">Tip</span>
                <span className="money text-text-strong-950">
                  +{formatRupiah(preview.tip)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-stroke-soft-200 pt-2 font-semibold">
              <span className="text-text-strong-950">Total setelah biaya</span>
              <span className="money text-text-strong-950">
                {formatRupiah(preview.total)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-paragraph-sm text-text-soft-400">
            Tambahkan dan klaim item dulu untuk melihat preview perhitungan.
          </p>
        )}

        {error && (
          <p className="text-label-sm text-error-base" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
