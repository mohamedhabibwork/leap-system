# Keycloak Admin API Connection Guide

This guide provides comprehensive documentation on how to connect to and use the Keycloak Admin API in this NestJS application.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Service Overview](#service-overview)
- [Authentication Flow](#authentication-flow)
- [Available Operations](#available-operations)
- [Usage Examples](#usage-examples)
- [Integration in NestJS](#integration-in-nestjs)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Introduction

### What is Keycloak Admin API?

The Keycloak Admin API is a RESTful API that allows you to programmatically manage Keycloak realms, clients, users, roles, and other resources. It provides full administrative control over your Keycloak instance without requiring access to the Keycloak Admin Console UI.

### Why Use It?

- **Automation**: Automate user provisioning, role assignment, and realm configuration
- **Integration**: Integrate Keycloak management into your application workflows
- **Bulk Operations**: Perform bulk user and role management operations
- **Programmatic Control**: Manage Keycloak resources from your application code
- **Seeding**: Initialize Keycloak with default users, roles, and configurations

### Use Cases in This Application

The `KeycloakAdminService` in this application is used for:

- **User Management**: Creating, finding, and managing users programmatically
- **Role Management**: Creating and assigning roles to users
- **Password Management**: Resetting user passwords
- **Seeding**: Initializing Keycloak with default roles and admin users (see `seed-keycloak.command.ts`)
- **Validation**: Verifying Keycloak connectivity and configuration

## Prerequisites

Before connecting to the Keycloak Admin API, ensure you have:

1. **Keycloak Server Running**
   - Keycloak must be installed and running
   - Accessible at the configured `KEYCLOAK_SERVER_URL`
   - Default: `http://localhost:8080` (for local development)

2. **Admin Credentials**
   - A Keycloak admin user with appropriate permissions
   - Default admin user: `admin` (created during Keycloak installation)
   - Admin password must be set and known

3. **Admin Realm Access**
   - Access to the admin realm (typically `master` realm)
   - The admin user must exist in the admin realm
   - The `admin-cli` client must be enabled in the admin realm

4. **Application Realm**
   - The target realm where you want to manage resources must exist
   - Default realm name should match your application's realm configuration

## Configuration

### Environment Variables

The Keycloak Admin API connection requires the following environment variables:

#### Required Variables

```env
# Keycloak Server Configuration
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=your-app-realm

# Admin Authentication
KEYCLOAK_ADMIN_PASSWORD=your-admin-password
```

#### Optional Variables (with defaults)

```env
# Admin Realm (default: 'master')
KEYCLOAK_ADMIN_REALM=master

# Admin Username (default: 'admin')
KEYCLOAK_ADMIN_USERNAME=admin

# Admin Client ID (default: 'admin-cli')
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

### Configuration Structure

The configuration is defined in `src/config/configuration.ts`:

```typescript
keycloak: {
  realm: process.env.KEYCLOAK_REALM || '',
  serverUrl: process.env.KEYCLOAK_SERVER_URL || '',
  clientId: process.env.KEYCLOAK_CLIENT_ID || '',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  publicKey: process.env.KEYCLOAK_PUBLIC_KEY || '',
  redirectUri: process.env.KEYCLOAK_REDIRECT_URI || '',
  wellKnownUrl: process.env.KEYCLOAK_WELL_KNOWN_URL || '',
  admin: {
    realm: process.env.KEYCLOAK_ADMIN_REALM || 'master',
    username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
    password: process.env.KEYCLOAK_ADMIN_PASSWORD || '',
    clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
  },
}
```

### Configuration Validation

The `KeycloakAdminService` validates configuration on construction:

- **Missing `KEYCLOAK_SERVER_URL`**: Logs a warning, admin operations will fail
- **Missing `KEYCLOAK_ADMIN_PASSWORD`**: Logs a warning, admin operations will fail
- **Missing `KEYCLOAK_REALM`**: Operations will target the wrong realm

### Example `.env` File

```env
# Keycloak Server
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=file-management

# Admin Credentials
KEYCLOAK_ADMIN_REALM=master
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

## Service Overview

### KeycloakAdminService Class

The `KeycloakAdminService` is located at `src/modules/auth/services/keycloak-admin.service.ts` and provides a high-level interface to the Keycloak Admin API.

### Class Structure

```typescript
@Injectable()
export class KeycloakAdminService {
  private readonly logger: Logger;
  private readonly serverUrl: string;
  private readonly realm: string;
  private readonly adminRealm: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;
  private readonly adminClientId: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly httpClient: AxiosInstance;
}
```

### Key Features

1. **Automatic Token Management**: Handles authentication token acquisition and refresh automatically
2. **Token Caching**: Caches access tokens to avoid unnecessary authentication requests
3. **Error Handling**: Provides detailed error messages for common authentication failures
4. **Idempotent Operations**: Most operations check for existing resources before creating
5. **Comprehensive Logging**: Logs all operations for debugging and monitoring

### HTTP Client Configuration

The service uses an Axios HTTP client with:

- **Base URL**: Set to `KEYCLOAK_SERVER_URL`
- **Timeout**: 30 seconds
- **Automatic Token Injection**: Tokens are automatically added to request headers

## Authentication Flow

### How Authentication Works

1. **Token Check**: Before each API call, the service checks if a valid token exists
2. **Token Validation**: Validates token expiration (with 5-second safety margin)
3. **Token Refresh**: If token is expired or missing, authenticates to get a new token
4. **Token Caching**: Stores the token and expiry time for subsequent requests

### Authentication Endpoint

The service authenticates using the OAuth2 Resource Owner Password Credentials Grant:

```
POST /realms/{adminRealm}/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

client_id={adminClientId}
username={adminUsername}
password={adminPassword}
grant_type=password
```

### Token Acquisition

```typescript
async authenticate(): Promise<string> {
  // Check if we have a valid token
  const now = Date.now();
  if (this.accessToken && now < this.tokenExpiry) {
    return this.accessToken;
  }

  // Authenticate and get new token
  const response = await this.httpClient.post(
    `/realms/${this.adminRealm}/protocol/openid-connect/token`,
    new URLSearchParams({
      client_id: this.adminClientId,
      username: this.adminUsername,
      password: this.adminPassword,
      grant_type: 'password',
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  this.accessToken = response.data.access_token;
  this.tokenExpiry = now + (response.data.expires_in - 5) * 1000;
  return this.accessToken;
}
```

### Token Expiry Management

- Tokens are cached until they expire
- Expiry is set to 5 seconds before actual expiration for safety
- Automatic refresh on next API call after expiry

### Error Handling

The service provides detailed error messages for common authentication failures:

- **401 Unauthorized**: Invalid credentials or user doesn't exist
- **404 Not Found**: Keycloak server not accessible or realm doesn't exist
- **Network Errors**: Connection timeouts or unreachable server

## Available Operations

### User Management

#### Create User

Creates a new user in Keycloak. Checks for existing users by username and email before creating.

```typescript
async createUser(userData: KeycloakUserData): Promise<KeycloakUser>
```

**Parameters:**
- `userData.username`: Required - Unique username
- `userData.email`: Required - User email address
- `userData.firstName`: Optional - User's first name
- `userData.lastName`: Optional - User's last name
- `userData.enabled`: Optional - Whether user is enabled (default: `true`)
- `userData.emailVerified`: Optional - Whether email is verified (default: `true`)

**Returns:** `KeycloakUser` object with user details including `id`

**Example:**
```typescript
const user = await keycloakAdminService.createUser({
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  enabled: true,
  emailVerified: true,
});
```

#### Find User by Username

Searches for a user by exact username match.

```typescript
async findUserByUsername(username: string): Promise<KeycloakUser | null>
```

**Example:**
```typescript
const user = await keycloakAdminService.findUserByUsername('john.doe');
if (user) {
  console.log(`Found user: ${user.id}`);
}
```

#### Find User by Email

Searches for a user by exact email match.

```typescript
async findUserByEmail(email: string): Promise<KeycloakUser | null>
```

**Example:**
```typescript
const user = await keycloakAdminService.findUserByEmail('john.doe@example.com');
```

#### Get User by ID

Retrieves a user by their Keycloak user ID.

```typescript
async getUserById(userId: string): Promise<KeycloakUser | null>
```

**Example:**
```typescript
const user = await keycloakAdminService.getUserById('user-uuid-here');
```

#### Reset User Password

Resets a user's password. Can set temporary passwords that require change on next login.

```typescript
async resetUserPassword(
  userId: string,
  password: string,
  temporary: boolean = false
): Promise<void>
```

**Parameters:**
- `userId`: Keycloak user ID
- `password`: New password
- `temporary`: If `true`, user must change password on next login

**Example:**
```typescript
await keycloakAdminService.resetUserPassword(
  user.id,
  'NewSecurePassword123!',
  false // Not temporary
);
```

### Role Management

#### Create Role

Creates a new realm role. Checks if role already exists before creating.

```typescript
async createRole(
  roleName: string,
  description?: string
): Promise<KeycloakRole>
```

**Parameters:**
- `roleName`: Name of the role to create
- `description`: Optional description for the role

**Returns:** `KeycloakRole` object with role details

**Example:**
```typescript
const role = await keycloakAdminService.createRole(
  'admin',
  'System administrator with full access'
);
```

#### Get Role

Retrieves a role by name.

```typescript
async getRole(roleName: string): Promise<KeycloakRole>
```

**Example:**
```typescript
const role = await keycloakAdminService.getRole('admin');
```

#### Check if Role Exists

Checks whether a role exists in the realm.

```typescript
async roleExists(roleName: string): Promise<boolean>
```

**Example:**
```typescript
if (await keycloakAdminService.roleExists('admin')) {
  console.log('Admin role exists');
}
```

#### Get User's Realm Roles

Retrieves all realm roles assigned to a user.

```typescript
async getUserRealmRoles(userId: string): Promise<KeycloakRole[]>
```

**Example:**
```typescript
const roles = await keycloakAdminService.getUserRealmRoles(user.id);
console.log(`User has ${roles.length} roles`);
```

#### Assign Role to User

Assigns a realm role to a user. Skips if user already has the role.

```typescript
async assignRoleToUser(userId: string, roleName: string): Promise<void>
```

**Example:**
```typescript
await keycloakAdminService.assignRoleToUser(user.id, 'admin');
```

### Connection Validation

#### Validate Connection

Tests the connection to Keycloak Admin API by attempting authentication.

```typescript
async validateConnection(): Promise<boolean>
```

**Returns:** `true` if connection is successful, `false` otherwise

**Example:**
```typescript
const isConnected = await keycloakAdminService.validateConnection();
if (!isConnected) {
  console.error('Failed to connect to Keycloak');
}
```

## Usage Examples

### Basic Service Injection

Inject the `KeycloakAdminService` into your service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { KeycloakAdminService } from '../auth/services/keycloak-admin.service';

@Injectable()
export class MyService {
  constructor(private keycloakAdmin: KeycloakAdminService) {}

  async doSomething() {
    // Use the service
  }
}
```

### Creating a User with Role Assignment

Complete example of creating a user and assigning a role:

```typescript
async function createAdminUser(
  keycloakAdmin: KeycloakAdminService,
  username: string,
  email: string,
  password: string,
) {
  // Create the user
  const user = await keycloakAdmin.createUser({
    username,
    email,
    firstName: 'Admin',
    lastName: 'User',
    enabled: true,
    emailVerified: true,
  });

  // Set password
  await keycloakAdmin.resetUserPassword(user.id, password, false);

  // Assign admin role
  await keycloakAdmin.assignRoleToUser(user.id, 'admin');

  return user;
}
```

### Bulk User Creation

Example of creating multiple users:

```typescript
async function createUsers(
  keycloakAdmin: KeycloakAdminService,
  users: Array<{ username: string; email: string; password: string }>,
) {
  const results = [];

  for (const userData of users) {
    try {
      const user = await keycloakAdmin.createUser({
        username: userData.username,
        email: userData.email,
        enabled: true,
        emailVerified: true,
      });

      await keycloakAdmin.resetUserPassword(
        user.id,
        userData.password,
        false,
      );

      results.push({ success: true, user });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
}
```

### Real-World Example: Seeding Keycloak

The application includes a seeder command at `src/modules/auth/commands/seed-keycloak.command.ts` that demonstrates comprehensive usage:

```typescript
// Validate connection first
const isConnected = await keycloakAdminService.validateConnection();
if (!isConnected) {
  throw new Error('Failed to connect to Keycloak');
}

// Create roles
await keycloakAdminService.createRole('admin', 'System administrator');

// Create users
const user = await keycloakAdminService.createUser({
  username: 'admin1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'One',
  enabled: true,
  emailVerified: true,
});

// Set password
await keycloakAdminService.resetUserPassword(user.id, 'Admin123!', false);

// Assign role
await keycloakAdminService.assignRoleToUser(user.id, 'admin');
```

## Integration in NestJS

### Module Setup

The `KeycloakAdminService` is provided in the `AuthModule`:

**File:** `src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { KeycloakAdminService } from './services/keycloak-admin.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'keycloak' })],
  providers: [
    KeycloakAdminService,
    // ... other providers
  ],
  exports: [
    KeycloakAdminService,
    // ... other exports
  ],
})
export class AuthModule {}
```

### Dependency Injection

The service is automatically available for injection in any module that imports `AuthModule`:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MyService } from './my.service';

@Module({
  imports: [AuthModule],
  providers: [MyService],
})
export class MyModule {}
```

### Using in Controllers

Inject the service into controllers:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { KeycloakAdminService } from '../auth/services/keycloak-admin.service';

@Controller('users')
export class UsersController {
  constructor(private keycloakAdmin: KeycloakAdminService) {}

  @Post()
  async createUser(@Body() userData: any) {
    return await this.keycloakAdmin.createUser(userData);
  }
}
```

### Using in Services

Inject the service into other services:

```typescript
import { Injectable } from '@nestjs/common';
import { KeycloakAdminService } from '../auth/services/keycloak-admin.service';

@Injectable()
export class UserManagementService {
  constructor(private keycloakAdmin: KeycloakAdminService) {}

  async provisionUser(username: string, email: string) {
    // Use KeycloakAdminService methods
  }
}
```

## Troubleshooting

### Common Errors and Solutions

#### 1. "KEYCLOAK_SERVER_URL is not configured"

**Error Message:**
```
KEYCLOAK_SERVER_URL is not configured. Please set it in your environment variables.
```

**Solution:**
- Set `KEYCLOAK_SERVER_URL` in your `.env` file
- Ensure the URL is correct and accessible
- Default: `http://localhost:8080` for local development

#### 2. "KEYCLOAK_ADMIN_PASSWORD is not configured"

**Error Message:**
```
KEYCLOAK_ADMIN_PASSWORD is not configured. Please set it in your environment variables.
```

**Solution:**
- Set `KEYCLOAK_ADMIN_PASSWORD` in your `.env` file
- Use the password for your Keycloak admin user
- Default admin password is usually set during Keycloak installation

#### 3. "Authentication failed - Invalid credentials"

**Error Message:**
```
⚠️  Authentication failed - Invalid credentials
```

**Possible Causes:**
- Incorrect admin username
- Incorrect admin password
- Admin user doesn't exist in the admin realm
- `admin-cli` client is disabled in the admin realm

**Solutions:**
1. Verify `KEYCLOAK_ADMIN_USERNAME` (default: `admin`)
2. Verify `KEYCLOAK_ADMIN_PASSWORD` is correct
3. Check that the admin user exists in the admin realm (usually `master`)
4. Verify `admin-cli` client is enabled in the admin realm
5. Check `KEYCLOAK_ADMIN_REALM` if using a custom admin realm

#### 4. "Keycloak server not found"

**Error Message:**
```
⚠️  Keycloak server not found
```

**Possible Causes:**
- Keycloak is not running
- Incorrect `KEYCLOAK_SERVER_URL`
- Network connectivity issues
- Firewall blocking access

**Solutions:**
1. Verify Keycloak is running: `docker ps` or check Keycloak process
2. Test connectivity: `curl http://localhost:8080/realms/master`
3. Verify `KEYCLOAK_SERVER_URL` matches your Keycloak instance
4. Check firewall and network settings

#### 5. "User created but could not be retrieved"

**Error Message:**
```
User created but could not be retrieved after 5 attempts
```

**Possible Causes:**
- Keycloak indexing delay
- Network issues
- Keycloak server overload

**Solutions:**
- This is usually a transient issue - the user is created but Keycloak needs time to index
- The service automatically retries 5 times with 500ms delays
- If this persists, check Keycloak server logs

#### 6. "409 Conflict" - User Already Exists

**Error Message:**
```
409 conflict - User with email already exists
```

**Solution:**
- The service automatically handles this by finding and returning the existing user
- This is expected behavior for idempotent operations
- No action needed - the service handles it gracefully

### Configuration Validation

#### Check Configuration at Runtime

```typescript
const keycloakAdmin = app.get(KeycloakAdminService);
const isValid = await keycloakAdmin.validateConnection();

if (!isValid) {
  console.error('Keycloak configuration is invalid');
}
```

#### Verify Environment Variables

```bash
# Check if environment variables are set
echo $KEYCLOAK_SERVER_URL
echo $KEYCLOAK_REALM
echo $KEYCLOAK_ADMIN_PASSWORD
```

#### Test Keycloak Connectivity

```bash
# Test if Keycloak is accessible
curl http://localhost:8080/realms/master/.well-known/openid-configuration

# Test admin authentication manually
curl -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=your-password" \
  -d "grant_type=password"
```

### Debugging Tips

1. **Enable Debug Logging**: The service logs all operations - check application logs
2. **Check Token Expiry**: Tokens are cached - expired tokens are automatically refreshed
3. **Verify Realm Exists**: Ensure the target realm exists in Keycloak
4. **Check Admin Permissions**: Verify the admin user has permissions in the target realm
5. **Network Inspection**: Use browser DevTools or `curl` to inspect API calls
6. **Keycloak Logs**: Check Keycloak server logs for detailed error messages

### Verification Checklist

Before using the Admin API, verify:

- [ ] Keycloak server is running and accessible
- [ ] `KEYCLOAK_SERVER_URL` is correct and accessible
- [ ] `KEYCLOAK_REALM` exists in Keycloak
- [ ] Admin user exists in the admin realm
- [ ] `KEYCLOAK_ADMIN_PASSWORD` is correct
- [ ] `admin-cli` client is enabled in admin realm
- [ ] Network connectivity to Keycloak server
- [ ] `validateConnection()` returns `true`

## Best Practices

### Security Considerations

1. **Protect Admin Credentials**
   - Never commit admin passwords to version control
   - Use environment variables or secure secret management
   - Rotate admin passwords regularly
   - Use least-privilege admin accounts when possible

2. **Secure Token Storage**
   - Tokens are stored in memory only (not persisted)
   - Tokens expire automatically
   - No sensitive data is logged in token values

3. **Network Security**
   - Use HTTPS in production (`https://` instead of `http://`)
   - Restrict network access to Keycloak admin endpoints
   - Use VPN or private networks for admin access

4. **Realm Isolation**
   - Use separate admin realms for different environments
   - Don't use the `master` realm for application operations
   - Create dedicated admin users for specific operations

### Token Management

1. **Automatic Refresh**: The service handles token refresh automatically
2. **Caching**: Tokens are cached to reduce authentication requests
3. **Expiry Safety**: 5-second safety margin prevents expired token usage
4. **No Manual Management**: Don't manually manage tokens - let the service handle it

### Error Handling Patterns

1. **Always Validate Connection First**
   ```typescript
   const isValid = await keycloakAdmin.validateConnection();
   if (!isValid) {
     throw new Error('Keycloak connection failed');
   }
   ```

2. **Handle Idempotent Operations**
   - The service checks for existing resources
   - Handle cases where resources already exist gracefully
   - Don't treat "already exists" as an error

3. **Retry Transient Failures**
   - Network issues may be transient
   - Implement retry logic for critical operations
   - The service already retries user retrieval after creation

4. **Log Errors Appropriately**
   - Log detailed error messages for debugging
   - Don't log sensitive information (passwords, tokens)
   - Use structured logging for better monitoring

### Performance Considerations

1. **Batch Operations**: When creating multiple users, consider rate limits
2. **Connection Pooling**: The HTTP client reuses connections
3. **Token Caching**: Reduces authentication overhead
4. **Async Operations**: All operations are async - use `await` properly

### Code Examples

#### Good: Proper Error Handling

```typescript
try {
  const user = await keycloakAdmin.createUser({
    username: 'john.doe',
    email: 'john@example.com',
  });
  console.log(`User created: ${user.id}`);
} catch (error) {
  if (error.response?.status === 409) {
    console.log('User already exists');
  } else {
    console.error('Failed to create user:', error.message);
    throw error;
  }
}
```

#### Good: Connection Validation

```typescript
async function initializeKeycloak(keycloakAdmin: KeycloakAdminService) {
  const isConnected = await keycloakAdmin.validateConnection();
  if (!isConnected) {
    throw new Error('Cannot connect to Keycloak');
  }
  
  // Proceed with operations
}
```

#### Avoid: Hardcoded Credentials

```typescript
// ❌ BAD: Hardcoded credentials
const keycloakAdmin = new KeycloakAdminService({
  adminPassword: 'hardcoded-password', // Never do this!
});
```

#### Avoid: Ignoring Errors

```typescript
// ❌ BAD: Ignoring errors
try {
  await keycloakAdmin.createUser(userData);
} catch (error) {
  // Silently failing - bad practice
}
```

### Monitoring and Logging

1. **Monitor Authentication Failures**: Track failed authentication attempts
2. **Log Operations**: The service logs all operations - monitor these logs
3. **Track Token Refresh**: Monitor token refresh frequency
4. **Alert on Connection Failures**: Set up alerts for connection validation failures

### Additional Resources

- [Keycloak Admin REST API Documentation](https://www.keycloak.org/docs-api/latest/rest-api/)
- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [OAuth2 Resource Owner Password Credentials Grant](https://oauth.net/2/grant-types/password/)

---

## Summary

The `KeycloakAdminService` provides a robust, easy-to-use interface for managing Keycloak resources programmatically. With automatic token management, comprehensive error handling, and idempotent operations, it simplifies Keycloak administration in your NestJS application.

Key takeaways:

- Configure environment variables properly
- Always validate connection before operations
- Let the service handle token management automatically
- Use idempotent operations for reliability
- Follow security best practices for admin credentials
- Monitor and log operations for debugging

For questions or issues, refer to the troubleshooting section or check the service implementation in `src/modules/auth/services/keycloak-admin.service.ts`.
