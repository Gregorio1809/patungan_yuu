<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { DiscountType, NewSessionInput } from '../types/database'
import AppIcon from './AppIcon.vue'
import MoneyInput from './MoneyInput.vue'

defineProps<{
  pending?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  create: [input: NewSessionInput]
}>()

const form = reactive({
  title: '',
  discountType: 'percent' as DiscountType,
  discountValue: 0,
  taxPercent: 0,
})

const error = ref('')

function setDiscountType(type: DiscountType) {
  if (form.discountType === type) return
  form.discountType = type
  form.discountValue = 0
}

function setNumberValue(field: 'discountValue' | 'taxPercent', event: Event) {
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

  emit('create', {
    title,
    billDiscountType: form.discountType,
    billDiscountValue: Math.max(0, Number(form.discountValue) || 0),
    taxPercent: Math.max(0, Number(form.taxPercent) || 0),
  })
}
</script>

<template>
  <form class="card p-4 sm:p-5" @submit.prevent="submit">
    <div>
      <label for="new-session-title" class="label">Nama sesi</label>
      <input
        id="new-session-title"
        v-model="form.title"
        class="field"
        maxlength="80"
        placeholder="Contoh: Makan malam kantor"
        autocomplete="off"
      />
    </div>

    <div class="mt-4">
      <span class="label">Diskon total bill (opsional)</span>
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
    </div>

    <div class="mt-4">
      <label for="new-session-tax" class="label">Pajak / service (opsional)</label>
      <div class="relative">
        <input
          id="new-session-tax"
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

    <p v-if="error" class="mt-3 text-xs font-medium text-danger">{{ error }}</p>

    <button
      type="submit"
      class="btn btn-primary mt-5 w-full"
      :disabled="pending || disabled"
    >
      <AppIcon v-if="!pending && !disabled" name="plus" :size="17" />
      {{
        disabled
          ? 'Supabase belum tersambung'
          : pending
            ? 'Membuat sesi...'
            : 'Buat sesi patungan'
      }}
    </button>

    <p class="mt-3 text-center text-xs text-muted">
      Semua orang yang punya link bisa ikut mengisi.
    </p>
  </form>
</template>
