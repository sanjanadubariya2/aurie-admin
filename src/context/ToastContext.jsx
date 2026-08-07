import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toaster from '../components/ui/Toaster.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((l) => l.filter((t) => t.id !== id)), [])

  const toast = useCallback(
    (message, tone = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((l) => [...l, { id, message, tone }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
