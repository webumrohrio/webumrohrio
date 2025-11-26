# Panduan Deploy ke GitHub

## Status Saat Ini

✅ Git repository sudah diinisialisasi
✅ Remote origin sudah ditambahkan: https://github.com/webumrohrio/webumrohrio.git
✅ Branch main sudah dibuat
✅ Semua file sudah di-commit (426 files)

## Yang Perlu Dilakukan

Anda perlu **authenticate** dengan GitHub untuk bisa push. Ada 2 cara:

---

## Cara 1: Menggunakan Personal Access Token (RECOMMENDED)

### Langkah 1: Buat Personal Access Token

1. **Login ke GitHub** dengan akun `tripbaitullah`

2. **Buka Settings → Developer settings**
   - Klik foto profil (kanan atas) → Settings
   - Scroll ke bawah → klik "Developer settings"
   - Atau langsung buka: https://github.com/settings/tokens

3. **Generate Token Baru**
   - Klik "Personal access tokens" → "Tokens (classic)"
   - Klik "Generate new token" → "Generate new token (classic)"

4. **Konfigurasi Token**
   - **Note**: `Tripbaitullah Deploy` (atau nama lain)
   - **Expiration**: `No expiration` (atau pilih durasi)
   - **Select scopes**: Centang `repo` (full control of private repositories)
   - Scroll ke bawah → klik "Generate token"

5. **COPY TOKEN**
   - Token akan muncul (contoh: `ghp_xxxxxxxxxxxxxxxxxxxx`)
   - **COPY dan SIMPAN** token ini (hanya muncul sekali!)
   - Jangan tutup halaman sebelum di-copy

### Langkah 2: Push ke GitHub

Buka terminal/PowerShell di folder project, lalu jalankan:

```powershell
git push -u origin main
```

Akan muncul prompt:
- **Username**: `webumrohrio` (atau username GitHub yang punya akses ke repository)
- **Password**: **PASTE TOKEN** yang sudah di-copy (bukan password GitHub!)

Setelah itu, project akan ter-upload ke GitHub.

---

## Cara 2: Menggunakan GitHub CLI (Alternative)

### Install GitHub CLI

Download dan install dari: https://cli.github.com/

### Login dan Push

```powershell
# Login ke GitHub
gh auth login

# Push ke repository
git push -u origin main
```

---

## Cara 3: Menggunakan GitHub Desktop (Paling Mudah)

### Install GitHub Desktop

Download dari: https://desktop.github.com/

### Langkah-langkah:

1. **Install dan Login** ke GitHub Desktop
2. **Add Existing Repository**
   - File → Add Local Repository
   - Pilih folder: `C:\Users\LENOVO\Downloads\Tripbaitullah Mobile`
3. **Publish Repository**
   - Klik "Publish repository"
   - Pilih organization: `webumrohrio`
   - Repository name: `webumrohrio`
   - Klik "Publish repository"

---

## Verifikasi Setelah Push Berhasil

1. Buka https://github.com/webumrohrio/webumrohrio
2. Pastikan semua file sudah ter-upload
3. Cek commit history

---

## Troubleshooting

### Error: Permission denied

**Penyebab**: Tidak punya akses ke repository atau belum authenticate

**Solusi**: 
- Pastikan Anda login dengan akun yang punya akses ke repository `webumrohrio/webumrohrio`
- Gunakan Personal Access Token, bukan password GitHub
- Pastikan akun Anda adalah member/owner dari organization `webumrohrio`

### Error: Repository not found

**Penyebab**: Repository belum dibuat atau URL salah

**Solusi**:
1. Buka https://github.com/webumrohrio
2. Pastikan repository `webumrohrio` sudah ada
3. Jika belum ada, buat repository baru dengan nama `webumrohrio`

### Error: Authentication failed

**Penyebab**: Token salah atau expired

**Solusi**:
- Generate token baru
- Pastikan scope `repo` sudah dicentang
- Copy token dengan benar (tidak ada spasi)

---

## Command Summary

Jika sudah punya token, jalankan command ini:

```powershell
# Push ke GitHub (akan minta username & token)
git push -u origin main

# Cek status
git status

# Cek remote
git remote -v

# Lihat commit history
git log --oneline
```

---

## Next Steps Setelah Push Berhasil

1. **Setup GitHub Actions** (optional) - untuk CI/CD
2. **Add README.md** - dokumentasi project
3. **Setup Branch Protection** - protect main branch
4. **Add Collaborators** - jika ada tim
5. **Setup Vercel/Netlify** - untuk deployment

---

## Catatan Penting

- ⚠️ **JANGAN COMMIT FILE .env** - sudah di-exclude di .gitignore
- ⚠️ **JANGAN SHARE TOKEN** - simpan dengan aman
- ⚠️ **Database file** (custom.db) sudah ter-commit, pertimbangkan untuk di-exclude jika berisi data sensitif
- ✅ File uploads sudah ter-commit, pastikan tidak ada data sensitif

---

## Contact

Jika masih ada masalah, hubungi:
- GitHub Support: https://support.github.com/
- Atau tanyakan ke saya lagi 😊
