# 📝 Travel Admin Profile Page - Complete Implementation

## Overview

Halaman profile travel admin dengan tampilan yang sama seperti halaman detail travel publik, dengan fitur edit untuk semua field yang tersedia.

## URL

```
http://localhost:3000/travel-admin/profile
```

## Features

### 1. Display Mode (View)
- Tampilan mirip halaman detail travel publik
- Menampilkan semua informasi travel
- Logo dan cover image
- Informasi kontak lengkap
- Rating dan statistik
- Tombol "Edit Profile" di header

### 2. Edit Mode
- Form edit untuk semua field
- Upload logo baru
- Upload cover image baru
- Validasi input
- Save dan Cancel button
- Loading state saat menyimpan

### 3. Data yang Ditampilkan

**Basic Info:**
- Logo (editable)
- Cover Image (editable)
- Nama Travel (editable)
- Username (read-only)
- Description (editable)
- Verified badge (read-only)

**Contact Info:**
- Email (editable)
- Phone (editable)
- Address (editable)
- City (editable)
- Website (editable)

**Statistics (read-only):**
- Rating
- Total Reviews
- Total Jamaah
- Year Established (editable)
- Package Limit
- Package Used

**Status:**
- Is Verified (badge)
- Is Active (badge)
- Created At
- Last Login

## Implementation Plan

### Step 1: Create Profile Page Component
File: `src/app/travel-admin/profile/page.tsx`

Features:
- Fetch profile data from API
- Display mode with travel detail layout
- Edit mode with form inputs
- Image upload for logo and cover
- Save changes to API

### Step 2: Update API Route
File: `src/app/api/travel-admin/profile/route.ts`

Add PUT method for updating profile:
```typescript
export async function PUT(request: Request) {
  // Update travel profile
  // Validate data
  // Return updated profile
}
```

### Step 3: Add Image Upload Support
- Reuse existing `/api/upload/logo` endpoint
- Add `/api/upload/cover` endpoint for cover image
- Handle image preview before upload

## UI Layout

```
┌─────────────────────────────────────────┐
│  Header: Profile Travel    [Edit Button]│
├─────────────────────────────────────────┤
│  Cover Image (editable in edit mode)    │
│  ┌─────┐                                │
│  │Logo │  Travel Name                   │
│  │     │  ⭐ Rating • Verified Badge    │
│  └─────┘                                │
├─────────────────────────────────────────┤
│  📋 Tabs: Info | Contact | Stats        │
├─────────────────────────────────────────┤
│  Tab Content (editable in edit mode)    │
│  - Basic Information                    │
│  - Contact Details                      │
│  - Statistics & Status                  │
└─────────────────────────────────────────┘
```

## Files to Create/Modify

1. ✅ `src/app/travel-admin/profile/page.tsx` - Main profile page
2. ✅ `src/app/api/travel-admin/profile/route.ts` - Add PUT method
3. ✅ `src/app/api/upload/cover/route.ts` - Cover image upload (optional, can reuse logo endpoint)

## Testing Checklist

- [ ] Login sebagai travel admin
- [ ] Buka `/travel-admin/profile`
- [ ] Verify semua data ditampilkan
- [ ] Klik "Edit Profile"
- [ ] Edit beberapa field
- [ ] Upload logo baru
- [ ] Upload cover image baru
- [ ] Klik "Save"
- [ ] Verify data tersimpan
- [ ] Klik "Cancel" saat edit
- [ ] Verify data tidak berubah
- [ ] Check responsive di mobile
- [ ] Check responsive di tablet
- [ ] Check responsive di desktop

## Next Steps

Saya akan membuat implementasi lengkap dengan:
1. Profile page component dengan tampilan mirip travel detail
2. Edit mode dengan form lengkap
3. Image upload functionality
4. API route untuk update profile
5. Validation dan error handling

Apakah Anda ingin saya lanjutkan dengan implementasi lengkap?
