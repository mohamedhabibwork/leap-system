# 🔄 Dev Server Restart Required!

## Why You're Still Getting 404

The `.env.local` file was created **AFTER** the Next.js dev server started.

**Environment variables in Next.js are only loaded when the server starts!**

---

## ✅ Solution: Restart Dev Server

### Option 1: Quick Restart (Recommended)

1. **In Terminal 17** (where `bun run dev` is running):
   - Press `Ctrl+C` to stop the servers
   - Wait 2 seconds
   - Run: `bun run dev`

### Option 2: Restart Just Frontend

If backend is fine:

```bash
# Stop frontend
lsof -ti:3001 | xargs kill -9

# Start frontend
cd apps/web
bun run dev
```

### Option 3: Complete Restart

```bash
# Stop all
killall node bun

# Start fresh from root
cd /Users/habib/WebstormProjects/leapv2-system
bun run dev
```

---

## ✅ Verify After Restart

1. **Open browser console** on http://localhost:3001/login
2. **Type:** `console.log(process.env.NEXT_PUBLIC_API_URL)`
3. **Should show:** `http://localhost:3000`
4. **Click** "Sign in with Keycloak OIDC"
5. **Should redirect to:** `http://localhost:3000/auth/keycloak/login` (backend!)

---

## 🔍 How to Tell It's Working

### Before Restart (Wrong ❌):
```
GET /auth/keycloak/login 404
# Hitting Next.js (frontend) server
```

### After Restart (Correct ✅):
```
Browser redirects to: http://localhost:3000/auth/keycloak/login
# Then redirects to: https://keycloak.habib.cloud/realms/leap-realm/...
```

---

## 📝 Environment Variables Created

The setup script created:

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000  ✅
NEXTAUTH_URL=http://localhost:3001         ✅
NEXTAUTH_SECRET=...                        ✅
```

**`apps/backend/.env`:**
```env
BACKEND_URL=http://localhost:3000          ✅
FRONTEND_URL=http://localhost:3001         ✅
KEYCLOAK_AUTH_SERVER_URL=...              ✅
```

---

## ⚠️ Important: Next.js Environment Variables

### Client-Side Variables (NEXT_PUBLIC_*)
- Must be prefixed with `NEXT_PUBLIC_`
- Are embedded at **build time** (production) or **startup time** (development)
- Require **restart** to pick up changes
- Are visible in browser

### Server-Side Variables
- Don't need `NEXT_PUBLIC_` prefix
- Can be changed without restart (in some cases)
- Are never sent to browser

---

## 🎯 What Happens After Restart

1. Next.js reads `.env.local` on startup
2. `NEXT_PUBLIC_API_URL` becomes available to client code
3. Keycloak button uses correct backend URL
4. Login flow works correctly

---

## 🚨 If Still Not Working After Restart

### 1. Verify Environment Variable

```bash
# Check file exists
cat apps/web/.env.local

# Should contain
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Hard Refresh Browser

- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or clear browser cache

### 3. Check Browser Console

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

If it shows `undefined`, the variable isn't loaded.

### 4. Nuclear Option

```bash
# Stop everything
killall node bun

# Clean Next.js cache
cd apps/web
rm -rf .next

# Restart
cd ../..
bun run dev
```

---

## ✅ Summary

**The fix is simple: Restart the dev server!**

```bash
# Press Ctrl+C in terminal
# Then run:
bun run dev
```

That's it! The environment variables are already configured correctly. 🎉
