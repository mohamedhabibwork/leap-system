# Authentication Fixes Applied

## Issues Fixed

### 1. Missing Environment Variables
- Added `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Added `NEXTAUTH_URL=http://localhost:3001`
- Added `NEXTAUTH_SECRET` (generated securely)
- Added session configuration variables

### 2. Port Configuration
- **Backend**: Running on port 3000 (PORT=3000)
- **Frontend (Web)**: Updated to run on port 3001
- Updated `apps/web/package.json` dev script to use `-p 3001`

### 3. API Endpoint Corrections
Fixed all API calls to include the `/api` prefix since the backend has a global prefix:

#### NextAuth Configuration (`apps/web/app/api/auth/[...nextauth]/route.ts`):
- Fixed credentials provider to call `/api/auth/login` instead of `/auth/login`
- Fixed session revocation endpoint to use `/api/auth/sessions`
- Added better error logging for authentication attempts
- Added provider tracking in JWT callback
- Fixed token refresh to skip for credentials provider

#### Login Page (`apps/web/app/(auth)/login/page.tsx`):
- Updated Keycloak login to use NextAuth's built-in provider
- Changed from custom backend endpoint redirect to `signIn('keycloak')`

#### Other Components:
- Fixed notification registration: `/api/notifications/register-device`
- Fixed image upload: `/api/media/upload`

### 4. Keycloak OIDC Configuration
- Updated NextAuth to properly use Keycloak provider
- Fixed login flow to use NextAuth's signIn function with 'keycloak' provider
- Maintained backend OIDC endpoints for alternative flows

### 5. Credentials Authentication Flow
- Fixed authentication to properly return user data structure
- Added comprehensive user information in JWT token
- Fixed 2FA detection in signIn callback
- Added proper error handling and logging

## Testing Required

After restarting the development server, test:

1. **Username/Password Login**:
   - Go to http://localhost:3001/login
   - Try credentials: admin@leap-lms.com / password123
   - Should successfully authenticate and redirect to /hub

2. **Keycloak OIDC Login**:
   - Click "Sign in with Keycloak OIDC" button
   - Should redirect to Keycloak login page
   - After authentication, should redirect back to /hub

3. **Social Login** (if configured):
   - Test Google, GitHub, and Facebook providers
   - Should use NextAuth's built-in OAuth flow

## Restart Instructions

To apply all changes:

```bash
# Kill current processes
lsof -ti:3000 -ti:3001 | xargs kill -9

# Restart development server
cd /Users/habib/WebstormProjects/leapv2-system
bun run dev
```

## Configuration Summary

### Environment Variables Added/Updated:
```env
# Frontend API URL (Backend)
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generated-secret>

# Session Configuration
SESSION_MAX_AGE=604800
SESSION_MAX_AGE_REMEMBER_ME=2592000
MAX_CONCURRENT_SESSIONS=5

# Existing Keycloak Config
KEYCLOAK_CLIENT_ID_WEB=leap-client
KEYCLOAK_CLIENT_SECRET_WEB=rxB1oiOlkEw1v6MWNBWvPvqJfoBot8Yj
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm
```

### Port Configuration:
- **Backend (NestJS)**: http://localhost:3000/api
- **Frontend (Next.js)**: http://localhost:3001
- **Backend Swagger**: http://localhost:3000/api/docs
- **Backend GraphQL**: http://localhost:3000/graphql

## Notes

1. The backend has a global `/api` prefix for all REST endpoints
2. NextAuth handles session management and token refresh
3. Both database and Keycloak authentication are supported with fallback
4. 2FA is detected and properly handled in the authentication flow
5. All OAuth providers (Google, GitHub, Facebook, Keycloak) use NextAuth's built-in providers
