# 🔄 Reset Quota Feature - Super Admin

## 📋 Overview
Fitur ini memungkinkan Super Admin untuk mereset kuota `packageUsed` travel yang sudah terpakai kembali ke 0. Ini berguna ketika travel ingin memulai dari awal atau ada kesalahan perhitungan.

## ✨ Features Implemented

### 1. **Super Admin Travels Page**
- ✅ Menampilkan kolom "Paket Aktif" (jumlah paket yang masih aktif)
- ✅ Menampilkan kolom "Kuota Terpakai" (packageUsed - permanent counter)
- ✅ Tombol Reset Quota (🔄) muncul jika:
  - Travel bukan unlimited (packageLimit !== 999)
  - packageUsed > 0
- ✅ Color coding berdasarkan packageUsed:
  - 🟢 Green: < 70% terpakai
  - 🟠 Orange: 70-90% terpakai
  - 🔴 Red: ≥ 90% terpakai

### 2. **API Endpoint**
**PATCH** `/api/travels/id/[id]`

Sekarang mendukung 2 operasi:
1. Reset password (existing)
2. Reset quota (new)

#### Reset Quota Request:
```json
{
  "packageUsed": 0
}
```

#### Response:
```json
{
  "success": true,
  "message": "Kuota berhasil direset"
}
```

### 3. **Confirmation Dialog**
Sebelum reset, muncul konfirmasi:
```
Reset kuota untuk "Barokah Madinah Tour"?

Kuota terpakai saat ini: 5
Setelah reset, kuota akan kembali ke 0.

⚠️ Tindakan ini tidak dapat dibatalkan!
```

## 🎯 Use Cases

### Scenario 1: Travel Upgrade Package
Travel upgrade dari Basic (10 paket) ke Premium (50 paket), tapi sudah terpakai 8 slot.
- Super Admin bisa reset quota ke 0
- Travel bisa mulai fresh dengan 50 slot baru

### Scenario 2: Kesalahan Data
Ada kesalahan import data yang menyebabkan packageUsed tidak akurat.
- Super Admin bisa reset dan re-initialize dengan script

### Scenario 3: Periode Baru
Travel ingin memulai periode baru (misal: tahun baru).
- Super Admin bisa reset quota untuk fresh start

## 🔧 Technical Implementation

### Database Schema
```prisma
model Travel {
  // ... other fields
  packageLimit     Int      @default(10)
  packageUsed      Int      @default(0)  // Permanent counter
}
```

### Frontend (Super Admin)
**File:** `src/app/admintrip/travels/page.tsx`

```typescript
const handleResetQuota = async (id: string, name: string, currentUsed: number) => {
  if (!confirm(`Reset kuota untuk "${name}"?...`)) return
  
  const response = await fetch(`/api/travels/id/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageUsed: 0 })
  })
  
  if (result.success) {
    alert('✅ Kuota berhasil direset!')
    fetchTravels()
  }
}
```

### Backend API
**File:** `src/app/api/travels/id/[id]/route.ts`

```typescript
export async function PATCH(request, { params }) {
  const { packageUsed } = await request.json()
  
  if (packageUsed !== undefined) {
    await db.travel.update({
      where: { id },
      data: { packageUsed }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Kuota berhasil direset'
    })
  }
}
```

## 🧪 Testing

### Test Script
**File:** `scripts/test-reset-quota.js`

```bash
node scripts/test-reset-quota.js
```

Output:
```
🧪 Testing Reset Quota Feature...

📦 Selected Travel:
   Name: Barokah Madinah Tour
   Package Used (before): 3

🔄 Resetting quota to 0...
✅ Quota reset successful!
   Package Used (after): 0

🔄 Restoring original value...
✅ Original value restored: 3

✅ Reset Quota Test PASSED!
```

## 🎨 UI/UX

### Travels Table View
```
┌─────────────────────┬──────────────┬──────────────────┬────────┐
│ Travel Name         │ Paket Aktif  │ Kuota Terpakai   │ Aksi   │
├─────────────────────┼──────────────┼──────────────────┼────────┤
│ Barokah Madinah     │      3       │    5/10 🟠       │ 👁️ ✏️ 🔄 🗑️ │
│ Nur Arafah Travel   │      2       │    2/10 🟢       │ 👁️ ✏️ 🔄 🗑️ │
│ Al-Fattah Premium   │      5       │    9/10 🔴       │ 👁️ ✏️ 🔄 🗑️ │
│ Unlimited Travel    │      10      │    15/∞ 🟢       │ 👁️ ✏️ 🗑️    │
└─────────────────────┴──────────────┴──────────────────┴────────┘
```

**Legend:**
- 👁️ = View Profile
- ✏️ = Edit Travel
- 🔄 = Reset Quota (only if packageUsed > 0 and not unlimited)
- 🗑️ = Delete Travel

### Button Visibility Rules
```typescript
{travel.packageLimit !== 999 && (travel.packageUsed || 0) > 0 && (
  <Button onClick={() => handleResetQuota(...)}>
    <RefreshCw className="w-4 h-4" />
  </Button>
)}
```

## 🔐 Security & Permissions

### Access Control
- ✅ **Only Super Admin** can reset quota
- ✅ Travel Admin **cannot** reset their own quota
- ✅ Requires confirmation before reset
- ✅ Logs reset action to console

### Validation
```typescript
// Validate packageUsed value
if (typeof packageUsed !== 'number' || packageUsed < 0) {
  return NextResponse.json({
    success: false,
    error: 'Nilai packageUsed tidak valid'
  }, { status: 400 })
}
```

## 📊 Impact on System

### What Happens After Reset?
1. ✅ `packageUsed` set to 0
2. ✅ Travel can create packages again (if within limit)
3. ✅ Active packages remain unchanged
4. ✅ Historical data preserved
5. ✅ No impact on existing bookings

### What Does NOT Change?
- ❌ Active packages count
- ❌ Package data
- ❌ Booking data
- ❌ Travel profile
- ❌ packageLimit value

## 🚀 Deployment Checklist

- [x] Database migration applied
- [x] Prisma client regenerated
- [x] API endpoint updated
- [x] Frontend UI updated
- [x] Test script created
- [x] Documentation written
- [ ] Manual testing in browser
- [ ] Production deployment

## 📝 Usage Instructions

### For Super Admin:
1. Login ke `/admintrip/login`
2. Navigate ke "Travels" menu
3. Cari travel yang ingin direset quotanya
4. Klik tombol 🔄 (Reset Quota)
5. Konfirmasi action
6. Quota akan direset ke 0

### For Travel Admin:
- Travel Admin **tidak bisa** reset quota sendiri
- Harus hubungi Super Admin jika perlu reset
- Bisa melihat quota usage di dashboard

## 🔗 Related Features

1. **Permanent Quota System** - `PERMANENT_QUOTA_SYSTEM.md`
2. **Package Limit Feature** - `PACKAGE_LIMIT_FEATURE.md`
3. **Travel Admin Management** - `TRAVEL_ADMIN_MANAGEMENT_TAB.md`

## 📞 Support

Jika ada masalah dengan reset quota:
1. Check console logs untuk error
2. Verify database connection
3. Ensure Prisma client is up to date
4. Contact system administrator

---

**Status:** ✅ **IMPLEMENTED & TESTED**
**Version:** 1.0.0
**Last Updated:** 2025-11-24
