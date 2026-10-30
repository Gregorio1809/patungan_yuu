<script setup lang="ts">
import { computed } from 'vue'
import type { CalcResult } from '../lib/calculate'
import type { Participant } from '../types/database'
import { formatRupiah } from '../lib/money'
import { buildSettlement, type SettlementLine } from '../lib/settlement'
import { avatarTone, initials } from '../lib/ui'
import AppIcon from './AppIcon.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps<{
  participants: Participant[]
  result: CalcResult
  rounding: number
  pending?: boolean
}>()

const emit = defineEmits<{
  'set-payer': [participantId: string | null]
  'toggle-paid': [participantId: string, paid: boolean, amount: number]
}>()

const settlement = computed(() =>
  buildSettlement(props.result, props.participants, props.rounding),
)

const payerSelectValue = computed(() => settlement.value.payer?.id ?? '')

function onPayerChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emit('set-payer', value || null)
}

function togglePaid(line: SettlementLine) {
  emit('toggle-paid', line.participantId, !line.paid, line.amount)
}

function statusClass(line: SettlementLine): string {
  if (line.paid) {
    return 'border-positive/30 bg-positive-soft text-positive'
  }
  if (line.stale) {
    return 'border-highlight bg-highlight-soft text-ink-soft'
  }
  return 'border-line bg-surface text-ink-soft'
}
</script>

<template>
  <section id="pembayaran" class="card scroll-mt-24 p-4 sm:p-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Pembayaran</h2>
        <p class="mt-0.5 text-xs text-muted">
          Tentukan penerima transfer dan tandai yang sudah lunas.
        </p>
      </div>
      <span
        v-if="settlement.totalCount > 0"
        class="chip shrink-0"
      >
        {{ settlement.paidCount }}/{{ settlement.totalCount }} lunas
      </span>
    </header>

    <EmptyState
      v-if="participants.length === 0"
      title="Belum ada peserta"
      description="Tambahkan peserta dan isi item dulu untuk mulai menghitung pembayaran."
      icon="users"
      class="!px-3"
    />

    <template v-else>
      <div class="mt-4">
        <label for="payer-select" class="label">Yang menalangi bill</label>
        <select
          id="payer-select"
          class="field"
          :value="payerSelectValue"
          :disabled="pending"
          @change="onPayerChange"
        >
          <option value="">Belum ditentukan</option>
          <option
            v-for="participant in participants"
            :key="participant.id"
            :value="participant.id"
          >
            {{ participant.name }}
          </option>
        </select>
        <p v-if="!settlement.payer" class="mt-1.5 text-xs text-muted">
          Pilih satu orang supaya muncul arah transfer dan pembulatan.
        </p>
      </div>

      <div
        v-if="settlement.payer"
        class="mt-4 rounded-xl border border-line bg-paper px-3.5 py-3 text-sm"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="text-muted">Penerima</span>
          <span class="font-semibold">{{ settlement.payer.name }}</span>
        </div>
        <div class="mt-1 flex items-center justify-between gap-3">
          <span class="text-muted">Bagian sendiri</span>
          <span class="money">{{ formatRupiah(settlement.payerTotal) }}</span>
        </div>
        <div class="mt-1 flex items-center justify-between gap-3">
          <span class="text-muted">Belum dibayar</span>
          <span class="money font-semibold">{{ formatRupiah(settlement.unpaidTotal) }}</span>
        </div>
        <p v-if="settlement.roundingExtra > 0" class="mt-2 text-[11px] text-muted">
          Transfer dibulatkan ke atas ke {{ formatRupiah(settlement.rounding) }}.
          Kelebihan {{ formatRupiah(settlement.roundingExtra) }} untuk penerima.
        </p>
      </div>

      <ul v-if="settlement.lines.length > 0" class="mt-3 divide-y divide-line">
        <li
          v-for="line in settlement.lines"
          :key="line.participantId"
          class="flex items-center gap-2.5 py-3"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            :class="avatarTone(line.name)"
          >
            {{ initials(line.name) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium" :title="line.name">
              {{ line.name }}
            </p>
            <p class="text-[11px] text-muted">
              <template v-if="settlement.payer">
                Transfer ke {{ settlement.payer.name }}
              </template>
              <template v-else>Total tagihan</template>
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="money text-sm font-semibold">{{ formatRupiah(line.amount) }}</p>
            <p
              v-if="line.amount !== line.exactAmount"
              class="money text-[10px] text-muted"
            >
              dari {{ formatRupiah(line.exactAmount) }}
            </p>
          </div>
          <button
            type="button"
            class="btn shrink-0 gap-1 border px-2.5"
            :class="statusClass(line)"
            :disabled="pending"
            :aria-label="
              line.paid
                ? `Batalkan lunas ${line.name}`
                : `Tandai lunas ${line.name}`
            "
            @click="togglePaid(line)"
          >
            <AppIcon v-if="line.paid" name="check" :size="14" />
            {{
              line.paid
                ? 'Lunas'
                : line.stale
                  ? 'Perbarui'
                  : 'Tandai'
            }}
          </button>
        </li>
      </ul>

      <p v-else class="mt-4 text-sm text-muted">
        Belum ada tagihan untuk dibayar.
      </p>
    </template>
  </section>
</template>
