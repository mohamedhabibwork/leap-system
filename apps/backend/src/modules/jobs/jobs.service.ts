import { Injectable, Inject } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { eq, and } from 'drizzle-orm';
import { jobs } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class JobsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateJobDto) {
    const [job] = await this.db.insert(jobs).values(dto as any).returning();
    return job;
  }

  async findAll() {
    return await this.db.select().from(jobs).where(eq(jobs.isDeleted, false));
  }

  async findOne(id: number) {
    const [job] = await this.db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.isDeleted, false))).limit(1);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async update(id: number, dto: UpdateJobDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(jobs).set(dto).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(jobs).set({ isDeleted: true } as any).where(eq(jobs.id, id));
  }
}
