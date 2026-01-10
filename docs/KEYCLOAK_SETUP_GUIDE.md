# Keycloak OIDC Integration Setup Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Keycloak Server Setup](#keycloak-server-setup)
4. [Client Configuration](#client-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Migration](#database-migration)
7. [Testing the Integration](#testing-the-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for setting up Keycloak OIDC authentication with SSO support in the LEAP PM system. The integration includes:

- **Backend OIDC Flow**: Server-side authentication with secure HTTP-only cookies
- **Two-Way User Sync**: Keycloak as source of truth for user data
- **Session Management**: Token refresh and session lifecycle management
- **SSO Support**: Single Sign-On across multiple applications

## Prerequisites

- Keycloak server (version 25.0+ recommended)
- PostgreSQL database for storing sessions
- Node.js 18+ and Bun runtime
- Access to Keycloak admin console

## Keycloak Server Setup

### 1. Create a Realm

1. Log in to Keycloak Admin Console
2. Click **Create Realm** (or use existing realm)
3. Enter realm name: `leap-realm`
4. Click **Create**

### 2. Create the Application Client

1. Navigate to **Clients** → **Create client**
2. Configure basic settings:
   - **Client ID**: `leap-client`
   - **Client type**: OpenID Connect
   - **Client authentication**: ON (confidential)
   - Click **Next**

3. Configure capability settings:
   - **Standard flow**: ✅ Enabled (for authorization code flow)
   - **Direct access grants**: ✅ Enabled (for password grant)
   - **Implicit flow**: ❌ Disabled
   - **Service accounts roles**: ❌ Disabled (for app client)
   - Click **Next**

4. Configure login settings:
   - **Root URL**: `http://localhost:3001` (your frontend URL)
   - **Home URL**: `http://localhost:3001/hub`
   - **Valid redirect URIs**:
     ```
     http://localhost:3000/api/v1/auth/keycloak/callback
     http://localhost:3001/*
     ```
   - **Valid post logout redirect URIs**: `http://localhost:3001/*`
   - **Web origins**: 
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - Click **Save**

5. Go to **Credentials** tab and copy the **Client secret** (you'll need this for configuration)

### 3. Create the Admin Client

1. Navigate to **Clients** → **Create client**
2. Configure basic settings:
   - **Client ID**: `admin-cli`
   - **Client type**: OpenID Connect
   - **Client authentication**: ON
   - Click **Next**

3. Configure capability settings:
   - **Standard flow**: ❌ Disabled
   - **Direct access grants**: ✅ Enabled
   - **Service accounts roles**: ✅ Enabled (IMPORTANT)
   - Click **Save**

4. Go to **Service Account Roles** tab:
   - Click **Assign role**
   - Filter by clients: `realm-management`
   - Select: **realm-admin**, **manage-users**, **view-users**, **manage-clients**
   - Click **Assign**

5. Go to **Credentials** tab and copy the **Client secret**

### 4. Configure Realm Settings

1. Navigate to **Realm settings**
2. Go to **Login** tab:
   - **User registration**: ✅ Enabled (if you want self-registration)
   - **Forgot password**: ✅ Enabled
   - **Remember me**: ✅ Enabled
   - **Email as username**: ✅ Enabled (optional)

3. Go to **Tokens** tab:
   - **Access Token Lifespan**: 5 minutes (default)
   - **SSO Session Idle**: 30 minutes
   - **SSO Session Max**: 10 hours
   - **Refresh Token Lifespan**: 30 days

4. Go to **Email** tab and configure SMTP settings for email verification

## Client Configuration

### Application Client (`leap-client`)

**Purpose**: Used for user authentication via OIDC

**Required Settings**:
- ✅ Client authentication ON
- ✅ Standard flow (Authorization Code)
- ✅ Direct access grants
- ❌ Implicit flow
- ❌ Service accounts

**Key Configuration**:
```
Client ID: leap-client
Client Secret: [from Keycloak]
Access Type: confidential
Valid Redirect URIs: {BACKEND_URL}/api/v1/auth/keycloak/callback
```

### Admin Client (`admin-cli`)

**Purpose**: Used for admin operations (user sync, role management)

**Required Settings**:
- ✅ Client authentication ON
- ✅ Service accounts roles
- ✅ Direct access grants
- ❌ Standard flow

**Required Roles**:
- realm-admin (from realm-management client)
- manage-users
- view-users
- manage-clients

## Environment Variables

### Backend Configuration (`.env` or `apps/backend/.env`)

```bash
# Keycloak Basic Configuration
KEYCLOAK_URL=https://keycloak.habib.cloud
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-client
KEYCLOAK_CLIENT_SECRET=your_client_secret_here
KEYCLOAK_PUBLIC_KEY=

# Keycloak Admin API
KEYCLOAK_ADMIN_URL=https://keycloak.habib.cloud
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=your_admin_client_secret_here
# Alternative: Username/Password authentication (less secure)
# KEYCLOAK_ADMIN_USERNAME=admin@habib.cloud
# KEYCLOAK_ADMIN_PASSWORD=P@ssword123

# Keycloak Sync Settings
KEYCLOAK_SYNC_ENABLED=true
KEYCLOAK_SYNC_ON_CREATE=true
KEYCLOAK_SYNC_ON_UPDATE=true

# Keycloak SSO & Session Configuration
KEYCLOAK_SSO_ENABLED=true
COOKIE_DOMAIN=                    # Leave empty for localhost, use .habib.cloud for production
COOKIE_SECURE=false               # Set to true in production (HTTPS)
COOKIE_SAME_SITE=lax             # Options: strict, lax, none
SESSION_COOKIE_NAME=leap_session
SESSION_MAX_AGE=604800           # 7 days in seconds
SESSION_MAX_AGE_REMEMBER_ME=2592000  # 30 days in seconds
MAX_CONCURRENT_SESSIONS=5

# URLs & Redirects
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
ALLOWED_REDIRECT_URLS=http://localhost:3001,http://localhost:3000

# Token Management
TOKEN_REFRESH_THRESHOLD=300      # Refresh 5 minutes before expiry
TOKEN_REFRESH_INTERVAL=60000     # Check every 1 minute
SESSION_CLEANUP_INTERVAL=3600000 # Cleanup every 1 hour
```

### Frontend Configuration (`.env.local` or `apps/web/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001

# NextAuth (for fallback OAuth providers)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here

# Keycloak (for NextAuth provider - optional fallback)
KEYCLOAK_ISSUER=https://keycloak.habib.cloud/realms/leap-realm
KEYCLOAK_CLIENT_ID_WEB=leap-client
KEYCLOAK_CLIENT_SECRET_WEB=your_client_secret_here
```

## Database Migration

### Run the Session Table Migration

```bash
# Navigate to project root
cd /path/to/leapv2-system

# Run database migrations
cd packages/database
bun run drizzle-kit push:pg

# Or manually apply the SQL migration
psql -U postgres -d leap_lms -f packages/database/migrations/0001_create_sessions_table.sql
```

### Verify Migration

```sql
-- Check if sessions table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'sessions';

-- View table structure
\d sessions
```

## Testing the Integration

### 1. Backend Health Check

```bash
# Check if backend is running
curl http://localhost:3000/api/docs

# Test Keycloak connectivity
curl http://localhost:3000/api/v1/auth/admin/keycloak/sync/config
```

### 2. OIDC Login Flow

1. Start both backend and frontend:
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   bun run dev

   # Terminal 2 - Frontend
   cd apps/web
   bun run dev
   ```

2. Open browser to `http://localhost:3001/login`

3. Click "Sign in with Keycloak SSO"

4. You should be redirected to Keycloak login page

5. Enter credentials and login

6. After successful authentication, you should be redirected back to `/hub` with a session cookie

### 3. Session Validation

```bash
# Check if session cookie is set (in browser DevTools)
# Look for cookie named "leap_session"

# Validate session via API
curl -b "leap_session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/v1/auth/session/validate
```

### 4. Logout Test

```bash
# Logout
curl -X POST \
  -b "leap_session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/v1/auth/logout

# Verify session is revoked
curl -b "leap_session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/v1/auth/session/validate
# Should return: {"valid": false}
```

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect URI" Error

**Cause**: Redirect URI not configured in Keycloak client

**Solution**:
1. Go to Keycloak Admin Console → Clients → leap-client
2. Add to **Valid redirect URIs**: `http://localhost:3000/api/v1/auth/keycloak/callback`
3. Save

#### 2. "401 Unauthorized" on Admin Operations

**Cause**: Admin client doesn't have proper roles

**Solution**:
1. Go to Clients → admin-cli → Service Account Roles
2. Assign "realm-admin" role from "realm-management" client
3. Restart backend

#### 3. Session Cookie Not Set

**Cause**: Cookie domain or CORS configuration issue

**Solution**:
- For localhost: Set `COOKIE_DOMAIN=` (empty)
- For production: Set `COOKIE_DOMAIN=.yourdomain.com`
- Ensure `CORS_ORIGIN` includes frontend URL
- Check `COOKIE_SECURE=false` for HTTP (localhost)

#### 4. Token Refresh Failures

**Cause**: Refresh token expired or revoked

**Solution**:
- Check token lifespan in Keycloak realm settings
- Verify `TOKEN_REFRESH_THRESHOLD` is less than token lifespan
- Check logs for specific error messages

#### 5. User Sync Issues

**Cause**: Missing admin credentials or insufficient permissions

**Solution**:
1. Verify `KEYCLOAK_ADMIN_CLIENT_SECRET` is correct
2. Check admin client has service account roles enabled
3. Ensure admin client has realm-admin role
4. Check logs: `tail -f logs/backend.log | grep Keycloak`

### Debug Mode

Enable verbose logging:

```bash
# Backend
LOG_LEVEL=debug bun run dev

# Check Keycloak sync logs
tail -f logs/backend.log | grep KeycloakSync
```

### Useful Commands

```bash
# List all active sessions for a user
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/v1/auth/sessions

# Manually sync users to Keycloak
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/v1/auth/admin/keycloak/sync/users/all

# Check sync configuration
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/v1/auth/admin/keycloak/sync/config
```

## Next Steps

- [SSO Configuration Guide](./KEYCLOAK_SSO_CONFIGURATION.md) - Setup SSO for multiple apps
- [Session Management Guide](./SESSION_MANAGEMENT.md) - Advanced session management
- [Keycloak Troubleshooting](./KEYCLOAK_TROUBLESHOOTING.md) - Detailed troubleshooting guide

## Security Best Practices

1. **Never commit secrets**: Use environment variables for all secrets
2. **Use HTTPS in production**: Set `COOKIE_SECURE=true`
3. **Rotate secrets regularly**: Change client secrets periodically
4. **Enable 2FA**: Configure 2FA in Keycloak for admin accounts
5. **Monitor sessions**: Set reasonable `MAX_CONCURRENT_SESSIONS`
6. **Use short token lifespans**: Keep access tokens short-lived (5-15 minutes)
7. **Enable audit logging**: Track all authentication events

## Support

For issues or questions:
- Check [Troubleshooting Guide](./KEYCLOAK_TROUBLESHOOTING.md)
- Review backend logs
- Verify Keycloak configuration
- Check network connectivity between services
