import { Controller, Post, Body, Get, UseGuards, Req, Query, Param, Put, Delete, Res, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, Setup2FADto, Verify2FADto, Disable2FADto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TwoFactorService } from './two-factor.service';
import { SessionService } from './session.service';
import { RbacService } from './rbac.service';
import { ConfigService } from '@nestjs/config';
import { isProduction, EnvConfig, getBooleanEnv } from '../../config/env';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
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
      const envConfig = this.configService.get<EnvConfig>('env');
      const cookieName = envConfig.SESSION_COOKIE_NAME || 'leap_session';
      const cookieDomain = envConfig.COOKIE_DOMAIN;
      // In development (localhost), secure must be false because we're not using HTTPS
      // In production, it should be true for HTTPS
      const cookieSecure = isProduction(envConfig) 
        ? (getBooleanEnv(envConfig.COOKIE_SECURE, true))
        : false;
      const cookieSameSite = (envConfig.COOKIE_SAME_SITE || 'lax') as 'strict' | 'lax' | 'none';
      const sessionMaxAge = loginDto.rememberMe 
        ? (parseInt(envConfig.SESSION_MAX_AGE_REMEMBER_ME || '2592000', 10)) // 30 days
        : (parseInt(envConfig.SESSION_MAX_AGE || '604800', 10)); // 7 days

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

  // ===== SESSION-BASED AUTH ENDPOINTS =====

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (revoke session and clear cookie)' })
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const envConfig = this.configService.get<EnvConfig>('env');
      const cookieName = envConfig.SESSION_COOKIE_NAME || 'leap_session';
      const sessionToken = req.cookies?.[cookieName];

      if (sessionToken) {
        // Revoke session
        await this.sessionService.revokeSession(sessionToken);
      }

      // Clear cookie
      const cookieDomain = envConfig.COOKIE_DOMAIN;
      res.clearCookie(cookieName, {
        httpOnly: true,
        secure: getBooleanEnv(envConfig.COOKIE_SECURE, true),
        sameSite: (envConfig.COOKIE_SAME_SITE || 'lax') ,
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
      const envConfig = this.configService.get<EnvConfig>('env');
      const cookieName = envConfig.SESSION_COOKIE_NAME || 'leap_session';
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
      const envConfig = this.configService.get<EnvConfig>('env');
      const cookieName = envConfig.SESSION_COOKIE_NAME || 'leap_session';
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
