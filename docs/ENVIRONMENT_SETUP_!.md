# Environment Setup Guide

## Quick Setup

### 1. Backend Setup

Create `/apps/backend/.env` with:

```env
# Database
DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms

# JWT
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Keycloak
KEYCLOAK_AUTH_SERVER_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Server
PORT=3000
NODE_ENV=development

# gRPC
GRPC_URL=0.0.0.0:5000
```

### 2. Frontend Setup

Create `/apps/web/.env.local` with:

```env
# Backend API - CRITICAL!
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=change-this-to-a-secure-random-string

# Keycloak (for NextAuth provider)
KEYCLOAK_CLIENT_ID_WEB=leap-client
KEYCLOAK_CLIENT_SECRET_WEB=your-web-keycloak-secret
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm
```

## Starting the Application

### Option 1: From Root (Recommended)

```bash
# From project root
bun run dev
```

This starts both backend (port 3000) and frontend (port 3001) simultaneously.

### Option 2: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd apps/backend
bun run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
bun run dev
```

## Verifying Setup

### 1. Check Backend is Running

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

### 2. Check Frontend Environment

Open browser console on http://localhost:3001/login and check:

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: http://localhost:3000
```

### 3. Test Keycloak OIDC Login

1. Go to http://localhost:3001/login
2. Click "Sign in with Keycloak OIDC"
3. Should redirect to: `http://localhost:3000/auth/keycloak/login`
4. Then to Keycloak: `https://keycloak.habib.cloud/realms/leap-realm/protocol/openid-connect/auth...`

## Common Issues

### Issue 1: "404 on /auth/keycloak/login"

**Symptom:** Browser shows 404 when clicking Keycloak login button

**Cause:** `NEXT_PUBLIC_API_URL` not set in frontend `.env.local`

**Fix:**
```bash
cd apps/web
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local
# Restart frontend
bun run dev
```

### Issue 2: "Proto file not found"

**Symptom:** Backend crashes with `users.proto not found`

**Cause:** Proto files not copied to dist folder

**Fix:**
```bash
cd apps/backend
mkdir -p dist/grpc/proto
cp src/grpc/proto/*.proto dist/grpc/proto/
# Or rebuild
bun run build
```

### Issue 3: "Backend not responding"

**Symptom:** Frontend can't connect to backend

**Causes & Fixes:**

1. **Backend not started:**
   ```bash
   cd apps/backend
   bun run dev
   ```

2. **Wrong port:**
   - Check backend is on port 3000: `lsof -ti:3000`
   - Check `PORT` in backend `.env`

3. **CORS issues:**
   - Backend should allow `http://localhost:3001`
   - Check `FRONTEND_URL` in backend `.env`

### Issue 4: "Keycloak connection failed"

**Symptom:** Keycloak login doesn't work

**Fixes:**

1. **Check Keycloak is running:**
   ```bash
   curl https://keycloak.habib.cloud/health
   ```

2. **Verify client configuration:**
   - Login to Keycloak admin: https://keycloak.habib.cloud/admin
   - Check realm: `leap-lms`
   - Check clients exist: `leap-backend`, `leap-client`

3. **Check callback URLs:**
   - Backend client redirect URI: `http://localhost:3000/auth/keycloak/callback`
   - Web client redirect URI: `http://localhost:3001/api/auth/callback/keycloak`

## Environment Variables Reference

### Required Variables

| Variable | Location | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL | `http://localhost:3000` |
| `DATABASE_URL` | Backend | Postgres connection | `postgresql://...` |
| `JWT_SECRET` | Backend | JWT signing key | Random string |
| `NEXTAUTH_SECRET` | Frontend | NextAuth signing key | Random string |

### Optional Variables

| Variable | Location | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | Backend | Backend port | `3000` |
| `KEYCLOAK_AUTH_SERVER_URL` | Backend | Keycloak URL | `https://keycloak.habib.cloud` |
| `KEYCLOAK_REALM` | Backend | Keycloak realm | `leap-lms` |

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3001 | http://localhost:3001 |
| Backend (NestJS) | 3000 | http://localhost:3000 |
| Keycloak | 8080 | https://keycloak.habib.cloud |
| PostgreSQL | 5432 | localhost:5432 |
| gRPC | 5000 | localhost:5000 |

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access login page: http://localhost:3001/login
- [ ] Credentials login works
- [ ] Keycloak OIDC button redirects to backend
- [ ] Backend redirects to Keycloak
- [ ] Can login with Keycloak
- [ ] Redirects back to app after login
- [ ] Can access protected routes (/hub)

## Development Workflow

1. **Clean start:**
   ```bash
   # Kill all processes
   killall node bun
   
   # Clean and rebuild
   cd apps/backend
   rm -rf dist
   bun run build
   
   # Start fresh
   cd ../..
   bun run dev
   ```

2. **Watch for changes:**
   - Backend: Auto-reloads on file changes
   - Frontend: Auto-reloads on file changes
   - Proto files: Need manual copy or rebuild

3. **Check logs:**
   - Backend: Check terminal for errors
   - Frontend: Check browser console
   - Keycloak: Check Keycloak admin events

## Production Deployment

### Environment Variables to Change

1. **Security:**
   - Generate new `JWT_SECRET`
   - Generate new `NEXTAUTH_SECRET`
   - Use strong Keycloak secrets

2. **URLs:**
   - Update `BACKEND_URL` to production domain
   - Update `FRONTEND_URL` to production domain
   - Update `KEYCLOAK_AUTH_SERVER_URL` if using external Keycloak

3. **Database:**
   - Use production database URL
   - Enable SSL: `?sslmode=require`

4. **Build:**
   ```bash
   # Backend
   cd apps/backend
   bun run build
   bun run start:prod
   
   # Frontend
   cd apps/web
   bun run build
   bun start
   ```

## Additional Resources

- Backend API docs: http://localhost:3000/api/docs (when available)
- Keycloak admin: https://keycloak.habib.cloud/admin
- Database viewer: Use any Postgres client with `DATABASE_URL`

## Getting Help

If you encounter issues:

1. Check this guide first
2. Check `LOGIN_KEYCLOAK_FIX_SUMMARY.md` for implementation details
3. Check `KEYCLOAK_LOGIN_QUICKSTART.md` for Keycloak-specific setup
4. Check terminal logs for errors
5. Check browser console for errors
