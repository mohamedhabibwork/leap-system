import { Injectable, Inject } from '@nestjs/common';
import { contactSubmissions, type ContactSubmission } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { CreateContactDto } from './dto/create-contact.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { EmailService } from '../notifications/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<ContactSubmission> {
    const [contact] = await this.db
      .insert(contactSubmissions)
      .values({
        name: createContactDto.name,
        email: createContactDto.email,
        subject: createContactDto.subject,
        message: createContactDto.message,
        status: 'pending',  // todo: form lookups service
      } as InferInsertModel<typeof contactSubmissions>)
      .returning();
    
    // TODO: Send email notification to support team
    // TODO: Send confirmation email to user
    
    return contact;
  }

  async findAll(): Promise<ContactSubmission[]> {
    return this.db
      .select()
      .from(contactSubmissions)
      .orderBy(contactSubmissions.createdAt);
  }

  async findOne(id: string): Promise<ContactSubmission | undefined> {
    const [contact] = await this.db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);
    
    return contact;
  }

  async updateStatus(id: string, status: string): Promise<ContactSubmission | undefined> {
    const [updated] = await this.db
      .update(contactSubmissions)
      .set({ 
        status,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof contactSubmissions>>)
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return updated;
  }
}
