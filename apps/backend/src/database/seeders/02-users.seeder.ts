import { drizzle } from 'drizzle-orm/node-postgres';
import { users, lookups, userRoles } from '@leap-lms/database';
import { eq, or, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { InferInsertModel } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedUsers() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding users...');

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

  // Helper function to assign role to user in userRoles table
  const assignUserRole = async (userId: number, roleId: number, assignedBy?: number) => {
    const [existing] = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(userRoles).values({
        userId,
        roleId,
        assignedBy: assignedBy || userId,
        isActive: true,
      } as InferInsertModel<typeof userRoles>);
    } else if (!existing.isActive) {
      await db
        .update(userRoles)
        .set({ isActive: true, updatedAt: new Date() } )
        .where(eq(userRoles.id, existing.id));
    }
  };

  // Helper function to upsert user
  const upsertUser = async (userData: any, additionalRoleIds?: number[]) => {
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

    let finalUser: any;

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
          } )
          .where(eq(users.id, existing.id));
        console.log(`  ↻ Updated user: ${userData.email}`);
      }

      finalUser = existing;
    } else {
      try {
        const [newUser] = await db.insert(users).values(userData ).returning();
        console.log(`  ✓ Created user: ${userData.email}`);
        finalUser = newUser;
        
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
              .set(userData )
              .where(eq(users.id, existing.id));
          }
          finalUser = existing;
        }
      }
    }
    // Assign roles in userRoles table
    if (finalUser) {
      // Assign primary role
      await assignUserRole(finalUser.id, userData.roleId, finalUser.id);
      
      // Assign additional roles if provided
      if (additionalRoleIds && additionalRoleIds.length > 0) {
        for (const roleId of additionalRoleIds) {
          await assignUserRole(finalUser.id, roleId, finalUser.id);
        }
      }
    }

    return finalUser;
  };

  // Admin Users
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
    {
      email: 'admin2@habib.cloud',
      username: 'admin2',
      passwordHash: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567899',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'admin3@habib.cloud',
      username: 'admin3',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567900',
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
  console.log('📧 Admin login credentials:');
  console.log('   - admin@habib.cloud / P@ssword123');
  console.log('   - admin2@habib.cloud / P@ssword123');
  console.log('   - admin3@habib.cloud / P@ssword123');
  
  await pool.end();
}
