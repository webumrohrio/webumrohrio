'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropModalProps {
  image: string
  onCropComplete: (croppedImage: Blob) => void
  onClose: () => void
}

export function ImageCropModal({ image, onCropComplete, onClose }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onCropChange = (crop: any) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas size to cropped size
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    // Convert to blob with quality adjustment for 500KB limit
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }

          // Check if blob is larger than 500KB
          if (blob.size > 500 * 1024) {
            // Reduce quality to meet 500KB limit
            let quality = 0.9
            const tryCompress = () => {
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Compression failed'))
                    return
                  }

                  if (compressedBlob.size <= 500 * 1024 || quality <= 0.1) {
                    resolve(compressedBlob)
                  } else {
                    quality -= 0.1
                    tryCompress()
                  }
                },
                'image/jpeg',
                quality
              )
            }
            tryCompress()
          } else {
            resolve(blob)
          }
        },
        'image/jpeg',
        0.95
      )
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      
      // Check final size
      if (croppedImage.size > 500 * 1024) {
        alert('⚠️ Ukuran foto masih terlalu besar. Coba zoom in lebih dekat.')
        setLoading(false)
        return
      }

      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Crop error:', error)
      alert('❌ Gagal memproses foto')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Crop Foto Profil</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative h-96 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4">
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4" />
                <span>Zoom</span>
              </div>
              <ZoomIn className="w-4 h-4" />
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            💡 Tips: Geser foto untuk memposisikan, gunakan slider untuk zoom. 
            Maksimal ukuran foto: 500KB
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Simpan Foto'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
