import { IsNotEmpty, IsString, IsOptional, IsInt, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ description: 'Page name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Page slug' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Page description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'SEO metadata' })
  @IsOptional()
  @IsObject()
  seo?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
