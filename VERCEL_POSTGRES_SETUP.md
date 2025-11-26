# Setup PostgreSQL di Vercel

## Langkah-langkah Setup Database Production

### 1. Buat Vercel Postgres Database

1. Buka dashboard Vercel: https://vercel.com/dashboard
2. Pilih project **webumrohrio**
3. Klik tab **Storage**
4. Klik **Create Database**
5. Pilih **Postgres**
6. Pilih region: **Singapore (sin1)** (terdekat dengan Indonesia)
7. Klik **Create**

### 2. Connect Database ke Project

Setelah database dibuat, Vercel akan otomatis:
- Generate connection string
- Set environment variables:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL` ← **Gunakan ini untuk Prisma**
  - `POSTGRES_URL_NON_POOLING`

### 3. Update Environment Variable

Di Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Cari variable `DATABASE_URL`
3. Jika belum ada, tambahkan:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy dari `POSTGRES_PRISMA_URL` (sudah auto-generated)
   - **Environment:** Production, Preview, Development

### 4. Deploy Ulang

Setelah environment variable di-set:

```bash
git add .
git commit -m "Change to PostgreSQL for production"
git push origin main
```

Atau trigger manual:
```bash
vercel --prod
```

### 5. Run Migration (Opsional)

Jika ingin migrate data dari SQLite ke PostgreSQL:

1. Export data dari SQLite lokal
2. Import ke PostgreSQL production

Atau biarkan kosong dan isi data manual via admin panel.

## Verifikasi

Setelah deploy, cek:
1. Website bisa diakses tanpa error
2. Bisa login ke admin panel
3. Bisa create/read data

## Troubleshooting

### Error: "the URL must start with the protocol `file:`"
- Environment variable `DATABASE_URL` belum di-set di Vercel
- Solusi: Set `DATABASE_URL` di Vercel dashboard

### Error: "Can't reach database server"
- Connection string salah
- Solusi: Gunakan `POSTGRES_PRISMA_URL` bukan `POSTGRES_URL`

### Database kosong setelah deploy
- Normal, database baru memang kosong
- Solusi: Isi data via admin panel atau import data

## Catatan Penting

✅ **PostgreSQL** cocok untuk production (persistent, scalable)
❌ **SQLite** tidak cocok untuk Vercel (ephemeral filesystem)

## Free Tier Limits (Vercel Postgres)

- Storage: 256 MB
- Compute: 60 hours/month
- Rows: Unlimited
- Connections: 60 concurrent

Cukup untuk project kecil-menengah!
