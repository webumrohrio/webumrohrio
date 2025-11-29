'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  avatar: string | null
  lastActive: string | null
  createdAt: string
  updatedAt: string
  favoritesCount?: number
}

interface Admin {
  id: string
  username: string
  name: string
  email: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

interface TravelAdmin {
  id: string
  name: string
  email: string
  username: string
  password: string
  isPasswordHashed?: boolean
  logo?: string | null
  createdAt: string
  lastLogin: string | null
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'admins' | 'travelAdmins'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [travelAdmins, setTravelAdmins] = useState<TravelAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'terbaru' | 'online'>('terbaru')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showTravelPasswordModal, setShowTravelPasswordModal] = useState(false)
  const [selectedTravelAdmin, setSelectedTravelAdmin] = useState<TravelAdmin | null>(null)
  const [showPasswordInTable, setShowPasswordInTable] = useState<{[key: string]: boolean}>({})
  const [travelPasswordForm, setTravelPasswordForm] = useState('')
  
  // Admin form state
  const [adminForm, setAdminForm] = useState({
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'admin',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'admins') {
      fetchAdmins()
    } else {
      fetchTravelAdmins()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        // Fetch favorites count for each user
        const usersWithFavorites = await Promise.all(
          result.data.map(async (user: User) => {
            try {
              const favResponse = await fetch(`/api/favorites?email=${encodeURIComponent(user.email)}`)
              const favResult = await favResponse.json()
              return {
                ...user,
                favoritesCount: favResult.success ? favResult.data.length : 0
              }
            } catch {
              return { ...user, favoritesCount: 0 }
            }
          })
        )
        setUsers(usersWithFavorites)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admintrip/admins')
      const result = await response.json()
      
      if (result.success) {
        setAdmins(result.data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTravelAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admintrip/travel-admins')
      const result = await response.json()
      
      if (result.success) {
        setTravelAdmins(result.data)
      }
    } catch (error) {
      console.error('Error fetching travel admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = adminForm.id 
        ? `/api/admintrip/admins/${adminForm.id}` 
        : '/api/admintrip/admins'
      const method = adminForm.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      })

      const result = await response.json()

      if (result.success) {
        alert(adminForm.id ? 'Admin berhasil diupdate!' : 'Admin berhasil ditambahkan!')
        resetAdminForm()
        fetchAdmins()
      } else {
        alert('Gagal menyimpan admin: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      alert('Gagal menyimpan admin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    setAdminForm({
      id: admin.id,
      username: admin.username,
      password: '',
      name: admin.name,
      email: admin.email || '',
      role: admin.role,
      isActive: admin.isActive
    })
    setShowAdminForm(true)
  }

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Yakin ingin menghapus admin ini?')) return

    try {
      const response = await fetch(`/api/admintrip/admins/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Admin berhasil dihapus!')
        fetchAdmins()
      } else {
        alert('Gagal menghapus admin: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('Gagal menghapus admin')
    }
  }

  const resetAdminForm = () => {
    setAdminForm({
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'admin',
      isActive: true
    })
    setShowAdminForm(false)
  }

  const handleEditUserPassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setShowPasswordModal(true)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })

      const result = await response.json()

      if (result.success) {
        alert('Password berhasil diupdate!')
        setShowPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        alert('Gagal update password: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Gagal update password')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    const confirmMessage = `Apakah Anda yakin ingin menghapus user "${user.name}"?\n\nSemua data terkait akan dihapus:\n- Data favorit\n- Data profile\n- Riwayat aktivitas\n\nTindakan ini tidak dapat dibatalkan!`
    
    if (!confirm(confirmMessage)) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('User berhasil dihapus!')
        fetchUsers() // Refresh user list
      } else {
        alert('Gagal menghapus user: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Gagal menghapus user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetTravelPassword = (travelAdmin: TravelAdmin) => {
    setSelectedTravelAdmin(travelAdmin)
    setTravelPasswordForm('')
    setShowTravelPasswordModal(true)
  }

  const handleUpdateTravelPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTravelAdmin || !travelPasswordForm) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/admintrip/travel-admins/${selectedTravelAdmin.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: travelPasswordForm })
      })

      const result = await response.json()

      if (result.success) {
        alert('Password Travel Admin berhasil direset!')
        setShowTravelPasswordModal(false)
        setSelectedTravelAdmin(null)
        setTravelPasswordForm('')
        fetchTravelAdmins()
      } else {
        alert('Gagal reset password: ' + result.error)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Gagal reset password')
    } finally {
      setSubmitting(false)
    }
  }

  const togglePasswordVisibility = (travelId: string) => {
    setShowPasswordInTable(prev => ({
      ...prev,
      [travelId]: !prev[travelId]
    }))
  }

  const filteredAndSortedUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search))
    )
    .sort((a, b) => {
      if (sortBy === 'terbaru') {
        // Sort by createdAt descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        // Sort by online status (online first, then by lastActive)
        const aOnline = isUserOnline(a.lastActive)
        const bOnline = isUserOnline(b.lastActive)
        
        if (aOnline && !bOnline) return -1
        if (!aOnline && bOnline) return 1
        
        // If both online or both offline, sort by lastActive
        const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0
        const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0
        return bTime - aTime
      }
    })

  // Pagination calculations
  const totalUsers = filteredAndSortedUsers.length
  const totalPages = Math.ceil(totalUsers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Belum pernah login'
    
    const now = new Date()
    const loginDate = new Date(lastLogin)
    const diffMinutes = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Baru saja'
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    
    return formatDate(lastLogin)
  }

  const isUserOnline = (lastActive: string | null) => {
    if (!lastActive) return false
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
    return diffMinutes < 7 // Online if active within last 7 minutes (5 min interval + 2 min buffer)
  }

  const formatLastActive = (lastActive: string | null) => {
    if (!lastActive) return 'Belum pernah aktif'
    
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Baru saja'
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    
    return formatDate(lastActive)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Akun</h1>
          <p className="text-gray-600">Kelola akun pengguna dan administrator</p>
        </div>
        {activeTab === 'admins' && (
          <Button onClick={() => setShowAdminForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Admin
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <UsersIcon className="w-5 h-5 inline-block mr-2" />
            Pengguna Umum
          </button>
          <button
            onClick={() => setActiveTab('travelAdmins')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'travelAdmins'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <UsersIcon className="w-5 h-5 inline-block mr-2" />
            Admin Travel
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'admins'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Shield className="w-5 h-5 inline-block mr-2" />
            Super Admin
          </button>
        </nav>
      </div>

      {/* Search and Sort */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'users' && (
            <div className="w-48">
              <Select value={sortBy} onValueChange={(value: 'terbaru' | 'online') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terbaru">Terbaru</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Admin Form Modal */}
      {showAdminForm && activeTab === 'admins' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {adminForm.id ? 'Edit Admin' : 'Tambah Admin Baru'}
            </h2>
            <Button variant="outline" onClick={resetAdminForm}>
              Batal
            </Button>
          </div>
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                  required
                  disabled={!!adminForm.id}
                />
              </div>
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password {adminForm.id && '(Kosongkan jika tidak diubah)'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  required={!adminForm.id}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={adminForm.role} 
                  onValueChange={(value) => setAdminForm({...adminForm, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select 
                  value={adminForm.isActive ? 'true' : 'false'} 
                  onValueChange={(value) => setAdminForm({...adminForm, isActive: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : adminForm.id ? 'Update Admin' : 'Tambah Admin'}
            </Button>
          </form>
        </Card>
      )}

      {/* Password Edit Modal */}
      {showPasswordModal && selectedUser && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Edit Password User</h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordModal(false)
                setSelectedUser(null)
                setNewPassword('')
              }}
            >
              Batal
            </Button>
          </div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {selectedUser.avatar ? (
                <Image
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Password Baru *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <div className="relative">
                <UsersIcon className="w-6 h-6 text-green-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sedang Online</p>
              <p className="text-2xl font-bold">
                {users.filter(u => isUserOnline(u.lastActive)).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Terverifikasi</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pengguna Baru (Bulan Ini)</p>
              <p className="text-2xl font-bold">
                {users.filter(u => {
                  const userDate = new Date(u.createdAt)
                  const now = new Date()
                  return userDate.getMonth() === now.getMonth() && 
                         userDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Travel Admin Password Reset Modal */}
      {showTravelPasswordModal && selectedTravelAdmin && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reset Password Travel Admin</h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTravelPasswordModal(false)
                setSelectedTravelAdmin(null)
                setTravelPasswordForm('')
              }}
            >
              Batal
            </Button>
          </div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-semibold">
                  {selectedTravelAdmin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedTravelAdmin.name}</p>
                <p className="text-sm text-gray-600">{selectedTravelAdmin.email}</p>
                <p className="text-xs text-gray-500">Username: {selectedTravelAdmin.username}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdateTravelPassword} className="space-y-4">
            <div>
              <Label htmlFor="travelPassword">Password Baru *</Label>
              <Input
                id="travelPassword"
                type="password"
                value={travelPasswordForm}
                onChange={(e) => setTravelPasswordForm(e.target.value)}
                placeholder="Masukkan password baru"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Reset Password'}
            </Button>
          </form>
        </Card>
      )}

      {/* Content based on active tab */}
      {activeTab === 'users' ? (
        /* Users Table */
        loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data pengguna...</p>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket Favorit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terdaftar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">{startIndex + index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isUserOnline(user.lastActive)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${
                              isUserOnline(user.lastActive) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            {isUserOnline(user.lastActive) ? 'Online' : 'Offline'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatLastActive(user.lastActive)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full">
                            {user.favoritesCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUserPassword(user)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Password
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Tidak ada pengguna
                      </h3>
                      <p className="text-gray-600">
                        {search ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Belum ada pengguna yang terdaftar'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, totalUsers)}</span> dari <span className="font-medium">{totalUsers}</span> pengguna
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>
                    }
                    return null
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </Card>
        )
      ) : activeTab === 'travelAdmins' ? (
        /* Travel Admins Table */
        loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data admin travel...</p>
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Travel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Daftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {travelAdmins.length > 0 ? (
                    travelAdmins.map((travelAdmin, index) => (
                      <tr key={travelAdmin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {travelAdmin.logo ? (
                                <Image
                                  src={travelAdmin.logo}
                                  alt={travelAdmin.name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {travelAdmin.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {travelAdmin.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {travelAdmin.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {travelAdmin.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {travelAdmin.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {travelAdmin.isPasswordHashed ? (
                              <span className="text-sm text-gray-500 italic">
                                (Terenkripsi)
                              </span>
                            ) : (
                              <>
                                <span className="text-sm font-mono text-gray-900">
                                  {showPasswordInTable[travelAdmin.id] ? travelAdmin.password : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(travelAdmin.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {showPasswordInTable[travelAdmin.id] ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(travelAdmin.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatLastLogin(travelAdmin.lastLogin)}
                          </div>
                          {travelAdmin.lastLogin && (
                            <div className="text-xs text-gray-500">
                              {new Date(travelAdmin.lastLogin).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetTravelPassword(travelAdmin)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Reset Password
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Tidak ada admin travel
                        </h3>
                        <p className="text-gray-600">
                          Belum ada travel yang terdaftar di sistem
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* Admins Table */
        loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data admin...</p>
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins.length > 0 ? (
                    admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {admin.email || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{admin.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.role === 'superadmin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatLastLogin(admin.lastLogin)}
                          </div>
                          {admin.lastLogin && (
                            <div className="text-xs text-gray-500">
                              {new Date(admin.lastLogin).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAdmin(admin.id)}
                              disabled={admins.length <= 1}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Tidak ada admin
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Belum ada admin yang terdaftar
                        </p>
                        <Button onClick={() => setShowAdminForm(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Admin Pertama
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}
    </div>
  )
}
