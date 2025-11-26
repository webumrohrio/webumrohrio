# Cara Perhitungan "Paket Terbaru" di Beranda Admin Tripbaitullah

## Overview

Section "Paket Terbaru" di halaman http://localhost:3000/admintrip menampilkan **5 paket terbaru** yang dibuat di sistem.

## Alur Perhitungan

### 1. Request dari Frontend

**File: `src/app/admintrip/page.tsx`**
```typescript
const fetchRecentData = async () => {
  try {
    const [packagesRes, travelsRes] = await Promise.all([
      fetch('/api/packages?limit=5'),  // Ambil 5 paket terbaru
      fetch('/api/travels?limit=5')    // Ambil 5 travel terbaru
    ])

    const packagesData = await packagesRes.json()
    
    if (packagesData.success && packagesData.data) {
      setRecentPackages(packagesData.data)  // Simpan ke state
    }
  } catch (error) {
    console.error('Failed to fetch recent data:', error)
  }
}
```

### 2. API Endpoint

**Endpoint:** `GET /api/packages?limit=5`

**File: `src/app/api/packages/route.ts`**

API ini melakukan beberapa langkah:

#### Step 1: Query Database
```typescript
const packages = await db.package.findMany({
  where: {
    isActive: true,  // Hanya paket aktif
    travel: {
      isActive: true  // Dari travel yang aktif
    }
  },
  include: {
    travel: {
      select: {
        id: true,
        name: true,
        rating: true,
        logo: true,
        username: true,
        isVerified: true,
        isActive: true,
        phone: true
      }
    }
  },
  take: 5  // Ambil 5 paket
})
```

#### Step 2: Tambahkan Favorite Count
```typescript
// Hitung jumlah favorite untuk setiap paket
const favoriteCounts = await db.favorite.groupBy({
  by: ['packageId'],
  where: { packageId: { in: packageIds } },
  _count: { packageId: true }
})

// Tambahkan ke data paket
const packagesWithFavorites = packages.map(pkg => ({
  ...pkg,
  favoriteCount: favoriteCountMap.get(pkg.id) || 0
}))
```

#### Step 3: Sorting dengan Prioritas

Paket diurutkan dengan **3 tingkat prioritas**:

```typescript
const sortedPackages = [...packagesWithFavorites].sort((a, b) => {
  // PRIORITAS 1: Paket yang di-PIN selalu di atas
  if (a.isPinned && !b.isPinned) return -1
  if (!a.isPinned && b.isPinned) return 1
  if (a.isPinned && b.isPinned) {
    // Jika sama-sama di-pin, yang lebih dulu di-pin tampil duluan
    return new Date(a.pinnedAt) - new Date(b.pinnedAt)
  }

  // PRIORITAS 2: Travel Verified (jika setting enabled)
  if (verifiedPriority) {
    if (a.travel.isVerified && !b.travel.isVerified) return -1
    if (!a.travel.isVerified && b.travel.isVerified) return 1
  }

  // PRIORITAS 3: Algoritma Sorting
  if (algorithm === 'popular') {
    // Urutkan berdasarkan popularitas
    const scoreA = a.views + (a.favoriteCount * 2) + (a.bookingClicks * 3)
    const scoreB = b.views + (b.favoriteCount * 2) + (b.bookingClicks * 3)
    return scoreB - scoreA
  } else if (algorithm === 'random') {
    // Urutkan random (dengan seed harian)
    return Math.random() - 0.5
  } else { // 'newest' (default)
    // Urutkan berdasarkan tanggal dibuat (TERBARU DULUAN)
    return new Date(b.createdAt) - new Date(a.createdAt)
  }
})
```

#### Step 4: Ambil 5 Paket Pertama
```typescript
// Setelah sorting, ambil 5 paket pertama
const limitedPackages = sortedPackages.slice(0, 5)
```

## Logika "Terbaru"

### Default Algorithm: 'newest'

Secara default, sistem menggunakan algoritma **'newest'** yang mengurutkan berdasarkan:

```typescript
// Paket dengan createdAt lebih baru → tampil duluan
return new Date(b.createdAt) - new Date(a.createdAt)
```

**Contoh:**
- Paket A: dibuat 2024-01-15 10:00
- Paket B: dibuat 2024-01-15 11:00
- Paket C: dibuat 2024-01-15 09:00

**Urutan:** B → A → C (dari yang paling baru)

### Prioritas Khusus

Meskipun menggunakan algoritma 'newest', ada **2 prioritas yang lebih tinggi**:

#### 1. Paket yang Di-PIN
Paket dengan `isPinned = true` **SELALU tampil paling atas**, tidak peduli kapan dibuat.

```typescript
if (a.isPinned && !b.isPinned) return -1  // a di atas b
```

#### 2. Travel Verified (Opsional)
Jika setting `verifiedPriority` aktif, paket dari travel verified tampil lebih atas.

```typescript
if (verifiedPriority && a.travel.isVerified && !b.travel.isVerified) {
  return -1  // a di atas b
}
```

## Contoh Perhitungan Lengkap

Misalkan ada 10 paket di database:

| Paket | Created At | isPinned | Travel Verified |
|-------|-----------|----------|-----------------|
| A | 2024-01-15 10:00 | ❌ | ✅ |
| B | 2024-01-15 11:00 | ✅ | ❌ |
| C | 2024-01-15 09:00 | ❌ | ❌ |
| D | 2024-01-15 12:00 | ❌ | ✅ |
| E | 2024-01-15 08:00 | ✅ | ✅ |
| F | 2024-01-15 13:00 | ❌ | ❌ |
| G | 2024-01-15 07:00 | ❌ | ✅ |
| H | 2024-01-15 14:00 | ❌ | ❌ |
| I | 2024-01-15 06:00 | ❌ | ❌ |
| J | 2024-01-15 15:00 | ❌ | ✅ |

**Urutan Setelah Sorting (dengan verifiedPriority = true):**

1. **E** (Pin + Verified, pin paling lama)
2. **B** (Pin, pin lebih baru)
3. **J** (Verified, paling baru)
4. **D** (Verified)
5. **A** (Verified)
6. **G** (Verified, paling lama)
7. **H** (Non-verified, paling baru)
8. **F** (Non-verified)
9. **C** (Non-verified)
10. **I** (Non-verified, paling lama)

**5 Paket Terbaru yang Ditampilkan:** E, B, J, D, A

## Setting yang Mempengaruhi

### 1. Package Sort Algorithm
**Database:** Tabel `Settings`, key: `packageSortAlgorithm`

Nilai:
- `'newest'` (default) - Urutkan berdasarkan tanggal dibuat
- `'popular'` - Urutkan berdasarkan popularitas (views + favorites + bookings)
- `'random'` - Urutkan random dengan seed harian

### 2. Verified Priority
**Database:** Tabel `Settings`, key: `verifiedPriority`

Nilai:
- `'true'` (default) - Travel verified prioritas lebih tinggi
- `'false'` - Tidak ada prioritas khusus untuk verified

## Display di Dashboard

**File: `src/app/admintrip/page.tsx`**

```tsx
<Card className="p-6">
  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
    <Package className="w-5 h-5 text-primary" />
    Paket Terbaru
  </h3>
  <div className="space-y-3">
    {recentPackages.map((pkg) => (
      <div key={pkg.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{pkg.name}</p>
          <p className="text-xs text-gray-500">{pkg.travel.name}</p>
          <p className="text-xs text-primary font-semibold">
            Rp {pkg.price.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">
            {new Date(pkg.departureDate).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </p>
        </div>
      </div>
    ))}
  </div>
</Card>
```

## Informasi yang Ditampilkan

Untuk setiap paket terbaru, ditampilkan:
1. **Icon Paket** - Visual indicator
2. **Nama Paket** - Judul paket
3. **Nama Travel** - Penyedia paket
4. **Harga** - Format Rupiah
5. **Tanggal Keberangkatan** - Format singkat (contoh: "15 Jan")

## Refresh Data

Data "Paket Terbaru" di-refresh ketika:
1. **Halaman pertama kali dibuka** - `useEffect` dipanggil
2. **Filter periode diubah** - Meskipun tidak mempengaruhi "Paket Terbaru" secara langsung

## Perbedaan dengan Section Lain

| Section | Jumlah | Filter Periode | Sorting |
|---------|--------|----------------|---------|
| **Paket Terbaru** | 5 | ❌ Tidak | ✅ Pin → Verified → Newest |
| **Total Paket** | All | ✅ Ya | - |
| **Total Paket di Lihat** | All | ✅ Ya | - |

## Testing

Untuk test "Paket Terbaru":

1. **Buat paket baru** di admintrip atau travel-admin
2. **Refresh dashboard** admintrip
3. **Verifikasi** paket baru muncul di "Paket Terbaru"
4. **Cek urutan** sesuai dengan prioritas (Pin → Verified → Newest)

## Summary

**"Paket Terbaru"** = 5 paket yang diurutkan berdasarkan:
1. Paket yang di-PIN (paling atas)
2. Travel Verified (jika setting aktif)
3. Tanggal dibuat (terbaru duluan)

Tidak terpengaruh oleh filter periode di dashboard.
