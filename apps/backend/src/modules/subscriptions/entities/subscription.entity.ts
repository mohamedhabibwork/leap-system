import { ApiProperty } from '@nestjs/swagger';

export class Subscription {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  plan_id: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  auto_renew: boolean;

  @ApiProperty({ required: false })
  cancelled_at?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
