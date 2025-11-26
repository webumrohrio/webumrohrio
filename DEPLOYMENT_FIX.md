# Fix Deployment Error - Prisma Schema Validation

## Error yang Terjadi
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

## Penyebab
Database provider di `prisma/schema.prisma` adalah **sqlite** yang memerlukan URL dengan format `file:./path/to/db.sqlite`, tapi environment variable `DATABASE_URL` tidak tersedia atau tidak sesuai format saat build.

## Solusi

### Opsi 1: Deploy dengan SQLite (Tidak Direkomendasikan untuk Production)

SQLite tidak cocok untuk production di platform seperti Vercel karena filesystem bersifat read-only dan ephemeral.

Jika tetap ingin menggunakan SQLite untuk testing:

1. Set environment variable di platform deployment:
   ```
   DATABASE_URL="file:./db/custom.db"
   ```

2. Pastikan folder `db/` dan file `custom.db` ada di repository

**Catatan**: Data akan hilang setiap kali redeploy!

### Opsi 2: Gunakan PostgreSQL untuk Production (RECOMMENDED)

#### Step 1: Setup PostgreSQL Database

Pilih salah satu provider:
- **Vercel Postgres** (gratis untuk hobby projects)
- **Supabase** (gratis dengan limit)
- **Railway** (gratis dengan limit)
- **Neon** (gratis serverless postgres)

#### Step 2: Ubah Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Ubah dari "sqlite" ke "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Set Environment Variable

Di platform deployment (Vercel/Netlify/Railway), tambahkan:

```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

Ganti dengan connection string dari provider PostgreSQL Anda.

#### Step 4: Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Step 5: Commit dan Push

```bash
git add .
git commit -m "Change database to PostgreSQL for production"
git push origin main
```

### Opsi 3: Dual Database (SQLite Local, PostgreSQL Production)

Gunakan environment variable untuk switch database:

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Local (.env):**
```
DATABASE_URL="file:./db/custom.db"
```

Ubah provider ke "sqlite" saat development, "postgresql" saat production.

## Rekomendasi

Untuk production deployment, **gunakan PostgreSQL** (Opsi 2):

1. Daftar di Vercel Postgres atau Supabase (gratis)
2. Dapatkan connection string
3. Ubah schema.prisma ke postgresql
4. Set DATABASE_URL di environment variables
5. Deploy

## Quick Fix untuk Deploy Sekarang

Jika ingin deploy cepat tanpa database (hanya untuk testing UI):

1. Ubah `package.json` build script:
   ```json
   "build": "next build"
   ```
   
   Hapus `prisma generate && prisma db push &&` dari build script

2. Commit dan push

**Catatan**: Fitur yang memerlukan database tidak akan berfungsi!

## Bantuan Lebih Lanjut

Jika masih error, share:
1. Platform deployment yang digunakan (Vercel/Netlify/Railway/dll)
2. Screenshot error lengkap
3. Apakah ingin menggunakan SQLite atau PostgreSQL
