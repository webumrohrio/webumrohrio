# Admintrip Dashboard Period Filter

## Fitur yang Ditambahkan

Menambahkan filter periode waktu di halaman admintrip dashboard untuk melihat statistik berdasarkan:
- **Hari Ini** - Data dari hari ini (00:00 sampai sekarang)
- **Minggu Ini** - Data 7 hari terakhir
- **Bulan Ini** - Data 30 hari terakhir  
- **Tahun Ini** - Data 365 hari terakhir

## UI Implementation

### Filter Buttons
Tombol filter ditampilkan di header dashboard dengan 4 pilihan:
- Button aktif menggunakan variant "default" (primary color)
- Button tidak aktif menggunakan variant "outline"
- Responsive: stack vertical di mobile, horizontal di desktop
- Icon Filter untuk visual indicator

```tsx
<div className="flex items-center gap-2">
  <Filter className="w-5 h-5 text-gray-500" />
  <div className="flex gap-2">
    <Button variant={period === 'day' ? 'default' : 'outline'} size="sm">
      Hari Ini
    </Button>
    <Button variant={period === 'week' ? 'default' : 'outline'} size="sm">
      Minggu Ini
    </Button>
    <Button variant={period === 'month' ? 'default' : 'outline'} size="sm">
      Bulan Ini
    </Button>
    <Button variant={period === 'year' ? 'default' : 'outline'} size="sm">
      Tahun Ini
    </Button>
  </div>
</div>
```

## API Updates

Semua API endpoint sekarang mendukung parameter `period`:

### 1. `/api/packages?period=day`
Filter paket berdasarkan `createdAt`

### 2. `/api/travels?period=week`
Filter travel berdasarkan `createdAt`

### 3. `/api/articles?period=month`
Filter artikel berdasarkan `createdAt`

### 4. `/api/users?period=year`
Filter user berdasarkan `createdAt`

### 5. `/api/admintrip/package-stats?period=day`
Filter statistik paket (views, favorites, bookings) berdasarkan periode

## Date Range Calculation

```typescript
const now = new Date()
const startDate = new Date()

switch (period) {
  case 'day':
    startDate.setHours(0, 0, 0, 0)
    break
  case 'week':
    startDate.setDate(now.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)
    break
  case 'month':
    startDate.setMonth(now.getMonth() - 1)
    startDate.setHours(0, 0, 0, 0)
    break
  case 'year':
    startDate.setFullYear(now.getFullYear() - 1)
    startDate.setHours(0, 0, 0, 0)
    break
}
```

## Data yang Terfilter

Ketika filter aktif, semua statistik akan menampilkan data sesuai periode:

### Stats Cards
- Total Travel (dalam periode)
- Total Paket (dalam periode)
- Total Artikel (dalam periode)
- Total User (dalam periode)

### Package Stats Cards
- Total Paket di Lihat (views dari paket yang dibuat dalam periode)
- Total Paket di Favoritkan (favorites yang dibuat dalam periode)
- Total Paket di Booking (booking clicks dari paket yang dibuat dalam periode)

### Recent Data
- Paket Terbaru (5 paket terbaru dalam periode)
- Travel Terbaru (5 travel terbaru dalam periode)

## State Management

```typescript
const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')

useEffect(() => {
  fetchStats()
  fetchRecentData()
  fetchAdminProfile()
}, [period]) // Re-fetch when period changes
```

## File yang Dimodifikasi

1. **src/app/admintrip/page.tsx**
   - Menambahkan state `period`
   - Menambahkan UI filter buttons
   - Update fetch functions dengan parameter period

2. **src/app/api/packages/route.ts**
   - Menambahkan parameter `period`
   - Filter berdasarkan `createdAt`

3. **src/app/api/travels/route.ts**
   - Menambahkan parameter `period`
   - Filter berdasarkan `createdAt`

4. **src/app/api/articles/route.ts**
   - Menambahkan parameter `period`
   - Filter berdasarkan `createdAt`

5. **src/app/api/users/route.ts**
   - Menambahkan parameter `period`
   - Filter berdasarkan `createdAt`

6. **src/app/api/admintrip/package-stats/route.ts**
   - Update untuk support filter periode
   - Hitung views, bookings, favorites dalam periode

7. **src/lib/date-utils.ts** (Baru)
   - Helper function untuk calculate date range

## Testing

Untuk menguji fitur ini:

1. Login ke admintrip: http://localhost:3000/admintrip/login
2. Lihat dashboard: http://localhost:3000/admintrip
3. Klik tombol "Hari Ini" → lihat data hari ini
4. Klik tombol "Minggu Ini" → lihat data 7 hari terakhir
5. Klik tombol "Bulan Ini" → lihat data 30 hari terakhir
6. Klik tombol "Tahun Ini" → lihat data 365 hari terakhir
7. Verifikasi semua card statistik update sesuai periode
8. Verifikasi "Paket Terbaru" dan "Travel Terbaru" juga terfilter

## Benefits

- Admin bisa melihat performa website dalam periode tertentu
- Memudahkan analisis trend dan pertumbuhan
- Data lebih relevan dan actionable
- UI yang clean dan mudah digunakan
