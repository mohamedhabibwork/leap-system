import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import { Media } from './entities/media.entity';
import { eq, and, sql, lt } from 'drizzle-orm';
import { mediaLibrary } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel } from 'drizzle-orm';

@Injectable()
export class MediaService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<InferSelectModel<typeof mediaLibrary>> {
    const [media] = await this.db
      .insert(mediaLibrary)
      .values({
        ...createMediaDto,
      })
      .returning();

    return media;
  }

  async findAll(): Promise<InferSelectModel<typeof mediaLibrary>[]> {
    return await this.db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.isDeleted, false));
  }

  async findOne(id: number): Promise<InferSelectModel<typeof mediaLibrary>> {
    const [media] = await this.db
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.id, id), eq(mediaLibrary.isDeleted, false)))
      .limit(1);

    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    return media;
  }

  async findByUploadable(uploadableType: string, uploadableId: number): Promise<InferSelectModel<typeof mediaLibrary>[]> {
    return await this.db
      .select()
      .from(mediaLibrary)
      .where(
        and(
          eq(mediaLibrary.mediableType, uploadableType),
          eq(mediaLibrary.mediableId, uploadableId),
          eq(mediaLibrary.isDeleted, false)
        )
      );
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<InferSelectModel<typeof mediaLibrary>> {
    await this.findOne(id);

    const [updatedMedia] = await this.db
      .update(mediaLibrary)
      .set({
        ...updateMediaDto,
      })
      .where(eq(mediaLibrary.id, id))
      .returning();

    return updatedMedia;
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.db
      .update(mediaLibrary)
      .set({
        downloadCount: sql`${mediaLibrary.downloadCount} + 1`,
      } )
      .where(eq(mediaLibrary.id, id));
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.db
      .update(mediaLibrary)
      .set({
        isDeleted: true,
      } )
      .where(eq(mediaLibrary.id, id));
  }

  async cleanupTemporaryFiles(): Promise<number> {
    // Delete temporary files older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.db
      .update(mediaLibrary)
      .set({
        isDeleted: true,
      } )
      .where(
        and(
          eq(mediaLibrary.isTemporary, true),
          lt(mediaLibrary.createdAt, twentyFourHoursAgo),
          eq(mediaLibrary.isDeleted, false)
        )
      )
      .returning();

    return result.length;
  }

  private detectMediaType(fileType: string): string {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('pdf') || fileType.includes('document')) return 'document';
    return 'other';
  }
}
