<script setup lang="ts">
import { ref } from 'vue'
import type { NewSessionInput } from '../types/database'
import AppIcon from './AppIcon.vue'

defineProps<{
  pending?: boolean
  disabled?: boolean
  localMode?: boolean
}>()

const emit = defineEmits<{
  create: [input: NewSessionInput]
}>()

const title = ref('')
const error = ref('')

function submit() {
  const value = title.value.trim()
  if (!value) {
    error.value = 'Nama sesi wajib diisi.'
    return
  }

  error.value = ''
  emit('create', { title: value })
}
</script>

<template>
  <form class="card p-4 sm:p-5" @submit.prevent="submit">
    <div>
      <label for="new-session-title" class="label">Nama sesi</label>
      <input
        id="new-session-title"
        v-model="title"
        class="field"
        maxlength="80"
        placeholder="Contoh: Makan malam kantor"
        autocomplete="off"
      />
      <p class="mt-2 text-xs text-muted">
        Diskon, service, pajak, dan tip bisa diatur setelah sesi dibuat.
      </p>
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
            : 'Buat sesi'
      }}
    </button>

    <p class="mt-3 text-center text-xs text-muted">
      {{
        localMode
          ? 'Mode lokal: link hanya bisa dibuka di browser ini.'
          : 'Semua orang yang punya link bisa ikut mengisi.'
      }}
    </p>
  </form>
</template>
