# Implementasi Fitur Algoritma Sorting Paket

## Overview
Fitur ini memungkinkan admin mengatur bagaimana paket umroh diurutkan di halaman user dengan 3 algoritma berbeda dan opsi prioritas verified.

## Status: ✅ SELESAI DIIMPLEMENTASI

## Database Settings

Tambahkan 2 settings key:
```javascript
// Key 1: packageSortAlgorithm
{
  key: "packageSortAlgorithm",
  value: "newest", // "popular" | "random" | "newest"
  description: "Algorithm for sorting packages on user pages"
}

// Key 2: verifiedPriority  
{
  key: "verifiedPriority",
  value: "true", // "true" | "false"
  description: "Prioritize verified travel packages"
}
```

## Implementasi yang Sudah Selesai

### 1. ✅ UI Settings Page (src/app/admintrip/settings/page.tsx)
- Tab "Algoritma" sudah ditambahkan dengan icon Zap
- State management untuk sortAlgorithm dan verifiedPriority
- Fetch dan save algorithm settings ke database
- UI dengan 3 pilihan algoritma (Popular, Random, Terbaru)
- Toggle untuk verified priority
- Info box yang menjelaskan urutan prioritas akhir

### 2. ✅ API Sorting Logic (src/app/api/packages/route.ts)
- Fetch settings dari database (packageSortAlgorithm dan verifiedPriority)
- Implementasi 3 algoritma sorting:
  - **Popular**: Score = Views + (Favorit × 2) + (Booking × 3)
  - **Random**: Menggunakan daily seed untuk konsistensi dalam 1 hari
  - **Newest**: Berdasarkan tanggal pembuatan paket
- Urutan prioritas: Pin > Verified (jika aktif) > Algoritma
- Favorite count dihitung sebelum sorting untuk algoritma popular

## UI Implementation (src/app/admintrip/settings/page.tsx)

### 1. Tambah Tab "Algoritma"
```typescript
type TabType = 'website' | 'cities' | 'whatsapp' | 'algorithm' | 'others'
```

### 2. State untuk Algorithm Settings
```typescript
const [sortAlgorithm, setSortAlgorithm] = useState('newest')
const [verifiedPriority, setVerifiedPriority] = useState(true)
const [loadingAlgorithm, setLoadingAlgorithm] = useState(false)
```

### 3. Fetch Algorithm Settings
```typescript
const fetchAlgorithmSettings = async () => {
  try {
    const [algoRes, priorityRes] = await Promise.all([
      fetch('/api/settings?key=packageSortAlgorithm'),
      fetch('/api/settings?key=verifiedPriority')
    ])
    
    const algoData = await algoRes.json()
    const priorityData = await priorityRes.json()
    
    if (algoData.success && algoData.data) {
      setSortAlgorithm(algoData.data.value)
    }
    if (priorityData.success && priorityData.data) {
      setVerifiedPriority(priorityData.data.value === 'true')
    }
  } catch (error) {
    console.error('Failed to fetch algorithm settings:', error)
  }
}
```

### 4. Save Algorithm Settings
```typescript
const saveAlgorithmSettings = async () => {
  setLoadingAlgorithm(true)
  try {
    await Promise.all([
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'packageSortAlgorithm',
          value: sortAlgorithm
        })
      }),
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'verifiedPriority',
          value: verifiedPriority.toString()
        })
      })
    ])
    alert('✅ Pengaturan algoritma berhasil disimpan!')
  } catch (error) {
    alert('❌ Gagal menyimpan pengaturan')
  } finally {
    setLoadingAlgorithm(false)
  }
}
```

### 5. UI Tab Content
```tsx
{activeTab === 'algorithm' && (
  <Card className="p-6">
    <h2 className="text-xl font-bold mb-6">Pengaturan Algoritma Sorting</h2>
    
    {/* Sort Algorithm Selection */}
    <div className="space-y-4 mb-6">
      <Label className="text-base font-semibold">Susunan Paket</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Pilih bagaimana paket umroh diurutkan di halaman user
      </p>
      
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="algorithm"
            value="popular"
            checked={sortAlgorithm === 'popular'}
            onChange={(e) => setSortAlgorithm(e.target.value)}
            className="mt-1"
          />
          <div>
            <div className="font-medium">Populer</div>
            <div className="text-sm text-muted-foreground">
              Urutkan berdasarkan paket yang paling banyak dilihat, difavoritkan, dan di-booking
            </div>
          </div>
        </label>
        
        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="algorithm"
            value="random"
            checked={sortAlgorithm === 'random'}
            onChange={(e) => setSortAlgorithm(e.target.value)}
            className="mt-1"
          />
          <div>
            <div className="font-medium">Random</div>
            <div className="text-sm text-muted-foreground">
              Susunan acak setiap refresh (berubah setiap hari)
            </div>
          </div>
        </label>
        
        <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="algorithm"
            value="newest"
            checked={sortAlgorithm === 'newest'}
            onChange={(e) => setSortAlgorithm(e.target.value)}
            className="mt-1"
          />
          <div>
            <div className="font-medium">Terbaru</div>
            <div className="text-sm text-muted-foreground">
              Urutkan berdasarkan paket yang baru diupload
            </div>
          </div>
        </label>
      </div>
    </div>
    
    {/* Verified Priority Toggle */}
    <div className="border-t pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Prioritas Travel Verified</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Paket dari travel verified akan selalu muncul lebih dulu
          </p>
        </div>
        <Switch
          checked={verifiedPriority}
          onCheckedChange={setVerifiedPriority}
        />
      </div>
    </div>
    
    {/* Save Button */}
    <div className="mt-6">
      <Button
        onClick={saveAlgorithmSettings}
        disabled={loadingAlgorithm}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        {loadingAlgorithm ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </Button>
    </div>
  </Card>
)}
```

## API Sorting Logic (src/app/api/packages/route.ts)

### 1. Fetch Settings
```typescript
// Fetch sorting settings
const [algoSetting, prioritySetting] = await Promise.all([
  db.setting.findUnique({ where: { key: 'packageSortAlgorithm' } }),
  db.setting.findUnique({ where: { key: 'verifiedPriority' } })
])

const algorithm = algoSetting?.value || 'newest'
const verifiedPriority = prioritySetting?.value !== 'false'
```

### 2. Implement Sorting Algorithms
```typescript
// Calculate popularity score
const getPopularityScore = (pkg: any) => {
  return (pkg.views || 0) + 
         (pkg.favoriteCount || 0) * 2 + 
         (pkg.bookingClicks || 0) * 3
}

// Random with daily seed
const getRandomWithSeed = () => {
  const today = new Date().toISOString().split('T')[0]
  const seed = today.split('-').reduce((a, b) => parseInt(a) + parseInt(b), 0)
  return Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
}

// Sort packages based on algorithm
let sortedPackages = [...packages]

// First: Apply pin priority (always first)
sortedPackages.sort((a, b) => {
  if (a.isPinned && !b.isPinned) return -1
  if (!a.isPinned && b.isPinned) return 1
  if (a.isPinned && b.isPinned) {
    const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
    const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
    return aTime - bTime
  }
  return 0
})

// Second: Apply verified priority if enabled
if (verifiedPriority) {
  sortedPackages.sort((a, b) => {
    if (a.isPinned || b.isPinned) return 0 // Don't change pinned order
    if (a.travel.isVerified && !b.travel.isVerified) return -1
    if (!a.travel.isVerified && b.travel.isVerified) return 1
    return 0
  })
}

// Third: Apply selected algorithm
if (algorithm === 'popular') {
  sortedPackages.sort((a, b) => {
    if (a.isPinned || b.isPinned) return 0
    if (verifiedPriority && a.travel.isVerified !== b.travel.isVerified) return 0
    return getPopularityScore(b) - getPopularityScore(a)
  })
} else if (algorithm === 'random') {
  const seed = getRandomWithSeed()
  sortedPackages.sort((a, b) => {
    if (a.isPinned || b.isPinned) return 0
    if (verifiedPriority && a.travel.isVerified !== b.travel.isVerified) return 0
    return Math.sin(seed + a.id.charCodeAt(0)) - Math.sin(seed + b.id.charCodeAt(0))
  })
} else { // newest
  sortedPackages.sort((a, b) => {
    if (a.isPinned || b.isPinned) return 0
    if (verifiedPriority && a.travel.isVerified !== b.travel.isVerified) return 0
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
```

## Testing Checklist

- [x] Tab Algoritma muncul di settings
- [x] Radio buttons berfungsi
- [x] Toggle verified priority berfungsi
- [x] Save settings berhasil
- [ ] Algoritma Popular: Paket dengan views/favorit/booking tinggi muncul duluan (perlu testing manual)
- [ ] Algoritma Random: Urutan berubah setiap hari (perlu testing manual)
- [ ] Algoritma Terbaru: Paket baru muncul duluan (perlu testing manual)
- [ ] Verified priority: Travel verified selalu di atas (jika aktif) (perlu testing manual)
- [ ] Pin priority: Paket yang di-pin selalu paling atas (perlu testing manual)
- [ ] Kombinasi semua prioritas bekerja dengan benar (perlu testing manual)

## Cara Testing

1. **Akses Settings Page**
   - Login sebagai admin di `/admintrip/login`
   - Buka `/admintrip/settings`
   - Klik tab "Algoritma"

2. **Test Algoritma Popular**
   - Pilih radio button "Populer"
   - Klik "Simpan Pengaturan Algoritma"
   - Buka halaman `/paket-umroh`
   - Verifikasi paket dengan views/favorit/booking tinggi muncul duluan

3. **Test Algoritma Random**
   - Pilih radio button "Random"
   - Klik "Simpan Pengaturan Algoritma"
   - Buka halaman `/paket-umroh` beberapa kali
   - Verifikasi urutan konsisten dalam 1 hari
   - Tunggu besok dan cek lagi, urutan harus berubah

4. **Test Algoritma Terbaru**
   - Pilih radio button "Terbaru"
   - Klik "Simpan Pengaturan Algoritma"
   - Buka halaman `/paket-umroh`
   - Verifikasi paket terbaru muncul duluan

5. **Test Verified Priority**
   - Toggle "Prioritas Travel Verified" ON
   - Klik "Simpan Pengaturan Algoritma"
   - Buka halaman `/paket-umroh`
   - Verifikasi paket dari travel verified muncul duluan

6. **Test Pin Priority**
   - Pin beberapa paket di halaman admin
   - Buka halaman `/paket-umroh`
   - Verifikasi paket yang di-pin selalu paling atas

## Priority Order (Final)

1. **Pinned packages** (oldest pin first)
2. **Verified travel** (if enabled)
3. **Selected algorithm** (popular/random/newest)

## Notes

- Random algorithm menggunakan seed harian agar konsisten dalam 1 hari
- Popularity score: views + (favorites × 2) + (bookings × 3)
- Settings disimpan di database table Settings (bukan Setting)
- Perubahan settings langsung berlaku tanpa restart server
- Type assertion (`any`) digunakan untuk menghindari TypeScript error sementara
- Prisma client mungkin perlu di-generate ulang jika ada error: `npx prisma generate`

## Troubleshooting

### Error: Property 'setting' does not exist
**Solusi**: Gunakan `db.settings` bukan `db.setting` (dengan 's')

### Error: Property 'isPinned' does not exist
**Solusi**: Jalankan `npx prisma generate` untuk regenerate Prisma client

### Settings tidak tersimpan
**Solusi**: 
1. Cek console browser untuk error
2. Cek network tab untuk melihat response API
3. Pastikan admin sudah login
4. Cek database apakah record Settings sudah ada

### Algoritma tidak berubah
**Solusi**:
1. Clear cache browser
2. Refresh halaman paket umroh
3. Cek database apakah settings sudah tersimpan dengan benar
4. Cek console log API untuk melihat algoritma yang digunakan
