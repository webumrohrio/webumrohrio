'use client'

import { useState, useEffect, useCallback } from 'react'

interface Milestone {
  key: string
  title: string
  message: string
  emoji: string
  type: 'good' | 'great' | 'amazing' | 'perfect'
}

interface PackageStats {
  id: string
  name: string
  views: number
  bookingClicks: number
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<Milestone | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  // Load celebration enabled setting
  useEffect(() => {
    const checkEnabled = async () => {
      try {
        const response = await fetch('/api/settings?key=celebrationEnabled')
        const result = await response.json()
        if (result.success && result.data) {
          setIsEnabled(result.data.value !== 'false')
        }
      } catch (error) {
        console.error('Failed to check celebration setting:', error)
      }
    }
    checkEnabled()
  }, [])

  // Get achieved milestones from localStorage
  const getAchievedMilestones = useCallback((): Set<string> => {
    if (typeof window === 'undefined') return new Set()
    const stored = localStorage.getItem('celebrationMilestones')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  }, [])

  // Save achieved milestone
  const saveAchievedMilestone = useCallback((key: string) => {
    if (typeof window === 'undefined') return
    const achieved = getAchievedMilestones()
    achieved.add(key)
    localStorage.setItem('celebrationMilestones', JSON.stringify([...achieved]))
  }, [getAchievedMilestones])

  // Check package milestones
  const checkPackageMilestones = useCallback((packages: PackageStats[]) => {
    if (!isEnabled) return

    const achieved = getAchievedMilestones()

    for (const pkg of packages) {
      // Views milestones
      const viewMilestones = [
        { threshold: 10, key: `package_${pkg.id}_views_10`, title: '🎯 Bagus!', emoji: '🎯', type: 'good' as const },
        { threshold: 100, key: `package_${pkg.id}_views_100`, title: '🔥 Mantap!', emoji: '🔥', type: 'great' as const },
        { threshold: 500, key: `package_${pkg.id}_views_500`, title: '⭐ Luar Biasa!', emoji: '⭐', type: 'amazing' as const },
        { threshold: 1000, key: `package_${pkg.id}_views_1000`, title: '💎 Sempurna!', emoji: '💎', type: 'perfect' as const }
      ]

      for (const milestone of viewMilestones) {
        if (pkg.views >= milestone.threshold && !achieved.has(milestone.key)) {
          setCelebration({
            key: milestone.key,
            title: milestone.title,
            message: `${pkg.name} dilihat ${milestone.threshold} orang`,
            emoji: milestone.emoji,
            type: milestone.type
          })
          saveAchievedMilestone(milestone.key)
          return // Show one at a time
        }
      }

      // Booking milestones
      const bookingMilestones = [
        { threshold: 10, key: `package_${pkg.id}_booking_10`, title: '🎯 Bagus!', emoji: '🎯', type: 'good' as const },
        { threshold: 100, key: `package_${pkg.id}_booking_100`, title: '🔥 Mantap!', emoji: '🔥', type: 'great' as const },
        { threshold: 500, key: `package_${pkg.id}_booking_500`, title: '⭐ Luar Biasa!', emoji: '⭐', type: 'amazing' as const }
      ]

      for (const milestone of bookingMilestones) {
        if (pkg.bookingClicks >= milestone.threshold && !achieved.has(milestone.key)) {
          setCelebration({
            key: milestone.key,
            title: milestone.title,
            message: `${pkg.name} di-booking ${milestone.threshold} orang`,
            emoji: milestone.emoji,
            type: milestone.type
          })
          saveAchievedMilestone(milestone.key)
          return
        }
      }
    }
  }, [isEnabled, getAchievedMilestones, saveAchievedMilestone])

  // Check total milestones
  const checkTotalMilestones = useCallback((totalViews: number, totalBooking: number) => {
    if (!isEnabled) return

    const achieved = getAchievedMilestones()

    // Total views milestones
    const viewMilestones = [
      { threshold: 100, key: 'total_views_100', title: '🎯 Bagus!', message: 'Total dilihat mencapai 100 kali', emoji: '🎯', type: 'good' as const },
      { threshold: 500, key: 'total_views_500', title: '⭐ Luar Biasa!', message: 'Total dilihat mencapai 500 kali', emoji: '⭐', type: 'amazing' as const },
      { threshold: 1000, key: 'total_views_1000', title: '💎 Sempurna!', message: 'Total dilihat mencapai 1000 kali', emoji: '💎', type: 'perfect' as const }
    ]

    for (const milestone of viewMilestones) {
      if (totalViews >= milestone.threshold && !achieved.has(milestone.key)) {
        setCelebration({
          key: milestone.key,
          title: milestone.title,
          message: milestone.message,
          emoji: milestone.emoji,
          type: milestone.type
        })
        saveAchievedMilestone(milestone.key)
        return
      }
    }

    // Total booking milestones
    const bookingMilestones = [
      { threshold: 100, key: 'total_booking_100', title: '🎯 Bagus!', message: 'Total booking mencapai 100 kali', emoji: '🎯', type: 'good' as const },
      { threshold: 500, key: 'total_booking_500', title: '⭐ Luar Biasa!', message: 'Total booking mencapai 500 kali', emoji: '⭐', type: 'amazing' as const },
      { threshold: 1000, key: 'total_booking_1000', title: '💎 Sempurna!', message: 'Total booking mencapai 1000 kali', emoji: '💎', type: 'perfect' as const }
    ]

    for (const milestone of bookingMilestones) {
      if (totalBooking >= milestone.threshold && !achieved.has(milestone.key)) {
        setCelebration({
          key: milestone.key,
          title: milestone.title,
          message: milestone.message,
          emoji: milestone.emoji,
          type: milestone.type
        })
        saveAchievedMilestone(milestone.key)
        return
      }
    }
  }, [isEnabled, getAchievedMilestones, saveAchievedMilestone])

  // Reset all milestones
  const resetMilestones = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('celebrationMilestones')
  }, [])

  // Close celebration
  const closeCelebration = useCallback(() => {
    setCelebration(null)
  }, [])

  // Trigger test celebration
  const triggerTestCelebration = useCallback(() => {
    setCelebration({
      key: 'test',
      title: '🎉 Test Celebration!',
      message: 'Ini adalah preview popup perayaan',
      emoji: '🎉',
      type: 'amazing'
    })
  }, [])

  return {
    celebration,
    closeCelebration,
    checkPackageMilestones,
    checkTotalMilestones,
    resetMilestones,
    triggerTestCelebration,
    isEnabled
  }
}
