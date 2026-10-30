<script setup lang="ts">
import { useToastStore, type ToastTone } from '../stores/toast'
import AppIcon from './AppIcon.vue'

const toast = useToastStore()

const toneClass: Record<ToastTone, string> = {
  success: 'border-positive/25 bg-positive-soft text-positive',
  error: 'border-danger/25 bg-danger-soft text-danger',
  info: 'border-line bg-surface text-ink-soft',
}
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup
      tag="div"
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      class="flex w-full flex-col items-center gap-2"
    >
      <div
        v-for="item in toast.items"
        :key="item.id"
        class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg"
        :class="toneClass[item.tone]"
      >
        <span class="min-w-0 flex-1">{{ item.message }}</span>
        <button
          type="button"
          class="-mr-1 -mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
          aria-label="Tutup notifikasi"
          @click="toast.dismiss(item.id)"
        >
          <AppIcon name="close" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
