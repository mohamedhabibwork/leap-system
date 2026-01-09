import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { eq, and, sql } from 'drizzle-orm';
import { comments } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CommentsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const [comment] = await this.db.insert(comments).values({
      ...createCommentDto,
      userId: userId,
    } as any).returning();
    return comment;
  }

  async findByCommentable(type: string, id: number) {
    return await this.db.select().from(comments).where(
      and(
        eq(comments.commentableType, type),
        eq(comments.commentableId, id),
        eq(comments.isDeleted, false)
      )
    );
  }

  async findOne(id: number) {
    const [comment] = await this.db.select().from(comments).where(
      and(eq(comments.id, id), eq(comments.isDeleted, false))
    ).limit(1);
    if (!comment) throw new NotFoundException(`Comment with ID ${id} not found`);
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(comments).set({
      ...updateCommentDto,
    }).where(eq(comments.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(comments).set({
      isDeleted: true,
    } as any).where(eq(comments.id, id));
  }
}
