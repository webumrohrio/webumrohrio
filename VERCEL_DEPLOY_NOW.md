# 🚀 Deploy ke Vercel - Langkah Cepat

## ✅ Yang Sudah Selesai:
- ✅ Database Neon sudah terkoneksi
- ✅ Cloudinary sudah dikonfigurasi
- ✅ Code sudah di-push ke GitHub
- ✅ Local testing berhasil

## 🎯 Tinggal Deploy ke Vercel (10 menit):

### 1. Login ke Vercel
Buka: https://vercel.com/login

### 2. Import Project
1. Klik **"Add New"** → **"Project"**
2. Pilih **"Import Git Repository"**
3. Cari dan pilih: **webumrohrio/webumrohrio**
4. Klik **"Import"**

### 3. Configure Project
Di halaman Configure Project:

**Framework Preset:** Next.js (otomatis terdeteksi)

**Root Directory:** `./` (default)

**Build Command:** (biarkan default atau gunakan)
```
prisma generate && prisma db push && next build
```

**Output Directory:** `.next` (default)

### 4. Environment Variables
Klik **"Environment Variables"** dan tambahkan satu per satu:

```
DATABASE_URL
postgresql://neondb_owner:npg_eFL38dClHxzw@ep-shy-art-a1a0yde0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL
https://your-project-name.vercel.app

NEXTAUTH_SECRET
h0AHEz4pniJ/jq6ke7o2GbsyvwvgIRv2kxVae7lju0M=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
dpgsrkvh8

CLOUDINARY_API_KEY
421747612937511

CLOUDINARY_API_SECRET
wfsqCxecnwM7Xblg74UiH_xi9Zs

NODE_ENV
production
```

**PENTING:** Untuk `NEXTAUTH_URL`, gunakan URL yang akan diberikan Vercel (contoh: `https://webumrohrio.vercel.app`). Anda bisa update ini nanti setelah deploy pertama.

### 5. Deploy!
1. Klik **"Deploy"**
2. Tunggu 2-3 menit
3. Vercel akan:
   - Install dependencies
   - Generate Prisma Client
   - Push schema ke database
   - Build Next.js
   - Deploy!

### 6. Update NEXTAUTH_URL (Setelah Deploy Pertama)
1. Setelah deploy selesai, copy URL yang diberikan (contoh: `https://webumrohrio.vercel.app`)
2. Di Vercel dashboard, pergi ke: **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` dengan URL yang benar
4. Klik **"Save"**
5. Redeploy: **Deployments** → klik titik tiga → **"Redeploy"**

## 🎉 Selesai!

Website Anda sudah live di internet!

## 📝 Testing Checklist:
- [ ] Buka URL Vercel
- [ ] Test halaman home
- [ ] Test login admin
- [ ] Test upload gambar (akan ke Cloudinary)
- [ ] Test create package
- [ ] Test view packages

## 🔧 Troubleshooting:

### Build Error?
- Cek **Deployment Logs** di Vercel
- Pastikan semua environment variables sudah benar
- Cek DATABASE_URL tidak ada spasi atau karakter aneh

### Database Error?
- Test koneksi database di local dulu
- Pastikan Neon database masih aktif
- Cek di Neon dashboard

### Cloudinary Error?
- Cek credentials di Cloudinary dashboard
- Pastikan API Key dan Secret benar
- Cek quota Cloudinary

## 🌐 Custom Domain (Opsional):
1. Di Vercel: **Settings** → **Domains**
2. Add domain Anda
3. Update DNS records sesuai instruksi
4. Update `NEXTAUTH_URL` dengan domain baru

## 📊 Monitoring:
- **Vercel Analytics**: Otomatis aktif
- **Neon Dashboard**: https://console.neon.tech
- **Cloudinary Dashboard**: https://cloudinary.com/console

---

**Need Help?** Cek dokumentasi lengkap di `DEPLOYMENT_GUIDE.md`
