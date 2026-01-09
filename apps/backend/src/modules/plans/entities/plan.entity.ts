import { ApiProperty } from '@nestjs/swagger';

export class Plan {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  billing_cycle: string;

  @ApiProperty({ required: false })
  trial_days?: number;

  @ApiProperty({ required: false })
  max_courses?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  is_featured: boolean;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
