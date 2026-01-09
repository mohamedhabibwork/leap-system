import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import { eq, and, sql, gte } from 'drizzle-orm';
import { subscriptions } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const [subscription] = await this.db
      .insert(subscriptions)
      .values(createSubscriptionDto as any)
      .returning();

    return subscription as any;
  }

  async findAll(): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isDeleted, false)) as any;
  }

  async findOne(id: number): Promise<Subscription> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.isDeleted, false)))
      .limit(1);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription as any;
  }

  async findByUser(userId: number): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.isDeleted, false)
        )
      ) as any;
  }

  async findActiveByUser(userId: number): Promise<Subscription | null> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.statusId, 1),
          eq(subscriptions.isDeleted, false),
          gte(subscriptions.endDate, new Date())
        )
      )
      .limit(1);

    return (subscription || null) as any;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    await this.findOne(id);

    const [updatedSubscription] = await this.db
      .update(subscriptions)
      .set(updateSubscriptionDto as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return updatedSubscription as any;
  }

  async cancel(id: number): Promise<Subscription> {
    await this.findOne(id);

    const [cancelledSubscription] = await this.db
      .update(subscriptions)
      .set({
        cancelledAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return cancelledSubscription as any;
  }

  async renew(id: number, endDate: string): Promise<Subscription> {
    await this.findOne(id);

    const [renewedSubscription] = await this.db
      .update(subscriptions)
      .set({
        endDate: new Date(endDate),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return renewedSubscription as any;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.db
      .update(subscriptions)
      .set({
        isDeleted: true,
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id));
  }
}
