# Field-field yang Perlu Ditambahkan ke Travel-Admin Create Package

## Status Saat Ini
Travel-admin/packages/create memiliki form yang sangat sederhana dengan field minimal.

## Field yang Kurang (dari admintrip/packages/create)

### 1. **Image Upload dengan Preview**
- Upload file gambar (bukan hanya URL)
- Preview gambar sebelum upload
- Support drag & drop
- Validasi ukuran dan format file

### 2. **Jenis Penerbangan**
```typescript
flightType: 'langsung' | 'transit'
```

### 3. **Price Options (Multiple Paket)**
Array of:
- name (Paket Silver, Gold, Platinum)
- price (harga setelah diskon)
- originalPrice (harga coret)
- cashback
- hotelMakkah
- hotelMadinah
- description
- isBestSeller (checkbox)

**Catatan**: Harga pilihan pertama = harga dasar di card

### 4. **Itinerary (Jadwal Perjalanan)**
Array of:
- day (hari ke-)
- title
- description

### 5. **Facilities, Includes, Excludes**
- facilities: string (comma separated)
- includes: string (comma separated)  
- excludes: string (comma separated)

### 6. **Status Aktif**
```typescript
isActive: boolean
```

### 7. **Return Date**
```typescript
returnDate: string // date
```

### 8. **Quota Available**
```typescript
quotaAvailable: number // sama dengan quota saat create
```

## Perbedaan Penting

### Admintrip:
- Harus pilih travel dari dropdown
- Validasi package limit travel
- Kota keberangkatan auto-fill dari travel

### Travel-Admin:
- Travel otomatis dari session
- Tidak perlu pilih travel
- Kota keberangkatan manual input

## Rekomendasi Implementasi

### Opsi 1: Copy Full Form (Kompleks tapi Lengkap)
Copy seluruh form dari admintrip, lalu:
1. Hapus travel selector
2. Ubah API endpoint ke `/api/travel-admin/packages`
3. Hapus validasi package limit (sudah di API)

### Opsi 2: Tambah Field Bertahap (Praktis)
Tambahkan field penting saja dulu:
1. ✅ Image upload + preview
2. ✅ Price options (minimal 1)
3. ✅ Itinerary
4. ✅ Facilities/includes/excludes
5. ✅ Flight type
6. ✅ Return date

Field opsional bisa ditambah nanti:
- Multiple price options
- Best seller flag
- Cashback
- Original price (harga coret)

## API Endpoint yang Perlu Disesuaikan

File: `src/app/api/travel-admin/packages/route.ts`

Perlu handle semua field baru:
- priceOptions array
- itinerary array
- facilities, includes, excludes (convert dari string ke array)
- returnDate
- flightType
- isActive

## Contoh Data Structure

```typescript
{
  name: "Umroh Ramadhan 2025",
  description: "...",
  image: "https://...",
  duration: "12 Hari",
  departureCity: "Jakarta",
  departureDate: "2025-03-15",
  returnDate: "2025-03-27",
  quota: 45,
  quotaAvailable: 45,
  flightType: "langsung",
  isActive: true,
  
  // Price options (minimal 1)
  priceOptions: [
    {
      name: "Paket Silver",
      price: 35000000,
      originalPrice: 40250000,
      cashback: 1000000,
      hotelMakkah: "Hotel Bintang 4 (500m dari Masjidil Haram)",
      hotelMadinah: "Hotel Bintang 4 (400m dari Masjid Nabawi)",
      description: "Paket standar dengan lokasi strategis",
      isBestSeller: false
    }
  ],
  
  // Itinerary
  itinerary: [
    {
      day: 1,
      title: "Keberangkatan",
      description: "Berkumpul di bandara dan penerbangan"
    }
  ],
  
  // Arrays
  facilities: ["Hotel Bintang 5", "Transportasi AC", "Makan 3x Sehari"],
  includes: ["Tiket pesawat PP", "Hotel bintang 5", "Makan 3x sehari"],
  excludes: ["Pengeluaran pribadi", "Tips guide & driver"]
}
```

## Next Steps

Pilih salah satu:

1. **Copy full form** - Lebih cepat, tapi file besar
2. **Tambah field bertahap** - Lebih terstruktur, tapi butuh waktu

Saya rekomendasikan **Opsi 1** karena:
- Lebih cepat
- Konsisten dengan admintrip
- Semua fitur langsung tersedia
- Tinggal hapus bagian travel selector
