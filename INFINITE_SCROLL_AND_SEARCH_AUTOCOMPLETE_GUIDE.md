# Infinite Scroll & Search Autocomplete Implementation Guide

## Overview
Implementasi Infinite Scroll dan Search Autocomplete untuk better browsing experience dan search UX.

---

## 1. Infinite Scroll ♾️

### What Was Implemented
Infinite scroll menggunakan Intersection Observer API untuk load more content otomatis saat user scroll ke bawah.

### Hook: `src/hooks/useInfiniteScroll.ts`

#### Features:
- ✅ Intersection Observer API
- ✅ Automatic load more
- ✅ Configurable threshold (200px default)
- ✅ Loading state management
- ✅ Has more detection
- ✅ Performance optimized
- ✅ Memory leak prevention

#### Usage:
```typescript
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

const { loadMoreRef } = useInfiniteScroll({
  onLoadMore: handleLoadMore,
  hasMore: hasMore,
  isLoading: loadingMore,
  threshold: 200 // pixels before bottom
})

// In JSX
<div ref={loadMoreRef} />
```

#### Implementation Example:
```typescript
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)
const [loadingMore, setLoadingMore] = useState(false)
const itemsPerPage = 12

const handleLoadMore = async () => {
  if (loadingMore || !hasMore) return
  
  setLoadingMore(true)
  try {
    const nextPage = page + 1
    const response = await fetch(`/api/packages?page=${nextPage}&limit=${itemsPerPage}`)
    const result = await response.json()
    
    if (result.success) {
      setPackages(prev => [...prev, ...result.data])
      setPage(nextPage)
      setHasMore(result.data.length === itemsPerPage)
    }
  } catch (error) {
    console.error('Failed to load more:', error)
    toast.error('Gagal memuat data')
  } finally {
    setLoadingMore(false)
  }
}

const { loadMoreRef } = useInfiniteScroll({
  onLoadMore: handleLoadMore,
  hasMore,
  isLoading: loadingMore
})
```

### How It Works:

1. **Observer Setup**: Creates IntersectionObserver with threshold
2. **Element Watch**: Observes a trigger element at bottom
3. **Intersection**: When element enters viewport
4. **Load More**: Calls onLoadMore callback
5. **Append Data**: New data appended to existing list
6. **Update State**: Updates page and hasMore
7. **Cleanup**: Removes observer on unmount

### Visual Flow:

```
┌─────────────────┐
│   Content       │
│   Content       │
│   Content       │
├─────────────────┤
│  [Load More]    │ ← Trigger element (invisible)
└─────────────────┘
      ↓ Scroll
┌─────────────────┐
│   Content       │
│   Content       │
│   Content       │
│   Loading...    │ ← Shows loading
│   New Content   │ ← Appends
│   New Content   │
├─────────────────┤
│  [Load More]    │ ← Moves down
└─────────────────┘
```

### API Requirements:

Backend API should support pagination:
```typescript
GET /api/packages?page=1&limit=12

Response:
{
  success: true,
  data: Package[],
  pagination: {
    page: 1,
    limit: 12,
    total: 100,
    hasMore: true
  }
}
```

### Performance Considerations:

1. **Threshold**: 200px before bottom (adjustable)
2. **Debouncing**: Prevents multiple simultaneous loads
3. **Memory**: Old items stay in memory (consider virtualization for 1000+ items)
4. **Network**: Loads only when needed
5. **Cleanup**: Proper observer cleanup

---

## 2. Search Autocomplete 🔍

### What Was Implemented
Smart search dengan autocomplete, recent searches, dan popular searches.

### Component: `src/components/search-autocomplete.tsx`

#### Features:
- ✅ Real-time suggestions
- ✅ Recent searches (localStorage)
- ✅ Popular searches
- ✅ Click outside to close
- ✅ Keyboard navigation (Enter, Escape)
- ✅ Clear search button
- ✅ Remove individual recent search
- ✅ Clear all recent searches
- ✅ Smooth animations
- ✅ Mobile responsive

#### Usage:
```typescript
import { SearchAutocomplete } from '@/components/search-autocomplete'

<SearchAutocomplete
  onSearch={(query) => {
    setSearch(query)
    // Perform search
  }}
  placeholder="Cari paket atau travel..."
  className="w-full"
/>
```

#### Props:
```typescript
interface SearchAutocompleteProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}
```

### Features Breakdown:

#### 1. Recent Searches
- Stored in localStorage
- Max 10 recent searches
- Newest first
- Individual remove button
- Clear all option

```typescript
// Save recent search
const saveRecentSearch = (searchText: string) => {
  const updated = [
    searchText,
    ...recentSearches.filter(s => s !== searchText)
  ].slice(0, 10)
  
  setRecentSearches(updated)
  localStorage.setItem('recentSearches', JSON.stringify(updated))
}
```

#### 2. Popular Searches
- Predefined list
- Shows search count
- Trending icon
- Filtered by query

```typescript
const popularSearches = [
  { id: '1', text: 'Umroh Murah', type: 'popular', count: 245 },
  { id: '2', text: 'Paket Ramadhan', type: 'popular', count: 189 },
  // ...
]
```

#### 3. Smart Suggestions
- Empty query: Shows recent + popular
- With query: Filters popular searches
- No results: Shows helpful message

```typescript
useEffect(() => {
  if (query.trim() === '') {
    // Show recent and popular
    setSuggestions([...recent, ...popular])
  } else {
    // Filter based on query
    const filtered = popular.filter(s =>
      s.text.toLowerCase().includes(query.toLowerCase())
    )
    setSuggestions(filtered)
  }
}, [query])
```

### Visual Design:

```
┌─────────────────────────────┐
│  🔍 Cari paket...      ✕   │ ← Input
└─────────────────────────────┘
┌─────────────────────────────┐
│ Pencarian Terakhir  Hapus   │
├─────────────────────────────┤
│ 🕐 Umroh Murah          ✕   │
│ 🕐 Paket Ramadhan       ✕   │
├─────────────────────────────┤
│ Pencarian Populer           │
├─────────────────────────────┤
│ 📈 Umroh Murah    245       │
│ 📈 Paket Ramadhan 189       │
│ 📈 Umroh Plus     156       │
└─────────────────────────────┘
```

### Keyboard Shortcuts:

- **Enter**: Execute search
- **Escape**: Close dropdown
- **Click Outside**: Close dropdown

### Mobile Optimization:

- Touch-friendly targets (44px min)
- Smooth animations
- Responsive dropdown
- Auto-focus on mobile
- Prevents zoom on iOS

---

## Implementation in Pages

### Paket Umroh Page

#### Infinite Scroll:
```typescript
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)
const [loadingMore, setLoadingMore] = useState(false)

const handleLoadMore = async () => {
  // Load more logic
}

const { loadMoreRef } = useInfiniteScroll({
  onLoadMore: handleLoadMore,
  hasMore,
  isLoading: loadingMore
})

// In JSX
{filteredPackages.map(pkg => <PackageCard key={pkg.id} {...pkg} />)}

{loadingMore && (
  <div className="col-span-full flex justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
)}

{hasMore && <div ref={loadMoreRef} className="h-20" />}

{!hasMore && filteredPackages.length > 0 && (
  <div className="col-span-full text-center py-8 text-muted-foreground">
    <p>Semua paket telah ditampilkan</p>
  </div>
)}
```

#### Search Autocomplete:
```typescript
<SearchAutocomplete
  onSearch={(query) => {
    setSearch(query)
    toast.info(`Mencari: ${query}`)
  }}
  placeholder="Cari paket umroh..."
/>
```

---

## User Experience Flow

### Infinite Scroll Flow:
1. User scrolls down page
2. Reaches 200px before bottom
3. Loading indicator appears
4. New content loads
5. Content appends smoothly
6. User continues scrolling
7. Repeat until no more data

### Search Autocomplete Flow:
1. User clicks search input
2. Dropdown opens with recent/popular
3. User types query
4. Suggestions filter in real-time
5. User clicks suggestion or presses Enter
6. Search executes
7. Recent search saved
8. Dropdown closes

---

## Best Practices

### Infinite Scroll:
1. ✅ Show loading indicator
2. ✅ Handle errors gracefully
3. ✅ Provide "End of results" message
4. ✅ Keep threshold reasonable (200-300px)
5. ✅ Debounce load more calls
6. ✅ Consider virtualization for 1000+ items
7. ✅ Provide "Back to top" button

### Search Autocomplete:
1. ✅ Save recent searches
2. ✅ Limit recent searches (10 max)
3. ✅ Show popular searches
4. ✅ Filter suggestions intelligently
5. ✅ Handle empty states
6. ✅ Provide clear button
7. ✅ Support keyboard navigation

---

## Performance Optimization

### Infinite Scroll:
```typescript
// Debounce load more
const debouncedLoadMore = useCallback(
  debounce(() => {
    if (!loadingMore && hasMore) {
      handleLoadMore()
    }
  }, 300),
  [loadingMore, hasMore]
)

// Memoize filtered packages
const filteredPackages = useMemo(() => {
  return packages.filter(/* filter logic */)
}, [packages, filters])
```

### Search Autocomplete:
```typescript
// Debounce search
const debouncedSearch = useCallback(
  debounce((query: string) => {
    performSearch(query)
  }, 300),
  []
)

// Memoize suggestions
const suggestions = useMemo(() => {
  return filterSuggestions(query, recentSearches, popularSearches)
}, [query, recentSearches, popularSearches])
```

---

## Testing

### Infinite Scroll:
1. **Scroll to Bottom**:
   - Verify loading indicator appears
   - Check new content loads
   - Verify smooth append

2. **No More Data**:
   - Scroll to end
   - Verify "End of results" message
   - Check no more API calls

3. **Error Handling**:
   - Simulate API error
   - Verify error toast
   - Check retry mechanism

### Search Autocomplete:
1. **Recent Searches**:
   - Perform search
   - Verify saved to localStorage
   - Check appears in dropdown

2. **Popular Searches**:
   - Open dropdown
   - Verify popular searches show
   - Check click works

3. **Filtering**:
   - Type query
   - Verify suggestions filter
   - Check case-insensitive

4. **Keyboard**:
   - Press Enter
   - Press Escape
   - Verify behavior

---

## Browser Compatibility

### Infinite Scroll:
- ✅ Chrome/Edge (IntersectionObserver)
- ✅ Firefox (IntersectionObserver)
- ✅ Safari (IntersectionObserver)
- ✅ Mobile browsers

### Search Autocomplete:
- ✅ All modern browsers
- ✅ localStorage support
- ✅ Touch events (mobile)
- ✅ Keyboard events

---

## Future Enhancements

### Infinite Scroll:
- [ ] Virtual scrolling for 1000+ items
- [ ] Bi-directional scroll (load previous)
- [ ] Scroll position restoration
- [ ] Prefetch next page

### Search Autocomplete:
- [ ] Server-side suggestions
- [ ] Search history sync (if logged in)
- [ ] Voice search
- [ ] Search analytics
- [ ] Typo correction
- [ ] Category-based suggestions

---

## Troubleshooting

### Infinite Scroll:
**Not loading more:**
- Check hasMore state
- Verify API returns data
- Check threshold value
- Verify observer attached

**Loading too early:**
- Increase threshold
- Check scroll container
- Verify calculations

### Search Autocomplete:
**Dropdown not showing:**
- Check isOpen state
- Verify suggestions array
- Check z-index
- Verify positioning

**Recent searches not saving:**
- Check localStorage
- Verify JSON serialization
- Check browser privacy mode

---

## Summary

### ✅ Implemented:
1. **Infinite Scroll**
   - IntersectionObserver hook
   - Automatic load more
   - Loading states
   - End of results

2. **Search Autocomplete**
   - Recent searches
   - Popular searches
   - Real-time filtering
   - Keyboard support

### 📍 Components Created:
- ✅ `src/hooks/useInfiniteScroll.ts`
- ✅ `src/components/search-autocomplete.tsx`

### 🎯 Benefits:
- Seamless browsing
- Better search UX
- Reduced pagination clicks
- Faster content discovery
- Professional feel

---

**Status**: ✅ Implemented and Ready to Use
**Hook**: useInfiniteScroll
**Component**: SearchAutocomplete
**UX Impact**: Significant improvement in browsing and search experience
