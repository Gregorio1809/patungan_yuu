import { useNavigate } from 'react-router-dom'
import { RiErrorWarningLine } from '@remixicon/react'
import { isLocalMode } from '../lib/dataMode'
import { AppHeader } from '../components/AppHeader'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function NotFoundView() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh">
      <AppHeader localMode={isLocalMode} />
      <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16">
        <Card className="w-full p-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-12 bg-bg-weak-50 text-text-soft-400">
            <RiErrorWarningLine className="size-6" />
          </span>
          <h1 className="mt-4 text-title-h5 text-text-strong-950">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-2 text-paragraph-sm text-text-sub-600">
            Link yang kamu buka tidak dikenal. Periksa lagi alamatnya atau
            mulai sesi baru.
          </p>
          <Button className="mt-5" onClick={() => navigate('/')}>
            Kembali ke beranda
          </Button>
        </Card>
      </main>
    </div>
  )
}
