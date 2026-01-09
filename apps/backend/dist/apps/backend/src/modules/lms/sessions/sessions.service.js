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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@leap-lms/database");
let SessionsService = class SessionsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(createSessionDto, instructorId) {
        const lesson = await this.db
            .select({
            lessonId: database_1.lessons.id,
            courseId: database_1.courses.id,
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.eq)(database_1.lessons.id, createSessionDto.lessonId))
            .limit(1);
        if (!lesson.length || lesson[0].instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to create sessions for this lesson');
        }
        const [session] = await this.db
            .insert(database_1.lessonSessions)
            .values({
            ...createSessionDto,
            startTime: new Date(createSessionDto.startTime),
            endTime: new Date(createSessionDto.endTime),
        })
            .returning();
        return session;
    }
    async findAll(filters) {
        const conditions = [(0, drizzle_orm_1.eq)(database_1.lessonSessions.isDeleted, false)];
        if (filters?.startDate) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.lessonSessions.startTime, filters.startDate));
        }
        if (filters?.endDate) {
            conditions.push((0, drizzle_orm_1.lte)(database_1.lessonSessions.startTime, filters.endDate));
        }
        if (filters?.statusId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.lessonSessions.statusId, filters.statusId));
        }
        let query = this.db
            .select({
            id: database_1.lessonSessions.id,
            uuid: database_1.lessonSessions.uuid,
            lessonId: database_1.lessonSessions.lessonId,
            titleEn: database_1.lessonSessions.titleEn,
            titleAr: database_1.lessonSessions.titleAr,
            startTime: database_1.lessonSessions.startTime,
            endTime: database_1.lessonSessions.endTime,
            timezone: database_1.lessonSessions.timezone,
            meetingUrl: database_1.lessonSessions.meetingUrl,
            maxAttendees: database_1.lessonSessions.maxAttendees,
            attendanceCount: database_1.lessonSessions.attendanceCount,
            statusId: database_1.lessonSessions.statusId,
            createdAt: database_1.lessonSessions.createdAt,
            lessonTitle: database_1.lessons.titleEn,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.lessonSessions)
            .innerJoin(database_1.lessons, (0, drizzle_orm_1.eq)(database_1.lessonSessions.lessonId, database_1.lessons.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id));
        if (filters?.courseId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.courses.id, filters.courseId));
        }
        return await query.where((0, drizzle_orm_1.and)(...conditions)).orderBy((0, drizzle_orm_1.desc)(database_1.lessonSessions.startTime));
    }
    async findOne(id) {
        const [session] = await this.db
            .select({
            id: database_1.lessonSessions.id,
            uuid: database_1.lessonSessions.uuid,
            lessonId: database_1.lessonSessions.lessonId,
            titleEn: database_1.lessonSessions.titleEn,
            titleAr: database_1.lessonSessions.titleAr,
            sessionTypeId: database_1.lessonSessions.sessionTypeId,
            startTime: database_1.lessonSessions.startTime,
            endTime: database_1.lessonSessions.endTime,
            timezone: database_1.lessonSessions.timezone,
            meetingUrl: database_1.lessonSessions.meetingUrl,
            meetingPassword: database_1.lessonSessions.meetingPassword,
            maxAttendees: database_1.lessonSessions.maxAttendees,
            descriptionEn: database_1.lessonSessions.descriptionEn,
            descriptionAr: database_1.lessonSessions.descriptionAr,
            recordingUrl: database_1.lessonSessions.recordingUrl,
            statusId: database_1.lessonSessions.statusId,
            attendanceCount: database_1.lessonSessions.attendanceCount,
            createdAt: database_1.lessonSessions.createdAt,
            updatedAt: database_1.lessonSessions.updatedAt,
            lessonTitle: database_1.lessons.titleEn,
            courseId: database_1.courses.id,
            courseName: database_1.courses.titleEn,
        })
            .from(database_1.lessonSessions)
            .innerJoin(database_1.lessons, (0, drizzle_orm_1.eq)(database_1.lessonSessions.lessonId, database_1.lessons.id))
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.lessonSessions.id, id), (0, drizzle_orm_1.eq)(database_1.lessonSessions.isDeleted, false)))
            .limit(1);
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        return session;
    }
    async update(id, updateSessionDto, instructorId) {
        const session = await this.findOne(id);
        const lesson = await this.db
            .select({
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.eq)(database_1.lessons.id, session.lessonId))
            .limit(1);
        if (!lesson.length || lesson[0].instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to update this session');
        }
        const updateData = { ...updateSessionDto };
        if (updateSessionDto.startTime) {
            updateData.startTime = new Date(updateSessionDto.startTime);
        }
        if (updateSessionDto.endTime) {
            updateData.endTime = new Date(updateSessionDto.endTime);
        }
        const [updated] = await this.db
            .update(database_1.lessonSessions)
            .set({ ...updateData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.lessonSessions.id, id))
            .returning();
        return updated;
    }
    async remove(id, instructorId) {
        const session = await this.findOne(id);
        const lesson = await this.db
            .select({
            instructorId: database_1.courses.instructorId,
        })
            .from(database_1.lessons)
            .innerJoin(database_1.courseSections, (0, drizzle_orm_1.eq)(database_1.lessons.sectionId, database_1.courseSections.id))
            .innerJoin(database_1.courses, (0, drizzle_orm_1.eq)(database_1.courseSections.courseId, database_1.courses.id))
            .where((0, drizzle_orm_1.eq)(database_1.lessons.id, session.lessonId))
            .limit(1);
        if (!lesson.length || lesson[0].instructorId !== instructorId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this session');
        }
        await this.db
            .update(database_1.lessonSessions)
            .set({ isDeleted: true, deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.lessonSessions.id, id));
        return { message: 'Session deleted successfully' };
    }
    async markAttendance(sessionId, attendanceDto) {
        await this.findOne(sessionId);
        const existing = await this.db
            .select()
            .from(database_1.sessionAttendees)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.sessionAttendees.sessionId, sessionId), (0, drizzle_orm_1.eq)(database_1.sessionAttendees.userId, attendanceDto.userId), (0, drizzle_orm_1.eq)(database_1.sessionAttendees.isDeleted, false)))
            .limit(1);
        if (existing.length > 0) {
            const [updated] = await this.db
                .update(database_1.sessionAttendees)
                .set({
                attendanceStatusId: attendanceDto.attendanceStatusId,
                joinedAt: attendanceDto.joinedAt ? new Date(attendanceDto.joinedAt) : undefined,
                leftAt: attendanceDto.leftAt ? new Date(attendanceDto.leftAt) : undefined,
                durationMinutes: attendanceDto.durationMinutes,
            })
                .where((0, drizzle_orm_1.eq)(database_1.sessionAttendees.id, existing[0].id))
                .returning();
            return updated;
        }
        else {
            const [attendance] = await this.db
                .insert(database_1.sessionAttendees)
                .values({
                sessionId,
                userId: attendanceDto.userId,
                enrollmentId: attendanceDto.enrollmentId,
                attendanceStatusId: attendanceDto.attendanceStatusId,
                joinedAt: attendanceDto.joinedAt ? new Date(attendanceDto.joinedAt) : undefined,
                leftAt: attendanceDto.leftAt ? new Date(attendanceDto.leftAt) : undefined,
                durationMinutes: attendanceDto.durationMinutes,
            })
                .returning();
            await this.db
                .update(database_1.lessonSessions)
                .set({
                attendanceCount: (0, drizzle_orm_1.sql) `${database_1.lessonSessions.attendanceCount} + 1`,
            })
                .where((0, drizzle_orm_1.eq)(database_1.lessonSessions.id, sessionId));
            return attendance;
        }
    }
    async getAttendees(sessionId) {
        await this.findOne(sessionId);
        const attendees = await this.db
            .select({
            id: database_1.sessionAttendees.id,
            userId: database_1.sessionAttendees.userId,
            userName: (0, drizzle_orm_1.sql) `users.username`,
            userEmail: (0, drizzle_orm_1.sql) `users.email`,
            attendanceStatusId: database_1.sessionAttendees.attendanceStatusId,
            joinedAt: database_1.sessionAttendees.joinedAt,
            leftAt: database_1.sessionAttendees.leftAt,
            durationMinutes: database_1.sessionAttendees.durationMinutes,
            createdAt: database_1.sessionAttendees.createdAt,
        })
            .from(database_1.sessionAttendees)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.sessionAttendees.sessionId, sessionId), (0, drizzle_orm_1.eq)(database_1.sessionAttendees.isDeleted, false)));
        return attendees;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map