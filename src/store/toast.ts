import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastStore {
  items: ToastItem[]
  push: (message: string, tone?: ToastTone, duration?: number) => void
  dismiss: (id: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

let nextId = 1
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export const useToastStore = create<ToastStore>((set, get) => ({
  items: [],

  push(message, tone = 'info', duration = 4000) {
    const id = nextId
    nextId += 1
    set(state => ({ items: [...state.items, { id, message, tone }] }))
    timers.set(
      id,
      setTimeout(() => get().dismiss(id), duration),
    )
  },

  dismiss(id) {
    set(state => ({ items: state.items.filter(item => item.id !== id) }))
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
  },

  success(message) {
    get().push(message, 'success')
  },

  error(message) {
    get().push(message, 'error')
  },

  info(message) {
    get().push(message, 'info')
  },
}))
