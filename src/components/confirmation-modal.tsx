'use client'

import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'danger' | 'info'
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'warning'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-100',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      button: 'bg-red-500 hover:bg-red-600'
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <AlertTriangle className={`w-8 h-8 ${styles.icon}`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed whitespace-pre-line">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 h-11 text-white ${styles.button}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
