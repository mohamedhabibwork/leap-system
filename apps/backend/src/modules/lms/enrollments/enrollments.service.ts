import { Injectable, NotFoundException, Inject, Logger, BadRequestException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { eq, and, sql, gt } from 'drizzle-orm';
import { enrollments, users, subscriptions, courses, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RabbitMQService } from '../../background-jobs/rabbitmq.service';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async findAll() {
    return await this.db
      .select()
      .from(enrollments)
      .where(eq(enrollments.isDeleted, false));
  }

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const [enrollment] = await this.db.insert(enrollments).values(createEnrollmentDto as any).returning();
    return enrollment;
  }

  async findByUser(userId: number) {
    const enrollmentsList = await this.db
      .select({
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false))
      );

    // Map to include course data
    return enrollmentsList.map((item) => ({
      ...item.enrollment,
      course: item.course,
      progress: item.enrollment.progressPercentage || 0,
    }));
  }

  async findByCourse(courseId: number) {
    return await this.db.select().from(enrollments).where(
      and(eq(enrollments.courseId, courseId), eq(enrollments.isDeleted, false))
    );
  }

  async findByUserAndCourse(userId: number, courseId: number) {
    // Use existing getActiveEnrollment method which handles expiration checks
    const enrollment = await this.getActiveEnrollment(userId, courseId);
    
    if (!enrollment) {
      return null;
    }
    
    // Calculate days remaining if expiresAt exists
    let daysRemaining: number | null = null;
    if (enrollment.expiresAt) {
      const now = new Date();
      const expires = new Date(enrollment.expiresAt);
      const diffTime = expires.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      ...enrollment,
      progressPercentage: Number(enrollment.progressPercentage || 0),
      daysRemaining,
    };
  }

  async findOne(id: number) {
    const [enrollment] = await this.db.select().from(enrollments).where(
      and(eq(enrollments.id, id), eq(enrollments.isDeleted, false))
    ).limit(1);
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${id} not found`);
    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.findOne(id);
    const [updated] = await this.db.update(enrollments).set(updateEnrollmentDto as any).where(eq(enrollments.id, id)).returning();
    
    // Check if course was just completed (progressPercentage changed to 100)
    const newProgressPercentage = updateEnrollmentDto.progressPercentage !== undefined 
      ? Number(updateEnrollmentDto.progressPercentage) 
      : null;
    const currentProgressPercentage = Number(enrollment.progressPercentage || 0);
    if (newProgressPercentage === 100 && currentProgressPercentage !== 100) {
      // Mark as completed if not already
      if (!updated.completedAt) {
        await this.db.update(enrollments).set({
          completedAt: new Date(),
        } as any).where(eq(enrollments.id, id));
      }
      
      // Queue certificate generation
      try {
        await this.rabbitMQService.generateCertificate(id);
        this.logger.log(`Certificate generation queued for enrollment ${id}`);
      } catch (error) {
        this.logger.error(`Failed to queue certificate generation:`, error);
      }
    }
    
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(enrollments).set({
      isDeleted: true,
    } as any).where(eq(enrollments.id, id));
  }

  /**
   * Check if user has access to a course
   * Returns true if user has active subscription or purchased the course
   */
  async checkAccess(userId: number, courseId: number): Promise<boolean> {
    // Check if user has active enrollment
    const enrollment = await this.getActiveEnrollment(userId, courseId);
    if (enrollment) {
      return true;
    }

    // Check if user has active subscription
    const [userData] = await this.db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        currentSubscriptionId: users.currentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userData && userData.subscriptionStatus === 'active') {
      if (
        !userData.subscriptionExpiresAt ||
        new Date(userData.subscriptionExpiresAt) > new Date()
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get active enrollment for user and course
   */
  async getActiveEnrollment(userId: number, courseId: number) {
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    if (!enrollment) {
      return null;
    }

    // Check if enrollment is not expired
    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      return null;
    }

    return enrollment;
  }

  /**
   * Create enrollment based on type (purchase, subscription, free, admin_granted)
   */
  async createEnrollment(
    userId: number,
    courseId: number,
    type: 'purchase' | 'subscription' | 'free' | 'admin_granted',
    data?: {
      subscriptionId?: number;
      amountPaid?: number;
      enrollmentTypeId?: number;
      statusId?: number;
    },
  ) {
    // Check if already enrolled
    const existing = await this.getActiveEnrollment(userId, courseId);
    if (existing) {
      throw new BadRequestException('User is already enrolled in this course');
    }

    // Get course details
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get lookup IDs for enrollment type and status
    // Default to 1 if lookups don't exist (should be seeded)
    let enrollmentTypeId = data?.enrollmentTypeId;
    let statusId = data?.statusId;

    if (!enrollmentTypeId || !statusId) {
      try {
        // Get enrollment type lookup
        const [enrollmentTypeLookupType] = await this.db
          .select()
          .from(lookupTypes)
          .where(eq(lookupTypes.code, 'enrollment_type'))
          .limit(1);

        if (enrollmentTypeLookupType && !enrollmentTypeId) {
          const [purchaseLookup] = await this.db
            .select()
            .from(lookups)
            .where(
              and(
                eq(lookups.lookupTypeId, enrollmentTypeLookupType.id),
                eq(lookups.code, type === 'purchase' ? 'purchase' : type === 'subscription' ? 'subscription' : 'purchase')
              )
            )
            .limit(1);
          enrollmentTypeId = purchaseLookup?.id || 1;
        } else {
          enrollmentTypeId = enrollmentTypeId || 1;
        }

        // Get enrollment status lookup (default to 'active')
        const [enrollmentStatusLookupType] = await this.db
          .select()
          .from(lookupTypes)
          .where(eq(lookupTypes.code, 'enrollment_status'))
          .limit(1);

        if (enrollmentStatusLookupType && !statusId) {
          const [activeStatusLookup] = await this.db
            .select()
            .from(lookups)
            .where(
              and(
                eq(lookups.lookupTypeId, enrollmentStatusLookupType.id),
                eq(lookups.code, 'active')
              )
            )
            .limit(1);
          statusId = activeStatusLookup?.id || 1;
        } else {
          statusId = statusId || 1;
        }
      } catch (error) {
        // Fallback to defaults if lookup query fails
        this.logger.warn('Failed to get lookup IDs, using defaults:', error);
        enrollmentTypeId = enrollmentTypeId || 1;
        statusId = statusId || 1;
      }
    }

    // Prepare enrollment data - ensure all values are defined
    // Note: subscriptionId is only included for subscription type enrollments
    let enrollmentData: Record<string, any> = {
      userId: Number(userId),
      courseId: Number(courseId),
      enrollmentType: String(type),
      enrollmentTypeId: Number(enrollmentTypeId),
      statusId: Number(statusId),
      enrolledAt: new Date(),
      progressPercentage: '0',
    };
    // Do NOT include subscriptionId here - it will be added only for subscription type

    // Handle different enrollment types
    switch (type) {
      case 'subscription':
        // Verify user has active subscription
        const [userData] = await this.db
          .select({
            currentSubscriptionId: users.currentSubscriptionId,
            subscriptionStatus: users.subscriptionStatus,
            subscriptionExpiresAt: users.subscriptionExpiresAt,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!userData || userData.subscriptionStatus !== 'active') {
          throw new BadRequestException('User does not have an active subscription');
        }

        enrollmentData.subscriptionId = data?.subscriptionId || userData.currentSubscriptionId;
        enrollmentData.amountPaid = '0'; // No direct payment for subscription enrollments
        
        // Set expiration to match subscription expiration
        if (userData.subscriptionExpiresAt) {
          enrollmentData.expiresAt = userData.subscriptionExpiresAt;
        }
        break;

      case 'purchase':
        // Convert amountPaid to string (decimal type requires string)
        // Ensure we always have a valid value, never undefined
        if (data?.amountPaid !== undefined && data?.amountPaid !== null) {
          enrollmentData.amountPaid = String(data.amountPaid);
        } else if (course.price !== undefined && course.price !== null) {
          enrollmentData.amountPaid = String(course.price);
        } else {
          enrollmentData.amountPaid = '0';
        }
        // Explicitly delete subscriptionId to ensure it's not included in insert
        delete enrollmentData.subscriptionId;
        // No expiration for purchased courses
        break;

      case 'free':
        enrollmentData.amountPaid = '0';
        // Explicitly delete subscriptionId to ensure it's not included in insert
        delete enrollmentData.subscriptionId;
        // Check if course is actually free
        if (course.price !== '0' && course.price !== null) {
          throw new BadRequestException('This course is not free');
        }
        break;

      case 'admin_granted':
        enrollmentData.amountPaid = '0';
        // Explicitly delete subscriptionId to ensure it's not included in insert
        delete enrollmentData.subscriptionId;
        // No expiration for admin-granted enrollments
        break;
    }

    // Final cleanup: ensure subscriptionId is completely removed for non-subscription types
    // This prevents foreign key constraint violations
    if (type !== 'subscription') {
      // Create a new object without subscriptionId to ensure it's not included in the insert
      const { subscriptionId: _, ...cleanEnrollmentData } = enrollmentData;
      
      // Log enrollment data for debugging (remove in production)
      this.logger.debug(`Creating ${type} enrollment for user ${userId}, course ${courseId}`);

      const [enrollment] = await this.db
        .insert(enrollments)
        .values(cleanEnrollmentData)
        .returning();

      this.logger.log(`User ${userId} enrolled in course ${courseId} via ${type}`);
      return enrollment;
    }

    // For subscription type, use enrollmentData as-is (includes subscriptionId)
    // Log enrollment data for debugging (remove in production)
    this.logger.debug(`Creating ${type} enrollment for user ${userId}, course ${courseId}`);

    const [enrollment] = await this.db
      .insert(enrollments)
      .values(enrollmentData)
      .returning();

    this.logger.log(`User ${userId} enrolled in course ${courseId} via ${type}`);

    return enrollment;
  }
}
