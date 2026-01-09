"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let InstructorService = class InstructorService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getDashboard(instructorId) {
        const instructorCourses = await this.db
            .select()
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
        const courseIds = instructorCourses.map((c) => c.id);
        const studentCount = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.enrollments.courseId} IN ${courseIds.length > 0 ? (0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(courseIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})` : (0, drizzle_orm_1.sql) `(NULL)`}`, (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
        const revenueResult = await this.db
            .select({ total: (0, drizzle_orm_1.sum)(database_1.enrollments.amountPaid) })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.enrollments.courseId} IN ${courseIds.length > 0 ? (0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(courseIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})` : (0, drizzle_orm_1.sql) `(NULL)`}`, (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
        const ratingResult = await this.db
            .select({ avgRating: (0, drizzle_orm_1.avg)(database_1.courseReviews.rating) })
            .from(database_1.courseReviews)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.courseReviews.courseId} IN ${courseIds.length > 0 ? (0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(courseIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})` : (0, drizzle_orm_1.sql) `(NULL)`}`, (0, drizzle_orm_1.eq)(database_1.courseReviews.isDeleted, false)));
        const pendingAssignmentsResult = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.assignmentSubmissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.isDeleted, false), (0, drizzle_orm_1.sql) `${database_1.assignmentSubmissions.gradedBy} IS NULL`));
        const upcomingSessions = await this.db
            .select({
            id: database_1.lessonSessions.id,
            uuid: database_1.lessonSessions.uuid,
            titleEn: database_1.lessonSessions.titleEn,
            titleAr: database_1.lessonSessions.titleAr,
            startTime: database_1.lessonSessions.startTime,
            endTime: database_1.lessonSessions.endTime,
            meetingUrl: database_1.lessonSessions.meetingUrl,
            attendanceCount: database_1.lessonSessions.attendanceCount,
        })
            .from(database_1.lessonSessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(database_1.lessonSessions.startTime, new Date()), (0, drizzle_orm_1.eq)(database_1.lessonSessions.isDeleted, false)))
            .orderBy(database_1.lessonSessions.startTime)
            .limit(5);
        return {
            totalCourses: instructorCourses.length,
            totalStudents: studentCount[0]?.count || 0,
            totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
            averageRating: parseFloat(ratingResult[0]?.avgRating || '0'),
            pendingAssignments: pendingAssignmentsResult[0]?.count || 0,
            upcomingSessions,
            recentActivity: [],
        };
    }
    async getInstructorCourses(instructorId) {
        const instructorCourses = await this.db
            .select({
            id: database_1.courses.id,
            uuid: database_1.courses.uuid,
            titleEn: database_1.courses.titleEn,
            titleAr: database_1.courses.titleAr,
            slug: database_1.courses.slug,
            thumbnailUrl: database_1.courses.thumbnailUrl,
            price: database_1.courses.price,
            isFeatured: database_1.courses.isFeatured,
            viewCount: database_1.courses.viewCount,
            createdAt: database_1.courses.createdAt,
            updatedAt: database_1.courses.updatedAt,
        })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.desc)(database_1.courses.createdAt));
        const coursesWithStats = await Promise.all(instructorCourses.map(async (course) => {
            const enrollmentCount = await this.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(database_1.enrollments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, course.id), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
            const reviewStats = await this.db
                .select({ avgRating: (0, drizzle_orm_1.avg)(database_1.courseReviews.rating) })
                .from(database_1.courseReviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courseReviews.courseId, course.id), (0, drizzle_orm_1.eq)(database_1.courseReviews.isDeleted, false)));
            return {
                ...course,
                enrollmentCount: enrollmentCount[0]?.count || 0,
                averageRating: parseFloat(reviewStats[0]?.avgRating || '0'),
            };
        }));
        return coursesWithStats;
    }
    async getCourseStudents(instructorId, courseId) {
        const course = await this.db
            .select()
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.id, courseId), (0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId)))
            .limit(1);
        if (!course.length) {
            throw new common_1.NotFoundException('Course not found or access denied');
        }
        const students = await this.db
            .select({
            userId: database_1.users.id,
            userName: database_1.users.username,
            userEmail: database_1.users.email,
            enrollmentId: database_1.enrollments.id,
            progressPercentage: database_1.enrollments.progressPercentage,
            enrolledAt: database_1.enrollments.enrolledAt,
            lastAccessedAt: database_1.enrollments.lastAccessedAt,
        })
            .from(database_1.enrollments)
            .innerJoin(database_1.users, (0, drizzle_orm_1.eq)(database_1.enrollments.userId, database_1.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.desc)(database_1.enrollments.enrolledAt));
        const lessonsCount = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courseSections.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.lessons.isDeleted, false), (0, drizzle_orm_1.eq)(database_1.courseSections.isDeleted, false)));
        const totalLessons = lessonsCount[0]?.count || 0;
        const studentsWithProgress = await Promise.all(students.map(async (student) => {
            const completedLessons = await this.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(database_1.lessonProgress)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lessonProgress.enrollmentId, student.enrollmentId), (0, drizzle_orm_1.eq)(database_1.lessonProgress.isCompleted, true), (0, drizzle_orm_1.eq)(database_1.lessonProgress.isDeleted, false)));
            return {
                ...student,
                completedLessons: completedLessons[0]?.count || 0,
                totalLessons,
            };
        }));
        return studentsWithProgress;
    }
    async getCourseAnalytics(instructorId, courseId) {
        const course = await this.db
            .select()
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.id, courseId), (0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId)))
            .limit(1);
        if (!course.length) {
            throw new common_1.NotFoundException('Course not found or access denied');
        }
        const enrollmentTrend = await this.db
            .select({
            month: (0, drizzle_orm_1.sql) `DATE_TRUNC('month', ${database_1.enrollments.enrolledAt})`,
            count: (0, drizzle_orm_1.count)(),
        })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false), (0, drizzle_orm_1.sql) `${database_1.enrollments.enrolledAt} >= NOW() - INTERVAL '12 months'`))
            .groupBy((0, drizzle_orm_1.sql) `DATE_TRUNC('month', ${database_1.enrollments.enrolledAt})`)
            .orderBy((0, drizzle_orm_1.sql) `DATE_TRUNC('month', ${database_1.enrollments.enrolledAt})`);
        const totalEnrollments = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false)));
        const completedEnrollments = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false), (0, drizzle_orm_1.sql) `${database_1.enrollments.completedAt} IS NOT NULL`));
        const completionRate = totalEnrollments[0]?.count > 0
            ? (completedEnrollments[0]?.count / totalEnrollments[0]?.count) * 100
            : 0;
        const ratingDistribution = await this.db
            .select({
            rating: database_1.courseReviews.rating,
            count: (0, drizzle_orm_1.count)(),
        })
            .from(database_1.courseReviews)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courseReviews.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.courseReviews.isDeleted, false)))
            .groupBy(database_1.courseReviews.rating)
            .orderBy(database_1.courseReviews.rating);
        const activeStudents = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(database_1.enrollments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.enrollments.courseId, courseId), (0, drizzle_orm_1.eq)(database_1.enrollments.isDeleted, false), (0, drizzle_orm_1.sql) `${database_1.enrollments.lastAccessedAt} >= NOW() - INTERVAL '30 days'`));
        const inactiveStudents = (totalEnrollments[0]?.count || 0) - (activeStudents[0]?.count || 0);
        return {
            courseId,
            enrollmentTrend,
            completionRate,
            averageQuizScores: [],
            studentEngagement: {
                active: activeStudents[0]?.count || 0,
                inactive: inactiveStudents,
            },
            revenueTrend: [],
            ratingDistribution,
        };
    }
    async getUpcomingSessions(instructorId) {
        const instructorCourses = await this.db
            .select({ id: database_1.courses.id })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
        const courseIds = instructorCourses.map((c) => c.id);
        if (courseIds.length === 0) {
            return [];
        }
        const sessions = await this.db
            .select({
            id: database_1.lessonSessions.id,
            uuid: database_1.lessonSessions.uuid,
            titleEn: database_1.lessonSessions.titleEn,
            titleAr: database_1.lessonSessions.titleAr,
            startTime: database_1.lessonSessions.startTime,
            endTime: database_1.lessonSessions.endTime,
            meetingUrl: database_1.lessonSessions.meetingUrl,
            attendanceCount: database_1.lessonSessions.attendanceCount,
            lessonId: database_1.lessons.id,
            lessonTitle: database_1.lessons.titleEn,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.lessonSessions)
            .innerJoin(database_1.lessons, (0, drizzle_orm_1.eq)(database_1.lessonSessions.lessonId, database_1.lessons.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${database_1.courses.id} IN ${(0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(courseIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`}`, (0, drizzle_orm_1.gte)(database_1.lessonSessions.startTime, new Date()), (0, drizzle_orm_1.eq)(database_1.lessonSessions.isDeleted, false)))
            .orderBy(database_1.lessonSessions.startTime)
            .limit(20);
        return sessions;
    }
    async getCalendarSessions(instructorId, startDate, endDate) {
        const instructorCourses = await this.db
            .select({ id: database_1.courses.id })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
        const courseIds = instructorCourses.map((c) => c.id);
        if (courseIds.length === 0) {
            return [];
        }
        const dateFilters = [
            (0, drizzle_orm_1.sql) `${database_1.courses.id} IN ${(0, drizzle_orm_1.sql) `(${drizzle_orm_1.sql.join(courseIds.map((id) => (0, drizzle_orm_1.sql) `${id}`), (0, drizzle_orm_1.sql) `, `)})`}`,
            (0, drizzle_orm_1.eq)(database_1.lessonSessions.isDeleted, false),
        ];
        if (startDate) {
            dateFilters.push((0, drizzle_orm_1.gte)(database_1.lessonSessions.startTime, startDate));
        }
        if (endDate) {
            dateFilters.push((0, drizzle_orm_1.sql) `${database_1.lessonSessions.startTime} <= ${endDate}`);
        }
        const sessions = await this.db
            .select({
            id: database_1.lessonSessions.id,
            uuid: database_1.lessonSessions.uuid,
            titleEn: database_1.lessonSessions.titleEn,
            titleAr: database_1.lessonSessions.titleAr,
            startTime: database_1.lessonSessions.startTime,
            endTime: database_1.lessonSessions.endTime,
            timezone: database_1.lessonSessions.timezone,
            meetingUrl: database_1.lessonSessions.meetingUrl,
            attendanceCount: database_1.lessonSessions.attendanceCount,
            maxAttendees: database_1.lessonSessions.maxAttendees,
            lessonId: database_1.lessons.id,
            lessonTitle: database_1.lessons.titleEn,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.lessonSessions)
            .innerJoin(database_1.lessons, (0, drizzle_orm_1.eq)(database_1.lessonSessions.lessonId, database_1.lessons.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)(...dateFilters))
            .orderBy(database_1.lessonSessions.startTime);
        return sessions;
    }
    async getPendingAssignments(instructorId) {
        const instructorCourses = await this.db
            .select({ id: database_1.courses.id })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
        const courseIds = instructorCourses.map((c) => c.id);
        if (courseIds.length === 0) {
            return [];
        }
        const pendingSubmissions = await this.db
            .select()
            .from(database_1.assignmentSubmissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.assignmentSubmissions.isDeleted, false), (0, drizzle_orm_1.sql) `${database_1.assignmentSubmissions.gradedBy} IS NULL`))
            .orderBy((0, drizzle_orm_1.desc)(database_1.assignmentSubmissions.submittedAt))
            .limit(50);
        return pendingSubmissions;
    }
    async getQuizAttempts(instructorId) {
        const instructorCourses = await this.db
            .select({ id: database_1.courses.id })
            .from(database_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.courses.instructorId, instructorId), (0, drizzle_orm_1.eq)(database_1.courses.isDeleted, false)));
        const courseIds = instructorCourses.map((c) => c.id);
        if (courseIds.length === 0) {
            return [];
        }
        const attempts = await this.db
            .select()
            .from(database_1.quizAttempts)
            .where((0, drizzle_orm_1.eq)(database_1.quizAttempts.isDeleted, false))
            .orderBy((0, drizzle_orm_1.desc)(database_1.quizAttempts.completedAt))
            .limit(50);
        return attempts;
    }
};
exports.InstructorService = InstructorService;
exports.InstructorService = InstructorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], InstructorService);
//# sourceMappingURL=instructor.service.js.map