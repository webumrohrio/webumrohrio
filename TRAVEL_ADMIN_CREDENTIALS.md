# Travel Admin Credentials

## Default Travel Admin Account

Akun admin travel telah dibuat untuk testing dan development.

### Login Credentials

```
Username: albarokah
Email: admin@albarokah.com
Password: admin123
```

### Login URL

```
http://localhost:3000/travel-admin/login
```

### Travel Information

- **Nama Travel**: Al Barokah Travel
- **Username**: albarokah
- **Kota**: Jakarta
- **Status**: Verified ✓
- **Rating**: 4.8/5.0
- **Total Jamaah**: 2,500+
- **Tahun Berdiri**: 2013

### Fitur yang Tersedia

Setelah login, admin travel dapat:

1. ✅ Mengelola Paket Umroh
   - Membuat paket baru
   - Edit paket existing
   - Hapus paket
   - Pin/unpin paket

2. ✅ Mengelola Profil Travel
   - Update informasi travel
   - Upload logo dan cover image
   - Kelola galeri foto
   - Update kontak dan alamat

3. ✅ Dashboard Analytics
   - Lihat statistik paket
   - Monitor views dan favorit
   - Track performa travel

### Cara Membuat Akun Travel Admin Baru

Jika ingin membuat akun travel admin baru, jalankan:

```bash
node scripts/seed-travel-admin.js
```

Atau edit script tersebut untuk membuat travel dengan data berbeda.

### Reset Password

Untuk reset password, gunakan bcrypt untuk hash password baru:

```javascript
const bcrypt = require('bcryptjs')
const hashedPassword = await bcrypt.hash('password_baru', 10)
```

Kemudian update di database:

```javascript
await prisma.travel.update({
  where: { username: 'albarokah' },
  data: { password: hashedPassword }
})
```

### Security Notes

⚠️ **PENTING**: 
- Password default ini hanya untuk development
- Ganti password setelah login pertama kali
- Jangan gunakan credentials ini di production
- Pastikan menggunakan password yang kuat di production

### Troubleshooting

**Tidak bisa login?**
1. Pastikan username dan password benar (case-sensitive)
2. Cek apakah travel sudah ada di database
3. Pastikan password sudah di-hash dengan bcrypt
4. Cek console browser untuk error

**Lupa password?**
1. Jalankan ulang script seed: `node scripts/seed-travel-admin.js`
2. Atau reset manual via database

---

**Created**: November 22, 2025
**Last Updated**: November 22, 2025
