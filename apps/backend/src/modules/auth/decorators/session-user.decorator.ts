import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * SessionUser Decorator
 * 
 * Extracts the current user from the request object.
 * The user is attached by the SessionAuthGuard.
 * 
 * Usage:
 * @Get('profile')
 * @UseGuards(SessionAuthGuard)
 * async getProfile(@SessionUser() user: any) {
 *   return user;
 * }
 * 
 * You can also extract specific user properties:
 * @Get('profile')
 * @UseGuards(SessionAuthGuard)
 * async getProfile(@SessionUser('id') userId: number) {
 *   return { userId };
 * }
 */
export const SessionUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);

/**
 * SessionData Decorator
 * 
 * Extracts the session data from the request object.
 * The session is attached by the SessionAuthGuard.
 * 
 * Usage:
 * @Get('session-info')
 * @UseGuards(SessionAuthGuard)
 * async getSessionInfo(@SessionData() session: any) {
 *   return session;
 * }
 */
export const SessionData = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const session = request.session;

    if (!session) {
      return undefined;
    }

    return data ? session[data] : session;
  },
);

/**
 * SessionToken Decorator
 * 
 * Extracts the session token from the request object.
 * 
 * Usage:
 * @Post('logout')
 * @UseGuards(SessionAuthGuard)
 * async logout(@SessionToken() token: string) {
 *   await this.authService.logout(token);
 * }
 */
export const SessionToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.sessionToken;
  },
);
