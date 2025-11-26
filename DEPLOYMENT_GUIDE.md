# Panduan Deployment ke Vercel dengan Neon DB dan Cloudinary

## Persiapan

### 1. Setup Neon Database

1. Buat akun di [Neon](https://neon.tech)
2. Buat project baru
3. Copy connection string yang diberikan
4. Format: `postgresql://username:password@host/database?sslmode=require`

### 2. Setup Cloudinary

1. Buat akun di [Cloudinary](https://cloudinary.com)
2. Dari dashboard, ambil:
   - Cloud Name
   - API Key
   - API Secret

### 3. Setup Vercel

1. Buat akun di [Vercel](https://vercel.com)
2. Install Vercel CLI (opsional):
   ```bash
   npm install -g vercel
   ```

## Langkah Deployment

### A. Deploy via Vercel Dashboard (Recommended)

1. **Push ke GitHub**
   ```bash
   cd webumrohrio
   git add .
   git commit -m "Setup for Vercel deployment"
   git push origin main
   ```

2. **Import Project di Vercel**
   - Login ke [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik "Add New" → "Project"
   - Import repository GitHub Anda
   - Pilih repository `webumrohrio`

3. **Configure Environment Variables**
   
   Di Vercel dashboard, tambahkan environment variables berikut:
   
   ```
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=generate-random-string-here
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NODE_ENV=production
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai
   - Vercel akan otomatis menjalankan migrasi database

### B. Deploy via Vercel CLI

1. **Login ke Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   cd webumrohrio
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

## Migrasi Database

Setelah deployment pertama, database akan otomatis ter-migrate. Jika perlu manual:

```bash
# Set DATABASE_URL di local
export DATABASE_URL="your-neon-connection-string"

# Run migration
npm run db:migrate:deploy
```

## Update Kode untuk Cloudinary

Anda perlu mengupdate kode upload file untuk menggunakan Cloudinary. Contoh:

### Install Cloudinary SDK
```bash
npm install cloudinary
```

### Buat utility untuk upload
Buat file `src/lib/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File, folder: string = 'umroh') {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

export default cloudinary;
```

## Testing

1. **Test Local dengan Neon DB**
   ```bash
   # Copy .env.example ke .env
   cp .env.example .env
   
   # Edit .env dengan credentials Anda
   # Jalankan migrasi
   npm run db:migrate
   
   # Jalankan development server
   npm run dev
   ```

2. **Test Production**
   - Buka URL Vercel Anda
   - Test semua fitur utama
   - Cek upload gambar ke Cloudinary
   - Cek koneksi database

## Troubleshooting

### Build Error di Vercel
- Cek logs di Vercel dashboard
- Pastikan semua environment variables sudah diset
- Pastikan DATABASE_URL valid

### Database Connection Error
- Pastikan connection string Neon benar
- Cek apakah IP Vercel di-whitelist (Neon biasanya allow all by default)
- Pastikan `?sslmode=require` ada di connection string

### Cloudinary Upload Error
- Cek credentials Cloudinary
- Pastikan API key dan secret benar
- Cek quota Cloudinary Anda

## Custom Domain (Opsional)

1. Di Vercel dashboard, pilih project Anda
2. Go to Settings → Domains
3. Add custom domain
4. Update DNS records sesuai instruksi Vercel
5. Update NEXTAUTH_URL dengan domain baru

## Monitoring

- **Vercel Analytics**: Otomatis aktif untuk monitoring performa
- **Neon Dashboard**: Monitor database usage dan queries
- **Cloudinary Dashboard**: Monitor storage dan bandwidth

## Backup Database

Untuk backup database Neon:

```bash
# Install pg_dump (PostgreSQL client)
# Backup
pg_dump "your-neon-connection-string" > backup.sql

# Restore
psql "your-neon-connection-string" < backup.sql
```

## Notes

- Vercel free tier: Unlimited deployments, 100GB bandwidth
- Neon free tier: 0.5GB storage, 1 project
- Cloudinary free tier: 25GB storage, 25GB bandwidth/month
- Untuk production, pertimbangkan upgrade ke paid plan
