# 🗄️ Database Backup/Restore API Documentation

## ✅ Implemented Features

Sistem backup/restore database yang **serverless-friendly** untuk Vercel dengan Neon PostgreSQL.

### Features:
- ✅ **Export Database** - Download database sebagai file .sql
- ✅ **Import Database** - Upload dan restore dari file .sql
- ✅ **Database Stats** - Lihat jumlah records per table
- ✅ **Streaming** - Tidak simpan file di disk (memory only)
- ✅ **Vercel Compatible** - Works dengan Vercel Hobby plan

## 📡 API Endpoints

### 1. Get Database Stats

**GET** `/api/admintrip/backup`

**Response:**
```json
{
  "success": true,
  "data": {
    "User": 7,
    "Admin": 3,
    "Travel": 12,
    "Package": 22,
    "Article": 3,
    "Video": 6,
    "Settings": 11,
    "Slider": 3
  },
  "message": "Database backup available for download"
}
```

### 2. Export Database (Download .sql)

**GET** `/api/admintrip/backup?action=export`

**Response:**
- Content-Type: `application/sql`
- Content-Disposition: `attachment; filename="backup-2024-11-26.sql"`
- Body: SQL file content

**Example:**
```javascript
// Download backup
const response = await fetch('/api/admintrip/backup?action=export');
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`;
a.click();
```

### 3. Import Database (Restore from .sql)

**POST** `/api/admintrip/backup`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with file field

**Example:**
```javascript
// Upload and restore
const formData = new FormData();
formData.append('file', sqlFile);

const response = await fetch('/api/admintrip/backup', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Response:**
```json
{
  "success": true,
  "message": "Database restored successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Only .sql files are supported"
}
```

## 🔒 Limitations

### File Size:
- **Max upload:** 10 MB
- **Reason:** Vercel body size limit & timeout

### Timeout:
- **Vercel Hobby:** 10 seconds
- **Recommendation:** Keep database small or upgrade to Pro

### Supported Files:
- ✅ `.sql` files only
- ❌ `.zip` files not supported (use database only)

## 💻 Frontend Implementation

### React Component Example:

```typescript
import { useState } from 'react';

export function BackupManager() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Get database stats
  const getStats = async () => {
    const res = await fetch('/api/admintrip/backup');
    const data = await res.json();
    setStats(data.data);
  };

  // Download backup
  const downloadBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admintrip/backup?action=export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download backup');
    } finally {
      setLoading(false);
    }
  };

  // Upload and restore
  const restoreBackup = async (file: File) => {
    if (!file.name.endsWith('.sql')) {
      alert('Only .sql files are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB');
      return;
    }

    if (!confirm('This will replace all data. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admintrip/backup', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('Database restored successfully!');
        getStats(); // Refresh stats
      } else {
        alert('Restore failed: ' + result.error);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Database Backup</h2>
      
      {/* Stats */}
      <button onClick={getStats}>Get Stats</button>
      {stats && (
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      )}

      {/* Download */}
      <button onClick={downloadBackup} disabled={loading}>
        {loading ? 'Downloading...' : 'Download Backup (.sql)'}
      </button>

      {/* Upload */}
      <input
        type="file"
        accept=".sql"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) restoreBackup(file);
        }}
        disabled={loading}
      />
    </div>
  );
}
```

## 🔧 Technical Details

### Database Export Process:
1. Connect to Neon PostgreSQL
2. Get all tables (exclude `_prisma_migrations`)
3. For each table:
   - Generate TRUNCATE statement
   - Generate INSERT statements for all rows
4. Stream SQL to browser

### Database Import Process:
1. Receive .sql file via multipart/form-data
2. Read file content to memory
3. Split SQL into statements
4. Execute each statement sequentially
5. Return success/error

### Memory Usage:
- Export: ~2-5 MB for typical database
- Import: File size + parsing overhead
- All in memory (no disk writes)

## 🚀 Deployment

### Environment Variables Required:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Dependencies:
```json
{
  "pg": "^8.x",
  "pg-format": "^1.x"
}
```

### Vercel Configuration:
- ✅ Works on Hobby plan
- ✅ No additional config needed
- ✅ Automatic deployment on push

## 📊 Performance

### Export:
- Small DB (< 1000 records): ~2-3 seconds
- Medium DB (1000-10000 records): ~5-8 seconds
- Large DB (> 10000 records): May timeout

### Import:
- Small file (< 1 MB): ~2-3 seconds
- Medium file (1-5 MB): ~5-8 seconds
- Large file (> 5 MB): May timeout

## ⚠️ Important Notes

1. **Images NOT included** - Only database backup
2. **Cloudinary images** - Already safe in cloud
3. **Neon automatic backups** - Daily backups by Neon
4. **Use for migration** - Best for moving data between environments
5. **Not for disaster recovery** - Use Neon backups for that

## 🆘 Troubleshooting

### Timeout Error:
- Database too large
- Solution: Use Neon Console for large databases

### File Too Large:
- Max 10 MB for upload
- Solution: Split data or use Neon migration tools

### Parse Error:
- Invalid SQL syntax
- Solution: Ensure .sql file is valid PostgreSQL format

## 📚 Related Documentation

- [Neon Backup Guide](./BACKUP_GUIDE_PRODUCTION.md)
- [Cloudinary Integration](./src/lib/cloudinary.ts)
- [Database Schema](./prisma/schema.prisma)

---

**Last Updated:** November 26, 2024
**Version:** 1.0.0
