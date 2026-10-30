<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Participant } from '../types/database'
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
  open: boolean
  participant: Participant | null
  pending?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [name: string]
  remove: []
}>()

const name = ref('')
const error = ref('')

watch(
  () => [props.open, props.participant] as const,
  () => {
    if (!props.open || !props.participant) return
    name.value = props.participant.name
    error.value = ''
  },
)

function submit() {
  const value = name.value.trim()
  if (!value) {
    error.value = 'Nama peserta wajib diisi.'
    return
  }
  error.value = ''
  emit('save', value)
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Edit peserta"
    description="Ganti nama tanpa menghilangkan klaim item."
    size="sm"
    @update:model-value="emit('update:open', $event)"
  >
    <form id="participant-form" class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="participant-name" class="label">Nama peserta</label>
        <input
          id="participant-name"
          v-model="name"
          class="field"
          maxlength="40"
          data-autofocus
        />
        <p v-if="error" class="mt-1.5 text-xs font-medium text-danger">
          {{ error }}
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          class="btn btn-ghost text-danger hover:bg-danger-soft"
          :disabled="pending"
          @click="emit('remove')"
        >
          <AppIcon name="trash" :size="16" />
          Hapus peserta
        </button>

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
            form="participant-form"
            class="btn btn-primary"
            :disabled="pending"
          >
            {{ pending ? 'Menyimpan...' : 'Simpan nama' }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
