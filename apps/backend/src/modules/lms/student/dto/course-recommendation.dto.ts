import { ApiProperty } from '@nestjs/swagger';

export class CourseRecommendationDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty({ required: false })
  thumbnailUrl?: string;

  @ApiProperty()
  instructorName: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  enrollmentCount: number;

  @ApiProperty()
  reason: 'similar_category' | 'popular' | 'trending' | 'instructor';

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false })
  categoryName?: string;
}
