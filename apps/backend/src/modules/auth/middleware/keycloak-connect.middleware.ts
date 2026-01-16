import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import KeycloakConnect from 'keycloak-connect';
import * as session from 'express-session';

/**
 * Keycloak Connect Middleware
 * 
 * Integrates keycloak-connect for session management and token validation.
 * This middleware can be used for stateful session-based authentication
 * in addition to stateless JWT authentication.
 */
@Injectable()
export class KeycloakConnectMiddleware implements NestMiddleware {
  private readonly logger = new Logger(KeycloakConnectMiddleware.name);
  private keycloak: KeycloakConnect.Keycloak | null = null;
  private sessionStore: session.MemoryStore | null = null;

  constructor(private configService: ConfigService) {
    this.initializeKeycloak();
  }

  /**
   * Initialize Keycloak Connect adapter
   */
  private initializeKeycloak(): void {
    try {
      const authServerUrl = this.configService.get<string>('keycloak.authServerUrl') ||
                           this.configService.get<string>('KEYCLOAK_SERVER_URL') ||
                           '';
      const realm = this.configService.get<string>('keycloak.realm') ||
                   this.configService.get<string>('KEYCLOAK_REALM') ||
                   '';
      const clientId = this.configService.get<string>('keycloak.clientId') ||
                      this.configService.get<string>('KEYCLOAK_CLIENT_ID') ||
                      '';
      const clientSecret = this.configService.get<string>('keycloak.clientSecret') ||
                         this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') ||
                         '';

      if (!authServerUrl || !realm || !clientId) {
        this.logger.warn('Keycloak Connect middleware not initialized - missing configuration');
        return;
      }

      // Create session store (in production, use Redis or database store)
      this.sessionStore = new session.MemoryStore();

      // Configure Keycloak adapter
      const keycloakConfig: KeycloakConnect.KeycloakConfig = {
        realm,
        'auth-server-url': authServerUrl,
        'ssl-required': 'external',
        resource: clientId,
        'bearer-only': false,
        'confidential-port': 0,
        ...(clientSecret ? { credentials: { secret: clientSecret } } : {}),
      };

      // Session configuration for express-session
      const sessionConfig: session.SessionOptions = {
        store: this.sessionStore,
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
      };

      this.keycloak = new KeycloakConnect(
        sessionConfig,
        keycloakConfig,
      );

      this.logger.log('Keycloak Connect middleware initialized');
    } catch (error: any) {
      this.logger.error(`Failed to initialize Keycloak Connect: ${error.message}`, error.stack);
    }
  }

  /**
   * Middleware function
   * Note: This middleware is optional and can be used for stateful sessions.
   * The primary authentication flow uses Passport OIDC strategy.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Only use Keycloak Connect middleware if explicitly enabled
    const useKeycloakConnect = this.configService.get<boolean>('keycloak.useKeycloakConnect') || false;

    if (!useKeycloakConnect || !this.keycloak) {
      // Skip middleware if not enabled or not initialized
      return next();
    }

    // Apply Keycloak Connect middleware
    // This provides additional session management capabilities
    // middleware() returns an array of middleware functions
    const middlewareArray = this.keycloak.middleware();
    
    // Apply all middleware functions in sequence
    let index = 0;
    const runMiddleware = (err?: any) => {
      if (err) {
        this.logger.error(`Keycloak Connect middleware error: ${err.message}`);
        // Don't block request, let Passport handle authentication
        return next();
      }
      
      if (index < middlewareArray.length) {
        const middlewareFn = middlewareArray[index++];
        middlewareFn(req, res, runMiddleware);
      } else {
        next();
      }
    };
    
    runMiddleware();
  }

  /**
   * Get Keycloak instance (for advanced usage)
   */
  getKeycloak(): KeycloakConnect.Keycloak | null {
    return this.keycloak;
  }

  /**
   * Protect route with Keycloak Connect (alternative to Passport guards)
   */
  protect(): any[] {
    if (!this.keycloak) {
      this.logger.warn('Keycloak Connect not initialized, protection not available');
      return [];
    }

    return [
      this.keycloak.protect(),
    ];
  }
}
