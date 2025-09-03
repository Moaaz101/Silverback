import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      duration: 5000, // 5 seconds default
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ 
      type: 'success', 
      message, 
      ...options 
    }),
    error: (message, options = {}) => addToast({ 
      type: 'error', 
      message, 
      duration: 7000, // Errors stay longer
      ...options 
    }),
    warning: (message, options = {}) => addToast({ 
      type: 'warning', 
      message, 
      duration: 6000,
      ...options 
    }),
    info: (message, options = {}) => addToast({ 
      type: 'info', 
      message, 
      ...options 
    }),
  }

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
