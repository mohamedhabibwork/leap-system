# OIDC Server Implementation

This module provides a complete OpenID Connect (OIDC) server implementation using NestJS and `oidc-provider`.

## Features

- ✅ Full OIDC 1.0 compliant provider
- ✅ OAuth 2.0 Authorization Server
- ✅ Database-backed storage for clients, grants, and sessions
- ✅ Integration with existing user authentication system
- ✅ Client registration and management
- ✅ Support for multiple grant types (authorization_code, refresh_token, client_credentials, device_code)
- ✅ PKCE support
- ✅ Token introspection and revocation
- ✅ UserInfo endpoint
- ✅ JWKS endpoint for public key distribution

## Endpoints

### Discovery
- `GET /.well-known/openid-configuration` - OpenID Connect Discovery document
- `GET /.well-known/jwks.json` - JSON Web Key Set

### Authorization
- `GET /authorization` - Authorization endpoint
- `POST /token` - Token endpoint
- `GET /userinfo` - UserInfo endpoint
- `POST /token/introspection` - Token introspection
- `POST /token/revocation` - Token revocation
- `POST /session/end` - End session (logout)

### Client Management (Protected)
- `GET /api/v1/oidc/clients` - List all clients
- `GET /api/v1/oidc/clients/:id` - Get client details
- `POST /api/v1/oidc/clients` - Register new client
- `PUT /api/v1/oidc/clients/:id` - Update client
- `DELETE /api/v1/oidc/clients/:id` - Delete client

### Dynamic Client Registration
- `POST /reg` - Dynamic client registration (if enabled)

## Configuration

Add the following environment variables:

```env
# OIDC Configuration
OIDC_ISSUER=http://localhost:3000  # Your OIDC issuer URL
OIDC_COOKIE_KEYS=your-secret-key-1,your-secret-key-2  # Comma-separated keys for cookie signing
OIDC_INITIAL_ACCESS_TOKEN=your-initial-access-token  # Optional: for dynamic client registration
OIDC_JWKS={"keys":[...]}  # Optional: Pre-configured JWKS (JSON string)
```

## Database Schema

The OIDC module uses the following database tables:

- `oidc_clients` - Registered OAuth 2.0 / OIDC clients
- `oidc_grants` - Authorization grants, access tokens, refresh tokens, etc.
- `oidc_sessions` - OIDC provider sessions

Run database migrations to create these tables.

## Usage Example

### Register a Client

```bash
POST /api/v1/oidc/clients
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "client_id": "my-client",
  "client_secret": "my-secret",
  "redirect_uris": ["http://localhost:3001/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "scopes": ["openid", "profile", "email"]
}
```

### Authorization Code Flow

1. **Authorization Request:**
   ```
   GET /authorization?client_id=my-client&redirect_uri=http://localhost:3001/callback&response_type=code&scope=openid profile email&state=random-state
   ```

2. **User authenticates and authorizes**

3. **Authorization Response:**
   ```
   Redirect to: http://localhost:3001/callback?code=AUTHORIZATION_CODE&state=random-state
   ```

4. **Token Exchange:**
   ```bash
   POST /token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=authorization_code&code=AUTHORIZATION_CODE&redirect_uri=http://localhost:3001/callback&client_id=my-client&client_secret=my-secret
   ```

5. **Response:**
   ```json
   {
     "access_token": "...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "...",
     "id_token": "...",
     "scope": "openid profile email"
   }
   ```

### Use Access Token

```bash
GET /userinfo
Authorization: Bearer <access_token>
```

## Integration with Existing Auth

The OIDC server integrates with your existing authentication system:

- Uses the same user database
- Respects existing roles and permissions
- Claims include user roles and permissions from RBAC system
- Subject identifier (`sub`) is the user ID

## Security Considerations

1. **JWKS Management**: In production, store JWKS securely and rotate keys regularly
2. **Client Secrets**: Use strong, randomly generated client secrets
3. **HTTPS**: Always use HTTPS in production
4. **Cookie Security**: Configure secure, httpOnly cookies in production
5. **Token Expiration**: Tokens are configured with appropriate TTLs
6. **PKCE**: PKCE is required for public clients (clients without secrets)

## Development

The OIDC server includes development-friendly features:

- Development interactions UI (when `NODE_ENV=development`)
- Detailed error messages
- Swagger documentation for client management endpoints

## Testing

Test the OIDC server using:

1. **Discovery Document:**
   ```bash
   curl http://localhost:3000/.well-known/openid-configuration
   ```

2. **JWKS:**
   ```bash
   curl http://localhost:3000/.well-known/jwks.json
   ```

3. **Use an OIDC client library** (e.g., `openid-client` for Node.js) to test the full flow

## Next Steps

1. Run database migrations to create OIDC tables
2. Configure environment variables
3. Register your first OIDC client
4. Test the authorization flow
5. Integrate with your frontend applications
