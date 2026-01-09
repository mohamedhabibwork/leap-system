# Quick Fix Guide - Common Errors

## Error: "Proto file not found" (FIXED ✅)

**Terminal shows:**
```
ENOENT: no such file or directory, open '.../dist/grpc/proto/users.proto'
```

**Cause:** Proto files not copied to dist folder during build

**Solution:**
```bash
cd apps/backend
# Manual fix (temporary)
mkdir -p dist/grpc/proto
cp src/grpc/proto/*.proto dist/grpc/proto/

# Permanent fix (done)
# postbuild script now copies files automatically
bun run build
```

**Status:** ✅ Fixed - `postbuild` script added to package.json

---

## Error: "404 on /auth/keycloak/login"

**Browser shows:**
```
GET /auth/keycloak/login 404
```

**Cause:** Frontend `NEXT_PUBLIC_API_URL` not configured

**Solution:**

1. **Create frontend `.env.local` file:**
   ```bash
   cd apps/web
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-here
   EOF
   ```

2. **Restart frontend:**
   ```bash
   # Kill the web process (Ctrl+C)
   bun run dev
   ```

3. **Verify in browser console:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   // Should show: http://localhost:3000
   ```

---

## Error: "Cannot connect to backend"

**Possible Causes & Solutions:**

### 1. Backend not running

**Check:**
```bash
curl http://localhost:3000/api/health
# or
lsof -ti:3000
```

**Fix:**
```bash
cd apps/backend
bun run dev
```

### 2. Wrong backend URL

**Check frontend .env.local:**
```bash
cd apps/web
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Should show:** `NEXT_PUBLIC_API_URL=http://localhost:3000`

**If wrong or missing:**
```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' >> .env.local
# Restart frontend
```

### 3. Backend crashed due to proto error

**Check backend terminal** for proto errors

**Fix:**
```bash
cd apps/backend
mkdir -p dist/grpc/proto
cp src/grpc/proto/*.proto dist/grpc/proto/
# Restart backend
bun run dev
```

---

## Error: "Keycloak authentication failed"

**Possible Causes:**

### 1. Keycloak not running

**Check:**
```bash
curl https://keycloak.habib.cloud/health
```

**Fix:**
```bash
cd docker
docker-compose up -d keycloak
```

### 2. Keycloak client not configured

**Fix:**
1. Go to https://keycloak.habib.cloud/admin
2. Login (default: admin/admin)
3. Select realm: `leap-lms`
4. Go to Clients
5. Create or configure `leap-backend` client:
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/auth/keycloak/callback`
   - Web Origins: `http://localhost:3001`
6. Get client secret from "Credentials" tab
7. Update backend `.env`:
   ```env
   KEYCLOAK_CLIENT_SECRET=<copy from Keycloak>
   ```

---

## Complete Reset (Nuclear Option)

If everything is broken:

```bash
# Stop all processes
killall node bun

# Clean everything
cd apps/backend
rm -rf dist node_modules
cd ../web
rm -rf .next node_modules
cd ../..

# Reinstall
bun install

# Rebuild backend
cd apps/backend
bun install
bun run build
mkdir -p dist/grpc/proto
cp src/grpc/proto/*.proto dist/grpc/proto/

# Setup environment
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
KEYCLOAK_AUTH_SERVER_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=your-secret
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
PORT=3000
NODE_ENV=development
GRPC_URL=0.0.0.0:5000
EOF

cd ../web
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=change-me-in-production
EOF

# Start fresh
cd ../..
bun run dev
```

---

## Verification Checklist

After fixing, verify:

- [ ] Backend starts without proto errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3001/login
- [ ] Browser console shows correct `NEXT_PUBLIC_API_URL`
- [ ] Clicking "Keycloak OIDC" redirects to backend (port 3000)
- [ ] Backend redirects to Keycloak (port 8080)
- [ ] Can login with Keycloak credentials
- [ ] Redirects back to app after login

---

## Quick Commands Reference

```bash
# Check if proto files exist
ls apps/backend/dist/grpc/proto/

# Copy proto files manually
cd apps/backend
mkdir -p dist/grpc/proto && cp src/grpc/proto/*.proto dist/grpc/proto/

# Check backend is running
lsof -ti:3000

# Check frontend env
cd apps/web && cat .env.local

# Rebuild backend with proto copy
cd apps/backend && bun run build

# Start from root
bun run dev

# Check logs
# Backend: Check terminal with `bun run dev`
# Frontend: Browser console (F12)
```

---

## Need More Help?

1. **Environment Setup:** See `ENVIRONMENT_SETUP.md`
2. **Keycloak Setup:** See `KEYCLOAK_LOGIN_QUICKSTART.md`
3. **Implementation Details:** See `LOGIN_KEYCLOAK_FIX_SUMMARY.md`
