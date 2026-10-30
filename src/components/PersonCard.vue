<script setup lang="ts">
import { computed } from 'vue'
import type { PersonResult } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import { avatarTone, initials } from '../lib/ui'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  person: PersonResult
  isMe?: boolean
}>()

const hasDetails = computed(
  () =>
    props.person.items.length > 0 ||
    props.person.billDiscountShare > 0 ||
    props.person.serviceShare > 0 ||
    props.person.taxShare > 0 ||
    props.person.tipShare > 0,
)
</script>

<template>
  <article class="rounded-2xl border border-line bg-paper/70">
    <div class="flex items-center gap-2.5 px-3 py-3">
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="avatarTone(person.name)"
      >
        {{ initials(person.name) }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-1.5 truncate text-sm font-semibold">
          <span class="truncate" :title="person.name">{{ person.name }}</span>
          <span
            v-if="isMe"
            class="shrink-0 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-strong"
          >
            Kamu
          </span>
        </p>
        <p class="text-[11px] text-muted">
          {{ person.items.length }} item
        </p>
      </div>
      <p class="money shrink-0 text-base font-bold text-positive">
        {{ formatRupiah(person.total) }}
      </p>
    </div>

    <details v-if="hasDetails" class="group border-t border-line/70">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-muted transition hover:text-ink-soft [&::-webkit-details-marker]:hidden"
      >
        Rincian
        <AppIcon
          name="chevronDown"
          :size="14"
          class="transition-transform duration-150 group-open:rotate-180"
        />
      </summary>
      <div class="space-y-1.5 px-3 pb-3 text-xs">
        <div
          v-for="entry in person.items"
          :key="entry.itemId"
          class="flex items-start justify-between gap-3"
        >
          <span class="min-w-0 text-ink-soft">
            <span class="line-clamp-2">{{ entry.itemName }}</span>
            <span v-if="entry.weight > 1" class="text-muted">
              bobot {{ entry.weight }}
            </span>
          </span>
          <span class="money shrink-0">{{ formatRupiah(entry.amount) }}</span>
        </div>

        <div
          v-if="person.billDiscountShare > 0"
          class="flex items-center justify-between gap-3 text-positive"
        >
          <span>Diskon bill</span>
          <span class="money">−{{ formatRupiah(person.billDiscountShare) }}</span>
        </div>
        <div
          v-if="person.serviceShare > 0"
          class="flex items-center justify-between gap-3 text-muted"
        >
          <span>Service</span>
          <span class="money">+{{ formatRupiah(person.serviceShare) }}</span>
        </div>
        <div
          v-if="person.taxShare > 0"
          class="flex items-center justify-between gap-3 text-muted"
        >
          <span>Pajak / PB1</span>
          <span class="money">+{{ formatRupiah(person.taxShare) }}</span>
        </div>
        <div
          v-if="person.tipShare > 0"
          class="flex items-center justify-between gap-3 text-muted"
        >
          <span>Tip</span>
          <span class="money">+{{ formatRupiah(person.tipShare) }}</span>
        </div>
        <div
          v-if="person.items.length === 0"
          class="text-muted"
        >
          Tidak ikut item mana pun.
        </div>
      </div>
    </details>
  </article>
</template>
