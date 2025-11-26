# 📦 Database Backup & Restore Guide

Panduan lengkap untuk backup dan restore database SQLite di proyek Tripbaitullah.

## 🎯 Cara Backup Database

### Metode 1: Menggunakan NPM Script (Recommended)

```bash
npm run db:backup
```

Script ini akan:
- ✅ Membuat backup otomatis dengan timestamp
- ✅ Menyimpan di folder `prisma/backups/`
- ✅ Menampilkan daftar 5 backup terbaru
- ✅ Menampilkan ukuran file backup

**Output contoh:**
```
✅ Database backup created successfully!
📁 Backup location: prisma/backups/custom.db.backup-2024-11-19T10-30-00
📊 File size: 245.67 KB
🕐 Timestamp: 19/11/2024 10:30:00

📋 Available backups:
   1. custom.db.backup-2024-11-19T10-30-00 (245.67 KB)
   2. custom.db.backup-2024-11-19T09-15-00 (243.21 KB)
   3. custom.db.backup-2024-11-18T16-45-00 (240.89 KB)
```

### Metode 2: Manual Copy (Simple)

```bash
# Windows
copy prisma\db\custom.db prisma\db\custom.db.backup

# Dengan timestamp manual
copy prisma\db\custom.db prisma\db\custom.db.backup-2024-11-19
```

---

## 🔄 Cara Restore Database

### Menggunakan NPM Script (Interactive)

```bash
npm run db:restore
```

Script ini akan:
1. Menampilkan daftar semua backup yang tersedia
2. Meminta Anda memilih backup mana yang akan di-restore
3. Meminta konfirmasi sebelum restore
4. Membuat backup database saat ini sebelum restore (safety backup)
5. Restore database dari backup yang dipilih

**Contoh interaksi:**
```
📋 Available backups:

   1. custom.db.backup-2024-11-19T10-30-00
      Size: 245.67 KB | Date: 2024-11-19T10:30:00

   2. custom.db.backup-2024-11-19T09-15-00
      Size: 243.21 KB | Date: 2024-11-19T09:15:00

Enter backup number to restore (or "q" to quit): 1

⚠️  This will replace your current database. Continue? (yes/no): yes

✅ Current database backed up before restore
✅ Database restored successfully!
📁 Restored from: custom.db.backup-2024-11-19T10-30-00
🕐 Timestamp: 19/11/2024 10:35:00
```

### Manual Restore

```bash
# Windows
copy prisma\backups\custom.db.backup-2024-11-19T10-30-00 prisma\db\custom.db
```

---

## 📅 Best Practices

### 1. **Backup Sebelum Migration**
Selalu backup sebelum menjalankan migration:
```bash
npm run db:backup
npm run db:migrate
```

### 2. **Backup Berkala**
Buat backup secara rutin:
- Setiap hari (untuk development)
- Sebelum deploy (untuk production)
- Sebelum perubahan besar

### 3. **Backup Sebelum Reset**
**PENTING:** Selalu backup sebelum reset database:
```bash
npm run db:backup
npm run db:reset
```

### 4. **Simpan Backup Penting**
Copy backup penting ke lokasi lain:
```bash
# Copy ke folder lain
copy prisma\backups\custom.db.backup-2024-11-19T10-30-00 D:\Backups\

# Atau upload ke cloud storage (Google Drive, Dropbox, dll)
```

---

## 🗂️ Struktur Folder Backup

```
prisma/
├── db/
│   └── custom.db                    # Database aktif
├── backups/                         # Folder backup (auto-created)
│   ├── custom.db.backup-2024-11-19T10-30-00
│   ├── custom.db.backup-2024-11-19T09-15-00
│   ├── custom.db.pre-restore-1700123456789  # Auto backup sebelum restore
│   └── ...
└── migrations/
```

---

## 🔒 Keamanan Backup

### 1. **Jangan Commit Backup ke Git**
File `.gitignore` sudah dikonfigurasi untuk mengabaikan:
```
/prisma/backups/
*.db.backup*
```

### 2. **Enkripsi untuk Production**
Untuk production, pertimbangkan enkripsi backup:
```bash
# Contoh dengan 7zip (Windows)
7z a -p[password] backup.7z prisma\db\custom.db
```

### 3. **Backup ke Cloud**
Untuk keamanan ekstra, upload backup ke cloud storage:
- Google Drive
- Dropbox
- AWS S3
- Azure Blob Storage

---

## 🚨 Troubleshooting

### Error: "Database file not found"
```bash
# Pastikan path database benar
dir prisma\db\custom.db
```

### Error: "Permission denied"
```bash
# Stop development server terlebih dahulu
# Tutup aplikasi yang menggunakan database
```

### Backup Terlalu Besar
```bash
# Cek ukuran database
dir prisma\db\custom.db

# Jika terlalu besar, pertimbangkan:
# 1. Hapus data lama yang tidak diperlukan
# 2. Compress backup dengan 7zip/WinRAR
```

---

## 📝 Automation (Optional)

### Backup Otomatis Setiap Hari

**Windows Task Scheduler:**
1. Buka Task Scheduler
2. Create Basic Task
3. Trigger: Daily
4. Action: Start a program
5. Program: `cmd.exe`
6. Arguments: `/c cd "C:\path\to\project" && npm run db:backup`

### Backup Sebelum Git Commit (Git Hook)

Buat file `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run db:backup
```

---

## 💡 Tips

1. **Naming Convention**: Backup otomatis menggunakan timestamp ISO format
2. **Retention Policy**: Hapus backup lama secara berkala (simpan 30 hari terakhir)
3. **Test Restore**: Sesekali test restore untuk memastikan backup berfungsi
4. **Document Changes**: Catat perubahan penting di commit message

---

## 📞 Support

Jika ada masalah dengan backup/restore, hubungi tim development atau buat issue di repository.
