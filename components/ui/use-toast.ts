// Adapted from https://ui.shadcn.com/docs/components/toast
import { useCallback, useState } from "react"

export interface ToastState {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback(
    ({ title, description, variant, duration = 5000 }: ToastState) => {
      setToasts((prev) => [...prev, { title, description, variant, duration }])
      
      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, duration)
    },
    []
  )

  return { toast, toasts }
} 