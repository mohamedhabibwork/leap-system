import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ enum: ['public', 'private', 'secret'] }) @IsEnum(['public', 'private', 'secret']) privacy: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() createdBy?: number;
}
