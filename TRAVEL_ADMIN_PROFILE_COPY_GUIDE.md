# 📋 Travel Admin Profile - Copy from AdminTrip Edit Guide

## Quick Solution

Karena halaman edit travel di admintrip sudah sangat lengkap dan sempurna, cara tercepat adalah:

### Step 1: Copy File
```bash
# Copy file edit travel dari admintrip
cp src/app/admintrip/travels/edit/[id]/page.tsx src/app/travel-admin/profile/page.tsx
```

### Step 2: Modifikasi untuk Travel Admin

Buka file `src/app/travel-admin/profile/page.tsx` dan lakukan perubahan berikut:

#### A. Hapus useParams (tidak perlu ID dari URL)
```typescript
// HAPUS ini:
const params = useParams()

// HAPUS di useEffect:
// useEffect(() => {
//   fetchTravelData()
//   fetchCities()
// }, [params.id])

// GANTI dengan:
useEffect(() => {
  const session = localStorage.getItem('travelAdminSession')
  if (!session) {
    router.push('/travel-admin/login')
    return
  }
  
  const parsed = JSON.parse(session)
  fetchTravelData(parsed.username)
  fetchCities()
}, [])
```

#### B. Update fetchTravelData function
```typescript
// GANTI:
const fetchTravelData = async () => {
  try {
    const response = await fetch(`/api/travels/id/${params.id}`)
    // ...
  }
}

// DENGAN:
const fetchTravelData = async (username: string) => {
  try {
    const response = await fetch(`/api/travel-admin/profile?username=${username}`)
    const result = await response.json()
    
    if (result.success && result.data) {
      const travel = result.data
      // Set form data sama seperti sebelumnya
      setFormData({
        username: travel.username || '',
        name: travel.name || '',
        // ... dst
      })
      setOriginalUsername(travel.username || '')
      // ... dst
    }
  } catch (error) {
    console.error('Failed to fetch travel:', error)
  } finally {
    setFetching(false)
  }
}
```

#### C. Update handleSubmit function
```typescript
// GANTI:
const response = await fetch(`/api/travels/id/${params.id}`, {
  method: 'PUT',
  // ...
})

// DENGAN:
const response = await fetch('/api/travel-admin/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: originalUsername, // Use original username to find travel
    ...dataToSend
  })
})
```

#### D. Update Back Button
```typescript
// GANTI:
onClick={() => router.push('/admintrip/travels')}

// DENGAN:
onClick={() => router.push('/travel-admin')}
```

#### E. Update Success Redirect
```typescript
// GANTI:
router.push('/admintrip/travels')

// DENGAN:
router.push('/travel-admin')
// atau tetap di halaman profile
```

### Step 3: Test

1. Login sebagai travel admin
2. Buka `/travel-admin/profile`
3. Edit semua field
4. Upload images
5. Save dan verify

## Alternative: Manual Command

Jika Anda ingin saya yang melakukan copy dan modifikasi, jalankan command berikut di terminal:

```bash
# 1. Copy file
cp src/app/admintrip/travels/edit/[id]/page.tsx src/app/travel-admin/profile/page.tsx

# 2. Kemudian saya akan modifikasi file tersebut
```

## What You Get

Dengan mengcopy dari admintrip edit page, Anda akan mendapatkan:

✅ Form lengkap dengan semua field
✅ Upload logo, cover, dan gallery
✅ Username availability check
✅ Password reset functionality
✅ License management
✅ Facilities management
✅ Services management
✅ Legal documents management
✅ Gallery with captions
✅ Validation lengkap
✅ Loading states
✅ Error handling
✅ Responsive design

## Files Needed

Pastikan file-file ini sudah ada:
- ✅ `/api/travel-admin/profile` (GET & PUT) - Sudah ada
- ✅ `/api/upload/logo` - Sudah ada
- ✅ `/api/travels/check-username` - Sudah ada
- ✅ LocationSelector component - Sudah ada

## Next Steps

Pilih salah satu:
1. **Saya copy manual** - Anda copy file dan modifikasi sendiri (5-10 menit)
2. **Saya yang copy** - Saya jalankan command dan modifikasi (estimasi 10-15 menit)

Mana yang Anda pilih?
