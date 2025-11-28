# Guest Booking Feature - Hybrid Approach

## Overview
Fitur booking untuk user yang belum login dengan form pop-up yang menyimpan data untuk kemudahan booking selanjutnya.

## Cara Kerja

### Skenario 1: User Belum Login
1. User klik tombol "Booking Sekarang"
2. Muncul **Pop-up Modal** dengan form:
   - Input: Nama Lengkap (required)
   - Input: Nomor WhatsApp (required, min 10 digit)
   - Input: Jumlah Jamaah (default 1, bisa +/-)
3. User mengisi form dan klik "Kirim ke WhatsApp"
4. Data disimpan ke:
   - **LocalStorage** (instant, untuk UX cepat)
   - **Database** (background, untuk persistence)
5. Redirect ke WhatsApp travel dengan pesan yang include:
   - Data paket (nama, harga, tanggal, dll)
   - **Nama user**
   - **No WhatsApp user**
   - **Jumlah jamaah**

### Skenario 2: User Sudah Login
1. User klik tombol "Booking Sekarang"
2. Langsung redirect ke WhatsApp (tanpa pop-up)
3. Data user diambil dari profil yang sudah login

### Skenario 3: Booking Kedua (Guest)
1. User klik booking di paket lain
2. Pop-up muncul dengan form **sudah terisi otomatis**
3. User bisa edit atau langsung kirim

## Database Schema

```prisma
model GuestBooking {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique  // WhatsApp number sebagai identifier
  defaultPax  Int      @default(1)
  lastUsed    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([phone])
}
```

## API Endpoints

### GET /api/guest-booking?phone={phone}
Mengambil data guest booking berdasarkan nomor WhatsApp

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "phone": "08123456789",
    "defaultPax": 2,
    "lastUsed": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/guest-booking
Menyimpan atau update data guest booking

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "08123456789",
  "defaultPax": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Guest booking saved successfully"
}
```

## LocalStorage Structure

```javascript
{
  "guestBookingData": {
    "name": "John Doe",
    "phone": "08123456789",
    "pax": 2
  }
}
```

## Hybrid Approach Benefits

### 1. Fast UX (LocalStorage)
- ✅ Data tersimpan instant
- ✅ Form auto-fill cepat
- ✅ Tidak perlu tunggu API response

### 2. Data Persistence (Database)
- ✅ Data tidak hilang meskipun clear cache
- ✅ Sync antar device (via phone number)
- ✅ Admin bisa tracking & analytics

### 3. Fallback Mechanism
- Cek localStorage dulu (cepat)
- Jika tidak ada, cek database
- Jika tidak ada keduanya, form kosong

## Validasi Form

1. **Nama**: Tidak boleh kosong
2. **WhatsApp**: 
   - Tidak boleh kosong
   - Minimal 10 digit angka
   - Auto-clean (hapus karakter non-angka)
3. **Jumlah Jamaah**: Minimal 1 orang

## WhatsApp Message Template

```
Halo {Travel Name},

Saya ingin booking Paket Umroh

*{Package Name}*

👤 Nama: {User Name}
📱 WhatsApp: {User Phone}
👥 Jumlah Jamaah: {Pax} orang

🏢 {Travel Name}
⏱️ Durasi: {Duration}
✈️ Keberangkatan: {City}
📅 Tanggal: {Date}

*{Selected Package}*
💰 Biaya: Rp {Price}
🎁 Cashback: Rp {Cashback} (if any)

🔗 Link Paket:
{URL}

Terima kasih.
```

## Privacy & Security

- ✅ Data disimpan dengan consent (ada info di modal)
- ✅ Nomor WhatsApp di-clean dari karakter non-angka
- ✅ Data hanya digunakan untuk booking
- ✅ Tidak ada tracking tanpa consent

## Future Enhancements

1. **Analytics Dashboard**
   - Tracking berapa guest yang booking
   - Conversion rate per paket
   - Popular booking times

2. **Remarketing**
   - Email/SMS reminder untuk guest yang pernah booking
   - Special offers untuk repeat customers

3. **Auto-Login Suggestion**
   - Setelah booking 2-3x, suggest untuk register
   - Benefit: sync favorit, history, dll

## Testing

### Test Case 1: First Time Booking (Guest)
1. Logout atau buka incognito
2. Buka detail paket
3. Klik "Booking Sekarang"
4. ✅ Modal muncul dengan form kosong
5. Isi form dan submit
6. ✅ Redirect ke WhatsApp dengan data lengkap
7. ✅ Data tersimpan di localStorage & database

### Test Case 2: Second Booking (Guest)
1. Buka detail paket lain
2. Klik "Booking Sekarang"
3. ✅ Modal muncul dengan form terisi otomatis
4. Edit jumlah jamaah
5. Submit
6. ✅ Redirect ke WhatsApp dengan data updated

### Test Case 3: Logged In User
1. Login sebagai user
2. Buka detail paket
3. Klik "Booking Sekarang"
4. ✅ Langsung redirect ke WhatsApp (no modal)
5. ✅ Data user dari profil

### Test Case 4: Validation
1. Buka modal booking
2. Submit dengan form kosong
3. ✅ Error: "Nama harus diisi"
4. Isi nama, submit
5. ✅ Error: "Nomor WhatsApp harus diisi"
6. Isi phone "123", submit
7. ✅ Error: "Nomor WhatsApp tidak valid"
8. Isi phone valid, submit
9. ✅ Success

## Files Modified/Created

### Created:
- `src/app/api/guest-booking/route.ts` - API endpoint
- `GUEST_BOOKING_FEATURE.md` - Documentation

### Modified:
- `prisma/schema.prisma` - Added GuestBooking model
- `src/app/[username]/paket/[slug]/page.tsx` - Added booking modal & logic

## Migration

```bash
npx prisma db push
npx prisma generate
```

## Deployment Notes

1. Pastikan database sudah di-migrate
2. Test di production dengan incognito mode
3. Monitor database untuk guest booking entries
4. Setup analytics untuk tracking conversion
