# Fitur Edit Password User di Admin Panel

## Deskripsi
Fitur ini memungkinkan admin untuk mengubah password user dari admin panel tanpa perlu mengetahui password lama user.

## Implementasi

### 1. State Management (src/app/admintrip/users/page.tsx)
Sudah ditambahkan state untuk modal edit password:
- `showPasswordModal`: Boolean untuk menampilkan/menyembunyikan modal
- `selectedUser`: User yang dipilih untuk edit password
- `newPassword`: Password baru yang akan diset

### 2. UI Components

#### Tombol Edit Password di Tabel Users
Ditambahkan kolom "Aksi" di tabel users dengan tombol "Edit Password":
```tsx
<td className="px-6 py-4 whitespace-nowrap text-center">
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleEditUserPassword(user)}
  >
    <Edit className="w-4 h-4 mr-1" />
    Edit Password
  </Button>
</td>
```

#### Modal Edit Password
Modal yang menampilkan:
- Informasi user (avatar, nama, email)
- Input field untuk password baru (minimal 6 karakter)
- Tombol submit dan batal

### 3. API Endpoint (src/app/api/users/[id]/route.ts)

#### PATCH /api/users/[id]
Endpoint untuk update password user:

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    ...
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

**Validasi:**
- Password wajib diisi
- Password minimal 6 karakter
- User harus ada di database

**Security:**
- Password di-hash menggunakan bcrypt dengan salt rounds 10
- Password lama tidak dikembalikan dalam response

### 4. Fungsi Handler

#### handleEditUserPassword
```typescript
const handleEditUserPassword = (user: User) => {
  setSelectedUser(user)
  setNewPassword('')
  setShowPasswordModal(true)
}
```

#### handleUpdatePassword
```typescript
const handleUpdatePassword = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!selectedUser || !newPassword) return

  setSubmitting(true)
  try {
    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword })
    })

    const result = await response.json()

    if (result.success) {
      alert('Password berhasil diupdate!')
      setShowPasswordModal(false)
      setSelectedUser(null)
      setNewPassword('')
    } else {
      alert('Gagal update password: ' + result.error)
    }
  } catch (error) {
    console.error('Error updating password:', error)
    alert('Gagal update password')
  } finally {
    setSubmitting(false)
  }
}
```

## Cara Penggunaan

1. Login sebagai admin di `/admintrip/login`
2. Navigasi ke menu "Manajemen Akun"
3. Pilih tab "Akun Pengguna"
4. Klik tombol "Edit Password" pada user yang ingin diubah passwordnya
5. Modal akan muncul menampilkan informasi user
6. Masukkan password baru (minimal 6 karakter)
7. Klik "Update Password"
8. Password user akan diupdate dan modal akan tertutup

## Keamanan

- Password di-hash menggunakan bcrypt sebelum disimpan ke database
- Tidak ada validasi password lama (karena ini fitur admin)
- Password lama tidak pernah dikembalikan dalam response API
- Hanya admin yang terautentikasi yang bisa mengakses fitur ini

## Testing

Untuk test fitur ini:
1. Buka admin panel dan pilih user
2. Klik "Edit Password"
3. Masukkan password baru
4. Coba login dengan user tersebut menggunakan password baru
5. Pastikan login berhasil dengan password baru

## Dependencies

- bcryptjs: Untuk hashing password
- Prisma: ORM untuk database operations
- Next.js API Routes: Untuk endpoint API

## File yang Dimodifikasi

1. `src/app/admintrip/users/page.tsx` - Tambah UI dan handler
2. `src/app/api/users/[id]/route.ts` - Buat API endpoint baru

## Password Security Migration

### Masalah yang Ditemukan
Setelah implementasi, ditemukan bahwa sistem login masih menggunakan plain text comparison untuk password, sehingga user tidak bisa login setelah password di-update dengan bcrypt hash.

### Solusi yang Diterapkan

1. **Update API Login** (`src/app/api/auth/login/route.ts`)
   - Menambahkan bcrypt.compare() untuk verify hashed password
   - Backward compatible: masih support plain text password (legacy)
   - Deteksi otomatis: cek apakah password di-hash (dimulai dengan $2)

2. **Update API Register** (`src/app/api/auth/register/route.ts`)
   - Hash password dengan bcrypt sebelum disimpan
   - Validasi password minimal 6 karakter
   - Semua user baru otomatis menggunakan hashed password

3. **Update API Change Password** (`src/app/api/auth/change-password/route.ts`)
   - Verify old password dengan bcrypt.compare()
   - Hash new password dengan bcrypt
   - Backward compatible untuk legacy passwords

4. **Script Migration** (`scripts/migrate-passwords.js`)
   - Migrate semua existing plain text passwords ke bcrypt hash
   - Skip passwords yang sudah di-hash
   - Safe to run multiple times

### Cara Menjalankan Migration

```bash
node scripts/migrate-passwords.js
```

Output:
```
🔄 Starting password migration...
Found 3 users
✅ Migrated fauzia@gmail.com - password hashed
⏭️  Skipping dera@gmail.com - already hashed
✅ Migrated aris@gmail.com - password hashed
==================================================
✨ Migration completed!
   Migrated: 2 users
   Skipped: 1 users (already hashed)
==================================================
```

## Status
✅ Implementasi selesai
✅ API endpoint dibuat
✅ UI modal ditambahkan
✅ Handler functions dibuat
✅ Validasi password ditambahkan
✅ Security dengan bcrypt hash
✅ Login API updated dengan bcrypt verification
✅ Register API updated dengan bcrypt hashing
✅ Change Password API updated dengan bcrypt
✅ Password migration script dibuat dan dijalankan
✅ Backward compatibility untuk legacy passwords
