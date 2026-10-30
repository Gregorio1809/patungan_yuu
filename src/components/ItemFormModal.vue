<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { DiscountType, ItemWithAssignments, NewItemInput } from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import BaseModal from './BaseModal.vue'
import MoneyInput from './MoneyInput.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  open: boolean
  item: ItemWithAssignments | null
  pending?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [input: NewItemInput]
}>()

const form = reactive({
  name: '',
  price: 0,
  quantity: 1,
  discountType: 'percent' as DiscountType,
  discountValue: 0,
})

const error = ref('')

const preview = computed(() =>
  calculateItemPricing(
    form.price,
    form.quantity,
    form.discountType,
    Number(form.discountValue) || 0,
  ),
)

watch(
  () => [props.open, props.item] as const,
  () => {
    if (!props.open) return
    form.name = props.item?.name ?? ''
    form.price = props.item?.price ?? 0
    form.quantity = props.item?.quantity ?? 1
    form.discountType = props.item?.discount_type ?? 'percent'
    form.discountValue = props.item?.discount_value ?? 0
    error.value = ''
  },
)

function setDiscountType(type: DiscountType) {
  if (form.discountType === type) return
  form.discountType = type
  form.discountValue = 0
}

function setDiscountValue(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  form.discountValue = Number.isFinite(value) ? Math.max(0, value) : 0
}

function changeQuantity(delta: number) {
  form.quantity = Math.max(1, form.quantity + delta)
}

function submit() {
  const name = form.name.trim()
  if (!name) {
    error.value = 'Nama item wajib diisi.'
    return
  }
  if (form.discountType === 'percent' && form.discountValue > 100) {
    error.value = 'Diskon persen maksimal 100%.'
    return
  }
  error.value = ''

  emit('save', {
    name,
    price: Math.max(0, Math.round(form.price)),
    quantity: Math.max(1, Math.round(form.quantity)),
    discountType: form.discountType,
    discountValue: Math.max(0, Number(form.discountValue) || 0),
  })
}
</script>

<template>
  <BaseModal
    :model-value="open"
    :title="item ? 'Edit item' : 'Tambah item'"
    description="Diskon item diterapkan ke total baris ini."
    @update:model-value="emit('update:open', $event)"
  >
    <form id="item-form" class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="item-name" class="label">Nama item</label>
        <input
          id="item-name"
          v-model="form.name"
          class="field"
          maxlength="80"
          placeholder="Contoh: Nasi goreng seafood"
          data-autofocus
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="item-price" class="label">Harga satuan</label>
          <MoneyInput id="item-price" v-model="form.price" />
        </div>
        <div>
          <span class="label">Jumlah</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-secondary btn-icon"
              aria-label="Kurangi jumlah"
              :disabled="form.quantity <= 1"
              @click="changeQuantity(-1)"
            >
              <AppIcon name="minus" :size="17" />
            </button>
            <span class="money w-10 text-center text-base font-semibold">
              {{ form.quantity }}
            </span>
            <button
              type="button"
              class="btn btn-secondary btn-icon"
              aria-label="Tambah jumlah"
              @click="changeQuantity(1)"
            >
              <AppIcon name="plus" :size="17" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <span class="label">Diskon item</span>
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
              aria-label="Diskon persen"
              @input="setDiscountValue"
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
            placeholder="0"
          />
        </div>
      </div>

      <div class="rounded-xl border border-line bg-paper px-3.5 py-3 text-sm">
        <div class="flex items-center justify-between gap-3">
          <span class="text-muted">Harga sebelum diskon</span>
          <span class="money">{{ formatRupiah(preview.gross) }}</span>
        </div>
        <div
          v-if="preview.discount > 0"
          class="mt-1 flex items-center justify-between gap-3 text-positive"
        >
          <span>Diskon</span>
          <span class="money">−{{ formatRupiah(preview.discount) }}</span>
        </div>
        <div
          class="mt-2 flex items-center justify-between gap-3 border-t border-line pt-2 font-semibold"
        >
          <span>Harga bersih</span>
          <span class="money text-base">{{ formatRupiah(preview.net) }}</span>
        </div>
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
          form="item-form"
          class="btn btn-primary"
          :disabled="pending"
        >
          {{ pending ? 'Menyimpan...' : 'Simpan item' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
