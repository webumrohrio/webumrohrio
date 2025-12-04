'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plane } from 'lucide-react'

interface LocationSelectorProps {
  onLocationSelect: (location: string) => void
  currentLocation?: string
  hideBadge?: boolean // Hide the location badge (but still show popup if no location selected)
}

export function LocationSelector({ onLocationSelect, currentLocation, hideBadge = false }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || '')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchAvailableCities()
    
    // Check if location is already set (only on client side)
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('preferredLocation')
      if (!savedLocation && !currentLocation) {
        // Show modal immediately if no location is set
        setIsOpen(true)
      } else if (savedLocation) {
        setSelectedLocation(savedLocation)
      }
    }
  }, [currentLocation])

  const fetchAvailableCities = async () => {
    try {
      // Fetch cities from settings
      const settingsResponse = await fetch('/api/settings?key=departureCities')
      const settingsResult = await settingsResponse.json()
      
      let citiesFromSettings: string[] = []
      if (settingsResult.success && settingsResult.data) {
        citiesFromSettings = settingsResult.data.value.split(',').map((c: string) => c.trim())
      }

      // Fetch all travels to get cities that have data
      const travelsResponse = await fetch('/api/travels')
      const travelsResult = await travelsResponse.json()
      
      if (travelsResult.success && travelsResult.data) {
        // Get unique cities from travels
        const citiesWithData = new Set<string>()
        travelsResult.data.forEach((travel: any) => {
          if (travel.city) {
            citiesWithData.add(travel.city)
          }
        })

        // Filter cities from settings that have travel data
        const filteredCities = citiesFromSettings.filter(city => 
          citiesWithData.has(city)
        )

        setAvailableCities(filteredCities)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      // Fallback to default cities
      setAvailableCities(['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location)
    
    // Auto-save and close when location is selected
    if (location && typeof window !== 'undefined') {
      localStorage.setItem('preferredLocation', location)
      onLocationSelect(location)
      setIsOpen(false)
    }
  }

  // Don't render anything until mounted (avoid SSR issues)
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Location Badge - Only show if hideBadge is false */}
      {!hideBadge && selectedLocation && selectedLocation !== 'all' && (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 border-b border-primary/20">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Kota Keberangkatan dari <span className="font-bold">{selectedLocation}</span>
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="text-xs text-primary hover:underline ml-2"
          >
            Ubah
          </button>
        </div>
      )}

      {/* Selection Modal - Cannot be closed until location is selected */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Only allow closing if location is already selected and saved
        if (typeof window !== 'undefined') {
          const savedLocation = localStorage.getItem('preferredLocation')
          if (!open && savedLocation) {
            setIsOpen(false)
          }
        }
      }}>
        <DialogContent 
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            // Prevent closing by clicking outside if no location is saved
            if (typeof window !== 'undefined') {
              const savedLocation = localStorage.getItem('preferredLocation')
              if (!savedLocation) {
                e.preventDefault()
              }
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing by ESC key if no location is saved
            if (typeof window !== 'undefined') {
              const savedLocation = localStorage.getItem('preferredLocation')
              if (!savedLocation) {
                e.preventDefault()
              }
            }
          }}
          showCloseButton={isMounted && typeof window !== 'undefined' ? !!localStorage.getItem('preferredLocation') : false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Pilih Kota Keberangkatan
            </DialogTitle>
            <DialogDescription>
              Pilih kota untuk melihat paket umroh yang berangkat dari lokasi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={selectedLocation} onValueChange={handleLocationChange} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Memuat kota..." : "Pilih kota..."} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.length > 0 ? (
                  availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Tidak ada kota tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <p className="text-xs text-center text-muted-foreground">
              Anda dapat mengubah lokasi kapan saja
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
