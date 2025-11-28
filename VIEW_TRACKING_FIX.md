# View Tracking Fix

## Masalah yang Ditemukan

### 1. View bertambah di halaman admin
View counter bertambah saat admin membuka halaman edit paket di `/admintrip/packages/edit/[id]`, padahal seharusnya view hanya bertambah saat user publik melihat halaman detail paket.

### 2. View tidak tercatat ke tabel tracking
Halaman detail paket publik (`/{username}/paket/{slug}`) menggunakan API `/api/packages?slug=xxx` yang hanya increment counter lama, tidak mencatat ke tabel `PackageView` yang baru untuk tracking berdasarkan periode.

## Penyebab
- API `/api/packages/[id]` otomatis menambah view counter setiap kali dipanggil
- API `/api/packages?slug=xxx` hanya increment counter tanpa logging ke tabel tracking
- Tidak ada mekanisme untuk membedakan request dari admin vs publik

## Solusi

### 1. Skip Tracking untuk Admin ✅
**File**: `src/app/api/packages/[id]/route.ts`

Menambahkan parameter `skipTracking=true` untuk request dari admin:

```typescript
const skipTracking = searchParams.get('skipTracking') === 'true'

if (!skipTracking) {
  // Track views with IP and user agent
  await Promise.all([
    db.package.update({ ... }),
    db.packageView.create({ ... })
  ])
}
```

**File**: `src/app/admintrip/packages/edit/[id]/page.tsx`

```typescript
const response = await fetch(`/api/packages/${params.id}?skipTracking=true`)
```

### 2. Tracking untuk Halaman Publik ✅
**File**: `src/app/api/packages/route.ts`

Update query by slug untuk mencatat ke tabel tracking:

```typescript
if (slug && limitedPackages.length > 0) {
  const packageId = limitedPackages[0].id
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  await Promise.all([
    db.package.update({ views: { increment: 1 } }),
    db.packageView.create({
      packageId,
      ipAddress,
      userAgent
    })
  ])
}
```

## Hasil
- ✅ View hanya bertambah di halaman publik: `/{username}/paket/{slug}`
- ✅ View tidak bertambah di halaman admin: `/admintrip/packages/edit/{id}`
- ✅ Setiap view tercatat dengan timestamp, IP, dan user agent
- ✅ Data statistik akurat berdasarkan periode (hari, minggu, bulan, tahun)
- ✅ Dashboard admin menampilkan data yang benar

## Testing
1. Buka halaman detail paket publik → view bertambah ✅
2. Buka halaman edit admin → view tidak bertambah ✅
3. Cek database `PackageView` → ada record baru ✅
4. Cek dashboard admin → statistik akurat ✅
