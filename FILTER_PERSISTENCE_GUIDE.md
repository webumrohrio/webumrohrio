# Filter Persistence - Panduan Implementasi

## Deskripsi
Fitur yang mempertahankan state filter di halaman paket-umroh saat user navigasi ke detail paket dan kembali lagi. Filter akan tetap aktif seperti sebelumnya.

## Fitur Utama

### 1. Persistent Filter State
- ✅ Search query
- ✅ Range harga (min & max)
- ✅ Sort order (default, termurah, termahal, terpopuler)
- ✅ Bulan keberangkatan (Januari - Desember)
- ✅ Durasi paket (7-9 hari, 10-12 hari, 13-15 hari, 16+ hari)
- ✅ Scroll position

### 2. Storage & Expiry
- **Storage Type**: sessionStorage (hilang saat close tab/browser)
- **Auto-clear**: Setelah 30 menit tidak aktif
- **Storage Key**: `paket-umroh-filters`

### 3. User Experience Flow
```
1. User buka /paket-umroh
2. User set filter: 
   - Sort "Termurah"
   - Bulan "Desember"
   - Durasi "10-12 hari"
   - Range harga 0-61jt
3. User scroll ke bawah
4. User klik salah satu paket → masuk detail
5. User klik back/kembali
6. ✨ Filter masih aktif: Termurah, Desember, 10-12 hari, 0-61jt
7. ✨ Scroll position kembali ke posisi sebelumnya
8. ⏰ Setelah 30 menit idle → filter auto-clear
```

## Implementasi

### 1. Custom Hook (`src/hooks/useFilterPersistence.ts`)

```typescript
interface FilterState {
  search: string
  category: string
  city: string
  minPrice: string
  maxPrice: string
  sortBy: string
  scrollPosition?: number
}

export function useFilterPersistence() {
  const saveFilters = (filters: FilterState) => { ... }
  const loadFilters = (): FilterState | null => { ... }
  const clearFilters = () => { ... }
  const saveScrollPosition = (position: number) => { ... }
  
  return { saveFilters, loadFilters, clearFilters, saveScrollPosition }
}
```

### 2. Storage Structure

```json
{
  "filters": {
    "search": "umroh murah",
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

### 3. Integration di Paket-Umroh Page

```typescript
export default function PaketUmroh() {
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  const { saveFilters, loadFilters, clearFilters, saveScrollPosition } = useFilterPersistence()

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = loadFilters()
    if (savedFilters) {
      setSearch(savedFilters.search || '')
      setSortBy(savedFilters.sortBy || 'default')
      
      // Restore departureMonth and duration
      if (savedFilters.departureMonth) {
        setDepartureMonth(savedFilters.departureMonth)
      }
      if (savedFilters.duration) {
        setDuration(savedFilters.duration)
      }
      
      const minPrice = savedFilters.minPrice ? parseInt(savedFilters.minPrice) : 0
      const maxPrice = savedFilters.maxPrice ? parseInt(savedFilters.maxPrice) : 100000000
      setPriceRange([minPrice, maxPrice])
      
      if (savedFilters.scrollPosition !== undefined) {
        setTimeout(() => {
          window.scrollTo(0, savedFilters.scrollPosition || 0)
        }, 100)
      }
    }
    setFiltersLoaded(true)
  }, [loadFilters])

  // Save filters when they change
  useEffect(() => {
    if (!filtersLoaded) return
    
    const currentFilters = {
      search,
      category: 'all',
      city: 'all',
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      sortBy,
      departureMonth,
      duration
    }
    saveFilters(currentFilters)
  }, [search, priceRange, sortBy, departureMonth, duration, filtersLoaded, saveFilters])

  // Save scroll position (throttled)
  useEffect(() => {
    if (!filtersLoaded) return
    
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        saveScrollPosition(window.scrollY)
      }, 500)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [filtersLoaded, saveScrollPosition])

  const resetFilters = () => {
    // Reset all filters
    setSearch('')
    setSortBy('default')
    setPriceRange([0, 100000000])
    
    // Clear saved filters
    clearFilters()
    
    // Scroll to top
    window.scrollTo(0, 0)
  }
}
```

## Keamanan & Performance

### 1. Error Handling
- Try-catch untuk semua operasi sessionStorage
- Auto-clear jika data corrupt
- Fallback ke default state jika load gagal

### 2. Performance Optimization
- Throttling untuk scroll position save (500ms)
- Conditional save (hanya setelah initial load)
- Lazy loading filters

### 3. Memory Management
- Auto-clear expired data (30 minutes)
- Clean up event listeners
- Remove storage on reset

## Testing Manual

### Test Basic Persistence
1. Buka `/paket-umroh`
2. Set filter: Range harga 15jt-25jt, Sort "Termurah"
3. Scroll ke bawah
4. Klik salah satu paket
5. Klik back browser
6. ✅ Verify: Filter masih aktif, scroll position restored

### Test Auto-Clear
1. Set filter di `/paket-umroh`
2. Tunggu 30+ menit
3. Refresh halaman
4. ✅ Verify: Filter reset ke default

### Test Reset Button
1. Set beberapa filter
2. Klik tombol "Reset Filter"
3. ✅ Verify: Semua filter clear, scroll ke top, storage cleared

## Configuration

### Expiry Time
```typescript
const EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes
```

Ubah nilai ini untuk adjust auto-clear time:
- `15 * 60 * 1000` = 15 minutes
- `60 * 60 * 1000` = 1 hour

### Throttle Delay
```typescript
setTimeout(() => {
  saveScrollPosition(window.scrollY)
}, 500) // 500ms
```

## Browser Support

| Browser | sessionStorage | Status |
|---------|---------------|--------|
| Chrome 4+ | ✅ | Supported |
| Firefox 3.5+ | ✅ | Supported |
| Safari 4+ | ✅ | Supported |
| Edge 12+ | ✅ | Supported |

## Troubleshooting

### Filter tidak tersimpan
**Penyebab:**
- sessionStorage disabled di browser
- Storage quota exceeded

**Solusi:**
- Check browser console untuk errors
- Clear browser storage

### Scroll position tidak restore
**Penyebab:**
- Page belum fully loaded
- Content height berubah

**Solusi:**
- Increase timeout delay untuk scroll restore (currently 100ms)

## API Reference

### useFilterPersistence Hook
```typescript
const {
  saveFilters,      // (filters: FilterState) => void
  loadFilters,      // () => FilterState | null
  clearFilters,     // () => void
  saveScrollPosition // (position: number) => void
} = useFilterPersistence()
```

### FilterState Interface
```typescript
interface FilterState {
  search: string
  category: string
  city: string
  minPrice: string
  maxPrice: string
  sortBy: string
  scrollPosition?: number
}
```

## Changelog

### Version 1.0.0 (2024-11-22)
- ✅ Initial implementation
- ✅ sessionStorage persistence
- ✅ Auto-clear after 30 minutes
- ✅ Scroll position restore
- ✅ Throttled scroll saving
- ✅ Error handling
- ✅ Reset functionality
