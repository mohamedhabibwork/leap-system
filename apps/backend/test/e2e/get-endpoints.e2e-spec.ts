import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createTestDatabase, seedBasicLookups, getOrCreateLookup, testDatabaseConnection } from '../utils/test-db.helper';
import { createUserAndGetToken } from '../utils/test-auth.helper';
import {
  createUserFactory,
  createCourseFactory,
  createEventFactory,
  createJobFactory,
  createPostFactory,
  createPlanFactory,
  createTicketFactory,
  createCommentFactory,
  createNotificationFactory,
} from '../factories';
import { users, courses, events, jobs, posts, plans, tickets, comments, notifications } from '@leap-lms/database';
import { eq } from 'drizzle-orm';

describe('GET Endpoints E2E Tests with Faker Data', () => {
  let app: INestApplication;
  let db: ReturnType<typeof createTestDatabase>;
  let testUser: any;
  let testToken: string;
  let seededData: {
    userIds: number[];
    courseIds: number[];
    eventIds: number[];
    jobIds: number[];
    postIds: number[];
    planIds: number[];
    ticketIds: number[];
    commentIds: number[];
    notificationIds: number[];
  };

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      // Initialize test database
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

      // Create test user and get token
      testUser = await createUserAndGetToken(app, db, 'student');
      testToken = testUser.token!;

      // Seed test data using factories
      seededData = await seedTestData(db, testUser.id);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const errorStack = error?.stack || '';
      console.error('Test setup failed:', errorMessage);
      console.error('Stack:', errorStack);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    // Cleanup test data
    if (seededData) {
      await cleanupTestData(db, seededData);
    }
    await app.close();
  });

  describe('GET /api/v1/users', () => {
    it('should return all users without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toHaveProperty('id');
          expect(response.body.data[0]).toHaveProperty('email');
        }
      }
    });

    it('should return user by ID', async () => {
      if (seededData.userIds.length > 0) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${seededData.userIds[0]}`)
          .expect(HttpStatus.OK);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email');
      }
    });
  });

  describe('GET /api/v1/lms/courses', () => {
    it('should return all courses without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lms/courses')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return course by ID', async () => {
      if (seededData.courseIds.length > 0) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/lms/courses/${seededData.courseIds[0]}`)
          .expect(HttpStatus.OK);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /api/v1/events', () => {
    it('should return all events without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/events')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return event by ID', async () => {
      if (seededData.eventIds.length > 0) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/${seededData.eventIds[0]}`)
          .expect(HttpStatus.OK);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /api/v1/jobs', () => {
    it('should return all jobs without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/jobs')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return job by ID', async () => {
      if (seededData.jobIds.length > 0) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/jobs/${seededData.jobIds[0]}`)
          .expect(HttpStatus.OK);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /api/v1/social/posts', () => {
    it('should return all posts without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/social/posts')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/social/groups', () => {
    it('should return all groups without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/social/groups')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/social/pages', () => {
    it('should return all pages without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/social/pages')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/plans', () => {
    it('should return all plans without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/plans')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/subscriptions', () => {
    it('should return all subscriptions without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/tickets', () => {
    it('should return all tickets without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should return ticket by ID', async () => {
      if (seededData.ticketIds.length > 0) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/tickets/${seededData.ticketIds[0]}`)
          .set('Authorization', `Bearer ${testToken}`)
          .expect(HttpStatus.OK);

        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /api/v1/comments', () => {
    it('should return all comments without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comments')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return all notifications without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/lookup-types', () => {
    it('should return all lookup types without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lookup-types')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/lookups', () => {
    it('should return all lookups without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lookups')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/cms', () => {
    it('should return all CMS pages without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/cms')
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/media', () => {
    it('should return all media without errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/media')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      if (response.body.data) {
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });
});

// Helper functions
async function seedTestData(db: ReturnType<typeof createTestDatabase>, userId: number) {
  const data: any = {
    userIds: [],
    courseIds: [],
    eventIds: [],
    jobIds: [],
    postIds: [],
    planIds: [],
    ticketIds: [],
    commentIds: [],
    notificationIds: [],
  };

  // Get lookup IDs
  const studentRole = await getOrCreateLookup(db, 'user_role', 'student', 'Student');
  const activeStatus = await getOrCreateLookup(db, 'user_status', 'active', 'Active');
  const publishedStatus = await getOrCreateLookup(db, 'course_status', 'published', 'Published');
  const upcomingStatus = await getOrCreateLookup(db, 'event_status', 'upcoming', 'Upcoming');
  const openJobStatus = await getOrCreateLookup(db, 'job_status', 'open', 'Open');
  const textPostType = await getOrCreateLookup(db, 'post_type', 'text', 'Text');
  const publicVisibility = await getOrCreateLookup(db, 'visibility', 'public', 'Public');
  const openTicketStatus = await getOrCreateLookup(db, 'ticket_status', 'open', 'Open');
  const courseEnrolledNotification = await getOrCreateLookup(db, 'notification_type', 'course_enrolled', 'Course Enrolled');

  // Seed users
  for (let i = 0; i < 5; i++) {
    const userData = createUserFactory();
    const [user] = await db.insert(users).values({
      ...userData,
      roleId: studentRole.id,
      statusId: activeStatus.id,
    } ).returning();
    data.userIds.push(user.id);
  }

  // Seed courses (if instructor exists)
  if (data.userIds.length > 0) {
    for (let i = 0; i < 3; i++) {
      const courseData = createCourseFactory({ instructorId: data.userIds[0] });
      const [course] = await db.insert(courses).values({
        ...courseData,
        statusId: publishedStatus.id,
      } ).returning();
      data.courseIds.push(course.id);
    }
  }

  // Seed events
  for (let i = 0; i < 3; i++) {
    const eventData = createEventFactory({ createdBy: userId });
    const [event] = await db.insert(events).values({
      ...eventData,
      statusId: upcomingStatus.id,
      eventTypeId: upcomingStatus.id, // Using status as fallback
      isDeleted: false,
    } ).returning();
    data.eventIds.push(event.id);
  }

  // Seed jobs
  for (let i = 0; i < 3; i++) {
    const jobData = createJobFactory({ postedBy: userId });
    const [job] = await db.insert(jobs).values({
      ...jobData,
      statusId: openJobStatus.id,
      jobTypeId: openJobStatus.id, // Using status as fallback
      experienceLevelId: openJobStatus.id, // Using status as fallback
      isDeleted: false,
    } ).returning();
    data.jobIds.push(job.id);
  }

  // Seed posts
  for (let i = 0; i < 5; i++) {
    const postData = createPostFactory({ userId });
    const [post] = await db.insert(posts).values({
      ...postData,
      postTypeId: textPostType.id,
      visibilityId: publicVisibility.id,
      isDeleted: false,
    } ).returning();
    data.postIds.push(post.id);
  }

  // Seed plans
  for (let i = 0; i < 3; i++) {
    const planData = createPlanFactory();
    const [plan] = await db.insert(plans).values({
      ...planData,
      isActive: true,
      isDeleted: false,
    } ).returning();
    data.planIds.push(plan.id);
  }

  // Seed tickets
  for (let i = 0; i < 3; i++) {
    const ticketData = createTicketFactory({ userId });
    const [ticket] = await db.insert(tickets).values({
      ...ticketData,
      categoryId: openTicketStatus.id, // Using status as fallback
      priorityId: openTicketStatus.id, // Using status as fallback
      statusId: openTicketStatus.id,
      isDeleted: false,
    } ).returning();
    data.ticketIds.push(ticket.id);
  }

  // Seed comments
  if (data.postIds.length > 0) {
    for (let i = 0; i < 5; i++) {
      const commentData = createCommentFactory({
        userId,
        commentableType: 'post',
        commentableId: data.postIds[0],
      });
      const [comment] = await db.insert(comments).values({
        ...commentData,
        isDeleted: false,
      } ).returning();
      data.commentIds.push(comment.id);
    }
  }

  // Seed notifications
  for (let i = 0; i < 5; i++) {
    const notificationData = createNotificationFactory({ userId });
    const [notification] = await db.insert(notifications).values({
      ...notificationData,
      notificationTypeId: courseEnrolledNotification.id,
      isDeleted: false,
    } ).returning();
    data.notificationIds.push(notification.id);
  }

  return data;
}

async function cleanupTestData(
  db: ReturnType<typeof createTestDatabase>,
  data: any,
) {
  // Soft delete all test data
  if (data.userIds.length > 0) {
    await db.update(users).set({ isDeleted: true, deletedAt: new Date() } )
      .where(eq(users.id, data.userIds[0])); // Example - clean up properly
  }
  // Add more cleanup as needed
}
