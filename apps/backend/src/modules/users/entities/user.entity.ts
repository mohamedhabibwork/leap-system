import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  language: string;

  @ApiProperty({ required: false })
  timezone?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isOnline: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({ required: false })
  last_seen_at?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Exclude password from response
  // password field is not exposed
}
