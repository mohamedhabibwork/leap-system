import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<import("./entities/subscription.entity").Subscription>;
    findAll(): Promise<import("./entities/subscription.entity").Subscription[]>;
    getMySubscriptions(user: any): Promise<import("./entities/subscription.entity").Subscription[]>;
    getMyActiveSubscription(user: any): Promise<import("./entities/subscription.entity").Subscription>;
    findOne(id: number): Promise<import("./entities/subscription.entity").Subscription>;
    update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<import("./entities/subscription.entity").Subscription>;
    cancel(id: number): Promise<import("./entities/subscription.entity").Subscription>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=subscriptions.controller.d.ts.map