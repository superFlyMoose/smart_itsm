import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastState {
  toasts: ToastItem[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: number) => void
}

let seq = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message) => {
    const id = seq += 1
    set((state) => ({ toasts: [...state.toasts, { id, tone, message }] }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
    }, 3600)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
  info: (message: string) => useToastStore.getState().push('info', message),
}
