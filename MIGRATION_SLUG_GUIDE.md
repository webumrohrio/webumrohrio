# 🚀 Package Slug Migration Guide

## Tujuan
Mengubah URL dari `/paket-umroh/[id]` menjadi `/[username]/paket/[slug]`
Contoh: `/safira-travel/paket/umroh-plus-turki-15-hari`

## ⚠️ PENTING: Backup Database Dulu!
```bash
# Backup database
copy prisma\db\custom.db prisma\db\custom.db.backup
```

## 📋 Langkah-Langkah Migration

### Step 1: Stop Semua Proses
- Stop development server (Ctrl+C)
- Tutup semua terminal yang mengakses database
- Tutup Prisma Studio jika terbuka

### Step 2: Update Database Schema
Database schema sudah diupdate di `prisma/schema.prisma` dengan field `slug` (optional).

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Push Schema ke Database
```bash
npx prisma db push
```

Jika ada warning, pilih "yes" untuk ignore.

### Step 5: Generate Slug untuk Data Existing
```bash
node scripts/add-package-slug.js
```

Script ini akan:
- Membaca semua package dari database
- Generate slug dari nama package
- Handle duplicate slug dengan menambah counter
- Update database dengan slug baru

### Step 6: Verifikasi
```bash
npx prisma studio
```

Buka Prisma Studio dan cek tabel Package, pastikan semua record punya slug.

### Step 7: Update Schema (Make Slug Required)
Setelah semua package punya slug, edit `prisma/schema.prisma`:

Ubah dari:
```prisma
slug  String?  @unique
```

Menjadi:
```prisma
slug  String   @unique
```

Lalu jalankan:
```bash
npx prisma db push
```

### Step 8: Start Server
```bash
npm run dev
```

## 🔧 Troubleshooting

### Database Locked Error
Jika muncul "database is locked":
1. Stop semua proses Node.js
2. Tutup Prisma Studio
3. Restart komputer jika perlu
4. Coba lagi

### Slug Already Exists Error
Script sudah handle duplicate dengan menambah counter otomatis.

### Migration Failed
Restore dari backup:
```bash
copy prisma\db\custom.db.backup prisma\db\custom.db
```

## ✅ Checklist
- [ ] Backup database
- [ ] Stop semua proses
- [ ] Generate Prisma client
- [ ] Push schema
- [ ] Run migration script
- [ ] Verifikasi di Prisma Studio
- [ ] Make slug required
- [ ] Test aplikasi

## 📞 Support
Jika ada masalah, cek error message dan pastikan:
- Tidak ada proses yang mengakses database
- Backup sudah dibuat
- Prisma client sudah di-generate
