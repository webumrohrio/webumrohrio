'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  disabled?: boolean
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const threshold = 80 // Distance to trigger refresh
  const maxPull = 120 // Maximum pull distance

  useEffect(() => {
    if (disabled) return

    const container = containerRef.current
    if (!container) return

    let touchStartY = 0
    let scrollTop = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return
      
      scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Only allow pull-to-refresh when at the top of the page
      if (scrollTop === 0) {
        touchStartY = e.touches[0].clientY
        setStartY(touchStartY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || touchStartY === 0) return

      const currentY = e.touches[0].clientY
      const diff = currentY - touchStartY

      // Only pull down, not up
      if (diff > 0 && scrollTop === 0) {
        // Prevent default scroll behavior
        e.preventDefault()
        
        // Apply resistance to pull
        const resistance = 0.5
        const distance = Math.min(diff * resistance, maxPull)
        setPullDistance(distance)
      }
    }

    const handleTouchEnd = async () => {
      if (isRefreshing) return

      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        setPullDistance(threshold)
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh failed:', error)
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
      
      setStartY(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, isRefreshing, onRefresh, disabled, threshold, maxPull])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-Refresh Indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-200"
        style={{
          transform: `translateY(${Math.max(pullDistance - 40, 0)}px)`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="bg-card border border-border rounded-full p-3 shadow-lg backdrop-blur-sm">
          <RefreshCw
            className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
