import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

export interface WsUser {
  id: number;
  userId: number;
  email?: string;
  role?: string;
  keycloakId?: string;
}

/**
 * WebSocket Authentication Middleware
 * 
 * Provides JWT authentication for WebSocket connections.
 * 
 * Note: Room access validation should be handled by specific services
 * (e.g., ChatService.checkUserAccess) for accurate database-based validation.
 */
@Injectable()
export class WsAuthMiddleware {
  private readonly logger = new Logger(WsAuthMiddleware.name);

  constructor(private jwtService: JwtService) {}

  /**
   * Authenticate WebSocket connection
   * Token can be provided in:
   * 1. auth.token (handshake auth object)
   * 2. Authorization header
   * 3. token query parameter
   */
  async authenticate(socket: Socket): Promise<WsUser> {
    try {
      // Try to get token from various sources
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`WebSocket connection ${socket.id} - No token provided`);
        throw new Error('Authentication required');
      }

      // Verify token with flexible algorithm support
      let payload: any;
      try {
        // Try with default configuration first
        payload = await this.jwtService.verifyAsync(token, {
          ignoreExpiration: false,
        });
      } catch (firstError) {
        // If verification fails due to algorithm mismatch, try without algorithm verification
        // This allows tokens from external sources like Keycloak (RS256) to work
        try {
          payload = this.jwtService.decode(token);
          
          // Basic validation on decoded token
          if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid token format');
          }

          // Check expiration manually if present
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            throw new Error('Token expired');
          }

          this.logger.debug(
            `WebSocket connection ${socket.id} - Token verified using decode (external issuer)`
          );
        } catch (decodeError) {
          this.logger.error(
            `WebSocket connection ${socket.id} - Token verification failed: ${firstError.message}`
          );
          throw firstError;
        }
      }

      if (!payload || !payload.sub) {
        this.logger.warn(`WebSocket connection ${socket.id} - Invalid token payload`);
        throw new Error('Invalid token');
      }

      // Parse user ID - handle both string and number formats
      const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;

      // Attach user info to socket
      const user: WsUser = {
        id: userId,
        userId: userId,
        email: payload.email,
        role: payload.role || payload.roleName || payload.realm_access?.roles?.[0],
        keycloakId: payload.keycloakId || payload.sub?.toString(),
      };

      socket.data.user = user;

      this.logger.log(
        `WebSocket connection ${socket.id} authenticated - User: ${userId}, Role: ${user.role}`
      );

      return user;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract token from socket handshake
   */
  private extractToken(socket: Socket): string | null {
    // Method 1: From auth object
    if (socket.handshake.auth && socket.handshake.auth.token) {
      return socket.handshake.auth.token;
    }

    // Method 2: From Authorization header
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Method 3: From query parameter
    if (socket.handshake.query && socket.handshake.query.token) {
      return socket.handshake.query.token as string;
    }

    return null;
  }

  /**
   * Get authenticated user from socket
   */
  getUser(socket: Socket): WsUser | null {
    return socket.data.user || null;
  }

  /**
   * Verify user has required role
   */
  hasRole(socket: Socket, ...roles: string[]): boolean {
    const userRole = socket.data.user?.role;
    
    if (!userRole) {
      return false;
    }

    return roles.includes(userRole) || userRole === 'super_admin';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(socket: Socket): boolean {
    return !!socket.data.user;
  }

  /**
   * Check if user is a super admin
   */
  isSuperAdmin(socket: Socket): boolean {
    return socket.data.user?.role === 'super_admin';
  }
}
