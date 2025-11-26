# User Online Status System

## Overview
Sistem untuk tracking status online user secara real-time menggunakan heartbeat mechanism.

## Komponen

### 1. Database Schema
```prisma
model User {
  lastActive DateTime? // Timestamp terakhir user aktif
}
```

### 2. API Endpoint
**POST** `/api/user/heartbeat`
- Update `lastActive` timestamp user
- Dipanggil otomatis setiap 3 menit
- Hanya untuk user yang login

### 3. Custom Hook
`useUserHeartbeat()` di `src/hooks/useUserHeartbeat.ts`
- Auto-send heartbeat setiap 3 menit
- Berjalan di background
- Cleanup otomatis saat unmount

### 4. Integration
Terintegrasi di `MobileLayout` component
- Berjalan di semua halaman user
- Tidak perlu setup manual di setiap page

## Cara Kerja

1. **User Login & Browse**
   - User login dan buka aplikasi
   - MobileLayout load → useUserHeartbeat() aktif
   - Heartbeat pertama dikirim immediately

2. **Heartbeat Interval**
   - Setiap 5 menit, kirim POST ke `/api/user/heartbeat`
   - Update `lastActive` di database
   - Console log: "Heartbeat sent: HH:MM:SS"

3. **Status Online Detection**
   - Admin buka halaman `/admintrip/users`
   - Sistem cek `lastActive` setiap user
   - **Online** = lastActive < 7 menit yang lalu (5 min interval + 2 min buffer)
   - **Offline** = lastActive > 7 menit yang lalu

4. **Display Format**
   - Badge hijau "Online" dengan dot indicator
   - Badge abu-abu "Offline" dengan dot indicator
   - Waktu terakhir online:
     - "Baru saja" (< 1 menit)
     - "X menit yang lalu" (< 1 jam)
     - "X jam yang lalu" (< 24 jam)
     - "X hari yang lalu" (< 7 hari)
     - Tanggal lengkap (> 7 hari)

## Keuntungan

✅ **Akurat** - Update setiap 5 menit di semua halaman
✅ **Efisien** - Hanya kirim timestamp, tidak fetch data
✅ **Otomatis** - Tidak perlu setup manual
✅ **Real-time** - Admin bisa lihat status online langsung
✅ **Lightweight** - Request kecil, tidak membebani server

## Testing

1. Login sebagai user
2. Browse aplikasi (home, paket, artikel, dll)
3. Buka console browser → lihat log "Heartbeat sent"
4. Login sebagai admin
5. Buka `/admintrip/users`
6. Lihat status "Online" dengan badge hijau
7. Tunggu > 7 menit tanpa aktivitas
8. Refresh halaman admin → status berubah "Offline"

## Configuration

Untuk mengubah interval heartbeat, edit di `src/hooks/useUserHeartbeat.ts`:

```typescript
const HEARTBEAT_INTERVAL = 5 * 60 * 1000 // 5 minutes (current)
// Ubah sesuai kebutuhan, misal:
// 3 * 60 * 1000 = 3 minutes (lebih akurat, lebih banyak request)
// 10 * 60 * 1000 = 10 minutes (lebih hemat, kurang akurat)
```

Untuk mengubah threshold online, edit di `src/app/admintrip/users/page.tsx`:

```typescript
const isUserOnline = (lastActive: string | null) => {
  // ...
  return diffMinutes < 7 // Online if active within last 7 minutes
  // Rekomendasi: interval + 2 menit buffer
  // Jika interval 5 menit → threshold 7 menit
  // Jika interval 10 menit → threshold 12 menit
}
```

## Notes

- Heartbeat hanya berjalan saat user login
- Heartbeat otomatis stop saat user logout atau close browser
- Tidak ada polling dari server, hanya client yang kirim update
- Database hanya menyimpan 1 timestamp per user (efisien)
