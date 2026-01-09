# Database Seeding Guide

This document explains how to seed the Leap LMS database with initial data and sync with Keycloak.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Database Seeders](#database-seeders)
- [Keycloak Seeders](#keycloak-seeders)
- [Seeder Commands](#seeder-commands)
- [Troubleshooting](#troubleshooting)

## Overview

The seeding system provides two types of seeders:

1. **Database Seeders**: Populate the PostgreSQL database with initial data (lookups, users, plans, etc.)
2. **Keycloak Seeders**: Synchronize roles, permissions, and users from the database to Keycloak

## Prerequisites

Before running seeders, ensure:

1. PostgreSQL database is running and accessible
2. Keycloak server is running (for Keycloak seeders)
3. Environment variables are configured (see `.env.example`)
4. Database migrations have been run

## Database Seeders

### Available Seeders

#### 1. Lookups Seeder (`01-lookups.seeder.ts`)

Seeds all lookup types and values including:

- User roles (admin, instructor, user, recruiter)
- User statuses (active, inactive, suspended, banned)
- Permissions (CRUD permissions for all modules)
- Course levels, statuses, enrollment types
- Social features (post types, group roles, reactions, etc.)
- Event types and statuses
- Job types, experience levels, application statuses
- Ticket categories, statuses, priorities
- Report types and statuses
- Subscription statuses, billing cycles, plan features
- Content types, resource types, quiz question types
- Chat and message types
- System configuration (languages, timezones, media providers)
- Payment statuses and methods

**Features:**
- Smart upsert logic (creates new or updates existing)
- Idempotent (safe to run multiple times)
- Bilingual support (English and Arabic)

#### 2. Users Seeder (`02-users.seeder.ts`)

Seeds initial system users with predefined roles.

#### 3. Plans Seeder (`03-plans.seeder.ts`)

Seeds subscription plans and features.

### Running Database Seeders

```bash
# Run all database seeders
npm run seed

# Reset database and run seeders
npm run seed:reset
```

### Seeder Execution Order

Seeders run in numerical order:
1. Lookups (foundational data)
2. Users (depends on lookups)
3. Plans (depends on lookups)

## Keycloak Seeders

### Available Keycloak Seeders

#### 1. Keycloak Roles Seeder (`04-keycloak-roles.seeder.ts`)

Synchronizes roles and permissions from database to Keycloak:

- Creates Keycloak realm roles from `user_role` lookups
- Creates permission-based roles (e.g., `permission:course.create`)
- Updates existing roles if they differ

**Output:**
```
🔐 Syncing roles and permissions to Keycloak...
✓ Connected to Keycloak

📋 Found 4 roles to sync
  ✓ Created role: admin
  ✓ Created role: instructor
  ✓ Created role: user
  ✓ Created role: recruiter

📋 Found 56 permissions to sync
  ✓ Created permission: permission:course.create
  ...

📊 Summary:
  Roles: 4 created, 0 updated
  Permissions: 56 created, 0 updated

✅ Keycloak roles and permissions synced successfully!
```

#### 2. Keycloak Users Seeder (`05-keycloak-users.seeder.ts`)

Bulk synchronizes all users from database to Keycloak:

- Creates Keycloak users for all active database users
- Updates existing Keycloak users if they differ
- Assigns appropriate realm roles
- Syncs user attributes (phone, avatar, locale, timezone, status)
- Saves Keycloak user ID back to database
- Processes users in batches (default: 50)

**Output:**
```
👥 Syncing users to Keycloak...
✓ Connected to Keycloak

📋 Found 150 users to sync
  ✓ Created user: admin@example.com
  ↻ Updated user: instructor@example.com
  ...

  Batch 1 complete: 45 created, 5 updated, 0 failed

📊 Summary:
  Users created: 120
  Users updated: 30
  Users failed: 0

✅ Keycloak users synced successfully!
```

### Running Keycloak Seeders

```bash
# Sync only roles and permissions
npm run seed:keycloak:roles

# Sync only users
npm run seed:keycloak:users

# Sync both roles and users
npm run seed:keycloak:all
```

### When to Run Keycloak Seeders

Run Keycloak seeders:

1. **Initial Setup**: After setting up Keycloak and database
2. **After Adding New Roles**: When new user roles are added to lookups
3. **After Adding New Permissions**: When new permissions are added
4. **User Migration**: When migrating existing users to Keycloak
5. **After Database Restore**: When restoring from a database backup

## Seeder Commands

### Complete Setup Workflow

```bash
# 1. Run database seeders
npm run seed

# 2. Sync roles to Keycloak
npm run seed:keycloak:roles

# 3. Sync users to Keycloak
npm run seed:keycloak:users
```

### Individual Commands

```bash
# Database only
npm run seed                      # All database seeders
npm run seed:reset               # Reset and seed database

# Keycloak only
npm run seed:keycloak:roles      # Sync roles and permissions
npm run seed:keycloak:users      # Sync all users
npm run seed:keycloak:all        # Sync roles + users
```

## Environment Variables

Required environment variables for seeders:

```bash
# Database
DATABASE_URL=postgresql://postgres:@localhost:5432/leap_lms

# Keycloak Admin (for sync)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=leap-lms
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
```

## Troubleshooting

### Database Connection Issues

**Error**: `Connection refused`

**Solution**: 
- Ensure PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Verify database credentials

### Keycloak Connection Issues

**Error**: `Failed to initialize Keycloak Admin Client`

**Solution**:
- Ensure Keycloak server is running
- Check `KEYCLOAK_URL` points to correct address
- Verify admin credentials (`KEYCLOAK_ADMIN_USERNAME`, `KEYCLOAK_ADMIN_PASSWORD`)
- Ensure `admin-cli` client exists in Keycloak realm

### User Already Exists

**Error**: `User already exists in Keycloak`

**Solution**: This is not an error. The seeder will update the existing user instead of creating a new one.

### Role Assignment Failed

**Warning**: `Could not assign role admin to user@example.com`

**Solution**:
- Ensure roles have been synced first: `npm run seed:keycloak:roles`
- Check that the role exists in Keycloak admin console

### Partial Sync Failures

If some users or roles fail to sync:

1. Check Keycloak logs for specific errors
2. Verify email addresses are unique
3. Check username format compliance with Keycloak requirements
4. Re-run the seeder (it will skip successful syncs)

## Best Practices

1. **Run database seeders before Keycloak seeders**: Database must have data before syncing to Keycloak

2. **Test in development first**: Always test seeders in a development environment before running in production

3. **Backup before seeding**: Create database and Keycloak backups before running seeders in production

4. **Monitor logs**: Watch seeder output for warnings and errors

5. **Idempotent operations**: All seeders are safe to run multiple times

6. **Batch processing**: Large user bases are processed in batches to avoid timeouts

## Additional Notes

### Smart Upsert Logic

All seeders use smart upsert logic:
- **If record exists**: Updates it if values differ
- **If record doesn't exist**: Creates new record
- **Result**: Safe to run multiple times without duplicates

### User Attribute Mapping

When syncing to Keycloak, the following mappings are used:

| Database Field | Keycloak Field |
|---|---|
| email | username + email |
| firstName | firstName |
| lastName | lastName |
| phone | attributes.phone |
| avatarUrl | attributes.avatar |
| preferredLanguage | attributes.locale |
| timezone | attributes.timezone |
| roleId | realm roles |
| statusId | attributes.status + enabled flag |
| id | attributes.dbUserId |

### Performance Considerations

- **Batch size**: Users are synced in batches of 50 by default
- **Rate limiting**: Keycloak Admin API has rate limits; seeders respect these
- **Progress tracking**: Long-running syncs show progress after each batch
- **Error isolation**: Failed syncs don't stop the entire process

## See Also

- [Keycloak Sync Guide](./KEYCLOAK_SYNC.md)
- [Lookup System Documentation](./LOOKUP_SYSTEM.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
