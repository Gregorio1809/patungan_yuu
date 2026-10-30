<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { DiscountType, Session, SessionSettingsPatch } from '../types/database'
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
  taxPercent: 0,
})

const error = ref('')

const previewDiscount = computed(() => {
  const base = Math.max(0, props.claimedNet)
  const value = Math.max(0, Number(form.discountValue) || 0)
  const raw =
    form.discountType === 'percent'
      ? Math.round((base * value) / 100)
      : Math.round(value)
  return Math.min(base, raw)
})

const previewTax = computed(() => {
  const base = Math.max(0, props.claimedNet - previewDiscount.value)
  return Math.max(0, Math.round((base * (Number(form.taxPercent) || 0)) / 100))
})

watch(
  () => props.open,
  open => {
    if (!open || !props.session) return
    form.title = props.session.title
    form.discountType = props.session.bill_discount_type
    form.discountValue = props.session.bill_discount_value
    form.taxPercent = props.session.tax_percent
    error.value = ''
  },
)

function setDiscountType(type: DiscountType) {
  if (form.discountType === type) return
  form.discountType = type
  form.discountValue = 0
}

function setNumberValue(
  field: 'discountValue' | 'taxPercent',
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
  if (form.taxPercent > 100) {
    error.value = 'Pajak maksimal 100%.'
    return
  }
  error.value = ''

  emit('save', {
    title,
    billDiscountType: form.discountType,
    billDiscountValue: Math.max(0, Number(form.discountValue) || 0),
    taxPercent: Math.max(0, Number(form.taxPercent) || 0),
  })
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Pengaturan sesi"
    description="Perubahan berlaku untuk semua peserta."
    @update:model-value="emit('update:open', $event)"
  >
    <form id="bill-settings-form" class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="session-title" class="label">Nama sesi</label>
        <input
          id="session-title"
          v-model="form.title"
          class="field"
          maxlength="80"
          data-autofocus
        />
      </div>

      <div>
        <span class="label">Diskon total bill</span>
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

        <div class="mt-2">
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

        <p class="mt-1 text-xs text-muted">
          Diskon bill saat ini:
          <span class="money font-medium text-ink-soft">
            −{{ formatRupiah(previewDiscount) }}
          </span>
          dari subtotal {{ formatRupiah(claimedNet) }}.
        </p>
      </div>

      <div>
        <label for="tax-percent" class="label">Pajak / service</label>
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
        <p class="mt-1 text-xs text-muted">
          Pajak dihitung setelah diskon:
          <span class="money font-medium text-ink-soft">
            +{{ formatRupiah(previewTax) }}
          </span>
        </p>
      </div>

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
