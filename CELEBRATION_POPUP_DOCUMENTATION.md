# 🎉 Celebration Popup - Dokumentasi Lengkap

## 📋 Daftar Isi
1. [Overview](#overview)
2. [Fitur Utama](#fitur-utama)
3. [Milestone yang Ditrack](#milestone-yang-ditrack)
4. [Komponen dan File](#komponen-dan-file)
5. [Cara Kerja](#cara-kerja)
6. [Penggunaan](#penggunaan)
7. [Pengaturan Admin](#pengaturan-admin)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Customization](#customization)
11. [API Reference](#api-reference)
12. [FAQ](#faq)

---

## Overview

Celebration Popup adalah fitur yang menampilkan popup perayaan meriah ketika travel admin mencapai milestone tertentu dalam views atau booking clicks paket umroh mereka.

### 🎯 Tujuan
- Memberikan feedback positif kepada travel admin
- Meningkatkan engagement dan motivasi
- Memberikan visualisasi pencapaian yang menarik
- Mendorong travel admin untuk terus meningkatkan performa

### ✨ Karakteristik
- Popup muncul otomatis saat milestone tercapai
- Animasi confetti yang meriah
- 4 tipe celebration dengan gradient berbeda
- User close manual dengan tombol X
- Responsive design untuk semua device
- Hanya muncul sekali per milestone per browser

---

## Fitur Utama

### 🎨 Visual Features
- **Confetti Animation**: Animasi confetti berwarna-warni dari kiri dan kanan
- **Gradient Background**: 4 tipe gradient sesuai level milestone
- **Bounce Animation**: Emoji dan elemen beranimasi bounce
- **Sparkles Effect**: Icon sparkles yang berkedip
- **Backdrop Blur**: Background blur untuk fokus pada popup

### ⚙️ Functional Features
- **Auto Detection**: Otomatis detect milestone saat dashboard load
- **One-time Show**: Setiap milestone hanya muncul sekali
- **localStorage Tracking**: Milestone disimpan di browser
- **Enable/Disable**: Admin bisa aktifkan/nonaktifkan fitur
- **Preview Mode**: Admin bisa preview popup di settings

### 📱 Responsive Features
- Mobile Optimized, Tablet Friendly, Desktop Full, Touch Friendly

---

## Milestone yang Ditrack

### 📦 Per Paket Umroh

**Views:** 10 (🎯 Bagus), 100 (🔥 Mantap), 500 (⭐ Luar Biasa), 1000 (💎 Sempurna)
**Booking:** 10 (🎯 Bagus), 100 (🔥 Mantap), 500 (⭐ Luar Biasa)

### 📊 Total Semua Paket

**Total Views:** 100 (🎯), 500 (⭐), 1000 (💎)
**Total Booking:** 100 (🎯), 500 (⭐), 1000 (💎)

---

## Komponen dan File

### 🧩 Core Components

**1. CelebrationPopup Component**
- File: `src/components/celebration-popup.tsx`
- Props: isOpen, onClose, title, message, emoji, type
- Features: Confetti animation, 4 gradient types, manual close

**2. useCelebration Hook**
- File: `src/hooks/useCelebration.ts`
- Functions: checkPackageMilestones, checkTotalMilestones, resetMilestones
- State: celebration, isEnabled

**3. Travel Admin Dashboard**
- File: `src/app/travel-admin/page.tsx`
- Integration: Auto-check milestones after data loaded

**4. Admin Settings**
- File: `src/app/admintrip/settings/page.tsx`
- Tab: "Popup Selebrasi"
- Features: Enable/disable, preview, reset instructions

### 🗄️ Database
- Table: Settings
- Key: `celebrationEnabled`
- Values: "true" | "false"
- Init Script: `scripts/init-celebration-setting.js`

### 💾 Storage
- localStorage Key: `celebrationMilestones`
- Format: JSON object dengan milestone IDs

---

## Cara Kerja

### 🔄 Flow Diagram

```
Travel Admin Login
    ↓
Dashboard Load
    ↓
Fetch Package Stats
    ↓
Check Celebration Enabled (DB)
    ↓
Check Milestones (Hook)
    ↓
Compare with localStorage
    ↓
New Milestone? → Show Popup → Save to localStorage
    ↓
No New Milestone → Continue
```

### 📝 Detail Process

**1. Initialization**
- Hook `useCelebration` dipanggil di dashboard
- Fetch setting `celebrationEnabled` dari database
- Load milestone history dari localStorage

**2. Milestone Check**
- Setelah data paket loaded
- Loop semua paket, check views & booking
- Calculate total views & booking
- Compare dengan milestone thresholds

**3. Popup Trigger**
- Jika milestone baru tercapai
- Check apakah sudah pernah ditampilkan (localStorage)
- Jika belum, trigger confetti & show popup
- Save milestone ID ke localStorage

**4. Manual Close**
- User close popup dengan tombol X
- Setelah close, milestone tersimpan permanent
- Popup tidak mengganggu workflow

---

## Penggunaan

### 🚀 Quick Start

**1. Initialize Database Setting**
```bash
node scripts/init-celebration-setting.js
```

**2. Login sebagai Travel Admin**
```
URL: http://localhost:3000/travel-admin/login
```

**3. Buka Dashboard**
```
URL: http://localhost:3000/travel-admin
```

**4. Popup akan muncul otomatis jika ada milestone baru!**

### 💻 Code Integration

**Di Travel Admin Dashboard:**
```typescript
import { useCelebration } from '@/hooks/useCelebration'
import { CelebrationPopup } from '@/components/celebration-popup'

const { celebration, closeCelebration, checkPackageMilestones, checkTotalMilestones } = useCelebration()

// Check milestones setelah data loaded
useEffect(() => {
  if (packageStats.length > 0) {
    checkPackageMilestones(packageStats)
    checkTotalMilestones(totalViews, totalBookingClicks)
  }
}, [packageStats, totalViews, totalBookingClicks])

// Render popup
{celebration && (
  <CelebrationPopup
    isOpen={true}
    onClose={closeCelebration}
    title={celebration.title}
    message={celebration.message}
    emoji={celebration.emoji}
    type={celebration.type}
  />
)}
```

---

## Pengaturan Admin

### ⚙️ Akses Settings

**1. Login Super Admin**
```
URL: http://localhost:3000/admintrip/login
Username: superadmin
Password: [your-password]
```

**2. Buka Settings**
```
URL: http://localhost:3000/admintrip/settings
```

**3. Klik Tab "Popup Selebrasi"**

### 🎛️ Fitur Settings

**Enable/Disable Toggle**
- Aktifkan atau nonaktifkan fitur celebration
- Perubahan langsung tersimpan ke database
- Mempengaruhi semua travel admin

**Preview Popup Button**
- Klik untuk melihat contoh popup
- Popup muncul dengan animasi penuh
- Auto-close setelah 5 detik

**Reset Milestone Button**
- Menampilkan instruksi reset
- Travel admin bisa reset milestone mereka sendiri
- Berguna untuk testing ulang

**Save Settings Button**
- Simpan perubahan ke database
- Alert konfirmasi sukses/gagal

---

## Testing

### 🧪 Manual Testing

**Test 1: First Time Milestone**
1. Clear localStorage: `localStorage.removeItem('celebrationMilestones')`
2. Login travel admin yang punya paket dengan 10+ views
3. Popup harus muncul dengan confetti
4. Check localStorage - milestone tersimpan

**Test 2: Already Shown Milestone**
1. Login lagi dengan user yang sama
2. Popup tidak muncul lagi untuk milestone yang sama
3. Milestone tetap ada di localStorage

**Test 3: Multiple Milestones**
1. Buat paket baru, tambahkan views manual di database
2. Set views ke 100
3. Login - popup 10 views dan 100 views muncul berurutan

**Test 4: Enable/Disable**
1. Login super admin
2. Disable celebration di settings
3. Login travel admin - popup tidak muncul
4. Enable lagi - popup muncul normal

**Test 5: Preview**
1. Login super admin
2. Buka settings → tab Popup Selebrasi
3. Klik "Preview Popup"
4. Popup muncul dengan animasi

### 🔍 Debug Commands

**Check localStorage:**
```javascript
console.log(localStorage.getItem('celebrationMilestones'))
```

**Check database setting:**
```bash
node scripts/init-celebration-setting.js
```

**Reset milestones:**
```javascript
localStorage.removeItem('celebrationMilestones')
```

**Trigger test celebration:**
```javascript
// Di console browser
window.testCelebration = () => {
  // Trigger manual celebration
}
```

---

## Troubleshooting

### ❌ Popup Tidak Muncul

**Penyebab 1: Feature Disabled**
- Check database setting `celebrationEnabled`
- Pastikan value = "true"
- Fix: Enable di admin settings

**Penyebab 2: Milestone Sudah Ditampilkan**
- Check localStorage `celebrationMilestones`
- Milestone ID sudah ada di list
- Fix: Clear localStorage untuk testing

**Penyebab 3: Belum Mencapai Milestone**
- Check views/booking count
- Pastikan sudah mencapai threshold (10, 100, 500, 1000)
- Fix: Tambahkan views/booking manual

**Penyebab 4: Hook Tidak Dipanggil**
- Check integration di dashboard
- Pastikan `checkPackageMilestones` dipanggil
- Fix: Tambahkan useEffect dengan dependency yang benar

### ⚠️ Confetti Tidak Muncul

**Penyebab: Library Tidak Terinstall**
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

### 🐛 Popup Muncul Terus-menerus

**Penyebab: localStorage Tidak Tersimpan**
- Check browser privacy settings
- Pastikan localStorage enabled
- Fix: Enable localStorage di browser settings

### 💥 Error saat Save Settings

**Penyebab: API Route Error**
- Check `/api/settings` route
- Pastikan database connection OK
- Check console untuk error details

---

## Customization

### 🎨 Mengubah Gradient Colors

Edit `src/components/celebration-popup.tsx`:

```typescript
const gradients = {
  good: 'from-blue-500 via-cyan-500 to-teal-500',
  great: 'from-orange-500 via-red-500 to-pink-500',
  amazing: 'from-purple-500 via-pink-500 to-red-500',
  perfect: 'from-yellow-500 via-orange-500 to-red-500'
}
```

### 🎯 Menambah Milestone Baru

Edit `src/hooks/useCelebration.ts`:

```typescript
// Tambahkan milestone baru
if (views >= 2000 && !shown.includes(`${pkg.id}-views-2000`)) {
  newCelebrations.push({
    id: `${pkg.id}-views-2000`,
    title: '🏆 Fenomenal!',
    message: `Paket "${pkg.title}" telah dilihat 2000 kali!`,
    emoji: '🏆',
    type: 'perfect'
  })
}
```

### 🎨 Mengubah Animasi Confetti

Edit `src/components/celebration-popup.tsx`:

```typescript
// Ubah durasi confetti animation
const duration = 5000 // Ubah dari 3000 ke 5000 (5 detik)

// Ubah jumlah particle
const particleCount = 100 * (timeLeft / duration) // Ubah dari 50 ke 100
```

### 🎊 Mengubah Confetti Settings

```typescript
confetti({
  particleCount: 200, // Jumlah confetti
  spread: 100, // Spread angle
  origin: { y: 0.6, x: 0 }, // Posisi origin
  colors: ['#ff0000', '#00ff00', '#0000ff'] // Custom colors
})
```

---

## API Reference

### useCelebration Hook

```typescript
const {
  celebration,      // Current celebration object atau null
  isEnabled,        // Boolean - feature enabled status
  closeCelebration, // Function - close popup
  checkPackageMilestones,  // Function - check per-package milestones
  checkTotalMilestones,    // Function - check total milestones
  resetMilestones,         // Function - reset all milestones
  triggerTestCelebration   // Function - trigger test popup
} = useCelebration()
```

### CelebrationPopup Props

```typescript
interface CelebrationPopupProps {
  isOpen: boolean           // Show/hide popup
  onClose: () => void       // Close handler
  title: string             // Popup title
  message: string           // Popup message
  emoji: string             // Emoji to display
  type: 'good' | 'great' | 'amazing' | 'perfect'  // Gradient type
}
```

### Celebration Object

```typescript
interface Celebration {
  id: string       // Unique milestone ID
  title: string    // Celebration title
  message: string  // Celebration message
  emoji: string    // Emoji character
  type: 'good' | 'great' | 'amazing' | 'perfect'
}
```

### localStorage Structure

```json
{
  "celebrationMilestones": {
    "123-views-10": true,
    "123-views-100": true,
    "123-booking-10": true,
    "total-views-100": true,
    "total-booking-100": true
  }
}
```

---

## FAQ

### ❓ Apakah popup muncul untuk semua travel admin?

Ya, popup muncul untuk semua travel admin yang mencapai milestone, asalkan fitur enabled di settings.

### ❓ Bagaimana cara reset milestone untuk testing?

Jalankan di browser console:
```javascript
localStorage.removeItem('celebrationMilestones')
```

### ❓ Apakah milestone tersimpan di database?

Tidak. Milestone disimpan di localStorage browser masing-masing travel admin. Ini memastikan setiap admin punya tracking milestone sendiri.

### ❓ Bagaimana jika travel admin clear browser data?

Milestone akan reset dan popup akan muncul lagi untuk milestone yang sudah tercapai.

### ❓ Apakah bisa disable popup untuk travel admin tertentu?

Saat ini tidak. Feature enable/disable berlaku global untuk semua travel admin. Tapi bisa dikembangkan dengan menambahkan setting per-travel.

### ❓ Bagaimana cara close popup?

User harus close popup secara manual dengan mengklik tombol X di pojok kanan atas. Popup tidak akan close otomatis.

### ❓ Apakah popup mengganggu workflow?

Tidak. Popup muncul dengan backdrop blur tapi tidak blocking. User tetap bisa close dan melanjutkan pekerjaan.

### ❓ Bagaimana cara menambah milestone baru?

Edit file `src/hooks/useCelebration.ts` dan tambahkan logic check milestone baru sesuai kebutuhan.

### ❓ Apakah confetti mempengaruhi performance?

Minimal. Confetti menggunakan canvas-confetti yang sudah dioptimasi. Animasi hanya berjalan saat popup muncul.

### ❓ Bagaimana cara customize pesan celebration?

Edit message di `src/hooks/useCelebration.ts` pada bagian milestone check.

---

## 📝 Changelog

**v1.0.0 - Initial Release**
- CelebrationPopup component
- useCelebration hook
- Integration di travel admin dashboard
- Admin settings tab
- 11 milestone thresholds
- 4 celebration types
- Confetti animation
- localStorage tracking
- Enable/disable feature
- Preview mode

---

## 🤝 Support

Jika ada pertanyaan atau issue:
1. Check dokumentasi ini terlebih dahulu
2. Check troubleshooting section
3. Test dengan reset localStorage
4. Check browser console untuk error
5. Verify database settings

---

**Dibuat dengan ❤️ untuk Travel Admin Umroh Platform**


---

## 🎉 Update: Tab "Pop UP Selebrasi" di Admin Settings

### Lokasi
**URL:** `http://localhost:3000/admintrip/settings`
**Tab:** "Pop UP Selebrasi" (setelah tab "Algoritma")

### Fitur yang Tersedia

#### 1. Enable/Disable Toggle
- Switch untuk mengaktifkan/nonaktifkan fitur celebration
- Perubahan langsung tersimpan ke database
- Mempengaruhi semua travel admin

#### 2. Milestone Information Display
Menampilkan daftar lengkap milestone yang ditrack:

**Per Paket Umroh:**
- 🎯 10 views/booking → Bagus!
- 🔥 100 views/booking → Mantap!
- ⭐ 500 views/booking → Luar Biasa!
- 💎 1000 views → Sempurna!

**Total Semua Paket:**
- 🎯 100 total → Bagus!
- ⭐ 500 total → Luar Biasa!
- 💎 1000 total → Sempurna!

#### 3. Preview Popup Button
- Klik untuk melihat contoh popup celebration
- Popup muncul dengan animasi confetti penuh
- Auto-close setelah 5 detik
- Berguna untuk testing tampilan

#### 4. Reset Milestone Button
- Menampilkan instruksi untuk reset milestone
- Travel admin bisa reset milestone mereka sendiri
- Berguna untuk testing ulang fitur

#### 5. Save Settings Button
- Simpan perubahan enable/disable ke database
- Alert konfirmasi sukses/gagal
- Loading state saat menyimpan

### Cara Menggunakan

1. **Login sebagai Super Admin**
   ```
   URL: http://localhost:3000/admintrip/login
   Username: superadmin
   Password: [your-password]
   ```

2. **Buka Settings**
   ```
   URL: http://localhost:3000/admintrip/settings
   ```

3. **Klik Tab "Pop UP Selebrasi"**
   - Tab berada setelah "Algoritma"
   - Icon: 🎉 PartyPopper

4. **Atur Pengaturan**
   - Toggle enable/disable sesuai kebutuhan
   - Klik "Preview Popup" untuk melihat contoh
   - Klik "Save" untuk menyimpan perubahan

### Technical Details

**State Management:**
```typescript
const [celebrationEnabled, setCelebrationEnabled] = useState(true)
const [loadingCelebration, setLoadingCelebration] = useState(false)
const [showPreview, setShowPreview] = useState(false)
```

**API Endpoints:**
- GET: `/api/settings?key=celebrationEnabled`
- POST: `/api/settings` (body: { key, value, description })

**Database:**
- Table: `Settings`
- Key: `celebrationEnabled`
- Value: `"true"` | `"false"`

### UI Components Used
- Card (shadcn/ui)
- Button (shadcn/ui)
- Switch (shadcn/ui)
- Label (shadcn/ui)
- CelebrationPopup (custom component)
- PartyPopper icon (lucide-react)

### Responsive Design
- Mobile: Stack layout, full width buttons
- Tablet: 2-column milestone grid
- Desktop: Full layout dengan spacing optimal

---

**Last Updated:** November 24, 2025
**Version:** 1.1.0 - Added Admin Settings Tab


---

## 🎯 Update v1.2.0: Individual Preview Buttons

### Fitur Baru: Preview Per Milestone

Setiap milestone sekarang memiliki tombol "Preview" sendiri untuk melihat tampilan popup yang sebenarnya.

#### Total Preview Buttons: 13

**Per Paket Umroh (7 buttons):**
- 🎯 10 views → Preview popup "Bagus!"
- 🔥 100 views → Preview popup "Mantap!"
- ⭐ 500 views → Preview popup "Luar Biasa!"
- 💎 1000 views → Preview popup "Sempurna!"
- 🎯 10 booking → Preview popup "Bagus!"
- 🔥 100 booking → Preview popup "Mantap!"
- ⭐ 500 booking → Preview popup "Luar Biasa!"

**Total Semua Paket (6 buttons):**
- 🎯 100 total views → Preview popup "Bagus!"
- ⭐ 500 total views → Preview popup "Luar Biasa!"
- 💎 1000 total views → Preview popup "Sempurna!"
- 🎯 100 total booking → Preview popup "Bagus!"
- ⭐ 500 total booking → Preview popup "Luar Biasa!"
- 💎 1000 total booking → Preview popup "Sempurna!"

#### Cara Menggunakan

1. Buka tab "Pop UP Selebrasi" di settings
2. Scroll ke section "Milestone yang Ditrack"
3. Klik tombol "Preview" pada milestone yang ingin dilihat
4. Popup akan muncul dengan:
   - Title sesuai milestone
   - Message yang relevan
   - Emoji yang tepat
   - Gradient background sesuai type
   - Confetti animation
5. Popup auto-close setelah 5 detik

#### Benefits

- **Accurate Preview**: Melihat tampilan sebenarnya untuk setiap milestone
- **Better Testing**: Test individual milestone tanpa harus mencapainya
- **Clear Understanding**: Admin paham apa yang akan dilihat travel admin
- **Quality Assurance**: Memastikan semua milestone bekerja dengan baik

#### Technical Details

**New State:**
```typescript
const [previewData, setPreviewData] = useState<{
  title: string
  message: string
  emoji: string
  type: 'good' | 'great' | 'amazing' | 'perfect'
} | null>(null)
```

**New Function:**
```typescript
const previewMilestone = (
  milestone: string,
  count: number,
  category: 'views' | 'booking' | 'total-views' | 'total-booking'
) => {
  // Dynamic title, message, emoji, type based on parameters
  // Show popup with confetti
  // Auto-close after 5 seconds
}
```

**UI Improvements:**
- Each milestone in white card with border
- Small preview button (h-7, text-xs)
- Description text below each milestone
- Responsive 2-column grid layout

---

**Last Updated:** November 24, 2025
**Version:** 1.2.0 - Added Individual Preview Buttons
