<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'
import MoneyInput from './MoneyInput.vue'

const props = defineProps<{
  open: boolean
  session: Session | null
  claimedNet: number
  pending?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [patch: SessionSettingsPatch]
}>()

const form = reactive({
  title: '',
  discountType: 'percent' as DiscountType,
  discountValue: 0,
  discountAllocation: 'proportional' as DiscountAllocation,
  discountScope: 'items' as DiscountScope,
  shippingAmount: 0,
  servicePercent: 0,
  taxPercent: 0,
  taxBase: 'after_discount' as TaxBase,
  tipAmount: 0,
  rounding: 0 as RoundingStep,
  receiptTotal: 0,
})

const error = ref('')

const hasItems = computed(() => props.claimedNet > 0)

const previewShipping = computed(() => {
  if (!hasItems.value) return 0
  return Math.max(0, Math.round(Number(form.shippingAmount) || 0))
})

const previewDiscountBase = computed(() =>
  form.discountScope === 'final'
    ? props.claimedNet + previewShipping.value
    : props.claimedNet,
)

const previewDiscount = computed(() => {
  if (!hasItems.value) return 0
  const base = Math.max(0, previewDiscountBase.value)
  const value = Math.max(0, Number(form.discountValue) || 0)
  const raw =
    form.discountType === 'percent'
      ? Math.round((base * value) / 100)
      : Math.round(value)
  return Math.min(base, raw)
})

const previewAfterDiscount = computed(() =>
  Math.max(
    0,
    props.claimedNet + previewShipping.value - previewDiscount.value,
  ),
)

function safePercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

const previewService = computed(() => {
  if (!hasItems.value) return 0
  return Math.max(
    0,
    Math.round(
      (previewAfterDiscount.value * safePercent(Number(form.servicePercent))) /
        100,
    ),
  )
})

const previewTaxBase = computed(
  () =>
    (form.taxBase === 'before_discount'
      ? props.claimedNet + previewShipping.value
      : previewAfterDiscount.value) + previewService.value,
)

const previewTax = computed(() => {
  if (!hasItems.value) return 0
  return Math.max(
    0,
    Math.round(
      (previewTaxBase.value * safePercent(Number(form.taxPercent))) / 100,
    ),
  )
})

const previewTip = computed(() => {
  if (!hasItems.value) return 0
  return Math.max(0, Math.round(Number(form.tipAmount) || 0))
})

const previewTotal = computed(() => {
  if (!hasItems.value) return 0
  return (
    props.claimedNet +
    previewShipping.value -
    previewDiscount.value +
    previewService.value +
    previewTax.value +
    previewTip.value
  )
})

watch(
  () => props.open,
  open => {
    if (!open || !props.session) return
    form.title = props.session.title
    form.discountType = props.session.bill_discount_type
    form.discountValue = props.session.bill_discount_value
    form.discountAllocation = props.session.discount_allocation
    form.discountScope = props.session.discount_scope
    form.shippingAmount = props.session.shipping_amount
    form.servicePercent = props.session.service_percent
    form.taxPercent = props.session.tax_percent
    form.taxBase = props.session.tax_base
    form.tipAmount = props.session.tip_amount
    form.rounding = props.session.rounding
    form.receiptTotal = props.session.receipt_total
    error.value = ''
  },
)

function setDiscountType(type: DiscountType) {
  if (form.discountType === type) return
  form.discountType = type
  form.discountValue = 0
}

function setDiscountAllocation(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  form.discountAllocation = value === 'equal' ? 'equal' : 'proportional'
}

function setDiscountScope(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  form.discountScope = value === 'final' ? 'final' : 'items'
}

function setTaxBase(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  form.taxBase = value === 'before_discount' ? 'before_discount' : 'after_discount'
}

function setRounding(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  form.rounding = value === 500 ? 500 : value === 1000 ? 1000 : 0
}

function setNumberValue(
  field: 'discountValue' | 'servicePercent' | 'taxPercent',
  event: Event,
) {
  const value = Number((event.target as HTMLInputElement).value)
  form[field] = Number.isFinite(value) ? Math.max(0, value) : 0
}

function submit() {
  const title = form.title.trim()
  if (!title) {
    error.value = 'Nama sesi wajib diisi.'
    return
  }
  if (form.discountType === 'percent' && form.discountValue > 100) {
    error.value = 'Diskon bill maksimal 100%.'
    return
  }
  if (form.servicePercent > 100) {
    error.value = 'Service charge maksimal 100%.'
    return
  }
  if (form.taxPercent > 100) {
    error.value = 'Pajak maksimal 100%.'
    return
  }
  error.value = ''

  emit('save', {
    title,
    billDiscountType: form.discountType,
    billDiscountValue: Math.max(0, Number(form.discountValue) || 0),
    discountAllocation: form.discountAllocation,
    discountScope: form.discountScope,
    shippingAmount: Math.max(0, Number(form.shippingAmount) || 0),
    servicePercent: Math.max(0, Number(form.servicePercent) || 0),
    taxPercent: Math.max(0, Number(form.taxPercent) || 0),
    taxBase: form.taxBase,
    tipAmount: Math.max(0, Number(form.tipAmount) || 0),
    rounding: form.rounding,
    receiptTotal: Math.max(0, Number(form.receiptTotal) || 0),
  })
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Pengaturan sesi"
    description="Atur diskon, biaya tambahan, pembulatan, dan nama sesi."
    @update:model-value="emit('update:open', $event)"
  >
    <form id="bill-settings-form" class="space-y-6" @submit.prevent="submit">
      <section class="space-y-2">
        <h3 class="text-sm font-semibold">Diskon bill</h3>

        <div class="flex gap-2">
          <button
            type="button"
            class="chip"
            :class="
              form.discountType === 'percent'
                ? 'border-brand bg-brand-soft text-brand-strong'
                : ''
            "
            :aria-pressed="form.discountType === 'percent'"
            @click="setDiscountType('percent')"
          >
            Persen
          </button>
          <button
            type="button"
            class="chip"
            :class="
              form.discountType === 'amount'
                ? 'border-brand bg-brand-soft text-brand-strong'
                : ''
            "
            :aria-pressed="form.discountType === 'amount'"
            @click="setDiscountType('amount')"
          >
            Nominal
          </button>
        </div>

        <div>
          <div v-if="form.discountType === 'percent'" class="relative">
            <input
              :value="form.discountValue"
              type="number"
              inputmode="decimal"
              min="0"
              max="100"
              step="0.1"
              class="field pr-10"
              aria-label="Diskon bill persen"
              @input="setNumberValue('discountValue', $event)"
            />
            <span
              class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted"
            >
              %
            </span>
          </div>
          <MoneyInput
            v-else
            v-model="form.discountValue"
            aria-label="Diskon bill nominal"
          />
        </div>

        <div>
          <label for="discount-scope" class="label">Dasar diskon</label>
          <select
            id="discount-scope"
            class="field"
            :value="form.discountScope"
            @change="setDiscountScope"
          >
            <option value="items">Per item (ongkir tidak ikut diskon)</option>
            <option value="final">Total akhir (ongkir ikut diskon)</option>
          </select>
          <p class="mt-1 text-xs text-muted">
            Total akhir = subtotal item + ongkir. Service dan pajak dihitung
            setelah diskon, termasuk ongkir. Diskon per item tetap diatur di
            masing-masing item.
          </p>
        </div>

        <div>
          <label for="discount-allocation" class="label">Cara bagi diskon</label>
          <select
            id="discount-allocation"
            class="field"
            :value="form.discountAllocation"
            @change="setDiscountAllocation"
          >
            <option value="proportional">Proporsional sesuai subtotal</option>
            <option value="equal">Dibagi rata</option>
          </select>
        </div>

        <p class="text-xs text-muted">
          Diskon saat ini:
          <span class="money font-medium text-ink-soft">
            −{{ formatRupiah(previewDiscount) }}
          </span>
          dari {{ form.discountScope === 'final' ? 'total item + ongkir' : 'subtotal item' }}
          {{ formatRupiah(previewDiscountBase) }}.
        </p>
      </section>

      <section class="space-y-3 border-t border-line pt-5">
        <h3 class="text-sm font-semibold">Biaya tambahan</h3>

        <div>
          <label for="shipping-amount" class="label">Ongkir (opsional)</label>
          <MoneyInput
            id="shipping-amount"
            v-model="form.shippingAmount"
            aria-label="Ongkir"
          />
          <p class="mt-1 text-xs text-muted">
            Dibagi rata ke peserta yang punya item.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="service-percent" class="label">Service charge</label>
            <div class="relative">
              <input
                id="service-percent"
                :value="form.servicePercent"
                type="number"
                inputmode="decimal"
                min="0"
                max="100"
                step="0.1"
                class="field pr-10"
                @input="setNumberValue('servicePercent', $event)"
              />
              <span
                class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted"
              >
                %
              </span>
            </div>
          </div>

          <div>
            <label for="tax-percent" class="label">Pajak / PB1</label>
            <div class="relative">
              <input
                id="tax-percent"
                :value="form.taxPercent"
                type="number"
                inputmode="decimal"
                min="0"
                max="100"
                step="0.1"
                class="field pr-10"
                @input="setNumberValue('taxPercent', $event)"
              />
              <span
                class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted"
              >
                %
              </span>
            </div>
          </div>
        </div>

        <div>
          <label for="tax-base" class="label">Dasar pajak</label>
          <select
            id="tax-base"
            class="field"
            :value="form.taxBase"
            @change="setTaxBase"
          >
            <option value="after_discount">Setelah diskon (umum)</option>
            <option value="before_discount">Sebelum diskon</option>
          </select>
        </div>

        <div>
          <label for="tip-amount" class="label">Tip (opsional)</label>
          <MoneyInput id="tip-amount" v-model="form.tipAmount" aria-label="Tip" />
          <p class="mt-1 text-xs text-muted">
            Tip dibagi proporsional sesuai subtotal item.
          </p>
        </div>
      </section>

      <section class="space-y-3 border-t border-line pt-5">
        <h3 class="text-sm font-semibold">Pembayaran</h3>

        <div>
          <label for="rounding" class="label">Pembulatan transfer</label>
          <select
            id="rounding"
            class="field"
            :value="form.rounding"
            @change="setRounding"
          >
            <option :value="0">Tanpa pembulatan</option>
            <option :value="500">Bulatkan ke Rp500</option>
            <option :value="1000">Bulatkan ke Rp1.000</option>
          </select>
          <p class="mt-1 text-xs text-muted">
            Pembulatan hanya berlaku untuk transfer ke penerima, bukan total
            bill.
          </p>
        </div>

        <div>
          <label for="receipt-total" class="label">Total struk (opsional)</label>
          <MoneyInput
            id="receipt-total"
            v-model="form.receiptTotal"
            aria-label="Total struk"
          />
          <p class="mt-1 text-xs text-muted">
            Dipakai untuk mengecek selisih dengan total aplikasi.
          </p>
        </div>
      </section>

      <section class="space-y-2 border-t border-line pt-5">
        <h3 class="text-sm font-semibold">Nama sesi</h3>
        <label for="session-title" class="sr-only">Nama sesi</label>
        <input
          id="session-title"
          v-model="form.title"
          class="field"
          maxlength="80"
        />
      </section>

      <div
        v-if="hasItems"
        class="space-y-1.5 rounded-xl border border-line bg-paper px-3.5 py-3 text-sm"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-muted">Subtotal</span>
          <span class="money">{{ formatRupiah(claimedNet) }}</span>
        </div>
        <div
          v-if="previewShipping > 0"
          class="flex items-center justify-between gap-3"
        >
          <span class="text-muted">Ongkir</span>
          <span class="money">+{{ formatRupiah(previewShipping) }}</span>
        </div>
        <div
          v-if="previewDiscount > 0"
          class="flex items-center justify-between gap-3 text-positive"
        >
          <span>Diskon bill</span>
          <span class="money">−{{ formatRupiah(previewDiscount) }}</span>
        </div>
        <div v-if="previewService > 0" class="flex items-center justify-between gap-3">
          <span class="text-muted">Service</span>
          <span class="money">+{{ formatRupiah(previewService) }}</span>
        </div>
        <div v-if="previewTax > 0" class="flex items-center justify-between gap-3">
          <span class="text-muted">Pajak / PB1</span>
          <span class="money">+{{ formatRupiah(previewTax) }}</span>
        </div>
        <div v-if="previewTip > 0" class="flex items-center justify-between gap-3">
          <span class="text-muted">Tip</span>
          <span class="money">+{{ formatRupiah(previewTip) }}</span>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-t border-line pt-2 font-semibold"
        >
          <span>Total setelah biaya</span>
          <span class="money text-base">{{ formatRupiah(previewTotal) }}</span>
        </div>
      </div>

      <p v-else class="text-xs text-muted">
        Tambahkan dan klaim item dulu untuk melihat preview perhitungan.
      </p>

      <p v-if="error" class="text-xs font-medium text-danger">{{ error }}</p>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="pending"
          @click="emit('update:open', false)"
        >
          Batal
        </button>
        <button
          type="submit"
          form="bill-settings-form"
          class="btn btn-primary"
          :disabled="pending"
        >
          <AppIcon v-if="!pending" name="check" :size="17" />
          {{ pending ? 'Menyimpan...' : 'Simpan pengaturan' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
