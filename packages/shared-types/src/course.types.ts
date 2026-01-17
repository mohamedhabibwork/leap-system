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

// Lesson types
export interface LessonProgress {
  isCompleted: boolean;
  timeSpentMinutes: number;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
}

export interface Lesson {
  id: number;
  uuid: string;
  sectionId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  contentEn?: string;
  contentAr?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  durationMinutes?: number;
  displayOrder: number;
  isPreview: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  canAccess?: boolean;
  accessReason?: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
  progress?: LessonProgress;
}

export interface LessonAccessCheck {
  lessonId: number;
  canAccess: boolean;
  reason: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
  enrollment?: {
    id: number;
    enrollmentType: string;
    expiresAt?: Date;
    daysRemaining?: number;
    isExpired: boolean;
  };
}

export interface EnrollmentWithType {
  id: number;
  courseId: number;
  userId: number;
  enrollmentType: {
    id: number;
    name: string;
  };
  expiresAt?: Date;
  daysRemaining?: number;
  isExpired: boolean;
  enrolledAt: Date;
  progressPercentage: number;
}
