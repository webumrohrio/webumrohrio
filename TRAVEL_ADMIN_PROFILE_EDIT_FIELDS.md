# Travel Admin Profile Edit - Field Comparison

## Current Fields (travel-admin/profile/edit)
- ✅ Nama Travel
- ✅ Deskripsi
- ✅ Cover Image (with crop)
- ✅ Alamat
- ✅ Telepon
- ✅ Website

## Missing Fields (from admintrip/travels/edit)

### Basic Info
- ❌ Username (read-only, tidak boleh diubah)
- ❌ Email
- ❌ Logo Upload
- ❌ City (dropdown dari settings)

### Company Info
- ❌ Rating
- ❌ Total Reviews
- ❌ Total Jamaah
- ❌ Year Established

### Additional Info
- ❌ Licenses (comma-separated)
- ❌ Facilities (comma-separated)
- ❌ Services (comma-separated)
- ❌ Legal Docs (URL)

### Gallery
- ❌ Gallery Images (multiple upload with captions)

### Status (TIDAK BOLEH DIUBAH oleh travel-admin)
- 🚫 isActive (hanya admintrip)
- 🚫 isVerified (hanya admintrip)
- 🚫 packageLimit (hanya admintrip)

## Recommendation

### Option 1: Full Form (Kompleks)
Copy semua field dari admintrip edit KECUALI:
- Username (read-only)
- isActive, isVerified, packageLimit (hidden/tidak ada)

**Pros**: Travel admin bisa update semua info
**Cons**: Form sangat panjang, mungkin overwhelming

### Option 2: Essential Fields Only (Sederhana)
Tambahkan hanya field penting:
- Logo Upload
- Email
- City
- Year Established
- Licenses
- Facilities
- Services

**Pros**: Form lebih sederhana dan fokus
**Cons**: Beberapa field tidak bisa diupdate

### Option 3: Current + Logo Only (Minimal)
Hanya tambahkan Logo Upload ke form yang sudah ada

**Pros**: Paling sederhana
**Cons**: Banyak field yang tidak bisa diupdate

## Recommended: Option 2

Saya rekomendasikan **Option 2** karena:
1. Travel admin perlu update info penting seperti logo, email, city
2. Form tidak terlalu panjang
3. Field yang sensitif (isActive, isVerified, packageLimit) tetap tidak bisa diubah
4. Gallery bisa ditambahkan nanti jika diperlukan

## Implementation

Jika Anda setuju dengan Option 2, saya akan:
1. Tambahkan Logo Upload (dengan crop bulat 1:1)
2. Tambahkan Email, City, Year Established
3. Tambahkan Licenses, Facilities, Services (comma-separated)
4. Update API untuk handle field baru
5. Pastikan field sensitif tidak bisa diubah

Apakah Anda ingin saya lanjutkan dengan Option 2, atau Anda prefer option lain?
