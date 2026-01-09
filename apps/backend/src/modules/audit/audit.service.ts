import { Injectable, Inject } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { eq } from 'drizzle-orm';
import { auditLogs } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AuditService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateAuditDto) {
    const [log] = await this.db.insert(auditLogs).values(dto as any).returning();
    return log;
  }

  async findAll() {
    return await this.db.select().from(auditLogs).orderBy(auditLogs.createdAt);
  }

  async findOne(id: number) {
    const [log] = await this.db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1);
    if (!log) throw new Error('Audit log not found');
    return log;
  }

  async update(id: number, dto: any) {
    await this.findOne(id);
    const [updated] = await this.db.update(auditLogs).set(dto as any).where(eq(auditLogs.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.delete(auditLogs).where(eq(auditLogs.id, id));
  }

  async findByUser(userId: number) {
    return await this.db.select().from(auditLogs).where(eq(auditLogs.userId, userId));
  }
}
