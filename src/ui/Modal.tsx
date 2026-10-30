import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { RiCloseLine } from '@remixicon/react'
import { cn } from './cn'

const sizeClasses = {
  sm: 'sm:w-[min(92vw,28rem)]',
  md: 'sm:w-[min(92vw,32rem)]',
  lg: 'sm:w-[min(92vw,42rem)]',
} as const

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: keyof typeof sizeClasses
  children: ReactNode
  footer?: ReactNode
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-strong-950/40 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'modal-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-md outline-none',
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-16',
            sizeClasses[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-stroke-soft-200 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-title-h6 text-text-strong-950">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-paragraph-sm text-text-sub-600">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">
                  {title}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Tutup"
                className="-mr-1 -mt-1 flex size-9 items-center justify-center rounded-full text-text-soft-400 transition hover:bg-bg-weak-50 hover:text-text-strong-950"
              >
                <RiCloseLine className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {footer && (
            <div className="flex justify-end gap-2 border-t border-stroke-soft-200 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
