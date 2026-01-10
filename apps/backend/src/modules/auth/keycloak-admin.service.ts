import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users, lookups, lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import axios from 'axios';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private kcAdminClient: KcAdminClient;
  private isConnected = false;
  private tokenExpiry: number = 0;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Check if Keycloak is configured
    const authServerUrl = this.configService.get('keycloak.authServerUrl');
    const clientId = this.configService.get('keycloak.admin.clientId') || 'admin-cli';
    const clientSecret = this.configService.get('keycloak.admin.clientSecret');
    const username = this.configService.get('keycloak.admin.username');
    const password = this.configService.get('keycloak.admin.password');

    // Prioritize client credentials over password credentials
    const hasClientCredentials = clientSecret && clientId;
    const hasPasswordCredentials = username && password;

    if (!authServerUrl) {
      this.logger.warn(
        'KEYCLOAK_SERVER_URL is not configured. Please set it in your environment variables.'
      );
      this.isConnected = false;
      return;
    }

    if (!hasClientCredentials && !hasPasswordCredentials) {
      this.logger.warn(
        'KEYCLOAK_ADMIN_PASSWORD is not configured. Please set it in your environment variables.'
      );
      this.isConnected = false;
      return;
    }

    try {
      await this.initializeClient();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      // Log as warning if it's an authentication error (invalid_grant, etc.)
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized')) {
        this.logger.warn(
          `Keycloak authentication failed: ${errorMessage}. ` +
          'Keycloak Admin Client will be disabled.\n' +
          'Troubleshooting steps:\n'
        );
        
        if (hasClientCredentials) {
          this.logger.warn(
            '1. Verify KEYCLOAK_ADMIN_CLIENT_SECRET {clientSecret: ' + clientSecret + '} is correct\n' +
            '2. In Keycloak Admin Console, go to Clients → ' + clientId + ' → Settings\n' +
            '3. Enable "Service accounts roles" and save\n' +
            '4. Go to "Service Account Roles" tab\n' +
            '5. Add "realm-admin" role from "realm-management" client'
          );
        } else {
          this.logger.warn(
            '1. Verify KEYCLOAK_ADMIN_USERNAME {username: ' + username + '} and KEYCLOAK_ADMIN_PASSWORD {password: ' + password + '} are correct\n' +
            '2. In Keycloak Admin Console, go to Clients → ' + clientId + ' → Settings\n' +
            '3. Enable "Direct access grants" and save\n' +
            '4. Verify the realm "' + this.configService.get('keycloak.realm') + '" exists\n' +
            '5. Check that the admin user exists and is enabled'
          );
        }
      } else {
        this.logger.warn(
          `Failed to initialize Keycloak admin client: ${errorMessage}. ` +
          'Keycloak features will be disabled. Check your Keycloak configuration and ensure the server is running.'
        );
      }
      this.isConnected = false;
      // Don't throw - allow app to continue without Keycloak
    }
  }

  /**
   * Initialize and authenticate Keycloak Admin Client
   * Authenticates in admin realm (master) but operates on application realm
   * Prioritizes client credentials over password credentials
   */
  private async initializeClient(): Promise<void> {
    const baseUrl = this.configService.get('keycloak.authServerUrl');
    const realmName = this.configService.get('keycloak.realm'); // Application realm
    const adminRealm = this.configService.get('keycloak.admin.realm') || 'master'; // Admin realm for auth
    const clientId = this.configService.get('keycloak.admin.clientId') || 'admin-cli';
    const clientSecret = this.configService.get('keycloak.admin.clientSecret');
    const username = this.configService.get('keycloak.admin.username');
    const password = this.configService.get('keycloak.admin.password');

    if (!baseUrl || !realmName) {
      this.logger.error('Missing required Keycloak configuration (URL and realm)',{
        baseUrl,
        realmName,
        adminRealm,
        clientId,
        clientSecret,
        username,
        password,
      });
      throw new Error('Missing required Keycloak configuration (URL and realm)');
    }

    // Prioritize client credentials over password credentials
    const hasClientCredentials = clientSecret && clientId;
    const hasPasswordCredentials = username && password;

    if (!hasClientCredentials && !hasPasswordCredentials) {
      this.logger.error('Missing Keycloak credentials. Set either client credentials or username/password.',{
        clientId,
        clientSecret,
        username,
        password,
      });
      throw new Error('Missing Keycloak credentials. Set either client credentials or username/password.');
    }

    // Authenticate in the admin realm (master) where admin-cli exists
    // Then configure client to operate on the application realm
    if (hasClientCredentials) {
      this.logger.log('Authenticating with client credentials...',{
        clientId,
        clientSecret,
        username,
        password,
        adminRealm,
      });
      
      // Get token endpoint for the admin realm (master)
      const tokenEndpoint = `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`;
      
      try {
        // Authenticate in master realm using direct token endpoint
        const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId!,
          client_secret: clientSecret!,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        const accessToken = tokenResponse.data.access_token;
        const expiresIn = tokenResponse.data.expires_in || 60;
        
        // Create client for application realm
        this.kcAdminClient = new KcAdminClient({
          baseUrl,
          realmName,
        });
        
        // Set the access token manually using the client's internal mechanism
        // The KcAdminClient stores the token internally, we need to set it
        (this.kcAdminClient as any).accessToken = accessToken;
        (this.kcAdminClient as any).refreshToken = tokenResponse.data.refresh_token;
        
        this.tokenExpiry = Date.now() + (expiresIn - 5) * 1000; // 5 second safety margin
        this.isConnected = true;
        
        this.logger.log(
          `Keycloak Admin Client initialized successfully with client credentials ` +
          `(authenticated in ${adminRealm}, operating on ${realmName})`
        );

        // Set up token refresh - need to re-authenticate in master realm
        this.scheduleTokenRefresh(() => this.authenticateWithClientCredentials(clientId!, clientSecret!, adminRealm));
      } catch (authError: any) {
        // If authentication in master realm fails, try authenticating in application realm
        // (in case admin-cli was created in the application realm)
        this.logger.warn(
          `Failed to authenticate in ${adminRealm} realm: ${authError.message}. ` +
          `Trying application realm ${realmName}...`
        );
        
        // Create client for application realm
        this.kcAdminClient = new KcAdminClient({
          baseUrl,
          realmName,
        });
        
        // Try authenticating in application realm
        await this.kcAdminClient.auth({
          grantType: 'client_credentials',
          clientId: clientId!,
          clientSecret: clientSecret!,
        });
        
        const expiresIn = 60;
        this.tokenExpiry = Date.now() + (expiresIn - 5) * 1000;
        this.isConnected = true;
        this.logger.log(
          `Keycloak Admin Client initialized successfully with client credentials ` +
          `(authenticated in ${realmName})`
        );
        
        this.scheduleTokenRefresh(() => this.authenticateWithClientCredentials(clientId!, clientSecret!, realmName));
      }
    } else if (hasPasswordCredentials) {
      this.logger.log('Authenticating with password credentials...',{
        clientId,
        username,
        password,
        adminRealm,
      });
      
      // Get token endpoint for the admin realm (master) where admin user typically exists
      const tokenEndpoint = `${baseUrl}/realms/${adminRealm}/protocol/openid-connect/token`;
      
      try {
        // Authenticate in master realm using direct token endpoint
        // Match the working curl command format exactly
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', clientId!);
        params.append('username', username!);
        params.append('password', password!);
        
        this.logger.debug(`Authenticating at: ${tokenEndpoint}`,{
          clientId,
          username,
          password,
          adminRealm,
        });
        
        const tokenResponse = await axios.post(tokenEndpoint, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        const accessToken = tokenResponse.data.access_token;
        const expiresIn = tokenResponse.data.expires_in || 60;
        
        if (!accessToken) {
          throw new Error('No access token received from Keycloak');
        }
        
        // Create client for application realm
        this.kcAdminClient = new KcAdminClient({
          baseUrl,
          realmName,
        });
        
        // Set the access token manually using the client's internal mechanism
        (this.kcAdminClient as any).accessToken = accessToken;
        (this.kcAdminClient as any).refreshToken = tokenResponse.data.refresh_token;
        
        this.tokenExpiry = Date.now() + (expiresIn - 5) * 1000; // 5 second safety margin
        this.isConnected = true;
        
        this.logger.log(
          `Keycloak Admin Client initialized successfully with password credentials ` +
          `(authenticated in ${adminRealm}, operating on ${realmName})`
        );

        // Set up token refresh - need to re-authenticate in master realm
        this.scheduleTokenRefresh(() => this.authenticateWithPassword(clientId!, username!, password!, adminRealm));
      } catch (authError: any) {
        // Log detailed error information
        const errorMessage = authError.response?.data?.error_description || 
                            authError.response?.data?.error || 
                            authError.message;
        const errorStatus = authError.response?.status;
        
        this.logger.error(
          `Failed to authenticate in ${adminRealm} realm: ${errorMessage} (Status: ${errorStatus})`,{
            clientId,
            username,
            password,
            adminRealm,
          }
        );
        this.logger.debug(`Request URL: ${tokenEndpoint}`,{
          clientId,
          username,
          password,
          adminRealm,
        });
        
        // If authentication in master realm fails, try authenticating in application realm
        // (in case admin user was created in the application realm)
        this.logger.warn(
          `Trying application realm ${realmName}...`,{
            clientId,
            username,
            password,
            adminRealm,
          }
        );
        
        // Create client for application realm
        this.kcAdminClient = new KcAdminClient({
          baseUrl,
          realmName,
        });
        
        // Try authenticating in application realm
        await this.kcAdminClient.auth({
          grantType: 'password',
          clientId: clientId!,
          username: username!,
          password: password!,
        });
        
        const expiresIn = 60;
        this.tokenExpiry = Date.now() + (expiresIn - 5) * 1000;
        this.isConnected = true;
        this.logger.log(
          `Keycloak Admin Client initialized successfully with password credentials ` +
          `(authenticated in ${realmName})`,{
            clientId,
            username,
            password,
            adminRealm,
          }
        );
        
        this.scheduleTokenRefresh(() => this.authenticateWithPassword(clientId!, username!, password!, adminRealm));
      }
    }
  }

  /**
   * Authenticate with client credentials
   * @param realm - Realm to authenticate in (usually 'master' for admin-cli)
   */
  private async authenticateWithClientCredentials(
    clientId: string, 
    clientSecret: string, 
    realm?: string
  ): Promise<void> {
    // Use provided realm or default to master
    const authRealm = realm || this.configService.get('keycloak.admin.realm') || 'master';
    const baseUrl = this.configService.get('keycloak.authServerUrl');
    const applicationRealm = this.configService.get('keycloak.realm');
    
    if (authRealm !== applicationRealm) {
      // Authenticate in the specified realm (e.g., master) using token endpoint
      const tokenEndpoint = `${baseUrl}/realms/${authRealm}/protocol/openid-connect/token`;
      
      const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Set the access token on the main client (configured for application realm)
      const accessToken = tokenResponse.data.access_token;
      if (this.kcAdminClient && accessToken) {
        (this.kcAdminClient as any).accessToken = accessToken;
        (this.kcAdminClient as any).refreshToken = tokenResponse.data.refresh_token;
        this.tokenExpiry = Date.now() + ((tokenResponse.data.expires_in || 60) - 5) * 1000;
      }
    } else {
      // Authenticate in the same realm as the client
      await this.kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId,
        clientSecret,
      });
    }
  }

  /**
   * Authenticate with password credentials
   * @param realm - Realm to authenticate in (usually 'master' for admin user)
   */
  private async authenticateWithPassword(
    clientId: string, 
    username: string, 
    password: string,
    realm?: string
  ): Promise<void> {
    // Use provided realm or default to master
    const authRealm = realm || this.configService.get('keycloak.admin.realm') || 'master';
    const baseUrl = this.configService.get('keycloak.authServerUrl');
    const applicationRealm = this.configService.get('keycloak.realm');
    
    if (authRealm !== applicationRealm) {
      // Authenticate in the specified realm (e.g., master) using token endpoint
      const tokenEndpoint = `${baseUrl}/realms/${authRealm}/protocol/openid-connect/token`;
      
      // Match the working curl command format exactly
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', clientId);
      params.append('username', username);
      params.append('password', password);
      
      const tokenResponse = await axios.post(tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Set the access token on the main client (configured for application realm)
      const accessToken = tokenResponse.data.access_token;
      if (this.kcAdminClient && accessToken) {
        (this.kcAdminClient as any).accessToken = accessToken;
        (this.kcAdminClient as any).refreshToken = tokenResponse.data.refresh_token;
        this.tokenExpiry = Date.now() + ((tokenResponse.data.expires_in || 60) - 5) * 1000;
      }
    } else {
      // Authenticate in the same realm as the client
      await this.kcAdminClient.auth({
        grantType: 'password',
        clientId,
        username,
        password,
      });
    }
  }

  /**
   * Schedule token refresh based on expiry time
   */
  private scheduleTokenRefresh(authenticateFn: () => Promise<void>): void {
    // Clear existing timer if any
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const now = Date.now();
    const timeUntilExpiry = this.tokenExpiry - now;

    if (timeUntilExpiry <= 0) {
      // Token already expired, refresh immediately
      this.refreshToken(authenticateFn);
      return;
    }

    // Schedule refresh 5 seconds before expiry
    const refreshDelay = Math.max(0, timeUntilExpiry - 5000);
    
    this.tokenRefreshTimer = setTimeout(async () => {
      await this.refreshToken(authenticateFn);
    }, refreshDelay);
  }

  /**
   * Refresh the access token
   */
  private async refreshToken(authenticateFn: () => Promise<void>): Promise<void> {
    try {
      if (this.isConnected && this.kcAdminClient) {
        await authenticateFn();
        
        // Update expiry (default to 60 seconds if not available)
        const expiresIn = 60; // Default, should be extracted from response if available
        this.tokenExpiry = Date.now() + (expiresIn - 5) * 1000;
        
        // Schedule next refresh
        this.scheduleTokenRefresh(authenticateFn);
      }
    } catch (error: any) {
      this.logger.warn('Failed to refresh Keycloak admin token', error?.message || error);
      this.isConnected = false;
    }
  }

  /**
   * Ensure client is connected, retry if not
   */
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.initializeClient();
      } catch (error) {
        // If initialization fails, check if it's due to missing config
        const authServerUrl = this.configService.get('keycloak.authServerUrl');
        const clientId = this.configService.get('keycloak.admin.clientId') || 'admin-cli';
        const clientSecret = this.configService.get('keycloak.admin.clientSecret');
        const username = this.configService.get('keycloak.admin.username');
        const password = this.configService.get('keycloak.admin.password');
        
        const hasClientCredentials = clientSecret && clientId;
        const hasPasswordCredentials = username && password;
        
        if (!authServerUrl) {
          throw new Error('KEYCLOAK_SERVER_URL is not configured. Please set it in your environment variables.');
        }
        
        if (!hasClientCredentials && !hasPasswordCredentials) {
          throw new Error('KEYCLOAK_ADMIN_PASSWORD is not configured. Please set it in your environment variables.');
        }
        throw error;
      }
    }
    
    if (!this.isConnected || !this.kcAdminClient) {
      throw new Error('Keycloak Admin Client is not available. Please check your Keycloak configuration.');
    }
  }

  /**
   * Get user from Keycloak by email
   */
  async getUserByEmail(email: string) {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot get user by email.');
      return null;
    }
    
    try {
      await this.ensureConnected();
      const users = await this.kcAdminClient!.users.find({ email, exact: true });
      return users.length > 0 ? users[0] : null;
    } catch (error: any) {
      this.logger.error(`Failed to get user by email: ${email}`, error?.message || error);
      return null; // Return null instead of throwing to allow graceful degradation
    }
  }

  /**
   * Check if Keycloak service is available
   */
  isAvailable(): boolean {
    return this.isConnected && !!this.kcAdminClient;
  }

  /**
   * Validate connection to Keycloak Admin API
   * Tests the connection by attempting authentication
   * 
   * @returns true if connection is successful, false otherwise
   */
  async validateConnection(): Promise<boolean> {
    try {
      const authServerUrl = this.configService.get('keycloak.authServerUrl');
      const adminRealm = this.configService.get('keycloak.admin.realm') || 'master';
      const clientId = this.configService.get('keycloak.admin.clientId') || 'admin-cli';
      const clientSecret = this.configService.get('keycloak.admin.clientSecret');
      const username = this.configService.get('keycloak.admin.username');
      const password = this.configService.get('keycloak.admin.password');

      if (!authServerUrl) {
        this.logger.warn('KEYCLOAK_SERVER_URL is not configured. Please set it in your environment variables.');
        return false;
      }

      const hasClientCredentials = clientSecret && clientId;
      const hasPasswordCredentials = username && password;

      if (!hasClientCredentials && !hasPasswordCredentials) {
        this.logger.warn('KEYCLOAK_ADMIN_PASSWORD is not configured. Please set it in your environment variables.');
        return false;
      }

      const realmName = this.configService.get('keycloak.realm');
      
      if (!realmName) {
        this.logger.warn('KEYCLOAK_REALM is not configured.');
        return false;
      }

      // Create a temporary client to test authentication in the application realm
      const testClient = new KcAdminClient({
        baseUrl: authServerUrl,
        realmName: realmName, // Test in application realm
      });

      if (hasClientCredentials) {
        await testClient.auth({
          grantType: 'client_credentials',
          clientId: clientId!,
          clientSecret: clientSecret!,
        });
      } else {
        await testClient.auth({
          grantType: 'password',
          clientId: clientId!,
          username: username!,
          password: password!,
        });
      }

      // Try a simple operation to verify permissions
      await testClient.users.find({ max: 1 });

      this.logger.log('Keycloak connection validated successfully');
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('unauthorized')) {
        this.logger.warn('⚠️  Authentication failed - Invalid credentials');
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        this.logger.warn('⚠️  Keycloak server not found');
      } else {
        this.logger.warn(`⚠️  Connection validation failed: ${errorMessage}`);
      }
      
      return false;
    }
  }

  /**
   * Get user from Keycloak by ID
   */
  async getUserById(keycloakId: string) {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot get user by ID.');
      return null;
    }
    
    try {
      await this.ensureConnected();
      return await this.kcAdminClient!.users.findOne({ id: keycloakId });
    } catch (error: any) {
      this.logger.error(`Failed to get user by ID: ${keycloakId}`, error?.message || error);
      return null; // Return null instead of throwing to allow graceful degradation
    }
  }

  /**
   * Create user in Keycloak
   */
  async createUser(userData: {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    attributes?: Record<string, string[]>;
  }) {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot create user.');
      return null;
    }
    
    try {
      await this.ensureConnected();
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        this.logger.warn(`User already exists in Keycloak: ${userData.email}`);
        return existingUser;
      }

      const userId = await this.kcAdminClient!.users.create({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        enabled: userData.enabled !== undefined ? userData.enabled : true,
        emailVerified: false,
        attributes: userData.attributes || {},
      });

      this.logger.log(`Created user in Keycloak: ${userData.email}`);
      return await this.getUserById(userId.id);
    } catch (error: any) {
      this.logger.error(`Failed to create user: ${userData.email}`, error?.message || error);
      return null; // Return null instead of throwing to allow graceful degradation
    }
  }

  /**
   * Set user password in Keycloak
   */
  async setUserPassword(keycloakId: string, password: string, temporary: boolean = false): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot set user password.');
      throw new Error('Keycloak not connected');
    }
    
    try {
      await this.ensureConnected();
      await this.kcAdminClient!.users.resetPassword({
        id: keycloakId,
        credential: {
          temporary,
          type: 'password',
          value: password,
        },
      });
      this.logger.log(`Set password for user in Keycloak: ${keycloakId}`);
    } catch (error: any) {
      this.logger.error(`Failed to set password for user: ${keycloakId}`, error?.message || error);
      throw error;
    }
  }

  /**
   * Create user in Keycloak with password
   */
  async createUserWithPassword(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    emailVerified?: boolean;
    attributes?: Record<string, string[]>;
  }): Promise<any> {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot create user with password.');
      throw new Error('Keycloak not connected');
    }
    
    try {
      await this.ensureConnected();
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        this.logger.warn(`User already exists in Keycloak: ${userData.email}`);
        throw new Error(`User already exists in Keycloak: ${userData.email}`);
      }

      const userId = await this.kcAdminClient!.users.create({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        enabled: userData.enabled !== undefined ? userData.enabled : true,
        emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
        attributes: userData.attributes || {},
      });

      // Set password
      if (userId.id) {
        await this.setUserPassword(userId.id, userData.password, false);
      }

      this.logger.log(`Created user with password in Keycloak: ${userData.email}`);
      return await this.getUserById(userId.id);
    } catch (error: any) {
      this.logger.error(`Failed to create user with password: ${userData.email}`, error?.message || error);
      throw error;
    }
  }

  /**
   * Update user in Keycloak
   */
  async updateUser(keycloakId: string, userData: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    attributes?: Record<string, string[]>;
  }) {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot update user.');
      return null;
    }
    
    try {
      await this.ensureConnected();
      await this.kcAdminClient!.users.update({ id: keycloakId }, userData);
      this.logger.log(`Updated user in Keycloak: ${keycloakId}`);
      return await this.getUserById(keycloakId);
    } catch (error: any) {
      this.logger.error(`Failed to update user: ${keycloakId}`, error?.message || error);
      return null; // Return null instead of throwing to allow graceful degradation
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUser(keycloakId: string) {
    if (!this.isConnected) {
      this.logger.warn('Keycloak not connected. Cannot delete user.');
      return;
    }
    
    try {
      await this.ensureConnected();
      await this.kcAdminClient!.users.del({ id: keycloakId });
      this.logger.log(`Deleted user from Keycloak: ${keycloakId}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete user: ${keycloakId}`, error?.message || error);
      // Don't throw - allow graceful degradation
    }
  }

  /**
   * Sync single user to Keycloak
   */
  async syncUserToKeycloak(userId: number) {
    await this.ensureConnected();
    try {
      // Get user from database
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Get user status and role names
      const [userStatus] = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .where(eq(lookups.id, user.statusId))
        .limit(1);

      // Check if user exists in Keycloak
      const existingUser = await this.getUserByEmail(user.email);

      const attributes = {
        phone: user.phone ? [user.phone] : [],
        avatar: user.avatarUrl ? [user.avatarUrl] : [],
        locale: user.preferredLanguage ? [user.preferredLanguage] : ['en'],
        timezone: user.timezone ? [user.timezone] : ['UTC'],
        status: userStatus ? [userStatus.code] : ['active'],
        dbUserId: [user.id.toString()],
      };

      if (existingUser) {
        // Update existing user
        await this.updateUser(existingUser.id, {
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          enabled: user.isActive && !user.isDeleted,
          attributes,
        });

        // Update keycloakUserId in database if not set
        if (!user.keycloakUserId) {
          await this.db
            .update(users)
            .set({ keycloakUserId: existingUser.id })
            .where(eq(users.id, userId));
        }

        return existingUser;
      } else {
        // Create new user
        const newUser = await this.createUser({
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          enabled: user.isActive && !user.isDeleted,
          attributes,
        });

        // Save keycloakUserId to database
        await this.db
          .update(users)
          .set({ keycloakUserId: newUser.id })
          .where(eq(users.id, userId));

        return newUser;
      }
    } catch (error) {
      this.logger.error(`Failed to sync user to Keycloak: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Sync user from Keycloak to database
   */
  async syncUserFromKeycloak(keycloakId: string) {
    await this.ensureConnected();
    try {
      const kcUser = await this.getUserById(keycloakId);
      if (!kcUser) {
        throw new Error(`Keycloak user not found: ${keycloakId}`);
      }

      // Check if user exists in database
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.keycloakUserId, keycloakId))
        .limit(1);

      // Get status ID from lookups
      const statusCode = kcUser.attributes?.status?.[0] || 'active';
      const [statusLookup] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(
          and(
            eq(lookupTypes.code, 'user_status'),
            eq(lookups.code, statusCode)
          )
        )
        .limit(1);

      const userData = {
        email: kcUser.email,
        username: kcUser.username,
        firstName: kcUser.firstName || null,
        lastName: kcUser.lastName || null,
        phone: kcUser.attributes?.phone?.[0] || null,
        avatarUrl: kcUser.attributes?.avatar?.[0] || null,
        preferredLanguage: kcUser.attributes?.locale?.[0] || 'en',
        timezone: kcUser.attributes?.timezone?.[0] || 'UTC',
        isActive: kcUser.enabled !== false,
        keycloakUserId: keycloakId,
        statusId: statusLookup?.id || 1,
      };

      if (existingUser) {
        // Update existing user
        await this.db
          .update(users)
          .set(userData)
          .where(eq(users.id, existingUser.id));
        return existingUser.id;
      } else {
        // Create new user (without password)
        const [newUser] = await this.db
          .insert(users)
          .values({
            ...userData,
            roleId: 3, // Default user role
            isDeleted: false,
          })
          .returning();
        return newUser.id;
      }
    } catch (error) {
      this.logger.error(`Failed to sync user from Keycloak: ${keycloakId}`, error);
      throw error;
    }
  }

  /**
   * Get or create realm role
   * Updates the role if it exists and description has changed
   * 
   * IMPORTANT: Never creates composite roles. Permissions should never be added to roles.
   * Roles and permissions are managed separately in Keycloak.
   */
  async getOrCreateRole(roleName: string, description?: string) {
    await this.ensureConnected();
    try {
      // Try to get existing role
      try {
        const role = await this.kcAdminClient.roles.findOneByName({ name: roleName });
        if (role) {
          // Update role if description has changed
          const newDescription = description || roleName;
          if (role.description !== newDescription) {
            await this.kcAdminClient.roles.updateByName(
              { name: roleName },
              {
                name: roleName,
                description: newDescription,
                // Explicitly ensure composite is false - never add permissions to roles
                composite: false,
              }
            );
            this.logger.debug(`Updated role description in Keycloak: ${roleName}`);
          }
          return role;
        }
      } catch (error) {
        // Role doesn't exist, will create it
      }

      // Create new role - explicitly set composite: false to prevent permissions from being added
      await this.kcAdminClient.roles.create({
        name: roleName,
        description: description || roleName,
        composite: false, // Never create composite roles - permissions are separate
      });

      this.logger.log(`Created role in Keycloak: ${roleName}`);
      return await this.kcAdminClient.roles.findOneByName({ name: roleName });
    } catch (error) {
      this.logger.error(`Failed to get or create role: ${roleName}`, error);
      throw error;
    }
  }

  /**
   * Assign roles to user
   * 
   * IMPORTANT: Only assigns user roles (not permissions) to users.
   * Permissions are managed separately and should never be assigned directly to users.
   * This method filters out any permission roles (prefixed with "permission:") to prevent accidental assignment.
   */
  async assignRolesToUser(keycloakUserId: string, roleNames: string[]) {
    await this.ensureConnected();
    try {
      // Filter out permission roles - permissions should never be assigned directly to users
      const userRoles = roleNames.filter(name => !name.startsWith('permission:'));
      
      if (userRoles.length !== roleNames.length) {
        const filteredPermissions = roleNames.filter(name => name.startsWith('permission:'));
        this.logger.warn(
          `Filtered out permission roles from user assignment: ${filteredPermissions.join(', ')}. ` +
          `Permissions should never be assigned directly to users.`
        );
      }

      // Get all roles
      const roles = await Promise.all(
        userRoles.map(name => this.kcAdminClient.roles.findOneByName({ name }))
      );

      const validRoles = roles.filter(role => role !== null && role !== undefined);

      if (validRoles.length > 0) {
        await this.kcAdminClient.users.addRealmRoleMappings({
          id: keycloakUserId,
          roles: validRoles.map(role => ({ id: role.id, name: role.name })),
        });

        this.logger.log(`Assigned roles to user ${keycloakUserId}: ${userRoles.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Failed to assign roles to user: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Remove roles from user
   */
  async removeRolesFromUser(keycloakUserId: string, roleNames: string[]) {
    await this.ensureConnected();
    try {
      // Get all roles
      const roles = await Promise.all(
        roleNames.map(name => this.kcAdminClient.roles.findOneByName({ name }))
      );

      const validRoles = roles.filter(role => role !== null && role !== undefined);

      if (validRoles.length > 0) {
        await this.kcAdminClient.users.delRealmRoleMappings({
          id: keycloakUserId,
          roles: validRoles.map(role => ({ id: role.id, name: role.name })),
        });

        this.logger.log(`Removed roles from user ${keycloakUserId}: ${roleNames.join(', ')}`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove roles from user: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Get user's roles
   */
  async getUserRoles(keycloakUserId: string) {
    await this.ensureConnected();
    try {
      const roles = await this.kcAdminClient.users.listRealmRoleMappings({
        id: keycloakUserId,
      });
      return roles;
    } catch (error) {
      this.logger.error(`Failed to get user roles: ${keycloakUserId}`, error);
      throw error;
    }
  }

  /**
   * Sync all roles from database to Keycloak
   * Creates new roles and updates existing ones
   * 
   * IMPORTANT: Never creates composite roles. Permissions should never be added to roles.
   * Roles and permissions are managed separately in Keycloak.
   */
  async syncRolesToKeycloak() {
    await this.ensureConnected();
    try {
      // Get all active user roles from database
      const roles = await this.db
        .select({
          code: lookups.code,
          nameEn: lookups.nameEn,
          descriptionEn: lookups.descriptionEn,
        })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(
          and(
            eq(lookupTypes.code, 'user_role'),
            eq(lookups.isActive, true),
            eq(lookups.isDeleted, false)
          )
        );

      let rolesCreated = 0;
      let rolesUpdated = 0;
      let rolesFailed = 0;

      // Sync roles in Keycloak
      for (const role of roles) {
        try {
          const roleName = role.code;
          const description = role.descriptionEn || role.nameEn;

          // Check if role exists
          let existingRole;
          try {
            existingRole = await this.kcAdminClient.roles.findOneByName({ name: roleName });
          } catch (error) {
            // Role doesn't exist
            existingRole = null;
          }

          if (existingRole) {
            // Update existing role if description changed
            // Explicitly ensure composite is false - never add permissions to roles
            if (existingRole.description !== description) {
              await this.kcAdminClient.roles.updateByName(
                { name: roleName },
                {
                  name: roleName,
                  description: description,
                  composite: false, // Never create composite roles - permissions are separate
                }
              );
              rolesUpdated++;
              this.logger.debug(`Updated role in Keycloak: ${roleName}`);
            }
          } else {
            // Create new role - explicitly set composite: false to prevent permissions from being added
            await this.kcAdminClient.roles.create({
              name: roleName,
              description: description,
              composite: false, // Never create composite roles - permissions are separate
            });
            rolesCreated++;
            this.logger.debug(`Created role in Keycloak: ${roleName}`);
          }
        } catch (error: any) {
          rolesFailed++;
          this.logger.error(`Failed to sync role ${role.code}: ${error?.message || error}`);
        }
      }

      this.logger.log(
        `Synced roles to Keycloak: ${rolesCreated} created, ${rolesUpdated} updated, ${rolesFailed} failed`
      );
      return {
        total: roles.length,
        created: rolesCreated,
        updated: rolesUpdated,
        failed: rolesFailed,
      };
    } catch (error) {
      this.logger.error('Failed to sync roles to Keycloak', error);
      throw error;
    }
  }

  /**
   * Sync all permissions from database to Keycloak
   * Creates new permissions and updates existing ones
   * 
   * IMPORTANT: Permissions are created as separate realm roles (prefixed with "permission:").
   * Permissions are NEVER added to roles as composites. They are managed independently.
   */
  async syncPermissionsToKeycloak() {
    await this.ensureConnected();
    try {
      // Get all active permissions from database
      const permissions = await this.db
        .select({
          code: lookups.code,
          nameEn: lookups.nameEn,
          descriptionEn: lookups.descriptionEn,
        })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(
          and(
            eq(lookupTypes.code, 'permission'),
            eq(lookups.isActive, true),
            eq(lookups.isDeleted, false)
          )
        );

      let permissionsCreated = 0;
      let permissionsUpdated = 0;
      let permissionsFailed = 0;

      // Sync permissions in Keycloak (as permission:code roles)
      for (const permission of permissions) {
        try {
          const permissionRoleName = `permission:${permission.code}`;
          const description = permission.descriptionEn || permission.nameEn;

          // Check if permission role exists
          let existingPermission;
          try {
            existingPermission = await this.kcAdminClient.roles.findOneByName({ name: permissionRoleName });
          } catch (error) {
            // Permission role doesn't exist
            existingPermission = null;
          }

          if (existingPermission) {
            // Update existing permission role if description changed
            // Explicitly ensure composite is false - permissions are standalone roles
            if (existingPermission.description !== description) {
              await this.kcAdminClient.roles.updateByName(
                { name: permissionRoleName },
                {
                  name: permissionRoleName,
                  description: description,
                  composite: false, // Permissions are standalone roles, never composites
                }
              );
              permissionsUpdated++;
              this.logger.debug(`Updated permission in Keycloak: ${permissionRoleName}`);
            }
          } else {
            // Create new permission role - explicitly set composite: false
            // Permissions are standalone roles, never added to other roles
            await this.kcAdminClient.roles.create({
              name: permissionRoleName,
              description: description,
              composite: false, // Permissions are standalone roles, never composites
            });
            permissionsCreated++;
            this.logger.debug(`Created permission in Keycloak: ${permissionRoleName}`);
          }
        } catch (error: any) {
          permissionsFailed++;
          this.logger.error(`Failed to sync permission ${permission.code}: ${error?.message || error}`);
        }
      }

      this.logger.log(
        `Synced permissions to Keycloak: ${permissionsCreated} created, ${permissionsUpdated} updated, ${permissionsFailed} failed`
      );
      return {
        total: permissions.length,
        created: permissionsCreated,
        updated: permissionsUpdated,
        failed: permissionsFailed,
      };
    } catch (error) {
      this.logger.error('Failed to sync permissions to Keycloak', error);
      throw error;
    }
  }

  /**
   * Sync user roles (from user_roles table)
   */
  async syncUserRoles(userId: number) {
    await this.ensureConnected();
    try {
      // Get user from database
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || !user.keycloakUserId) {
        throw new Error(`User not found or not synced to Keycloak: ${userId}`);
      }

      // Get user's role from roleId
      const [userRole] = await this.db
        .select({ code: lookups.code })
        .from(lookups)
        .where(eq(lookups.id, user.roleId))
        .limit(1);

      if (userRole) {
        // Get current roles
        const currentRoles = await this.getUserRoles(user.keycloakUserId);
        const currentRoleNames = currentRoles.map(r => r.name);

        // Get all system roles
        const allSystemRoles = await this.db
          .select({ code: lookups.code })
          .from(lookups)
          .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
          .where(eq(lookupTypes.code, 'user_role'));

        const systemRoleNames = allSystemRoles.map(r => r.code);

        // Remove old system roles
        const rolesToRemove = currentRoleNames.filter(name => 
          systemRoleNames.includes(name) && name !== userRole.code
        );
        if (rolesToRemove.length > 0) {
          await this.removeRolesFromUser(user.keycloakUserId, rolesToRemove);
        }

        // Assign new role
        await this.assignRolesToUser(user.keycloakUserId, [userRole.code]);

        this.logger.log(`Synced roles for user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to sync user roles: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Batch sync multiple users
   */
  async syncAllUsersToKeycloak(batchSize = 50): Promise<{ success: number; failed: number }> {
    await this.ensureConnected();
    let success = 0;
    let failed = 0;

    try {
      // Get all active users from database
      const allUsers = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.isDeleted, false));

      this.logger.log(`Starting sync of ${allUsers.length} users to Keycloak`);

      // Process in batches
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (user) => {
            try {
              await this.syncUserToKeycloak(user.id);
              success++;
            } catch (error) {
              this.logger.error(`Failed to sync user ${user.id}`, error);
              failed++;
            }
          })
        );

        this.logger.log(`Synced batch ${Math.floor(i / batchSize) + 1}: ${success} success, ${failed} failed`);
      }

      this.logger.log(`Completed sync: ${success} success, ${failed} failed`);
      return { success, failed };
    } catch (error) {
      this.logger.error('Failed to sync all users to Keycloak', error);
      throw error;
    }
  }
}
