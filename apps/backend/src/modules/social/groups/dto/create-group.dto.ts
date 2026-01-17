import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Group description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ 
    enum: ['public', 'private', 'secret'],
    description: 'Privacy setting for the group'
  })
  @IsEnum(['public', 'private', 'secret'])
  privacy: 'public' | 'private' | 'secret';

  @ApiPropertyOptional({ description: 'User ID who created the group' })
  @IsOptional()
  @IsNumber()
  createdBy?: number;
}
