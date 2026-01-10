import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Disable2FADto {
  @ApiProperty({ example: 'P@ssword123', description: 'User password for verification' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
