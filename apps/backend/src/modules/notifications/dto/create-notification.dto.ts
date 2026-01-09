import { IsNumber, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 1 }) @IsNumber() userId: number;
  @ApiProperty({ example: 1 }) @IsNumber() notificationTypeId: number;
  @ApiProperty({ example: 'New course enrollment' }) @IsString() title: string;
  @ApiProperty({ example: 'You have been enrolled in TypeScript Basics' }) @IsString() message: string;
  @ApiPropertyOptional({ example: '/courses/123' }) @IsOptional() @IsString() linkUrl?: string;
}
