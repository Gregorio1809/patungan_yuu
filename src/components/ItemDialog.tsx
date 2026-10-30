import { useEffect, useState } from 'react'
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

export function ItemDialog({
  open,
  onOpenChange,
  item,
  pending,
  onSave,
}: ItemDialogProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [discountType, setDiscountType] = useState<DiscountType>('percent')
  const [discountValue, setDiscountValue] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setPrice(item?.price ?? 0)
    setQuantity(item?.quantity ?? 1)
    setDiscountType(item?.discount_type ?? 'percent')
    setDiscountValue(item?.discount_value ?? 0)
    setError('')
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
      setError('Nama item wajib diisi.')
      return
    }
    if (discountType === 'percent' && discountValue > 100) {
      setError('Diskon persen maksimal 100%.')
      return
    }
    setError('')
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
      title={item ? 'Edit item' : 'Tambah item'}
      description="Harga, jumlah, dan diskon item."
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
          <Button type="submit" form="patungan-item-form" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan item'}
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
          <Label htmlFor="patungan-item-name">Nama item</Label>
          <Input
            id="patungan-item-name"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Contoh: Nasi goreng seafood"
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="patungan-item-price">Harga satuan</Label>
            <MoneyInput
              id="patungan-item-price"
              value={price}
              onChange={setPrice}
              ariaLabel="Harga satuan"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-label-sm text-text-sub-600">
              Jumlah
            </span>
            <div className="flex h-10 items-center">
              <Stepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                label="jumlah"
              />
            </div>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-label-sm text-text-sub-600">
            Diskon item
          </span>
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
            ariaLabel="Tipe diskon item"
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
                aria-label="Diskon persen"
              />
            ) : (
              <MoneyInput
                value={discountValue}
                onChange={setDiscountValue}
                ariaLabel="Diskon nominal"
              />
            )}
          </div>
        </div>

        <div className="rounded-10 border border-stroke-soft-200 bg-bg-weak-25 px-3.5 py-3 text-paragraph-sm">
          <div className="flex justify-between gap-3">
            <span className="text-text-sub-600">Harga sebelum diskon</span>
            <span className="money text-text-strong-950">
              {formatRupiah(pricing.gross)}
            </span>
          </div>
          {pricing.discount > 0 && (
            <div className="mt-1 flex justify-between gap-3 text-success-base">
              <span>Diskon</span>
              <span className="money">−{formatRupiah(pricing.discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between gap-3 border-t border-stroke-soft-200 pt-2 font-semibold">
            <span className="text-text-strong-950">Harga bersih</span>
            <span className="money text-text-strong-950">
              {formatRupiah(pricing.net)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-label-sm text-error-base" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
