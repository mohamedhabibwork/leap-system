import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenVerificationService } from '../../modules/auth/token-verification.service';

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
 * Supports both local JWT tokens and Keycloak tokens.
 * 
 * Note: Room access validation should be handled by specific services
 * (e.g., ChatService.checkUserAccess) for accurate database-based validation.
 */
@Injectable()
export class WsAuthMiddleware {
  private readonly logger = new Logger(WsAuthMiddleware.name);
  private readonly useKeycloakVerification: boolean;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenVerificationService?: TokenVerificationService,
  ) {
    // Check if Keycloak verification should be used
    // Only enable if Keycloak is fully configured (URL, realm, client ID, and secret)
    const keycloakUrl = configService.get<string>('keycloak.authServerUrl') || 
                        configService.get<string>('KEYCLOAK_SERVER_URL') || '';
    const realm = configService.get<string>('keycloak.realm') || 
                  configService.get<string>('KEYCLOAK_REALM') || '';
    const clientId = configService.get<string>('keycloak.clientId') || 
                     configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    const clientSecret = configService.get<string>('keycloak.clientSecret') || 
                        configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';
    
    const keycloakConfigured = !!(keycloakUrl && realm && clientId && clientSecret);
    
    this.useKeycloakVerification = keycloakConfigured && 
      configService.get<boolean>('USE_KEYCLOAK_TOKEN_VERIFICATION') !== false;
    
    if (this.useKeycloakVerification) {
      this.logger.log('WebSocket auth initialized with Keycloak token verification');
    } else {
      this.logger.log('WebSocket auth initialized with local JWT verification');
    }
  }

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

      // Verify token - supports both local and Keycloak tokens
      let payload: any;
      
      // If Keycloak verification is enabled, try that first
      if (this.useKeycloakVerification && this.tokenVerificationService) {
        try {
          // Try Keycloak token verification first
          const verifiedPayload = await this.tokenVerificationService.verifyAccessToken(token);
          payload = verifiedPayload;
          this.logger.debug(`WebSocket connection ${socket.id} - Token verified as Keycloak token`);
        } catch (keycloakError) {
          // If Keycloak verification fails, try local JWT verification as fallback
          this.logger.debug(
            `WebSocket connection ${socket.id} - Keycloak verification failed, trying local JWT: ${keycloakError.message}`
          );
          
          try {
            // Try local JWT verification
            payload = await this.jwtService.verifyAsync(token, {
              ignoreExpiration: false,
            });
            this.logger.debug(`WebSocket connection ${socket.id} - Token verified as local JWT`);
          } catch (localError) {
            // Both failed - decode to get basic info for better error message
            const decoded = this.jwtService.decode(token);
            if (decoded && typeof decoded === 'object') {
              // Check if it looks like a Keycloak token
              if (decoded.iss && decoded.iss.includes('/realms/')) {
                this.logger.error(
                  `WebSocket connection ${socket.id} - Keycloak token verification failed: ${keycloakError.message}`
                );
                throw new Error(`Keycloak token verification failed: ${keycloakError.message}`);
              }
            }
            this.logger.error(
              `WebSocket connection ${socket.id} - Token verification failed: ${localError.message}`
            );
            throw localError;
          }
        }
      } else {
        // Use local JWT verification only
        try {
          payload = await this.jwtService.verifyAsync(token, {
            ignoreExpiration: false,
          });
          this.logger.debug(`WebSocket connection ${socket.id} - Token verified as local JWT`);
        } catch (localError) {
          // If verification fails, try to decode to provide better error
          const decoded = this.jwtService.decode(token);
          if (decoded && typeof decoded === 'object' && decoded.iss?.includes('/realms/')) {
            this.logger.error(
              `WebSocket connection ${socket.id} - Keycloak token detected but Keycloak verification is not configured`
            );
            throw new Error('Keycloak token detected but Keycloak verification is not enabled');
          }
          this.logger.error(
            `WebSocket connection ${socket.id} - Token verification failed: ${localError.message}`
          );
          throw localError;
        }
      }

      if (!payload || !payload.sub) {
        this.logger.warn(`WebSocket connection ${socket.id} - Invalid token payload`);
        throw new Error('Invalid token');
      }

      // Parse user ID - handle both string and number formats
      // For Keycloak tokens, sub is usually a UUID string, not a number
      // For local tokens, sub is typically a numeric user ID
      let userId: number;
      
      // Check if payload already has a numeric userId (from token generation)
      if (payload.userId && typeof payload.userId === 'number') {
        userId = payload.userId;
      } else if (payload.id && typeof payload.id === 'number') {
        userId = payload.id;
      } else if (typeof payload.sub === 'string') {
        // Try to parse as number first (for local tokens)
        const parsed = parseInt(payload.sub, 10);
        if (!isNaN(parsed) && parsed.toString() === payload.sub) {
          userId = parsed;
        } else {
          // It's a UUID or non-numeric string (Keycloak)
          // For Keycloak tokens, we need to look up the user by keycloakUserId
          // However, for WebSocket connections, we'll use the keycloakId directly
          // and let the services handle the user lookup when needed
          // For now, we'll extract from payload if available, otherwise use 0 as placeholder
          // The services should look up users by keycloakUserId when needed
          this.logger.debug(
            `WebSocket connection ${socket.id} - Keycloak token detected with sub: ${payload.sub}`
          );
          
          // Try to get userId from payload (might be set during token generation)
          userId = payload.userId || payload.id || 0;
          
          if (userId === 0) {
            // For Keycloak tokens without numeric ID, we'll need to look it up
            // But for WebSocket, we can defer this and use keycloakId
            // Services that need numeric ID should look it up by keycloakUserId
            this.logger.warn(
              `WebSocket connection ${socket.id} - Keycloak token without numeric userId. ` +
              `Using keycloakId: ${payload.sub}. Services may need to look up user by keycloakUserId.`
            );
            // Set a temporary ID - services should look up by keycloakUserId
            // We'll use a hash of the keycloakId as a temporary identifier
            // This is not ideal but allows WebSocket to work
            userId = 0; // Will be handled by services that need numeric ID
          }
        }
      } else if (typeof payload.sub === 'number') {
        userId = payload.sub;
      } else {
        userId = payload.userId || payload.id || 0;
      }
      
      // If we still don't have a valid userId and it's a Keycloak token, that's okay
      // Services will need to look up by keycloakUserId
      if (userId === 0 && payload.iss && payload.iss.includes('/realms/')) {
        this.logger.debug(
          `WebSocket connection ${socket.id} - Keycloak token without numeric userId. ` +
          `Will use keycloakId for identification: ${payload.sub}`
        );
      }

      // Extract role from various possible locations
      let role = payload.role || payload.roleName;
      if (!role && payload.realm_access?.roles) {
        // Keycloak realm roles - use the first one or find a specific one
        const roles = payload.realm_access.roles;
        role = roles.find((r: string) => ['admin', 'instructor', 'student', 'user'].includes(r.toLowerCase())) || roles[0];
      }
      if (!role && payload.resource_access) {
        // Keycloak resource roles
        const resourceRoles: string[] = [];
        Object.values(payload.resource_access).forEach((resource: any) => {
          if (resource.roles) {
            resourceRoles.push(...resource.roles);
          }
        });
        if (resourceRoles.length > 0) {
          role = resourceRoles[0];
        }
      }

      // For Keycloak tokens, if we don't have a numeric userId, use keycloakId
      const keycloakId = payload.keycloakId || (typeof payload.sub === 'string' && payload.iss?.includes('/realms/') ? payload.sub : undefined);
      
      // If userId is 0 but we have a keycloakId, that's acceptable for Keycloak tokens
      // Services will need to look up the user by keycloakUserId when needed
      if (userId === 0 && !keycloakId) {
        this.logger.error(
          `WebSocket connection ${socket.id} - Cannot determine user identifier. ` +
          `No userId or keycloakId found in token payload.`
        );
        throw new Error('Cannot determine user identifier from token');
      }

      // Attach user info to socket
      const user: WsUser = {
        id: userId || 0, // Allow 0 for Keycloak tokens - services will look up by keycloakId
        userId: userId || 0,
        email: payload.email || payload.email_address,
        role: role,
        keycloakId: keycloakId,
      };

      socket.data.user = user;

      if (userId === 0 && keycloakId) {
        this.logger.log(
          `WebSocket connection ${socket.id} authenticated - Keycloak User: ${keycloakId}, Role: ${user.role || 'N/A'}`
        );
      } else {
        this.logger.log(
          `WebSocket connection ${socket.id} authenticated - User: ${userId}, Role: ${user.role || 'N/A'}`
        );
      }

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
