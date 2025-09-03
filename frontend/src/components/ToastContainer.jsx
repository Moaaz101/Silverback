import Toast from './Toast'
import { useToast } from '../contexts/ToastContext'

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()
  
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer


