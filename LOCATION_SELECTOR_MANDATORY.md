# Location Selector - Mandatory Selection

## ✅ Changes Applied

### **Before:**
- ✅ User bisa menutup popup dengan klik tombol X
- ✅ User bisa menutup popup dengan klik di luar popup  
- ✅ User bisa skip tanpa memilih lokasi

### **After:**
- ❌ Tombol X (close) dihilangkan
- ❌ Klik di luar popup tidak akan menutup popup
- ❌ Tekan ESC tidak akan menutup popup
- ✅ User **HARUS** memilih salah satu lokasi untuk melanjutkan
- ✅ Popup hanya akan tertutup setelah user memilih lokasi

## 🔧 Implementation

### 1. Hide Close Button
```typescript
<DialogContent 
  showCloseButton={false}  // Hide X button
>
```

### 2. Prevent Outside Click
```typescript
<DialogContent 
  onPointerDownOutside={(e) => e.preventDefault()}  // Block outside click
>
```

### 3. Prevent ESC Key
```typescript
<DialogContent 
  onEscapeKeyDown={(e) => e.preventDefault()}  // Block ESC key
>
```

### 4. Control Dialog State
```typescript
<Dialog 
  open={isOpen} 
  onOpenChange={(open) => {
    // Only allow closing if location is already selected
    if (!open && selectedLocation) {
      setIsOpen(false)
    }
  }}
>
```

## 📱 User Flow

### First Time Visit:
```
1. User buka homepage
2. Popup location selector muncul (setelah 500ms)
3. User TIDAK BISA:
   - Klik X untuk close
   - Klik di luar popup
   - Tekan ESC
4. User HARUS pilih salah satu kota
5. Klik "Simpan Lokasi"
6. Popup tertutup
7. Lokasi tersimpan di localStorage
8. Konten ter-filter sesuai lokasi
```

### Next Visit:
```
1. User buka homepage
2. Popup TIDAK muncul (pakai lokasi tersimpan)
3. Badge lokasi muncul di atas
4. User bisa ubah lokasi lewat button "Ubah"
```

### Change Location:
```
1. User klik button "Ubah" di badge
2. Popup muncul lagi
3. User pilih lokasi baru
4. Klik "Simpan Lokasi"
5. Konten refresh dengan lokasi baru
```

## 🎯 Benefits

✅ **Guaranteed Selection:** Semua user pasti memilih lokasi  
✅ **Better UX:** Konten relevan sejak awal  
✅ **Data Quality:** Analytics lebih akurat  
✅ **Personalization:** User experience lebih personal  

## ⚠️ Important Notes

### Behavior:
- Popup **HANYA** muncul saat first visit (belum ada lokasi tersimpan)
- Setelah pilih lokasi, popup tidak akan muncul lagi
- User bisa ubah lokasi kapan saja lewat badge "Ubah"

### Storage:
- Lokasi disimpan di `localStorage` dengan key `preferredLocation`
- Data persist sampai user clear browser data
- Tidak ada expiry time

### Fallback:
- Jika API gagal load cities, akan pakai default cities
- Jika tidak ada cities tersedia, button "Simpan" akan disabled

## 🧪 Testing

### Test 1: First Visit (No Location Saved)
**Steps:**
1. Clear localStorage: `localStorage.removeItem('preferredLocation')`
2. Refresh homepage
3. Popup muncul setelah 500ms

**Expected:**
- ❌ Tidak ada tombol X
- ❌ Klik di luar popup tidak menutup
- ❌ Tekan ESC tidak menutup
- ✅ Harus pilih lokasi untuk lanjut

---

### Test 2: Select Location
**Steps:**
1. Pilih salah satu kota dari dropdown
2. Klik "Simpan Lokasi"

**Expected:**
- ✅ Popup tertutup
- ✅ Badge lokasi muncul
- ✅ Konten ter-filter sesuai lokasi
- ✅ localStorage tersimpan

---

### Test 3: Next Visit (Location Already Saved)
**Steps:**
1. Refresh homepage
2. Observe behavior

**Expected:**
- ✅ Popup TIDAK muncul
- ✅ Badge lokasi langsung muncul
- ✅ Konten langsung ter-filter

---

### Test 4: Change Location
**Steps:**
1. Klik button "Ubah" di badge
2. Pilih lokasi baru
3. Klik "Simpan Lokasi"

**Expected:**
- ✅ Popup muncul
- ✅ Bisa pilih lokasi baru
- ✅ Konten refresh dengan lokasi baru

---

### Test 5: Try to Close (Should Fail)
**Steps:**
1. Clear localStorage
2. Refresh homepage
3. Popup muncul
4. Try:
   - Klik di luar popup
   - Tekan ESC
   - Cari tombol X

**Expected:**
- ❌ Semua cara tidak bisa close popup
- ✅ Hanya bisa close dengan pilih lokasi

---

## 🔍 Debug Commands

### Check Saved Location
```javascript
localStorage.getItem('preferredLocation')
// Returns: "Jakarta" or null
```

### Clear Saved Location (for testing)
```javascript
localStorage.removeItem('preferredLocation')
location.reload()
```

### Force Show Popup
```javascript
localStorage.removeItem('preferredLocation')
location.reload()
```

## 📊 Code Changes

### File: `src/components/location-selector.tsx`

**Changed:**
1. `showCloseButton={false}` - Hide X button
2. `onPointerDownOutside={(e) => e.preventDefault()}` - Block outside click
3. `onEscapeKeyDown={(e) => e.preventDefault()}` - Block ESC key
4. `onOpenChange` logic - Only allow close if location selected

**Not Changed:**
- Badge display
- "Ubah" button functionality
- Location save logic
- API calls

## 💡 User Experience

### Positive:
- ✅ Konten lebih relevan
- ✅ Tidak perlu filter manual
- ✅ Pengalaman lebih personal

### Consideration:
- ⚠️ User harus pilih (tidak bisa skip)
- ⚠️ Bisa terasa "memaksa" untuk first-time visitor
- ⚠️ Jika user tidak tahu lokasinya, bisa bingung

### Mitigation:
- ✅ Popup muncul setelah 500ms (tidak langsung)
- ✅ Dropdown dengan pilihan jelas
- ✅ Button "Simpan" dengan label jelas
- ✅ Bisa ubah lokasi kapan saja

---

**Created:** November 22, 2025  
**File:** `src/components/location-selector.tsx`  
**Feature:** Mandatory location selection on first visit
