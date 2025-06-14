import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Toast from './Toast'
import type { ToastType } from './Toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])
  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration)
  }, [showToast])

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration)
  }, [showToast])

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration)
  }, [showToast])

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration)
  }, [showToast])

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
