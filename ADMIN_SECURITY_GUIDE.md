# Panduan Keamanan Admin Panel

## URL Admin Panel Baru

**URL Lama (TIDAK AKTIF):** `http://localhost:3000/admin`  
**URL Baru (AKTIF):** `http://localhost:3000/admintrip`

⚠️ **PENTING:** Jangan share URL admin panel ke publik!

---

## Fitur Keamanan yang Diterapkan

### 1. Custom Secret Path ✅
- Path admin diganti dari `/admin` ke `/admintrip`
- Path lama `/admin` akan redirect ke 404
- Mengurangi risiko brute force attack

### 2. Rate Limiting ✅
- **Maksimal 5 percobaan login gagal**
- **Lockout 15 menit** setelah 5x gagal
- **Delay 2 detik** antar percobaan login
- Mencegah brute force attack

### 3. Secure Session Management ✅
- Session timeout: **8 jam**
- HttpOnly cookies (tidak bisa diakses JavaScript)
- SameSite: Strict (mencegah CSRF)
- Secure flag di production (HTTPS only)

### 4. Security Headers ✅
- `X-Frame-Options: DENY` - Mencegah clickjacking
- `X-Content-Type-Options: nosniff` - Mencegah MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Batasi akses browser API

### 5. Logging & Monitoring ✅
- Log setiap percobaan login (sukses/gagal)
- Catat IP address dan timestamp
- Monitor untuk deteksi aktivitas mencurigakan

---

## Credentials Default

**⚠️ WAJIB DIGANTI DI PRODUCTION!**

```
Username: admin
Password: admin123
```

### Cara Mengganti Credentials

1. Buat file `.env` di root project
2. Copy dari `.env.example`
3. Ubah nilai:
```env
ADMIN_USERNAME=username_baru_anda
ADMIN_PASSWORD=password_kuat_anda
```

### Tips Password Kuat:
- Minimal 12 karakter
- Kombinasi huruf besar, kecil, angka, simbol
- Jangan gunakan kata umum
- Contoh: `Tr!pB@1t_2024#Secure`

---

## Cara Mengakses Admin Panel

### Development (Local)
```
http://localhost:3000/admintrip/login
```

### Production
```
https://yourdomain.com/admintrip/login
```

---

## Best Practices

### 1. Jangan Share URL Admin
❌ Jangan posting URL admin di:
- Social media
- Public documentation
- GitHub README
- Email blast

✅ Share hanya ke:
- Tim internal
- Melalui channel aman (encrypted chat)
- Dokumentasi internal

### 2. Gunakan HTTPS di Production
```nginx
# Nginx config example
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Force HTTPS
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### 3. Backup Regular
- Backup database setiap hari
- Simpan di lokasi aman
- Test restore procedure

### 4. Update Dependencies
```bash
npm audit
npm audit fix
npm update
```

### 5. Monitor Logs
Cek log secara berkala untuk aktivitas mencurigakan:
```bash
# Cari failed login attempts
grep "Failed admin login" logs/*.log

# Cari IP yang mencurigakan
grep "SECURITY" logs/*.log | sort | uniq -c
```

---

## Troubleshooting

### Lupa Password?
1. Edit file `src/app/api/admintrip/login/route.ts`
2. Temporary hardcode credentials baru
3. Login dan ganti di settings
4. Revert hardcode

### Terkunci (Too Many Attempts)?
1. Tunggu 15 menit
2. Atau restart server untuk clear rate limit
3. Atau edit `src/middleware.ts` untuk clear IP dari map

### Session Expired?
- Session timeout setelah 8 jam idle
- Login ulang untuk mendapatkan session baru

---

## Upgrade Keamanan (Opsional)

### Level 1: Two-Factor Authentication (2FA)
Tambahkan Google Authenticator atau SMS OTP

### Level 2: IP Whitelist
Hanya izinkan akses dari IP tertentu:
```typescript
const ALLOWED_IPS = ['192.168.1.100', '103.xxx.xxx.xxx']
```

### Level 3: VPN Required
Wajibkan koneksi melalui VPN untuk akses admin

### Level 4: Hardware Security Key
Gunakan YubiKey atau hardware token

---

## Checklist Deployment Production

- [ ] Ganti ADMIN_USERNAME dan ADMIN_PASSWORD
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure firewall
- [ ] Setup monitoring & alerts
- [ ] Backup strategy
- [ ] Test rate limiting
- [ ] Test session timeout
- [ ] Document admin URL (internal only)
- [ ] Train admin users

---

## Emergency Contacts

Jika terjadi security breach:
1. Immediately change admin credentials
2. Check server logs
3. Review recent changes
4. Contact security team
5. Consider taking site offline temporarily

---

## Changelog

### v1.0.0 (Current)
- ✅ Custom secret path `/admintrip`
- ✅ Rate limiting (5 attempts, 15 min lockout)
- ✅ Secure session management
- ✅ Security headers
- ✅ Login attempt logging

### Future Enhancements
- [ ] Two-Factor Authentication
- [ ] IP Whitelist option
- [ ] Email alerts for failed logins
- [ ] Admin activity audit log
- [ ] Password strength requirements
- [ ] Password reset via email

---

**Last Updated:** 2024
**Maintained By:** Development Team
