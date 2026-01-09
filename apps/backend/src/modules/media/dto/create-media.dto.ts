import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  uploadedBy: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  providerId: number;

  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  fileType: string;

  @ApiProperty({ example: 'uploads/documents/document.pdf' })
  @IsString()
  filePath: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  mediableId?: number;

  @ApiPropertyOptional({ example: 'Course' })
  @IsOptional()
  @IsString()
  mediableType?: string;

  @ApiPropertyOptional({ example: 'Document description' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;
}
