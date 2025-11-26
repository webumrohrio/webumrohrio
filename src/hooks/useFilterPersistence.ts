'use client'

import { useEffect, useCallback } from 'react'

interface FilterState {
  search: string
  category: string
  city: string
  minPrice: string
  maxPrice: string
  sortBy: string
  departureMonth?: string
  duration?: string
  scrollPosition?: number
}

const STORAGE_KEY = 'paket-umroh-filters'
const EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes in milliseconds

interface StoredFilterData {
  filters: FilterState
  timestamp: number
}

export function useFilterPersistence() {
  // Save filters to sessionStorage
  const saveFilters = useCallback((filters: FilterState) => {
    if (typeof window === 'undefined') return
    
    try {
      const data: StoredFilterData = {
        filters,
        timestamp: Date.now()
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving filters:', error)
    }
  }, [])

  // Load filters from sessionStorage
  const loadFilters = useCallback((): FilterState | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const data: StoredFilterData = JSON.parse(stored)
      
      // Check if data has expired (30 minutes)
      const now = Date.now()
      const isExpired = now - data.timestamp > EXPIRY_TIME
      
      if (isExpired) {
        sessionStorage.removeItem(STORAGE_KEY)
        return null
      }

      return data.filters
    } catch (error) {
      console.error('Error loading filters:', error)
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
  }, [])

  // Clear filters from sessionStorage
  const clearFilters = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing filters:', error)
    }
  }, [])

  // Save scroll position
  const saveScrollPosition = useCallback((position: number) => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: StoredFilterData = JSON.parse(stored)
        data.filters.scrollPosition = position
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Error saving scroll position:', error)
    }
  }, [])

  // Auto-clear expired filters on mount
  useEffect(() => {
    loadFilters() // This will auto-clear if expired
  }, [loadFilters])

  return {
    saveFilters,
    loadFilters,
    clearFilters,
    saveScrollPosition
  }
}
