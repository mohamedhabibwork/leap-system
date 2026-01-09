import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty() @IsNumber() shareable_id: number;
  @ApiProperty() @IsString() shareable_type: string;
  @ApiProperty({ enum: ['internal', 'facebook', 'twitter', 'linkedin', 'email', 'link'] }) @IsEnum(['internal', 'facebook', 'twitter', 'linkedin', 'email', 'link']) share_type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() share_url?: string;
}
