<script setup lang="ts">
import { formatRupiah } from '../lib/money'

defineProps<{
  total: number
  hasIdentity: boolean
  unclaimedCount: number
}>()

const emit = defineEmits<{
  join: []
}>()
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(36,24,18,0.08)] backdrop-blur lg:hidden"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-medium tracking-wide text-muted uppercase">
          {{ hasIdentity ? 'Total kamu' : 'Belum gabung' }}
        </p>
        <p class="money truncate text-lg font-bold">
          {{ hasIdentity ? formatRupiah(total) : 'Gabung untuk lihat totalmu' }}
        </p>
        <p v-if="unclaimedCount > 0" class="text-[11px] text-ink-soft">
          {{ unclaimedCount }} item belum diklaim
        </p>
      </div>
      <a
        v-if="hasIdentity"
        href="#ringkasan"
        class="btn btn-secondary btn-sm shrink-0"
      >
        Lihat rincian
      </a>
      <button
        v-else
        type="button"
        class="btn btn-primary btn-sm shrink-0"
        @click="emit('join')"
      >
        Gabung
      </button>
    </div>
  </div>
</template>
