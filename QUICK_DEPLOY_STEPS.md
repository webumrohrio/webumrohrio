# Quick Deploy Steps ke GitHub

## Repository Target
https://github.com/webumrohrio/webumrohrio.git

## Status
✅ Git sudah diinisialisasi
✅ Remote sudah diset ke webumrohrio/webumrohrio
✅ Semua file sudah di-commit (426 files)
❌ Perlu authenticate untuk push

## Langkah Cepat

### Opsi 1: Menggunakan Personal Access Token

1. **Buat Token di GitHub:**
   - Login ke akun yang punya akses ke `webumrohrio/webumrohrio`
   - Buka: https://github.com/settings/tokens
   - Klik "Generate new token (classic)"
   - Beri nama: "Deploy webumrohrio"
   - Centang scope: `repo`
   - Generate dan COPY token

2. **Push ke GitHub:**
   ```powershell
   git push -u origin main
   ```
   - Username: `webumrohrio` (atau username Anda)
   - Password: **PASTE TOKEN** (bukan password!)

### Opsi 2: Menggunakan GitHub Desktop (Termudah)

1. Download: https://desktop.github.com/
2. Install dan login dengan akun yang punya akses
3. File → Add Local Repository
4. Pilih folder project ini
5. Klik "Publish repository"
6. Pilih organization: `webumrohrio`
7. Repository name: `webumrohrio`
8. Publish!

## Penting!

⚠️ **Pastikan akun Anda adalah member/owner dari organization `webumrohrio`**

Jika tidak punya akses:
1. Minta owner organization untuk invite Anda
2. Atau gunakan akun owner untuk push

## Verifikasi

Setelah berhasil push, buka:
https://github.com/webumrohrio/webumrohrio

## Troubleshooting

**Error 403 Permission denied:**
- Akun tidak punya akses ke repository
- Solusi: Gunakan akun yang punya akses atau minta invite

**Error 404 Repository not found:**
- Repository belum dibuat
- Solusi: Buat repository `webumrohrio` di organization `webumrohrio`

## Command Reference

```powershell
# Cek remote
git remote -v

# Ubah remote (jika perlu)
git remote set-url origin https://github.com/webumrohrio/webumrohrio.git

# Push
git push -u origin main

# Cek status
git status
```
