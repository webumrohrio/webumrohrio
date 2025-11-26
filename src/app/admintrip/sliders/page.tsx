'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Slider {
  id: string
  title: string
  description: string
  image: string
  link: string
  targetCity: string | null
  order: number
  isActive: boolean
  objectFit: string
}

function SortableRow({ slider, onEdit, onDelete }: { 
  slider: Slider
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slider.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b hover:bg-gray-50">
      <td className="p-3 text-center">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="p-3 text-center">{slider.order}</td>
      <td className="p-3">
        <div className="relative w-24 h-16 rounded overflow-hidden">
          <Image
            src={slider.image}
            alt={slider.title}
            fill
            className="object-cover"
            loading="lazy"
          />
        </div>
      </td>
      <td className="p-3">
        <div className="font-medium">{slider.title}</div>
        <div className="text-sm text-gray-500 line-clamp-1">{slider.description}</div>
      </td>
      <td className="p-3 text-center">
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          {slider.targetCity || 'Semua'}
        </span>
      </td>
      <td className="p-3 text-center">
        <span className="text-xs px-2 py-1 rounded-full capitalize bg-purple-100 text-purple-800">
          {slider.objectFit}
        </span>
      </td>
      <td className="p-3 text-center">
        {slider.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
            <Eye className="w-3 h-3" />
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
            <EyeOff className="w-3 h-3" />
            Nonaktif
          </span>
        )}
      </td>
      <td className="p-3">
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(slider.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(slider.id, slider.title)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function SlidersPage() {
  const router = useRouter()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [filteredSliders, setFilteredSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchSliders()
    fetchCities()
  }, [])

  useEffect(() => {
    filterSliders()
  }, [sliders, selectedCity])

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/sliders')
      const result = await response.json()
      
      if (result.success) {
        setSliders(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/settings?key=departureCities')
      const result = await response.json()
      
      if (result.success && result.data) {
        const citiesArray = result.data.value.split(',').map((c: string) => c.trim())
        setAvailableCities(citiesArray)
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const filterSliders = () => {
    if (selectedCity === 'all') {
      setFilteredSliders(sliders)
    } else {
      setFilteredSliders(sliders.filter(s => s.targetCity === selectedCity || s.targetCity === null))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = filteredSliders.findIndex((s) => s.id === active.id)
    const newIndex = filteredSliders.findIndex((s) => s.id === over.id)

    const newOrder = arrayMove(filteredSliders, oldIndex, newIndex)
    setFilteredSliders(newOrder)

    // Update order in database
    setSaving(true)
    try {
      const updates = newOrder.map((slider, index) => ({
        id: slider.id,
        order: index
      }))

      for (const update of updates) {
        await fetch(`/api/sliders/${update.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: update.order })
        })
      }

      // Refresh data
      await fetchSliders()
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Gagal menyimpan urutan slider')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus slider "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Slider berhasil dihapus!')
        fetchSliders()
      } else {
        alert('Gagal menghapus slider: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting slider:', error)
      alert('Terjadi kesalahan saat menghapus slider')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Slider</h1>
          <p className="text-gray-600">Kelola slider banner homepage</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => router.push('/admintrip/sliders/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Slider
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter Kota:</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kota</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {saving && (
            <span className="text-sm text-gray-500">Menyimpan urutan...</span>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-12"></th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-16">Urutan</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700 w-32">Gambar</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">Judul & Deskripsi</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-24">Kota</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-24">Mode</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-24">Status</th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700 w-32">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredSliders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Belum ada slider
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={filteredSliders.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredSliders.map((slider) => (
                      <SortableRow
                        key={slider.id}
                        slider={slider}
                        onEdit={(id) => router.push(`/admintrip/sliders/edit/${id}`)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </Card>

      <div className="text-sm text-gray-500">
        <p>💡 Tips: Drag baris menggunakan icon ⋮⋮ untuk mengubah urutan slider</p>
      </div>
    </div>
  )
}
