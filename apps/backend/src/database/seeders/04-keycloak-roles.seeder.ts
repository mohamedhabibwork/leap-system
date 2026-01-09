import { drizzle } from 'drizzle-orm/node-postgres';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { createDatabasePool } from './db-helper';

export async function seedKeycloakRoles() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🔐 Syncing roles and permissions to Keycloak...');

  try {
    // Initialize Keycloak Admin Client
    const kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realmName: process.env.KEYCLOAK_REALM || 'leap-lms',
    });

    // Authenticate
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
      password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
      grantType: 'password',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
    });

    console.log('✓ Connected to Keycloak');

    // Get all user roles from database
    const roles = await db
      .select({
        code: lookups.code,
        nameEn: lookups.nameEn,
        descriptionEn: lookups.descriptionEn,
      })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(eq(lookupTypes.code, 'user_role'));

    console.log(`\n📋 Found ${roles.length} roles to sync`);

    // Create roles in Keycloak
    let rolesCreated = 0;
    let rolesUpdated = 0;

    for (const role of roles) {
      try {
        // Check if role exists
        const existingRole = await kcAdminClient.roles.findOneByName({ name: role.code });

        if (existingRole) {
          // Update existing role
          await kcAdminClient.roles.updateByName(
            { name: role.code },
            {
              name: role.code,
              description: role.descriptionEn || role.nameEn,
            }
          );
          rolesUpdated++;
          console.log(`  ↻ Updated role: ${role.code}`);
        } else {
          // Create new role
          await kcAdminClient.roles.create({
            name: role.code,
            description: role.descriptionEn || role.nameEn,
          });
          rolesCreated++;
          console.log(`  ✓ Created role: ${role.code}`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to sync role ${role.code}:`, error.message);
      }
    }

    // Get all permissions from database
    const permissions = await db
      .select({
        code: lookups.code,
        nameEn: lookups.nameEn,
        descriptionEn: lookups.descriptionEn,
      })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(eq(lookupTypes.code, 'permission'));

    console.log(`\n📋 Found ${permissions.length} permissions to sync`);

    // Create permission roles in Keycloak
    let permissionsCreated = 0;
    let permissionsUpdated = 0;

    for (const permission of permissions) {
      const permissionRoleName = `permission:${permission.code}`;

      try {
        // Check if permission role exists
        const existingPermission = await kcAdminClient.roles.findOneByName({ name: permissionRoleName });

        if (existingPermission) {
          // Update existing permission role
          await kcAdminClient.roles.updateByName(
            { name: permissionRoleName },
            {
              name: permissionRoleName,
              description: permission.descriptionEn || permission.nameEn,
            }
          );
          permissionsUpdated++;
        } else {
          // Create new permission role
          await kcAdminClient.roles.create({
            name: permissionRoleName,
            description: permission.descriptionEn || permission.nameEn,
          });
          permissionsCreated++;
        }
      } catch (error) {
        console.error(`  ✗ Failed to sync permission ${permissionRoleName}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Roles: ${rolesCreated} created, ${rolesUpdated} updated`);
    console.log(`  Permissions: ${permissionsCreated} created, ${permissionsUpdated} updated`);
    console.log('\n✅ Keycloak roles and permissions synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing roles to Keycloak:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
