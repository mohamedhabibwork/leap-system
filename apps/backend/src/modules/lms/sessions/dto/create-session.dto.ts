import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsDateString, IsUrl, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Lesson ID this session belongs to' })
  @IsInt()
  lessonId: number;

  @ApiProperty({ description: 'Session title in English' })
  @IsString()
  @MaxLength(255)
  titleEn: string;

  @ApiProperty({ description: 'Session title in Arabic', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleAr?: string;

  @ApiProperty({ description: 'Session type ID (live, recorded, hybrid)' })
  @IsInt()
  sessionTypeId: number;

  @ApiProperty({ description: 'Session start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Session end time' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Timezone', required: false, default: 'UTC' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiProperty({ description: 'Meeting URL (Zoom, Google Meet, etc.)', required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  meetingUrl?: string;

  @ApiProperty({ description: 'Meeting password', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  meetingPassword?: string;

  @ApiProperty({ description: 'Maximum number of attendees', required: false })
  @IsOptional()
  @IsInt()
  maxAttendees?: number;

  @ApiProperty({ description: 'Session description in English', required: false })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ description: 'Session description in Arabic', required: false })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({ description: 'Session status ID', required: false })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
