<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatNumber, parseRupiah } from '../lib/money'

const props = defineProps<{
  modelValue: number
  id?: string
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const focused = ref(false)
const display = ref(formatNumber(props.modelValue))

watch(
  () => props.modelValue,
  value => {
    if (!focused.value) display.value = formatNumber(value)
  },
)

function onFocus() {
  focused.value = true
  display.value = props.modelValue > 0 ? String(Math.round(props.modelValue)) : ''
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  display.value = digits
  emit('update:modelValue', digits ? Number(digits) : 0)
}

function onBlur() {
  focused.value = false
  const parsed = parseRupiah(display.value)
  display.value = formatNumber(parsed)
  emit('update:modelValue', parsed)
}
</script>

<template>
  <div class="relative">
    <span
      class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-medium text-muted"
    >
      Rp
    </span>
    <input
      :id="id"
      :value="display"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      class="field money pl-10"
      :placeholder="placeholder ?? '0'"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @focus="onFocus"
      @input="onInput"
      @blur="onBlur"
    />
  </div>
</template>
