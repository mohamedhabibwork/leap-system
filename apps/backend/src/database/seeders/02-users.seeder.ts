import { drizzle } from 'drizzle-orm/node-postgres';
import { users, lookups } from '@leap-lms/database';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { InferInsertModel } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { 
  initializeKeycloakClient, 
  setKeycloakUserPassword, 
  assignKeycloakRole 
} from './keycloak-helper';
import { getConfig } from '../../config/keycloak';
/**
 * Sync user to Keycloak
 */
async function syncUserToKeycloak(
  kcAdminClient: KcAdminClient | null,
  db: any,
  user: any,
  userRole?: { code: string },
  password?: string
) {
  if (!kcAdminClient) {
    return; // Skip if Keycloak is not available
  }

  try {
    // Get user status
    const [userStatus] = await db
      .select({ code: lookups.code })
      .from(lookups)
      .where(eq(lookups.id, user.statusId))
      .limit(1);

    // Check if user exists in Keycloak
    let existingUsers: any[] = [];
    try {
      existingUsers = await kcAdminClient.users.find({
        email: user.email,
        exact: true,
      });
    } catch (error: any) {
      // Handle 403 Forbidden - permission issue
      if (error?.response?.status === 403 || error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
        throw new Error(
          `HTTP 403 Forbidden - Insufficient permissions to manage users. ` +
          `Please ensure the Keycloak service account or admin user has 'realm-admin' role. ` +
          `See docs/KEYCLOAK_INTEGRATION.md for setup instructions.`
        );
      }
      throw error;
    }

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
          emailVerified: !!user.emailVerifiedAt,
          attributes,
        }
      );

      // Set password if provided (for seeded users)
      if (password) {
        try {
          await setKeycloakUserPassword(kcAdminClient, existingUser.id as string, password, false);
        } catch (passwordError) {
          console.warn(`    ⚠ Could not set password for ${user.email}`);
        }
      }

      // Assign role if available
      if (userRole) {
        await assignKeycloakRole(kcAdminClient, existingUser.id as string, userRole.code);
      }

      // Update keycloakUserId in database
      await db
        .update(users)
        .set({ keycloakUserId: existingUser.id } as any)
        .where(eq(users.id, user.id));

      console.log(`    ↻ Synced to Keycloak: ${user.email}`);
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

      // Set password if provided (for seeded users)
      if (password && newUserId.id) {
        try {
          await setKeycloakUserPassword(kcAdminClient, newUserId.id, password, false);
        } catch (passwordError) {
          console.warn(`    ⚠ Could not set password for ${user.email}`);
        }
      }

      // Assign role if available
      if (userRole && newUserId.id) {
        await assignKeycloakRole(kcAdminClient, newUserId.id, userRole.code);
      }

      // Save keycloakUserId to database
      await db
        .update(users)
        .set({ keycloakUserId: newUserId.id } as any)
        .where(eq(users.id, user.id));

      console.log(`    ✓ Synced to Keycloak: ${user.email}`);
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // Handle 403 Forbidden errors with specific guidance
    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      // Get config for error logging (supports well-known URL)
      const keycloakConfig = await getConfig();
      
      console.error(`    ✗ Failed to sync ${user.email} to Keycloak: HTTP 403 Forbidden`);
      console.error(`    ℹ This indicates insufficient permissions in Keycloak.`,{
        errorMessage,
        clientId: keycloakConfig.admin.clientId,
        clientSecret: keycloakConfig.admin.clientSecret,
        username: keycloakConfig.admin.username,
        password: keycloakConfig.admin.password,
        realmName: keycloakConfig.realm,
        baseUrl: keycloakConfig.authServerUrl,
      });
      console.error(`    ℹ To fix:`);
      console.error(`       1. Go to Keycloak Admin Console`);
      if (keycloakConfig.admin.clientSecret) {
        console.error(`       2. Go to Clients → ${keycloakConfig.admin.clientId}`);
        console.error(`       3. Go to "Service Account Roles" tab`);
        console.error(`       4. Add "realm-admin" role from "realm-management" client`);
      } else {
        console.error(`       2. Go to Users → ${keycloakConfig.admin.username}`);
        console.error(`       3. Go to "Role Mappings" tab`);
        console.error(`       4. Assign "realm-admin" role`);
      }
      console.error(`    ℹ See docs/KEYCLOAK_INTEGRATION.md for detailed instructions`);
      // Don't throw - allow seeding to continue, but log the issue clearly
    } else {
      console.warn(`    ⚠ Failed to sync ${user.email} to Keycloak: ${errorMessage}`);
    }
    // Don't throw - allow seeding to continue even if Keycloak sync fails
  }
}

export async function seedUsers() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding users...');

  // Initialize Keycloak client (optional)
  const kcAdminClient = await initializeKeycloakClient();

  const hashedPassword = await bcrypt.hash('P@ssword123', 10);

  // Get role lookups
  const [adminRole] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'admin'))
    .limit(1);

  const [instructorRole] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'instructor'))
    .limit(1);

  const [userRole] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'user'))
    .limit(1);

  const [recruiterRole] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'recruiter'))
    .limit(1);

  // Get status lookup (active)
  const [activeStatus] = await db
    .select({ id: lookups.id })
    .from(lookups)
    .where(eq(lookups.code, 'active'))
    .limit(1);

  const defaultRoleId = adminRole?.id || 1;
  const instructorRoleId = instructorRole?.id || 2;
  const userRoleId = userRole?.id || 3;
  const recruiterRoleId = recruiterRole?.id || 4;
  const defaultStatusId = activeStatus?.id || 1;

  // Helper function to upsert user
  const upsertUser = async (userData: any) => {
    const [existing] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, userData.email),
          eq(users.username, userData.username)
        )
      )
      .limit(1);

    if (existing) {
      // Update if different
      const needsUpdate =
        existing.firstName !== userData.firstName ||
        existing.lastName !== userData.lastName ||
        existing.phone !== userData.phone ||
        existing.roleId !== userData.roleId ||
        existing.statusId !== userData.statusId;

      if (needsUpdate) {
        await db
          .update(users)
          .set({
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            roleId: userData.roleId,
            statusId: userData.statusId,
          } as any)
          .where(eq(users.id, existing.id));
        console.log(`  ↻ Updated user: ${userData.email}`);
      }

      // Sync to Keycloak if available
      if (kcAdminClient) {
        const [userRole] = await db
          .select({ code: lookups.code })
          .from(lookups)
          .where(eq(lookups.id, existing.roleId))
          .limit(1);
        // Use the seeded password for Keycloak sync
        await syncUserToKeycloak(kcAdminClient, db, existing, userRole, 'P@ssword123');
      }

      return existing;
    } else {
      try {
        const [newUser] = await db.insert(users).values(userData as any).returning();
        console.log(`  ✓ Created user: ${userData.email}`);

        // Sync to Keycloak if available
        if (kcAdminClient) {
          const [userRole] = await db
            .select({ code: lookups.code })
            .from(lookups)
            .where(eq(lookups.id, newUser.roleId))
            .limit(1);
          // Use the seeded password for Keycloak sync
          await syncUserToKeycloak(kcAdminClient, db, newUser, userRole, 'P@ssword123');
        }

        return newUser;
      } catch (error: any) {
        // Handle duplicate key error
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.email, userData.email),
                eq(users.username, userData.username)
              )
            )
            .limit(1);
          
          if (existing) {
            await db
              .update(users)
              .set(userData as any)
              .where(eq(users.id, existing.id));

            // Sync to Keycloak if available
            if (kcAdminClient) {
              const [userRole] = await db
                .select({ code: lookups.code })
                .from(lookups)
                .where(eq(lookups.id, existing.roleId))
                .limit(1);
              // Use the seeded password for Keycloak sync
              await syncUserToKeycloak(kcAdminClient, db, existing, userRole, 'P@ssword123');
            }

            return existing;
          }
        }
        throw error;
      }
    }
  };

  // Admin User
  const usersToSeed = [
    {
      email: 'admin@habib.cloud',
      username: 'admin',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    // Instructor Users
    {
      email: 'instructor1@habib.cloud',
      username: 'instructor1',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Instructor',
      phone: '+1234567891',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: instructorRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'instructor2@habib.cloud',
      username: 'instructor2',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Teacher',
      phone: '+1234567892',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: instructorRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'instructor3@habib.cloud',
      username: 'instructor3',
      passwordHash: hashedPassword,
      firstName: 'Michael',
      lastName: 'Educator',
      phone: '+1234567896',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: instructorRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'instructor4@habib.cloud',
      username: 'instructor4',
      passwordHash: hashedPassword,
      firstName: 'Emily',
      lastName: 'Professor',
      phone: '+1234567897',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: instructorRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'instructor5@habib.cloud',
      username: 'instructor5',
      passwordHash: hashedPassword,
      firstName: 'David',
      lastName: 'Mentor',
      phone: '+1234567898',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: instructorRoleId,
      statusId: defaultStatusId,
    },
    // Student Users
    {
      email: 'student1@habib.cloud',
      username: 'student1',
      passwordHash: hashedPassword,
      firstName: 'Alice',
      lastName: 'Student',
      phone: '+1234567893',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: userRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'student2@habib.cloud',
      username: 'student2',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Learner',
      phone: '+1234567894',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: userRoleId,
      statusId: defaultStatusId,
    },
    // Recruiter
    {
      email: 'recruiter@habib.cloud',
      username: 'recruiter',
      passwordHash: hashedPassword,
      firstName: 'Tom',
      lastName: 'Recruiter',
      phone: '+1234567895',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: recruiterRoleId,
      statusId: defaultStatusId,
    },
  ];

  // Upsert all users
  for (const userData of usersToSeed) {
    await upsertUser(userData);
    console.log(`  ✓ Login credentials: ${userData.email} / P@ssword123`);
  }

  console.log('✅ Users seeded successfully!');
  console.log('📧 Login credentials: admin@habib.cloud / P@ssword123');
  if (kcAdminClient) {
    console.log('🔐 Users have been synced to Keycloak');
  } else {
    console.log('⚠️  Keycloak sync was skipped (Keycloak not configured or unavailable)');
  }
  
  await pool.end();
}
