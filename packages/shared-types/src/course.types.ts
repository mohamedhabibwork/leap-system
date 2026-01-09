// Course-related types

export interface Course {
  id: number;
  uuid: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  instructorId: number;
  categoryId: number;
  statusId: number;
  price?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  durationHours?: number;
  isFeatured: boolean;
  viewCount: number;
  favoriteCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateCourseDto {
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  instructorId: number;
  categoryId: number;
  price?: number;
  thumbnailUrl?: string;
}
