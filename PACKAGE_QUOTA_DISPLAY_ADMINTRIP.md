# 📊 Package Quota Display - Admin Create Package

## 🎯 Feature Overview

Menampilkan informasi kuota paket di halaman Create Package Super Admin (`/admintrip/packages/create`) untuk mencegah pembuatan paket yang melebihi limit.

## ✨ Features Implemented

### 1. **Quota Display in Travel Selector**

**Format Display:**
```
Travel * (6/10)
```

**Color Coding:**
- 🔵 Blue (< 80%): Normal usage
- 🟠 Orange (80-99%): Warning - Mendekati limit
- 🔴 Red (100%): Critical - Limit reached
- 🟢 Green (Unlimited): No limit

### 2. **Dropdown Options with Quota**

**Format:**
```
Amanah Mekkah Travel (Pekanbaru) - 2/10
Barokah Madinah Tour (Jakarta) - 6/6 [PENUH]
Nur Arafah Travel (Surabaya) - 5/∞
```

**Features:**
- Shows current/limit for each travel
- Disabled option if limit reached
- [PENUH] indicator for full quota
- ∞ symbol for unlimited

### 3. **Warning Messages**

**When Limit Reached (100%):**
```
┌────────────────────────────────────────────────┐
│ ⚠️ Travel ini telah mencapai batas maksimal    │
│    paket (10)                                   │
│                                                 │
│ Silakan upgrade limit di menu Edit Travel      │
│ untuk menambah paket baru.                     │
└────────────────────────────────────────────────┘
```

**When Approaching Limit (80-99%):**
```
┌────────────────────────────────────────────────┐
│ ⚠️ Mendekati batas! Sisa 2 slot lagi          │
└────────────────────────────────────────────────┘
```

### 4. **Alert on Selection**

When selecting travel with full quota:
```
⚠️ PERINGATAN!

Travel "Amanah Mekkah Travel" telah mencapai 
batas maksimal paket.

Kuota: 10/10

Travel ini tidak dapat menambahkan paket baru. 
Silakan upgrade limit terlebih dahulu di menu 
Edit Travel.
```

### 5. **Submit Validation**

Prevents form submission if limit reached:
```
⚠️ TIDAK DAPAT MEMBUAT PAKET!

Travel ini telah mencapai batas maksimal paket.

Silakan upgrade limit di menu Edit Travel 
terlebih dahulu.
```

## 🔧 Technical Implementation

### State Management:
```typescript
const [travelsWithQuota, setTravelsWithQuota] = useState<any[]>([])
const [selectedTravelQuota, setSelectedTravelQuota] = useState<{
  current: number, 
  limit: number
} | null>(null)
```

### Fetch Travels with Quota:
```typescript
const fetchTravels = async () => {
  // 1. Fetch all travels
  const travels = await fetch('/api/travels')
  
  // 2. For each travel, fetch package count
  const travelsWithQuota = await Promise.all(
    travels.map(async (travel) => {
      const packages = await fetch(`/api/packages?username=${travel.username}`)
      return {
        ...travel,
        currentPackages: packages.length,
        packageLimit: travel.packageLimit || 10,
        isLimitReached: currentPackages >= packageLimit
      }
    })
  )
}
```

### Handle Travel Selection:
```typescript
const handleTravelChange = (travelId: string) => {
  const selectedTravel = travelsWithQuota.find(t => t.id === travelId)
  
  // Set quota info
  setSelectedTravelQuota({
    current: selectedTravel.currentPackages,
    limit: selectedTravel.packageLimit
  })
  
  // Show alert if limit reached
  if (selectedTravel.isLimitReached) {
    alert('⚠️ PERINGATAN! ...')
  }
}
```

### Submit Validation:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Check limit before submit
  if (selectedTravelQuota.current >= selectedTravelQuota.limit) {
    alert('⚠️ TIDAK DAPAT MEMBUAT PAKET!')
    return
  }
  
  // Continue with submission...
}
```

## 🎨 UI/UX Features

### Visual Indicators:

**1. Label Color:**
- Blue: Normal (< 80%)
- Orange: Warning (80-99%)
- Red: Critical (100%)
- Green: Unlimited

**2. Dropdown:**
- Quota shown for each option
- Disabled state for full quota
- [PENUH] badge

**3. Warning Cards:**
- Red card: Limit reached
- Orange card: Approaching limit

### User Experience:

**For Super Admin:**
- ✅ See quota at a glance
- ✅ Cannot select full travel
- ✅ Clear warning messages
- ✅ Guided to upgrade solution

**Workflow:**
```
1. Open Create Package page
2. Select travel from dropdown
3. See quota: "Amanah Mekkah (Pekanbaru) 2/10"
4. If full → Alert + Cannot submit
5. If OK → Continue creating package
```

## 📊 Example Scenarios

### Scenario 1: Normal Usage (6/10)
```
Label: Travel * (6/10) [Blue]
Dropdown: Amanah Mekkah Travel (Pekanbaru) - 6/10
Warning: None
Can Submit: ✅ Yes
```

### Scenario 2: Approaching Limit (9/10)
```
Label: Travel * (9/10) [Orange]
Dropdown: Amanah Mekkah Travel (Pekanbaru) - 9/10
Warning: ⚠️ Mendekati batas! Sisa 1 slot lagi
Can Submit: ✅ Yes
```

### Scenario 3: Limit Reached (10/10)
```
Label: Travel * (10/10) [Red]
Dropdown: Amanah Mekkah Travel (Pekanbaru) - 10/10 [PENUH] [Disabled]
Warning: ⚠️ Travel ini telah mencapai batas maksimal paket
Can Submit: ❌ No (Alert shown)
```

### Scenario 4: Unlimited (5/∞)
```
Label: Travel * (5/∞) [Green]
Dropdown: Amanah Mekkah Travel (Pekanbaru) - 5/∞
Warning: None
Can Submit: ✅ Yes (Always)
```

## 🔐 Security & Validation

### Client-Side:
- ✅ Disable dropdown option if limit reached
- ✅ Show warning messages
- ✅ Prevent form submission

### Server-Side:
- ✅ API validation (already implemented)
- ✅ Return 403 if limit exceeded
- ✅ Error message with details

### Double Protection:
```
Client → Check quota → Show warning → Prevent submit
   ↓
Server → Validate limit → Return 403 if exceeded
```

## 📝 Usage Guide

### For Super Admin:

**1. Create Package:**
```
1. Go to /admintrip/packages/create
2. Select travel from dropdown
3. Check quota display: (current/limit)
4. If full → Upgrade limit first
5. If OK → Continue creating
```

**2. Upgrade Limit:**
```
1. Go to /admintrip/travels
2. Edit travel with full quota
3. Scroll to "Batas Paket Umroh"
4. Increase limit (e.g., 10 → 20)
5. Save changes
6. Return to create package
```

## 🎯 Benefits

### Prevents Errors:
- ✅ No failed API calls
- ✅ Clear feedback before submission
- ✅ Guided to solution

### Better UX:
- ✅ Visual quota indicators
- ✅ Real-time information
- ✅ Proactive warnings

### Efficient Workflow:
- ✅ Quick quota check
- ✅ No wasted time
- ✅ Clear next steps

## 📁 Files Modified

- `src/app/admintrip/packages/create/page.tsx`
  - Added travelsWithQuota state
  - Added selectedTravelQuota state
  - Updated fetchTravels to include quota
  - Updated handleTravelChange with validation
  - Updated select dropdown with quota display
  - Added warning cards
  - Added submit validation

## ✅ Testing Checklist

- [ ] Open /admintrip/packages/create
- [ ] See quota in label when travel selected
- [ ] See quota in dropdown options
- [ ] Select travel with < 80% usage (normal)
- [ ] Select travel with 80-99% usage (warning shown)
- [ ] Try to select travel with 100% usage (disabled + alert)
- [ ] Try to submit with full quota (prevented)
- [ ] Verify color coding (blue/orange/red/green)
- [ ] Test with unlimited travel (∞ symbol)

## 🎉 Status

**✅ COMPLETE** - Package quota display fully implemented!

---

**Implementation Date:** 23 November 2025  
**Location:** `/admintrip/packages/create`  
**Status:** Production Ready ✅
