# Keycloak SSO Configuration Guide

## Overview

This guide explains how to configure Single Sign-On (SSO) across multiple applications using Keycloak.

## SSO Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App 1         │     │   App 2         │     │   App 3         │
│  (main app)     │     │  (admin panel)  │     │  (mobile app)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Keycloak     │
                         │   (SSO Server) │
                         └────────────────┘
```

## Configuration Steps

### 1. Cookie Domain Configuration

For SSO to work across subdomains, configure a shared cookie domain:

```bash
# .env
COOKIE_DOMAIN=.yourdomain.com  # Note the leading dot
COOKIE_SECURE=true             # Required for production
COOKIE_SAME_SITE=lax          # Allows cross-site cookies
```

**Examples**:
- `COOKIE_DOMAIN=.habib.cloud` → Works for `app.habib.cloud`, `admin.habib.cloud`, etc.
- `COOKIE_DOMAIN=` (empty) → Only works for exact domain (localhost)

### 2. Multiple Redirect URLs

Configure all application URLs:

```bash
# .env
ALLOWED_REDIRECT_URLS=https://app.yourdomain.com,https://admin.yourdomain.com,https://mobile-api.yourdomain.com
```

### 3. Keycloak Client Configuration

In Keycloak Admin Console for each client:

1. **Valid Redirect URIs**:
   ```
   https://*.yourdomain.com/*
   https://app.yourdomain.com/api/v1/auth/keycloak/callback
   https://admin.yourdomain.com/api/v1/auth/keycloak/callback
   ```

2. **Web Origins**:
   ```
   https://*.yourdomain.com
   https://app.yourdomain.com
   https://admin.yourdomain.com
   ```

3. **Valid Post Logout Redirect URIs**:
   ```
   https://*.yourdomain.com/*
   ```

### 4. Application Configuration

#### Main App (app.yourdomain.com)
```bash
BACKEND_URL=https://app.yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
COOKIE_DOMAIN=.yourdomain.com
```

#### Admin Panel (admin.yourdomain.com)
```bash
BACKEND_URL=https://admin.yourdomain.com
FRONTEND_URL=https://admin.yourdomain.com
COOKIE_DOMAIN=.yourdomain.com  # Same domain!
```

## Testing SSO

### 1. Login to First App

1. Visit `https://app.yourdomain.com/login`
2. Click "Sign in with Keycloak SSO"
3. Login with Keycloak credentials
4. Verify session cookie `leap_session` is set with domain `.yourdomain.com`

### 2. Access Second App

1. Visit `https://admin.yourdomain.com`
2. Should be automatically logged in (SSO)
3. If not logged in, check cookie domain configuration

### 3. Verify Cookie

In browser DevTools → Application → Cookies:
```
Name: leap_session
Value: [session_token]
Domain: .yourdomain.com
Path: /
HttpOnly: ✓
Secure: ✓
SameSite: Lax
```

## Logout Across All Apps

When user logs out from any app:

1. Session is revoked in database
2. Keycloak session is terminated
3. Cookie is cleared with correct domain
4. All apps lose access automatically

```typescript
// Logout endpoint
POST /api/v1/auth/logout

// Response clears cookie:
Set-Cookie: leap_session=; Domain=.yourdomain.com; Path=/; Max-Age=0
```

## Security Considerations

### 1. Cookie Security

- **Always use HTTPS in production** (`COOKIE_SECURE=true`)
- **Use HttpOnly flag** to prevent XSS attacks
- **Set appropriate SameSite** (`lax` or `strict`)
- **Limit cookie domain** to your actual domains

### 2. CORS Configuration

```bash
# Backend CORS
CORS_ORIGIN=https://app.yourdomain.com,https://admin.yourdomain.com
CORS_CREDENTIALS=true
```

### 3. Redirect URL Validation

The backend validates all redirect URLs against `ALLOWED_REDIRECT_URLS` to prevent open redirect vulnerabilities.

## Troubleshooting

### Cookie Not Shared Between Apps

**Check**:
1. Both apps use same `COOKIE_DOMAIN`
2. Domain starts with dot (`.yourdomain.com`)
3. Both apps are on same root domain
4. Cookies are not blocked by browser

### SSO Not Working

**Check**:
1. Keycloak client has all redirect URIs
2. `COOKIE_SECURE=true` if using HTTPS
3. `COOKIE_SAME_SITE=lax` or `none`
4. Browser allows third-party cookies

### Different Sessions in Different Apps

**Cause**: Cookie domain mismatch

**Solution**:
```bash
# Both apps must have identical cookie config
COOKIE_DOMAIN=.yourdomain.com
SESSION_COOKIE_NAME=leap_session
```

## Advanced Configuration

### Mobile Apps

For mobile apps, use different client in Keycloak:

```bash
# Mobile app configuration
KEYCLOAK_CLIENT_ID=leap-mobile
KEYCLOAK_CLIENT_SECRET=[mobile_client_secret]
```

Mobile apps should use token-based auth (Bearer tokens) instead of cookies.

### Multiple Domains

If you have apps on different domains (`app.com` and `admin.io`):

- SSO won't work with cookies (browser limitation)
- Use Keycloak's built-in SSO with redirects
- Each domain maintains separate session
- Keycloak coordinates authentication

## Next Steps

- [Setup Guide](./KEYCLOAK_SETUP_GUIDE.md) - Initial setup
- [Troubleshooting](./KEYCLOAK_TROUBLESHOOTING.md) - Common issues
- [Session Management](./SESSION_MANAGEMENT.md) - Advanced session management
