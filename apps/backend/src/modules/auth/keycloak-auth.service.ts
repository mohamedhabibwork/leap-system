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
    this.keycloakUrl = this.configService.get<string>('keycloak.authServerUrl');
    this.realm = this.configService.get<string>('keycloak.realm');
    this.clientId = this.configService.get<string>('keycloak.clientId');
    this.clientSecret = this.configService.get<string>('keycloak.clientSecret');
    
    // Use well-known endpoints if available, otherwise fall back to constructed URLs
    this.tokenEndpoint = this.configService.get<string>('keycloak.tokenEndpoint') || 
                         `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    this.userinfoEndpoint = this.configService.get<string>('keycloak.userinfoEndpoint') || 
                           `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
    this.introspectEndpoint = this.configService.get<string>('keycloak.introspectEndpoint') || 
                             `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
    this.logoutEndpoint = this.configService.get<string>('keycloak.logoutEndpoint') || 
                         `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
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
   * Get user information from Keycloak using access token
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const response = await axios.get<KeycloakUserInfo>(this.userinfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get user info:', error.response?.data || error.message);
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
      const healthUrl = `${this.keycloakUrl}/health`;
      const response = await axios.get(healthUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Keycloak health check failed');
      return false;
    }
  }
}
