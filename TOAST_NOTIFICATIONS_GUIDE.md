# Toast Notifications Implementation Guide

## Overview
Toast notifications telah diimplementasikan menggunakan library **Sonner** untuk memberikan feedback yang elegant kepada user.

## Installation
```bash
npm install sonner
```

## Setup

### 1. Toaster Component
File: `src/components/ui/toaster.tsx`

Component ini sudah ditambahkan ke root layout (`src/app/layout.tsx`) sehingga toast bisa dipanggil dari mana saja.

### 2. Import Toast
```typescript
import { toast } from 'sonner'
```

## Usage Examples

### Basic Toast
```typescript
// Success
toast.success('Paket berhasil ditambahkan ke favorit!')

// Error
toast.error('Gagal menambahkan ke favorit')

// Info
toast.info('Silakan login terlebih dahulu')

// Warning
toast.warning('Kuota paket hampir habis!')

// Default
toast('Notifikasi umum')
```

### Toast with Description
```typescript
toast.success('Berhasil!', {
  description: 'Paket umroh telah ditambahkan ke favorit Anda'
})
```

### Toast with Action Button
```typescript
toast('Paket ditambahkan ke favorit', {
  action: {
    label: 'Lihat',
    onClick: () => router.push('/favorit')
  }
})
```

### Toast with Duration
```typescript
toast.success('Berhasil!', {
  duration: 5000 // 5 seconds
})
```

### Promise Toast (for async operations)
```typescript
toast.promise(
  fetch('/api/favorites', { method: 'POST', body: JSON.stringify(data) }),
  {
    loading: 'Menambahkan ke favorit...',
    success: 'Berhasil ditambahkan!',
    error: 'Gagal menambahkan'
  }
)
```

## Implementation Examples

### 1. Favorite Toggle
```typescript
const handleToggleFavorite = async () => {
  const user = localStorage.getItem('currentUser')
  
  if (!user) {
    toast.info('Silakan login terlebih dahulu', {
      description: 'Anda perlu login untuk menambahkan favorit'
    })
    return
  }

  try {
    const response = await fetch('/api/favorites', {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, email: JSON.parse(user).email })
    })

    if (response.ok) {
      setIsFavorite(!isFavorite)
      toast.success(
        isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit!',
        {
          description: isFavorite 
            ? 'Paket telah dihapus dari daftar favorit' 
            : 'Paket berhasil ditambahkan ke favorit Anda'
        }
      )
    } else {
      toast.error('Gagal memproses permintaan')
    }
  } catch (error) {
    toast.error('Terjadi kesalahan', {
      description: 'Silakan coba lagi nanti'
    })
  }
}
```

### 2. Login/Register
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const result = await response.json()

    if (result.success) {
      toast.success('Login berhasil!', {
        description: `Selamat datang, ${result.data.name}`
      })
      router.push('/')
    } else {
      toast.error('Login gagal', {
        description: result.message || 'Email atau password salah'
      })
    }
  } catch (error) {
    toast.error('Terjadi kesalahan', {
      description: 'Silakan coba lagi nanti'
    })
  }
}
```

### 3. Booking/WhatsApp Click
```typescript
const handleBooking = async () => {
  // Track booking click
  await fetch(`/api/packages/${packageId}/booking-click`, {
    method: 'POST'
  })

  toast.success('Mengarahkan ke WhatsApp...', {
    description: 'Anda akan dihubungkan dengan travel'
  })

  // Open WhatsApp
  window.open(whatsappUrl, '_blank')
}
```

### 4. Copy to Clipboard
```typescript
const handleShare = () => {
  navigator.clipboard.writeText(window.location.href)
  toast.success('Link disalin!', {
    description: 'Link paket telah disalin ke clipboard'
  })
}
```

### 5. Form Submission
```typescript
const handleSubmit = async (data: FormData) => {
  const promise = fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  })

  toast.promise(promise, {
    loading: 'Mengirim data...',
    success: 'Data berhasil dikirim!',
    error: 'Gagal mengirim data'
  })
}
```

### 6. Delete Confirmation
```typescript
const handleDelete = async (id: string) => {
  toast('Yakin ingin menghapus?', {
    action: {
      label: 'Hapus',
      onClick: async () => {
        try {
          await fetch(`/api/packages/${id}`, { method: 'DELETE' })
          toast.success('Paket berhasil dihapus')
        } catch (error) {
          toast.error('Gagal menghapus paket')
        }
      }
    },
    cancel: {
      label: 'Batal',
      onClick: () => toast.dismiss()
    }
  })
}
```

## Best Practices

### 1. Use Appropriate Toast Types
- ✅ **Success**: Untuk operasi yang berhasil
- ❌ **Error**: Untuk error atau kegagalan
- ℹ️ **Info**: Untuk informasi umum
- ⚠️ **Warning**: Untuk peringatan

### 2. Provide Clear Messages
```typescript
// ❌ Bad
toast.error('Error')

// ✅ Good
toast.error('Gagal menambahkan ke favorit', {
  description: 'Silakan coba lagi atau hubungi admin'
})
```

### 3. Use Descriptions for Context
```typescript
toast.success('Berhasil!', {
  description: 'Paket umroh telah ditambahkan ke favorit Anda'
})
```

### 4. Add Actions When Relevant
```typescript
toast.success('Paket ditambahkan ke favorit', {
  action: {
    label: 'Lihat Favorit',
    onClick: () => router.push('/favorit')
  }
})
```

### 5. Handle Errors Gracefully
```typescript
try {
  // operation
  toast.success('Berhasil!')
} catch (error) {
  toast.error('Terjadi kesalahan', {
    description: error instanceof Error ? error.message : 'Silakan coba lagi'
  })
}
```

## Styling

Toast sudah dikonfigurasi dengan theme yang sesuai dengan aplikasi:
- Success: Green
- Error: Red (destructive)
- Warning: Orange
- Info: Blue
- Default: Card background

## Where to Use

### High Priority
1. ✅ Login/Logout
2. ✅ Register
3. ✅ Add/Remove Favorite
4. ✅ Booking/WhatsApp Click
5. ✅ Share/Copy Link
6. ✅ Form Submissions
7. ✅ Profile Updates
8. ✅ Password Changes

### Medium Priority
9. Location Selection
10. Filter Changes
11. Search Results
12. Data Refresh

### Low Priority
13. Navigation
14. View Counts
15. Minor UI Changes

## Configuration

Toast position dan behavior bisa dikonfigurasi di `src/components/ui/toaster.tsx`:

```typescript
<Sonner
  position="top-center"  // top-left, top-right, bottom-left, bottom-right, bottom-center
  toastOptions={{
    duration: 4000,  // default duration
    // ... other options
  }}
  richColors
  closeButton
/>
```

## Testing

Test toast notifications dengan:
1. Trigger action yang menggunakan toast
2. Verify toast muncul dengan message yang benar
3. Check toast type (success/error/info/warning)
4. Verify toast dismiss setelah duration
5. Test action buttons jika ada

## Troubleshooting

### Toast tidak muncul
- Pastikan `<Toaster />` ada di root layout
- Check import: `import { toast } from 'sonner'`
- Verify sonner terinstall: `npm list sonner`

### Toast styling tidak sesuai
- Check `toastOptions.classNames` di toaster.tsx
- Verify Tailwind classes
- Check dark mode compatibility

### Toast terlalu cepat hilang
- Adjust duration: `toast.success('Message', { duration: 5000 })`
- Atau set default duration di Toaster component

## Next Steps

Implementasikan toast di:
1. ✅ Package detail page (favorite, booking)
2. ✅ Login/Register pages
3. ✅ Profile edit page
4. ✅ Admin pages (CRUD operations)
5. ✅ Search/Filter actions

---

**Status**: ✅ Implemented and Ready to Use
**Library**: Sonner v1.x
**Documentation**: https://sonner.emilkowal.ski/
