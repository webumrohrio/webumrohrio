# 📊 SEO Metadata Management Guide

## ✅ Metadata Terpusat dari Admin Panel

Semua halaman website menggunakan metadata yang **sama dan konsisten** dari Admin Panel.

### 🎯 Sumber Data Metadata:

Semua metadata diambil dari **Database Settings** yang bisa diedit di:
- **URL:** http://localhost:3000/admintrip/settings
- **Tab:** SEO Settings

### 📝 Field yang Digunakan:

| Field | Database Key | Digunakan Untuk | Contoh |
|-------|--------------|-----------------|--------|
| **Meta Title** | `metaTitle` | - Document title<br>- OG title<br>- Twitter title | "Tripbaitullah - Smart Way to Go Kabah" |
| **Meta Description** | `metaDescription` | - Meta description<br>- OG description<br>- Twitter description | "Bandingkan, Pilih, Berangkat" |
| **Meta Keywords** | `metaKeywords` | - SEO keywords | "umroh, travel umroh, umroh pekanbaru" |
| **OG Image** | `ogImage` | - Open Graph image<br>- Twitter image | URL gambar (1200x630px) |

---

## 🔄 Alur Kerja Metadata:

```
Admin Panel (Input)
    ↓
Database (Settings Table)
    ↓
layout.tsx (getSiteSettings)
    ↓
generateMetadata()
    ↓
HTML Meta Tags
    ↓
Social Media Crawlers (Facebook, WhatsApp, Twitter)
```

---

## 📍 Halaman yang Menggunakan Metadata:

### ✅ Semua Halaman Menggunakan Metadata yang Sama:

1. **Homepage** (`/`)
2. **Paket Umroh** (`/paket-umroh`)
3. **Travel Umroh** (`/travel-umroh`)
4. **Artikel** (`/artikel`)
5. **Profile** (`/profile`)
6. **Bantuan** (`/bantuan`)
7. **Detail Paket** (`/[username]/paket/[slug]`)
8. **Dan semua halaman lainnya**

### 🎯 Tidak Ada Override:

Tidak ada halaman yang memiliki metadata sendiri. Semua inherit dari `layout.tsx` root.

---

## 🛠️ Cara Edit Metadata:

### 1. Login ke Admin Panel
```
http://localhost:3000/admintrip/login
Username: admin
Password: admin123
```

### 2. Buka Settings → Tab "SEO Settings"

### 3. Edit Field:
- **Meta Title** - Judul website (max 60 karakter)
- **Meta Description** - Deskripsi website (max 160 karakter)
- **Meta Keywords** - Kata kunci, pisahkan dengan koma
- **OG Image** - Upload gambar 1200x630px

### 4. Klik "Simpan SEO Settings"

### 5. Restart Development Server (untuk localhost):
```bash
Ctrl+C
npm run dev
```

### 6. Clear Cache:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Hard refresh browser
Ctrl + Shift + R
```

---

## 🧪 Cara Test Metadata:

### 1. Cek Database:
```bash
node scripts/check-seo-settings.js
```

### 2. View Page Source:
- Buka website
- Tekan `Ctrl + U`
- Cari `og:title`, `og:description`, `og:image`

### 3. Test dengan Facebook Debugger:
- URL: https://developers.facebook.com/tools/debug/
- Paste URL website
- Klik "Scrape Again"
- Lihat preview

### 4. Test dengan Twitter Card Validator:
- URL: https://cards-dev.twitter.com/validator
- Paste URL website
- Lihat preview

---

## 📊 Struktur Meta Tags yang Di-generate:

```html
<!-- Primary Meta Tags -->
<title>Tripbaitullah - Smart Way to Go Kabah</title>
<meta name="description" content="Bandingkan, Pilih, Berangkat" />
<meta name="keywords" content="umroh, travel umroh, umroh pekanbaru, travel umroh pekanbaru" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.tripbaitullah.com" />
<meta property="og:title" content="Tripbaitullah - Smart Way to Go Kabah" />
<meta property="og:description" content="Bandingkan, Pilih, Berangkat" />
<meta property="og:image" content="https://www.tripbaitullah.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="Tripbaitullah - Smart Way to Go Kabah" />
<meta property="twitter:description" content="Bandingkan, Pilih, Berangkat" />
<meta property="twitter:image" content="https://www.tripbaitullah.com/og-image.png" />
```

---

## ⚠️ Troubleshooting:

### Metadata Tidak Berubah?

1. **Cek Database:**
   ```bash
   node scripts/check-seo-settings.js
   ```

2. **Restart Server:**
   ```bash
   Ctrl+C
   npm run dev
   ```

3. **Clear Cache:**
   ```bash
   rm -rf .next
   ```

4. **Hard Refresh Browser:**
   ```
   Ctrl + Shift + R
   ```

5. **Clear Facebook Cache:**
   - Buka Facebook Debugger
   - Klik "Scrape Again" beberapa kali
   - Tunggu 5-10 menit

### OG Image Tidak Muncul?

1. **Pastikan URL Absolut:**
   - Harus dimulai dengan `https://`
   - Contoh: `https://www.tripbaitullah.com/og-image.png`

2. **Upload via Admin:**
   - Upload gambar di admin panel
   - Gambar akan otomatis di-upload ke Cloudinary
   - URL akan otomatis absolut

3. **Ukuran Gambar:**
   - Ideal: 1200x630 pixels
   - Format: JPG, PNG, WebP
   - Max size: 5MB

---

## 📚 File Terkait:

- **Layout:** `src/app/layout.tsx`
- **Admin Settings:** `src/app/admintrip/settings/page.tsx`
- **Check Script:** `scripts/check-seo-settings.js`
- **Init Script:** `scripts/init-seo-settings.js`

---

## ✅ Checklist Deployment:

- [ ] Edit metadata di admin panel
- [ ] Upload OG image (1200x630px)
- [ ] Test di localhost
- [ ] View page source untuk verify
- [ ] Deploy ke production
- [ ] Test dengan Facebook Debugger
- [ ] Test dengan Twitter Card Validator
- [ ] Share link di WhatsApp untuk test preview

---

**Last Updated:** 27 November 2025
**Maintained By:** Development Team
