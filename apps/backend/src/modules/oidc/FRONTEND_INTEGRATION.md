# OIDC Frontend Integration Guide

This guide explains how to integrate the OIDC server with the frontend application.

## Setup

### 1. Run Database Seeder

First, run the database seeder to create default OIDC clients:

```bash
cd apps/backend
npm run seed
```

This will create three default clients:
- `leap-frontend` - Web application client (with secret)
- `leap-mobile` - Mobile application client (with secret)
- `leap-spa` - Single Page Application client (public, no secret, uses PKCE)

**Important**: Save the generated client secrets! They will be displayed in the console output.

### 2. Configure Environment Variables

Add the following to your frontend `.env.local`:

```env
# OIDC Configuration
OIDC_ISSUER=http://localhost:3000
OIDC_CLIENT_ID=leap-frontend
OIDC_CLIENT_SECRET=<your-secret-from-seeder>
```

### 3. OIDC Login Button

The OIDC login button is automatically added to the login page when `OIDC_CLIENT_ID` is configured.

Users can click "Sign in with LEAP OIDC" to authenticate using the OIDC flow.

## How It Works

### Authentication Flow

1. User clicks "Sign in with LEAP OIDC" button
2. NextAuth redirects to OIDC authorization endpoint
3. User authenticates (if not already logged in)
4. OIDC server issues authorization code
5. NextAuth exchanges code for tokens
6. User is redirected back to the application
7. Session is created with user information

### Token Management

- Access tokens are automatically refreshed by NextAuth
- Tokens are stored in the NextAuth session
- Tokens are included in API requests via the `Authorization: Bearer <token>` header

### User Information

The OIDC server provides the following user information:

- Standard OIDC claims: `sub`, `email`, `name`, `given_name`, `family_name`, `preferred_username`
- Custom claims: `roles`, `permissions`, `role_id`

These are available in the NextAuth session:

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  
  console.log(session?.user?.roles); // User roles
  console.log(session?.user?.permissions); // User permissions
  console.log(session?.user?.roleId); // User role ID
}
```

## Customization

### Custom Scopes

To request additional scopes, modify the `OidcProvider` in `apps/web/lib/auth/oidc-provider.ts`:

```typescript
authorization: {
  params: {
    scope: 'openid profile email offline_access custom_scope',
    response_type: 'code',
  },
},
```

### Custom Redirect URI

The default redirect URI is `/api/auth/callback/oidc`. This is handled automatically by NextAuth.

To use a custom redirect URI, update:
1. The client's `redirect_uris` in the database
2. The NextAuth callback URL configuration

## Testing

### Test OIDC Discovery

```bash
curl http://localhost:3000/.well-known/openid-configuration
```

### Test JWKS

```bash
curl http://localhost:3000/.well-known/jwks.json
```

### Test Login Flow

1. Start the backend server
2. Start the frontend server
3. Navigate to `/login`
4. Click "Sign in with LEAP OIDC"
5. Complete the authentication flow

## Troubleshooting

### "OIDC configuration is missing"

Make sure `OIDC_CLIENT_ID` is set in your environment variables.

### "Invalid client"

1. Check that the client exists in the database
2. Verify `OIDC_CLIENT_ID` matches the `client_id` in the database
3. Verify `OIDC_CLIENT_SECRET` matches the `client_secret` in the database

### "Redirect URI mismatch"

1. Check the client's `redirect_uris` in the database
2. Ensure the redirect URI matches exactly (including protocol, domain, and path)
3. Default redirect URI: `http://localhost:3001/api/auth/callback/oidc`

### Token Refresh Issues

- Check that `offline_access` scope is requested
- Verify refresh tokens are being stored correctly
- Check token expiration times

## Security Considerations

1. **Client Secrets**: Never commit client secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Tokens are stored securely by NextAuth
4. **PKCE**: Public clients (like `leap-spa`) automatically use PKCE
5. **Token Expiration**: Tokens have appropriate expiration times

## Advanced Usage

### Direct OIDC Client (without NextAuth)

If you need to use OIDC directly without NextAuth, you can use libraries like `openid-client`:

```typescript
import { Issuer, Client } from 'openid-client';

const issuer = await Issuer.discover('http://localhost:3000');
const client = new issuer.Client({
  client_id: 'leap-frontend',
  client_secret: 'your-secret',
  redirect_uris: ['http://localhost:3001/callback'],
  response_types: ['code'],
});
```

### Custom Claims

To add custom claims to tokens, modify the `findAccount` method in `apps/backend/src/modules/oidc/oidc.service.ts`.
