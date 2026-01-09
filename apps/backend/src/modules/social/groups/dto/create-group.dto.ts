import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ enum: ['public', 'private', 'secret'] }) @IsEnum(['public', 'private', 'secret']) privacy: string;
}
