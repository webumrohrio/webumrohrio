'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Slider {
  id: string
  title: string
  description: string
  image: string
  link: string | null
  targetCity: string | null
  order: number
  isActive: boolean
  showOverlay: boolean
  objectFit: string
}

interface ImageDimensions {
  width: number
  height: number
}

export function ImageSlider() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({})

  useEffect(() => {
    fetchSliders()
  }, [])

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })

    // Auto-play functionality
    const interval = setInterval(() => {
      api.scrollNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [api])

  const fetchSliders = async () => {
    try {
      // Get preferred location from localStorage
      const savedLocation = localStorage.getItem('preferredLocation')
      const targetCity = savedLocation && savedLocation !== 'all' ? savedLocation : ''
      
      const response = await fetch(`/api/sliders?targetCity=${targetCity}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filter only active sliders
        const activeSliders = result.data.filter((s: Slider) => s.isActive)
        setSliders(activeSliders)
        
        // Load image dimensions for dynamic height
        activeSliders.forEach((slider: Slider) => {
          const img = new window.Image()
          img.onload = () => {
            setImageDimensions(prev => ({
              ...prev,
              [slider.id]: { width: img.naturalWidth, height: img.naturalHeight }
            }))
          }
          img.src = slider.image
        })
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSliderHeight = (sliderId: string) => {
    const dimensions = imageDimensions[sliderId]
    if (!dimensions) return 'auto'
    
    // Calculate aspect ratio
    const aspectRatio = dimensions.height / dimensions.width
    
    // Max heights for different breakpoints
    const maxHeights = {
      mobile: 300,    // max height for mobile
      tablet: 400,    // max height for tablet
      desktop: 500,   // max height for desktop
    }
    
    // Return responsive height based on aspect ratio
    // Using viewport width as base for calculation
    return {
      mobile: Math.min(aspectRatio * 100, maxHeights.mobile),
      tablet: Math.min(aspectRatio * 100, maxHeights.tablet),
      desktop: Math.min(aspectRatio * 100, maxHeights.desktop),
    }
  }

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {loading ? (
            <CarouselItem className="pl-0">
              <div className="relative w-full h-[180px] sm:h-[240px] md:h-[360px] bg-gray-200 animate-pulse" />
            </CarouselItem>
          ) : sliders.length === 0 ? (
            <CarouselItem className="pl-0">
              <div className="relative w-full h-[180px] sm:h-[240px] md:h-[360px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <p className="text-gray-500">Belum ada slider</p>
              </div>
            </CarouselItem>
          ) : (
            sliders.map((slider, index) => {
              const dimensions = imageDimensions[slider.id]
              const hasLoaded = !!dimensions
              
              return (
                <CarouselItem key={slider.id} className="pl-0">
                  <div 
                    className="relative w-full overflow-hidden cursor-pointer"
                    onClick={() => slider.link && window.open(slider.link, '_blank')}
                  >
                    {/* Main Image - Dynamic Height */}
                    {hasLoaded && dimensions ? (
                      <div className="relative w-full block" style={{ 
                        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
                        maxHeight: '500px'
                      }}>
                        {/* Blur Background - Only for contain mode */}
                        {slider.objectFit === 'contain' && (
                          <div className="absolute inset-0 -z-10">
                            <Image
                              src={slider.image}
                              alt=""
                              fill
                              className="object-cover scale-110 blur-2xl opacity-60"
                              priority={index === 0}
                              loading={index === 0 ? undefined : 'lazy'}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        
                        <Image
                          src={slider.image}
                          alt={slider.title}
                          width={dimensions.width}
                          height={dimensions.height}
                          className="w-full h-auto block"
                          style={{ 
                            objectFit: 'contain',
                            maxHeight: '500px'
                          }}
                          priority={index === 0}
                          loading={index === 0 ? undefined : 'lazy'}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                        />
                        
                        {/* Overlay gradient - Only show if enabled */}
                        {slider.showOverlay && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        )}
                        
                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-10">
                          <h2 className="text-base sm:text-lg md:text-2xl font-bold mb-0.5 md:mb-1 drop-shadow-lg">
                            {slider.title}
                          </h2>
                          {slider.description && (
                            <p className="text-xs sm:text-sm md:text-base text-white/90 drop-shadow-md">
                              {slider.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-[180px] sm:h-[240px] md:h-[360px]">
                        {/* Blur Background - Only for contain mode */}
                        {slider.objectFit === 'contain' && (
                          <div className="absolute inset-0">
                            <Image
                              src={slider.image}
                              alt=""
                              fill
                              className="object-cover scale-110 blur-2xl opacity-60"
                              priority={index === 0}
                              loading={index === 0 ? undefined : 'lazy'}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        
                        <Image
                          src={slider.image}
                          alt={slider.title}
                          fill
                          className={slider.objectFit === 'contain' ? 'object-contain' : 'object-cover'}
                          priority={index === 0}
                          loading={index === 0 ? undefined : 'lazy'}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                          style={{ objectFit: slider.objectFit as any }}
                        />
                        
                        {/* Overlay gradient - Only show if enabled */}
                        {slider.showOverlay && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        )}
                        
                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-10">
                          <h2 className="text-base sm:text-lg md:text-2xl font-bold mb-0.5 md:mb-1 drop-shadow-lg">
                            {slider.title}
                          </h2>
                          {slider.description && (
                            <p className="text-xs sm:text-sm md:text-base text-white/90 drop-shadow-md">
                              {slider.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              )
            })
          )}
        </CarouselContent>
      </Carousel>
      
      {/* Dots indicator */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              current === index + 1
                ? 'w-6 sm:w-8 bg-white shadow-md'
                : 'w-1 sm:w-1.5 bg-white/60 hover:bg-white/80'
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}