import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiArrowRightSLine,
  RiReceiptLine,
  RiUserAddLine,
} from '@remixicon/react'
import { isLocalMode } from '../lib/dataMode'
import { getRecentSessions, type RecentSession } from '../lib/identity'
import { sessionRepository } from '../lib/repository'
import { isSupabaseConfigured } from '../lib/supabase'
import { useSessionStore } from '../store/session'
import { useToastStore } from '../store/toast'
import { AppHeader } from '../components/AppHeader'
import { CreateSessionForm } from '../components/CreateSessionForm'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const steps = [
  {
    number: '01',
    title: 'Buat sesi',
    description: 'Cukup beri nama acara.',
  },
  {
    number: '02',
    title: 'Bagikan link',
    description: 'Peserta buka link dan isi nama.',
  },
  {
    number: '03',
    title: 'Atur & klaim',
    description: 'Atur biaya, lalu klaim item.',
  },
]

export function HomeView() {
  const navigate = useNavigate()
  const createSession = useSessionStore(state => state.createSession)
  const toastError = useToastStore(state => state.error)
  const [creating, setCreating] = useState(false)
  const [recents, setRecents] = useState<RecentSession[]>(getRecentSessions())
  const requiresSupabaseSetup = !isLocalMode && !isSupabaseConfigured

  useEffect(() => {
    if (recents.length === 0) return

    let active = true
    sessionRepository
      .fetchRecentTitles(recents.map(entry => entry.slug))
      .then(titles => {
        if (!active) return
        setRecents(previous =>
          previous
            .filter(entry => titles[entry.slug])
            .map(entry => ({
              ...entry,
              title: titles[entry.slug] ?? entry.title,
            })),
        )
      })
      .catch(() => {
        // Keep titles from localStorage.
      })

    return () => {
      active = false
    }
  }, [])

  async function handleCreate(title: string) {
    setCreating(true)
    try {
      const created = await createSession({ title })
      await navigate(`/s/${created.slug}`)
    } catch {
      toastError('Gagal membuat sesi. Cek koneksi lalu coba lagi.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <AppHeader localMode={isLocalMode} />

      <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
        {isLocalMode && (
          <Alert
            tone="info"
            title="Mode lokal aktif"
            action={<Badge tone="info">Development</Badge>}
            className="mb-5"
          >
            Data disimpan di browser ini, jadi kamu bisa mencoba semua fitur
            tanpa Supabase. Supabase dipakai saat aplikasi berjalan di
            production.
          </Alert>
        )}

        {requiresSupabaseSetup && (
          <Alert
            tone="warning"
            title="Supabase belum tersambung"
            className="mb-5"
          >
            Isi{' '}
            <code className="rounded bg-bg-white-0 px-1.5 py-0.5 text-[11px]">
              VITE_SUPABASE_URL
            </code>{' '}
            dan{' '}
            <code className="rounded bg-bg-white-0 px-1.5 py-0.5 text-[11px]">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            di <code>.env.local</code> atau Netlify, lalu deploy ulang. Skema
            database ada di <code>supabase/schema.sql</code>.
          </Alert>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div>
            <Badge tone="success">Split bill rame-rame</Badge>

            <h1 className="mt-3 font-display text-3xl leading-[1.05] font-semibold tracking-tight text-text-strong-950 sm:text-4xl">
              Bagi bill,
              <br />
              <span className="text-primary-base">bukan bingung.</span>
            </h1>

            <p className="mt-3 max-w-xl text-paragraph-md text-text-sub-600">
              Buat sesi, bagikan link, biarkan setiap orang klaim itemnya
              sendiri. Total tiap orang dihitung otomatis, lengkap dengan
              ongkir, diskon, service, dan pajak.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {steps.map(step => (
                <Card key={step.number} className="p-3.5">
                  <Badge tone="neutral">{step.number}</Badge>
                  <p className="mt-2 text-label-md text-text-strong-950">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-text-soft-400">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <h2 className="text-title-h6 text-text-strong-950">
                Mulai patungan baru
              </h2>
              <div className="mt-3">
                <CreateSessionForm
                  pending={creating}
                  disabled={requiresSupabaseSetup}
                  localMode={isLocalMode}
                  onCreate={handleCreate}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-stroke-soft-200 px-4 py-3.5">
                <h2 className="text-label-md font-semibold text-text-strong-950">
                  Sesi terakhir
                </h2>
                <Badge>{recents.length}</Badge>
              </div>

              {recents.length > 0 ? (
                <ul className="divide-y divide-stroke-soft-200">
                  {recents.map(entry => (
                    <li key={entry.slug}>
                      <Link
                        to={`/s/${entry.slug}`}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-bg-weak-50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-bg-weak-50 text-text-sub-600">
                          <RiReceiptLine className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate text-label-md text-text-strong-950"
                            title={entry.title}
                          >
                            {entry.title}
                          </span>
                          <span className="block text-[11px] text-text-soft-400">
                            /s/{entry.slug}
                          </span>
                        </span>
                        <RiArrowRightSLine className="size-4 shrink-0 text-text-soft-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <span className="flex size-11 items-center justify-center rounded-12 bg-bg-weak-50 text-text-soft-400">
                    <RiUserAddLine className="size-5" />
                  </span>
                  <p className="mt-3 text-label-md text-text-strong-950">
                    Belum ada sesi
                  </p>
                  <p className="mt-1 max-w-xs text-paragraph-sm text-text-sub-600">
                    Sesi yang kamu buat atau buka akan muncul di sini.
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h2 className="text-label-md font-semibold text-text-strong-950">
                Cocok buat
              </h2>
              <ul className="mt-2 space-y-1.5 text-paragraph-sm text-text-sub-600">
                <li>Makan rame-rame di kantor</li>
                <li>Patungan kado atau tiket</li>
                <li>Bill kafe yang pajaknya bikin bingung</li>
              </ul>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
