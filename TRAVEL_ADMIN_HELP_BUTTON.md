# Tombol Bantuan Travel Admin

## Fitur
Tombol "Butuh Bantuan?" telah ditambahkan di sidebar travel admin panel dengan desain yang mencolok.

## Lokasi
- Di bagian bawah sidebar, tepat di atas tombol "Keluar"
- Tersedia di semua halaman travel admin

## Desain
- **Warna**: Gradient hijau (green-500 to green-600) yang eye-catching
- **Animasi**: 
  - Tombol dengan efek pulse
  - Icon dengan efek bounce
  - Shadow yang lebih besar saat hover
- **Icon**: MessageCircle dari Lucide React

## Fungsi
Ketika diklik, tombol akan membuka WhatsApp dengan:
- **Nomor**: Nomor admin Tripbaitullah (default: 6281234567890)
- **Pesan**: "Halo Admintrip, Saya Admin Travel [Nama Travel], Butuh Bantuan"

## Konfigurasi Nomor Admin

### Cara 1: Melalui Database
```sql
-- Tambah atau update nomor admin
INSERT INTO "Setting" (key, value, description)
VALUES ('adminPhone', '628123456789', 'Nomor WhatsApp Admin Tripbaitullah untuk bantuan')
ON CONFLICT (key) DO UPDATE SET value = '628123456789';
```

### Cara 2: Melalui API
```javascript
// POST /api/settings
{
  "key": "adminPhone",
  "value": "628123456789",
  "description": "Nomor WhatsApp Admin Tripbaitullah untuk bantuan"
}
```

### Format Nomor
- Gunakan format internasional tanpa tanda +
- Contoh: 628123456789 (untuk +62 812-3456-789)
- Jangan gunakan: +62, 0, atau spasi

## File yang Dimodifikasi
- `src/app/travel-admin/layout.tsx` - Menambahkan tombol bantuan di sidebar

## Catatan
- Nomor default adalah 6281234567890
- Pastikan untuk mengupdate nomor ini dengan nomor admin yang sebenarnya
- Tombol akan otomatis menggunakan nama travel dari session
