import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsOptional, IsBoolean } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({ example: '123456', description: 'TOTP code from authenticator app' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: false, required: false, description: 'Use backup code instead of TOTP' })
  @IsOptional()
  @IsBoolean()
  isBackupCode?: boolean;
}
