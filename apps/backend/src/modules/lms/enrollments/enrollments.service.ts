import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { eq, and, sql } from 'drizzle-orm';
import { enrollments } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class EnrollmentsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const [enrollment] = await this.db.insert(enrollments).values(createEnrollmentDto as any).returning();
    return enrollment;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(enrollments).where(
      and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false))
    );
  }

  async findByCourse(courseId: number) {
    return await this.db.select().from(enrollments).where(
      and(eq(enrollments.courseId, courseId), eq(enrollments.isDeleted, false))
    );
  }

  async findOne(id: number) {
    const [enrollment] = await this.db.select().from(enrollments).where(
      and(eq(enrollments.id, id), eq(enrollments.isDeleted, false))
    ).limit(1);
    if (!enrollment) throw new NotFoundException(`Enrollment with ID ${id} not found`);
    return enrollment;
  }

  async update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(enrollments).set(updateEnrollmentDto as any).where(eq(enrollments.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(enrollments).set({
      isDeleted: true,
    } as any).where(eq(enrollments.id, id));
  }
}
