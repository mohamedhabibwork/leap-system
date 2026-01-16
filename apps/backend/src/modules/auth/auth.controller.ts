import { Controller, Post, Body, Get, UseGuards, Req, Query, Param, Put, Delete, Res, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, BulkSyncUsersDto, SyncRolesDto, Setup2FADto, Verify2FADto, Disable2FADto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { KeycloakOidcGuard } from './guards/keycloak-oidc.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KeycloakSyncService } from './keycloak-sync.service';
import { KeycloakAuthService, KeycloakTokenResponse } from './keycloak-auth.service';
import { TwoFactorService } from './two-factor.service';
import { SessionService } from './session.service';
import { RbacService } from './rbac.service';
import { ConfigService } from '@nestjs/config';
import { env, isProduction } from '../../config/env';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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
  @ApiOperation({ summary: 'User login with session creation' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.login(loginDto, loginDto.rememberMe);
    
    // Create session for the authenticated user
    let sessionToken: string | null = null;
    try {
      sessionToken = await this.sessionService.createSession({
        userId: result.user.id,
        tokens: {
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          expiresIn: result.expires_in,
          refreshExpiresIn: result.expires_in * 2, // Estimate refresh token expiry
        },
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection?.remoteAddress,
        },
        rememberMe: loginDto.rememberMe || false,
      });

      // Set HTTP-only session cookie
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const cookieDomain = this.configService.get<string>('keycloak.sso.cookieDomain');
      // In development (localhost), secure must be false because we're not using HTTPS
      // In production, it should be true for HTTPS
      const cookieSecure = isProduction() 
        ? (this.configService.get<boolean>('keycloak.sso.cookieSecure') ?? true)
        : false;
      const cookieSameSite = (this.configService.get<string>('keycloak.sso.cookieSameSite') || 'lax') as 'strict' | 'lax' | 'none';
      const sessionMaxAge = loginDto.rememberMe 
        ? (this.configService.get<number>('keycloak.session.maxAgeRememberMe') || 2592000) // 30 days
        : (this.configService.get<number>('keycloak.session.maxAge') || 604800); // 7 days

      res.cookie(cookieName, sessionToken, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        maxAge: sessionMaxAge * 1000, // Convert to milliseconds
        path: '/',
        ...(cookieDomain && { domain: cookieDomain }),
      });

      this.logger.log(`Session created and cookie set for user ${result.user.id}`);
    } catch (error) {
      this.logger.error(`Failed to create session during login: ${error.message}`, error.stack);
      // Continue with response even if session creation fails (backward compatibility)
    }

    // Return response with session token included
    return res.json({
      ...result,
      sessionToken,
    });
  }

  // ===== KEYCLOAK OIDC ENDPOINTS (Using Passport) =====

  @Public()
  @Get('keycloak/login')
  @UseGuards(KeycloakOidcGuard)
  @ApiOperation({ summary: 'Initiate Keycloak OIDC login flow' })
  async keycloakLogin(@Req() req: Request, @Res() res: Response) {
    this.logger.debug('keycloakLogin endpoint called', {
      hasUser: !!req.user,
      query: req.query,
      url: req.url,
    });

    // Check if user is already authenticated (has session)
    if (req.user) {
      this.logger.log('User already authenticated, redirecting to hub');
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      return res.redirect(`${frontendUrl}/hub`);
    }

    // If we reach here and Passport didn't redirect, manually redirect to Keycloak
    // This is a fallback in case Passport's automatic redirect doesn't work
    this.logger.warn('Passport did not redirect automatically, using manual redirect fallback');
    
    try {
      const issuer = this.configService.get<string>('keycloak.issuer') ||
                     this.configService.get<string>('KEYCLOAK_ISSUER');
      
      if (!issuer) {
        this.logger.error('Keycloak issuer not configured');
        const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                           this.configService.get<string>('FRONTEND_URL') || 
                           'http://localhost:3001';
        return res.redirect(`${frontendUrl}/en/login?error=keycloak_not_configured`);
      }

      const clientId = this.configService.get<string>('keycloak.clientId') ||
                       this.configService.get<string>('KEYCLOAK_CLIENT_ID') ||
                       'leap-client';
      const backendUrl = this.configService.get<string>('keycloak.urls.backend') ||
                        this.configService.get<string>('BACKEND_URL') ||
                        'http://localhost:3000';
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') ||
                         this.configService.get<string>('FRONTEND_URL') ||
                         'http://localhost:3001';

      const callbackUrl = `${backendUrl}/api/v1/auth/keycloak/callback`;
      const redirectUrl = req.query.state as string || `${frontendUrl}/hub`;
      
      // Generate a random state for CSRF protection (since we're manually redirecting)
      // Store it in the session in the format passport-openidconnect expects
      const crypto = require('crypto');
      const state = crypto.randomBytes(32).toString('hex');
      
      // Store state and redirect URL in session
      // passport-openidconnect expects state to be stored in session['passport-openidconnect'][state]
      if (req.session) {
        if (!(req.session as any)['passport-openidconnect']) {
          (req.session as any)['passport-openidconnect'] = {};
        }
        (req.session as any)['passport-openidconnect'][state] = {
          state: state,
          timestamp: Date.now(),
        };
        // @ts-ignore
        req.session.oidcRedirectUrl = redirectUrl;
        // Save session to ensure it persists
        req.session.save((err) => {
          if (err) {
            this.logger.error('Failed to save session:', err);
          } else {
            this.logger.debug('Session saved with state', { state: state.substring(0, 8) + '...' });
          }
        });
      }
      
      // Build Keycloak authorization URL
      // Ensure issuer is a full URL (not just a path)
      let authEndpoint: string;
      if (issuer.includes('/protocol/openid-connect/auth')) {
        // Already a full authorization endpoint
        authEndpoint = issuer;
      } else if (issuer.endsWith('/')) {
        // Issuer ends with /, append path
        authEndpoint = `${issuer}protocol/openid-connect/auth`;
      } else {
        // Issuer is base URL, append /protocol/openid-connect/auth
        authEndpoint = `${issuer}/protocol/openid-connect/auth`;
      }

      this.logger.debug('Building Keycloak authorization URL', {
        issuer,
        authEndpoint,
        clientId,
        callbackUrl,
        redirectUrl,
        stateGenerated: !!state,
      });

      const authUrl = new URL(authEndpoint);
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', callbackUrl);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('state', state); // Use the state we generated and stored in session

      const finalUrl = authUrl.toString();
      this.logger.log(`Manually redirecting to Keycloak: ${finalUrl}`);
      return res.redirect(finalUrl);
    } catch (error: any) {
      this.logger.error('Failed to build Keycloak authorization URL:', {
        error: error.message,
        stack: error.stack,
        issuer: this.configService.get<string>('keycloak.issuer') || this.configService.get<string>('KEYCLOAK_ISSUER'),
      });
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      // Use locale-aware login path
      return res.redirect(`${frontendUrl}/en/login?error=keycloak_config_error`);
    }
  }

  @Public()
  @Get('keycloak/callback')
  @UseGuards(KeycloakOidcGuard)
  @ApiOperation({ summary: 'Handle Keycloak OIDC callback' })
  async keycloakCallback(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: any,
  ) {
    try {
      this.logger.debug('Keycloak callback received', {
        hasUser: !!user,
        hasReqUser: !!req.user,
        query: req.query,
        url: req.url,
        code: req.query.code ? 'present' : 'missing',
        state: req.query.state,
      });

      // Check if Keycloak is configured before proceeding
      if (!this.keycloakAuthService.isConfigured()) {
        this.logger.error('Keycloak callback attempted but Keycloak is not configured');
        const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                           this.configService.get<string>('FRONTEND_URL') || 
                           'http://localhost:3001';
        return res.redirect(`${frontendUrl}/en/login?error=keycloak_not_configured`);
      }

      // If guard redirected (e.g., to Keycloak for authentication), response is already sent
      if (res.headersSent) {
        this.logger.debug('Response already sent by guard, returning early');
        return;
      }

      // User should be attached by Passport strategy via guard's handleRequest
      // The guard's handleRequest method will call the strategy's verify callback
      // which exchanges the code for tokens and creates/finds the user
      const authenticatedUser = user || req.user;
      
      if (!authenticatedUser) {
        this.logger.error('No user returned from Passport OIDC strategy', {
          hasUser: !!user,
          hasReqUser: !!req.user,
          hasCode: !!req.query.code,
          hasError: !!req.query.error,
          query: req.query,
          requestKeys: Object.keys(req),
        });
        const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/en/login?error=authentication_failed`);
      }

      this.logger.debug('User authenticated via OIDC', {
        userId: authenticatedUser.id,
        email: authenticatedUser.email,
        hasSessionToken: !!(req['sessionToken'] || authenticatedUser.sessionToken),
      });

      // Get session token from request (set by strategy in validateAndSyncUser)
      const sessionToken = req['sessionToken'] || authenticatedUser.sessionToken;

      if (!sessionToken) {
        this.logger.error('No session token created during OIDC authentication', {
          userId: authenticatedUser.id,
          email: authenticatedUser.email,
          hasReqSessionToken: !!req['sessionToken'],
          hasUserSessionToken: !!authenticatedUser.sessionToken,
        });
        const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/en/login?error=session_creation_failed`);
      }

      // Set secure HTTP-only cookie
      const cookieName = this.configService.get<string>('keycloak.sso.sessionCookieName') || 'leap_session';
      const cookieDomain = this.configService.get<string>('keycloak.sso.cookieDomain');
      // In development (localhost), secure must be false because we're not using HTTPS
      // In production, it should be true for HTTPS
      const cookieSecure = isProduction() 
        ? (this.configService.get<boolean>('keycloak.sso.cookieSecure') ?? true)
        : false;
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

      this.logger.debug('Session cookie set', {
        cookieName,
        cookieDomain: cookieDomain || 'default',
        cookieSecure,
        cookieSameSite,
        maxAge: sessionMaxAge,
        nodeEnv: env.NODE_ENV,
      });


      // Get redirect URL from session (stored before authorization request)
      // or from state parameter (fallback for compatibility)
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 
                         this.configService.get<string>('FRONTEND_URL') || 
                         'http://localhost:3001';
      
      let redirectUrl = `${frontendUrl}/api/auth/keycloak-callback`;
      let finalRedirectUrl = `${frontendUrl}/hub`; // Default redirect
      
      // Try to get redirect URL from session first (stored before OAuth flow)
      if (req.session && (req.session as any).oidcRedirectUrl) {
        finalRedirectUrl = (req.session as any).oidcRedirectUrl;
        // Clean up session
        delete (req.session as any).oidcRedirectUrl;
        req.session.save(() => {});
      } else {
        // Fallback: try to get from state parameter (for backward compatibility)
        const state = req.query.state as string;
        if (state) {
          try {
            const decodedState = decodeURIComponent(state);
            // Validate that state is a URL
            const allowedUrls = this.configService.get<string[]>('keycloak.sso.allowedRedirectUrls') || [frontendUrl];
            const isValidRedirect = allowedUrls.some(url => decodedState.startsWith(url)) || decodedState.startsWith('/');
            
            if (isValidRedirect) {
              finalRedirectUrl = decodedState.startsWith('/') ? `${frontendUrl}${decodedState}` : decodedState;
            }
          } catch (e) {
            this.logger.warn('Failed to decode state parameter', { state, error: e.message });
          }
        }
      }
      
      // Pass the final redirect URL to frontend callback
      redirectUrl += `?state=${encodeURIComponent(finalRedirectUrl)}`;

      this.logger.log(`OIDC authentication successful for user: ${authenticatedUser.email}, redirecting to frontend callback`);
      return res.redirect(redirectUrl);
    } catch (error: any) {
      this.logger.error('Keycloak callback error:', {
        message: error.message,
        stack: error.stack,
        query: req.query,
        hasUser: !!user,
        hasReqUser: !!req.user,
      });
      const frontendUrl = this.configService.get<string>('keycloak.urls.frontend') || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/en/login?error=keycloak_auth_failed`);
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
      this.logger.error('Token exchange error:', error);
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
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync single user to Keycloak (Admin only)' })
  async syncUserToKeycloak(@Param('id') userId: string) {
    return this.keycloakSyncService.manualSyncUser(parseInt(userId, 10));
  }

  @Post('admin/keycloak/sync/users/all')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually sync all users to Keycloak (Admin only)' })
  @ApiBody({ type: BulkSyncUsersDto, required: false })
  async syncAllUsersToKeycloak(@Body() bulkSyncDto?: BulkSyncUsersDto) {
    return this.keycloakSyncService.manualSyncAllUsers();
  }

  @Post('admin/keycloak/sync/roles')
  
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
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync status for user (Admin only)' })
  async getSyncStatus(@Param('userId') userId: string) {
    return this.keycloakSyncService.getUserSyncStatus(parseInt(userId, 10));
  }

  @Get('admin/keycloak/sync/config')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Keycloak sync configuration (Admin only)' })
  async getSyncConfig() {
    return this.keycloakSyncService.getSyncConfig();
  }

  @Put('admin/user/:id/role')
  
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
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize 2FA setup' })
  async setup2FA(@CurrentUser('sub') userId: number) {
    return this.twoFactorService.initiate2FASetup(userId);
  }

  @Post('2fa/verify-setup')
  
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
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate backup codes' })
  async regenerateBackupCodes(@CurrentUser('sub') userId: number) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodes(userId);
    return { backupCodes };
  }

  @Get('2fa/status')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if 2FA is enabled' })
  async get2FAStatus(@CurrentUser('sub') userId: number) {
    const enabled = await this.twoFactorService.is2FAEnabled(userId);
    return { enabled };
  }

  // ===== SESSION MANAGEMENT ENDPOINTS =====

  @Get('sessions')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  async getSessions(@CurrentUser('sub') userId: number) {
    return this.sessionService.getUserSessions(userId);
  }

  @Delete('sessions/:sessionToken')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@Param('sessionToken') sessionToken: string) {
    await this.sessionService.revokeSession(sessionToken);
    return { message: 'Session revoked successfully' };
  }

  @Delete('sessions/other')
  
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
      this.logger.error('Logout error:', error);
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
