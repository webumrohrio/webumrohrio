# Package Stats Migration Guide

## Masalah
Data "Total Paket di Lihat" dan "Total Paket di Booking" tidak akurat karena hanya menampilkan data kumulatif tanpa bisa difilter berdasarkan periode waktu.

## Solusi
Menambahkan tabel log untuk tracking views dan booking clicks dengan timestamp yang akurat.

## Perubahan yang Sudah Dilakukan

### 1. Database Schema ✅
Menambahkan 2 tabel baru di `prisma/schema.prisma`:

**PackageView** - Mencatat setiap kali paket dilihat
- id: String (cuid)
- packageId: String (indexed)
- ipAddress: String (optional) - untuk tracking unique visitors
- userAgent: String (optional) - untuk analytics
- createdAt: DateTime (indexed) - untuk filter berdasarkan periode

**PackageBookingClick** - Mencatat setiap kali tombol booking diklik
- id: String (cuid)
- packageId: String (indexed)
- ipAddress: String (optional)
- userAgent: String (optional)
- createdAt: DateTime (indexed)

### 2. Database Migration ✅
```bash
npx prisma db push
npx prisma generate
```
Tabel sudah dibuat di database PostgreSQL production.

### 3. API Updates ✅

**`/api/packages/[id]/route.ts`**
- Setiap kali paket dilihat, sistem mencatat ke tabel `PackageView`
- Menyimpan IP address dan user agent untuk analytics
- Tetap increment counter `views` untuk backward compatibility

**`/api/admintrip/package-stats`**
- Menggunakan tabel log untuk menghitung views berdasarkan periode
- Fallback ke counter lama jika tabel log belum tersedia
- Mendukung filter: hari ini, minggu ini, bulan ini, tahun ini

### 4. Dashboard Admin ✅
**`/admintrip/page.tsx`**
- Menambahkan label "Kumulatif semua waktu" untuk views dan bookings
- Menambahkan label "Berdasarkan periode filter" untuk favorites
- Memberikan transparansi kepada admin tentang sumber data

## Status Implementasi

### ✅ Selesai
- [x] Schema database dengan tabel tracking
- [x] Migration ke PostgreSQL production
- [x] API tracking untuk package views
- [x] API stats dengan filter periode
- [x] Dashboard admin dengan label yang jelas
- [x] Fallback mechanism untuk backward compatibility

### ⏳ Pending (Opsional)
- [ ] API tracking untuk booking clicks (perlu identifikasi tombol booking)
- [ ] Analytics dashboard untuk melihat trend views per hari/minggu
- [ ] Unique visitor counting (berdasarkan IP)
- [ ] Export data analytics ke CSV/Excel

## Cara Kerja

### Views Tracking
1. User membuka halaman detail paket
2. API `/api/packages/[id]` dipanggil
3. Sistem mencatat:
   - Package ID
   - IP address user
   - User agent (browser info)
   - Timestamp
4. Counter `views` di-increment untuk backward compatibility

### Stats Dashboard
1. Admin memilih filter periode (hari/minggu/bulan/tahun)
2. API menghitung:
   - **Views**: Query `PackageView` dengan filter `createdAt >= startDate`
   - **Favorites**: Query `Favorite` dengan filter `createdAt >= startDate`
   - **Bookings**: Masih menggunakan counter kumulatif (belum ada tracking)
3. Data ditampilkan di dashboard dengan label yang jelas

## Catatan Penting

### Data Akurasi
- **Views**: ✅ Akurat berdasarkan periode (menggunakan log table)
- **Favorites**: ✅ Akurat berdasarkan periode (sudah ada timestamp)
- **Bookings**: ⚠️ Masih kumulatif (perlu implementasi tracking)

### Performance
- Index sudah ditambahkan di `packageId` dan `createdAt`
- Query akan cepat meskipun data log banyak
- Pertimbangkan archiving data lama (>1 tahun) jika perlu

### Backward Compatibility
- Field `views` dan `bookingClicks` tetap ada
- Sistem lama tetap berfungsi
- Bisa rollback kapan saja tanpa data loss
