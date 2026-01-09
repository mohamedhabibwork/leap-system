import { Injectable, Inject, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { users } from '@leap-lms/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class TwoFactorService {
  private readonly issuer: string;
  private readonly window: number;

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
  ) {
    this.issuer = this.configService.get<string>('TOTP_ISSUER') || 'LEAP PM';
    this.window = parseInt(this.configService.get<string>('TOTP_WINDOW') || '1', 10);
  }

  /**
   * Initialize 2FA setup for a user
   * Returns the secret and QR code data URL
   */
  async initiate2FASetup(userId: number): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    // Get user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorSecret) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${this.issuer} (${user.email})`,
      issuer: this.issuer,
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store temporary secret (will be confirmed after verification)
    await this.db
      .update(users)
      .set({
        twoFactorTempSecret: secret.base32,
        twoFactorBackupCodes: JSON.stringify(backupCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))),
      })
      .where(eq(users.id, userId));

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify and enable 2FA for a user
   */
  async verify2FASetup(userId: number, code: string): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorTempSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token: code,
      window: this.window,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Move temp secret to permanent and enable 2FA
    await this.db
      .update(users)
      .set({
        twoFactorSecret: user.twoFactorTempSecret,
        twoFactorEnabled: true,
        twoFactorTempSecret: null,
      })
      .where(eq(users.id, userId));

    return true;
  }

  /**
   * Verify 2FA code for login
   */
  async verify2FACode(userId: number, code: string, isBackupCode: boolean = false): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    if (isBackupCode) {
      // Verify backup code
      return this.verifyBackupCode(userId, code);
    }

    // Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: this.window,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return true;
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorBackupCodes) {
      throw new UnauthorizedException('Invalid backup code');
    }

    const backupCodes = JSON.parse(user.twoFactorBackupCodes);
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const codeIndex = backupCodes.indexOf(hashedCode);
    if (codeIndex === -1) {
      throw new UnauthorizedException('Invalid backup code');
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await this.db
      .update(users)
      .set({
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      })
      .where(eq(users.id, userId));

    return true;
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: number): Promise<boolean> {
    await this.db
      .update(users)
      .set({
        twoFactorSecret: null,
        twoFactorEnabled: false,
        twoFactorBackupCodes: null,
        twoFactorTempSecret: null,
      })
      .where(eq(users.id, userId));

    return true;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: number): Promise<string[]> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const backupCodes = this.generateBackupCodes();

    await this.db
      .update(users)
      .set({
        twoFactorBackupCodes: JSON.stringify(backupCodes.map(code => crypto.createHash('sha256').update(code).digest('hex'))),
      })
      .where(eq(users.id, userId));

    return backupCodes;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: number): Promise<boolean> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user?.twoFactorEnabled || false;
  }
}
