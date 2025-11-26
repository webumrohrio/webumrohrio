# Image Blur Placeholder Implementation Guide

## Overview
Image blur placeholder telah diimplementasikan untuk memberikan better perceived performance saat images loading.

## Implementation

### What Was Added
Blur placeholder menggunakan base64 SVG untuk semua images di:
1. ✅ Package Card
2. ✅ Travel Card  
3. ✅ Article Card

### How It Works

#### Before (Without Blur)
```typescript
<Image
  src={image}
  alt="Package"
  fill
  className="object-cover"
/>
```

#### After (With Blur)
```typescript
<Image
  src={image}
  alt="Package"
  fill
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
/>
```

## Base64 SVG Placeholders

### Package Card Image (400x300)
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg==
```

### Travel Logo (80x80)
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+
```

### Article Image (600x400)
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
```

### Small Logo (20x20)
```
data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+
```

## Benefits

### 1. Better Perceived Performance
- User melihat placeholder blur saat image loading
- Terasa lebih cepat daripada blank space
- Professional loading experience

### 2. Smooth Transition
- Image fade in dari blur ke sharp
- No layout shift
- Better UX

### 3. Lightweight
- Base64 SVG sangat kecil (~100 bytes)
- No additional HTTP requests
- Instant placeholder

### 4. Consistent Experience
- Semua images punya loading state yang sama
- Uniform appearance
- Professional feel

## How to Generate Custom Blur Placeholder

### Method 1: Simple SVG (Recommended)
```typescript
// Create SVG with desired dimensions and color
const svg = `
  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#e2e8f0"/>
  </svg>
`

// Convert to base64
const base64 = Buffer.from(svg).toString('base64')
const blurDataURL = `data:image/svg+xml;base64,${base64}`
```

### Method 2: Gradient SVG
```typescript
const svg = `
  <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e2e8f0;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#cbd5e1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#grad)"/>
  </svg>
`
```

### Method 3: Using plaiceholder library (Advanced)
```bash
npm install plaiceholder
```

```typescript
import { getPlaiceholder } from 'plaiceholder'

const { base64 } = await getPlaiceholder('/path/to/image.jpg')
```

## Usage in Different Components

### Package Card
```typescript
<Image
  src={packageImage}
  alt={packageName}
  fill
  className="object-cover group-hover:scale-110 transition-transform duration-500"
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
/>
```

### Travel Logo
```typescript
<Image
  src={travelLogo}
  alt={travelName}
  width={80}
  height={80}
  className="object-cover rounded-xl"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
/>
```

### Article Image
```typescript
<Image
  src={articleImage}
  alt={articleTitle}
  fill
  className="object-cover group-hover:scale-110 transition-transform duration-500"
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=="
/>
```

## Best Practices

### 1. Match Aspect Ratio
Pastikan SVG placeholder punya aspect ratio yang sama dengan image:
```typescript
// Image 4:3 ratio
<svg width="400" height="300">  // 400/300 = 4:3 ✅
```

### 2. Use Appropriate Colors
- Light mode: `#e2e8f0` (gray-200)
- Dark mode: `#1e293b` (gray-800)
- Brand color: `#10b981` (primary)

### 3. Combine with Loading State
```typescript
{loading ? (
  <div className="animate-pulse bg-gray-200" />
) : (
  <Image
    src={image}
    placeholder="blur"
    blurDataURL={blurDataURL}
  />
)}
```

### 4. Optimize for Performance
```typescript
<Image
  src={image}
  placeholder="blur"
  blurDataURL={blurDataURL}
  loading="lazy"  // Lazy load images below fold
  priority={false}  // Only true for above-fold images
/>
```

## Components Updated

### ✅ Package Card (`src/components/package-card.tsx`)
- Main package image
- Travel logo

### ✅ Travel Card (`src/components/travel-card.tsx`)
- Travel logo

### ✅ Article Card (`src/components/article-card.tsx`)
- Article image

## Performance Impact

### Before
- Blank space while loading
- Layout shift possible
- Perceived as slow

### After
- Instant blur placeholder
- Smooth fade-in transition
- Perceived as fast
- Better UX

## Browser Compatibility

✅ All modern browsers support:
- Base64 data URLs
- SVG
- Next.js Image blur placeholder

## Testing

1. **Slow 3G Network**
   - Open DevTools > Network
   - Throttle to Slow 3G
   - Reload page
   - Verify blur placeholder appears

2. **Fast Network**
   - Normal network speed
   - Verify smooth transition
   - No flash of unstyled content

3. **Different Devices**
   - Mobile
   - Tablet
   - Desktop
   - Verify consistent behavior

## Troubleshooting

### Blur not showing
- Check `placeholder="blur"` is set
- Verify `blurDataURL` is valid base64
- Ensure Next.js Image component is used

### Image not loading
- Check image URL is valid
- Verify CORS if external image
- Check Next.js image domains config

### Blur too visible
- Reduce blur amount in CSS
- Use lighter placeholder color
- Adjust transition duration

## Next Steps

Consider implementing:
1. Dynamic blur based on actual image colors
2. Progressive image loading
3. WebP format with fallback
4. Responsive images with srcset

---

**Status**: ✅ Implemented
**Components**: Package Card, Travel Card, Article Card
**Performance**: Improved perceived loading speed
**UX**: Better loading experience
