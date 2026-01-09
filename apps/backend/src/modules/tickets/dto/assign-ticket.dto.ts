import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTicketDto {
  @ApiProperty({ description: 'User ID to assign ticket to' })
  @IsNotEmpty()
  @IsInt()
  assignToId: number;
}
