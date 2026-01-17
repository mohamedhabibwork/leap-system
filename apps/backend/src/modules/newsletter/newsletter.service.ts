import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { newsletterSubscribers, type NewsletterSubscriber } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { EmailService } from '../notifications/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsletterService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async subscribe(subscribeDto: SubscribeNewsletterDto): Promise<NewsletterSubscriber> {
    // Check if email already exists
    const [existing] = await this.db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, subscribeDto.email))
      .limit(1);

    if (existing && existing.status === 'active') {
      throw new ConflictException('Email already subscribed');
    }

    if (existing) {
      // Reactivate if previously unsubscribed
      const [reactivated] = await this.db
        .update(newsletterSubscribers)
        .set({ 
          status: 'pending',
          unsubscribedAt: null,
        } as Partial<InferInsertModel<typeof newsletterSubscribers>>)
        .where(eq(newsletterSubscribers.email, subscribeDto.email))
        .returning();
      
      // Send confirmation email with double opt-in link
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
      await this.emailService.sendNewsletterConfirmationEmail(subscribeDto.email, {
        confirmationUrl: `${frontendUrl}/newsletter/confirm?email=${encodeURIComponent(subscribeDto.email)}`,
      });
      
      return reactivated;
    }

    // Create new subscriber
    const [subscriber] = await this.db
      .insert(newsletterSubscribers)
      .values({
        email: subscribeDto.email,
        status: 'pending',
      } as InferInsertModel<typeof newsletterSubscribers>)
      .returning();
    
    // TODO: Send confirmation email with double opt-in link
    
    return subscriber;
  }

  async confirm(email: string): Promise<NewsletterSubscriber | undefined> {
    const [confirmed] = await this.db
      .update(newsletterSubscribers)
      .set({ 
        status: 'active',
        confirmedAt: new Date(),
      } as Partial<InferInsertModel<typeof newsletterSubscribers>>)
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    
    return confirmed;
  }

  async unsubscribe(email: string): Promise<boolean> {
    const [unsubscribed] = await this.db
      .update(newsletterSubscribers)
      .set({ 
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      } as Partial<InferInsertModel<typeof newsletterSubscribers>>)
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    
    return !!unsubscribed;
  }
}
