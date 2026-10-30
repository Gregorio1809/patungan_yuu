<script setup lang="ts">
import { computed } from 'vue'
import type {
  ItemAssignment,
  ItemWithAssignments,
  Participant,
} from '../types/database'
import { calculateItemPricing } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { avatarTone, discountLabel, initials } from '../lib/ui'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  item: ItemWithAssignments
  participants: Participant[]
  myParticipantId: string | null
}>()

const emit = defineEmits<{
  claim: [item: ItemWithAssignments]
  edit: [item: ItemWithAssignments]
  remove: [item: ItemWithAssignments]
}>()

const pricing = computed(() =>
  calculateItemPricing(
    props.item.price,
    props.item.quantity,
    props.item.discount_type,
    props.item.discount_value,
  ),
)

interface ClaimRow {
  assignment: ItemAssignment
  participant: Participant
}

const claims = computed<ClaimRow[]>(() =>
  props.item.item_assignments.flatMap(assignment => {
    const participant = props.participants.find(
      candidate => candidate.id === assignment.participant_id,
    )
    return participant ? [{ assignment, participant }] : []
  }),
)

const discountBadge = computed(() => {
  if (props.item.discount_value <= 0) return ''
  return `Diskon ${discountLabel(props.item.discount_type, props.item.discount_value)}`
})
</script>

<template>
  <li class="px-4 py-4 sm:px-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <h3 class="truncate text-base font-semibold" :title="item.name">
            {{ item.name }}
          </h3>
          <span
            v-if="discountBadge"
            class="rounded-full border border-highlight bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
          >
            {{ discountBadge }}
          </span>
          <span
            v-if="claims.length === 0"
            class="rounded-full border border-highlight bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
          >
            Belum diklaim
          </span>
        </div>

        <p class="mt-1 text-sm text-muted">
          <span class="money">{{ formatRupiah(item.price) }}</span>
          <span v-if="item.quantity > 1"> × {{ item.quantity }}</span>
          <span v-if="pricing.discount > 0" class="text-ink-soft">
            · potongan
            <span class="money">{{ formatRupiah(pricing.discount) }}</span>
          </span>
        </p>

        <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            v-for="row in claims"
            :key="row.participant.id"
            class="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper py-1 pr-2 pl-1 text-xs"
            :class="
              row.participant.id === myParticipantId
                ? 'ring-1 ring-brand/40'
                : ''
            "
          >
            <span
              class="flex size-5 items-center justify-center rounded-full text-[9px] font-bold"
              :class="avatarTone(row.participant.name)"
            >
              {{ initials(row.participant.name) }}
            </span>
            <span class="max-w-24 truncate">{{ row.participant.name }}</span>
            <span v-if="row.assignment.quantity > 1" class="text-muted">
              ×{{ row.assignment.quantity }}
            </span>
          </span>
          <span v-if="claims.length === 0" class="text-xs text-muted">
            Belum ada yang klaim item ini
          </span>
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-2 border-t border-line/70 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0"
      >
        <span class="money text-base font-bold">
          {{ formatRupiah(pricing.net) }}
        </span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="btn btn-secondary"
            @click="emit('claim', item)"
          >
            <AppIcon name="users" :size="16" />
            Klaim
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-icon"
            aria-label="Edit item"
            @click="emit('edit', item)"
          >
            <AppIcon name="pencil" :size="17" />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-icon text-danger hover:bg-danger-soft"
            aria-label="Hapus item"
            @click="emit('remove', item)"
          >
            <AppIcon name="trash" :size="17" />
          </button>
        </div>
      </div>
    </div>
  </li>
</template>
