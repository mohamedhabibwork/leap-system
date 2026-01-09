import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional() @IsOptional() @IsNumber() statusId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priorityId?: number;
  @ApiPropertyOptional() @IsOptional() closedAt?: Date;
}
