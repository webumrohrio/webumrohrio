# Penjelasan Total Paket di Booking

## Cara Kerja Lengkap (✅ Sudah Terimplementasi)

### 1. Field Database
Di schema Prisma (`prisma/schema.prisma`), setiap paket memiliki field:
```prisma
model Package {
  // ... fields lainnya
  views           Int      @default(0)
  bookingClicks   Int      @default(0)  // Counter untuk klik booking
  // ... fields lainnya
}
```

### 2. Tracking Klik Booking (User Action)

Ketika user mengklik tombol "Booking via WhatsApp" di halaman detail paket, sistem akan:

**File: `src/app/[username]/paket/[slug]/page.tsx`**
```typescript
const handleBookingClick = () => {
  // Track booking click
  fetch(`/api/packages/${packageDetail.id}/booking-click`, {
    method: 'POST'
  }).catch(err => console.error('Failed to track booking click:', err))
  
  // Redirect ke WhatsApp
  const phone = packageDetail.travel.phone?.replace(/[^0-9]/g, '')
  const message = `Halo, saya tertarik dengan paket ${packageDetail.name}`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}
```

### 3. API Endpoint untuk Increment

**File: `src/app/api/packages/[id]/booking-click/route.ts`**
```typescript
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Increment booking clicks count
    await db.package.update({
      where: { id },
      data: {
        bookingClicks: {
          increment: 1  // Tambah 1 setiap kali dipanggil
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking click tracked'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to track booking click'
    }, { status: 500 })
  }
}
```

### 4. Penghitungan di Dashboard Admintrip

Di halaman `/admintrip`, statistik "Total Paket di Booking" dihitung melalui API `/api/admintrip/package-stats`:

**File: `src/app/api/admintrip/package-stats/route.ts`**
```typescript
// 1. Ambil semua paket dalam periode tertentu
const packages = await db.package.findMany({
  where: {
    createdAt: {
      gte: startDate  // Filter berdasarkan periode (hari/minggu/bulan/tahun)
    }
  },
  select: {
    views: true,
    bookingClicks: true
  }
})

// 2. Jumlahkan semua bookingClicks dari paket-paket tersebut
const totalBookings = packages.reduce((sum, pkg) => sum + pkg.bookingClicks, 0)
```

### 5. Logika Penghitungan

**Total Paket di Booking** = Jumlah total dari field `bookingClicks` semua paket yang dibuat dalam periode yang dipilih.

Contoh:
- Paket A: bookingClicks = 15
- Paket B: bookingClicks = 23
- Paket C: bookingClicks = 8
- **Total = 15 + 23 + 8 = 46**

### 6. Filter Periode

Penghitungan bisa difilter berdasarkan periode:
- **Hari Ini**: Paket yang dibuat hari ini
- **Minggu Ini**: Paket yang dibuat 7 hari terakhir
- **Bulan Ini**: Paket yang dibuat 30 hari terakhir
- **Tahun Ini**: Paket yang dibuat 365 hari terakhir

## Penggunaan bookingClicks di Sistem

Field `bookingClicks` digunakan di beberapa tempat:

### 1. Dashboard Travel Admin
- Menampilkan total klik booking untuk semua paket travel
- Menghitung conversion rate: `(bookingClicks / views) * 100%`

### 2. Dashboard Admintrip
- Menampilkan total klik booking dari semua paket
- Filter berdasarkan periode waktu

### 3. Sorting Algorithm
Paket dengan `bookingClicks` lebih tinggi mendapat prioritas lebih tinggi:
```typescript
const popularityScore = 
  (views || 0) * 1 + 
  (favoriteCount || 0) * 2 + 
  (bookingClicks || 0) * 3  // Bobot tertinggi!
```

### 4. Celebration Milestones
Trigger celebration popup saat mencapai milestone:
- 10 booking clicks
- 50 booking clicks
- 100 booking clicks
- 500 booking clicks
- 1000 booking clicks

## Perbedaan dengan Metrics Lain

| Metric | Cara Kerja | Kapan Bertambah |
|--------|-----------|-----------------|
| **views** | Auto-increment saat halaman detail dibuka | Setiap kali user buka detail paket |
| **bookingClicks** | Manual increment (perlu implementasi) | Saat user klik tombol booking/WhatsApp |
| **favorites** | Count dari tabel Favorite | Saat user klik tombol favorite |

## Flow Lengkap dari User ke Dashboard

```
1. User buka halaman detail paket
   ↓
2. User klik tombol "Booking via WhatsApp"
   ↓
3. Frontend call API: POST /api/packages/[id]/booking-click
   ↓
4. API increment bookingClicks di database (+1)
   ↓
5. User redirect ke WhatsApp
   ↓
6. Admin buka dashboard /admintrip
   ↓
7. Dashboard fetch API: GET /api/admintrip/package-stats?period=day
   ↓
8. API hitung total bookingClicks dari semua paket
   ↓
9. Dashboard tampilkan "Total Paket di Booking"
```

## Status Implementasi

✅ **Sudah Terimplementasi Lengkap:**
- Field `bookingClicks` di database
- API endpoint `/api/packages/[id]/booking-click` untuk increment
- Event tracking saat tombol booking diklik
- Auto-increment saat user klik WhatsApp
- Penghitungan total di dashboard admintrip
- Display di berbagai halaman (admintrip, travel-admin)
- Sorting berdasarkan bookingClicks
- Filter berdasarkan periode waktu

## Lokasi Implementasi

### 1. Halaman Detail Paket (User)
- `src/app/[username]/paket/[slug]/page.tsx` - Tracking klik
- `src/app/paket-umroh/[id]/page.tsx` - Tracking klik (alternatif route)

### 2. API Endpoint
- `src/app/api/packages/[id]/booking-click/route.ts` - Increment counter
- `src/app/api/admintrip/package-stats/route.ts` - Hitung total

### 3. Dashboard Admin
- `src/app/admintrip/page.tsx` - Display total (super admin)
- `src/app/admintrip/packages/page.tsx` - Display per paket (super admin)
- `src/app/travel-admin/page.tsx` - Display total (travel admin)
- `src/app/travel-admin/packages/page.tsx` - Display per paket (travel admin)

## Testing

Untuk test fitur ini:

1. **Test Tracking:**
   - Buka halaman detail paket
   - Klik tombol "Booking via WhatsApp"
   - Cek database: `bookingClicks` harus bertambah 1
   - Cek console: tidak ada error

2. **Test Dashboard:**
   - Login ke admintrip: http://localhost:3000/admintrip/login
   - Lihat card "Total Paket di Booking"
   - Angka harus sesuai dengan total di database
   - Test filter periode (Hari/Minggu/Bulan/Tahun)

3. **Test Per Paket:**
   - Buka http://localhost:3000/admintrip/packages
   - Lihat kolom "Klik Booking" di tabel
   - Angka harus sesuai dengan field `bookingClicks` di database
