# Travel Admin Account Management System

## Overview
Sistem manajemen akun untuk Travel Admin yang memungkinkan Super Admin membuat akun travel, dan Travel Admin dapat login serta mengelola data mereka sendiri.

## Implementation Status

### ✅ Phase 1: Backend APIs
- [x] Travel Admin Login API (`/api/travel-admin/login`)
- [x] Travel Admin Change Password API (`/api/travel-admin/change-password`)
- [x] Migration script untuk set default password

### 🔄 Phase 2: Super Admin Features (IN PROGRESS)
- [ ] Update Create Travel page - add username, email, password fields
- [ ] Update Edit Travel page - add password reset option
- [ ] Update Travels API to handle password hashing

### 🔄 Phase 3: Travel Admin Features (IN PROGRESS)
- [x] Update Login page - username + "Lupa Password" button
- [ ] Create Settings page - change password form
- [ ] Create Profile Edit page - edit travel data
- [ ] Update Travel Admin layout - add settings menu

### 🔄 Phase 4: Security & Middleware (PENDING)
- [ ] Update middleware to protect `/travel-admin/*` routes
- [ ] Session management
- [ ] Logout functionality

---

## Database Schema

### Travel Model (Already exists in Prisma)
```prisma
model Travel {
  id               String   @id @default(cuid())
  username         String   @unique      // For login
  email            String?  @unique      // For contact
  password         String?               // Hashed password
  name             String                // Travel name
  // ... other fields
  lastLogin        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## API Endpoints

### 1. Travel Admin Login
**Endpoint:** `POST /api/travel-admin/login`

**Request Body:**
```json
{
  "username": "alfattahtour",
  "password": "123456"
}
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "alfattahtour",
    "email": "info@alfattah.com",
    "name": "Al Fattah Tour",
    "logo": "...",
    // ... other fields (without password)
  },
  "message": "Login berhasil"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Username atau password salah"
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Missing fields
- `401` - Invalid credentials
- `403` - Account inactive or no password set
- `500` - Server error

---

### 2. Travel Admin Change Password
**Endpoint:** `POST /api/travel-admin/change-password`

**Request Body:**
```json
{
  "travelId": "clxxx...",
  "currentPassword": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Password lama salah"
}
```

**Validation:**
- Current password must match
- New password minimum 6 characters
- All fields required

---

## Migration Script

### Set Default Password for Existing Travels

**File:** `scripts/set-default-travel-password.js`

**Usage:**
```bash
node scripts/set-default-travel-password.js
```

**What it does:**
1. Finds all travels without password (null or empty)
2. Sets default password: `123456`
3. Hashes password with bcrypt (10 rounds)
4. Updates database

**Output:**
```
🔄 Setting default password for existing travels...
📊 Found 5 travels without password
✅ Set password for: Al Fattah Tour (alfattahtour)
✅ Set password for: Dianta Tour (diantatour)
...
✅ All travels now have default password: 123456
⚠️  Please ask travel admins to change their password after first login!
```

---

## User Flows

### Flow 1: Super Admin Creates Travel Account

1. Super Admin login ke `/admintrip/login`
2. Navigate ke `/admintrip/travels`
3. Click "Tambah Travel"
4. Fill form:
   - Username (required, unique, lowercase)
   - Email (optional, unique)
   - Password (required, min 6 chars)
   - Nama Travel (required)
   - Other data (logo, phone, address, etc.)
5. Click "Simpan"
6. ✅ Travel account created
7. Super Admin informs Travel Admin:
   - Username: `alfattahtour`
   - Password: `password123`
   - Login URL: `https://tripbaitullah.com/travel-admin/login`

---

### Flow 2: Travel Admin First Login

1. Travel Admin buka `/travel-admin/login`
2. Enter username & password (dari Super Admin)
3. Click "Login"
4. ✅ Redirect to `/travel-admin` dashboard
5. Navigate to `/travel-admin/settings`
6. Change password:
   - Current password: `password123`
   - New password: `mySecurePassword`
7. ✅ Password changed
8. Next login use new password

---

### Flow 3: Travel Admin Forgot Password

1. Travel Admin buka `/travel-admin/login`
2. Enter username (if known)
3. Click "Lupa Password? Hubungi Admin"
4. ✅ WhatsApp opens with pre-filled message:
```
Halo Admin Tripbaitullah,

Saya lupa password akun Travel Admin saya.

Username: alfattahtour

Mohon bantuan untuk reset password.

Terima kasih.
```
5. Send message to admin
6. Super Admin resets password via `/admintrip/travels/edit/[id]`
7. Super Admin informs new password
8. Travel Admin login with new password

---

### Flow 4: Travel Admin Edit Profile

1. Travel Admin login
2. Navigate to `/travel-admin/profile/edit`
3. Edit data:
   - Nama Travel
   - Logo
   - Phone
   - Address
   - Description
   - etc.
4. Click "Simpan"
5. ✅ Profile updated

---

## Security Features

### 1. Password Hashing
```typescript
import bcrypt from 'bcryptjs'

// Hash password (on create/update)
const hashedPassword = await bcrypt.hash(password, 10)

// Verify password (on login)
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### 2. Session Management
```typescript
// Save session (after login)
localStorage.setItem('travelAdminSession', JSON.stringify(travelData))
localStorage.setItem('isTravelAdminLoggedIn', 'true')

// Check session (in middleware)
const session = localStorage.getItem('travelAdminSession')
const isLoggedIn = localStorage.getItem('isTravelAdminLoggedIn') === 'true'

// Clear session (on logout)
localStorage.removeItem('travelAdminSession')
localStorage.removeItem('isTravelAdminLoggedIn')
```

### 3. Route Protection (Middleware)
```typescript
// Protect /travel-admin/* routes (except /travel-admin/login)
if (pathname.startsWith('/travel-admin') && pathname !== '/travel-admin/login') {
  const isLoggedIn = request.cookies.get('travelAdminSession')
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/travel-admin/login', request.url))
  }
}
```

### 4. Account Status Check
- `isActive: false` → Cannot login
- `password: null` → Cannot login (must be set by Super Admin)

---

## UI Components

### 1. Login Page (`/travel-admin/login`)
**Features:**
- Username input
- Password input (with show/hide toggle)
- "Lupa Password?" button → WhatsApp admin
- Error messages
- Loading state
- Info box with default password

**Design:**
- Green theme (travel/umroh branding)
- Plane icon
- Responsive card layout
- WhatsApp icon on forgot password button

---

### 2. Settings Page (`/travel-admin/settings`)
**Features:**
- Change Password form:
  - Current password input
  - New password input
  - Confirm new password input
  - Submit button
- Success/error notifications
- Password strength indicator (optional)

**Validation:**
- Current password must be correct
- New password min 6 characters
- Confirm password must match

---

### 3. Profile Edit Page (`/travel-admin/profile/edit`)
**Features:**
- Edit travel data:
  - Nama Travel
  - Logo upload
  - Cover image upload
  - Phone number
  - Email
  - Address
  - City
  - Website
  - Description
  - Facilities (JSON)
  - Services (JSON)
  - Gallery (JSON)
- Save button
- Cancel button
- Success/error notifications

**Note:** Username cannot be changed (unique identifier)

---

## Testing Checklist

### Backend APIs
- [ ] Login with valid credentials → Success
- [ ] Login with invalid username → Error
- [ ] Login with invalid password → Error
- [ ] Login with inactive account → Error
- [ ] Login with no password set → Error
- [ ] Change password with correct current password → Success
- [ ] Change password with wrong current password → Error
- [ ] Change password with short new password → Error

### Migration Script
- [ ] Run script on database with travels without password
- [ ] Verify all travels now have hashed password
- [ ] Test login with default password `123456`

### UI Flows
- [ ] Travel Admin can login with username + password
- [ ] Travel Admin redirected to dashboard after login
- [ ] "Lupa Password" button opens WhatsApp with correct message
- [ ] Travel Admin can change password in settings
- [ ] Travel Admin can edit profile data
- [ ] Travel Admin can logout

### Security
- [ ] Password is hashed in database (not plain text)
- [ ] Password is not returned in API responses
- [ ] Protected routes redirect to login if not authenticated
- [ ] Session persists across page refreshes
- [ ] Logout clears session properly

---

## Next Steps (TODO)

### Immediate (Phase 2 & 3)
1. ✅ Update `/admintrip/travels/create` - add username, email, password fields
2. ✅ Update `/admintrip/travels/edit/[id]` - add password reset
3. ✅ Update `/api/travels` - handle password hashing
4. ✅ Create `/travel-admin/settings` - change password page
5. ✅ Create `/travel-admin/profile/edit` - edit profile page
6. ✅ Update `/travel-admin/layout` - add settings & logout menu

### Later (Phase 4)
7. ✅ Update `middleware.ts` - protect travel-admin routes
8. ✅ Add logout functionality
9. ✅ Add session expiry (optional)
10. ✅ Add "Remember me" feature (optional)

### Future Enhancements
- Email notifications (account created, password changed)
- Two-factor authentication (2FA)
- Password reset via email (instead of WhatsApp)
- Activity log (login history, changes made)
- Role-based permissions (owner, staff, etc.)

---

## Configuration

### Admin WhatsApp Number
Stored in Settings table:
```sql
INSERT INTO Settings (key, value) VALUES ('adminWhatsapp', '6281234567890');
```

Fetched in login page:
```typescript
const response = await fetch('/api/settings?key=adminWhatsapp')
const result = await response.json()
const adminWhatsapp = result.data.value
```

---

## Troubleshooting

### Issue: Cannot login with default password
**Solution:** Run migration script to set default password
```bash
node scripts/set-default-travel-password.js
```

### Issue: "Password belum diset" error
**Solution:** Super Admin must set password in edit travel page

### Issue: "Akun tidak aktif" error
**Solution:** Super Admin must activate account in edit travel page

### Issue: WhatsApp button not working
**Solution:** Check if adminWhatsapp is set in Settings table

### Issue: Session lost after page refresh
**Solution:** Check localStorage implementation and middleware

---

## Status
🔄 **IN PROGRESS** - Phase 1 completed, Phase 2-4 in progress
📅 **Last Updated:** 2025-01-23
👤 **Developer:** Kiro AI Assistant
