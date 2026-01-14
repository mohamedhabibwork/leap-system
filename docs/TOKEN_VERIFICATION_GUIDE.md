# Token Verification Guide

## Overview

This system implements comprehensive OIDC token verification using Keycloak with JWKS (JSON Web Key Set) for signature verification and token introspection as a fallback. All tokens (access and refresh) are properly verified on both backend and frontend with automatic refresh capabilities.

## Architecture

### Token Verification Flow

```
Frontend Request → Backend → JWKS Verification → Success/Fail
                              ↓ (if fail)
                         Introspection → Success/Fail
                              ↓ (if fail)
                            401 Error → Frontend Refresh → Retry
```

### Components

#### Backend Components

1. **TokenVerificationService** (`apps/backend/src/modules/auth/token-verification.service.ts`)
   - Central service for all token verification
   - Uses JWKS for JWT signature verification
   - Falls back to introspection when JWKS fails
   - Validates OIDC claims (issuer, audience, expiration)
   - Caches public keys with configurable TTL

2. **KeycloakJwtStrategy** (`apps/backend/src/modules/auth/strategies/keycloak-jwt.strategy.ts`)
   - Passport strategy for Keycloak JWT tokens
   - Uses TokenVerificationService for verification
   - Maps Keycloak claims to user object
   - Extracts realm and resource roles

3. **JwtStrategy** (`apps/backend/src/modules/auth/strategies/jwt.strategy.ts`)
   - Updated to use TokenVerificationService
   - Supports both Keycloak and local JWT tokens
   - Graceful fallback for migration period

4. **SessionService** (`apps/backend/src/modules/auth/session.service.ts`)
   - Verifies tokens before storing in sessions
   - Validates refresh tokens during session refresh
   - Automatically refreshes expired tokens
   - Logs all token operations for audit

5. **KeycloakAuthService** (`apps/backend/src/modules/auth/keycloak-auth.service.ts`)
   - Enhanced with token verification methods
   - Provides JWKS URI and issuer information
   - Implements token introspection
   - Validates refresh tokens

#### Frontend Components

1. **useTokenVerification** (`apps/web/lib/hooks/use-token-verification.ts`)
   - React hook for monitoring token expiration
   - Automatically triggers refresh before expiry
   - Provides token validity state
   - Handles token refresh errors

2. **API Client** (`apps/web/lib/api/client.ts`)
   - Axios interceptor for automatic token refresh
   - Queues failed requests during refresh
   - Retries requests with new tokens
   - Signs out on refresh failure

3. **NextAuth Configuration** (`apps/web/app/api/auth/[...nextauth]/route.ts`)
   - Enhanced token refresh logic
   - Optional backend verification of refreshed tokens
   - Improved error handling and logging
   - Supports multiple auth providers

4. **TokenRefreshManager** (`apps/web/lib/auth/token-refresh.ts`)
   - Background token refresh service
   - Periodically checks token expiration
   - Backend verification before using tokens
   - Coordinated with NextAuth

## Environment Configuration

### Backend Variables

```bash
# Keycloak OIDC Configuration
KEYCLOAK_SERVER_URL=https://keycloak.example.com
KEYCLOAK_REALM=leap-realm
KEYCLOAK_CLIENT_ID=leap-backend
KEYCLOAK_CLIENT_SECRET=your-secret-here
KEYCLOAK_ISSUER=https://keycloak.example.com/realms/leap-realm

# JWKS Configuration
KEYCLOAK_JWKS_URI=https://keycloak.example.com/realms/leap-realm/protocol/openid-connect/certs
JWKS_CACHE_TTL=600000  # 10 minutes in milliseconds
JWKS_RATE_LIMIT=10     # requests per minute

# Token Verification
TOKEN_VERIFY_AUDIENCE=leap-backend  # Optional: validate audience claim
TOKEN_VERIFY_ISSUER_STRICT=true     # Strict issuer validation
TOKEN_INTROSPECTION_FALLBACK=true   # Enable introspection fallback
TOKEN_CLOCK_TOLERANCE=30            # Clock skew tolerance in seconds
USE_KEYCLOAK_TOKEN_VERIFICATION=true # Enable Keycloak verification

# Token Refresh
TOKEN_REFRESH_THRESHOLD=300         # Refresh 5 minutes before expiry
TOKEN_REFRESH_INTERVAL=60000        # Check every minute
```

### Frontend Variables

```bash
# Keycloak Configuration
KEYCLOAK_ISSUER=https://keycloak.example.com/realms/leap-realm
KEYCLOAK_CLIENT_ID_WEB=leap-web
KEYCLOAK_CLIENT_SECRET_WEB=your-web-secret

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Usage

### Backend: Protecting Routes

```typescript
// Use JWT guard for API routes
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseController {
  @Get()
  async getCourses() {
    // Token automatically verified by JwtAuthGuard
    return this.courseService.findAll();
  }
}

// Use Session guard for cookie-based auth
@Controller('dashboard')
@UseGuards(SessionAuthGuard)
export class DashboardController {
  @Get()
  async getDashboard(@CurrentUser() user: User) {
    // Session and tokens automatically verified
    return this.dashboardService.getData(user.id);
  }
}
```

### Frontend: Using Token Verification

```typescript
'use client';

import { useTokenVerification } from '@/lib/hooks/use-token-verification';

export function Dashboard() {
  const { 
    isTokenValid, 
    timeUntilExpiry, 
    isExpiringSoon,
    refreshToken,
    isRefreshing 
  } = useTokenVerification({
    onTokenExpired: () => {
      console.log('Token expired, signing out');
    },
    onTokenRefreshed: () => {
      console.log('Token refreshed successfully');
    },
    autoRefresh: true,
  });

  return (
    <div>
      {isExpiringSoon && <div>Token expiring soon...</div>}
      {isRefreshing && <div>Refreshing token...</div>}
      <button onClick={refreshToken}>Refresh Now</button>
    </div>
  );
}
```

### Frontend: API Calls with Auto-Refresh

```typescript
import { apiClient } from '@/lib/api/client';

// API client automatically:
// 1. Adds auth token to requests
// 2. Refreshes token on 401 errors
// 3. Retries failed requests with new token

async function fetchCourses() {
  const { data } = await apiClient.get('/courses');
  return data;
}
```

## Token Verification Process

### JWKS Verification

1. Extract token from Authorization header
2. Decode JWT header to get key ID (kid)
3. Fetch public key from JWKS endpoint (cached)
4. Verify JWT signature using public key
5. Validate claims (issuer, audience, expiration)
6. Return verified token payload

### Introspection Fallback

1. If JWKS verification fails, call introspection endpoint
2. Send token + client credentials to Keycloak
3. Keycloak returns active status and token metadata
4. Use decoded token payload if active
5. Reject if token is inactive

### Token Refresh

1. Monitor token expiration time
2. Trigger refresh 5 minutes before expiry
3. Call Keycloak token endpoint with refresh token
4. Receive new access and refresh tokens
5. Update session with new tokens
6. Verify new tokens before use

## Security Considerations

### JWKS Caching

- Public keys cached for 10 minutes (configurable)
- Rate-limited to prevent DoS attacks
- Automatic cache invalidation on verification failure
- Redis fallback for distributed systems

### Token Introspection

- Used as fallback only (performance impact)
- Requires client authentication
- Rate-limited by Keycloak
- Logs all introspection calls

### Token Refresh

- Refresh tokens rotated on each use
- Refresh tokens have longer expiration (30 days)
- Failed refreshes invalidate session
- All refresh attempts logged

### Clock Skew

- 30-second tolerance for time-based validations
- Prevents issues with server time differences
- Configurable via TOKEN_CLOCK_TOLERANCE

## Monitoring and Logging

### Backend Logs

```typescript
// Token verification
logger.debug('Token verified successfully using JWKS');
logger.warn('JWKS verification failed, attempting introspection');
logger.error('Token verification failed: Invalid signature');

// Token refresh
logger.log('Refreshing tokens for session abc123...');
logger.log('Tokens refreshed successfully');
logger.error('Failed to refresh session: Invalid refresh token');

// Session operations
logger.log('Session created for user 123 with verified tokens');
logger.warn('Refresh token invalid, revoking session');
```

### Frontend Logs

```typescript
// Token verification
console.log('[TokenRefreshManager] Token expiring in 45s, refreshing...');
console.log('[TokenRefreshManager] Token refreshed successfully');

// API client
console.error('🔴 API Error - Status: 401');
console.log('Refreshing token after 401 error...');
console.log('Retrying request with new token');
```

## Troubleshooting

### Common Issues

#### 1. Token Verification Fails

**Symptom**: All requests return 401 Unauthorized

**Solutions**:
- Check KEYCLOAK_SERVER_URL and KEYCLOAK_REALM are correct
- Verify JWKS_URI is accessible from backend
- Check issuer matches token iss claim
- Enable TOKEN_INTROSPECTION_FALLBACK

#### 2. Token Refresh Fails

**Symptom**: Users repeatedly signed out

**Solutions**:
- Check refresh token expiration time
- Verify KEYCLOAK_CLIENT_SECRET is correct
- Check network connectivity to Keycloak
- Review Keycloak server logs

#### 3. JWKS Cache Issues

**Symptom**: Performance degradation or rate limits

**Solutions**:
- Increase JWKS_CACHE_TTL
- Adjust JWKS_RATE_LIMIT
- Implement Redis caching
- Monitor cache hit rates

#### 4. Clock Skew Errors

**Symptom**: Tokens rejected despite being valid

**Solutions**:
- Synchronize server clocks with NTP
- Increase TOKEN_CLOCK_TOLERANCE
- Check server timezone configuration
- Review Keycloak server time

## Performance Optimization

### JWKS Caching

- Cache public keys in-memory with TTL
- Use Redis for distributed caching
- Prefetch keys on application startup
- Monitor cache hit/miss ratios

### Token Refresh

- Refresh proactively before expiration
- Queue requests during refresh
- Use background jobs for refresh
- Implement exponential backoff

### Introspection

- Use only as fallback
- Cache introspection results briefly
- Implement request coalescing
- Monitor introspection call frequency

## Migration Guide

### From Local JWT to Keycloak

1. Set `USE_KEYCLOAK_TOKEN_VERIFICATION=true`
2. Configure Keycloak environment variables
3. Deploy backend with new verification
4. Monitor logs for verification failures
5. Gradually phase out local tokens

### Testing Token Verification

```bash
# Test JWKS verification
curl -H "Authorization: Bearer <keycloak-token>" \
  http://localhost:3000/api/v1/courses

# Test token refresh
curl -H "Authorization: Bearer <expired-token>" \
  http://localhost:3000/api/v1/courses

# Test introspection
curl -X POST http://localhost:8080/realms/leap-realm/protocol/openid-connect/token/introspect \
  -d "token=<token>" \
  -d "client_id=leap-backend" \
  -d "client_secret=<secret>"
```

## Best Practices

1. **Always verify tokens** - Never trust tokens without verification
2. **Use JWKS for performance** - Introspection is slower
3. **Refresh proactively** - Don't wait for expiration
4. **Log all operations** - Essential for debugging
5. **Monitor metrics** - Track verification success rates
6. **Cache aggressively** - But invalidate when needed
7. **Handle failures gracefully** - Provide user-friendly errors
8. **Test thoroughly** - Include edge cases
9. **Document configuration** - Keep docs up-to-date
10. **Review security** - Regular security audits
