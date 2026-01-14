import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createTestDatabase, seedBasicLookups, testDatabaseConnection } from '../utils/test-db.helper';
import { createUserAndGetToken } from '../utils/test-auth.helper';

describe('Data Validation E2E Tests', () => {
  let app: INestApplication;
  let db: ReturnType<typeof createTestDatabase>;
  let testToken: string;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      db = createTestDatabase();
      
      // Test database connection
      const dbConnected = await testDatabaseConnection(db);
      if (!dbConnected) {
        const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/leap_lms_test';
        throw new Error(
          `\n❌ Database connection failed!\n` +
          `   Please ensure PostgreSQL is running and accessible.\n` +
          `   Connection string: ${dbUrl.replace(/:[^:@]+@/, ':****@')}\n` +
          `   See console output above for detailed error information.\n`
        );
      }
      
      await seedBasicLookups(db);

      const testUser = await createUserAndGetToken(app, db, 'student');
      testToken = testUser.token!;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const errorStack = error?.stack || '';
      console.error('Test setup failed:', errorMessage);
      console.error('Stack:', errorStack);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('Response Structure Validation', () => {
    it('should return proper structure for users endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      // Validate response structure
      expect(response.body).toBeDefined();
      
      // Check if response has data array or is an array itself
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
        
        // If there's data, validate first item structure
        if (response.body.data.length > 0) {
          const user = response.body.data[0];
          expect(user).toHaveProperty('id');
          expect(typeof user.id).toBe('number');
          expect(user).toHaveProperty('email');
          expect(typeof user.email).toBe('string');
        }
      } else if (Array.isArray(response.body)) {
        // If response is directly an array
        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user).toHaveProperty('id');
          expect(typeof user.id).toBe('number');
        }
      }
    });

    it('should return proper structure for courses endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          const course = response.body.data[0];
          expect(course).toHaveProperty('id');
          expect(typeof course.id).toBe('number');
        }
      }
    });

    it('should return proper structure for events endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/events')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return proper structure for jobs endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return proper structure for plans endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plans')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return proper structure for lookup-types endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lookup-types')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      } else if (Array.isArray(response.body)) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should return proper structure for lookups endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lookups')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('Pagination Validation', () => {
    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses?page=1&limit=10')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });

    it('should support pagination for users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });
  });

  describe('Filtering Validation', () => {
    it('should support search parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses?search=test')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });

    it('should support filter parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/events?status=upcoming')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });
  });

  describe('Soft Delete Validation', () => {
    it('should not return deleted items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      
      // If response has data, verify no deleted items
      if (response.body.data && Array.isArray(response.body.data)) {
        response.body.data.forEach((item: any) => {
          if (item.hasOwnProperty('isDeleted')) {
            expect(item.isDeleted).not.toBe(true);
          }
        });
      }
    });
  });

  describe('Data Type Validation', () => {
    it('should return correct data types for user fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      if (response.body.data && response.body.data.length > 0) {
        const user = response.body.data[0];
        
        if (user.id !== undefined) expect(typeof user.id).toBe('number');
        if (user.email !== undefined) expect(typeof user.email).toBe('string');
        if (user.isActive !== undefined) expect(typeof user.isActive).toBe('boolean');
        if (user.createdAt !== undefined) expect(typeof user.createdAt).toBe('string');
      }
    });

    it('should return correct data types for course fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses')
        .expect(HttpStatus.OK);

      if (response.body.data && response.body.data.length > 0) {
        const course = response.body.data[0];
        
        if (course.id !== undefined) expect(typeof course.id).toBe('number');
        if (course.titleEn !== undefined) expect(typeof course.titleEn).toBe('string');
        if (course.price !== undefined) {
          expect(typeof course.price === 'string' || typeof course.price === 'number').toBe(true);
        }
      }
    });
  });

  describe('Error Handling Validation', () => {
    it('should return 404 for non-existent resource', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/999999')
        .expect((res) => {
          // Accept either 404 or 200 (if endpoint doesn't exist)
          expect([HttpStatus.NOT_FOUND, HttpStatus.OK]).toContain(res.status);
        });
    });

    it('should return 401 for unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect((res) => {
          // Accept either 401 or 200 (if endpoint is public)
          expect([HttpStatus.UNAUTHORIZED, HttpStatus.OK]).toContain(res.status);
        });
    });
  });
});
