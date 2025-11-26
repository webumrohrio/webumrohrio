# Auto-scroll Card Fix - React Hooks Error

## Issue
React Hooks error terjadi karena `useRef` dipanggil di dalam `.map()` loop:
```
Error: React has detected a change in the order of Hooks called by DetailPaketUmrohSlug
19. undefined -> useRef
```

## Root Cause
```typescript
// ❌ WRONG - useRef inside map loop
{packageDetail.priceOptions.map((option, index) => {
  const cardRef = useRef<HTMLDivElement>(null) // Violates Rules of Hooks
  return <div ref={cardRef}>...</div>
})}
```

## Solution
Menggunakan **array refs** di top level component:

```typescript
// ✅ CORRECT - useRef at top level (before any conditions/returns)
export default function DetailPaketUmrohSlug() {
  const params = useParams()
  const router = useRouter()
  
  // All hooks must be at the top level
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  // ... other useState hooks
  
  // Array refs for price option cards (auto-scroll feature)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // ... rest of component
}

// Inside map
{packageDetail.priceOptions.map((option, index) => (
  <div
    ref={(el) => { cardRefs.current[index] = el }}
    onClick={() => {
      setSelectedPrice(option)
      setTimeout(() => {
        cardRefs.current[index]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        })
      }, 100)
    }}
  >
    ...
  </div>
))}
```

## Rules of Hooks
1. ✅ Hooks harus dipanggil di **top level** component
2. ✅ Hooks harus dipanggil dalam **urutan yang sama** setiap render
3. ❌ Jangan panggil hooks di dalam loops, conditions, atau nested functions
4. ❌ Jangan panggil hooks setelah early return
5. ✅ Gunakan array refs untuk multiple elements dalam loop

## Common Pitfalls
- ❌ Hooks dipanggil setelah conditional return (`if (loading) return ...`)
- ❌ Hooks dipanggil di dalam IIFE `{(() => { useRef() })()}`
- ❌ Hooks dipanggil di dalam `.map()` atau loop lainnya
- ❌ Browser cache menyimpan kode lama setelah fix

## Fix Steps
1. ✅ Pindahkan semua hooks ke top level component
2. ✅ Pastikan hooks dipanggil sebelum any conditions/returns
3. ✅ Gunakan array refs dengan callback: `ref={(el) => { refs.current[i] = el }}`
4. ✅ Restart dev server untuk clear cache
5. ✅ Hard refresh browser (Ctrl+Shift+R)

## Files Modified
- `src/app/[username]/paket/[slug]/page.tsx`

## Testing
1. Restart server: `npm run dev`
2. Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)
3. Buka `http://localhost:3000/alfattahtour/paket/umroh-vip-royal`
4. Klik card harga yang berbeda
5. ✅ Card otomatis scroll ke center tanpa error
6. ✅ No React Hooks warning di console

## Status
✅ **Fixed** - Auto-scroll berfungsi dengan benar tanpa melanggar Rules of Hooks
✅ **Server Restarted** - Cache cleared
✅ **Code Verified** - No TypeScript errors
