import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123token456' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
