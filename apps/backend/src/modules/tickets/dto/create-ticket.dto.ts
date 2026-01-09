import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty() @IsString() subject: string;
  @ApiProperty() @IsString() message: string;
  @ApiProperty({ enum: ['general', 'technical', 'billing', 'other'] }) @IsEnum(['general', 'technical', 'billing', 'other']) category: string;
  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'] }) @IsEnum(['low', 'medium', 'high', 'urgent']) priority: string;
}
