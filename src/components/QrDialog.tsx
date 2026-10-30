import { useEffect, useState } from 'react'
import { RiCheckLine, RiFileCopyLine } from '@remixicon/react'
import { copyText } from '../lib/share'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface QrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
}

export function QrDialog({ open, onOpenChange, url }: QrDialogProps) {
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)
    setError('')
    setCopied(false)

    import('qrcode')
      .then(QRCode =>
        QRCode.toDataURL(url, {
          width: 280,
          margin: 2,
          color: { dark: '#171717', light: '#ffffff' },
        }),
      )
      .then(generated => {
        if (!cancelled) setDataUrl(generated)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Gagal membuat QR code. Link tetap bisa disalin.')
          setDataUrl('')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, url])

  async function copyLink() {
    const ok = await copyText(url)
    setCopied(ok)
    if (ok) {
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Bagikan via QR"
      description="Minta peserta memindai kode ini dengan kamera HP."
      size="sm"
      footer={
        <Button
          variant="neutral"
          mode="stroke"
          className="w-full"
          onClick={copyLink}
        >
          {copied ? (
            <RiCheckLine className="size-4" />
          ) : (
            <RiFileCopyLine className="size-4" />
          )}
          {copied ? 'Link tersalin' : 'Salin link'}
        </Button>
      }
    >
      <div className="flex flex-col items-center">
        <div className="flex min-h-64 w-full max-w-xs items-center justify-center rounded-12 border border-stroke-soft-200 bg-bg-white-0 p-4">
          {loading ? (
            <div className="size-56 animate-pulse rounded-10 bg-bg-weak-50" />
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="QR code untuk link patungan"
              className="h-auto w-full max-w-64"
            />
          ) : (
            <p className="text-paragraph-sm text-error-base">{error}</p>
          )}
        </div>
        <p className="mt-3 w-full break-all rounded-10 bg-bg-weak-50 px-3 py-2 text-center text-[11px] text-text-sub-600">
          {url}
        </p>
        <p className="mt-3 text-center text-[11px] text-text-soft-400">
          QR mengarah ke link sesi ini. Peserta bisa memindai untuk langsung
          bergabung.
        </p>
      </div>
    </Modal>
  )
}
