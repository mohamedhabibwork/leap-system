import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, lookups } from '@leap-lms/database';
import * as bcrypt from 'bcrypt';

export async function seedUsers() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Note: roleId and statusId should reference lookup IDs from the database
  // For now using placeholder values (1 for role, 1 for status)
  const defaultRoleId = 1;
  const defaultStatusId = 1;

  // Admin User
  await db.insert(users).values([
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
  ]);

  console.log('✅ Users seeded successfully!');
  console.log('📧 Login credentials: email@leap-lms.com / password123');
  
  await pool.end();
}
