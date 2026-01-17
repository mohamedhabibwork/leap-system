import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum EventRegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

export class UpdateEventRegistrationDto {
  @ApiPropertyOptional({ enum: EventRegistrationStatus })
  @IsOptional()
  @IsEnum(EventRegistrationStatus)
  status?: EventRegistrationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  attended?: boolean;
}
