import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class SubscriptionsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    findAll(): Promise<Subscription[]>;
    findOne(id: number): Promise<Subscription>;
    findByUser(userId: number): Promise<Subscription[]>;
    findActiveByUser(userId: number): Promise<Subscription | null>;
    update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription>;
    cancel(id: number): Promise<Subscription>;
    renew(id: number, endDate: string): Promise<Subscription>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=subscriptions.service.d.ts.map