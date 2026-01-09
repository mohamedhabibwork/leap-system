# Keycloak OIDC Login - Quick Start Guide

## For Developers

### Starting the Application

1. **Start Keycloak** (if using Docker):
```bash
cd docker
docker-compose up -d keycloak
```

2. **Start Backend**:
```bash
cd apps/backend
bun run dev
```

3. **Start Frontend**:
```bash
cd apps/web
bun run dev
```

### Testing Direct Keycloak Login

#### Using the UI
1. Navigate to `http://localhost:3001/login`
2. Click **"Sign in with Keycloak OIDC"** button
3. You'll be redirected to Keycloak login page
4. Enter your Keycloak credentials
5. After successful authentication, you'll be redirected back to `/hub`

#### Using API Directly
```bash
# 1. Initiate login (in browser)
http://localhost:3000/auth/keycloak/login?redirect_uri=http://localhost:3001/hub

# 2. After Keycloak auth, you'll be redirected to callback
# The callback will handle everything automatically

# 3. Or exchange token programmatically
curl -X POST http://localhost:3000/auth/keycloak/token \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "YOUR_KEYCLOAK_ACCESS_TOKEN"}'
```

### Keycloak Setup

#### Required Realm Settings
1. Create realm: `leap-lms`
2. Create client: `leap-backend`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/auth/keycloak/callback`
   - Web Origins: `http://localhost:3001`

#### Test Users
Create test users in Keycloak admin console:
- Username: `testuser@example.com`
- Email: `testuser@example.com`
- Email Verified: `ON`
- Password: Set temporary password

### Environment Configuration

**.env (Backend)**
```env
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=leap-lms
KEYCLOAK_CLIENT_ID=leap-backend
KEYCLOAK_CLIENT_SECRET=get-from-keycloak-client-credentials

BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**.env.local (Frontend)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000

NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-here

# For NextAuth Keycloak provider
KEYCLOAK_CLIENT_ID_WEB=leap-web
KEYCLOAK_CLIENT_SECRET_WEB=get-from-keycloak-web-client
KEYCLOAK_ISSUER=http://localhost:8080/realms/leap-lms
```

### Debugging

#### Backend Logs
Check backend console for:
- `User authenticated successfully with Keycloak`
- `Keycloak authentication failed` (with error details)

#### Frontend Logs
Open browser console to see:
- Redirect to Keycloak
- Callback with tokens
- Any authentication errors

#### Common Issues

1. **"Invalid redirect_uri"**
   - Check Keycloak client settings
   - Ensure callback URL is in Valid Redirect URIs

2. **"Client not found"**
   - Verify KEYCLOAK_CLIENT_ID matches Keycloak client name
   - Check realm name is correct

3. **"Unauthorized"**
   - Check client secret is correct
   - Verify client Access Type is "confidential"

4. **"CORS error"**
   - Add frontend URL to Web Origins in Keycloak client

### API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/keycloak/login` | GET | Initiates OIDC flow |
| `/auth/keycloak/callback` | GET | Handles OAuth2 callback |
| `/auth/keycloak/token` | POST | Exchanges Keycloak token |
| `/auth/login` | POST | Traditional login |
| `/auth/register` | POST | User registration |
| `/auth/me` | GET | Get current user |

### Testing Checklist

- [ ] Keycloak is running and accessible
- [ ] Backend environment variables are set
- [ ] Frontend environment variables are set
- [ ] Test user exists in Keycloak
- [ ] Can access login page
- [ ] Can click Keycloak OIDC button
- [ ] Redirects to Keycloak login
- [ ] Can login with test credentials
- [ ] Redirects back to application
- [ ] User is logged in successfully
- [ ] Can access protected routes

### Production Deployment

⚠️ **Important:** Before deploying to production:

1. **Use HTTPS** for all URLs
2. **Update redirect URIs** in Keycloak
3. **Rotate client secrets**
4. **Enable rate limiting** on auth endpoints
5. **Set up monitoring** for auth failures
6. **Configure proper CORS** settings
7. **Use secure session storage**
8. **Implement token rotation**

### Support

For issues or questions:
1. Check backend logs
2. Check Keycloak admin console
3. Review environment configuration
4. Verify network connectivity between services
5. Check this documentation: `LOGIN_KEYCLOAK_FIX_SUMMARY.md`

---

## Quick Command Reference

```bash
# Build backend
cd apps/backend && bun run build

# Run backend tests
cd apps/backend && bun test

# Check backend logs
cd apps/backend && bun run dev | grep -i keycloak

# Access Keycloak admin
# http://localhost:8080/admin (default: admin/admin)

# Check if Keycloak is healthy
curl http://localhost:8080/health

# Test backend auth endpoint
curl http://localhost:3000/auth/keycloak/login
```
