# Data Restore Guide

## ✅ Data Berhasil Di-restore!

Database telah di-seed ulang dengan data sample yang lengkap.

---

## 📊 Data yang Telah Di-seed:

### 1. **Admin** (1 user)
- Username: `admin`
- Password: `admin123`
- Role: superadmin

### 2. **Users** (1 user)
- Email: `rio@gmail.com`
- Password: `123456`
- Name: Rio Pratama

### 3. **Travels** (4 travel agencies)
1. **Alhijaz Indowisata** (Verified ✓)
   - Username: `alhijaz-indowisata`
   - City: Jakarta
   - Rating: 4.8/5.0
   - Total Jamaah: 5,000

2. **Raudhah Travel** (Verified ✓)
   - Username: `raudhah-travel`
   - City: Surabaya
   - Rating: 4.9/5.0
   - Total Jamaah: 7,500

3. **Safira Travel**
   - Username: `safira-travel`
   - City: Medan
   - Rating: 4.6/5.0
   - Total Jamaah: 3,500

4. **Baitul Makmur Tour** (Verified ✓)
   - Username: `baitul-makmur`
   - City: Bandung
   - Rating: 4.7/5.0
   - Total Jamaah: 6,000

### 4. **Packages** (8 paket umroh - Semua Aktif ✅)
1. Umroh Premium Ramadhan 2026 (📌 Pinned) - Keberangkatan: Maret 2026
2. Umroh Reguler Ekonomis - Keberangkatan: April 2026
3. Umroh Keluarga Plus Turki - Keberangkatan: Mei 2026
4. Umroh Hemat Backpacker - Keberangkatan: Februari 2026
5. Umroh VIP Exclusive - Keberangkatan: Juni 2026
6. Umroh Plus Dubai - Keberangkatan: Maret 2026
7. Umroh Reguler Nyaman - Keberangkatan: April 2026
8. Umroh Keluarga Comfort - Keberangkatan: Mei 2026

**Note:** Semua tanggal keberangkatan di tahun 2026 sehingga paket tetap aktif

### 5. **Articles** (3 artikel)
1. Panduan Lengkap Persiapan Umroh untuk Pemula
2. Tips Memilih Travel Umroh Terpercaya
3. Doa-doa Penting Saat Umroh

### 6. **Settings**
- Departure Cities
- Package Sort Algorithm: newest
- Verified Priority: true

---

## 🔐 Login Credentials:

### Admin Panel
- URL: `http://localhost:3000/admintrip/login`
- Username: `admin`
- Password: `admin123`

### Travel Admin (Contoh)
- URL: `http://localhost:3000/travel-admin/login`
- Email: `info@alhijaz.com`
- Password: `travel123`

### User (Contoh)
- URL: `http://localhost:3000/login`
- Email: `rio@gmail.com`
- Password: `123456`

---

## 🔄 Cara Re-seed Database (Jika Diperlukan):

```bash
# Reset database dan seed ulang
npx prisma migrate reset --force

# Atau seed saja tanpa reset
npx tsx prisma/seed.ts
```

---

## 📝 Catatan Penting:

1. **Data ini adalah sample data** untuk development
2. Semua password adalah plain text (tidak di-hash) untuk kemudahan testing
3. **JANGAN gunakan di production!**
4. Untuk production, gunakan password yang di-hash dengan bcrypt
5. Gambar menggunakan placeholder dari Unsplash dan UI Avatars

---

## 🎯 Next Steps:

1. ✅ Refresh browser untuk melihat data
2. ✅ Test navigasi ke berbagai halaman
3. ✅ Test fitur search dan filter
4. ✅ Test login sebagai admin/travel/user
5. ✅ Test CRUD operations

---

## 🐛 Troubleshooting:

### Data tidak muncul?
```bash
# Cek apakah seed berhasil
npx tsx prisma/seed.ts

# Restart development server
# Stop server (Ctrl+C)
npm run dev
```

### Error saat seed?
```bash
# Generate Prisma Client
npx prisma generate

# Coba seed lagi
npx tsx prisma/seed.ts
```

---

## ✅ Status: Data Restored Successfully!

Semua data sample sudah berhasil di-restore. Silakan refresh browser dan test aplikasi! 🎉
