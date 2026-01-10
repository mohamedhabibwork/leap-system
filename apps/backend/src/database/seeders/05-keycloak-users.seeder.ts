import { drizzle } from 'drizzle-orm/node-postgres';
import { users, lookups } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';
import { initializeKeycloakClient, assignKeycloakRole } from './keycloak-helper';

export async function seedKeycloakUsers() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('👥 Syncing users to Keycloak...');

  try {
    // Initialize Keycloak Admin Client
    const kcAdminClient = await initializeKeycloakClient();
    
    if (!kcAdminClient) {
      console.warn('⚠️  Keycloak not available - skipping user sync');
      await pool.end();
      return;
    }

    // Get all active users from database
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.isDeleted, false));

    console.log(`\n📋 Found ${allUsers.length} users to sync`);

    let usersCreated = 0;
    let usersUpdated = 0;
    let usersFailed = 0;

    // Process users in batches
    const batchSize = 50;
    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);
      
      for (const user of batch) {
        try {
          // Get user status
          const [userStatus] = await db
            .select({ code: lookups.code })
            .from(lookups)
            .where(eq(lookups.id, user.statusId))
            .limit(1);

          // Get user role
          const [userRole] = await db
            .select({ code: lookups.code })
            .from(lookups)
            .where(eq(lookups.id, user.roleId))
            .limit(1);

          // Check if user exists in Keycloak
          const existingUsers = await kcAdminClient.users.find({ 
            email: user.email, 
            exact: true 
          });

          const attributes = {
            phone: user.phone ? [user.phone] : [],
            avatar: user.avatarUrl ? [user.avatarUrl] : [],
            locale: user.preferredLanguage ? [user.preferredLanguage] : ['en'],
            timezone: user.timezone ? [user.timezone] : ['UTC'],
            status: userStatus ? [userStatus.code] : ['active'],
            dbUserId: [user.id.toString()],
          };

          if (existingUsers.length > 0) {
            // Update existing user
            const existingUser = existingUsers[0];
            await kcAdminClient.users.update(
              { id: existingUser.id as string },
              {
                email: user.email,
                username: user.username,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                enabled: user.isActive && !user.isDeleted,
                attributes,
              }
            );

            // Assign role if available
            if (userRole) {
              await assignKeycloakRole(kcAdminClient, existingUser.id as string, userRole.code);
            }

            // Update keycloakUserId in database
            await db
              .update(users)
              .set({ keycloakUserId: existingUser.id } as any)
              .where(eq(users.id, user.id));

            usersUpdated++;
            console.log(`  ↻ Updated user: ${user.email}`);
          } else {
            // Create new user
            const newUserId = await kcAdminClient.users.create({
              username: user.username,
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              enabled: user.isActive && !user.isDeleted,
              emailVerified: !!user.emailVerifiedAt,
              attributes,
            });

            // Assign role if available
            if (userRole && newUserId.id) {
              await assignKeycloakRole(kcAdminClient, newUserId.id, userRole.code);
            }

            // Save keycloakUserId to database
            await db
              .update(users)
              .set({ keycloakUserId: newUserId.id } as any)
              .where(eq(users.id, user.id));

            usersCreated++;
            console.log(`  ✓ Created user: ${user.email}`);
          }
        } catch (error) {
          usersFailed++;
          console.error(`  ✗ Failed to sync user ${user.email}:`, error.message);
        }
      }

      console.log(`\n  Batch ${Math.floor(i / batchSize) + 1} complete: ${usersCreated} created, ${usersUpdated} updated, ${usersFailed} failed`);
    }

    console.log('\n📊 Summary:');
    console.log(`  Users created: ${usersCreated}`);
    console.log(`  Users updated: ${usersUpdated}`);
    console.log(`  Users failed: ${usersFailed}`);
    console.log('\n✅ Keycloak users synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing users to Keycloak:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
