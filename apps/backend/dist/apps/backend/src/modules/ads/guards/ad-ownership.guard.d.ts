import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AdsService } from '../ads.service';
export declare class AdOwnershipGuard implements CanActivate {
    private readonly adsService;
    constructor(adsService: AdsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=ad-ownership.guard.d.ts.map