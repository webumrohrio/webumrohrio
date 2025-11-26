# 🗄️ Database Backup Guide - Production (Vercel + Neon)

## ⚠️ Important Note

**Backup feature di Admin Panel tidak berfungsi di Vercel** karena Vercel menggunakan read-only filesystem. Namun, database Anda **AMAN** karena Neon PostgreSQL menyediakan backup otomatis.

## ✅ Neon PostgreSQL Automatic Backups

### Fitur Backup Neon:

1. **Automatic Daily Backups**
   - Neon otomatis backup database setiap hari
   - Backup disimpan selama 7 hari (Free tier)
   - Backup disimpan selama 30 hari (Pro tier)

2. **Point-in-Time Recovery (PITR)**
   - Restore database ke waktu tertentu
   - Tersedia di Pro tier
   - Akurasi hingga detik

3. **Branch System**
   - Buat copy database untuk testing
   - Tidak mempengaruhi production
   - Gratis dan instant

## 📋 Cara Backup Manual

### Opsi 1: Via Neon Console (Recommended)

1. **Login ke Neon Console**
   - Buka: https://console.neon.tech
   - Login dengan akun Anda

2. **Pilih Project**
   - Pilih project `neondb`

3. **Create Branch (Backup)**
   - Go to **Branches**
   - Click **Create Branch**
   - Name: `backup-2024-11-26` (atau tanggal saat ini)
   - Source: `main`
   - Click **Create**

4. **Branch = Backup**
   - Branch adalah copy lengkap database
   - Bisa di-restore kapan saja
   - Tidak ada biaya tambahan

### Opsi 2: Export via pg_dump

1. **Install PostgreSQL Client**
   ```bash
   # Windows (via Chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Export Database**
   ```bash
   pg_dump "postgresql://neondb_owner:npg_eFL38dClHxzw@ep-shy-art-a1a0yde0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" > backup-$(date +%Y%m%d).sql
   ```

3. **File Backup**
   - File `.sql` akan tersimpan di folder Anda
   - Simpan di tempat aman (Google Drive, Dropbox, dll)

### Opsi 3: Via Prisma Studio

1. **Buka Prisma Studio**
   ```bash
   cd webumrohrio
   npx prisma studio
   ```

2. **Export Data**
   - Buka setiap table
   - Export ke CSV/JSON
   - Simpan file

## 🔄 Cara Restore Database

### Restore dari Neon Branch:

1. **Login ke Neon Console**
2. **Go to Branches**
3. **Pilih branch backup**
4. **Set as Primary** atau **Copy connection string**
5. **Update DATABASE_URL** di Vercel jika perlu

### Restore dari SQL File:

```bash
psql "postgresql://neondb_owner:npg_eFL38dClHxzw@ep-shy-art-a1a0yde0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" < backup-20241126.sql
```

## 📊 Monitoring Database

### Neon Dashboard:
- **Storage Usage:** Cek berapa banyak data tersimpan
- **Query Performance:** Monitor query yang lambat
- **Connection Stats:** Lihat jumlah koneksi aktif

### Vercel Logs:
- **Database Errors:** Cek error di Vercel logs
- **Slow Queries:** Identifikasi query yang perlu optimasi

## 🔒 Best Practices

### 1. Regular Backups
- ✅ Neon otomatis backup setiap hari
- ✅ Buat manual branch sebelum update besar
- ✅ Export SQL file setiap minggu/bulan

### 2. Test Restore
- ✅ Test restore process secara berkala
- ✅ Pastikan backup bisa di-restore
- ✅ Gunakan branch untuk testing

### 3. Multiple Backup Locations
- ✅ Neon automatic backups
- ✅ Manual SQL exports (Google Drive)
- ✅ Branch backups di Neon

### 4. Before Major Changes
- ✅ Buat branch backup
- ✅ Test di branch dulu
- ✅ Baru apply ke production

## 📅 Backup Schedule Recommendation

### Daily (Automatic):
- ✅ Neon automatic backups

### Weekly (Manual):
- ☐ Create Neon branch
- ☐ Export SQL file
- ☐ Upload to cloud storage

### Monthly (Manual):
- ☐ Full database export
- ☐ Verify backup integrity
- ☐ Test restore process

## 🆘 Emergency Recovery

### Jika Data Hilang:

1. **Check Neon Automatic Backups**
   - Login ke Neon Console
   - Go to Backups
   - Restore dari backup terakhir

2. **Use Branch Backup**
   - Go to Branches
   - Pilih branch backup
   - Set as primary atau copy data

3. **Restore from SQL File**
   - Gunakan file backup manual
   - Run restore command

## 💡 Tips

1. **Jangan Panik**
   - Neon punya automatic backups
   - Data bisa di-restore

2. **Regular Testing**
   - Test restore process
   - Pastikan backup valid

3. **Multiple Copies**
   - Simpan backup di beberapa tempat
   - Cloud storage + local

4. **Document Process**
   - Catat langkah backup/restore
   - Share dengan team

## 📞 Support

### Neon Support:
- Documentation: https://neon.tech/docs
- Discord: https://discord.gg/neon
- Email: support@neon.tech

### Vercel Support:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

---

**Remember:** Database Anda di Neon PostgreSQL **AMAN** dengan automatic backups. Fitur backup di admin panel hanya untuk development local.
