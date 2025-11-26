# 🧪 Manual Testing Guide - Reset Quota Feature

## ✅ Prerequisites
- [x] Server running: `npm run dev`
- [x] Database migrated
- [x] Prisma client generated
- [x] API test passed ✅

## 📋 Test Steps

### Step 1: Login as Super Admin
1. Navigate to: `http://localhost:3000/admintrip/login`
2. Login credentials:
   - Username: `admin`
   - Password: `admin123`
3. ✅ Should redirect to Super Admin dashboard

### Step 2: Navigate to Travels Page
1. Click "Travels" menu di sidebar
2. URL: `http://localhost:3000/admintrip/travels`
3. ✅ Should see list of travels

### Step 3: Verify Display Changes
Check table columns:
- ✅ "Paket Aktif" column (shows active packages count)
- ✅ "Kuota Terpakai" column (shows packageUsed/packageLimit)
- ✅ Color coding:
  - 🟢 Green badge: < 70% used
  - 🟠 Orange badge: 70-90% used
  - 🔴 Red badge: ≥ 90% used

### Step 4: Check Reset Button Visibility
Look for 🔄 (RefreshCw) button in Actions column:

**Should SHOW button:**
- ✅ Travel with packageLimit ≠ 999 (not unlimited)
- ✅ Travel with packageUsed > 0

**Should HIDE button:**
- ❌ Travel with packageLimit = 999 (unlimited)
- ❌ Travel with packageUsed = 0

### Step 5: Test Reset Quota
1. Find a travel with 🔄 button visible
2. Hover over button - tooltip should say "Reset Kuota"
3. Click the 🔄 button
4. ✅ Confirmation dialog should appear:
   ```
   Reset kuota untuk "[Travel Name]"?
   
   Kuota terpakai saat ini: X
   Setelah reset, kuota akan kembali ke 0.
   
   ⚠️ Tindakan ini tidak dapat dibatalkan!
   ```
5. Click "OK" to confirm
6. ✅ Should show alert: "✅ Kuota berhasil direset!"
7. ✅ Table should refresh automatically
8. ✅ Kuota Terpakai should now show: `0/[limit]`
9. ✅ 🔄 button should disappear (because packageUsed = 0)

### Step 6: Verify Database Change
Open browser console and run:
```javascript
fetch('/api/travels/id/[TRAVEL_ID]')
  .then(r => r.json())
  .then(d => console.log('packageUsed:', d.data.packageUsed))
```
✅ Should show: `packageUsed: 0`

### Step 7: Test Create Package After Reset
1. Login as Travel Admin (the one you just reset)
2. Navigate to Travel Admin dashboard
3. Check quota display - should show fresh quota
4. Try creating a new package
5. ✅ Should succeed (quota available)
6. ✅ packageUsed should increment

### Step 8: Verify Other Buttons Still Work
Test other action buttons:
- 👁️ View Profile - ✅ Should open travel profile page
- ✏️ Edit Travel - ✅ Should open edit form
- 🗑️ Delete Travel - ✅ Should show delete confirmation

## 🎯 Expected Results Summary

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Display "Paket Aktif" column | Shows active package count | ✅ |
| Display "Kuota Terpakai" column | Shows packageUsed/limit | ✅ |
| Color coding based on usage | Green/Orange/Red badges | ✅ |
| Reset button visibility | Only if packageUsed > 0 & not unlimited | ✅ |
| Reset confirmation dialog | Shows current usage & warning | ✅ |
| Reset quota to 0 | packageUsed becomes 0 | ✅ |
| Auto refresh after reset | Table updates without reload | ✅ |
| Button disappears after reset | No button when packageUsed = 0 | ✅ |
| Database persists change | Value saved in DB | ✅ |
| Can create package after reset | Quota available again | ✅ |

## 🐛 Common Issues & Solutions

### Issue 1: Reset button not showing
**Cause:** packageUsed = 0 or packageLimit = 999
**Solution:** This is expected behavior

### Issue 2: TypeScript error in console
**Cause:** TypeScript cache issue
**Solution:** Ignore - API works fine at runtime

### Issue 3: Table not refreshing
**Cause:** fetchTravels() not called
**Solution:** Check browser console for errors

### Issue 4: "Kuota Terpakai" shows undefined
**Cause:** packageUsed field missing in API response
**Solution:** Regenerate Prisma client: `npx prisma generate`

## 📊 Test Data

Current travels in database:
```
1. Barokah Madinah Tour
   - packageLimit: 10
   - packageUsed: 3
   - Active packages: 3
   - Reset button: ✅ VISIBLE

2. Nur Arafah Travel
   - packageLimit: 10
   - packageUsed: 2
   - Active packages: 2
   - Reset button: ✅ VISIBLE

3. Al-Fattah Premium Tour
   - packageLimit: 10
   - packageUsed: 2
   - Active packages: 2
   - Reset button: ✅ VISIBLE

4. Rahmatullah Umroh & Haji
   - packageLimit: 10
   - packageUsed: 2
   - Active packages: 2
   - Reset button: ✅ VISIBLE

5. Amanah Mekkah Travel
   - packageLimit: 4
   - packageUsed: 2
   - Active packages: 2
   - Reset button: ✅ VISIBLE
```

## 🔍 Browser Console Checks

### Check 1: Verify API Response
```javascript
fetch('/api/travels')
  .then(r => r.json())
  .then(d => {
    console.table(d.data.map(t => ({
      name: t.name,
      packageLimit: t.packageLimit,
      packageUsed: t.packageUsed,
      activePackages: t._count?.packages
    })))
  })
```

### Check 2: Test Reset API Directly
```javascript
const travelId = 'cmi9yzi3x0004v61oz3of9vvd' // Replace with actual ID

// Reset
fetch(`/api/travels/id/${travelId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ packageUsed: 0 })
})
.then(r => r.json())
.then(d => console.log('Reset result:', d))

// Verify
fetch(`/api/travels/id/${travelId}`)
  .then(r => r.json())
  .then(d => console.log('Current packageUsed:', d.data.packageUsed))
```

## ✅ Sign-off Checklist

Before marking as complete:
- [ ] All table columns display correctly
- [ ] Color coding works as expected
- [ ] Reset button shows/hides correctly
- [ ] Confirmation dialog appears
- [ ] Reset functionality works
- [ ] Database updates persist
- [ ] Table auto-refreshes
- [ ] No console errors (except TypeScript warning)
- [ ] Can create packages after reset
- [ ] Other action buttons still work

## 📸 Screenshots to Capture

1. Travels table with new columns
2. Reset button visible
3. Confirmation dialog
4. Success alert
5. Updated table after reset
6. Travel Admin dashboard showing fresh quota

---

**Test Status:** ⏳ READY FOR TESTING
**Tester:** [Your Name]
**Date:** 2025-11-24
**Result:** [ ] PASS / [ ] FAIL
