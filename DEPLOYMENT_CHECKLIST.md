# Checklist Deployment

## ✅ Persiapan Selesai

- [x] Update Prisma schema ke PostgreSQL
- [x] Buat file .env.example
- [x] Update package.json scripts
- [x] Install Cloudinary package
- [x] Buat utility Cloudinary
- [x] Buat vercel.json

## 📋 Yang Perlu Dilakukan

### 1. Setup Akun-akun (15 menit)

- [ ] **Neon Database**
  - Daftar di https://neon.tech
  - Buat project baru
  - Copy connection string
  - Format: `postgresql://user:pass@host/db?sslmode=require`

- [ ] **Cloudinary**
  - Daftar di https://cloudinary.com
  - Dari dashboard, catat:
    - Cloud Name
    - API Key
    - API Secret

- [ ] **Vercel**
  - Daftar di https://vercel.com
  - Connect dengan GitHub account

### 2. Persiapan Repository (5 menit)

```bash
# Di folder webumrohrio
git add .
git commit -m "Setup for Vercel deployment with Neon DB and Cloudinary"
git push origin main
```

### 3. Deploy ke Vercel (10 menit)

- [ ] Login ke Vercel Dashboard
- [ ] Klik "Add New" → "Project"
- [ ] Import repository `webumrohrio`
- [ ] Configure Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=(generate dengan: openssl rand -base64 32)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

- [ ] Klik "Deploy"
- [ ] Tunggu build selesai

### 4. Testing (10 menit)

- [ ] Buka URL Vercel
- [ ] Test login admin
- [ ] Test upload gambar
- [ ] Test create package
- [ ] Test view packages
- [ ] Cek database di Neon dashboard
- [ ] Cek uploads di Cloudinary dashboard

### 5. Update Kode Upload (Jika Diperlukan)

Jika ada kode yang masih upload ke local storage, update untuk menggunakan Cloudinary:

```typescript
import { uploadToCloudinary } from '@/lib/cloudinary';

// Contoh penggunaan
const result = await uploadToCloudinary(file, 'packages');
const imageUrl = result.secure_url;
```

### 6. Custom Domain (Opsional)

- [ ] Beli domain (Namecheap, GoDaddy, dll)
- [ ] Di Vercel: Settings → Domains
- [ ] Add domain
- [ ] Update DNS records
- [ ] Update NEXTAUTH_URL

## 🔧 Troubleshooting

### Build gagal di Vercel?
1. Cek Vercel logs
2. Pastikan semua env variables sudah diset
3. Cek DATABASE_URL format benar

### Database error?
1. Test connection string di local dulu
2. Pastikan `?sslmode=require` ada
3. Cek Neon dashboard untuk status

### Upload gambar error?
1. Cek Cloudinary credentials
2. Test di local dulu dengan .env
3. Cek quota Cloudinary

## 📞 Bantuan

Jika ada masalah, cek:
- Vercel logs: https://vercel.com/dashboard
- Neon dashboard: https://console.neon.tech
- Cloudinary dashboard: https://cloudinary.com/console

## 🎉 Setelah Deploy

- Monitor performa di Vercel Analytics
- Setup backup database secara berkala
- Monitor usage Cloudinary
- Consider upgrade ke paid plan jika traffic tinggi
