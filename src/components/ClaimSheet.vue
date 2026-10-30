<script setup lang="ts">
import { computed } from 'vue'
import type {
  ItemWithAssignments,
  Participant,
} from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { avatarTone, initials } from '../lib/ui'
import AppIcon from './AppIcon.vue'
import BaseModal from './BaseModal.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps<{
  open: boolean
  item: ItemWithAssignments | null
  participants: Participant[]
  myParticipantId: string | null
  pendingIds?: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'set-claim': [participantId: string, quantity: number | null]
}>()

const pendingSet = computed(() => new Set(props.pendingIds ?? []))
const claimWeight = computed(() =>
  (props.item?.item_assignments ?? []).reduce(
    (sum, assignment) => sum + assignment.quantity,
    0,
  ),
)
const itemNet = computed(() =>
  props.item
    ? calculateItemPricing(
        props.item.price,
        props.item.quantity,
        props.item.discount_type,
        props.item.discount_value,
      ).net
    : 0,
)

function claimQty(participantId: string): number | null {
  const assignment = props.item?.item_assignments.find(
    item => item.participant_id === participantId,
  )
  return assignment ? assignment.quantity : null
}

function toggle(participantId: string, checked: boolean) {
  emit('set-claim', participantId, checked ? 1 : null)
}

function step(participantId: string, delta: number) {
  const current = claimQty(participantId)
  if (current === null) return
  emit('set-claim', participantId, Math.max(1, current + delta))
}
</script>

<template>
  <BaseModal
    :model-value="open"
    title="Klaim item"
    :description="item?.name"
    @update:model-value="emit('update:open', $event)"
  >
    <div
      class="rounded-xl border border-line bg-paper px-3.5 py-3 text-xs text-muted"
    >
      Centang peserta yang ikut menikmati item ini. Bobot 1 berarti satu porsi.
      Total item dibagi sesuai bobot semua pengklaim.
      <span v-if="item" class="mt-1 block font-medium text-ink-soft">
        Nilai bersih item: {{ formatRupiah(itemNet) }} · {{ claimWeight }} bobot
        klaim
      </span>
    </div>

    <EmptyState
      v-if="participants.length === 0"
      title="Belum ada peserta"
      description="Tambahkan peserta dulu, lalu klaim item untuk mereka."
      icon="users"
    />

    <ul v-else class="mt-2 divide-y divide-line">
      <li
        v-for="participant in participants"
        :key="participant.id"
        class="flex items-center gap-2 py-2.5"
      >
        <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            class="size-5 shrink-0 accent-brand"
            :checked="claimQty(participant.id) !== null"
            :disabled="pendingSet.has(participant.id)"
            @change="
              toggle(
                participant.id,
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            :class="avatarTone(participant.name)"
          >
            {{ initials(participant.name) }}
          </span>
          <span class="min-w-0 truncate text-sm font-medium" :title="participant.name">
            {{ participant.name }}
          </span>
          <span
            v-if="participant.id === myParticipantId"
            class="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-strong"
          >
            Kamu
          </span>
        </label>

        <div
          v-if="claimQty(participant.id) !== null"
          class="flex shrink-0 items-center gap-1"
        >
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            :aria-label="`Kurangi bobot ${participant.name}`"
            :disabled="pendingSet.has(participant.id) || claimQty(participant.id) === 1"
            @click="step(participant.id, -1)"
          >
            <AppIcon name="minus" :size="16" />
          </button>
          <span class="money w-6 text-center text-sm font-semibold">
            {{ claimQty(participant.id) }}
          </span>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            :aria-label="`Tambah bobot ${participant.name}`"
            :disabled="pendingSet.has(participant.id)"
            @click="step(participant.id, 1)"
          >
            <AppIcon name="plus" :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          class="btn btn-secondary"
          @click="emit('update:open', false)"
        >
          Selesai
        </button>
      </div>
    </template>
  </BaseModal>
</template>
