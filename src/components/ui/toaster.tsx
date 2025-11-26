'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'bg-card text-card-foreground border-border shadow-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'bg-destructive text-destructive-foreground border-destructive',
          success: 'bg-green-500 text-white border-green-600',
          warning: 'bg-orange-500 text-white border-orange-600',
          info: 'bg-blue-500 text-white border-blue-600',
        },
      }}
      richColors
      closeButton
    />
  )
}
