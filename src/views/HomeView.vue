<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { NewSessionInput } from '../types/database'
import { isLocalMode } from '../lib/dataMode'
import { getRecentSessions, type RecentSession } from '../lib/identity'
import { sessionRepository } from '../lib/repository'
import { isSupabaseConfigured } from '../lib/supabase'
import { useSessionStore } from '../stores/session'
import { useToastStore } from '../stores/toast'
import AppHeader from '../components/AppHeader.vue'
import AppIcon from '../components/AppIcon.vue'
import CreateSessionForm from '../components/CreateSessionForm.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const toast = useToastStore()

const creating = ref(false)
const recents = ref<RecentSession[]>(getRecentSessions())
const requiresSupabaseSetup = !isLocalMode && !isSupabaseConfigured

const steps = [
  {
    number: '01',
    title: 'Buat sesi',
    description: 'Cukup beri nama acara.',
  },
  {
    number: '02',
    title: 'Bagikan link',
    description: 'Semua peserta buka link dan isi nama.',
  },
  {
    number: '03',
    title: 'Atur & klaim',
    description: 'Atur biaya, lalu klaim item.',
  },
]

onMounted(async () => {
  if (recents.value.length === 0) return

  try {
    const slugs = recents.value.map(entry => entry.slug)
    const titles = await sessionRepository.fetchRecentTitles(slugs)

    recents.value = recents.value
      .filter(entry => titles[entry.slug])
      .map(entry => ({ ...entry, title: titles[entry.slug] }))
  } catch {
    // Tetap tampilkan judul yang tersimpan di localStorage.
  }
})

async function handleCreate(input: NewSessionInput) {
  creating.value = true
  try {
    const created = await sessionStore.createSession(input)
    await router.push({ name: 'session', params: { slug: created.slug } })
  } catch {
    toast.error('Gagal membuat sesi. Cek koneksi lalu coba lagi.')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader />

    <main class="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <div
        v-if="isLocalMode"
        class="mb-6 flex items-start gap-3 rounded-2xl border border-positive/25 bg-positive-soft p-4 text-sm"
      >
        <span
          class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-positive"
        >
          <AppIcon name="check" :size="16" />
        </span>
        <div>
          <p class="font-semibold text-positive">Mode lokal aktif</p>
          <p class="mt-0.5 text-ink-soft">
            Data disimpan di browser ini, jadi kamu bisa mencoba semua fitur
            tanpa Supabase. Supabase dipakai saat aplikasi berjalan di production.
          </p>
        </div>
      </div>

      <div
        v-else-if="requiresSupabaseSetup"
        class="mb-6 rounded-2xl border border-highlight bg-highlight-soft p-4 text-sm text-ink-soft"
      >
        <p class="flex items-center gap-2 font-semibold">
          <AppIcon name="warning" :size="18" />
          Supabase belum tersambung
        </p>
        <p class="mt-1">
          Isi
          <code class="rounded bg-surface px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code>
          dan
          <code class="rounded bg-surface px-1.5 py-0.5 text-xs">VITE_SUPABASE_ANON_KEY</code>
          di <code class="rounded bg-surface px-1.5 py-0.5 text-xs">.env.local</code>,
          jalankan ulang dev server, lalu muat ulang halaman. Skema database ada di
          <code class="rounded bg-surface px-1.5 py-0.5 text-xs">supabase/schema.sql</code>.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-start">
        <div>
          <p
            class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft"
          >
            <span class="size-1.5 rounded-full bg-positive" />
            Split bill rame-rame
          </p>

          <h1
            class="mt-4 font-display text-4xl leading-[1.04] font-bold tracking-tight sm:text-5xl"
          >
            Bagi bill,
            <br />
            <span class="text-brand">bukan bingung.</span>
          </h1>

          <p class="mt-4 max-w-xl text-base text-ink-soft sm:text-lg">
            Buat sesi, bagikan link, biarkan setiap orang klaim itemnya sendiri.
            Total tiap orang dihitung otomatis, lengkap dengan diskon dan pajak.
          </p>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div v-for="step in steps" :key="step.number" class="card p-3.5">
              <span class="text-[11px] font-bold text-brand">{{ step.number }}</span>
              <p class="mt-1 text-sm font-semibold">{{ step.title }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ step.description }}</p>
            </div>
          </div>

          <div class="mt-7">
            <h2 class="mb-3 text-lg font-semibold">Mulai patungan baru</h2>
            <CreateSessionForm
              :pending="creating"
              :disabled="requiresSupabaseSetup"
              :local-mode="isLocalMode"
              @create="handleCreate"
            />
          </div>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-8">
          <div class="card overflow-hidden">
            <header
              class="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5"
            >
              <h2 class="text-base font-semibold">Sesi terakhir</h2>
              <span class="chip">{{ recents.length }}</span>
            </header>

            <ul v-if="recents.length > 0" class="divide-y divide-line">
              <li v-for="entry in recents" :key="entry.slug">
                <RouterLink
                  :to="`/s/${entry.slug}`"
                  class="flex items-center gap-3 px-4 py-3 transition hover:bg-paper"
                >
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-paper-deep text-ink-soft"
                  >
                    <AppIcon name="receipt" :size="18" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold" :title="entry.title">
                      {{ entry.title }}
                    </span>
                    <span class="block text-[11px] text-muted">/s/{{ entry.slug }}</span>
                  </span>
                  <AppIcon name="chevronRight" :size="16" class="text-muted" />
                </RouterLink>
              </li>
            </ul>

            <EmptyState
              v-else
              title="Belum ada sesi"
              description="Sesi yang kamu buat atau buka akan muncul di sini."
            />
          </div>

          <div class="card p-4">
            <h2 class="text-base font-semibold">Cocok buat</h2>
            <ul class="mt-2 space-y-1.5 text-sm text-ink-soft">
              <li>Makan rame-rame di kantor</li>
              <li>Patungan kado atau tiket</li>
              <li>Bill kafe yang pajaknya bikin bingung</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
