import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])
  const timers = new Map<number, ReturnType<typeof setTimeout>>()

  function dismiss(id: number) {
    items.value = items.value.filter(item => item.id !== id)
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  }

  function push(message: string, tone: ToastTone = 'info', duration = 4000) {
    const id = nextId
    nextId += 1
    items.value = [...items.value, { id, message, tone }]
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    )
  }

  return {
    items,
    dismiss,
    push,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
    info: (message: string) => push(message, 'info'),
  }
})
