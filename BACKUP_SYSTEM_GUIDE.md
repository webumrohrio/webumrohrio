# Sistem Backup Database - Panduan Lengkap

## Deskripsi
Sistem backup otomatis untuk database SQLite dan file uploads dengan interface admin yang user-friendly.

## Fitur

### 1. Backup Manual via Admin Panel
- **Backup Database**: Backup file database (.db) saja
- **Backup Lengkap**: Backup database + semua file uploads (gambar, dll) dalam format .zip
- **List Backup**: Lihat semua backup yang tersedia dengan info ukuran dan tanggal
- **Download Backup**: Download file backup ke komputer lokal
- **Restore Backup**: Restore database dari backup (dengan auto-backup sebelum restore)
- **Delete Backup**: Hapus backup yang tidak diperlukan

### 2. Backup Otomatis via Script
- Script untuk backup berkala yang bisa dijadwalkan
- Auto-delete backup lama (keep last 7 backups)
- Support backup database only atau full backup

### 3. Keamanan
- Path traversal protection
- Auto-backup sebelum restore
- Validasi file format
- Admin-only access

## Struktur File

```
backups/                          # Folder penyimpanan backup
├── backup-db-2025-11-22_14-30-00.db      # Database backup
├── backup-full-2025-11-22_14-30-00.zip   # Full backup
└── pre-restore-1732262400000.db          # Auto backup sebelum restore

src/app/admintrip/backup/
└── page.tsx                      # Halaman admin backup

src/app/api/admintrip/backup/
├── route.ts                      # API: list, create, delete backup
├── download/
│   └── route.ts                  # API: download backup
└── restore/
    └── route.ts                  # API: restore backup

scripts/
└── auto-backup.js                # Script automated backup
```

## Cara Penggunaan

### A. Backup Manual via Admin Panel

1. **Login ke Admin Panel**
   ```
   http://localhost:3000/admintrip/login
   ```

2. **Buka Menu Backup Data**
   - Klik menu "Backup Data" di sidebar

3. **Buat Backup Baru**
   - **Backup Database**: Klik tombol "Backup Database" untuk backup database saja
   - **Backup Lengkap**: Klik tombol "Backup Lengkap" untuk backup database + files

4. **Manage Backup**
   - **Download**: Klik icon download untuk download backup
   - **Restore**: Klik icon upload untuk restore dari backup
   - **Delete**: Klik icon trash untuk hapus backup

### B. Backup Otomatis via Command Line

#### Backup Database Only
```bash
npm run backup
```

#### Backup Lengkap (Database + Files)
```bash
npm run backup:full
```

#### Manual dengan Node
```bash
# Database only
node scripts/auto-backup.js database

# Full backup
node scripts/auto-backup.js full
```

### C. Jadwalkan Backup Otomatis

#### Windows (Task Scheduler)

1. Buka Task Scheduler
2. Create Basic Task
3. Name: "Tripbaitullah Daily Backup"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `scripts/auto-backup.js full`
   - Start in: `C:\Users\LENOVO\Downloads\Tripbaitullah Mobile`

#### Linux/Mac (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/project && node scripts/auto-backup.js full

# Add weekly full backup on Sunday at 3 AM
0 3 * * 0 cd /path/to/project && node scripts/auto-backup.js full
```

## API Endpoints

### 1. GET /api/admintrip/backup
List semua backup yang tersedia

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "backup-full-2025-11-22_14-30-00.zip",
      "size": 15728640,
      "date": "2025-11-22T14:30:00.000Z",
      "type": "full"
    }
  ]
}
```

### 2. POST /api/admintrip/backup
Buat backup baru

**Request Body:**
```json
{
  "type": "database" // or "full"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "filename": "backup-db-2025-11-22_14-30-00.db"
}
```

### 3. DELETE /api/admintrip/backup?file={filename}
Hapus backup

**Response:**
```json
{
  "success": true,
  "message": "Backup deleted successfully"
}
```

### 4. GET /api/admintrip/backup/download?file={filename}
Download backup file

**Response:** File download

### 5. POST /api/admintrip/backup/restore
Restore dari backup

**Request Body:**
```json
{
  "filename": "backup-db-2025-11-22_14-30-00.db"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database restored successfully",
  "backup": "pre-restore-1732262400000.db"
}
```

## Format File Backup

### Database Backup (.db)
- File: `backup-db-YYYY-MM-DD_HH-MM-SS.db`
- Content: SQLite database file
- Size: ~1-10 MB (tergantung data)

### Full Backup (.zip)
- File: `backup-full-YYYY-MM-DD_HH-MM-SS.zip`
- Content:
  ```
  backup-full-2025-11-22_14-30-00.zip
  ├── database/
  │   └── dev.db
  └── uploads/
      ├── avatars/
      ├── packages/
      ├── articles/
      ├── sliders/
      └── travels/
  ```
- Size: ~10-100 MB (tergantung jumlah file)

## Best Practices

### 1. Backup Schedule
- **Daily**: Backup database setiap hari
- **Weekly**: Backup lengkap setiap minggu
- **Before Update**: Backup sebelum update besar

### 2. Backup Storage
- **Local**: Simpan di folder `backups/`
- **External**: Download dan simpan di:
  - Cloud storage (Google Drive, Dropbox, OneDrive)
  - External hard drive
  - Network storage (NAS)

### 3. Backup Retention
- Keep last 7 daily backups
- Keep last 4 weekly backups
- Keep monthly backups for 1 year

### 4. Testing
- Test restore secara berkala (monthly)
- Verify backup integrity
- Document restore procedures

## Troubleshooting

### Error: "Database file not found"
**Solusi:**
- Pastikan file `prisma/dev.db` exists
- Check database path di script

### Error: "Failed to create backup"
**Solusi:**
- Check disk space
- Check folder permissions
- Check if `backups/` folder exists

### Error: "Failed to restore backup"
**Solusi:**
- Check backup file integrity
- Ensure backup file format is correct
- Check database is not locked

### Backup file too large
**Solusi:**
- Use database-only backup untuk backup harian
- Compress uploads folder separately
- Clean up old uploads before backup

## Monitoring

### Check Backup Status
```bash
# List all backups
ls -lh backups/

# Check backup size
du -sh backups/

# Count backups
ls backups/ | wc -l
```

### Verify Backup
```bash
# Test database backup
sqlite3 backups/backup-db-2025-11-22_14-30-00.db "SELECT COUNT(*) FROM User;"

# Test zip backup
unzip -t backups/backup-full-2025-11-22_14-30-00.zip
```

## Security Considerations

1. **Access Control**
   - Only admin can access backup features
   - Implement role-based access if needed

2. **File Security**
   - Backup files contain sensitive data
   - Store backups in secure location
   - Encrypt backups for cloud storage

3. **Path Traversal Protection**
   - Filename validation implemented
   - No directory traversal allowed

4. **Backup Encryption** (Optional)
   - Consider encrypting backup files
   - Use password-protected zip files

## Recovery Procedures

### Scenario 1: Data Corruption
1. Stop application
2. Login to admin panel
3. Go to Backup Data
4. Select latest backup
5. Click Restore
6. Verify data integrity

### Scenario 2: Accidental Deletion
1. Identify when deletion occurred
2. Find backup before deletion
3. Restore from that backup
4. Verify restored data

### Scenario 3: Complete System Failure
1. Reinstall application
2. Copy backup files to `backups/` folder
3. Login to admin panel
4. Restore from backup
5. Verify all data

## Maintenance

### Weekly Tasks
- [ ] Verify latest backup exists
- [ ] Check backup file sizes
- [ ] Download important backups to external storage

### Monthly Tasks
- [ ] Test restore procedure
- [ ] Clean up old backups
- [ ] Review backup strategy
- [ ] Update documentation

### Quarterly Tasks
- [ ] Full system backup test
- [ ] Review and update backup schedule
- [ ] Audit backup security
- [ ] Train team on restore procedures

## Dependencies

```json
{
  "archiver": "^7.0.1",
  "extract-zip": "^2.0.1",
  "@types/archiver": "^6.0.2"
}
```

## Configuration

Edit `scripts/auto-backup.js` untuk customize:

```javascript
const MAX_BACKUPS = 7 // Keep last 7 backups
const BACKUP_TYPE = 'database' // or 'full'
```

## Support

Jika ada masalah:
1. Check console logs
2. Verify file permissions
3. Check disk space
4. Review error messages
5. Contact system administrator

## Changelog

### Version 1.0.0 (2025-11-22)
- ✅ Initial release
- ✅ Manual backup via admin panel
- ✅ Automated backup script
- ✅ Restore functionality
- ✅ Download backup files
- ✅ Delete old backups
- ✅ Full backup with uploads

## Future Enhancements

- [ ] Backup encryption
- [ ] Cloud storage integration (S3, Google Cloud)
- [ ] Email notifications on backup completion
- [ ] Backup verification/integrity check
- [ ] Incremental backups
- [ ] Backup compression optimization
- [ ] Multi-database support
- [ ] Backup scheduling via UI
