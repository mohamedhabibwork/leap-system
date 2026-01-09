import { ApiProperty } from '@nestjs/swagger';

export class Media {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  file_name: string;

  @ApiProperty()
  original_name: string;

  @ApiProperty()
  file_type: string;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  file_size: number;

  @ApiProperty()
  media_type: string;

  @ApiProperty({ required: false })
  uploadable_id?: number;

  @ApiProperty({ required: false })
  uploadable_type?: string;

  @ApiProperty()
  is_temporary: boolean;

  @ApiProperty()
  storage_provider: string;

  @ApiProperty()
  download_count: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
