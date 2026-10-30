<script setup lang="ts">
import type {
  ItemWithAssignments,
  Participant,
} from '../types/database'
import type { CalcResult } from '../lib/calculate'
import AppIcon from './AppIcon.vue'
import EmptyState from './EmptyState.vue'
import ItemRow from './ItemRow.vue'

defineProps<{
  items: ItemWithAssignments[]
  participants: Participant[]
  result: CalcResult
  myParticipantId: string | null
}>()

const emit = defineEmits<{
  add: []
  claim: [item: ItemWithAssignments]
  duplicate: [item: ItemWithAssignments]
  edit: [item: ItemWithAssignments]
  remove: [item: ItemWithAssignments]
}>()
</script>

<template>
  <section class="card overflow-hidden">
    <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold">Item</h2>
        <p class="mt-0.5 text-xs text-muted">
          {{ items.length }} item
          <span v-if="result.unclaimedItems.length > 0" class="text-ink-soft">
            · {{ result.unclaimedItems.length }} belum diklaim
          </span>
        </p>
      </div>
      <button type="button" class="btn btn-primary shrink-0" @click="emit('add')">
        <AppIcon name="plus" :size="17" />
        Tambah item
      </button>
    </header>

    <EmptyState
      v-if="items.length === 0"
      title="Belum ada item"
      description="Tambahkan item beserta harganya. Setiap peserta bisa mengklaim item yang mereka ambil."
    >
      <button type="button" class="btn btn-primary" @click="emit('add')">
        <AppIcon name="plus" :size="17" />
        Tambah item pertama
      </button>
    </EmptyState>

    <ul v-else class="divide-y divide-line">
      <ItemRow
        v-for="item in items"
        :key="item.id"
        :item="item"
        :participants="participants"
        :my-participant-id="myParticipantId"
        @claim="emit('claim', $event)"
        @duplicate="emit('duplicate', $event)"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
      />
    </ul>
  </section>
</template>
