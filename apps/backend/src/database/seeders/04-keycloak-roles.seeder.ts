import { drizzle } from 'drizzle-orm/node-postgres';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';
import { initializeKeycloakClient } from './keycloak-helper';

export async function seedKeycloakRoles() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🔐 Syncing roles and permissions to Keycloak...');

  try {
    // Initialize Keycloak Admin Client
    const kcAdminClient = await initializeKeycloakClient();
    
    if (!kcAdminClient) {
      console.warn('⚠️  Keycloak not available - skipping role sync');
      await pool.end();
      return;
    }

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

    console.log(`\n📋 Found ${roles.length} roles to sync`);

    console.log('\n📊 Summary:');
    console.log(`  Roles: ${rolesCreated} created, ${rolesUpdated} updated`);
    console.log('\n✅ Keycloak roles and permissions synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing roles to Keycloak:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
