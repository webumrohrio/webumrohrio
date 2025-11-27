'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface BackupFile {
  filename: string
  size: number
  date: string
  type: 'database' | 'full'
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admintrip/backup')
      const result = await response.json()
      
      if (result.success) {
        // API now returns stats object, not array of backups
        // For now, set empty array since we don't store backups on serverless
        setBackups([])
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async (type: 'database' | 'full') => {
    if (type === 'full') {
      alert('Backup lengkap tidak tersedia di Vercel.\n\nGunakan "Backup Database" untuk export database saja.\n\nGambar sudah aman di Cloudinary.')
      return
    }

    if (!confirm('Download backup database sekarang?')) return

    setCreating(true)
    try {
      // Download database backup
      const response = await fetch('/api/admintrip/backup?action=export')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        alert('Backup berhasil di-download!')
      } else {
        alert('Gagal membuat backup')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Gagal membuat backup')
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async (filename: string) => {
    try {
      window.open(`/api/admintrip/backup/download?file=${filename}`, '_blank')
    } catch (error) {
      console.error('Error downloading backup:', error)
      alert('Gagal download backup')
    }
  }

  const handleRestore = async (filename: string) => {
    const confirmMessage = `PERINGATAN: Restore akan mengganti semua data saat ini dengan data dari backup.\n\nApakah Anda yakin ingin restore dari "${filename}"?\n\nTindakan ini tidak dapat dibatalkan!`
    
    if (!confirm(confirmMessage)) return

    setRestoring(filename)
    try {
      const response = await fetch('/api/admintrip/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })

      const result = await response.json()

      if (result.success) {
        alert('Restore berhasil! Halaman akan di-refresh.')
        window.location.reload()
      } else {
        alert('Gagal restore: ' + result.error)
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Gagal restore backup')
    } finally {
      setRestoring(null)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Hapus backup "${filename}"?`)) return

    setDeleting(filename)
    try {
      const response = await fetch(`/api/admintrip/backup?file=${filename}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Backup berhasil dihapus!')
        fetchBackups()
      } else {
        alert('Gagal menghapus backup: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
      alert('Gagal menghapus backup')
    } finally {
      setDeleting(null)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'sql') {
      alert('File tidak valid! Hanya file .sql yang diperbolehkan.')
      event.target.value = ''
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File terlalu besar! Maksimal 10MB.')
      event.target.value = ''
      return
    }

    if (!confirm(`PERINGATAN: Restore akan mengganti semua data database saat ini!\n\nFile: ${file.name}\n\nLanjutkan restore?`)) {
      event.target.value = ''
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admintrip/backup', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        alert('Database berhasil di-restore!\n\nHalaman akan di-refresh.')
        window.location.reload()
      } else {
        alert('Gagal restore: ' + result.error)
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Gagal restore backup')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      event.target.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Backup Data</h1>
        <p className="text-gray-600">Kelola backup database dan file sistem</p>
      </div>

      {/* Warning Alert */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-1">Penting!</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Backup database secara berkala untuk mencegah kehilangan data</li>
              <li>• Simpan file backup di lokasi yang aman</li>
              <li>• Restore akan mengganti semua data saat ini</li>
              <li>• Backup full termasuk database dan semua file upload</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Backup Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Buat atau Upload Backup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleCreateBackup('database')}
            disabled={creating}
            className="h-auto py-4 flex-col items-start"
          >
            {creating ? (
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
            ) : (
              <Database className="w-6 h-6 mb-2" />
            )}
            <span className="font-semibold">Backup Database</span>
            <span className="text-xs opacity-80">Hanya database (.db file)</span>
          </Button>

          <Button
            onClick={() => handleCreateBackup('full')}
            disabled={creating}
            variant="outline"
            className="h-auto py-4 flex-col items-start"
          >
            {creating ? (
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
            ) : (
              <HardDrive className="w-6 h-6 mb-2" />
            )}
            <span className="font-semibold">Backup Lengkap</span>
            <span className="text-xs opacity-80">Database + semua file upload</span>
          </Button>

          <div className="relative">
            <input
              type="file"
              id="backup-upload"
              accept=".sql"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('backup-upload')?.click()}
              disabled={uploading}
              variant="outline"
              className="h-auto py-4 flex-col items-start w-full border-dashed border-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="font-semibold">Restoring...</span>
                  {uploadProgress > 0 && (
                    <span className="text-xs opacity-80">{uploadProgress}%</span>
                  )}
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Restore Database</span>
                  <span className="text-xs opacity-80">Upload file .sql (max 10MB)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup List */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Daftar Backup</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Memuat daftar backup...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Belum ada backup
            </h3>
            <p className="text-gray-600 mb-4">
              Buat backup pertama Anda untuk mengamankan data
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ukuran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {backup.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.type === 'full' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {backup.type === 'full' ? 'Lengkap' : 'Database'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatFileSize(backup.size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(backup.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(backup.filename)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(backup.filename)}
                          disabled={restoring === backup.filename}
                        >
                          {restoring === backup.filename ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(backup.filename)}
                          disabled={deleting === backup.filename}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleting === backup.filename ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-800 mb-1">Tips Backup</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Lakukan backup sebelum update besar atau perubahan penting</li>
              <li>• Simpan minimal 3 backup terakhir</li>
              <li>• Download dan simpan backup di lokasi eksternal (cloud storage, hard drive)</li>
              <li>• Test restore secara berkala untuk memastikan backup berfungsi</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
