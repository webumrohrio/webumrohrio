'use client'

import { useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface CelebrationPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  emoji: string
  type: 'good' | 'great' | 'amazing' | 'perfect'
}

export function CelebrationPopup({
  isOpen,
  onClose,
  title,
  message,
  emoji,
  type
}: CelebrationPopupProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Confetti from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
        })
        
        // Confetti from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
        })
      }, 250)

      return () => {
        clearInterval(interval)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getGradient = () => {
    switch (type) {
      case 'good':
        return 'from-blue-500 via-cyan-500 to-teal-500'
      case 'great':
        return 'from-orange-500 via-red-500 to-pink-500'
      case 'amazing':
        return 'from-purple-500 via-pink-500 to-red-500'
      case 'perfect':
        return 'from-yellow-400 via-orange-500 to-red-500'
      default:
        return 'from-green-500 via-emerald-500 to-teal-500'
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`
        relative w-full max-w-md p-8 rounded-2xl shadow-2xl
        bg-gradient-to-br ${getGradient()}
        animate-in zoom-in-95 duration-500
        transform hover:scale-105 transition-transform
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="text-center space-y-4">
          {/* Emoji */}
          <div className="text-7xl animate-bounce">
            {emoji}
          </div>

          {/* Sparkles Icon */}
          <div className="flex justify-center">
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            {title}
          </h2>

          {/* Message */}
          <p className="text-lg text-white/90 font-medium">
            {message}
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="h-1 w-12 bg-white/50 rounded-full"></div>
            <div className="h-1 w-12 bg-white/70 rounded-full"></div>
            <div className="h-1 w-12 bg-white/50 rounded-full"></div>
          </div>

          {/* Motivational Text */}
          <p className="text-sm text-white/80 italic">
            Terus tingkatkan performa Anda! 🚀
          </p>
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white/30 animate-pulse pointer-events-none"></div>
      </div>
    </div>
  )
}
