# Update: Paket Terbaru & Travel Terbaru di Admintrip Dashboard

## Perubahan yang Diterapkan

Mengubah cara perhitungan "Paket Terbaru" dan "Travel Terbaru" di halaman http://localhost:3000/admintrip agar:

1. **Mengambil data berdasarkan `createdAt` terbaru saja** (tanpa prioritas pin/verified)
2. **Terpengaruh oleh filter periode** (Hari/Minggu/Bulan/Tahun)

## Implementasi

### 1. Update Frontend (admintrip/page.tsx)

**Sebelum:**
```typescript
const fetchRecentData = async () => {
  const [packagesRes, travelsRes] = await Promise.all([
    fetch('/api/packages?limit=5'),  // Tidak ada period
    fetch('/api/travels?limit=5')    // Tidak ada period
  ])
}
```

**Sesudah:**
```typescript
const fetchRecentData = async () => {
  const [packagesRes, travelsRes] = await Promise.all([
    fetch(`/api/packages?limit=5&period=${period}&simpleSort=true`),
    fetch(`/api/travels?limit=5&period=${period}`)
  ])
}
```

**Parameter Baru:**
- `period` - Filter berdasarkan periode (day/week/month/year)
- `simpleSort=true` - Bypass sorting dengan prioritas, hanya sort by createdAt DESC

### 2. Update API Packages (api/packages/route.ts)

**Parameter Baru:**
```typescript
const simpleSort = searchParams.get('simpleSort') === 'true'
```

**Logika Sorting:**
```typescript
let sortedPackages

if (simpleSort) {
  // Simple sort: hanya berdasarkan createdAt DESC
  sortedPackages = [...packagesWithFavorites].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
} else {
  // Complex sort: Pin → Verified → Algorithm
  // (logika sorting yang sudah ada sebelumnya)
}
```

### 3. API Travels Sudah Support Period

API `/api/travels` sudah mendukung parameter `period` dari update sebelumnya, jadi tidak perlu perubahan tambahan.

## Cara Kerja Baru

### Paket Terbaru

**Request:**
```
GET /api/packages?limit=5&period=day&simpleSort=true
```

**Query Database:**
```typescript
const packages = await db.package.findMany({
  where: {
    isActive: true,
    createdAt: { gte: startDate }  // Filter berdasarkan periode
  },
  take: 5
})

// Sort hanya berdasarkan createdAt DESC
const sorted = packages.sort((a, b) => 
  new Date(b.createdAt) - new Date(a.createdAt)
)
```

**Hasil:**
- 5 paket yang dibuat paling baru dalam periode yang dipilih
- Tidak ada prioritas untuk paket yang di-pin
- Tidak ada prioritas untuk travel verified
- Murni berdasarkan waktu pembuatan

### Travel Terbaru

**Request:**
```
GET /api/travels?limit=5&period=day
```

**Query Database:**
```typescript
const travels = await db.travel.findMany({
  where: {
    isActive: true,
    createdAt: { gte: startDate }  // Filter berdasarkan periode
  },
  orderBy: [
    { isVerified: 'desc' },  // Verified masih prioritas
    { createdAt: 'desc' }    // Lalu terbaru
  ],
  take: 5
})
```

**Hasil:**
- 5 travel yang dibuat paling baru dalam periode yang dipilih
- Travel verified masih mendapat prioritas (sesuai logika existing)

## Contoh Skenario

### Skenario 1: Filter "Hari Ini"

**Database:**
- Paket A: dibuat hari ini 10:00 (isPinned: true)
- Paket B: dibuat hari ini 11:00
- Paket C: dibuat hari ini 09:00
- Paket D: dibuat kemarin (tidak masuk filter)

**Hasil "Paket Terbaru":**
1. Paket B (11:00) - Terbaru
2. Paket A (10:00) - Pin diabaikan
3. Paket C (09:00)

### Skenario 2: Filter "Minggu Ini"

**Database:**
- Paket A: dibuat 7 hari lalu
- Paket B: dibuat 6 hari lalu (verified travel)
- Paket C: dibuat 5 hari lalu
- Paket D: dibuat 8 hari lalu (tidak masuk filter)

**Hasil "Paket Terbaru":**
1. Paket A (7 hari lalu) - Terbaru dalam periode
2. Paket B (6 hari lalu) - Verified diabaikan
3. Paket C (5 hari lalu)

## Perbedaan dengan Halaman Lain

| Halaman | Sorting | Filter Periode | Pin Priority | Verified Priority |
|---------|---------|----------------|--------------|-------------------|
| **Homepage** | Pin → Verified → Algorithm | ❌ | ✅ | ✅ |
| **Travel Admin** | Pin → Verified → Algorithm | ❌ | ✅ | ✅ |
| **Admintrip (Stats)** | - | ✅ | - | - |
| **Admintrip (Recent)** | createdAt DESC | ✅ | ❌ | ❌ |

## Keuntungan Perubahan Ini

1. **Konsistensi dengan Filter Periode**
   - Semua data di dashboard (stats + recent) sekarang terpengaruh oleh filter periode

2. **Data Lebih Relevan**
   - Admin bisa melihat paket/travel yang benar-benar baru ditambahkan dalam periode tertentu

3. **Tidak Ada Bias**
   - Paket yang di-pin tidak mendominasi section "Paket Terbaru"
   - Murni berdasarkan waktu pembuatan

4. **Analisis Lebih Baik**
   - Admin bisa track pertumbuhan paket/travel per periode
   - Misalnya: "Berapa paket baru yang ditambahkan hari ini?"

## Testing

### Test 1: Filter Hari Ini
1. Login ke admintrip
2. Pilih filter "Hari Ini"
3. Buat paket baru
4. Refresh dashboard
5. Paket baru harus muncul di "Paket Terbaru"

### Test 2: Filter Minggu Ini
1. Pilih filter "Minggu Ini"
2. Verifikasi "Paket Terbaru" menampilkan paket dari 7 hari terakhir
3. Paket yang lebih lama tidak muncul

### Test 3: Paket yang Di-Pin
1. Pin sebuah paket lama
2. Buka admintrip dashboard
3. Paket yang di-pin TIDAK muncul di "Paket Terbaru" jika di luar periode
4. Paket yang di-pin TIDAK mendapat prioritas khusus

### Test 4: Travel Verified
1. Buat travel verified dan non-verified di hari yang sama
2. Buka admintrip dashboard
3. Travel verified masih mendapat prioritas di "Travel Terbaru"

## File yang Dimodifikasi

1. **src/app/admintrip/page.tsx**
   - Update `fetchRecentData()` untuk menambahkan parameter `period` dan `simpleSort`

2. **src/app/api/packages/route.ts**
   - Tambah parameter `simpleSort`
   - Tambah kondisi untuk bypass complex sorting

## Backward Compatibility

Perubahan ini **TIDAK mempengaruhi** halaman lain:
- Homepage tetap menggunakan sorting dengan prioritas
- Travel Admin tetap menggunakan sorting dengan prioritas
- Hanya admintrip dashboard yang menggunakan simple sort

Parameter `simpleSort` bersifat opt-in, jadi API tetap backward compatible.
