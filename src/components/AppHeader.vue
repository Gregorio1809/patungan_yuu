<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b border-line/70 bg-paper/85 backdrop-blur">
    <div class="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5"
        aria-label="Patungan Yuu, kembali ke beranda"
      >
        <span
          class="flex size-10 items-center justify-center rounded-2xl bg-brand font-display text-lg font-bold text-white shadow-sm"
        >
          P
        </span>
        <span>
          <span class="block font-display text-lg leading-none font-bold">
            Patungan Yuu
          </span>
          <span class="mt-1 block text-[11px] leading-none text-muted">
            Bagi bill tanpa drama
          </span>
        </span>
      </RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
