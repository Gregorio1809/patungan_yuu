<script setup lang="ts">
import { computed } from 'vue'
import type { CalcResult } from '../lib/calculate'
import { formatRupiah } from '../lib/money'
import AppIcon from './AppIcon.vue'
import EmptyState from './EmptyState.vue'
import PersonCard from './PersonCard.vue'

const props = defineProps<{
  result: CalcResult
  myParticipantId: string | null
  hasBillSettings: boolean
  receiptTotal: number
  payerName: string | null
  hasParticipants: boolean
  claimingUnclaimed?: boolean
}>()

const emit = defineEmits<{
  share: []
  settings: []
  'claim-unclaimed': [mode: 'all' | 'payer']
}>()

const claimedGross = computed(() =>
  props.result.items
    .filter(item => item.claimed)
    .reduce((sum, item) => sum + item.gross, 0),
)

const claimedItemDiscount = computed(
  () => claimedGross.value - props.result.claimedNet,
)

const unclaimedNames = computed(() => {
  const names = props.result.unclaimedItems.map(item => item.name)
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 3).join(', ')} +${names.length - 3} lainnya`
})

const unclaimedTotal = computed(() =>
  props.result.unclaimedItems.reduce((sum, item) => sum + item.net, 0),
)

const hasReceipt = computed(() => props.receiptTotal > 0)
const receiptDiff = computed(() => props.result.grandTotal - props.receiptTotal)

const receiptMessage = computed(() => {
  if (receiptDiff.value === 0) return 'Cocok dengan total struk.'
  if (receiptDiff.value > 0) {
    return `Total aplikasi ${formatRupiah(receiptDiff.value)} lebih tinggi dari struk. Cek item yang belum dimasukkan.`
  }
  return `Total aplikasi ${formatRupiah(Math.abs(receiptDiff.value))} lebih rendah dari struk.`
})
</script>

<template>
  <section id="ringkasan" class="card scroll-mt-24 p-4 sm:p-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Ringkasan</h2>
        <p class="mt-0.5 text-xs text-muted">Total yang harus dibayar tiap orang.</p>
      </div>
      <button
        type="button"
        class="btn btn-secondary shrink-0 text-xs"
        @click="emit('share')"
      >
        <AppIcon name="share" :size="15" />
        Bagikan
      </button>
    </header>

    <div
      v-if="result.unclaimedItems.length > 0"
      class="mt-4 rounded-xl border border-highlight bg-highlight-soft px-3 py-2.5 text-xs text-ink-soft"
    >
      <p class="flex items-center gap-1.5 font-semibold">
        <AppIcon name="warning" :size="15" />
        {{ result.unclaimedItems.length }} item belum diklaim
      </p>
      <p class="mt-1">
        {{ unclaimedNames }}
        ({{ formatRupiah(unclaimedTotal) }}) tidak dibebankan ke siapa pun.
      </p>

      <div v-if="hasParticipants" class="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-secondary text-xs"
          :disabled="claimingUnclaimed"
          @click="emit('claim-unclaimed', 'all')"
        >
          Bagi rata semua
        </button>
        <button
          v-if="payerName"
          type="button"
          class="btn btn-secondary text-xs"
          :disabled="claimingUnclaimed"
          @click="emit('claim-unclaimed', 'payer')"
        >
          Bebankan semua ke {{ payerName }}
        </button>
      </div>
      <p v-else class="mt-1 text-[11px]">
        Tambahkan peserta dulu untuk membagi item yang belum diklaim.
      </p>
      <p v-if="hasParticipants && !payerName" class="mt-1 text-[11px]">
        Pilih penerima transfer di bagian Pembayaran untuk membebankan ke satu
        orang.
      </p>
    </div>

    <dl class="mt-4 space-y-2 text-sm">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">Subtotal item</dt>
        <dd class="money">{{ formatRupiah(claimedGross) }}</dd>
      </div>
      <div
        v-if="claimedItemDiscount > 0"
        class="flex items-center justify-between gap-3"
      >
        <dt class="text-muted">Diskon item</dt>
        <dd class="money text-positive">−{{ formatRupiah(claimedItemDiscount) }}</dd>
      </div>
      <div v-if="result.billDiscount > 0" class="flex items-center justify-between gap-3">
        <dt class="text-muted">Diskon bill</dt>
        <dd class="money text-positive">−{{ formatRupiah(result.billDiscount) }}</dd>
      </div>
      <div v-if="result.serviceAmount > 0" class="flex items-center justify-between gap-3">
        <dt class="text-muted">Service</dt>
        <dd class="money">+{{ formatRupiah(result.serviceAmount) }}</dd>
      </div>
      <div v-if="result.taxAmount > 0" class="flex items-center justify-between gap-3">
        <dt class="text-muted">Pajak / PB1</dt>
        <dd class="money">+{{ formatRupiah(result.taxAmount) }}</dd>
      </div>
      <div v-if="result.tipAmount > 0" class="flex items-center justify-between gap-3">
        <dt class="text-muted">Tip</dt>
        <dd class="money">+{{ formatRupiah(result.tipAmount) }}</dd>
      </div>
      <div
        class="flex items-center justify-between gap-3 border-t border-line pt-3 text-base font-semibold"
      >
        <dt>Total</dt>
        <dd class="money text-xl font-bold">{{ formatRupiah(result.grandTotal) }}</dd>
      </div>
    </dl>

    <div
      v-if="hasReceipt"
      class="mt-3 rounded-xl border px-3 py-2.5 text-xs"
      :class="
        receiptDiff === 0
          ? 'border-positive/25 bg-positive-soft text-positive'
          : 'border-highlight bg-highlight-soft text-ink-soft'
      "
    >
      <div class="flex items-center justify-between gap-3">
        <span>Total struk</span>
        <span class="money">{{ formatRupiah(receiptTotal) }}</span>
      </div>
      <div class="mt-1 flex items-center justify-between gap-3">
        <span>Total aplikasi</span>
        <span class="money">{{ formatRupiah(result.grandTotal) }}</span>
      </div>
      <p class="mt-1.5 font-medium">{{ receiptMessage }}</p>
    </div>

    <div class="mt-4">
      <button
        type="button"
        class="btn btn-secondary w-full"
        @click="emit('settings')"
      >
        <AppIcon name="settings" :size="16" />
        Atur bill & pembayaran
      </button>
      <p
        v-if="!hasBillSettings"
        class="mt-1.5 text-center text-[11px] text-muted"
      >
        Ada diskon bill, service, atau pajak? Atur di sini.
      </p>
    </div>

    <div v-if="result.people.length > 0" class="mt-5 space-y-2">
      <PersonCard
        v-for="person in result.people"
        :key="person.participantId"
        :person="person"
        :is-me="person.participantId === myParticipantId"
      />
    </div>

    <EmptyState
      v-else
      title="Belum ada peserta"
      description="Tambahkan nama peserta supaya rincian pembayaran muncul di sini."
      icon="users"
      class="!px-3"
    />
  </section>
</template>
