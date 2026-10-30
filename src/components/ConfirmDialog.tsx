import { RiDeleteBinLine } from '@remixicon/react'
import { useTranslation } from '../i18n/useTranslation'
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
  confirmLabel,
  pending,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation()

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
            {t('common.cancel')}
          </Button>
          <Button
            variant="error"
            disabled={pending}
            onClick={() => {
              void onConfirm()
            }}
          >
            <RiDeleteBinLine className="size-4" />
            {pending
              ? t('common.processing')
              : (confirmLabel ?? t('common.delete'))}
          </Button>
        </>
      }
    >
      <p className="text-paragraph-sm text-text-sub-600">
        {t('confirm.note')}
      </p>
    </Modal>
  )
}
