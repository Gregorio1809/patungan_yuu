import { RiDeleteBinLine } from '@remixicon/react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  pending?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Hapus',
  pending,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            variant="neutral"
            mode="stroke"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="error"
            disabled={pending}
            onClick={() => {
              void onConfirm()
            }}
          >
            <RiDeleteBinLine className="size-4" />
            {pending ? 'Memproses...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-paragraph-sm text-text-sub-600">
        Tindakan ini hanya berlaku di prototype dan tidak bisa dibatalkan.
      </p>
    </Modal>
  )
}
