import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Courses API (E2E)', () => {
  let app: INestApplication;
  let instructorToken: string;
  let studentToken: string;
  let createdCourseId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as instructor and student
    const instructorResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'instructor@test.com', password: 'password' });
    instructorToken = instructorResponse.body.accessToken;

    const studentResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: 'password' });
    studentToken = studentResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/courses', () => {
    it('should return published courses (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/courses')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter courses by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses?category=programming')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((c: any) => c.category === 'programming')).toBe(true);
    });

    it('should search courses by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses?search=javascript')
        .expect(HttpStatus.OK);

      expect(response.body.data.every((c: any) =>
        c.title.toLowerCase().includes('javascript')
      )).toBe(true);
    });
  });

  describe('POST /api/v1/instructor/courses', () => {
    it('should create a new course as instructor', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        categoryId: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/instructor/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(courseData.title);
      createdCourseId = response.body.id;
    });

    it('should NOT allow student to create course', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/instructor/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked Course' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should validate required fields', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/instructor/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    it('should return course details (public)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/courses/${createdCourseId}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toBe(createdCourseId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent course', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/courses/99999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/courses/:id', () => {
    it('should update own course as instructor', async () => {
      const updateData = {
        title: 'Updated Test Course',
        price: 149.99,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should NOT allow student to update course', async () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked' })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /api/v1/courses/:id/publish', () => {
    it('should publish course as instructor', async () => {
      return request(app.getHttpServer())
        .post(`/api/v1/courses/${createdCourseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should delete own course as instructor', async () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(HttpStatus.OK);
    });

    it('should return 404 after deletion', async () => {
      return request(app.getHttpServer())
        .get(`/api/v1/courses/${createdCourseId}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
