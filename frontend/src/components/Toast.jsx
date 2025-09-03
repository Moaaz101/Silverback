import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 300) // Match the animation duration
  }

  const getToastStyles = () => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-lg shadow-lg border max-w-md"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
    }
  }

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0 mt-0.5" }
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
      case 'info':
      default:
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getToastStyles()}
      `}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-medium text-sm">{toast.title}</h4>
        )}
        <p className={`text-sm ${toast.title ? 'mt-1' : ''}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast
