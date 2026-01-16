import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ReviewReportDto {
  @ApiProperty({ description: 'Action to take', enum: ReportAction })
  @IsNotEmpty()
  action: ReportAction;

  @ApiPropertyOptional({ description: 'Admin note' })
  @IsOptional()
  @IsString()
  note?: string;
}
