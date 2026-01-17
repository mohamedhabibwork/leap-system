import { Injectable, OnModuleInit, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as oidc from 'oidc-provider';
import { interactionPolicy } from 'oidc-provider';
import { AdapterFactory } from './adapters/adapter.factory';
import { AuthService } from '../auth/auth.service';
import { RbacService } from '../auth/rbac.service';
import { users } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { OIDC_DEFAULTS } from './oidc.config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

/**
 * JWKS (JSON Web Key Set) structure
 */
interface JWKS {
  keys: Array<{
    kty: string;
    use: string;
    alg: string;
    kid: string;
    n?: string;
    e?: string;
    d?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
  }>;
}

/**
 * OIDC Provider Service
 * Manages the OIDC provider instance and configuration
 */
@Injectable()
export class OidcService implements OnModuleInit {
  private readonly logger = new Logger(OidcService.name);
  private provider: oidc.Provider;

  constructor(
    private readonly configService: ConfigService,
    private readonly adapterFactory: AdapterFactory,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    @Inject(forwardRef(() => RbacService)) private readonly rbacService: RbacService,
    @Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async onModuleInit() {
    await this.initializeProvider();
  }

  /**
   * Initialize the OIDC provider
   */
  private async initializeProvider(): Promise<void> {
    // Get issuer from config with fallbacks
    const envConfig = this.configService.get<any>('env');
    const issuer = this.configService.get<string>('OIDC_ISSUER') || 
                   envConfig?.OIDC_ISSUER ||
                   this.configService.get<string>('BACKEND_URL') || 
                   envConfig?.BACKEND_URL ||
                   'http://localhost:3000';

    this.logger.log(`Initializing OIDC Provider with issuer: ${issuer}`);

    // Create adapter function
    const adapter = (name: string) => this.adapterFactory.createAdapter(name);

    // Generate or load JWKS
    const jwks = await this.getOrGenerateJwks();

    // OIDC Provider configuration
    const configuration: oidc.Configuration = {
      adapter,
      clients: [], // Clients will be managed via database
      jwks,
      findAccount: this.findAccount.bind(this),
      features: {
        devInteractions: {
          enabled: this.configService.get<string>('NODE_ENV') === 'development',
        },
        registration: {
          enabled: OIDC_DEFAULTS.FEATURES.REGISTRATION,
          initialAccessToken: this.configService.get<string>('OIDC_INITIAL_ACCESS_TOKEN') || this.configService.get<string>('env.OIDC_INITIAL_ACCESS_TOKEN'),
        },
        registrationManagement: {
          enabled: OIDC_DEFAULTS.FEATURES.REGISTRATION_MANAGEMENT,
        },
        introspection: {
          enabled: OIDC_DEFAULTS.FEATURES.INTROSPECTION,
        },
        revocation: {
          enabled: OIDC_DEFAULTS.FEATURES.REVOCATION,
        },
        userinfo: {
          enabled: OIDC_DEFAULTS.FEATURES.USERINFO,
        },
        rpInitiatedLogout: {
          enabled: OIDC_DEFAULTS.FEATURES.RP_INITIATED_LOGOUT,
        },
        backchannelLogout: {
          enabled: OIDC_DEFAULTS.FEATURES.BACKCHANNEL_LOGOUT,
        },
        claimsParameter: {
          enabled: OIDC_DEFAULTS.FEATURES.CLAIMS_PARAMETER,
        },
        encryption: {
          enabled: OIDC_DEFAULTS.FEATURES.ENCRYPTION,
        },
        jwtIntrospection: {
          enabled: OIDC_DEFAULTS.FEATURES.JWT_INTROSPECTION,
        },
        jwtResponseModes: {
          enabled: OIDC_DEFAULTS.FEATURES.JWT_RESPONSE_MODES,
        },
        jwtUserinfo: {
          enabled: OIDC_DEFAULTS.FEATURES.JWT_USERINFO,
        },
        requestObjects: {
          enabled: OIDC_DEFAULTS.FEATURES.REQUEST_OBJECTS,
        },
        resourceIndicators: {
          enabled: OIDC_DEFAULTS.FEATURES.RESOURCE_INDICATORS,
        },
      },
      pkce: {
        methods: OIDC_DEFAULTS.PKCE.METHODS ,
        required: (ctx, client) => {
          // Require PKCE for public clients (clients without secrets)
          return !client.clientSecret;
        },
      },
      scopes: OIDC_DEFAULTS.SCOPES,
      subjectTypes: OIDC_DEFAULTS.SUBJECT_TYPES ,
      responseTypes: OIDC_DEFAULTS.RESPONSE_TYPES ,
      grantTypes: OIDC_DEFAULTS.GRANT_TYPES ,
      tokenEndpointAuthMethods: OIDC_DEFAULTS.TOKEN_ENDPOINT_AUTH_METHODS ,
      ttl: {
        AccessToken: OIDC_DEFAULTS.TTL.ACCESS_TOKEN,
        AuthorizationCode: OIDC_DEFAULTS.TTL.AUTHORIZATION_CODE,
        IdToken: OIDC_DEFAULTS.TTL.ID_TOKEN,
        RefreshToken: OIDC_DEFAULTS.TTL.REFRESH_TOKEN,
        DeviceCode: OIDC_DEFAULTS.TTL.DEVICE_CODE,
        UserCode: OIDC_DEFAULTS.TTL.USER_CODE,
        Grant: OIDC_DEFAULTS.TTL.GRANT,
        Session: OIDC_DEFAULTS.TTL.SESSION,
      },
      cookies: {
        keys: this.getCookieKeys(),
        long: {
          httpOnly: OIDC_DEFAULTS.COOKIES.HTTP_ONLY,
          sameSite: OIDC_DEFAULTS.COOKIES.SAME_SITE,
          secure: this.configService.get<string>('NODE_ENV') === 'production' && OIDC_DEFAULTS.COOKIES.SECURE_IN_PRODUCTION,
        },
        short: {
          httpOnly: OIDC_DEFAULTS.COOKIES.HTTP_ONLY,
          sameSite: OIDC_DEFAULTS.COOKIES.SAME_SITE,
          secure: this.configService.get<string>('NODE_ENV') === 'production' && OIDC_DEFAULTS.COOKIES.SECURE_IN_PRODUCTION,
        },
      },
      // Interactions configuration
      // In development, devInteractions handles this automatically
      // In production, you would implement your own interaction endpoints
      ...(this.configService.get<string>('NODE_ENV') !== 'development' ? {
        interactions: {
          url: (ctx, interaction) => {
            // Redirect to frontend login page with interaction UID
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 
                               this.configService.get<string>('env.FRONTEND_URL') ||
                               'http://localhost:3001';
            return `${frontendUrl}/oidc/interaction/${interaction.uid}`;
          },
          // Use default interaction policy (login and consent prompts)
          // You can customize this by importing interactionPolicy and modifying the base policy
          policy: interactionPolicy.base(),
        },
      } : {}),
    };

    // Initialize provider (initialization happens in constructor)
    this.provider = new oidc.Provider(issuer, configuration);

    this.logger.log('OIDC Provider initialized successfully');
  }

  /**
   * Get cookie keys from configuration or use JWT secret as fallback
   */
  private getCookieKeys(): string[] {
    const cookieKeys = this.configService.get<string>('OIDC_COOKIE_KEYS') || 
                       this.configService.get<string>('env.OIDC_COOKIE_KEYS');
    
    if (cookieKeys) {
      return cookieKeys.split(',').map(key => key.trim()).filter(Boolean);
    }

    // Fallback to JWT secret
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 
                      this.configService.get<string>('env.JWT_SECRET') ||
                      'default-secret-change-in-production';
    
    return [jwtSecret];
  }

  /**
   * Get or generate JWKS for token signing
   * Returns a function that provides JWKS (can be object or function per oidc-provider docs)
   */
  private async getOrGenerateJwks(): Promise<JWKS> {
    // Check if JWKS is provided in environment
    const jwksFromEnv = this.configService.get<string>('OIDC_JWKS') || 
                        this.configService.get<string>('env.OIDC_JWKS');
    if (jwksFromEnv) {
      try {
        return JSON.parse(jwksFromEnv);
      } catch (error) {
        this.logger.warn('Failed to parse OIDC_JWKS from environment, generating new keys');
      }
    }

    // In production, you should load JWKS from secure storage
    // For now, we'll use a simple approach - generate keys on first use
    // TODO: Store and reuse JWKS in database or secure storage
    
    const crypto = require('crypto');
    const { promisify } = require('util');
    const generateKeyPair = promisify(crypto.generateKeyPair);

    try {
      // Generate RSA key pair
      const { publicKey, privateKey } = await generateKeyPair('rsa', {
        modulusLength: OIDC_DEFAULTS.JWKS.KEY_SIZE,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      // Convert private key to JWK format (includes all RSA parameters: n, e, d, p, q, dp, dq, qi)
      // oidc-provider requires private keys for signing operations
      const privateKeyObj = crypto.createPrivateKey(privateKey);
      const jwk = privateKeyObj.export({ format: 'jwk' });

      // Return JWKS format with private key (required for signing)
      return {
        keys: [
          {
            kty: jwk.kty,
            use: 'sig',
            alg: OIDC_DEFAULTS.JWKS.ALGORITHM,
            kid: OIDC_DEFAULTS.JWKS.KID,
            n: jwk.n,
            e: jwk.e,
            d: jwk.d, // Private exponent (required for signing)
            p: jwk.p, // First prime factor
            q: jwk.q, // Second prime factor
            dp: jwk.dp, // First factor CRT exponent
            dq: jwk.dq, // Second factor CRT exponent
            qi: jwk.qi, // First CRT coefficient
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error generating JWKS:', error);
      // Fallback: return a minimal JWKS structure
      // In production, this should load from secure storage
      throw new Error('Failed to generate JWKS. Please configure OIDC_JWKS in environment.');
    }
  }

  /**
   * Find account by subject identifier
   * This is called by oidc-provider to load user information
   */
  private async findAccount(ctx: oidc.KoaContextWithOIDC, sub: string, token?: oidc.AccessToken): Promise<oidc.Account | null> {
    try {
      // Find user by ID
      const userId = parseInt(sub, 10);
      if (isNaN(userId)) {
        this.logger.warn(`Invalid subject identifier: ${sub}`);
        return null;
      }

      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        this.logger.warn(`User not found for subject: ${sub}`);
        return null;
      }

      // Get user roles and permissions
      const roles = await this.rbacService.getUserRoles(user.id);
      const permissions = await this.rbacService.getUserPermissions(user.id);

      return {
        accountId: sub,
        async claims(use: string, scope: string, claims: Record<string, unknown>, rejected: string[]) {
          // Build claims based on scope and use
          const result: Record<string, unknown> = {
            sub: sub,
          };

          // Add profile claims
          if (scope.includes('profile') || use === 'id_token') {
            result.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
            result.given_name = user.firstName;
            result.family_name = user.lastName;
            result.preferred_username = user.username;
            result.nickname = user.username;
            if (user.dateOfBirth) {
              result.birthdate = user.dateOfBirth.toISOString().split('T')[0];
            }
            if (user.gender) {
              result.gender = user.gender;
            }
          }

          // Add email claims
          if (scope.includes('email') || use === 'id_token') {
            result.email = user.email;
            result.email_verified = user.emailVerified || false;
          }

          // Add address claims (if available)
          if (scope.includes('address') && user.address) {
            result.address = user.address;
          }

          // Add phone claims (if available)
          if (scope.includes('phone') && user.phone) {
            result.phone_number = user.phone;
            result.phone_number_verified = user.phoneVerified || false;
          }

          // Add custom claims
          result.roles = roles;
          result.permissions = permissions;
          result.role_id = user.roleId;

          // Add timestamps
          result.iat = Math.floor(Date.now() / 1000);
          result.auth_time = user.lastLoginAt 
            ? Math.floor(user.lastLoginAt.getTime() / 1000)
            : Math.floor(Date.now() / 1000);

          return result;
        },
      };
    } catch (error) {
      this.logger.error(`Error finding account for subject ${sub}:`, error);
      return null;
    }
  }

  /**
   * Get the OIDC provider instance
   */
  getProvider(): oidc.Provider {
    return this.provider;
  }

  /**
   * Get the provider callback for Express/NestJS
   */
  getCallback() {
    return this.provider.callback();
  }
}
