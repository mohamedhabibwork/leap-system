import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdsService } from '../ads.service';

@Injectable()
export class AdOwnershipGuard implements CanActivate {
  constructor(private readonly adsService: AdsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adId = parseInt(request.params.id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins can access any ad
    if (user.roles?.includes('admin')) {
      return true;
    }

    // Check if user owns the ad
    const ad = await this.adsService.findOne(adId);
    if (ad.createdBy !== user.id) {
      throw new ForbiddenException('You can only access your own ads');
    }

    return true;
  }
}
