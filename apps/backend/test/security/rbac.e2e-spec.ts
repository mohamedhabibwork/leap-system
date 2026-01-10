import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/common/enums/roles.enum';

describe('RBAC Security (E2E)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup: Login as different users to get tokens
    superAdminToken = await loginAs('superadmin@test.com', 'password');
    adminToken = await loginAs('admin@test.com', 'password');
    instructorToken = await loginAs('instructor@test.com', 'password');
    studentToken = await loginAs('student@test.com', 'password');
  });

  afterAll(async () => {
    await app.close();
  });

  async function loginAs(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(HttpStatus.OK);
    return response.body.accessToken;
  }

  describe('Super Admin Access', () => {
    it('should allow super admin to access admin endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(HttpStatus.OK);
    });

    it('should allow super admin to access any user data', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(HttpStatus.OK);
    });

    it('should allow super admin to modify any resource', async () => {
      return request(app.getHttpServer())
        .patch('/api/v1/courses/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ title: 'Updated by Super Admin' })
        .expect(HttpStatus.OK);
    });
  });

  describe('Admin Access', () => {
    it('should allow admin to access admin endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });

    it('should NOT allow admin to access super admin endpoints', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/admin/system/reset')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow admin to moderate content', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/admin/moderation/1/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Instructor Access', () => {
    it('should allow instructor to access own courses', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/instructor/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(HttpStatus.OK);
    });

    it('should NOT allow instructor to access admin endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should NOT allow instructor to modify other instructor courses', async () => {
      return request(app.getHttpServer())
        .patch('/api/v1/courses/999') // Course owned by another instructor
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ title: 'Hacked' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow instructor to view enrolled students', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/instructor/courses/1/students')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('Student Access', () => {
    it('should allow student to access own enrollments', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);
    });

    it('should NOT allow student to access another student enrollments', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/enrollments/999') // Belongs to another student
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should NOT allow student to access instructor endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/instructor/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow student to enroll in public courses', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: 1 })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('Unauthenticated Access', () => {
    it('should allow access to public course list', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses')
        .expect(HttpStatus.OK);
    });

    it('should NOT allow access to protected endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should NOT allow access to admin endpoints', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Data Ownership', () => {
    it('should allow user to access own profile', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);
    });

    it('should NOT allow user to modify another user profile', async () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/999')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ firstName: 'Hacked' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow user to view own notifications', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);
    });

    it('should NOT return other users notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      // Verify no notification belongs to another user
      const notifications = response.body.data;
      notifications.forEach((notification: any) => {
        expect(notification.userId).toBe(response.body.userId);
      });
    });
  });
});
