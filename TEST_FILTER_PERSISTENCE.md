# Test Filter Persistence - Checklist

## ✅ Setup Complete
- [x] Custom hook created: `src/hooks/useFilterPersistence.ts`
- [x] Integration added to: `src/app/paket-umroh/page.tsx`
- [x] Server restarted successfully
- [x] No compilation errors

## 🧪 Manual Testing Steps

### Test 1: Basic Filter Persistence
**Steps:**
1. Buka browser: `http://localhost:3000/paket-umroh`
2. Set filter:
   - Sort: pilih "Termurah"
   - Bulan keberangkatan: pilih "Desember"
   - Durasi: pilih "10-12 hari"
   - Price range: geser slider ke 0 - 61jt
3. Scroll ke bawah halaman (scroll position akan disimpan)
4. Klik salah satu paket umroh
5. Di halaman detail, klik tombol "Back" atau browser back button

**Expected Result:**
- ✅ Sort masih "Termurah"
- ✅ Bulan keberangkatan masih "Desember"
- ✅ Durasi masih "10-12 hari"
- ✅ Price range masih 0 - 61jt
- ✅ Scroll position kembali ke posisi sebelumnya

---

### Test 2: Filter Auto-Clear (30 Minutes)
**Steps:**
1. Set beberapa filter di `/paket-umroh`
2. Buka browser console (F12)
3. Jalankan command untuk simulate expired time:
```javascript
// Get current storage
const data = JSON.parse(sessionStorage.getItem('paket-umroh-filters'))
// Set timestamp to 31 minutes ago
data.timestamp = Date.now() - (31 * 60 * 1000)
sessionStorage.setItem('paket-umroh-filters', JSON.stringify(data))
// Refresh page
location.reload()
```

**Expected Result:**
- ✅ Filter kembali ke default (all cleared)
- ✅ sessionStorage item removed

---

### Test 3: Reset Filter Button
**Steps:**
1. Set beberapa filter di `/paket-umroh`
2. Scroll ke bawah
3. Klik tombol "Reset Filter" atau "Clear All"

**Expected Result:**
- ✅ Semua filter reset ke default
- ✅ Scroll position kembali ke top
- ✅ sessionStorage cleared
- ✅ Toast notification muncul: "Filter direset"

---

### Test 4: Multiple Tabs (Independent Sessions)
**Steps:**
1. Buka `/paket-umroh` di Tab 1
2. Set filter: Search "premium", Sort "Termurah"
3. Buka `/paket-umroh` di Tab 2 (new tab)
4. Set filter berbeda: Search "hemat", Sort "Termahal"
5. Klik paket di Tab 1, lalu back
6. Klik paket di Tab 2, lalu back

**Expected Result:**
- ✅ Tab 1: Filter tetap "premium" + "Termurah"
- ✅ Tab 2: Filter tetap "hemat" + "Termahal"
- ✅ Each tab maintains its own filter state

---

### Test 5: Browser Storage Disabled
**Steps:**
1. Buka browser settings
2. Disable cookies/storage (atau gunakan incognito mode dengan storage blocked)
3. Buka `/paket-umroh`
4. Set filter
5. Klik paket, lalu back

**Expected Result:**
- ✅ App masih berfungsi normal (no crash)
- ✅ Filter tidak persist (expected behavior)
- ✅ No error di console

---

### Test 6: Scroll Position Accuracy
**Steps:**
1. Buka `/paket-umroh`
2. Scroll ke posisi tertentu (misal: tengah halaman)
3. Tunggu 1 detik (throttle delay)
4. Klik paket
5. Klik back

**Expected Result:**
- ✅ Scroll position restored dengan akurat
- ✅ Tidak ada "jumping" atau flickering

---

## 🔍 Browser Console Verification

### Check Saved Filters
```javascript
// View current saved filters
const data = JSON.parse(sessionStorage.getItem('paket-umroh-filters'))
console.log('Saved Filters:', data)
```

**Expected Output:**
```json
{
  "filters": {
    "search": "",
    "category": "all",
    "city": "all",
    "minPrice": "0",
    "maxPrice": "61000000",
    "sortBy": "termurah",
    "departureMonth": "12",
    "duration": "10-12",
    "scrollPosition": 1250
  },
  "timestamp": 1732262400000
}
```

### Check Expiry Time
```javascript
const data = JSON.parse(sessionStorage.getItem('paket-umroh-filters'))
const now = Date.now()
const age = (now - data.timestamp) / 1000 / 60 // minutes
console.log(`Filter age: ${age.toFixed(2)} minutes`)
console.log(`Will expire in: ${(30 - age).toFixed(2)} minutes`)
```

---

## 📱 Mobile Testing

### Test on Mobile Browser
1. Buka `http://192.168.100.14:3000/paket-umroh` di mobile
2. Set filter
3. Scroll
4. Tap paket
5. Tap back

**Expected Result:**
- ✅ Filter persistence works on mobile
- ✅ Scroll position restored
- ✅ Touch interactions smooth

---

## 🐛 Known Issues & Limitations

### Limitations:
1. **sessionStorage only** - Filter hilang saat close tab/browser (by design)
2. **30 minute expiry** - Auto-clear setelah 30 menit idle
3. **No cross-tab sync** - Each tab independent
4. **Client-side only** - Tidak sync dengan server

### Not Issues (Expected Behavior):
- Filter cleared saat close browser ✅
- Filter cleared saat clear browser data ✅
- Filter cleared setelah 30 menit ✅

---

## ✅ Success Criteria

All tests should pass:
- [ ] Test 1: Basic Filter Persistence
- [ ] Test 2: Filter Auto-Clear
- [ ] Test 3: Reset Filter Button
- [ ] Test 4: Multiple Tabs
- [ ] Test 5: Storage Disabled
- [ ] Test 6: Scroll Position Accuracy

## 📊 Performance Check

### Check Performance Impact
```javascript
// Measure storage operation time
console.time('saveFilters')
// Trigger filter change
console.timeEnd('saveFilters')
// Should be < 5ms
```

**Expected:**
- Save operation: < 5ms
- Load operation: < 5ms
- No noticeable lag

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Mark feature as complete
2. ✅ Update documentation
3. ✅ Deploy to production

If issues found:
1. Document the issue
2. Check browser console for errors
3. Verify implementation
4. Fix and re-test
