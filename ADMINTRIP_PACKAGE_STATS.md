# Admintrip Package Statistics Cards

## Fitur yang Ditambahkan

Menambahkan 3 card statistik baru di halaman admintrip dashboard untuk menampilkan:

### 1. Total Paket di Lihat
- Icon: Eye (Cyan)
- Menampilkan total views dari semua paket
- Data diambil dari field `views` di tabel Package

### 2. Total Paket di Favoritkan
- Icon: Heart (Pink)
- Menampilkan total jumlah paket yang difavoritkan oleh user
- Data diambil dari jumlah record di tabel Favorite

### 3. Total Paket di Booking
- Icon: ShoppingCart (Indigo)
- Menampilkan total booking clicks dari semua paket
- Data diambil dari field `bookingClicks` di tabel Package

## Implementasi Teknis

### API Endpoint Baru
`GET /api/admintrip/package-stats`

Response:
```json
{
  "success": true,
  "data": {
    "totalViews": 1250,
    "totalBookings": 450,
    "totalFavorites": 320
  }
}
```

### Database Query
```typescript
// Total Views
const viewsResult = await db.package.aggregate({
  _sum: {
    views: true
  }
})

// Total Bookings
const bookingsResult = await db.package.aggregate({
  _sum: {
    bookingClicks: true
  }
})

// Total Favorites
const favoritesCount = await db.favorite.count()
```

## UI Layout

Cards ditampilkan dalam grid 3 kolom di bawah stats cards utama:
- Responsive: 1 kolom di mobile, 3 kolom di desktop
- Menggunakan format angka Indonesia (toLocaleString)
- Icon dengan background warna yang berbeda untuk setiap card

## File yang Dimodifikasi

1. `src/app/admintrip/page.tsx`
   - Menambahkan import icon Eye, Heart, ShoppingCart
   - Menambahkan state untuk totalViews, totalFavorites, totalBookings
   - Menambahkan fetch ke API package-stats
   - Menambahkan 3 card baru di UI

2. `src/app/api/admintrip/package-stats/route.ts` (Baru)
   - API endpoint untuk mengambil statistik paket
   - Menggunakan Prisma aggregate dan count

## Testing

Untuk menguji fitur ini:
1. Login ke admintrip: http://localhost:3000/admintrip/login
2. Lihat dashboard: http://localhost:3000/admintrip
3. Verifikasi 3 card baru muncul dengan data yang benar
4. Pastikan angka sesuai dengan data di database
