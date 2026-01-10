import { Injectable, Inject } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { eq, and, sql, desc, like, or, gte, lte } from 'drizzle-orm';
import { jobs } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class JobsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateJobDto, userId: number) {
    // Prepare job data, excluding companyId if not provided
    const jobData: any = {
      titleEn: dto.titleEn,
      titleAr: dto.titleAr,
      slug: dto.slug,
      descriptionEn: dto.descriptionEn,
      descriptionAr: dto.descriptionAr,
      jobTypeId: dto.jobTypeId,
      experienceLevelId: dto.experienceLevelId,
      statusId: dto.statusId,
      location: dto.location,
      salaryRange: dto.salaryRange,
      postedBy: userId,
    };

    // Only add companyId if provided
    if (dto.companyId) {
      jobData.companyId = dto.companyId;
    }

    const [job] = await this.db.insert(jobs).values(jobData).returning();
    return job;
  }

  async findAll() {
    return await this.db.select().from(jobs).where(eq(jobs.isDeleted, false));
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 10, search, statusId, jobTypeId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(jobs.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(jobs.titleEn, `%${search}%`),
          like(jobs.titleAr, `%${search}%`)
        )
      );
    }

    if (statusId) {
      conditions.push(eq(jobs.statusId, statusId));
    }

    if (jobTypeId) {
      conditions.push(eq(jobs.jobTypeId, jobTypeId));
    }

    const results = await this.db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${jobs.statusId} = 1)`,
        closed: sql<number>`count(*) filter (where ${jobs.statusId} = 2)`,
      })
      .from(jobs)
      .where(eq(jobs.isDeleted, false));

    return {
      total: Number(stats.total),
      active: Number(stats.active),
      closed: Number(stats.closed),
    };
  }

  async findOne(id: number) {
    const [job] = await this.db.select().from(jobs).where(and(eq(jobs.id, id), eq(jobs.isDeleted, false))).limit(1);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async applyForJob(jobId: number, userId: number, applicationData: any) {
    // This would typically create a job application record
    // For now, just return success
    return { success: true, message: 'Applied for job successfully' };
  }

  async getApplications(jobId: number, query: any) {
    // This would typically fetch job applications
    // For now, return empty array
    return {
      data: [],
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async setFeatured(id: number, featured: boolean) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(jobs)
      .set({ isFeatured: featured } as any)
      .where(eq(jobs.id, id))
      .returning();
    return updated;
  }

  async update(id: number, dto: UpdateJobDto, userId?: number) {
    await this.findOne(id);
    const [updated] = await this.db.update(jobs).set(dto as any).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(jobs).set({ isDeleted: true, deletedAt: new Date() } as any).where(eq(jobs.id, id));
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;
    
    switch (operation) {
      case 'delete':
        await this.db
          .update(jobs)
          .set({ isDeleted: true, deletedAt: new Date() } as any)
          .where(sql`${jobs.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} jobs` };
      
      case 'activate':
        await this.db
          .update(jobs)
          .set({ statusId: 1 } as any)
          .where(sql`${jobs.id} = ANY(${ids})`);
        return { message: `Activated ${ids.length} jobs` };
      
      case 'deactivate':
        await this.db
          .update(jobs)
          .set({ statusId: 2 } as any)
          .where(sql`${jobs.id} = ANY(${ids})`);
        return { message: `Deactivated ${ids.length} jobs` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: any) {
    const { search, statusId, jobTypeId } = query;
    const conditions = [eq(jobs.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(jobs.titleEn, `%${search}%`),
          like(jobs.titleAr, `%${search}%`)
        )
      );
    }

    if (statusId) {
      conditions.push(eq(jobs.statusId, statusId));
    }

    if (jobTypeId) {
      conditions.push(eq(jobs.jobTypeId, jobTypeId));
    }

    const results = await this.db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));

    // Convert to CSV format
    const headers = ['ID', 'Title (EN)', 'Title (AR)', 'Location', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const job of results) {
      const row = [
        job.id,
        `"${job.titleEn?.replace(/"/g, '""') || ''}"`,
        `"${job.titleAr?.replace(/"/g, '""') || ''}"`,
        `"${job.location?.replace(/"/g, '""') || ''}"`,
        job.statusId,
        job.createdAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
