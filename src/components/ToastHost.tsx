import { useToastStore } from '../store/toast'
import { Toast } from './Toast'

export function ToastHost() {
  const items = useToastStore(state => state.items)
  const dismiss = useToastStore(state => state.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {items.map(item => (
        <Toast
          key={item.id}
          message={item.message}
          tone={item.tone}
          onClose={() => dismiss(item.id)}
        />
      ))}
    </div>
  )
}
