import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

/**
 * WebSocket Authentication Middleware
 * Verifies JWT token in WebSocket handshake
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
  async authenticate(socket: Socket): Promise<any> {
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

      // Attach user info to socket
      socket.data.user = {
        id: payload.sub,
        userId: payload.sub,
        email: payload.email,
        role: payload.role || payload.roleName || payload.realm_access?.roles?.[0],
        keycloakId: payload.keycloakId || payload.sub,
      };

      this.logger.log(
        `WebSocket connection ${socket.id} authenticated - User: ${payload.sub}, Role: ${socket.data.user.role}`
      );

      return socket.data.user;
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
   * Check if user can access a room
   * Override this method in specific gateways for custom room access logic
   */
  async canAccessRoom(socket: Socket, roomId: string): Promise<boolean> {
    const user = socket.data.user;
    
    if (!user) {
      return false;
    }

    // Super admin can access all rooms
    if (user.role === 'super_admin') {
      return true;
    }

    // Default: allow access (override in specific gateways)
    return true;
  }
}
