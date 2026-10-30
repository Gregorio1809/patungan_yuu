<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Participant } from '../types/database'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
  open: boolean
  participants: Participant[]
  pending?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [name: string]
  viewOnly: []
}>()

const name = ref('')
const error = ref('')

const matched = computed(() => {
  const query = name.value.trim().toLowerCase()
  if (!query) return null
  return (
    props.participants.find(
      participant => participant.name.trim().toLowerCase() === query,
    ) ?? null
  )
})

watch(
  () => props.open,
  open => {
    if (open) {
      name.value = ''
      error.value = ''
    }
  },
)

function submit() {
  const value = name.value.trim()
  if (!value) {
    error.value = 'Nama wajib diisi.'
    return
  }
  error.value = ''
  emit('submit', value)
}

function closeAsViewer() {
  emit('update:open', false)
  emit('viewOnly')
}

function onUpdate(value: boolean) {
  if (value) {
    emit('update:open', true)
    return
  }
  closeAsViewer()
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Gabung ke patungan"
    description="Isi namamu supaya bisa klaim item dan lihat totalmu."
    size="sm"
    @update:model-value="onUpdate"
  >
    <form id="join-form" class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="join-name" class="label">Nama kamu</label>
        <input
          id="join-name"
          v-model="name"
          class="field"
          maxlength="40"
          autocomplete="name"
          placeholder="Contoh: Budi"
          data-autofocus
        />
        <p v-if="error" class="mt-1.5 text-xs font-medium text-danger">
          {{ error }}
        </p>
      </div>

      <div
        v-if="matched"
        class="rounded-xl border border-highlight bg-highlight-soft px-3 py-2.5 text-xs text-ink-soft"
      >
        Nama <span class="font-semibold">{{ matched.name }}</span> sudah terdaftar.
        Tombol gabung akan memakai nama itu, misalnya saat membuka link di
        perangkat kedua.
      </div>

      <p class="text-xs text-muted">
        Tanpa akun. Identitasmu disimpan di perangkat ini.
      </p>
    </form>

    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" class="btn btn-ghost" @click="closeAsViewer">
          Lihat dulu
        </button>
        <button
          type="submit"
          form="join-form"
          class="btn btn-primary"
          :disabled="pending"
        >
          {{
            pending
              ? 'Menggabungkan...'
              : matched
                ? `Gabung sebagai ${matched.name}`
                : 'Gabung'
          }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>
