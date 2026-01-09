import { Injectable, Inject } from '@nestjs/common';
import { CreateShareDto } from './dto/create-share.dto';
import { eq, and, sql } from 'drizzle-orm';
import { shares } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SharesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(userId: number, dto: CreateShareDto) {
    const [share] = await this.db.insert(shares).values({ ...dto, userId: userId } as any).returning();
    return share;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(shares).where(and(eq(shares.userId, userId), eq(shares.isDeleted, false)));
  }

  async findByShareable(type: string, id: number) {
    return await this.db.select().from(shares).where(and(eq(shares.shareableType, type), eq(shares.shareableId, id), eq(shares.isDeleted, false)));
  }
}
