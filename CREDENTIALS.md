# 🔐 Login Credentials - Trip Baitullah

## Admin Account (Super Admin)

**Login URL:** `/admintrip/login` atau `https://your-domain.vercel.app/admintrip/login`

- **Username:** `tripbaitullah`
- **Password:** `Admin@2024`
- **Email:** tripbaitullah.official@gmail.com
- **Role:** Super Admin

**Akses:**
- Kelola semua travel agencies
- Kelola semua packages
- Kelola users
- Kelola articles
- Kelola videos
- Kelola sliders
- System settings
- Database backup/restore

---

## User Account (Regular User)

**Login URL:** `/login` atau `https://your-domain.vercel.app/login`

- **Email:** `user@tripbaitullah.com`
- **Password:** `User@2024`
- **Name:** Trip Baitullah User
- **Phone:** +62 812 3456 7890

**Akses:**
- Browse paket umroh
- Favorite packages
- Read articles
- View travel profiles
- Edit profile

---

## Travel Admin Accounts (From Seed Data)

**Login URL:** `/travel-admin/login`

### 1. Alhijaz Indowisata (Verified ✓)
- **Username:** `alhijaz-indowisata`
- **Password:** `travel123`
- **City:** Jakarta

### 2. Raudhah Travel (Verified ✓)
- **Username:** `raudhah-travel`
- **Password:** `travel123`
- **City:** Surabaya

### 3. Safira Travel
- **Username:** `safira-travel`
- **Password:** `travel123`
- **City:** Medan

### 4. Baitul Makmur Tour (Verified ✓)
- **Username:** `baitul-makmur`
- **Password:** `travel123`
- **City:** Bandung

**Akses Travel Admin:**
- Kelola packages milik travel sendiri
- Edit profile travel
- View statistics
- Manage bookings

---

## Default Admin (From Seed Data)

**Login URL:** `/admintrip/login`

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Super Admin

---

## 🔒 Security Notes

1. **PENTING:** Ganti semua password default setelah login pertama kali
2. Jangan share credentials ini di public repository
3. Gunakan password yang kuat untuk production
4. Enable 2FA jika tersedia
5. Backup credentials di tempat yang aman

---

## 📝 Change Password

### Admin:
1. Login ke `/admintrip/login`
2. Go to Profile/Settings
3. Change password

### User:
1. Login ke `/login`
2. Go to `/pengaturan` (Settings)
3. Change password

### Travel Admin:
1. Login ke `/travel-admin/login`
2. Go to Profile
3. Change password

---

## 🗄️ Database Info

**Database:** Neon PostgreSQL
**Connection:** Already configured in Vercel environment variables

**Seed Data Includes:**
- 2 Super Admins (admin + tripbaitullah)
- 2 Regular Users (rio@gmail.com + user@tripbaitullah.com)
- 4 Travel Agencies
- 8 Umroh Packages
- 3 Articles
- System Settings

---

**Last Updated:** November 26, 2025
**Environment:** Production (Vercel + Neon DB)
