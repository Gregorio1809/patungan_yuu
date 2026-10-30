<script setup lang="ts">
import { ref } from 'vue'
import type { Participant } from '../types/database'
import { formatRupiah } from '../lib/money'
import { avatarTone, initials } from '../lib/ui'
import AppIcon from './AppIcon.vue'

defineProps<{
  participants: Participant[]
  totals: Record<string, number>
  myParticipantId: string | null
  adding?: boolean
}>()

const emit = defineEmits<{
  add: [name: string]
  edit: [participant: Participant]
}>()

const name = ref('')

function submit() {
  const value = name.value.trim()
  if (!value) return
  emit('add', value)
  name.value = ''
}
</script>

<template>
  <section class="card p-4 sm:p-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Peserta</h2>
        <p class="mt-0.5 text-xs text-muted">
          Setiap orang bisa klaim item dari HP masing-masing.
        </p>
      </div>
      <span class="chip shrink-0">{{ participants.length }} orang</span>
    </header>

    <p
      v-if="participants.length === 0"
      class="mt-4 rounded-xl border border-dashed border-line bg-paper px-3 py-3 text-sm text-muted"
    >
      Belum ada peserta. Tambahkan nama dulu supaya item bisa diklaim.
    </p>

    <ul v-else class="mt-3.5 flex flex-wrap gap-2">
      <li
        v-for="participant in participants"
        :key="participant.id"
        class="flex max-w-full items-center gap-2 rounded-full border border-line bg-paper py-1 pr-1 pl-1"
      >
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          :class="avatarTone(participant.name)"
        >
          {{ initials(participant.name) }}
        </span>
        <span
          class="min-w-0 max-w-40 truncate text-sm font-medium"
          :title="participant.name"
        >
          {{ participant.name }}
        </span>
        <span
          v-if="participant.id === myParticipantId"
          class="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-strong"
        >
          Kamu
        </span>
        <span class="money shrink-0 text-xs text-muted">
          {{ formatRupiah(totals[participant.id] ?? 0) }}
        </span>
        <button
          type="button"
          class="relative flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition after:absolute after:-inset-1.5 after:content-[''] hover:bg-paper-deep hover:text-ink"
          :aria-label="`Edit ${participant.name}`"
          @click="emit('edit', participant)"
        >
          <AppIcon name="pencil" :size="14" />
        </button>
      </li>
    </ul>

    <form class="mt-4 flex flex-col gap-2 sm:flex-row" @submit.prevent="submit">
      <div class="min-w-0 flex-1">
        <label for="new-participant" class="sr-only">Nama peserta baru</label>
        <input
          id="new-participant"
          v-model="name"
          class="field"
          maxlength="40"
          placeholder="Tambah nama peserta, misal: Budi"
        />
      </div>
      <button
        type="submit"
        class="btn btn-secondary shrink-0"
        :disabled="!name.trim() || adding"
      >
        <AppIcon name="plus" :size="16" />
        {{ adding ? 'Menambah...' : 'Tambah' }}
      </button>
    </form>
  </section>
</template>
