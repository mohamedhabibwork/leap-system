import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty() @IsNumber() favoritableId: number;
  @ApiProperty() @IsString() favoritableType: string;
}
