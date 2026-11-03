import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiArrowDownLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiQrCodeLine,
  RiReceiptLine,
  RiShareLine,
  RiUserLine,
} from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
import { isLocalMode } from '../lib/dataMode'
import { getRecentSessions, type RecentSession } from '../lib/identity'
import { formatRupiah } from '../lib/money'
import { sessionRepository } from '../lib/repository'
import { isSupabaseConfigured } from '../lib/supabase'
import { useSessionStore } from '../store/session'
import { useToastStore } from '../store/toast'
import { AppHeader } from '../components/AppHeader'
import { CreateSessionForm } from '../components/CreateSessionForm'
import { Alert } from '../ui/Alert'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const previewPeople = [
  { name: 'Ani', amount: 128_000, payer: true },
  { name: 'Budi', amount: 96_000, payer: false },
  { name: 'Citra', amount: 124_000, payer: false },
] as const

const previewTotal = 348_000

export function HomeView() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createSession = useSessionStore(state => state.createSession)
  const toastError = useToastStore(state => state.error)
  const [creating, setCreating] = useState(false)
  const [recents, setRecents] = useState<RecentSession[]>(getRecentSessions())
  const requiresSupabaseSetup = !isLocalMode && !isSupabaseConfigured

  const steps = [
    {
      number: '01',
      title: t('home.stepCreateTitle'),
      description: t('home.stepCreateBody'),
      icon: RiReceiptLine,
    },
    {
      number: '02',
      title: t('home.stepShareTitle'),
      description: t('home.stepShareBody'),
      icon: RiShareLine,
    },
    {
      number: '03',
      title: t('home.stepClaimTitle'),
      description: t('home.stepClaimBody'),
      icon: RiCheckboxCircleLine,
    },
  ]

  const features = [
    {
      icon: RiUserLine,
      title: t('home.featureClaimTitle'),
      body: t('home.featureClaimBody'),
    },
    {
      icon: RiReceiptLine,
      title: t('home.featureCostsTitle'),
      body: t('home.featureCostsBody'),
    },
    {
      icon: RiQrCodeLine,
      title: t('home.featureQrTitle'),
      body: t('home.featureQrBody'),
    },
    {
      icon: RiCheckboxCircleLine,
      title: t('home.featurePaidTitle'),
      body: t('home.featurePaidBody'),
    },
  ]

  const useCases = [
    t('home.goodFor1'),
    t('home.goodFor2'),
    t('home.goodFor3'),
  ]

  const trustPoints = [
    t('home.trustFree'),
    t('home.trustNoAccount'),
    t('home.trustShare'),
  ]

  const startPoints = [
    t('home.startPoint1'),
    t('home.startPoint2'),
    t('home.startPoint3'),
  ]

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

  function scrollToSection(sectionId: string, focusId?: string) {
    const section = document.getElementById(sectionId)
    if (!section) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    section.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })

    if (focusId) {
      window.setTimeout(
        () => {
          document
            .getElementById(focusId)
            ?.focus({ preventScroll: true })
        },
        reduceMotion ? 0 : 450,
      )
    }
  }

  async function handleCreate(title: string) {
    setCreating(true)
    try {
      const created = await createSession({ title })
      await navigate(`/s/${created.slug}`)
    } catch {
      toastError(t('home.createError'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <AppHeader localMode={isLocalMode} />

      <main>
        <section className="relative overflow-hidden border-b border-stroke-soft-200 bg-bg-white-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-32 -right-24 size-[30rem] rounded-full bg-primary-alpha-10 blur-3xl" />
            <div className="absolute top-1/2 -left-40 size-80 -translate-y-1/2 rounded-full bg-information-lighter opacity-80 blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
            <div className="max-w-2xl">
              <Badge tone="primary" className="gap-1.5 px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-primary-text" />
                {t('home.badge')}
              </Badge>

              <h1 className="mt-5 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.03em] text-text-strong-950 sm:text-5xl lg:text-6xl">
                {t('home.heroLine1')}
                <br />
                <span className="text-primary-text">
                  {t('home.heroLine2')}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-paragraph-md text-text-sub-600">
                {t('home.heroBody')}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Button
                  className="h-11 w-full px-5 sm:w-auto"
                  onClick={() =>
                    scrollToSection(
                      'buat-sesi',
                      'patungan-new-session-title',
                    )
                  }
                  aria-controls="buat-sesi"
                >
                  {t('home.ctaPrimary')}
                  <RiArrowDownLine className="size-4" />
                </Button>
                <Button
                  variant="neutral"
                  mode="stroke"
                  className="h-11 w-full px-5 sm:w-auto"
                  onClick={() => scrollToSection('cara-kerja')}
                  aria-controls="cara-kerja"
                >
                  {t('home.ctaSecondary')}
                </Button>
              </div>

              <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-text-soft-400 min-[380px]:flex min-[380px]:flex-wrap min-[380px]:items-center min-[380px]:gap-x-4">
                {trustPoints.map(point => (
                  <li key={point} className="flex items-center gap-1.5">
                    <RiCheckLine className="size-3.5 text-success-base" />
                    {point}
                  </li>
                ))}
              </ul>

              {isLocalMode && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-text-soft-400">
                  <span className="size-1.5 rounded-full bg-success-base" />
                  {t('home.localNote')}
                </p>
              )}
            </div>

            <div
              className="relative mx-auto w-full max-w-[25rem] lg:ml-auto"
              aria-hidden="true"
            >
              <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[2deg] rounded-2xl border border-stroke-soft-200 bg-bg-weak-25" />
              <Card className="relative overflow-hidden p-0 shadow-regular-md">
                <div className="flex items-start justify-between gap-3 border-b border-stroke-soft-200 px-4 py-3.5">
                  <div>
                    <p className="text-label-md font-semibold text-text-strong-950">
                      {t('home.previewTitle')}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-soft-400">
                      {t('home.previewMeta')}
                    </p>
                  </div>
                  <span className="flex size-9 items-center justify-center rounded-10 bg-primary-alpha-10 text-primary-text">
                    <RiQrCodeLine className="size-4" />
                  </span>
                </div>

                <div className="space-y-4 px-4 py-4">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-text-soft-400 uppercase">
                      {t('home.previewTotal')}
                    </p>
                    <p className="money mt-0.5 text-title-h5 text-text-strong-950">
                      {formatRupiah(previewTotal)}
                    </p>
                  </div>

                  <div className="space-y-2.5 border-t border-stroke-soft-200 pt-3.5">
                    {previewPeople.map((person, index) => (
                      <div
                        key={person.name}
                        className={
                          index >= 2
                            ? 'hidden items-center gap-2.5 sm:flex'
                            : 'flex items-center gap-2.5'
                        }
                      >
                        <Avatar name={person.name} />
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <span className="truncate text-label-sm text-text-strong-950">
                            {person.name}
                          </span>
                          {person.payer && (
                            <Badge tone="success">
                              {t('common.payer')}
                            </Badge>
                          )}
                        </div>
                        <span className="money text-label-sm font-semibold text-text-strong-950">
                          {formatRupiah(person.amount)}
                        </span>
                        <RiCheckLine className="size-4 shrink-0 text-success-base" />
                      </div>
                    ))}
                    {previewPeople.length > 2 && (
                      <p className="text-[11px] text-text-soft-400 sm:hidden">
                        {t('home.previewMore', {
                          count: previewPeople.length - 2,
                        })}
                      </p>
                    )}
                  </div>

                  <div className="rounded-10 border border-success-base/20 bg-success-lighter px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-label-sm font-medium text-success-base">
                      <RiCheckboxCircleLine className="size-4" />
                      {t('home.previewAllPaid')}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-sub-600">
                      {t('home.previewNote')}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="scroll-mt-8">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-text-strong-950 sm:text-3xl">
                {t('home.howTitle')}
              </h2>
              <p className="mt-2 text-paragraph-md text-text-sub-600">
                {t('home.howSubtitle')}
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {steps.map(step => {
                const Icon = step.icon
                return (
                  <Card key={step.number} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-10 items-center justify-center rounded-12 bg-primary-alpha-10 text-primary-text">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-display text-2xl font-semibold text-text-soft-400">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-4 text-label-md font-semibold text-text-strong-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-paragraph-sm text-text-sub-600">
                      {step.description}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-stroke-soft-200 bg-bg-white-0">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-text-strong-950 sm:text-3xl">
                  {t('home.featuresTitle')}
                </h2>
                <p className="mt-2 max-w-md text-paragraph-md text-text-sub-600">
                  {t('home.featuresSubtitle')}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {features.map(feature => {
                  const Icon = feature.icon
                  return (
                    <Card key={feature.title} className="p-4 sm:p-5">
                      <span className="flex size-9 items-center justify-center rounded-10 bg-bg-weak-50 text-text-sub-600">
                        <Icon className="size-4" />
                      </span>
                      <h3 className="mt-3 text-label-md font-semibold text-text-strong-950">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-paragraph-sm text-text-sub-600">
                        {feature.body}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="buat-sesi"
          className="scroll-mt-8 border-y border-stroke-soft-200 bg-bg-white-0"
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <Badge tone="primary">{t('home.startEyebrow')}</Badge>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-strong-950 sm:text-4xl">
                {t('home.startHeadline')}
              </h2>
              <p className="mt-3 max-w-xl text-paragraph-md text-text-sub-600">
                {t('home.startBody')}
              </p>
              <ul className="mt-5 space-y-2">
                {startPoints.map(point => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-paragraph-sm text-text-sub-600"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-lighter text-success-base">
                      <RiCheckLine className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {requiresSupabaseSetup && (
                <Alert
                  tone="warning"
                  title={t('home.setupTitle')}
                  className="mb-3"
                >
                  {t('home.setupBody')}
                </Alert>
              )}
              <CreateSessionForm
                pending={creating}
                disabled={requiresSupabaseSetup}
                localMode={isLocalMode}
                onCreate={handleCreate}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 sm:py-14">
          <Card className="p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-8">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-text-strong-950">
                  {t('home.goodForTitle')}
                </h2>
                <p className="mt-1 text-paragraph-sm text-text-sub-600">
                  {t('home.usecasesSubtitle')}
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-3">
                {useCases.map(useCase => (
                  <li
                    key={useCase}
                    className="rounded-10 border border-stroke-soft-200 bg-bg-weak-25 px-3 py-2.5 text-label-sm text-text-sub-600"
                  >
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>

        {recents.length > 0 && (
          <section className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-text-strong-950">
                  {t('home.recentTitle')}
                </h2>
                <p className="mt-1 text-paragraph-sm text-text-sub-600">
                  {t('home.recentSubtitle')}
                </p>
              </div>
              <Badge>{recents.length}</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recents.map(entry => (
                <Link
                  key={entry.slug}
                  to={`/s/${entry.slug}`}
                  className="surface group flex items-center gap-3 p-4 transition hover:border-stroke-sub-300 hover:shadow-regular-sm"
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
                  <RiArrowRightSLine className="size-4 shrink-0 text-text-soft-400 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-stroke-soft-200">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-7 text-[11px] text-text-soft-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-sm font-semibold text-text-strong-950">
            Patungan Yuu
          </p>
          <p>{t('home.footerNote')}</p>
        </div>
      </footer>
    </div>
  )
}
