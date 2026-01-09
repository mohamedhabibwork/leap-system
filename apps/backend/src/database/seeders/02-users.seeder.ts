import { drizzle } from 'drizzle-orm/node-postgres';
import { users, lookups } from '@leap-lms/database';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { InferInsertModel } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedUsers() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Note: roleId and statusId should reference lookup IDs from the database
  // For now using placeholder values (1 for role, 1 for status)
  const defaultRoleId = 1;
  const defaultStatusId = 1;

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
      return existing;
    } else {
      try {
        const [newUser] = await db.insert(users).values(userData as any).returning();
        console.log(`  ✓ Created user: ${userData.email}`);
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
      email: 'admin@leap-lms.com',
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
      email: 'instructor1@leap-lms.com',
      username: 'instructor1',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Instructor',
      phone: '+1234567891',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'instructor2@leap-lms.com',
      username: 'instructor2',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Teacher',
      phone: '+1234567892',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    // Student Users
    {
      email: 'student1@leap-lms.com',
      username: 'student1',
      passwordHash: hashedPassword,
      firstName: 'Alice',
      lastName: 'Student',
      phone: '+1234567893',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    {
      email: 'student2@leap-lms.com',
      username: 'student2',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Learner',
      phone: '+1234567894',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
    // Recruiter
    {
      email: 'recruiter@leap-lms.com',
      username: 'recruiter',
      passwordHash: hashedPassword,
      firstName: 'Tom',
      lastName: 'Recruiter',
      phone: '+1234567895',
      emailVerifiedAt: new Date(),
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      roleId: defaultRoleId,
      statusId: defaultStatusId,
    },
  ];

  // Upsert all users
  for (const userData of usersToSeed) {
    await upsertUser(userData);
  }

  console.log('✅ Users seeded successfully!');
  console.log('📧 Login credentials: email@leap-lms.com / password123');
  
  await pool.end();
}
