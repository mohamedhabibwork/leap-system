import { Injectable, NotFoundException, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';
import { CourseReviewQueryDto } from './dto/course-review-query.dto';
import { QueryParams } from '../../../common/types/request.types';
import { eq, and, sql, desc, count, avg, sum, or, ilike, inArray } from 'drizzle-orm';
import { 
  courses, 
  enrollments, 
  courseReviews, 
  users, 
  lessonProgress, 
  lessons, 
  courseSections, 
  courseCategories,
  tags,
  courseTags,
  favorites,
} from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { generateSlug } from '../../../common/utils/slug.util';

@Injectable()
export class CoursesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(createCourseDto: CreateCourseDto & { tags?: string[]; requirements?: string[]; learningOutcomes?: string[] }) {
    // Extract tags, requirements, and learning outcomes from DTO
    const { tags: tagNames, requirements, learningOutcomes, ...courseData } = createCourseDto;
    
    // Prepare course data with all fields (including requirementsEn and objectivesEn)
    const courseInsertData: Partial<InferSelectModel<typeof courses>> = {
      ...courseData,
    };
    
    // Handle requirements - convert array to newline-separated string
    if (requirements && Array.isArray(requirements) && requirements.length > 0) {
      courseInsertData.requirementsEn = requirements.join('\n');
    }
    
    // Handle learning outcomes - convert array to newline-separated string and store in objectivesEn
    if (learningOutcomes && Array.isArray(learningOutcomes) && learningOutcomes.length > 0) {
      courseInsertData.objectivesEn = learningOutcomes.join('\n');
    }

    // Insert course
    const [course] = await this.db.insert(courses).values(courseInsertData).returning();

    // Handle tags if provided
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
      await this.attachTagsToCourse(course.id, tagNames);
    }

    return course;
  }

  private async attachTagsToCourse(courseId: number, tagNames: string[]) {
    // Process each tag name
    for (const tagName of tagNames) {
      const trimmedName = tagName.trim().toLowerCase();
      if (!trimmedName) continue;

      // Generate slug from tag name
      const slug = generateSlug(trimmedName);

      // Find or create tag
      let [tag] = await this.db
        .select()
        .from(tags)
        .where(and(eq(tags.name, trimmedName), eq(tags.isDeleted, false)))
        .limit(1);

      if (!tag) {
        // Create new tag (usageCount has default value, so we don't need to set it)
        [tag] = await this.db
          .insert(tags)
          .values({
            name: trimmedName,
            slug: slug,
          } )
          .returning();
      }

      // Check if course-tag relationship already exists
      const [existingRelation] = await this.db
        .select()
        .from(courseTags)
        .where(and(eq(courseTags.courseId, courseId), eq(courseTags.tagId, tag.id)))
        .limit(1);

      if (!existingRelation) {
        // Create course-tag relationship
        await this.db.insert(courseTags).values({
          courseId: courseId,
          tagId: tag.id,
        } );

        // Increment tag usage count
        await this.db
          .update(tags)
          .set({ usageCount: sql<number>`${tags.usageCount} + 1` } as Partial<InferInsertModel<typeof tags>>)
          .where(eq(tags.id, tag.id));
      }
    }
  }

  async findAll(page: number = 1, limit: number = 10, sort: string = 'desc', search?: string, sortBy: string = 'createdAt', category?: string, userId?: number) {
    const offset = (page - 1) * limit;
    
    const conditions = [eq(courses.isDeleted, false)];
    
    // Add search condition if provided
    if (search && search.trim()) {
      conditions.push(
        sql`(${courses.titleEn} ILIKE ${`%${search.trim()}%`} OR ${courses.titleAr} ILIKE ${`%${search.trim()}%`} OR ${courses.descriptionEn} ILIKE ${`%${search.trim()}%`} OR ${courses.descriptionAr} ILIKE ${`%${search.trim()}%`})`
      );
    }
    
    // Add category filter if provided
    if (category && category.trim()) {
      // Look up category by slug
      const [categoryRecord] = await this.db
        .select({ id: courseCategories.id })
        .from(courseCategories)
        .where(and(
          eq(courseCategories.slug, category.trim()),
          eq(courseCategories.isDeleted, false),
          eq(courseCategories.isActive, true)
        ))
        .limit(1);
      
      if (categoryRecord) {
        conditions.push(eq(courses.categoryId, categoryRecord.id));
      }
    }
    
    // Build order by clause based on sortBy parameter
    let orderByClause;
    if (sortBy === 'popular') {
      // Use viewCount as popularity metric
      orderByClause = sort === 'asc' ? sql`${courses.viewCount} ASC` : sql`${courses.viewCount} DESC`;
    } else if (sortBy === 'title') {
      orderByClause = sort === 'asc' ? sql`${courses.titleEn} ASC` : sql`${courses.titleEn} DESC`;
    } else if (sortBy === 'price') {
      orderByClause = sort === 'asc' ? sql`${courses.price} ASC NULLS LAST` : sql`${courses.price} DESC NULLS LAST`;
    } else {
      // Default to createdAt
      orderByClause = sort === 'asc' ? sql`${courses.createdAt} ASC` : sql`${courses.createdAt} DESC`;
    }
    
    const results = await this.db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    
    // If userId is provided, check favorite status for each course
    let resultsWithFavorites = results;
    if (userId) {
      const courseIds = results.map((c: any) => c.id);
      if (courseIds.length > 0) {
        const userFavorites = await this.db
          .select()
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.favoritableType, 'course'),
              inArray(favorites.favoritableId, courseIds),
              eq(favorites.isDeleted, false)
            )
          );
        
        const favoritedCourseIds = new Set(userFavorites.map((f: any) => f.favoritableId));
        resultsWithFavorites = results.map((course: any) => ({
          ...course,
          isFavorited: favoritedCourseIds.has(course.id),
        }));
      }
    }
    
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(...conditions));
    
    return {
      data: resultsWithFavorites,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findPublished() {
    return await this.db.select().from(courses).where(
      and(eq(courses.isDeleted, false))
    );
  }

  async findOne(id: number, userId?: number) {
    const [course] = await this.db.select().from(courses).where(
      and(eq(courses.id, id), eq(courses.isDeleted, false))
    ).limit(1);
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    
    // Check if user has favorited this course
    if (userId) {
      const [favorite] = await this.db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.favoritableType, 'course'),
            eq(favorites.favoritableId, id),
            eq(favorites.isDeleted, false)
          )
        )
        .limit(1);
      
      return {
        ...course,
        isFavorited: !!favorite,
      };
    }
    
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(courses).set(updateCourseDto ).where(eq(courses.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(courses).set({
      isDeleted: true,
      deletedAt: new Date(),
    } as Partial<InferSelectModel<typeof courses>>).where(eq(courses.id, id));
  }

  async findByInstructor(instructorId: number, query?: any) {
    const { page = 1, limit = 10 } = query || {};
    const offset = (page - 1) * limit;
    
    const results = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)))
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);
    
    return results;
  }

  async enrollStudent(courseId: number, userId: number, enrollmentData: any) {
    // Check if course exists
    const course = await this.findOne(courseId);
    
    // Check if already enrolled
    const existing = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)))
      .limit(1);
    
    if (existing.length > 0) {
      throw new BadRequestException('Already enrolled in this course');
    }
    
    // Create enrollment
    const [enrollment] = await this.db.insert(enrollments).values({
      userId,
      courseId,
      enrollmentTypeId: enrollmentData.enrollmentTypeId || 1,
      statusId: enrollmentData.statusId || 1,
      amountPaid: enrollmentData.amountPaid || course.price || 0,
      enrolledAt: new Date(),
    } ).returning();
    
    return enrollment;
  }

  async unenrollStudent(courseId: number, userId: number) {
    const existing = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)))
      .limit(1);
    
    if (existing.length === 0) {
      throw new NotFoundException('Enrollment not found');
    }
    
    await this.db.update(enrollments).set({ isDeleted: true } ).where(eq(enrollments.id, existing[0].id));
    
    return { message: 'Unenrolled successfully' };
  }

  async markLessonComplete(courseId: number, lessonId: number, userId: number) {
    // Get enrollment
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)))
      .limit(1);
    
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    
    // Check if already completed
    const [existing] = await this.db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.enrollmentId, enrollment.id), eq(lessonProgress.lessonId, lessonId)))
      .limit(1);
    
    if (existing) {
      if (!existing.isCompleted) {
        await this.db.update(lessonProgress).set({
          isCompleted: true,
          completedAt: new Date(),
        } ).where(eq(lessonProgress.id, existing.id));
      }
    } else {
      await this.db.insert(lessonProgress).values({
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      } );
    }
    
    // Update enrollment progress
    await this.updateEnrollmentProgress(enrollment.id, courseId);
    
    return { message: 'Lesson marked as complete' };
  }

  private async updateEnrollmentProgress(enrollmentId: number, courseId: number) {
    // Get total lessons
    const totalLessons = await this.db
      .select({ count: count() })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(and(eq(courseSections.courseId, courseId), eq(lessons.isDeleted, false), eq(courseSections.isDeleted, false)));
    
    // Get completed lessons
    const completedLessons = await this.db
      .select({ count: count() })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.enrollmentId, enrollmentId), eq(lessonProgress.isCompleted, true)));
    
    const total = totalLessons[0]?.count || 0;
    const completed = completedLessons[0]?.count || 0;
    
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
    
    await this.db.update(enrollments).set({
      progressPercentage: progressPercentage.toString(),
    } ).where(eq(enrollments.id, enrollmentId));
  }

  async getCourseReviews(courseId: number, query: CourseReviewQueryDto) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    const reviews = await this.db
      .select({
        id: courseReviews.id,
        courseId: courseReviews.courseId,
        userId: courseReviews.userId,
        rating: courseReviews.rating,
        reviewText: courseReviews.reviewText,
        createdAt: courseReviews.createdAt,
        updatedAt: courseReviews.updatedAt,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(courseReviews)
      .innerJoin(users, eq(courseReviews.userId, users.id))
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.isDeleted, false)))
      .orderBy(desc(courseReviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    return reviews;
  }

  async submitReview(courseId: number, userId: number, reviewDto: CreateCourseReviewDto) {
    // Check if already reviewed
    const existing = await this.db
      .select()
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.userId, userId), eq(courseReviews.isDeleted, false)))
      .limit(1);
    
    if (existing.length > 0) {
      throw new BadRequestException('You have already reviewed this course');
    }
    
    const [review] = await this.db.insert(courseReviews).values({
      courseId: courseId as number,
      userId,
      rating: reviewDto.rating as number,
      reviewText: reviewDto.comment || reviewDto.reviewText,
    }).returning();
    
    return review;
  }

  async updateReview(reviewId: number, userId: number, reviewDto: any) {
    const [review] = await this.db
      .select()
      .from(courseReviews)
      .where(and(eq(courseReviews.id, reviewId), eq(courseReviews.isDeleted, false)))
      .limit(1);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }
    
    const [updated] = await this.db.update(courseReviews).set({
      rating: reviewDto.rating as number,
      reviewText: reviewDto.comment || reviewDto.reviewText,
      updatedAt: new Date(),
    } as Partial<InferSelectModel<typeof courseReviews>>).where(eq(courseReviews.id, reviewId)).returning();
    
    return updated;
  }

  async deleteReview(reviewId: number, userId: number) {
    const [review] = await this.db
      .select()
      .from(courseReviews)
      .where(and(eq(courseReviews.id, reviewId), eq(courseReviews.isDeleted, false)))
      .limit(1);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    
    await this.db.update(courseReviews).set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof courseReviews>>).where(eq(courseReviews.id, reviewId));
    
    return { message: 'Review deleted successfully' };
  }

  async featureCourse(courseId: number, isFeatured: boolean) {
    await this.findOne(courseId);
    
    await this.db.update(courses).set({ isFeatured: isFeatured as boolean } as Partial<InferSelectModel<typeof courses>>).where(eq(courses.id, courseId));
    
    return { message: isFeatured ? 'Course featured' : 'Course unfeatured' };
  }

  async getStatistics(userId: number, userRole: string) {
    let courseIds: number[] = [];
    
    // If instructor, get only their courses
    if (userRole === 'instructor') {
      const instructorCourses = await this.db
        .select({ id: courses.id })
        .from(courses)
        .where(and(eq(courses.instructorId, userId), eq(courses.isDeleted, false)));
      
      courseIds = instructorCourses.map((c) => c.id);
    } else {
      // Admin can see all courses
      const allCourses = await this.db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.isDeleted, false));
      
      courseIds = allCourses.map((c) => c.id);
    }
    
    // Get statistics
    const totalCourses = courseIds.length;
    
    const enrollmentStats = courseIds.length > 0 ? await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(sql`${enrollments.courseId} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`)
      : [{ count: 0 }];
    
    const revenueStats = courseIds.length > 0 ? await this.db
      .select({ total: sum(enrollments.amountPaid) })
      .from(enrollments)
      .where(sql`${enrollments.courseId} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`)
      : [{ total: '0' }];
    
    const avgRatingStats = courseIds.length > 0 ? await this.db
      .select({ avgRating: avg(courseReviews.rating) })
      .from(courseReviews)
      .where(sql`${courseReviews.courseId} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`)
      : [{ avgRating: null }];
    
    return {
      totalCourses,
      totalEnrollments: enrollmentStats[0]?.count || 0,
      totalRevenue: parseFloat(revenueStats[0]?.total?.toString() || '0'),
      averageRating: parseFloat(avgRatingStats[0]?.avgRating?.toString() || '0'),
    };
  }

  async exportToCsv(query: QueryParams) {
    const allCourses = await this.db
      .select({
        id: courses.id,
        title: courses.titleEn,
        slug: courses.slug,
        instructorId: courses.instructorId,
        price: courses.price,
        isFeatured: courses.isFeatured,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(eq(courses.isDeleted, false))
      .orderBy(desc(courses.createdAt));
    
    // Generate CSV
    const headers = ['ID', 'Title', 'Slug', 'Instructor ID', 'Price', 'Featured', 'Views', 'Created At'];
    const rows = allCourses.map((course) => [
      course.id,
      `"${course.title?.replace(/"/g, '""') || ''}"`,
      course.slug,
      course.instructorId,
      course.price || 0,
      course.isFeatured ? 'Yes' : 'No',
      course.viewCount || 0,
      course.createdAt?.toISOString() || '',
    ]);
    
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    
    return csv;
  }
}
