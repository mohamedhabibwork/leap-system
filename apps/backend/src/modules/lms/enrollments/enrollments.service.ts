import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { eq, and, sql } from 'drizzle-orm';
import { enrollments } from '@leap-lms/database';
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
    const enrollment = await this.findOne(id);
    const [updated] = await this.db.update(enrollments).set(updateEnrollmentDto as any).where(eq(enrollments.id, id)).returning();
    
    // Check if course was just completed (completionPercentage changed to 100)
    if (updateEnrollmentDto.completionPercentage === 100 && enrollment.completionPercentage !== 100) {
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
}
