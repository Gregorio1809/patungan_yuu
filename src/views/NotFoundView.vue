<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader />

    <main class="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center">
      <div class="flex size-14 items-center justify-center rounded-2xl bg-paper-deep text-muted">
        <AppIcon name="receipt" :size="26" />
      </div>
      <h1 class="mt-4 font-display text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p class="mt-2 text-sm text-muted">
        Link yang kamu buka tidak dikenal. Cek lagi alamatnya atau mulai sesi baru.
      </p>
      <RouterLink to="/" class="btn btn-primary mt-5">
        Kembali ke beranda
      </RouterLink>
    </main>
  </div>
</template>
