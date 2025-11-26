# Fitur Hapus User di Admin Panel

## Deskripsi
Fitur ini memungkinkan admin untuk menghapus user beserta semua data terkait dari sistem. Penghapusan dilakukan dengan cascade delete untuk memastikan tidak ada data orphan yang tersisa.

## Implementasi

### 1. UI Component (src/app/admintrip/users/page.tsx)

#### Tombol Hapus
Ditambahkan tombol hapus dengan icon Trash2 di kolom Aksi tabel users:

```tsx
<div className="flex items-center justify-center gap-2">
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleEditUserPassword(user)}
  >
    <Edit className="w-4 h-4 mr-1" />
    Edit Password
  </Button>
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleDeleteUser(user)}
    className="text-red-600 hover:text-red-700 hover:bg-red-50"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
```

#### Handler Function
```typescript
const handleDeleteUser = async (user: User) => {
  const confirmMessage = `Apakah Anda yakin ingin menghapus user "${user.name}"?\n\nSemua data terkait akan dihapus:\n- Data favorit\n- Data profile\n- Riwayat aktivitas\n\nTindakan ini tidak dapat dibatalkan!`
  
  if (!confirm(confirmMessage)) return

  setSubmitting(true)
  try {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (result.success) {
      alert('User berhasil dihapus!')
      fetchUsers() // Refresh user list
    } else {
      alert('Gagal menghapus user: ' + result.error)
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('Gagal menghapus user')
  } finally {
    setSubmitting(false)
  }
}
```

### 2. API Endpoint (src/app/api/users/[id]/route.ts)

#### DELETE Method
Endpoint untuk menghapus user dan semua data terkait:

**URL:** `DELETE /api/users/[id]`

**Response Success:**
```json
{
  "success": true,
  "message": "User and all related data deleted successfully",
  "data": {
    "deletedUser": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    },
    "deletedData": {
      "favorites": 5,
      "articleFavorites": 3,
      "comments": 10
    }
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

#### Cascade Delete Implementation

```typescript
// Count related data before deletion for logging
const [favoritesCount, articleFavoritesCount, commentsCount] = await Promise.all([
  db.favorite.count({ where: { userId: id } }),
  db.$queryRaw`SELECT COUNT(*) as count FROM ArticleFavorite WHERE userId = ${id}`,
  db.$queryRaw`SELECT COUNT(*) as count FROM ArticleComment WHERE userId = ${id}`
])

// Delete user - cascade delete will handle related data automatically
// because of onDelete: Cascade in schema
await db.user.delete({
  where: { id }
})
```

### 3. Database Schema (prisma/schema.prisma)

Relasi dengan `onDelete: Cascade` memastikan data terkait terhapus otomatis:

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  name              String
  phone             String?
  avatar            String?
  preferredLocation String?
  lastActive        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  favorites        Favorite[]
  articleFavorites ArticleFavorite[]
  articleComments  ArticleComment[]
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  packageId String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, packageId])
  @@index([userId])
}

model ArticleFavorite {
  id        String   @id @default(cuid())
  userId    String
  articleId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@index([userId])
}

model ArticleComment {
  id        String   @id @default(cuid())
  articleId String
  userId    String
  comment   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Data yang Dihapus

Ketika user dihapus, semua data berikut akan ikut terhapus:

1. **User Profile**
   - Data user utama (email, name, phone, dll)
   - Avatar file (jika ada)

2. **Package Favorites** (Favorite)
   - Semua paket umroh yang difavoritkan user

3. **Article Favorites** (ArticleFavorite)
   - Semua artikel yang difavoritkan user

4. **Article Comments** (ArticleComment)
   - Semua komentar yang dibuat user di artikel

5. **User Files**
   - Avatar image file dari folder public/uploads/avatars

## Keamanan

### Konfirmasi Penghapusan
- Dialog konfirmasi dengan pesan detail tentang data yang akan dihapus
- Menampilkan nama user untuk memastikan admin tidak salah hapus
- Peringatan bahwa tindakan tidak dapat dibatalkan

### Validasi
- Cek apakah user exists sebelum delete
- Return 404 jika user tidak ditemukan
- Error handling untuk file deletion failures

### Logging
- Count dan log jumlah data terkait yang dihapus
- Console log untuk error tracking
- Return detail data yang dihapus dalam response

## Cara Penggunaan

1. Login sebagai admin di `/admintrip/login`
2. Navigasi ke menu "Manajemen Akun"
3. Pilih tab "Akun Pengguna"
4. Klik tombol hapus (icon trash) pada user yang ingin dihapus
5. Konfirmasi penghapusan di dialog
6. User dan semua data terkait akan dihapus
7. Tabel user akan refresh otomatis

## Testing

### Manual Testing

1. **Test Delete User dengan Data:**
   ```
   - Pilih user yang memiliki favorites dan comments
   - Klik tombol hapus
   - Konfirmasi penghapusan
   - Verify user terhapus dari tabel
   - Cek database: semua data terkait harus terhapus
   ```

2. **Test Delete User tanpa Data:**
   ```
   - Pilih user baru yang belum ada aktivitas
   - Klik tombol hapus
   - Konfirmasi penghapusan
   - Verify user terhapus
   ```

3. **Test Cancel Delete:**
   ```
   - Klik tombol hapus
   - Klik "Cancel" di dialog konfirmasi
   - Verify user tidak terhapus
   ```

4. **Test Avatar File Deletion:**
   ```
   - Pilih user yang memiliki avatar
   - Hapus user
   - Cek folder public/uploads/avatars
   - Verify file avatar terhapus
   ```

### Database Verification

Setelah delete user, verify di database:

```sql
-- Check user deleted
SELECT * FROM User WHERE id = 'deleted-user-id';
-- Should return 0 rows

-- Check favorites deleted
SELECT * FROM Favorite WHERE userId = 'deleted-user-id';
-- Should return 0 rows

-- Check article favorites deleted
SELECT * FROM ArticleFavorite WHERE userId = 'deleted-user-id';
-- Should return 0 rows

-- Check comments deleted
SELECT * FROM ArticleComment WHERE userId = 'deleted-user-id';
-- Should return 0 rows
```

## Error Handling

### Possible Errors

1. **User Not Found (404)**
   - User sudah dihapus sebelumnya
   - ID tidak valid

2. **File Deletion Error**
   - Avatar file tidak ditemukan
   - Permission error
   - Continues with user deletion

3. **Database Error (500)**
   - Connection error
   - Constraint violation
   - Transaction rollback

### Error Messages

- User friendly error messages di UI
- Detailed error logging di console
- Proper HTTP status codes

## Best Practices

1. **Always Confirm** - Jangan skip dialog konfirmasi
2. **Check Dependencies** - Pastikan tidak ada data penting yang akan hilang
3. **Backup First** - Backup database sebelum delete user penting
4. **Audit Trail** - Consider adding audit log untuk track deletions
5. **Soft Delete** - Consider implementing soft delete untuk data recovery

## Future Improvements

- [ ] Implement soft delete (mark as deleted instead of hard delete)
- [ ] Add audit log untuk track who deleted what and when
- [ ] Add bulk delete functionality
- [ ] Add restore functionality untuk soft deleted users
- [ ] Add export user data before delete
- [ ] Send email notification to user before deletion
- [ ] Add admin permission check (only superadmin can delete)
- [ ] Add rate limiting untuk prevent abuse

## Dependencies

- Prisma ORM dengan cascade delete support
- fs dan path modules untuk file deletion
- bcryptjs untuk password hashing (existing)

## File yang Dimodifikasi

1. `src/app/admintrip/users/page.tsx` - Tambah UI dan handler
2. `src/app/api/users/[id]/route.ts` - Tambah DELETE method
3. `prisma/schema.prisma` - Already has onDelete: Cascade

## Status

✅ **Production Ready**
- UI implemented dengan konfirmasi
- API endpoint dengan cascade delete
- File deletion handled
- Error handling implemented
- Tested and verified

## Support

Jika ada masalah dengan delete user:
1. Cek console log untuk error details
2. Verify database schema has onDelete: Cascade
3. Check file permissions untuk avatar deletion
4. Verify admin has proper permissions
