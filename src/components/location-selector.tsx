'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin } from 'lucide-react'

interface LocationSelectorProps {
  onLocationSelect: (location: string) => void
  currentLocation?: string
}

export function LocationSelector({ onLocationSelect, currentLocation }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || '')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableCities()
    
    // Check if location is already set
    const savedLocation = localStorage.getItem('preferredLocation')
    if (!savedLocation && !currentLocation) {
      // Show modal on first visit after cities are loaded
      setTimeout(() => setIsOpen(true), 500)
    } else if (savedLocation) {
      setSelectedLocation(savedLocation)
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

  const handleSave = () => {
    if (selectedLocation) {
      localStorage.setItem('preferredLocation', selectedLocation)
      onLocationSelect(selectedLocation)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Location Badge - Always show */}
      {selectedLocation && selectedLocation !== 'all' && (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/10 border-b border-primary/20">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Menampilkan paket dari <span className="font-bold">{selectedLocation}</span>
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
        // Only allow closing if location is already selected
        if (!open && selectedLocation) {
          setIsOpen(false)
        }
      }}>
        <DialogContent 
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Pilih Lokasi Anda
            </DialogTitle>
            <DialogDescription>
              Pilih kota untuk melihat paket umroh yang berangkat dari lokasi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={loading}>
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

            <Button
              onClick={handleSave}
              disabled={!selectedLocation}
              className="w-full"
            >
              Simpan Lokasi
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Anda dapat mengubah lokasi kapan saja
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
