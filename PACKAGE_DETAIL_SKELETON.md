# Package Detail Loading Skeleton

## Overview
Loading skeleton untuk halaman detail paket umroh yang memberikan visual feedback saat data sedang dimuat.

## Implementasi

### Komponen
- **File**: `src/components/package-detail-skeleton.tsx`
- **Digunakan di**: `src/app/[username]/paket/[slug]/page.tsx`

### Fitur Skeleton

1. **Hero Image Skeleton**
   - Placeholder untuk gambar utama paket
   - Ukuran responsif (h-64 mobile, h-96 desktop)

2. **Package Info Skeleton**
   - Judul paket
   - Informasi travel (logo + nama)
   - Stats (durasi, keberangkatan, quota)

3. **Description Skeleton**
   - Placeholder untuk deskripsi paket
   - 3 baris teks dengan lebar bervariasi

4. **Itinerary Skeleton**
   - 4 item itinerary dengan icon dan deskripsi
   - Format day-by-day

5. **Facilities Skeleton**
   - Grid 2-3 kolom
   - 6 item fasilitas dengan icon

6. **Sidebar Skeleton**
   - Price card dengan harga dan detail
   - Tombol booking
   - Travel info card

### Animasi
- Menggunakan `animate-pulse` dari Tailwind
- Smooth transition saat loading ke konten

### Responsive Design
- Mobile: Single column layout
- Desktop: 2 kolom (content + sidebar)
- Sidebar sticky di desktop

## Cara Kerja

```typescript
// Di halaman detail paket
if (loading) {
  return (
    <MobileLayout hideBottomNav>
      <PackageDetailSkeleton />
    </MobileLayout>
  )
}
```

## Benefits

✅ **Better UX**: User melihat struktur konten saat loading
✅ **Professional**: Terlihat lebih modern dan polished
✅ **Reduced Perceived Wait Time**: Loading terasa lebih cepat
✅ **Clear Feedback**: User tahu bahwa data sedang dimuat

## Testing

1. Buka halaman detail paket
2. Perhatikan skeleton muncul saat loading
3. Skeleton akan hilang dan diganti konten asli setelah data dimuat
4. Test di berbagai ukuran layar (mobile, tablet, desktop)

---

**Created**: November 22, 2025
**Last Updated**: November 22, 2025
