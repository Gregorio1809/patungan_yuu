<script setup lang="ts">
import BaseModal from './BaseModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    pending?: boolean
    tone?: 'danger' | 'primary'
  }>(),
  { confirmLabel: 'Hapus', pending: false, tone: 'danger' },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <BaseModal
    :model-value="open"
    :title="title"
    :description="description"
    size="sm"
    @update:model-value="emit('update:open', $event)"
  >
    <p class="text-sm text-muted">
      Tindakan ini langsung tersimpan untuk semua peserta dan tidak bisa dibatalkan.
    </p>

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
          type="button"
          class="btn"
          :class="tone === 'danger' ? 'btn-danger' : 'btn-primary'"
          :disabled="pending"
          @click="emit('confirm')"
        >
          {{ pending ? 'Memproses...' : confirmLabel }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
