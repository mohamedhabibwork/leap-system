import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { users } from '@leap-lms/database';
import { createTestDatabase, getOrCreateLookup, seedBasicLookups } from './test-db.helper';
import { createUserFactory } from '../factories/user.factory';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { InferInsertModel } from 'drizzle-orm';

export interface TestUser {
  id: number;
  email: string;
  username: string;
  password: string;
  token?: string;
  role?: string;
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  db: ReturnType<typeof createTestDatabase>,
  overrides?: {
    email?: string;
    username?: string;
    password?: string;
    roleId?: number;
    statusId?: number;
  },
): Promise<TestUser> {
  await seedBasicLookups(db);

  const userData = createUserFactory();
  const password = overrides?.password || 'TestPassword123!';
  const passwordHash = await bcrypt.hash(password, 10);

  // Get default role and status if not provided
  const roleId = overrides?.roleId || (await getOrCreateLookup(db, 'user_role', 'student', 'Student')).id;
  const statusId = overrides?.statusId || (await getOrCreateLookup(db, 'user_status', 'active', 'Active')).id;

  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      email: overrides?.email || userData.email,
      username: overrides?.username || userData.username,
      passwordHash,
      roleId,
      statusId,
    } as InferInsertModel<typeof users>)
    .returning();

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password,
    role: 'student',
  };
}

/**
 * Create a test user with a specific role
 */
export async function createTestUserWithRole(
  db: ReturnType<typeof createTestDatabase>,
  role: 'student' | 'instructor' | 'admin',
  overrides?: {
    email?: string;
    username?: string;
    password?: string;
  },
): Promise<TestUser> {
  await seedBasicLookups(db);

  const roleLookup = await getOrCreateLookup(db, 'user_role', role, role.charAt(0).toUpperCase() + role.slice(1));
  const statusLookup = await getOrCreateLookup(db, 'user_status', 'active', 'Active');

  return createTestUser(db, {
    ...overrides,
    roleId: roleLookup.id,
    statusId: statusLookup.id,
  });
}

/**
 * Login and get access token
 */
export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.accessToken || response.body.token;
}

/**
 * Create a test user and get their token
 */
export async function createUserAndGetToken(
  app: INestApplication,
  db: ReturnType<typeof createTestDatabase>,
  role: 'student' | 'instructor' | 'admin' = 'student',
  overrides?: {
    email?: string;
    username?: string;
    password?: string;
  },
): Promise<TestUser> {
  const password = overrides?.password || 'TestPassword123!';
  const user = await createTestUserWithRole(db, role, {
    ...overrides,
    password,
  });

  const token = await loginUser(app, user.email, password);
  user.token = token;
  user.role = role;

  return user;
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  db: ReturnType<typeof createTestDatabase>,
  email: string,
) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}
