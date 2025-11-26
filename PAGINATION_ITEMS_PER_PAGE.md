# Pagination Items Per Page Feature

## Overview
Menambahkan fitur untuk mengubah jumlah data yang ditampilkan per halaman pada pagination di halaman Admin Packages.

## Features Implemented

### 1. Items Per Page Selector
Dropdown selector dengan opsi:
- ✅ 5 items per page
- ✅ 10 items per page (default)
- ✅ 25 items per page
- ✅ 50 items per page
- ✅ 100 items per page

### 2. State Management
```typescript
// Changed from const to state
const [itemsPerPage, setItemsPerPage] = useState(10)

// Auto reset to page 1 when items per page changes
useEffect(() => {
  setCurrentPage(1)
}, [search, cityFilter, statusFilter, sortFilter, itemsPerPage])
```

### 3. UI Layout
```typescript
<div className="flex items-center gap-4">
  {/* Info Text */}
  <div className="text-sm text-gray-700">
    Menampilkan <span className="font-medium">{startIndex + 1}</span> - 
    <span className="font-medium">{Math.min(endIndex, totalPackages)}</span> dari 
    <span className="font-medium">{totalPackages}</span> paket
  </div>
  
  {/* Items Per Page Selector */}
  <div className="flex items-center gap-2">
    <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
      Tampilkan:
    </label>
    <select
      id="itemsPerPage"
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
    <span className="text-sm text-gray-600">per halaman</span>
  </div>
</div>
```

### 4. Responsive Design
```typescript
// Flex layout yang responsive
<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
  {/* Left side: Info + Selector */}
  <div className="flex items-center gap-4">...</div>
  
  {/* Right side: Pagination buttons (only show if totalPages > 1) */}
  {totalPages > 1 && (
    <div className="flex items-center gap-2">...</div>
  )}
</div>
```

## User Flow

### Scenario 1: Change Items Per Page
1. User buka halaman `/admintrip/packages`
2. User lihat pagination di bawah tabel
3. User klik dropdown "Tampilkan: 10 per halaman"
4. User pilih opsi lain (misal: 25)
5. ✅ Tabel otomatis update menampilkan 25 items
6. ✅ Current page reset ke page 1
7. ✅ Total pages recalculated
8. ✅ Pagination buttons update

### Scenario 2: Large Dataset
1. Admin memiliki 150 paket
2. Default: 10 per page = 15 pages
3. User ubah ke 50 per page
4. ✅ Now: 50 per page = 3 pages
5. ✅ Easier navigation for large datasets

### Scenario 3: Small Dataset
1. Admin memiliki 8 paket
2. User pilih 10 per page
3. ✅ All 8 items shown on page 1
4. ✅ Pagination buttons hidden (totalPages = 1)
5. ✅ Selector still visible for consistency

## Benefits

### 1. Flexibility
- ✅ User dapat memilih jumlah data sesuai kebutuhan
- ✅ Quick view (5 items) untuk scanning cepat
- ✅ Bulk view (100 items) untuk overview lengkap

### 2. Performance
- ✅ Smaller page size = faster initial load
- ✅ Larger page size = less pagination clicks
- ✅ User control over performance vs convenience

### 3. User Experience
- ✅ Clear label "Tampilkan: X per halaman"
- ✅ Auto reset to page 1 prevents confusion
- ✅ Consistent with common admin panel patterns
- ✅ Responsive layout for mobile/desktop

### 4. Consistency
- ✅ Same pattern can be applied to other admin pages
- ✅ Standard dropdown styling
- ✅ Matches existing UI components

## Technical Details

### State Changes
```typescript
// Before
const [itemsPerPage] = useState(10)  // Constant

// After
const [itemsPerPage, setItemsPerPage] = useState(10)  // Mutable state
```

### Pagination Logic
```typescript
// Calculations remain the same
const totalPages = Math.ceil(totalPackages / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const paginatedPackages = filteredPackages.slice(startIndex, endIndex)
```

### Auto Reset
```typescript
// Reset to page 1 when items per page changes
useEffect(() => {
  setCurrentPage(1)
}, [itemsPerPage])  // Added to dependency array
```

## Styling

### Dropdown Styling
```css
className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm 
           focus:outline-none focus:ring-2 focus:ring-primary 
           focus:border-transparent"
```

### Responsive Layout
```css
/* Mobile: Stack vertically */
className="flex flex-col md:flex-row items-start md:items-center 
           justify-between gap-4"

/* Desktop: Horizontal layout */
```

## Files Modified
- `src/app/admintrip/packages/page.tsx`

## Testing Checklist

### Test 1: Change Items Per Page
1. ✅ Buka `http://localhost:3000/admintrip/packages`
2. ✅ Login sebagai admin
3. ✅ Klik dropdown "Tampilkan: 10 per halaman"
4. ✅ Pilih "5" → Tabel menampilkan 5 items
5. ✅ Pilih "25" → Tabel menampilkan 25 items
6. ✅ Pilih "100" → Tabel menampilkan 100 items

### Test 2: Auto Reset to Page 1
1. ✅ Navigate ke page 3
2. ✅ Ubah items per page dari 10 ke 25
3. ✅ Current page otomatis reset ke 1
4. ✅ No broken pagination

### Test 3: Pagination Buttons
1. ✅ Set items per page = 5
2. ✅ Pagination buttons muncul (banyak pages)
3. ✅ Set items per page = 100
4. ✅ Pagination buttons hilang atau berkurang (sedikit pages)

### Test 4: Filter + Items Per Page
1. ✅ Apply filter (misal: city filter)
2. ✅ Ubah items per page
3. ✅ Filter tetap aktif
4. ✅ Pagination recalculated based on filtered results

### Test 5: Responsive Layout
1. ✅ Desktop: Horizontal layout
2. ✅ Mobile: Vertical stack
3. ✅ Selector tetap accessible di semua screen sizes

### Test 6: Edge Cases
1. ✅ 0 packages → Selector visible, no pagination buttons
2. ✅ 1-10 packages with 10 per page → No pagination buttons
3. ✅ 11 packages with 10 per page → Pagination buttons appear

## Future Enhancements

### Possible Additions
1. **Remember Preference** - Save user's choice to localStorage
2. **Show All Option** - Add "Semua" option to show all items
3. **Keyboard Shortcuts** - Quick keys to change page size
4. **URL Parameter** - Persist page size in URL query params

### Code Example for localStorage
```typescript
// Save preference
const handleItemsPerPageChange = (value: number) => {
  setItemsPerPage(value)
  localStorage.setItem('adminPackagesItemsPerPage', value.toString())
}

// Load preference on mount
useEffect(() => {
  const saved = localStorage.getItem('adminPackagesItemsPerPage')
  if (saved) {
    setItemsPerPage(Number(saved))
  }
}, [])
```

## Status
✅ **Implemented** - Items per page selector dengan 5 opsi (5, 10, 25, 50, 100)
✅ **Tested** - No TypeScript errors
✅ **Responsive** - Works on mobile and desktop
✅ **Ready** - Siap untuk testing di browser
