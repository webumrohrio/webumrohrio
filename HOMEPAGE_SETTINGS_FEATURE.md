# Homepage Settings Feature

## Overview
Fitur pengaturan halaman beranda yang memungkinkan admin mengontrol tampilan dan konten di homepage.

## Lokasi
**Admin Panel**: http://localhost:3000/admintrip/settings  
**Tab**: Beranda (tab pertama)

## Fitur Pengaturan

### 1. Jumlah Paket Umroh di Beranda
**Setting Key**: `homePackageCount`

**Pilihan:**
- 4 Paket
- 6 Paket (default)
- 8 Paket
- 10 Paket

**Fungsi:**
Menentukan berapa banyak paket umroh yang ditampilkan di section "Paket Umroh Pilihan" di halaman beranda.

**Responsive Behavior:**
- **Desktop (≥1024px):** Selalu menampilkan 8 paket (fixed, tidak terpengaruh setting)
- **Mobile & Tablet (<1024px):** Mengikuti setting admin (4-10 paket)

**Catatan:** Setting ini hanya berlaku untuk tampilan mobile dan tablet. Desktop selalu menampilkan 8 paket untuk pengalaman optimal.

### 2. Toggle Data Analitik
**Setting Key**: `showAnalytics`  
**Type**: Boolean (true/false)  
**Default**: true

**Fungsi:**
Mengaktifkan/menonaktifkan section data analitik di halaman beranda yang menampilkan:
- 📊 Jumlah keberangkatan bulan ini
- 📅 Jumlah keberangkatan bulan depan
- 📦 Total paket tersedia

**Tampilan:**
Section dengan 3 card statistik di bagian atas homepage.

### 3. Toggle Section Promo
**Setting Key**: `showPromo`  
**Type**: Boolean (true/false)  
**Default**: true

**Fungsi:**
Mengaktifkan/menonaktifkan section promo di halaman beranda.

**Tampilan:**
Banner orange dengan informasi promo/penawaran khusus.

## Database Schema

Settings disimpan di tabel `Settings`:

```prisma
model Settings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Records:**
```javascript
{
  key: 'homePackageCount',
  value: '6',
  description: 'Number of packages to show on homepage'
}

{
  key: 'showAnalytics',
  value: 'true',
  description: 'Show analytics section on homepage'
}

{
  key: 'showPromo',
  value: 'true',
  description: 'Show promo section on homepage'
}
```

## API Integration

### Fetch Settings
```typescript
const response = await fetch('/api/settings?key=homePackageCount')
const result = await response.json()
const count = result.data.value // '6'
```

### Save Settings
```typescript
await fetch('/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'homePackageCount',
    value: '8',
    description: 'Number of packages to show on homepage'
  })
})
```

## Implementation in Homepage

### Example Usage in `src/app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [packageCount, setPackageCount] = useState(6)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [showPromo, setShowPromo] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [countRes, analyticsRes, promoRes] = await Promise.all([
        fetch('/api/settings?key=homePackageCount'),
        fetch('/api/settings?key=showAnalytics'),
        fetch('/api/settings?key=showPromo')
      ])

      const countData = await countRes.json()
      const analyticsData = await analyticsRes.json()
      const promoData = await promoRes.json()

      if (countData.success && countData.data) {
        setPackageCount(parseInt(countData.data.value))
      }
      if (analyticsData.success && analyticsData.data) {
        setShowAnalytics(analyticsData.data.value === 'true')
      }
      if (promoData.success && promoData.data) {
        setShowPromo(promoData.data.value === 'true')
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  return (
    <div>
      {/* Analytics Section */}
      {showAnalytics && (
        <section className="analytics">
          {/* Analytics cards */}
        </section>
      )}

      {/* Promo Section */}
      {showPromo && (
        <section className="promo">
          {/* Promo banner */}
        </section>
      )}

      {/* Packages Section */}
      <section className="packages">
        {/* Show {packageCount} packages */}
      </section>
    </div>
  )
}
```

## UI Components

### Tab Navigation
- Icon: Home (Lucide React)
- Position: First tab
- Label: "Beranda"

### Settings Card
- Package count: Dropdown select
- Analytics toggle: Switch component
- Promo toggle: Switch component
- Preview info: Blue info box
- Save button: Primary button with loading state

## User Flow

1. Admin navigates to Settings page
2. Clicks "Beranda" tab
3. Adjusts settings:
   - Select package count from dropdown
   - Toggle analytics on/off
   - Toggle promo on/off
4. Preview shows current configuration
5. Click "Simpan Pengaturan Beranda"
6. Success alert appears
7. Settings saved to database
8. Homepage reflects new settings

## Benefits

✅ **Flexibility**: Admin can customize homepage layout  
✅ **Performance**: Show fewer packages for faster loading  
✅ **Clean UI**: Hide sections that aren't needed  
✅ **User Control**: Easy toggle switches  
✅ **Real-time Preview**: See configuration before saving

## Testing

1. **Test Package Count:**
   - Change to 4, 6, 8, or 10
   - Save settings
   - Check homepage shows correct number

2. **Test Analytics Toggle:**
   - Turn off analytics
   - Save settings
   - Check homepage hides analytics section

3. **Test Promo Toggle:**
   - Turn off promo
   - Save settings
   - Check homepage hides promo banner

4. **Test Persistence:**
   - Change settings
   - Refresh page
   - Settings should persist

---

**Created**: November 22, 2025  
**File**: `src/app/admintrip/settings/page.tsx`  
**Tab**: Beranda (homepage)
