# Panduan Prioritas Travel Terverifikasi

## Masalah
Travel yang terverifikasi tidak muncul di urutan teratas di homepage.

## Penyebab
Setting `verifiedPriority` di database belum diaktifkan atau bernilai `false`.

## Solusi

### Cara 1: Melalui Admin Panel (Recommended)
1. Login ke `/admintrip/login`
2. Buka `/admintrip/settings`
3. Pilih tab **"Algoritma Sorting"**
4. Aktifkan toggle **"Prioritaskan Travel Terverifikasi"**
5. Klik **"Simpan Pengaturan"**
6. Refresh homepage untuk melihat perubahan

### Cara 2: Melalui Database (Manual)
Jalankan query SQL berikut:

```sql
-- Cek setting saat ini
SELECT * FROM "Setting" WHERE key = 'verifiedPriority';

-- Aktifkan verified priority
INSERT INTO "Setting" (key, value, description, "createdAt", "updatedAt")
VALUES ('verifiedPriority', 'true', 'Prioritize verified travel packages', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET value = 'true', "updatedAt" = NOW();
```

## Cara Kerja Algoritma Sorting

Urutan prioritas sorting di homepage:

1. **Priority 1: Pinned Packages** (Tertinggi)
   - Paket yang di-pin oleh Super Admin
   - Diurutkan berdasarkan waktu pin (oldest first)

2. **Priority 2: Verified Travel** (Jika diaktifkan)
   - Travel yang terverifikasi muncul lebih dulu
   - Hanya berlaku jika `verifiedPriority = true`

3. **Priority 3: Algorithm**
   - **Newest**: Paket terbaru (default)
   - **Popular**: Berdasarkan views, favorites, dan booking clicks
   - **Random**: Acak dengan seed harian

## Verifikasi

Setelah mengaktifkan, cek di homepage:
- Travel dengan badge "Verified" (✓) harus muncul lebih dulu
- Urutan: Pinned → Verified → Non-Verified
- Dalam setiap grup, diurutkan sesuai algorithm yang dipilih

## Catatan
- Setting ini berlaku untuk semua halaman yang menampilkan paket
- Perubahan langsung terlihat tanpa perlu restart server
- Jika masih tidak bekerja, cek apakah travel sudah di-set `isVerified = true` di database
