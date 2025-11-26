# Analisis Popularitas Paket Umroh

## 🏆 Hasil Perbandingan

### Pemenang: **Umroh Plus Dubai** ✨

---

## 📊 Data Lengkap

### 1. Umroh Plus Dubai (Safira Travel)
**Popularity Score: 525 poin**

| Metrik | Nilai |
|--------|-------|
| 👁️ Views (Dilihat) | **285 kali** |
| ❤️ Favorites (Difavoritkan) | 0 kali |
| 📞 Booking Clicks | **48 kali** |
| 🔗 Share Count | 0 kali |
| 💰 Harga | Rp 42.000.000 |
| ⏱️ Durasi | 13 Hari |
| ✈️ Kota Keberangkatan | Medan |
| 📅 Tanggal | 25 Maret 2026 |
| 👥 Quota | 22/35 tersedia |

### 2. Umroh Keluarga Comfort (Baitul Makmur Tour)
**Popularity Score: 416 poin**

| Metrik | Nilai |
|--------|-------|
| 👁️ Views (Dilihat) | 221 kali |
| ❤️ Favorites (Difavoritkan) | 0 kali |
| 📞 Booking Clicks | 39 kali |
| 🔗 Share Count | 0 kali |
| 💰 Harga | Rp 35.000.000 |
| ⏱️ Durasi | 11 Hari |
| ✈️ Kota Keberangkatan | Semarang |
| 📅 Tanggal | 10 Mei 2026 |
| 👥 Quota | 15/30 tersedia |

---

## 🎯 Alasan "Umroh Plus Dubai" Lebih Populer

### 1. **Lebih Banyak Dilihat** 👁️
- Umroh Plus Dubai: **285 views**
- Umroh Keluarga Comfort: 221 views
- **Selisih: +64 views (+29% lebih tinggi)**

### 2. **Lebih Banyak Klik Booking** 📞
- Umroh Plus Dubai: **48 booking clicks**
- Umroh Keluarga Comfort: 39 booking clicks
- **Selisih: +9 clicks (+23% lebih tinggi)**

### 3. **Conversion Rate Lebih Baik** 📈
- Umroh Plus Dubai: 16.8% (48/285)
- Umroh Keluarga Comfort: 17.6% (39/221)
- *Catatan: Keluarga Comfort memiliki conversion rate sedikit lebih baik*

### 4. **Faktor Daya Tarik** ✨
- **Destinasi Tambahan**: Dubai sebagai bonus destinasi
- **Durasi Lebih Panjang**: 13 hari vs 11 hari
- **Pengalaman Premium**: Kombinasi umroh + wisata

---

## 📐 Formula Popularity Score

```
Score = (Views × 1) + (Favorites × 3) + (Booking Clicks × 5) + (Shares × 2)
```

**Bobot:**
- Views: 1 poin (indikator minat awal)
- Favorites: 3 poin (indikator minat serius)
- Booking Clicks: 5 poin (indikator niat booking)
- Shares: 2 poin (indikator word-of-mouth)

**Perhitungan:**

**Umroh Plus Dubai:**
```
= (285 × 1) + (0 × 3) + (48 × 5) + (0 × 2)
= 285 + 0 + 240 + 0
= 525 poin
```

**Umroh Keluarga Comfort:**
```
= (221 × 1) + (0 × 3) + (39 × 5) + (0 × 2)
= 221 + 0 + 195 + 0
= 416 poin
```

**Selisih: 109 poin (26% lebih tinggi)**

---

## 🔍 Cara Membaca Data

### Metode 1: Menggunakan Prisma Studio (GUI)

1. **Buka Prisma Studio:**
   ```bash
   npx prisma studio
   ```

2. **Navigasi ke Model Package:**
   - Klik "Package" di sidebar kiri
   - Akan muncul tabel dengan semua paket

3. **Cari Paket:**
   - Gunakan search box untuk mencari nama paket
   - Atau scroll untuk menemukan paket

4. **Lihat Metrik Popularitas:**
   - **views**: Jumlah kali paket dilihat
   - **favorites**: Jumlah user yang favoritkan
   - **bookingClicks**: Jumlah klik tombol booking
   - **shareCount**: Jumlah kali paket dibagikan

5. **Bandingkan Angka:**
   - Semakin tinggi angka = semakin populer
   - Fokus pada views dan bookingClicks

### Metode 2: Menggunakan Script (CLI)

1. **Jalankan Script:**
   ```bash
   node scripts/check-package-popularity.js
   ```

2. **Output Otomatis:**
   - Menampilkan data kedua paket
   - Menghitung popularity score
   - Memberikan kesimpulan dan alasan

### Metode 3: Query Database Langsung

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Get package with metrics
const package = await prisma.package.findUnique({
  where: { slug: 'umroh-plus-dubai' },
  select: {
    name: true,
    views: true,
    favorites: true,
    bookingClicks: true,
    shareCount: true
  }
})

console.log(package)
```

---

## 📈 Insight & Rekomendasi

### Untuk "Umroh Plus Dubai" (Pemenang)
✅ **Pertahankan:**
- Strategi marketing yang sudah efektif
- Kombinasi umroh + wisata yang menarik
- Harga premium dengan value yang jelas

🚀 **Tingkatkan:**
- Encourage users untuk favorite dan share
- Tambahkan testimoni dan review
- Highlight unique selling points (Dubai tour)

### Untuk "Umroh Keluarga Comfort"
💡 **Peluang Improvement:**
- Harga lebih terjangkau (Rp 35jt vs Rp 42jt)
- Conversion rate sebenarnya lebih baik (17.6% vs 16.8%)
- Fokus pada family-friendly features
- Tingkatkan visibility dan marketing

📊 **Strategi:**
- Highlight keunggulan harga
- Promosikan sebagai "best value for families"
- Tambahkan family package benefits
- Increase SEO dan social media presence

---

## 🎓 Kesimpulan

**"Umroh Plus Dubai" lebih populer** dengan margin yang signifikan (26% lebih tinggi dalam popularity score).

**Faktor Utama:**
1. ✅ Lebih banyak exposure (285 vs 221 views)
2. ✅ Lebih banyak engagement (48 vs 39 booking clicks)
3. ✅ Unique selling point (Dubai sebagai bonus)
4. ✅ Premium positioning yang jelas

Namun, "Umroh Keluarga Comfort" memiliki **conversion rate yang lebih baik**, menunjukkan bahwa meskipun traffic lebih rendah, kualitas leads-nya bagus. Dengan peningkatan marketing, paket ini berpotensi menyaingi atau bahkan melampaui Umroh Plus Dubai.

---

**Generated**: November 22, 2025
**Data Source**: Production Database
**Analysis Tool**: `scripts/check-package-popularity.js`
