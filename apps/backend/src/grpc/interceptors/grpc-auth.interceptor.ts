import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Metadata } from '@grpc/grpc-js';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Role, isSuperAdmin } from '../../common/enums/roles.enum';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';

/**
 * gRPC Authentication & Authorization Interceptor
 * 
 * Verifies JWT token in metadata and checks role-based permissions
 * 
 * Usage:
 * @UseInterceptors(GrpcAuthInterceptor)
 * @GrpcMethod('UserService', 'GetUser')
 * async getUser(data: GetUserRequest, metadata: Metadata) { }
 */
@Injectable()
export class GrpcAuthInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcAuthInterceptor.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const type = context.getType();
    
    if (type !== 'rpc') {
      return next.handle();
    }

    // Get metadata from gRPC call
    const metadata = context.getArgByIndex<Metadata>(1);
    
    if (!metadata) {
      this.logger.warn('No metadata provided in gRPC call');
      throw new UnauthorizedException('Authentication required');
    }

    // Extract token from metadata
    const authHeader = metadata.get('authorization');
    
    if (!authHeader || authHeader.length === 0) {
      this.logger.warn('No authorization header in gRPC metadata');
      throw new UnauthorizedException('Authentication required');
    }

    const token = this.extractToken(authHeader[0] as string);
    
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    // Verify token - supports both local and Keycloak tokens
    let user: AuthenticatedUser;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
      });
      
      // Map payload to user object (supports both local and Keycloak tokens)
      const userId = typeof payload.sub === 'number' ? payload.sub : parseInt(payload.sub, 10);
      user = {
        sub: payload.sub,
        id: userId,
        userId: userId,
        email: payload.email || payload.preferred_username,
        role: payload.role || payload.roleName,
        roles: payload.roles || payload.realm_access?.roles || [],
        keycloakId: payload.keycloakId || payload.sub,
        username: payload.username || payload.preferred_username,
      };
      
      this.logger.debug(`gRPC request authenticated for user: ${user.id}`);
    } catch (error) {
      this.logger.error(`gRPC token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Check role-based permissions
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      // Super admin bypass
      if (!isSuperAdmin(user.role)) {
        const userRole = user.role as Role;
        const hasRole = requiredRoles.includes(userRole);
        
        if (!hasRole) {
          this.logger.warn(
            `gRPC: User ${user.id} with role ${user.role} attempted to call ` +
            `method requiring roles: ${requiredRoles.join(', ')}`
          );
          throw new ForbiddenException(
            `Insufficient permissions. Required roles: ${requiredRoles.join(' or ')}`
          );
        }
      }
    }

    // Attach user to context for use in handler
    context.switchToRpc().getData().user = user;

    this.logger.debug(
      `gRPC call authorized - User: ${user.id}, Role: ${user.role}`
    );

    return next.handle();
  }

  /**
   * Extract token from authorization header
   */
  private extractToken(authHeader: string): string | null {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
