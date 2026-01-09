# Keycloak Synchronization Guide

This document explains how the Leap LMS integrates with Keycloak for centralized identity and access management, including automated synchronization between the database and Keycloak.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Sync Configuration](#sync-configuration)
- [Automated Sync](#automated-sync)
- [Manual Sync](#manual-sync)
- [Admin API Endpoints](#admin-api-endpoints)
- [Sync Strategies](#sync-strategies)
- [User Attribute Mapping](#user-attribute-mapping)
- [Role Management](#role-management)
- [Troubleshooting](#troubleshooting)

## Overview

The Keycloak synchronization system provides:

1. **Automated Sync**: Automatically sync users to Keycloak on creation/update
2. **Manual Sync**: Admin endpoints to manually trigger sync operations
3. **Bidirectional Sync**: Support for both DB → Keycloak and Keycloak → DB
4. **Role Synchronization**: Sync roles and permissions from database to Keycloak
5. **Bulk Operations**: Efficiently sync large numbers of users

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   PostgreSQL    │◄────────┤   NestJS API     │────────►│    Keycloak     │
│    Database     │         │                  │         │     Server      │
│                 │         │  - Auth Service  │         │                 │
│  - Users        │         │  - Admin Service │         │  - Realm Roles  │
│  - Lookups      │         │  - Sync Service  │         │  - Users        │
│  - Roles        │         │                  │         │  - Attributes   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        └────────────────────────────┴────────────────────────────┘
                        Synchronized via Admin API
```

### Components

#### 1. KeycloakAdminService
- Handles direct communication with Keycloak Admin API
- Provides CRUD operations for users and roles
- Manages authentication and token refresh

#### 2. KeycloakSyncService
- Orchestrates synchronization operations
- Implements automatic sync hooks
- Provides manual sync triggers
- Manages sync configuration

#### 3. AuthService
- Integrates sync into user lifecycle
- Triggers sync on user creation/update
- Handles role assignment synchronization

## Sync Configuration

### Environment Variables

Configure sync behavior in `.env`:

```bash
# Keycloak Admin Connection
KEYCLOAK_ADMIN_URL=http://localhost:8080
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Sync Settings
KEYCLOAK_SYNC_ENABLED=true          # Master switch for sync
KEYCLOAK_SYNC_ON_CREATE=true        # Auto-sync on user creation
KEYCLOAK_SYNC_ON_UPDATE=true        # Auto-sync on user update
```

### Configuration Options

| Variable | Description | Default |
|---|---|---|
| `KEYCLOAK_SYNC_ENABLED` | Master switch to enable/disable all sync | `false` |
| `KEYCLOAK_SYNC_ON_CREATE` | Automatically sync when users are created | `true` |
| `KEYCLOAK_SYNC_ON_UPDATE` | Automatically sync when users are updated | `true` |

## Automated Sync

When sync is enabled, the following operations automatically trigger synchronization:

### User Registration

```typescript
// User registers
POST /auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe"
}

// Flow:
// 1. User created in database
// 2. Email verification sent
// 3. User automatically synced to Keycloak
// 4. Keycloak user ID saved to database
```

### User Update

```typescript
// User profile updated
PUT /users/123
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}

// Flow:
// 1. User updated in database
// 2. Changes automatically synced to Keycloak
// 3. Keycloak user attributes updated
```

### Role Assignment

```typescript
// Admin assigns role to user
PUT /auth/admin/user/123/role
{
  "roleId": 2  // Instructor role
}

// Flow:
// 1. User role updated in database
// 2. Role mapping synced to Keycloak
// 3. Old roles removed, new role assigned
```

### Error Handling

Sync errors are logged but don't prevent the primary operation:

```typescript
// Registration succeeds even if Keycloak sync fails
// User can still login with database credentials
// Sync can be manually triggered later
```

## Manual Sync

Admins can manually trigger sync operations via API endpoints.

### Sync Single User

```bash
# Sync specific user to Keycloak
POST /auth/admin/keycloak/sync/user/123
Authorization: Bearer <admin-token>

# Response:
{
  "success": true,
  "message": "User 123 synced successfully to Keycloak"
}
```

### Sync All Users

```bash
# Bulk sync all users to Keycloak
POST /auth/admin/keycloak/sync/users/all
Authorization: Bearer <admin-token>

# Response:
{
  "success": 120,
  "failed": 3,
  "message": "Synced 120 users successfully, 3 failed"
}
```

### Sync Roles

```bash
# Sync roles and permissions to Keycloak
POST /auth/admin/keycloak/sync/roles
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "syncRoles": true,
  "syncPermissions": true
}

# Response:
{
  "roles": {
    "success": true,
    "count": 4,
    "message": "Synced 4 roles to Keycloak"
  },
  "permissions": {
    "success": true,
    "count": 56,
    "message": "Synced 56 permissions to Keycloak"
  }
}
```

### Check Sync Status

```bash
# Get sync status for user
GET /auth/admin/keycloak/sync/status/123
Authorization: Bearer <admin-token>

# Response:
{
  "synced": true,
  "keycloakUserId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "message": "User is synced with Keycloak"
}
```

### Get Sync Configuration

```bash
# Get current sync configuration
GET /auth/admin/keycloak/sync/config
Authorization: Bearer <admin-token>

# Response:
{
  "enabled": true,
  "syncOnCreate": true,
  "syncOnUpdate": true
}
```

## Admin API Endpoints

### Authentication

All admin endpoints require JWT authentication with admin role:

```bash
# Login as admin
POST /auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Use returned token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/admin/keycloak/sync/user/:id` | Sync single user |
| POST | `/auth/admin/keycloak/sync/users/all` | Sync all users |
| POST | `/auth/admin/keycloak/sync/roles` | Sync roles and permissions |
| GET | `/auth/admin/keycloak/sync/status/:userId` | Get user sync status |
| GET | `/auth/admin/keycloak/sync/config` | Get sync configuration |
| PUT | `/auth/admin/user/:id/role` | Assign role to user |

## Sync Strategies

### Database → Keycloak (Push)

**When**: 
- User created
- User updated
- Role assigned
- Manual sync triggered

**What is synced**:
- Email (used as username)
- First name, last name
- User attributes (phone, avatar, locale, timezone, status)
- Enabled status (based on isActive and isDeleted)
- Realm role assignments

**Conflict Resolution**: Database always wins (overwrites Keycloak data)

### Keycloak → Database (Pull)

**When**: 
- User created in Keycloak admin console
- Manual import triggered

**What is synced**:
- Email, username
- First name, last name
- User attributes
- Enabled status

**Conflict Resolution**: Keycloak wins for new imports, configurable for updates

### Sync Queue (Future Enhancement)

For production environments, consider implementing:
- Redis-based sync queue
- Retry mechanism for failed syncs
- Audit log for all sync operations
- Conflict detection and resolution

## User Attribute Mapping

### Standard Fields

| Database | Keycloak |
|---|---|
| email | email + username |
| firstName | firstName |
| lastName | lastName |
| isActive && !isDeleted | enabled |
| emailVerifiedAt | emailVerified |

### Custom Attributes

| Database | Keycloak Attributes |
|---|---|
| id | attributes.dbUserId |
| phone | attributes.phone |
| avatarUrl | attributes.avatar |
| preferredLanguage | attributes.locale |
| timezone | attributes.timezone |
| statusId → code | attributes.status |

### Example Keycloak User

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "enabled": true,
  "emailVerified": true,
  "attributes": {
    "dbUserId": ["123"],
    "phone": ["+1234567890"],
    "avatar": ["https://cdn.example.com/avatars/john.jpg"],
    "locale": ["en"],
    "timezone": ["UTC"],
    "status": ["active"]
  },
  "realmRoles": ["user"]
}
```

## Role Management

### Role Types

#### 1. User Roles (Realm Roles)
Synced from `lookups` table where `lookup_type = 'user_role'`:
- `admin` - System administrator
- `instructor` - Course instructor
- `user` - Regular user/student
- `recruiter` - Job recruiter

#### 2. Permission Roles
Synced from `lookups` table where `lookup_type = 'permission'`:
- `permission:course.create`
- `permission:course.read`
- `permission:course.update`
- `permission:course.delete`
- (etc., for all modules and actions)

### Role Assignment

When a user's role is updated in the database:

1. Old realm roles are removed
2. New realm role is assigned
3. Permission roles remain unchanged (managed separately)

### Composite Roles (Future Enhancement)

Consider creating composite roles in Keycloak:
- `admin` role includes all permission roles
- `instructor` role includes course management permissions
- `user` role includes basic read permissions

## Troubleshooting

### Sync Not Working

**Problem**: Users not syncing to Keycloak

**Solutions**:
1. Check `KEYCLOAK_SYNC_ENABLED=true` in `.env`
2. Verify Keycloak admin credentials
3. Check Keycloak server is accessible
4. Review application logs for errors
5. Manually trigger sync via API endpoint

### Token Expiration Errors

**Problem**: `401 Unauthorized` from Keycloak Admin API

**Solutions**:
- Keycloak admin token refreshes automatically every 58 seconds
- Check admin credentials are correct
- Verify `admin-cli` client exists in Keycloak realm
- Restart application to re-initialize connection

### User Already Exists

**Problem**: "User already exists" error during sync

**Solution**: Not an error - the seeder/sync will update the existing user instead

### Role Assignment Failed

**Problem**: Role not assigned to user in Keycloak

**Solutions**:
1. Ensure roles are synced first: `POST /auth/admin/keycloak/sync/roles`
2. Check role exists in database lookups
3. Verify role code matches between DB and Keycloak
4. Check user has valid keycloakUserId

### Partial Sync Failures

**Problem**: Some users sync successfully, others fail

**Solutions**:
1. Check failed user emails are valid and unique
2. Verify usernames meet Keycloak requirements (no special chars)
3. Review Keycloak logs for specific errors
4. Re-run sync (successful syncs will be skipped)

## Best Practices

1. **Enable sync in development first**: Test thoroughly before enabling in production

2. **Sync roles before users**: Always sync roles and permissions before syncing users

3. **Monitor sync logs**: Watch application logs for sync errors and warnings

4. **Backup before bulk operations**: Create backups before bulk syncing users

5. **Use manual sync for recovery**: If automated sync fails, use manual endpoints

6. **Regular sync health checks**: Periodically verify sync status via API

7. **Audit trail**: Keep logs of all sync operations for compliance

8. **Rate limiting**: Be aware of Keycloak API rate limits for bulk operations

9. **Error handling**: Sync errors should log but not prevent primary operations

10. **Testing**: Always test sync in staging environment first

## Security Considerations

### Admin Credentials

- Use strong passwords for Keycloak admin account
- Rotate admin credentials regularly
- Use environment variables, never hardcode credentials
- Restrict admin-cli client permissions

### API Security

- Admin endpoints require JWT authentication
- Implement role-based access control (RBAC)
- Use HTTPS in production
- Rate limit admin endpoints

### Data Privacy

- User attributes synced to Keycloak should comply with privacy regulations
- Implement data retention policies
- Allow users to delete their Keycloak accounts

## Monitoring

### Key Metrics

Monitor these metrics for sync health:

- **Sync success rate**: Percentage of successful syncs
- **Sync latency**: Time taken to sync operations
- **Failed syncs**: Count and reasons for failures
- **Queue depth**: Number of pending sync operations (if using queue)

### Logging

Sync operations log at appropriate levels:
- **INFO**: Successful syncs
- **WARN**: Non-critical issues (e.g., role already exists)
- **ERROR**: Failed syncs with stack traces

## See Also

- [Seeding Guide](./SEEDING.md)
- [Lookup System Documentation](./LOOKUP_SYSTEM.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Keycloak Official Documentation](https://www.keycloak.org/documentation)
