import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  session_state?: string;
  scope?: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
}

@Injectable()
export class KeycloakAuthService {
  private readonly logger = new Logger(KeycloakAuthService.name);
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tokenEndpoint: string;
  private readonly userinfoEndpoint: string;
  private readonly introspectEndpoint: string;
  private readonly logoutEndpoint: string;

  constructor(private configService: ConfigService) {
    // Get configuration values - try both nested and direct paths
    this.keycloakUrl = this.configService.get<string>('keycloak.authServerUrl') || 
                       this.configService.get<string>('KEYCLOAK_SERVER_URL') ||
                       this.configService.get<string>('KEYCLOAK_URL') || '';
    this.realm = this.configService.get<string>('keycloak.realm') || 
                 this.configService.get<string>('KEYCLOAK_REALM') || '';
    this.clientId = this.configService.get<string>('keycloak.clientId') || 
                    this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('keycloak.clientSecret') || 
                       this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';
    
    // Validate required configuration
    const missingConfig: string[] = [];
    if (!this.keycloakUrl) missingConfig.push('KEYCLOAK_URL or KEYCLOAK_SERVER_URL');
    if (!this.realm) missingConfig.push('KEYCLOAK_REALM');
    if (!this.clientId) missingConfig.push('KEYCLOAK_CLIENT_ID');
    if (!this.clientSecret) missingConfig.push('KEYCLOAK_CLIENT_SECRET');
    
    if (missingConfig.length > 0) {
      this.logger.warn(`Keycloak configuration is incomplete. Missing: ${missingConfig.join(', ')}`);
      this.logger.warn('Keycloak authentication features will not work until configuration is complete.');
    }
    
    // Use well-known endpoints if available, otherwise fall back to constructed URLs
    this.tokenEndpoint = this.configService.get<string>('keycloak.tokenEndpoint') || 
                         (this.keycloakUrl && this.realm ? `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token` : '');
    this.userinfoEndpoint = this.configService.get<string>('keycloak.userinfoEndpoint') || 
                           (this.keycloakUrl && this.realm ? `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo` : '');
    this.introspectEndpoint = this.configService.get<string>('keycloak.introspectEndpoint') || 
                             (this.keycloakUrl && this.realm ? `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect` : '');
    this.logoutEndpoint = this.configService.get<string>('keycloak.logoutEndpoint') || 
                         (this.keycloakUrl && this.realm ? `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout` : '');
    
    // Validate constructed URLs
    this.validateEndpoints();
  }

  /**
   * Validate that all endpoints are valid URLs
   */
  private validateEndpoints(): void {
    const endpoints = [
      { name: 'tokenEndpoint', url: this.tokenEndpoint },
      { name: 'userinfoEndpoint', url: this.userinfoEndpoint },
      { name: 'introspectEndpoint', url: this.introspectEndpoint },
      { name: 'logoutEndpoint', url: this.logoutEndpoint },
    ];

    for (const endpoint of endpoints) {
      if (!endpoint.url) {
        this.logger.warn(`Keycloak ${endpoint.name} is not configured`);
        continue;
      }
      
      try {
        new URL(endpoint.url);
      } catch (error) {
        this.logger.error(`Invalid Keycloak ${endpoint.name}: ${endpoint.url}`);
        this.logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Authenticate user with Keycloak using Resource Owner Password Credentials flow
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', email);
      params.append('password', password);
      params.append('scope', 'openid profile email');

      const response = await axios.post<KeycloakTokenResponse>(this.tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.logger.log(`User ${email} authenticated successfully with Keycloak`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logger.warn(`Failed login attempt for ${email}`);
        throw new UnauthorizedException('Invalid email or password');
      }
      this.logger.error(`Keycloak authentication error for ${email}:`, error.response?.data || error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await axios.post<KeycloakTokenResponse>(this.tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to refresh token:', error.response?.data || error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Check if Keycloak is properly configured
   */
  isConfigured(): boolean {
    return !!(this.keycloakUrl && this.realm && this.clientId && this.clientSecret && this.userinfoEndpoint);
  }

  /**
   * Get user information from Keycloak using access token
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    if (!this.isConfigured()) {
      const missing = [];
      if (!this.keycloakUrl) missing.push('KEYCLOAK_URL');
      if (!this.realm) missing.push('KEYCLOAK_REALM');
      if (!this.clientId) missing.push('KEYCLOAK_CLIENT_ID');
      if (!this.clientSecret) missing.push('KEYCLOAK_CLIENT_SECRET');
      if (!this.userinfoEndpoint) missing.push('userinfo endpoint');
      
      this.logger.error(`Keycloak is not properly configured. Missing: ${missing.join(', ')}`);
      this.logger.error('Please set the required environment variables: KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET');
      throw new UnauthorizedException('Keycloak is not properly configured. Please contact the administrator.');
    }

    try {
      // Validate URL before making request
      try {
        new URL(this.userinfoEndpoint);
      } catch (urlError) {
        this.logger.error(`Invalid userinfo endpoint URL: ${this.userinfoEndpoint}`);
        throw new UnauthorizedException('Keycloak configuration error: Invalid userinfo endpoint');
      }

      this.logger.debug(`Fetching user info from: ${this.userinfoEndpoint}`);
      
      const response = await axios.get<KeycloakUserInfo>(this.userinfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000, // 10 second timeout
      });

      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_INVALID_URL') {
        this.logger.error(`Invalid URL for userinfo endpoint: ${this.userinfoEndpoint}`);
        this.logger.error('Please check your Keycloak configuration (KEYCLOAK_AUTH_SERVER_URL and KEYCLOAK_REALM)');
        throw new UnauthorizedException('Keycloak configuration error: Invalid URL');
      }
      
      if (error.response) {
        this.logger.error(`Failed to get user info. Status: ${error.response.status}`, error.response?.data);
      } else {
        this.logger.error('Failed to get user info:', error.message);
      }
      
      throw new UnauthorizedException('Failed to retrieve user information');
    }
  }

  /**
   * Validate access token by introspecting it with Keycloak
   */
  async introspectToken(token: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(this.introspectEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Token introspection failed:', error.response?.data || error.message);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Logout user from Keycloak
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);

      await axios.post(this.logoutEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.logger.log('User logged out from Keycloak');
    } catch (error: any) {
      this.logger.error('Logout failed:', error.response?.data || error.message);
      // Don't throw - logout should be best effort
    }
  }

  /**
   * Exchange OAuth token for Keycloak token
   */
  async exchangeToken(provider: string, token: string): Promise<KeycloakTokenResponse> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('subject_token', token);
      params.append('subject_issuer', provider);
      params.append('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');

      const response = await axios.post<KeycloakTokenResponse>(this.tokenEndpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(`Token exchange failed for provider ${provider}:`, error.response?.data || error.message);
      throw new BadRequestException('OAuth token exchange failed');
    }
  }

  /**
   * Check if Keycloak is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Use well-known endpoint to check if Keycloak is available
      // This is a standard OpenID Connect endpoint that should always be available
      const wellKnownUrl = this.userinfoEndpoint 
        ? this.userinfoEndpoint.replace('/protocol/openid-connect/userinfo', '/.well-known/openid-configuration')
        : `${this.keycloakUrl}/realms/${this.realm}/.well-known/openid-configuration`;
      
      const response = await axios.get(wellKnownUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Keycloak health check failed');
      return false;
    }
  }
}
