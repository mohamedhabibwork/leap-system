import { Controller, Post, Body, Get, UseGuards, Req, Query, Param, Put, Delete, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, BulkSyncUsersDto, SyncRolesDto, Setup2FADto, Verify2FADto, Disable2FADto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KeycloakSyncService } from './keycloak-sync.service';
import { KeycloakAuthService, KeycloakTokenResponse } from './keycloak-auth.service';
import { TwoFactorService } from './two-factor.service';
import { SessionService } from './session.service';
import { RbacService } from './rbac.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloakSyncService: KeycloakSyncService,
    private readonly keycloakAuthService: KeycloakAuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly sessionService: SessionService,
    private readonly rbacService: RbacService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, loginDto.rememberMe);
  }

  // ===== KEYCLOAK OIDC ENDPOINTS =====

  @Public()
  @Get('keycloak/login')
  @ApiOperation({ summary: 'Initiate Keycloak OIDC login flow' })
  async keycloakLogin(@Res() res: Response, @Query('redirect_uri') redirectUri?: string) {
    const authorizationEndpoint = this.configService.get<string>('keycloak.authorizationEndpoint');
    const clientId = this.configService.get<string>('keycloak.clientId');
    const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                       this.configService.get<string>('FRONTEND_URL') || 
                       'http://localhost:3001';
    const backendUrl = this.configService.get<string>('keycloak.urls.backend') || 
                      process.env.BACKEND_URL || 
                      'http://localhost:3000';
    
    const callbackUrl = `${backendUrl}/api/v1/auth/keycloak/callback`;
    const finalRedirectUri = redirectUri || `${frontendUrl}/hub`;

    // Use well-known authorization endpoint if available, otherwise construct it
    const authUrl = authorizationEndpoint || 
                   `${this.configService.get<string>('keycloak.authServerUrl')}/realms/${this.configService.get<string>('keycloak.realm')}/protocol/openid-connect/auth`;
    
    const fullAuthUrl = `${authUrl}?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `state=${encodeURIComponent(finalRedirectUri)}`;

    return res.redirect(fullAuthUrl);
  }

  @Public()
  @Get('keycloak/callback')
  @ApiOperation({ summary: 'Handle Keycloak OIDC callback' })
  async keycloakCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      if (!code) {
        throw new Error('Authorization code not provided');
      }

      const tokenEndpoint = this.configService.get<string>('keycloak.tokenEndpoint');
      const clientId = this.configService.get<string>('keycloak.clientId');
      const clientSecret = this.configService.get<string>('keycloak.clientSecret');
      const backendUrl = this.configService.get<string>('keycloak.urls.backend');
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend');
      const callbackUrl = `${backendUrl}/api/v1/auth/keycloak/callback`;

      // Use well-known token endpoint if available, otherwise construct it
      const tokenUrl = tokenEndpoint || 
                      `${this.configService.get<string>('keycloak.authServerUrl')}/realms/${this.configService.get<string>('keycloak.realm')}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('code', code);
      params.append('redirect_uri', callbackUrl);

      const { data: tokens } = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(
          tokenUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );

      if (!tokens) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      // Get user info from Keycloak
      const keycloakUser = await this.keycloakAuthService.getUserInfo(tokens.access_token);

      // Find or create user in database (sync from Keycloak)
      let user = await this.authService.findOrCreateKeycloakUser(keycloakUser);

      // Sync user data from Keycloak (Keycloak is source of truth)
      user = await this.keycloakSyncService.syncUserFromKeycloak(keycloakUser, keycloakUser.sub);

      // Sync roles
      await this.keycloakSyncService.syncUserRolesToKeycloak(user.id);

      // Create session with tokens
      const sessionToken = await this.sessionService.createSession({
        userId: user.id,
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          refreshExpiresIn: tokens.refresh_expires_in,
          keycloakSessionId: tokens.session_state,
        },
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          deviceInfo: (SessionService as any).parseUserAgent(req.headers['user-agent'] || ''),
        },
        rememberMe: false, // Could be passed via state parameter if needed
      });

      // Set secure HTTP-only cookie
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const cookieDomain = this.configService.get<string>('keycloak.sso.cookieDomain');
      const cookieSecure = this.configService.get<boolean>('keycloak.sso.cookieSecure');
      const cookieSameSite = this.configService.get<string>('keycloak.sso.cookieSameSite') || 'lax';
      const sessionMaxAge = this.configService.get<number>('keycloak.session.maxAge') || 604800;

      res.cookie(cookieName, sessionToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite as any,
        domain: cookieDomain,
        maxAge: sessionMaxAge * 1000, // Convert to milliseconds
        path: '/',
      });

      // Validate redirect URL for security
      const allowedUrls = this.configService.get<string[]>('keycloak.sso.allowedRedirectUrls') || [frontendUrl];
      let redirectUrl = state || `${frontendUrl}/hub`;

      // Ensure redirect URL is allowed
      const isAllowed = allowedUrls.some(allowed => redirectUrl.startsWith(allowed));
      if (!isAllowed) {
        redirectUrl = `${frontendUrl}/hub`;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Keycloak callback error:', error);
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=keycloak_auth_failed`);
    }
  }

  @Public()
  @Post('keycloak/token')
  @ApiOperation({ summary: 'Exchange Keycloak tokens for app tokens' })
  async exchangeKeycloakToken(@Body() body: { accessToken: string }) {
    try {
      // Get user info from Keycloak
      const userInfo = await this.keycloakAuthService.getUserInfo(body.accessToken);

      // Find or create user in our database
      const user = await this.authService.findOrCreateKeycloakUser(userInfo);

      // Generate our own JWT token
      return this.authService.generateToken(user);
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.authService.getCurrentUser(userId);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('verify-reset-token')
  @ApiOperation({ summary: 'Verify password reset token validity' })
  async verifyResetToken(@Query('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email verification' })
  async sendVerification(@CurrentUser('sub') userId: number) {
    return this.authService.sendVerificationEmail(userId);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  // ===== ADMIN KEYCLOAK SYNC ENDPOINTS =====

  @Post('admin/keycloak/sync/user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync single user to Keycloak (Admin only)' })
  async syncUserToKeycloak(@Param('id') userId: string) {
    return this.keycloakSyncService.manualSyncUser(parseInt(userId, 10));
  }

  @Post('admin/keycloak/sync/users/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync all users to Keycloak (Admin only)' })
  @ApiBody({ type: BulkSyncUsersDto, required: false })
  async syncAllUsersToKeycloak(@Body() bulkSyncDto?: BulkSyncUsersDto) {
    return this.keycloakSyncService.manualSyncAllUsers();
  }

  @Post('admin/keycloak/sync/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync roles and permissions to Keycloak (Admin only)' })
  @ApiBody({ type: SyncRolesDto, required: false })
  async syncRolesToKeycloak(@Body() syncRolesDto?: SyncRolesDto) {
    const syncRoles = syncRolesDto?.syncRoles !== false;
    const syncPermissions = syncRolesDto?.syncPermissions !== false;

    const results = {
      roles: null,
      permissions: null,
    };

    if (syncRoles) {
      results.roles = await this.keycloakSyncService.syncRolesToKeycloak();
    }

    if (syncPermissions) {
      results.permissions = await this.keycloakSyncService.syncPermissionsToKeycloak();
    }

    return results;
  }

  @Get('admin/keycloak/sync/status/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync status for user (Admin only)' })
  async getSyncStatus(@Param('userId') userId: string) {
    return this.keycloakSyncService.getUserSyncStatus(parseInt(userId, 10));
  }

  @Get('admin/keycloak/sync/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync configuration (Admin only)' })
  async getSyncConfig() {
    return this.keycloakSyncService.getSyncConfig();
  }

  @Put('admin/user/:id/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  async assignRole(
    @Param('id') userId: string,
    @Body() body: { roleId: number },
  ) {
    return this.authService.assignRole(parseInt(userId, 10), body.roleId);
  }

  // ===== 2FA ENDPOINTS =====

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize 2FA setup' })
  async setup2FA(@CurrentUser('sub') userId: number) {
    return this.twoFactorService.initiate2FASetup(userId);
  }

  @Post('2fa/verify-setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable 2FA' })
  @ApiBody({ type: Setup2FADto })
  async verify2FASetup(
    @CurrentUser('sub') userId: number,
    @Body() setup2FADto: Setup2FADto,
  ) {
    await this.twoFactorService.verify2FASetup(userId, setup2FADto.code);
    return { message: '2FA enabled successfully' };
  }

  @Public()
  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  @ApiBody({ type: Verify2FADto })
  async verify2FA(@Body() verify2FADto: Verify2FADto, @Body('userId') userId: number) {
    const isValid = await this.twoFactorService.verify2FACode(
      userId,
      verify2FADto.code,
      verify2FADto.isBackupCode,
    );
    return { valid: isValid };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBody({ type: Disable2FADto })
  async disable2FA(
    @CurrentUser('sub') userId: number,
    @Body() disable2FADto: Disable2FADto,
  ) {
    // Verify password before disabling 2FA
    await this.authService.validateUser(
      (await this.authService.getCurrentUser(userId)).email,
      disable2FADto.password,
    );
    await this.twoFactorService.disable2FA(userId);
    return { message: '2FA disabled successfully' };
  }

  @Post('2fa/backup-codes/regenerate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate backup codes' })
  async regenerateBackupCodes(@CurrentUser('sub') userId: number) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodes(userId);
    return { backupCodes };
  }

  @Get('2fa/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if 2FA is enabled' })
  async get2FAStatus(@CurrentUser('sub') userId: number) {
    const enabled = await this.twoFactorService.is2FAEnabled(userId);
    return { enabled };
  }

  // ===== SESSION MANAGEMENT ENDPOINTS =====

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  async getSessions(@CurrentUser('sub') userId: number) {
    return this.sessionService.getUserSessions(userId);
  }

  @Delete('sessions/:sessionToken')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@Param('sessionToken') sessionToken: string) {
    await this.sessionService.revokeSession(sessionToken);
    return { message: 'Session revoked successfully' };
  }

  @Delete('sessions/other')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all other sessions' })
  async revokeOtherSessions(
    @CurrentUser('sub') userId: number,
    @Body('currentSessionToken') currentSessionToken: string,
  ) {
    const count = await this.sessionService.revokeOtherSessions(userId, currentSessionToken);
    return { message: `${count} session(s) revoked successfully` };
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (logout from all devices)' })
  async revokeAllSessions(@CurrentUser('sub') userId: number) {
    const count = await this.sessionService.revokeAllSessions(userId);
    return { message: `${count} session(s) revoked successfully` };
  }

  // ===== SESSION-BASED AUTH ENDPOINTS (KEYCLOAK OIDC) =====

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (revoke session and clear cookie)' })
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const sessionToken = req.cookies?.[cookieName];

      if (sessionToken) {
        // Revoke session (this also logs out from Keycloak)
        await this.sessionService.revokeSession(sessionToken);
      }

      // Clear cookie
      const cookieDomain = this.configService.get<string>('keycloak.sso.cookieDomain');
      res.clearCookie(cookieName, {
        httpOnly: true,
        secure: this.configService.get<boolean>('keycloak.sso.cookieSecure'),
        sameSite: this.configService.get<string>('keycloak.sso.cookieSameSite') as any,
        domain: cookieDomain,
        path: '/',
      });

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  }

  @Public()
  @Get('session/validate')
  @ApiOperation({ summary: 'Validate current session' })
  async validateSession(@Req() req: any) {
    try {
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const sessionToken = req.cookies?.[cookieName];

      if (!sessionToken) {
        return { valid: false, message: 'No session token' };
      }

      const sessionData = await this.sessionService.getSession(sessionToken);

      if (!sessionData || !sessionData.user) {
        return { valid: false, message: 'Invalid session' };
      }

      // Get user roles and permissions
      const roles = await this.rbacService.getUserRoles(sessionData.user.id);
      const permissions = await this.rbacService.getUserPermissions(sessionData.user.id);

      return {
        valid: true,
        user: {
          id: sessionData.user.id,
          uuid: sessionData.user.uuid,
          email: sessionData.user.email,
          username: sessionData.user.username,
          firstName: sessionData.user.firstName,
          lastName: sessionData.user.lastName,
          roleId: sessionData.user.roleId,
          roles,
          permissions,
          avatarUrl: sessionData.user.avatarUrl,
        },
        session: {
          expiresAt: sessionData.sessions.expiresAt,
          lastActivityAt: sessionData.sessions.lastActivityAt,
          createdAt: sessionData.sessions.createdAt,
        },
      };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  @Public()
  @Post('session/refresh')
  @ApiOperation({ summary: 'Refresh session tokens' })
  async refreshSessionTokens(@Req() req: any) {
    try {
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const sessionToken = req.cookies?.[cookieName];

      if (!sessionToken) {
        throw new Error('No session token');
      }

      await this.sessionService.refreshSession(sessionToken);

      return { message: 'Session refreshed successfully' };
    } catch (error) {
      throw new Error(`Failed to refresh session: ${error.message}`);
    }
  }
}
