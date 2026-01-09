# Authentication System Implementation Guide

## Overview

LEAP PM now features a comprehensive, production-ready authentication system with Keycloak integration, OAuth social login, two-factor authentication (2FA), session management, and modern UX/UI.

## Features Implemented

### Backend

1. **Keycloak Integration**
   - Primary authentication provider
   - Token-based authentication with JWT
   - Automatic token refresh
   - User synchronization with database
   - Fallback to DB authentication when Keycloak unavailable

2. **Two-Factor Authentication (2FA)**
   - TOTP-based authentication using authenticator apps
   - QR code generation for easy setup
   - Backup codes for account recovery
   - Enable/disable 2FA functionality
   - Support for backup code authentication

3. **Session Management**
   - Track active sessions per user
   - Device fingerprinting
   - IP address and location tracking
   - Session revocation (individual or all sessions)
   - Concurrent session limits (default: 5)
   - Remember me functionality (7 days vs 30 days)

4. **OAuth Account Linking**
   - Link OAuth accounts to existing password accounts
   - Secure password verification before linking
   - Support for Google, GitHub, and Facebook

### Frontend

1. **Modern Auth UI**
   - Redesigned login page with modern components
   - Password visibility toggle
   - Remember me checkbox
   - Social login buttons (Google, GitHub, Facebook)
   - Consistent design across all auth pages

2. **Reusable Components**
   - `AuthCard` - Consistent card container
   - `AuthHeader` - Standardized headers
   - `PasswordInput` - Password field with visibility toggle and strength indicator
   - `SocialLoginButtons` - OAuth provider buttons
   - `AuthDivider` - Visual separator
   - `FormError` / `FormSuccess` - Error and success messages
   - `QRCodeDisplay` - 2FA QR code display
   - `TOTPInput` - 6-digit TOTP code input

3. **2FA User Interface**
   - Setup wizard with QR code display
   - TOTP code verification
   - Backup codes display and copy functionality
   - 2FA verification during login
   - Support for backup code entry

4. **Security Dashboard**
   - View all active sessions
   - Device and location information
   - Last activity timestamps
   - Revoke individual or all sessions
   - 2FA status and management
   - Security recommendations

5. **NextAuth Configuration**
   - Keycloak provider integration
   - Google OAuth provider
   - GitHub OAuth provider
   - Facebook OAuth provider
   - Credentials provider (fallback)
   - Automatic token refresh with rotation
   - Session management
   - Error handling

6. **Token Refresh Manager**
   - Background token refresh checks (every 5 minutes)
   - Automatic refresh before expiration
   - Token expiry detection
   - Graceful logout on refresh failure

## File Structure

### Backend

```
apps/backend/src/modules/auth/
├── auth.controller.ts              # Auth endpoints
├── auth.service.ts                 # Main auth service with Keycloak integration
├── auth.module.ts                  # Auth module configuration
├── keycloak-auth.service.ts        # Keycloak authentication service
├── keycloak-admin.service.ts       # Keycloak admin operations
├── keycloak-sync.service.ts        # User synchronization with Keycloak
├── two-factor.service.ts           # 2FA implementation
├── session.service.ts              # Session management
├── rbac.service.ts                 # Role-based access control
├── dto/
│   ├── login.dto.ts                # Login with rememberMe
│   ├── register.dto.ts             # Registration
│   ├── setup-2fa.dto.ts            # 2FA setup
│   ├── verify-2fa.dto.ts           # 2FA verification
│   ├── disable-2fa.dto.ts          # 2FA disable
│   └── ...
└── strategies/
    ├── jwt.strategy.ts             # JWT authentication strategy
    └── local.strategy.ts           # Local authentication strategy
```

### Frontend

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   ├── register/page.tsx       # Registration page
│   │   ├── forgot-password/page.tsx # Password reset request
│   │   ├── reset-password/page.tsx # Password reset form
│   │   ├── verify-email/page.tsx   # Email verification
│   │   ├── setup-2fa/page.tsx      # 2FA setup wizard
│   │   ├── verify-2fa/page.tsx     # 2FA verification
│   │   ├── link-account/page.tsx   # OAuth account linking
│   │   └── layout.tsx              # Auth layout
│   ├── api/auth/[...nextauth]/route.ts # NextAuth configuration
│   ├── (hub)/hub/settings/security/page.tsx # Security settings
│   └── providers.tsx               # App providers with token refresh
├── components/auth/
│   ├── auth-card.tsx               # Auth card container
│   ├── auth-header.tsx             # Auth header
│   ├── password-input.tsx          # Password field with visibility
│   ├── social-login-buttons.tsx    # Social login buttons
│   ├── auth-divider.tsx            # Divider component
│   ├── form-error.tsx              # Error message
│   ├── form-success.tsx            # Success message
│   ├── qr-code-display.tsx         # QR code display
│   ├── totp-input.tsx              # TOTP code input
│   └── protected-route.tsx         # Route protection wrapper
└── lib/auth/
    └── token-refresh.ts            # Token refresh manager
```

## Environment Variables

Add the following to your `.env` file:

```bash
# Keycloak OAuth (Frontend)
KEYCLOAK_ISSUER=http://localhost:8080/realms/leap-lms
KEYCLOAK_CLIENT_ID_WEB=leap-lms-web
KEYCLOAK_CLIENT_SECRET_WEB=your-keycloak-web-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Session Configuration
SESSION_MAX_AGE=604800
SESSION_MAX_AGE_REMEMBER_ME=2592000
MAX_CONCURRENT_SESSIONS=5

# Two-Factor Authentication
TOTP_ISSUER=LEAP PM
TOTP_WINDOW=1
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install speakeasy qrcode @types/speakeasy @types/qrcode
```

### 2. Database Migration

Run the database migration to add 2FA and session fields:

```sql
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_temp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_backup_codes TEXT;

CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(500),
  device_fingerprint VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  browser_version VARCHAR(50),
  os VARCHAR(100),
  os_version VARCHAR(50),
  ip_address VARCHAR(45),
  location VARCHAR(255),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configure Keycloak

1. Create a new client in Keycloak for the web application
2. Configure redirect URIs: `http://localhost:3001/api/auth/callback/keycloak`
3. Enable "Standard Flow" and "Direct Access Grants"
4. Set client authentication to "On"
5. Copy client ID and secret to `.env`

### 4. Configure OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback URL: `http://localhost:3001/api/auth/callback/github`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Set redirect URI: `http://localhost:3001/api/auth/callback/facebook`

## API Endpoints

### Authentication
- `POST /auth/login` - User login with rememberMe support
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email

### Two-Factor Authentication
- `POST /auth/2fa/setup` - Initialize 2FA setup
- `POST /auth/2fa/verify-setup` - Verify and enable 2FA
- `POST /auth/2fa/verify` - Verify 2FA code during login
- `POST /auth/2fa/disable` - Disable 2FA
- `POST /auth/2fa/backup-codes/regenerate` - Regenerate backup codes
- `GET /auth/2fa/status` - Check 2FA status

### Session Management
- `GET /auth/sessions` - Get all active sessions
- `DELETE /auth/sessions/:token` - Revoke specific session
- `DELETE /auth/sessions/other` - Revoke all other sessions
- `DELETE /auth/sessions` - Revoke all sessions

## Usage Examples

### Login with Remember Me

```typescript
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  rememberMe: true,
  redirect: false,
});
```

### Setup 2FA

```typescript
// 1. Initialize setup
const { qrCodeUrl, secret, backupCodes } = await apiClient.post('/auth/2fa/setup');

// 2. Display QR code to user
// 3. User scans with authenticator app
// 4. Verify code
await apiClient.post('/auth/2fa/verify-setup', { code: '123456' });
```

### Manage Sessions

```typescript
// Get all sessions
const sessions = await apiClient.get('/auth/sessions');

// Revoke a session
await apiClient.delete(`/auth/sessions/${sessionToken}`);

// Revoke all other sessions
await apiClient.delete('/auth/sessions/other');
```

## Security Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

2. **Session Security**
   - Sessions expire after 7 days (default) or 30 days (remember me)
   - Maximum 5 concurrent sessions per user
   - Sessions revoked on password change
   - Device fingerprinting for additional security

3. **2FA Recommendations**
   - Encourage all users to enable 2FA
   - Store backup codes securely
   - Provide clear instructions for setup

4. **OAuth Security**
   - Email verification before account linking
   - Password confirmation required for linking
   - Clear user communication about linked accounts

## Troubleshooting

### Keycloak Connection Issues
- Check `KEYCLOAK_URL` environment variable
- Verify Keycloak server is running
- Check admin credentials
- System falls back to DB authentication automatically

### OAuth Provider Issues
- Verify redirect URIs match exactly
- Check client IDs and secrets
- Ensure proper scopes are configured
- Test OAuth flows in browser dev tools

### 2FA Issues
- Ensure time sync between server and client
- Use `TOTP_WINDOW=1` for slight time variance
- Provide backup codes for recovery
- Test with multiple authenticator apps

## Next Steps

1. **Testing**
   - Write unit tests for auth services
   - Integration tests for complete auth flows
   - E2E tests for user journeys

2. **Monitoring**
   - Set up logging for auth events
   - Monitor failed login attempts
   - Track session activity
   - Alert on suspicious patterns

3. **Enhancements**
   - Add biometric authentication
   - Implement WebAuthn/FIDO2
   - Add passwordless authentication
   - Enhanced device trust

## Support

For issues or questions:
- Check the logs in `apps/backend` and `apps/web`
- Review environment variables
- Verify database schema
- Test with Keycloak admin console
