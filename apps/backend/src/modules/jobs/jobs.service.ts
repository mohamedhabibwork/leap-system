import { Injectable, Inject } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { eq, and, sql, desc, like, or, gte, lte } from 'drizzle-orm';
import { jobs, jobApplications, favorites } from '@leap-lms/database';
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
    const job = await this.findOne(jobId);
    
    // Check if already applied
    const [existing] = await this.db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.userId, userId),
          eq(jobApplications.isDeleted, false)
        )
      )
      .limit(1);
    
    if (existing) {
      return { success: true, message: 'Already applied for this job' };
    }

    const [application] = await this.db.insert(jobApplications).values({
      jobId,
      userId,
      statusId: 1, // Applied/Pending
      ...applicationData,
    } as any).returning();

    // Increment application count
    await this.db.update(jobs)
      .set({ applicationCount: sql`${jobs.applicationCount} + 1` } as any)
      .where(eq(jobs.id, jobId));

    return { success: true, message: 'Applied for job successfully', data: application };
  }

  async getApplications(jobId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = and(
      eq(jobApplications.jobId, jobId),
      eq(jobApplications.isDeleted, false)
    );

    const results = await this.db
      .select()
      .from(jobApplications)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(jobApplications.appliedAt));

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobApplications)
      .where(where);

    return {
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
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

  async findByUser(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    const results = await this.db
      .select()
      .from(jobs)
      .where(and(eq(jobs.postedBy, userId), eq(jobs.isDeleted, false)))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data: results };
  }

  async findApplicationsByUser(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = and(
      eq(jobApplications.userId, userId),
      eq(jobApplications.isDeleted, false)
    );

    const results = await this.db
      .select()
      .from(jobApplications)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(jobApplications.appliedAt));

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobApplications)
      .where(where);

    return {
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findSavedJobs(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = and(
      eq(favorites.userId, userId),
      eq(favorites.favoritableType, 'job'),
      eq(favorites.isDeleted, false)
    );

    const results = await this.db
      .select({
        favoriteId: favorites.id,
        job: jobs,
      })
      .from(favorites)
      .innerJoin(jobs, eq(favorites.favoritableId, jobs.id))
      .where(where)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(favorites)
      .where(where);

    return {
      data: results.map(r => ({ ...r.job, favoriteId: r.favoriteId })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async saveJob(jobId: number, userId: number) {
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, 'job'),
          eq(favorites.favoritableId, jobId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);

    if (existing) {
      return { message: 'Job already saved' };
    }

    await this.db.insert(favorites).values({
      userId,
      favoritableType: 'job',
      favoritableId: jobId,
    } as any);

    // Increment favorite count on job
    await this.db.update(jobs)
      .set({ favoriteCount: sql`${jobs.favoriteCount} + 1` } as any)
      .where(eq(jobs.id, jobId));

    return { message: 'Job saved successfully' };
  }

  async unsaveJob(jobId: number, userId: number) {
    const [existing] = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.favoritableType, 'job'),
          eq(favorites.favoritableId, jobId),
          eq(favorites.isDeleted, false)
        )
      )
      .limit(1);

    if (!existing) {
      return { message: 'Job not saved' };
    }

    await this.db.update(favorites)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(favorites.id, existing.id));

    // Decrement favorite count on job
    await this.db.update(jobs)
      .set({ favoriteCount: sql`GREATEST(${jobs.favoriteCount} - 1, 0)` } as any)
      .where(eq(jobs.id, jobId));

    return { message: 'Job unsaved successfully' };
  }
}
