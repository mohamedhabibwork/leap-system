import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { reports, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto, ReportAction } from './dto/review-report.dto';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateReportDto, userId: number) {
    // Get report type lookup (default to 'content_report')
    const [reportType] = await this.db
      .select()
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'report_type'),
        eq(lookups.code, 'content_report')
      ))
      .limit(1);

    if (!reportType) {
      throw new Error('Report type lookup not found');
    }

    // Get status lookup (default to 'pending')
    const [status] = await this.db
      .select()
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'report_status'),
        eq(lookups.code, 'pending')
      ))
      .limit(1);

    if (!status) {
      throw new Error('Report status lookup not found');
    }

    const [report] = await this.db
      .insert(reports)
      .values({
        reportedBy: userId,
        reportTypeId: reportType.id,
        statusId: status.id,
        reportableType: dto.entityType,
        reportableId: dto.entityId,
        reason: dto.reason + (dto.details ? `\n\nDetails: ${dto.details}` : ''),
      } as any)
      .returning();

    // Notify admins
    await this.notificationsService.sendMultiChannelNotification({
      userId: 0, // Will notify all admins
      notificationTypeId: 0, // Will be set by service
      title: 'New Report Submitted',
      message: `${dto.entityType} reported: ${dto.reason}`,
      linkUrl: `/admin/moderation`,
      channels: ['database', 'websocket'],
    });

    return report;
  }

  async findAllAdmin(query: AdminReportQueryDto) {
    const { page = 1, limit = 10, search, status, reportableType, reportedBy, dateFrom, dateTo } = query;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(reports.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          ilike(reports.reason, `%${search}%`),
          ilike(reports.adminNotes, `%${search}%`)
        )
      );
    }

    if (reportableType) {
      conditions.push(eq(reports.reportableType, reportableType));
    }

    if (reportedBy) {
      conditions.push(eq(reports.reportedBy, reportedBy));
    }

    if (dateFrom) {
      conditions.push(sql`${reports.createdAt} >= ${new Date(dateFrom)}`);
    }

    if (dateTo) {
      conditions.push(sql`${reports.createdAt} <= ${new Date(dateTo)}`);
    }

    // Filter by status if provided
    if (status) {
      const [statusLookup] = await this.db
        .select()
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'report_status'),
          eq(lookups.code, status)
        ))
        .limit(1);

      if (statusLookup) {
        conditions.push(eq(reports.statusId, statusLookup.id));
      }
    }

    const results = await this.db
      .select({
        id: reports.id,
        uuid: reports.uuid,
        reportedBy: reports.reportedBy,
        reportTypeId: reports.reportTypeId,
        statusId: reports.statusId,
        reportableType: reports.reportableType,
        reportableId: reports.reportableId,
        reason: reports.reason,
        adminNotes: reports.adminNotes,
        reviewedBy: reports.reviewedBy,
        reviewedAt: reports.reviewedAt,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(reports)
      .leftJoin(users, eq(reports.reportedBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
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
        pending: sql<number>`count(*) filter (where status_id = (SELECT id FROM lookups WHERE code = 'pending' AND lookup_type_id = (SELECT id FROM lookup_types WHERE code = 'report_status')))`,
        approved: sql<number>`count(*) filter (where status_id = (SELECT id FROM lookups WHERE code = 'approved' AND lookup_type_id = (SELECT id FROM lookup_types WHERE code = 'report_status')))`,
        rejected: sql<number>`count(*) filter (where status_id = (SELECT id FROM lookups WHERE code = 'rejected' AND lookup_type_id = (SELECT id FROM lookup_types WHERE code = 'report_status')))`,
        today: sql<number>`count(*) filter (where DATE(created_at) = CURRENT_DATE)`,
      })
      .from(reports)
      .where(eq(reports.isDeleted, false));

    return {
      pending: Number(stats.pending || 0),
      approved: Number(stats.approved || 0),
      rejected: Number(stats.rejected || 0),
      today: Number(stats.today || 0),
      total: Number(stats.total || 0),
    };
  }

  async findOne(id: number) {
    const [report] = await this.db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.isDeleted, false)))
      .limit(1);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async review(id: number, dto: ReviewReportDto, reviewerId: number) {
    const report = await this.findOne(id);

    // Get status lookup
    const statusCode = dto.action === ReportAction.APPROVE ? 'approved' : 'rejected';
    const [statusLookup] = await this.db
      .select()
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'report_status'),
        eq(lookups.code, statusCode)
      ))
      .limit(1);

    if (!statusLookup) {
      throw new Error('Status lookup not found');
    }

    const [updated] = await this.db
      .update(reports)
      .set({
        statusId: statusLookup.id,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        adminNotes: dto.note,
        updatedAt: new Date(),
      } as any)
      .where(eq(reports.id, id))
      .returning();

    // If approved, take action on the reported content
    if (dto.action === ReportAction.APPROVE) {
      // TODO: Implement content removal/hiding based on reportableType
      this.logger.log(`Taking action on ${report.reportableType} ${report.reportableId}`);
    }

    return updated;
  }

  async remove(id: number) {
    await this.db
      .update(reports)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(reports.id, id));
  }
}
