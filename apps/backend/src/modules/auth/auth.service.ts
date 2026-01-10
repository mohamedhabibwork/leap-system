import { Injectable, UnauthorizedException, Inject, BadRequestException, NotFoundException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { EmailService } from '../notifications/email.service';
import { RbacService } from './rbac.service';
import { KeycloakAuthService } from './keycloak-auth.service';
import { KeycloakSyncService } from './keycloak-sync.service';
import { KeycloakAdminService } from './keycloak-admin.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private keycloakAuthService: KeycloakAuthService,
    private keycloakAdminService: KeycloakAdminService,
    @Inject(forwardRef(() => RbacService)) private rbacService: RbacService,
    @Inject(forwardRef(() => KeycloakSyncService)) private keycloakSyncService: KeycloakSyncService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, rememberMe: boolean = false) {
    // Check if Keycloak is available
    const keycloakAvailable = await this.keycloakAuthService.isAvailable();

    // Try Keycloak authentication first if available
    // This will work even if user doesn't exist in DB
    if (keycloakAvailable) {
      try {
        // Authenticate directly with Keycloak using username and password
        const keycloakTokens = await this.keycloakAuthService.login(
          loginDto.email,
          loginDto.password,
          rememberMe
        );

        // Get user info from Keycloak
        const keycloakUser = await this.keycloakAuthService.getUserInfo(keycloakTokens.access_token);

        // Get or sync user from database
        let [user] = await this.db
          .select()
          .from(users)
          .where(eq(users.email, loginDto.email))
          .limit(1);

        if (!user) {
          // User doesn't exist in DB, create from Keycloak data
          [user] = await this.db
            .insert(users)
            .values({
              email: keycloakUser.email,
              username: keycloakUser.preferred_username,
              firstName: keycloakUser.given_name || '',
              lastName: keycloakUser.family_name || '',
              emailVerifiedAt: keycloakUser.email_verified ? new Date() : null,
              isActive: true,
              isDeleted: false,
              roleId: 3, // Default user role
              statusId: 1, // Active status
              preferredLanguage: 'en',
              keycloakUserId: keycloakUser.sub,
            })
            .returning();
        } else if (!user.keycloakUserId) {
          // Update existing user with Keycloak ID
          [user] = await this.db
            .update(users)
            .set({ keycloakUserId: keycloakUser.sub })
            .where(eq(users.id, user.id))
            .returning();
        }

        // Get user roles and permissions
        const roles = await this.rbacService.getUserRoles(user.id);
        const permissions = await this.rbacService.getUserPermissions(user.id);

        return {
          access_token: keycloakTokens.access_token,
          refresh_token: keycloakTokens.refresh_token,
          expires_in: keycloakTokens.expires_in,
          token_type: 'Bearer',
          user: {
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            roles,
            permissions,
          },
        };
      } catch (error) {
        // If Keycloak auth fails, fall through to DB authentication
        // This handles cases where user exists in DB but not in Keycloak
      }
    }

    // Fallback flow: DB-based authentication
    // Check if user exists in DB first
    const [dbUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, loginDto.email))
      .limit(1);

    if (!dbUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Get user roles and permissions for JWT payload
    const roles = await this.rbacService.getUserRoles(user.id);
    const permissions = await this.rbacService.getUserPermissions(user.id);

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      roles,
      permissions,
    };

    const expiresIn = rememberMe 
      ? this.configService.get('jwt.refreshExpiresIn') || '30d'
      : this.configService.get('jwt.expiresIn') || '7d';

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : this.configService.get('jwt.refreshExpiresIn'),
    });

    // Try to sync to Keycloak in background (non-blocking)
    this.keycloakSyncService.syncUserToKeycloakOnUpdate(user.id).catch(() => {
      // Ignore sync errors
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: rememberMe ? 2592000 : 604800, // 30 days or 7 days in seconds
      token_type: 'Bearer',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roles,
        permissions,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists in database
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, registerDto.email))
      .limit(1);

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Check if user exists in Keycloak (if available)
    const keycloakAvailable = await this.keycloakAuthService.isAvailable();
    if (keycloakAvailable) {
      const keycloakUserExists = await this.keycloakAdminService.getUserByEmail(registerDto.email);
      if (keycloakUserExists) {
        throw new UnauthorizedException('User already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user in database (Note: roleId and statusId should come from lookups)
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: registerDto.email,
        username: registerDto.username || registerDto.email.split('@')[0],
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: registerDto.roleId || 3, // Default: User role (should be from lookups)
        statusId: 1, // Default: Active status (should be from lookups)
        preferredLanguage: 'en',
        isActive: true,
        isDeleted: false,
        emailVerificationToken,
      })
      .returning();

    // Create user in Keycloak with password (if available)
    // If this fails, rollback by deleting the user from database
    if (keycloakAvailable) {
      try {
        const keycloakUser = await this.keycloakAdminService.createUserWithPassword({
          email: registerDto.email,
          username: registerDto.username || registerDto.email.split('@')[0],
          password: registerDto.password,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          enabled: true,
          emailVerified: false,
        });

        // Update database with Keycloak user ID
        if (keycloakUser && keycloakUser.id) {
          await this.db
            .update(users)
            .set({ keycloakUserId: keycloakUser.id })
            .where(eq(users.id, newUser.id));
        }
      } catch (error: any) {
        // Rollback: Delete user from database if Keycloak creation fails
        await this.db
          .delete(users)
          .where(eq(users.id, newUser.id));
        
        throw new UnauthorizedException(
          `Failed to create user in Keycloak: ${error?.message || 'Unknown error'}`
        );
      }
    }

    // Send verification email (only if everything succeeded)
    await this.emailService.sendVerificationEmail(
      newUser.email,
      emailVerificationToken,
      newUser.firstName || undefined,
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return this.login({ email: registerDto.email, password: registerDto.password });
  }

  async refreshToken(refreshToken: string) {
    // Try Keycloak token refresh first
    const keycloakAvailable = await this.keycloakAuthService.isAvailable();
    
    if (keycloakAvailable) {
      try {
        const keycloakTokens = await this.keycloakAuthService.refreshToken(refreshToken);
        
        // Get user info to update our response
        const keycloakUser = await this.keycloakAuthService.getUserInfo(keycloakTokens.access_token);
        
        // Get user from DB
        const [user] = await this.db
          .select()
          .from(users)
          .where(eq(users.email, keycloakUser.email))
          .limit(1);

        if (user) {
          const roles = await this.rbacService.getUserRoles(user.id);
          const permissions = await this.rbacService.getUserPermissions(user.id);

          return {
            access_token: keycloakTokens.access_token,
            refresh_token: keycloakTokens.refresh_token,
            expires_in: keycloakTokens.expires_in,
            user: {
              id: user.id,
              roles,
              permissions,
            },
          };
        }
      } catch (error) {
        // Fall through to JWT refresh
        console.warn('Keycloak token refresh failed, trying JWT:', error.message);
      }
    }

    // Fallback: JWT token refresh
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Refresh roles and permissions
      const roles = await this.rbacService.getUserRoles(payload.sub);
      const permissions = await this.rbacService.getUserPermissions(payload.sub);

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        roleId: payload.roleId,
        roles,
        permissions,
      });

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, forgotPasswordDto.email))
      .limit(1);

    // Don't reveal if user exists or not for security
    if (!user) {
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await this.db
      .update(users)
      .set({
        passwordResetToken,
        passwordResetExpiry,
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      passwordResetToken,
      user.firstName || undefined,
    );

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async verifyResetToken(token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
        )
      )
      .limit(1);

    if (!user || !user.passwordResetExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > new Date(user.passwordResetExpiry)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return { valid: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, resetPasswordDto.token))
      .limit(1);

    if (!user || !user.passwordResetExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > new Date(user.passwordResetExpiry)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Update user password and clear reset token
    await this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Password reset successfully' };
  }

  async sendVerificationEmail(userId: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new verification token if doesn't exist
    let verificationToken = user.emailVerificationToken;
    if (!verificationToken) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      await this.db
        .update(users)
        .set({ emailVerificationToken: verificationToken })
        .where(eq(users.id, user.id));
    }

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName || undefined,
    );

    return { message: 'Verification email sent' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, verifyEmailDto.token))
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    // Update user to mark email as verified
    await this.db
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      })
      .where(eq(users.id, user.id));

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || undefined,
    );

    return { message: 'Email verified successfully' };
  }

  async updateUser(userId: number, updateData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string;
    preferredLanguage: string;
    timezone: string;
    roleId: number;
    statusId: number;
    isActive: boolean;
  }>) {
    // Update user in database
    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Sync to Keycloak
    await this.keycloakSyncService.syncUserToKeycloakOnUpdate(userId);

    // If role changed, sync roles
    if (updateData.roleId) {
      await this.keycloakSyncService.syncUserRolesToKeycloak(userId);
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async assignRole(userId: number, roleId: number) {
    // Update user role in database
    await this.db
      .update(users)
      .set({ roleId })
      .where(eq(users.id, userId));

    // Sync roles to Keycloak
    await this.keycloakSyncService.syncUserRolesToKeycloak(userId);

    return { message: 'Role assigned successfully' };
  }

  async findOrCreateKeycloakUser(keycloakUser: any) {
    // Try to find user by Keycloak user ID or email
    let [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, keycloakUser.email))
      .limit(1);

    if (!user) {
      // Create new user from Keycloak data
      [user] = await this.db
        .insert(users)
        .values({
          email: keycloakUser.email,
          username: keycloakUser.preferred_username || keycloakUser.email.split('@')[0],
          firstName: keycloakUser.given_name || '',
          lastName: keycloakUser.family_name || '',
          keycloakUserId: keycloakUser.sub,
          emailVerifiedAt: keycloakUser.email_verified ? new Date() : null,
          isActive: true,
          isDeleted: false,
          roleId: 3, // Default user role
          statusId: 1, // Active status
          preferredLanguage: 'en',
        })
        .returning();
    } else if (!user.keycloakUserId) {
      // Update existing user with Keycloak ID
      [user] = await this.db
        .update(users)
        .set({
          keycloakUserId: keycloakUser.sub,
          emailVerifiedAt: keycloakUser.email_verified ? new Date() : user.emailVerifiedAt,
        })
        .where(eq(users.id, user.id))
        .returning();
    }

    return user;
  }

  async generateToken(user: any) {
    // Get user roles and permissions for JWT payload
    const roles = await this.rbacService.getUserRoles(user.id);
    const permissions = await this.rbacService.getUserPermissions(user.id);

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      roles,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 604800, // 7 days in seconds
      token_type: 'Bearer',
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        roles,
        permissions,
      },
    };
  }
}
