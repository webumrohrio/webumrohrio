# 🎯 Travel Admin Profile Page - Implementation Guide

## Status

✅ API Route Updated
⏳ Page Component (Perlu dibuat ulang karena file corrupt)

## What's Done

### 1. API Route Updated
File: `src/app/api/travel-admin/profile/route.ts`

**Changes:**
- ✅ GET method supports both `travelId` and `username` parameter
- ✅ PUT method supports both `travelId` and `username` parameter
- ✅ Returns package stats (packageUsed count)
- ✅ Handles JSON fields properly

**Usage:**
```typescript
// GET Profile
GET /api/travel-admin/profile?username=testes3

// UPDATE Profile
PUT /api/travel-admin/profile
Body: {
  username: "testes3",
  name: "New Name",
  email: "new@email.com",
  // ... other fields
}
```

## What Needs to Be Done

### Create Profile Page Component
File: `src/app/travel-admin/profile/page.tsx`

Karena file terlalu panjang dan ada masalah saat pembuatan, saya sarankan untuk:

**Option 1: Copy dari halaman detail travel publik**
1. Copy file `src/app/[username]/page.tsx`
2. Modifikasi untuk travel admin
3. Tambahkan edit mode
4. Tambahkan form inputs

**Option 2: Buat dari scratch dengan struktur sederhana**

Berikut struktur yang disarankan:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// ... imports

export default function TravelProfilePage() {
  // States
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  
  // Fetch profile
  useEffect(() => {
    const session = localStorage.getItem('travelAdminSession')
    const parsed = JSON.parse(session)
    fetchProfile(parsed.username)
  }, [])
  
  // Handlers
  const handleSave = async () => {
    // Upload images if changed
    // Update profile via API
  }
  
  // Render
  return (
    <div>
      {/* Header with Edit button */}
      {/* Cover Image */}
      {/* Logo & Basic Info */}
      {/* Contact Information */}
      {/* Account Status */}
    </div>
  )
}
```

## Quick Implementation Steps

1. **Buat file baru** `src/app/travel-admin/profile/page.tsx`

2. **Copy template dari** `src/app/[username]/page.tsx` untuk layout

3. **Tambahkan edit mode:**
   - State `editing` untuk toggle view/edit
   - Form inputs untuk semua field
   - Save & Cancel buttons

4. **Tambahkan image upload:**
   - Logo upload
   - Cover image upload
   - Preview before save

5. **Integrate dengan API:**
   - Fetch profile on load
   - Update profile on save

## Testing

```bash
# 1. Login sebagai travel admin
http://localhost:3000/travel-admin/login

# 2. Buka profile page
http://localhost:3000/travel-admin/profile

# 3. Test edit mode
- Klik "Edit Profile"
- Ubah beberapa field
- Upload logo/cover baru
- Klik "Save"
- Verify data tersimpan

# 4. Test cancel
- Klik "Edit Profile"
- Ubah field
- Klik "Cancel"
- Verify data tidak berubah
```

## Alternative: Simpler Approach

Jika tampilan seperti travel detail terlalu kompleks, buat versi sederhana:

```typescript
// Simple form-based profile page
<Card>
  <form>
    <Input label="Nama" value={name} />
    <Input label="Email" value={email} />
    <Textarea label="Deskripsi" value={description} />
    // ... other fields
    <Button>Save</Button>
  </form>
</Card>
```

## Next Steps

Pilih salah satu:
1. Saya buatkan versi sederhana (form-based)
2. Anda copy dari travel detail page dan modifikasi
3. Saya buatkan step-by-step dengan file terpisah

Mohon konfirmasi pilihan Anda!
