import { Injectable, Inject } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { eq, and } from 'drizzle-orm';
import { posts } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class PostsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreatePostDto) {
    const [post] = await this.db.insert(posts).values(dto as any).returning();
    return post;
  }

  async findAll() {
    return await this.db.select().from(posts).where(eq(posts.isDeleted, false));
  }

  async findByUser(userId: number) {
    return await this.db.select().from(posts).where(and(eq(posts.userId, userId), eq(posts.isDeleted, false)));
  }

  async findOne(id: number) {
    const [post] = await this.db.select().from(posts).where(and(eq(posts.id, id), eq(posts.isDeleted, false))).limit(1);
    if (!post) throw new Error('Post not found');
    return post;
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(posts).set(dto as any).where(eq(posts.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(posts).set({ isDeleted: true } as any).where(eq(posts.id, id));
  }
}
