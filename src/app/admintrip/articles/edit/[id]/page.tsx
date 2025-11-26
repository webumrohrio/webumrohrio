'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

interface AdminProfile {
  id: string
  name: string
  email: string
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [image, setImage] = useState('')
  const [slug, setSlug] = useState('')
  const [tags, setTags] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchArticle()
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch('/api/admintrip/profile')
      const result = await response.json()
      if (result.success) {
        setAdminProfile(result.data)
      } else {
        alert('Gagal memuat profil admin')
        router.push('/admintrip/login')
      }
    } catch (error) {
      console.error('Failed to fetch admin profile:', error)
      router.push('/admintrip/login')
    }
  }

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${id}`)
      const result = await response.json()
      
      if (result.success) {
        const article = result.data
        setTitle(article.title)
        setContent(article.content || '')
        setExcerpt(article.excerpt || '')
        setImage(article.image || '')
        setSlug(article.slug)
        setTags(article.tags || '')
        setIsPublished(article.isPublished)
      } else {
        alert('Artikel tidak ditemukan')
        router.push('/admintrip/articles')
      }
    } catch (error) {
      console.error('Failed to fetch article:', error)
      alert('Gagal memuat artikel')
    } finally {
      setLoading(false)
    }
  }



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/article', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setImage(result.url)
        alert('Gambar berhasil diupload!')
      } else {
        alert('Gagal upload gambar: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Gagal upload gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          image,
          slug,
          tags,
          adminId: adminProfile?.id,
          isPublished
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Artikel berhasil diupdate!')
        router.push('/admintrip/articles')
      } else {
        alert('Gagal update artikel: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating article:', error)
      alert('Gagal update artikel')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat artikel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Artikel</h1>
          <p className="text-gray-600">Update informasi artikel</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Judul Artikel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul artikel"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL artikel: /artikel/{slug || 'slug-artikel'}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">Ringkasan Artikel</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Tulis ringkasan singkat artikel (akan ditampilkan di preview)"
            />
          </div>

          <div>
            <Label htmlFor="content">Konten Artikel *</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Tulis konten artikel lengkap di sini..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Gunakan toolbar di atas untuk memformat teks. Minimal 100 karakter.
            </p>
          </div>

          <div>
            <Label>Gambar Artikel</Label>
            <div className="space-y-3">
              {image && (
                <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Atau masukkan URL gambar (opsional)"
                  />
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Gambar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="umroh, tips, panduan, persiapan (pisahkan dengan koma)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tags membantu pengguna menemukan artikel Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Penulis</Label>
              <Input
                id="author"
                value={adminProfile?.name || 'Loading...'}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Artikel akan dipublikasikan atas nama Anda
              </p>
            </div>

            <div>
              <Label htmlFor="isPublished">Status Publikasi</Label>
              <Select 
                value={isPublished ? 'true' : 'false'} 
                onValueChange={(value) => setIsPublished(value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Publish (Tampilkan ke publik)</SelectItem>
                  <SelectItem value="false">Draft (Simpan sebagai draft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Update Artikel'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
