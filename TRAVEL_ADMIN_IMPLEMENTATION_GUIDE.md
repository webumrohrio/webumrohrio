# Travel Admin Implementation Guide - Step by Step

## ⚠️ IMPORTANT: Token Limit Reached
Karena implementasi ini sangat besar (20+ files), saya akan memberikan **implementation guide** yang bisa Anda ikuti step-by-step atau minta saya implement per-phase.

---

## 📋 **Implementation Checklist**

### ✅ **Phase 1: COMPLETED**
- [x] Migration script (`scripts/set-default-travel-password.js`)
- [x] Login API (`src/app/api/travel-admin/login/route.ts`)
- [x] Change Password API (`src/app/api/travel-admin/change-password/route.ts`)
- [x] Login Page updated (`src/app/travel-admin/login/page.tsx`)
- [x] Documentation (`TRAVEL_ADMIN_ACCOUNT_SYSTEM.md`)

### 🔄 **Phase 2: Super Admin - Create/Edit Travel (NEXT)**

#### File 1: `src/app/admintrip/travels/create/page.tsx`
**Changes needed:**
```typescript
// Add these fields to the form:
const [username, setUsername] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

// Add to form JSX:
<div>
  <label>Username *</label>
  <Input 
    value={username}
    onChange={(e) => setUsername(e.target.value.toLowerCase())}
    required
  />
</div>

<div>
  <label>Email</label>
  <Input 
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

<div>
  <label>Password *</label>
  <Input 
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={6}
  />
  <p className="text-xs text-gray-500">Minimal 6 karakter</p>
</div>

// Update handleSubmit to include username, email, password
```

#### File 2: `src/app/admintrip/travels/edit/[id]/page.tsx`
**Changes needed:**
```typescript
// Add password reset section:
const [showPasswordReset, setShowPasswordReset] = useState(false)
const [newPassword, setNewPassword] = useState('')

// Add to JSX (after other fields):
<Card className="p-6">
  <h3 className="font-bold mb-4">Reset Password</h3>
  {!showPasswordReset ? (
    <Button onClick={() => setShowPasswordReset(true)}>
      Reset Password
    </Button>
  ) : (
    <div className="space-y-4">
      <Input
        type="password"
        placeholder="Password baru"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        minLength={6}
      />
      <div className="flex gap-2">
        <Button onClick={handleResetPassword}>Simpan Password Baru</Button>
        <Button variant="outline" onClick={() => {
          setShowPasswordReset(false)
          setNewPassword('')
        }}>Batal</Button>
      </div>
    </div>
  )}
</Card>

// Add handleResetPassword function
const handleResetPassword = async () => {
  // Call API to update password
}
```

#### File 3: `src/app/api/travels/route.ts`
**Rewrite completely to use Prisma:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - List travels
export async function GET(request: NextRequest) {
  try {
    const travels = await prisma.travel.findMany({
      include: {
        _count: {
          select: { packages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Remove password from response
    const travelsWithoutPassword = travels.map(({ password, ...travel }) => travel)
    
    return NextResponse.json({
      success: true,
      data: travelsWithoutPassword
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch travels' },
      { status: 500 }
    )
  }
}

// POST - Create travel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, name, ...otherData } = body
    
    // Validate required fields
    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Username, password, dan nama harus diisi' },
        { status: 400 }
      )
    }
    
    // Check username unique
    const existing = await prisma.travel.findUnique({
      where: { username: username.toLowerCase() }
    })
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create travel
    const travel = await prisma.travel.create({
      data: {
        username: username.toLowerCase(),
        email: email || null,
        password: hashedPassword,
        name,
        ...otherData
      }
    })
    
    // Remove password from response
    const { password: _, ...travelData } = travel
    
    return NextResponse.json({
      success: true,
      data: travelData,
      message: 'Travel berhasil dibuat'
    })
  } catch (error) {
    console.error('Create travel error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat travel' },
      { status: 500 }
    )
  }
}
```

#### File 4: `src/app/api/travels/id/[id]/route.ts`
**Add password update logic:**
```typescript
// In PUT/PATCH handler, add:
if (body.newPassword) {
  const hashedPassword = await bcrypt.hash(body.newPassword, 10)
  updateData.password = hashedPassword
}
```

---

### 🔄 **Phase 3: Travel Admin - Settings & Profile**

#### File 5: `src/app/travel-admin/settings/page.tsx`
**Create new file:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

export default function TravelAdminSettings() {
  const [travelData, setTravelData] = useState<any>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    if (session) {
      setTravelData(JSON.parse(session))
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/travel-admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelId: travelData.id,
          currentPassword,
          newPassword
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('Password berhasil diubah!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(result.error || 'Gagal mengubah password')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-gray-600">Kelola akun dan keamanan</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Ubah Password</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password Lama</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password Baru</label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
```

#### File 6: `src/app/travel-admin/layout.tsx`
**Add settings menu:**
```typescript
// Add to navigation:
<Link href="/travel-admin/settings">
  <Settings className="w-5 h-5" />
  Pengaturan
</Link>
```

---

### 🔄 **Phase 4: Security & Middleware**

#### File 7: `src/middleware.ts`
**Add travel admin protection:**
```typescript
// Add after admintrip protection:
if (pathname.startsWith('/travel-admin') && pathname !== '/travel-admin/login') {
  const travelSession = request.cookies.get('travelAdminSession')
  
  if (!travelSession) {
    return NextResponse.redirect(new URL('/travel-admin/login', request.url))
  }
}
```

---

## 🎯 **Quick Start Commands**

### 1. Run Migration Script
```bash
node scripts/set-default-travel-password.js
```

### 2. Test Login
1. Buka `http://localhost:3000/travel-admin/login`
2. Username: `alfattahtour` (atau username travel lain)
3. Password: `123456` (default password)

### 3. Test Change Password
1. Login sebagai travel admin
2. Buka `/travel-admin/settings`
3. Ubah password

---

## 📝 **Next Steps**

Karena token limit, saya sarankan:

**Option 1:** Saya implement per-phase
- Request: "Implement Phase 2" → Saya kerjakan File 1-4
- Request: "Implement Phase 3" → Saya kerjakan File 5-6
- Request: "Implement Phase 4" → Saya kerjakan File 7

**Option 2:** Anda implement manual
- Follow guide di atas
- Copy-paste code yang sudah saya berikan
- Test setiap phase

**Option 3:** Saya lanjutkan sekarang
- Saya implement semua file sekarang
- Mungkin perlu beberapa response karena banyak file

**Pilih mana?** 🚀
