# Travel Admin - Quick Fixes untuk Remaining Tasks

## 🎯 **Copy-Paste Ready Code**

Ini adalah code yang bisa langsung di-copy-paste untuk menyelesaikan remaining tasks.

---

## 1️⃣ **Update Travel Admin Layout (CRITICAL)**

**File:** `src/app/travel-admin/layout.tsx`

**Find this section** (navigation menu):
```typescript
// Look for navigation links
```

**Add these imports** at the top:
```typescript
import { Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
```

**Add this function** inside component:
```typescript
const router = useRouter()

const handleLogout = () => {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('travelAdminSession')
    localStorage.removeItem('isTravelAdminLoggedIn')
    router.push('/travel-admin/login')
  }
}
```

**Add these menu items** to navigation:
```typescript
{/* Settings Link */}
<Link 
  href="/travel-admin/settings"
  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
>
  <Settings className="w-5 h-5 text-gray-600" />
  <span className="font-medium">Pengaturan</span>
</Link>

{/* Logout Button */}
<button
  onClick={handleLogout}
  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors w-full text-left"
>
  <LogOut className="w-5 h-5" />
  <span className="font-medium">Keluar</span>
</button>
```

---

## 2️⃣ **Update Middleware (CRITICAL)**

**File:** `src/middleware.ts`

**Find this section:**
```typescript
// Look for admintrip protection code
if (pathname.startsWith('/admintrip') && pathname !== '/admintrip/login') {
  // ... existing code
}
```

**Add this code AFTER admintrip protection:**
```typescript
// Protect Travel Admin routes
if (pathname.startsWith('/travel-admin') && pathname !== '/travel-admin/login') {
  // Check if travel admin is logged in
  const travelSession = request.cookies.get('travelAdminSession')
  const isLoggedIn = request.cookies.get('isTravelAdminLoggedIn')
  
  // For now, check localStorage via client-side (middleware can't access localStorage)
  // So we'll rely on client-side protection in layout
  // This is a placeholder for future cookie-based session
}
```

**Note:** Middleware can't access localStorage. For now, add client-side protection in layout:

**In `src/app/travel-admin/layout.tsx`**, add this useEffect:
```typescript
useEffect(() => {
  const isLoggedIn = localStorage.getItem('isTravelAdminLoggedIn')
  const session = localStorage.getItem('travelAdminSession')
  
  if (!isLoggedIn || !session) {
    router.push('/travel-admin/login')
  }
}, [router])
```

---

## 3️⃣ **Fix Travel Admin Login Page (Minor Fix)**

**File:** `src/app/travel-admin/login/page.tsx`

**Find this line:**
```typescript
useState(() => {
```

**Replace with:**
```typescript
useEffect(() => {
```

**Reason:** `useState` doesn't accept a function for side effects. Should use `useEffect`.

---

## 4️⃣ **Test Commands**

```bash
# 1. Install dependencies (if not installed)
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# 2. Run migration script
node scripts/set-default-travel-password.js

# 3. Start server
npm run dev

# 4. Open browser
# http://localhost:3000/travel-admin/login
```

---

## 5️⃣ **Testing Checklist**

### Test 1: Login
- [ ] Open `/travel-admin/login`
- [ ] Enter username: `alfattahtour` (or any travel username)
- [ ] Enter password: `123456`
- [ ] Click Login
- [ ] Should redirect to `/travel-admin`

### Test 2: Settings
- [ ] Click "Pengaturan" in menu
- [ ] Should open `/travel-admin/settings`
- [ ] Fill change password form
- [ ] Should show success message

### Test 3: Logout
- [ ] Click "Keluar" button
- [ ] Should show confirmation
- [ ] Click OK
- [ ] Should redirect to `/travel-admin/login`
- [ ] Try accessing `/travel-admin` → Should redirect to login

### Test 4: Lupa Password
- [ ] In login page, click "Lupa Password"
- [ ] WhatsApp should open
- [ ] Message should be pre-filled

---

## 6️⃣ **Common Errors & Fixes**

### Error: "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs @types/bcryptjs
```

### Error: "localStorage is not defined"
This happens in server-side rendering. Wrap localStorage access in useEffect:
```typescript
useEffect(() => {
  const session = localStorage.getItem('travelAdminSession')
  // ... use session
}, [])
```

### Error: "useRouter is not defined"
Add import:
```typescript
import { useRouter } from 'next/navigation'
```

### Error: Migration script fails
```bash
# Regenerate Prisma client
npx prisma generate

# Check database
npx prisma studio
```

---

## 7️⃣ **Priority Order**

1. **HIGHEST:** Fix login page (useState → useEffect)
2. **HIGH:** Update layout (add Settings & Logout)
3. **MEDIUM:** Add client-side route protection
4. **LOW:** Update middleware (optional, client-side protection is enough for now)

---

## 8️⃣ **Verification**

After implementing all fixes, verify:

```bash
# 1. No TypeScript errors
npm run build

# 2. No runtime errors
# Check browser console

# 3. All features work
# Follow testing checklist above
```

---

## ✅ **Success Criteria**

System works when:
- ✅ Can login with username + password
- ✅ Can navigate to settings
- ✅ Can change password
- ✅ Can logout
- ✅ Cannot access protected routes without login
- ✅ "Lupa Password" opens WhatsApp

---

## 🚀 **Estimated Time**

- Reading this guide: 5 minutes
- Implementing fixes: 15 minutes
- Testing: 10 minutes
- **Total: ~30 minutes**

---

**Good luck! 🎉**
