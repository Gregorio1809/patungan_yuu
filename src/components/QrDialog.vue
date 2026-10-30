<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { copyText } from '../lib/share'
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
  open: boolean
  url: string
  localMode?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const dataUrl = ref('')
const error = ref('')
const loading = ref(false)
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => [props.open, props.url] as const,
  async () => {
    if (!props.open || !props.url) return

    loading.value = true
    error.value = ''
    copied.value = false

    try {
      const QRCode = (await import('qrcode')).default
      dataUrl.value = await QRCode.toDataURL(props.url, {
        width: 280,
        margin: 2,
        color: { dark: '#241b16', light: '#ffffff' },
      })
    } catch {
      error.value = 'Gagal membuat QR code. Kamu masih bisa menyalin link.'
      dataUrl.value = ''
    } finally {
      loading.value = false
    }
  },
)

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})

async function copyLink() {
  const ok = await copyText(props.url)
  copied.value = ok
  if (copyTimer) clearTimeout(copyTimer)
  if (ok) {
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Bagikan via QR"
    description="Minta peserta memindai kode ini dengan kamera HP."
    size="sm"
    @update:model-value="emit('update:open', $event)"
  >
    <div class="flex flex-col items-center">
      <div
        class="flex min-h-64 w-full max-w-xs items-center justify-center rounded-2xl border border-line bg-white p-4"
      >
        <div
          v-if="loading"
          class="size-56 animate-pulse rounded-xl bg-paper-deep"
        />
        <img
          v-else-if="dataUrl"
          :src="dataUrl"
          alt="QR code untuk link patungan"
          class="h-auto w-full max-w-64"
        />
        <p v-else class="px-2 text-center text-sm text-danger">{{ error }}</p>
      </div>

      <p class="mt-3 w-full break-all rounded-xl bg-paper px-3 py-2 text-center text-xs text-muted">
        {{ url }}
      </p>

      <button type="button" class="btn btn-secondary mt-3 w-full" @click="copyLink">
        <AppIcon :name="copied ? 'check' : 'copy'" :size="16" />
        {{ copied ? 'Link tersalin' : 'Salin link' }}
      </button>

      <p v-if="localMode" class="mt-3 text-center text-[11px] text-muted">
        Mode lokal: QR hanya bisa dibuka di browser ini.
      </p>
    </div>
  </BaseModal>
</template>
