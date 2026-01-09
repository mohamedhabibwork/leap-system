import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdPermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins always have permission
    if (user.roles?.includes('admin')) {
      return true;
    }

    // Check if user has an active subscription
    // This is a placeholder - actual implementation should check subscription status
    // For now, we'll allow instructors and users with paid plans
    if (user.subscriptionStatus === 'active' || user.roles?.includes('instructor')) {
      return true;
    }

    throw new ForbiddenException('You need an active subscription to create ads');
  }
}
