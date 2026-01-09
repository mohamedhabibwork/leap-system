import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Disable2FADto {
  @ApiProperty({ example: 'password123', description: 'User password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
